"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { API_URL } from "@/lib/site";

// "Become a buddy" application. Posts to /api/buddy-applications, which runs
// the same checks again; shortlisted applicants later get a private link
// (/buddy-verification) to upload documents. Only the last 4 characters of
// an ID number are asked for — never the full number.

const LANGUAGES = ["Hindi", "English", "Bhojpuri", "Urdu", "Bengali", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Punjabi", "Odia"];
const SPECIALITIES = ["Heritage & history", "Food & markets", "Boats & the river", "Spiritual & ritual", "Photography walks", "Yoga & wellbeing", "Craft & textiles", "Music & nightlife"];
const GROUP_SIZES = ["Solo travellers", "Couples", "3–5 people", "6+ people"];
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = Record<string, string>;

function ageFrom(dob: string) {
  const b = new Date(dob);
  if (!dob || Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age;
}

function validate(v: Record<string, string>, languages: string[]): Errors {
  const e: Errors = {};
  const phone = (s = "") => PHONE_RE.test(s.replace(/[\s-]/g, ""));
  if (!v.fullName?.trim()) e.fullName = "We need a name to call you by.";
  const age = ageFrom(v.dob);
  if (age === null) e.dob = "Enter your date of birth.";
  else if (age < 18) e.dob = "Buddies have to be 18 or older.";
  else if (age > 90) e.dob = "Please check the year.";
  if (!EMAIL_RE.test(v.email?.trim() || "")) e.email = "Enter a complete email address.";
  if (!phone(v.phone)) e.phone = "Enter a 10-digit Indian mobile number.";
  if (v.whatsapp && !phone(v.whatsapp)) e.whatsapp = "Enter a 10-digit WhatsApp number, or leave it empty.";
  if (!v.city?.trim()) e.city = "Enter your city.";
  if (v.yearsInCity === "" || Number(v.yearsInCity) < 0) e.yearsInCity = "How many years have you lived there?";
  if (languages.length === 0 && !v.otherLanguage?.trim()) e.languages = "Pick at least one language.";
  if (!v.guidingYears) e.guidingYears = "Choose your guiding experience.";
  if (!v.daysPerWeek) e.daysPerWeek = "Choose how often you're free.";
  if (!v.idType) e.idType = "Choose your ID document.";
  if (v.idNumber.replace(/[^A-Za-z0-9]/g, "").length !== 4) e.idNumber = "Enter only the last 4 characters of the ID number.";
  if (!v.ref1Name?.trim() || !phone(v.ref1Phone)) e.ref1 = "Add a first reference with a 10-digit mobile number.";
  if ((v.ref2Name?.trim() || v.ref2Phone) && (!v.ref2Name?.trim() || !phone(v.ref2Phone))) e.ref2 = "Complete the second reference, or leave both fields empty.";
  if ((v.whyJoin || "").trim().length < 30) e.whyJoin = "Tell us a bit more — at least a couple of sentences.";
  if ((v.showThem || "").trim().length < 30) e.showThem = "Tell us a bit more — at least a couple of sentences.";
  if (!v.consent) e.consent = "Please agree so we can check your ID and references.";
  return e;
}

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? <p id={id} className="field__error">{msg}</p> : null;
}

function Chips({ name, legend, options }: { name: string; legend: string; options: string[] }) {
  return (
    <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
      <legend>{legend}</legend>
      <div className="chips" style={{ marginTop: 6 }}>
        {options.map((o) => (
          <label key={o} className="chip">
            <input type="checkbox" name={name} value={o} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function BuddyApplication() {
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ reference: string; name: string } | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = Object.fromEntries([...fd.entries()].filter(([, val]) => typeof val === "string")) as Record<string, string>;
    const languages = fd.getAll("languages") as string[];
    const errs = validate(v, languages);
    setErrors(errs);
    if (Object.keys(errs).length) return requestAnimationFrame(() => summaryRef.current?.focus());

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/buddy-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          phone: v.phone.replace(/[\s-]/g, ""),
          whatsapp: v.whatsapp?.replace(/[\s-]/g, "") || "",
          ref1Phone: v.ref1Phone.replace(/[\s-]/g, ""),
          ref2Phone: v.ref2Phone?.replace(/[\s-]/g, "") || "",
          idNumber: v.idNumber.replace(/[^A-Za-z0-9]/g, ""),
          languages,
          specialities: fd.getAll("specialities"),
          groupSizes: fd.getAll("groupSizes"),
          firstAid: fd.get("firstAid") === "on",
          consent: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "We couldn't send your application. Please try again.");
      setDone({ reference: data.reference, name: data.name });
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "We couldn't send your application. Please try again." });
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div ref={doneRef} tabIndex={-1} className="notice notice--info" role="status">
        <span aria-hidden="true">✓</span>
        <div>
          <strong>Thank you, {done.name} — your application is in</strong>
          Your reference is <strong>{done.reference}</strong>. We read every application and call your references. If you&apos;re
          shortlisted, we&apos;ll send you a private link to upload your ID, a recent photo and your police verification certificate.
        </div>
      </div>
    );
  }

  const errList = Object.values(errors);
  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `b-${k}-err` : undefined });

  return (
    <form onSubmit={submit} noValidate className="stack" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "clamp(18px,3vw,28px)" }}>
      {errList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} className="notice notice--warn" role="alert">
          <span aria-hidden="true">!</span>
          <div><strong>Please check the form</strong><ul style={{ margin: "4px 0 0", paddingLeft: "1.2em" }}>{errList.map((m) => <li key={m}>{m}</li>)}</ul></div>
        </div>
      )}

      <h2 style={{ fontSize: "1.25rem" }}>About you</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="b-fullName">Full name</label>
          <input id="b-fullName" name="fullName" autoComplete="name" maxLength={80} {...inv("fullName")} />
          <Err id="b-fullName-err" msg={errors.fullName} />
        </div>
        <div className="field">
          <label htmlFor="b-dob">Date of birth</label>
          <input id="b-dob" name="dob" type="date" max={today} {...inv("dob")} />
          <Err id="b-dob-err" msg={errors.dob} />
        </div>
        <div className="field">
          <label htmlFor="b-gender">Gender <span className="field__hint">(optional)</span></label>
          <select id="b-gender" name="gender" defaultValue="">
            <option value="">Prefer not to say</option>
            <option>Woman</option>
            <option>Man</option>
            <option>Non-binary</option>
          </select>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="b-email">Email</label>
          <input id="b-email" name="email" type="email" autoComplete="email" {...inv("email")} />
          <Err id="b-email-err" msg={errors.email} />
        </div>
        <div className="field">
          <label htmlFor="b-phone">Mobile</label>
          <input id="b-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" {...inv("phone")} />
          <Err id="b-phone-err" msg={errors.phone} />
        </div>
        <div className="field">
          <label htmlFor="b-whatsapp">WhatsApp <span className="field__hint">(if different)</span></label>
          <input id="b-whatsapp" name="whatsapp" type="tel" inputMode="tel" {...inv("whatsapp")} />
          <Err id="b-whatsapp-err" msg={errors.whatsapp} />
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="b-city">City</label>
          <input id="b-city" name="city" defaultValue="Varanasi" autoComplete="address-level2" {...inv("city")} />
          <Err id="b-city-err" msg={errors.city} />
        </div>
        <div className="field">
          <label htmlFor="b-state">State</label>
          <input id="b-state" name="state" defaultValue="Uttar Pradesh" autoComplete="address-level1" />
        </div>
        <div className="field">
          <label htmlFor="b-years">Years you&apos;ve lived there</label>
          <input id="b-years" name="yearsInCity" type="number" min={0} max={90} inputMode="numeric" {...inv("yearsInCity")} />
          <Err id="b-yearsInCity-err" msg={errors.yearsInCity} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="b-areas">Areas you know best <span className="field__hint">(optional)</span></label>
        <input id="b-areas" name="areas" maxLength={300} placeholder="e.g. Assi to Dashashwamedh, Sarnath, the old city lanes" />
      </div>

      <h2 style={{ fontSize: "1.25rem" }}>Languages and experience</h2>
      <Chips name="languages" legend="Languages you can guide in" options={LANGUAGES} />
      <div className="field">
        <label htmlFor="b-otherLanguage">Other languages <span className="field__hint">(optional)</span></label>
        <input id="b-otherLanguage" name="otherLanguage" maxLength={120} placeholder="e.g. French, Japanese" />
        <Err id="b-languages-err" msg={errors.languages} />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="b-guidingYears">Guiding experience</label>
          <select id="b-guidingYears" name="guidingYears" defaultValue="" {...inv("guidingYears")}>
            <option value="">Choose…</option>
            <option>None yet</option>
            <option>Under 1 year</option>
            <option>1–3 years</option>
            <option>3–5 years</option>
            <option>5–10 years</option>
            <option>10+ years</option>
          </select>
          <Err id="b-guidingYears-err" msg={errors.guidingYears} />
        </div>
        <div className="field">
          <label htmlFor="b-occupation">Current work or study <span className="field__hint">(optional)</span></label>
          <input id="b-occupation" name="occupation" maxLength={120} />
        </div>
      </div>
      <Chips name="specialities" legend="What you love showing people (optional)" options={SPECIALITIES} />

      <h2 style={{ fontSize: "1.25rem" }}>Availability</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="b-daysPerWeek">Days a week you&apos;re free</label>
          <select id="b-daysPerWeek" name="daysPerWeek" defaultValue="" {...inv("daysPerWeek")}>
            <option value="">Choose…</option>
            <option>1–2 days</option>
            <option>3–4 days</option>
            <option>5–6 days</option>
            <option>Every day</option>
            <option>Weekends only</option>
          </select>
          <Err id="b-daysPerWeek-err" msg={errors.daysPerWeek} />
        </div>
        <div className="field">
          <label htmlFor="b-noticeDays">Notice you need</label>
          <select id="b-noticeDays" name="noticeDays" defaultValue="">
            <option value="">Same day is fine</option>
            <option>1–2 days</option>
            <option>3–7 days</option>
            <option>More than a week</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="b-vehicle">Your own vehicle</label>
          <select id="b-vehicle" name="vehicle" defaultValue="">
            <option value="">No</option>
            <option>Two-wheeler</option>
            <option>Car</option>
            <option>Both</option>
          </select>
        </div>
      </div>
      <Chips name="groupSizes" legend="Group sizes you're comfortable with (optional)" options={GROUP_SIZES} />
      <label className="verify-check">
        <input type="checkbox" name="firstAid" />
        <span>I have first-aid training</span>
      </label>

      <h2 style={{ fontSize: "1.25rem" }}>ID and references</h2>
      <p className="field__hint">
        We only need the <strong>last 4 characters</strong> of your ID number now — never send the full number. If you&apos;re
        shortlisted, you&apos;ll upload the document itself through a private, encrypted link.
      </p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="b-idType">ID document</label>
          <select id="b-idType" name="idType" defaultValue="" {...inv("idType")}>
            <option value="">Choose…</option>
            <option value="Aadhaar">Aadhaar (masked copy)</option>
            <option>Passport</option>
            <option>Driving licence</option>
            <option>Voter ID</option>
            <option>PAN card</option>
          </select>
          <Err id="b-idType-err" msg={errors.idType} />
        </div>
        <div className="field">
          <label htmlFor="b-idNumber">Last 4 characters of the ID number</label>
          <input id="b-idNumber" name="idNumber" maxLength={4} autoComplete="off" inputMode="text" style={{ maxWidth: 140 }} {...inv("idNumber")} />
          <Err id="b-idNumber-err" msg={errors.idNumber} />
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="b-ref1Name">Reference 1 — name</label>
          <input id="b-ref1Name" name="ref1Name" maxLength={80} {...inv("ref1")} />
        </div>
        <div className="field">
          <label htmlFor="b-ref1Phone">Reference 1 — mobile</label>
          <input id="b-ref1Phone" name="ref1Phone" type="tel" inputMode="tel" {...inv("ref1")} />
          <Err id="b-ref1-err" msg={errors.ref1} />
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="b-ref2Name">Reference 2 — name <span className="field__hint">(optional)</span></label>
          <input id="b-ref2Name" name="ref2Name" maxLength={80} {...inv("ref2")} />
        </div>
        <div className="field">
          <label htmlFor="b-ref2Phone">Reference 2 — mobile <span className="field__hint">(optional)</span></label>
          <input id="b-ref2Phone" name="ref2Phone" type="tel" inputMode="tel" {...inv("ref2")} />
          <Err id="b-ref2-err" msg={errors.ref2} />
        </div>
      </div>
      <p className="field__hint">Someone who knows you well and isn&apos;t family — a teacher, employer or neighbour. We&apos;ll call them.</p>

      <h2 style={{ fontSize: "1.25rem" }}>In your own words</h2>
      <div className="field">
        <label htmlFor="b-whyJoin">Why do you want to be a buddy?</label>
        <textarea id="b-whyJoin" name="whyJoin" rows={4} maxLength={2000} {...inv("whyJoin")} />
        <Err id="b-whyJoin-err" msg={errors.whyJoin} />
      </div>
      <div className="field">
        <label htmlFor="b-showThem">A visitor has one free evening. What would you show them?</label>
        <textarea id="b-showThem" name="showThem" rows={4} maxLength={2000} {...inv("showThem")} />
        <Err id="b-showThem-err" msg={errors.showThem} />
      </div>

      <label className="verify-check">
        <input type="checkbox" name="consent" aria-invalid={!!errors.consent} />
        <span>
          I agree that Varanasi Trip Companion may check my ID and call my references, and I&apos;ve read the{" "}
          <Link href="/privacy">privacy policy</Link>.
        </span>
      </label>

      <div className="btn-row">
        <button type="submit" className="btn btn--primary" disabled={sending}>{sending ? "Sending…" : "Send my application"}</button>
      </div>
    </form>
  );
}
