import { Router } from "express";
import { db } from "../db.js";
import { validateBody, text, EMAIL, REFERENCE_ID } from "../middleware/validate.js";
import { customerView, issueAccessLink, leadForToken } from "../bookingAccess.js";
import { notifyBookingLink, notifyCustomerResponse } from "../notify.js";

// Customer side of the booking journey: view a request, accept or decline its
// quote, ask for a fresh link. Every call carries the private link's secret in
// the body; nothing here is reachable with a reference number alone.
const router = Router();
const notFound = (res) => res.status(404).json({ message: "This link isn't valid or has expired. Ask for a new one below, or contact us." });

router.post("/view", validateBody({ token: text(64, "Link") }), (req, res) => {
  res.set("Cache-Control", "no-store");
  const lead = leadForToken(req.body.token);
  if (!lead) return notFound(res);
  res.json({ booking: customerView(lead) });
});

router.post(
  "/respond",
  validateBody({
    token: text(64, "Link"),
    quoteId: { type: "numeric", label: "Quote" },
    decision: { type: "string", max: 10, enum: ["accept", "decline"], label: "Decision" },
    reason: text(500, "Reason"),
  }),
  (req, res) => {
    res.set("Cache-Control", "no-store");
    const lead = leadForToken(req.body.token);
    if (!lead) return notFound(res);
    const { decision } = req.body;
    if (!decision) return res.status(400).json({ message: "Choose accept or decline." });
    const view = customerView(lead);
    // Only the quote on screen, and only while it's open — a quote revised by
    // the team since the page loaded must be read before it can be accepted.
    if (!view.quote || Number(req.body.quoteId) !== view.quote.id) {
      return res.status(409).json({ message: "The quote has changed since you opened this page. Please review the latest quote.", booking: view });
    }
    if (!view.quote.canRespond) return res.status(409).json({ message: "This quote can't be changed now.", booking: view });

    const reason = (req.body.reason || "").trim();
    db.exec("BEGIN");
    try {
      if (decision === "accept") {
        const note = "Accepted on the booking page";
        db.prepare(
          `UPDATE leads SET customer_accepted_quote_id = current_quote_id, customer_accepted_at = datetime('now'),
             customer_acceptance_note = ?, updated_at = datetime('now') WHERE reference = ?`,
        ).run(note, lead.reference);
        db.prepare("UPDATE lead_quotes SET customer_response = 'accepted', customer_response_at = datetime('now'), customer_response_note = ? WHERE id = ?").run(note, view.quote.id);
        db.prepare("INSERT INTO lead_status_history (reference, status, changed_by, detail) VALUES (?, 'customer_accepted', 'customer', ?)").run(lead.reference, note);
      } else {
        const note = reason || "Declined on the booking page";
        db.prepare("UPDATE lead_quotes SET customer_response = 'declined', customer_response_at = datetime('now'), customer_response_note = ? WHERE id = ?").run(note, view.quote.id);
        db.prepare("UPDATE leads SET updated_at = datetime('now') WHERE reference = ?").run(lead.reference);
        db.prepare("INSERT INTO lead_status_history (reference, status, changed_by, detail) VALUES (?, 'customer_declined', 'customer', ?)").run(lead.reference, note);
      }
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
    notifyCustomerResponse(lead, decision, reason);
    res.json({ booking: customerView(db.prepare("SELECT * FROM leads WHERE reference = ?").get(lead.reference)) });
  },
);

// Lost link: email a fresh one to the address on the enquiry. The answer is
// identical whether or not the details matched, so this can't be used to
// discover which references or emails exist.
router.post("/link", validateBody({ reference: text(20, "Reference"), email: EMAIL }), (req, res) => {
  const reference = (req.body.reference || "").trim().toUpperCase();
  const email = (req.body.email || "").trim().toLowerCase();
  if (REFERENCE_ID.test(reference) && email) {
    const lead = db.prepare("SELECT reference, full_name, email FROM leads WHERE reference = ? AND email = ?").get(reference, email);
    if (lead) notifyBookingLink(lead, issueAccessLink(lead.reference, "customer"));
  }
  res.status(202).json({ message: "If those details match an enquiry, we've emailed a new link to that address. It can take a few minutes." });
});

export default router;
