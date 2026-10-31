import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  MapPin,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  Star,
  Check,
} from "lucide-react";
import { CITIES, BUDDIES as STATIC_BUDDIES } from "../data";
import { todayISO, formatDay, countNights } from "../hooks";
import { api } from "../lib/api";
import { useAuth } from "../auth/authContext";
import "./BookTrip.css";

const STEPS = [
  { id: 1, label: "Trip Details" },
  { id: 2, label: "Preferences" },
  { id: 3, label: "Buddy Matching" },
  { id: 4, label: "Review & Submit" },
];

const TRAVEL_STYLES = [
  "Heritage & Culture",
  "Street Food & Bazaars",
  "Spiritual & Ghats",
  "Photography Walks",
  "Nature & Outdoors",
  "Relaxed & Offbeat",
];

const TRAVEL_PACES = [
  { id: "relaxed", label: "Relaxed", desc: "1-2 spots a day with plenty of tea stops" },
  { id: "balanced", label: "Balanced", desc: "A mix of sightseeing and local wanderings" },
  { id: "active", label: "Active", desc: "Early starts, full days, packed with highlights" },
];

export default function BookTrip() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [buddies, setBuddies] = useState(STATIC_BUDDIES);

  // Form State initialized from query params or sensible defaults
  const [formData, setFormData] = useState({
    where: searchParams.get("where") || "Varanasi",
    arrive: searchParams.get("arrive") || "",
    depart: searchParams.get("depart") || "",
    who: searchParams.get("who") || "2 travellers",
    styles: ["Heritage & Culture"],
    pace: "balanced",
    specialRequests: "",
    selectedBuddy: null,
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  // Sync authenticated user details if they log in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Load live buddies from API
  useEffect(() => {
    api
      .get("/buddies")
      .then((data) => {
        if (data?.buddies?.length) setBuddies(data.buddies);
      })
      .catch(() => {});
  }, []);

  const today = useMemo(() => todayISO(), []);
  const nights = useMemo(
    () => countNights(formData.arrive, formData.depart),
    [formData.arrive, formData.depart]
  );

  // Matching buddies based on selected city
  const cityBuddies = useMemo(() => {
    const q = (formData.where || "").toLowerCase().trim();
    const matches = buddies.filter(
      (b) =>
        b.city.toLowerCase().includes(q) ||
        q.includes(b.city.toLowerCase()) ||
        q === "anywhere in india" ||
        q === ""
    );
    return matches.length > 0 ? matches : buddies.slice(0, 3);
  }, [buddies, formData.where]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const toggleStyle = (style) => {
    setFormData((prev) => {
      const exists = prev.styles.includes(style);
      return {
        ...prev,
        styles: exists ? prev.styles.filter((s) => s !== style) : [...prev.styles, style],
      };
    });
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.where.trim()) {
      setError("Please select or enter your destination of interest.");
      return false;
    }
    if (formData.arrive && formData.depart && formData.depart <= formData.arrive) {
      setError("Departure date must be at least one day after arrival date.");
      return false;
    }
    return true;
  };

  // Step 4 Contact Details Validation
  const validateStep4 = () => {
    if (!formData.fullName.trim()) {
      setError("Please enter your name so your local buddy knows who to expect.");
      return false;
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      setError("Please provide an email or phone number for the draft itinerary.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && !validateStep1()) return;
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep4()) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        where: formData.where,
        arrive: formData.arrive || null,
        depart: formData.depart || null,
        who: formData.who,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        style: formData.styles.join(", "),
        pace: formData.pace,
        specialRequests: formData.specialRequests,
        buddyName: formData.selectedBuddy ? formData.selectedBuddy.name : "First Available Match",
      };

      const res = await api.post("/plan-requests", payload);
      setConfirmedData({
        ...payload,
        reference: res.reference,
        nights,
      });

      // Controlled celebration confetti on real persisted success
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#F2921D", "#FFD700", "#3F2617", "#FFF4DA"],
          disableForReducedMotion: true,
        });
      } catch {
        // Confetti non-critical fallback
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Could not submit your trip request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------- Confirmation Screen
  if (confirmedData) {
    return (
      <div className="booking-page">
        <div className="shell">
          <div className="booking-success-box" data-reveal>
            <div className="bsuccess-icon-circle">
              <CheckCircle2 size={40} strokeWidth={2.4} aria-hidden="true" />
            </div>

            <p className="eyebrow eyebrow--dark">Trip Request Received</p>
            <h2>We're matching you with your local buddy!</h2>
            <p style={{ color: "var(--muted)", maxWidth: "52ch", margin: "10px auto 0" }}>
              Thank you, <strong>{confirmedData.fullName}</strong>. No payment has been taken.
              Your request has been logged and our local desk is reviewing your requirements.
            </p>

            <div className="booking-ref-badge">
              <span>Booking Reference:</span>
              <code>{confirmedData.reference}</code>
            </div>

            <div className="bsuccess-timeline">
              <div className="bsuccess-step">
                <span className="bsuccess-step-num">1</span>
                <div>
                  <strong>Buddy Review (Within 24 Hours)</strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                    We pair your interests in {confirmedData.where} with an ID-verified local.
                  </p>
                </div>
              </div>

              <div className="bsuccess-step">
                <span className="bsuccess-step-num">2</span>
                <div>
                  <strong>Introductory Video Call</strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                    You'll connect with your buddy over video to refine your itinerary and verify vibes.
                  </p>
                </div>
              </div>

              <div className="bsuccess-step">
                <span className="bsuccess-step-num">3</span>
                <div>
                  <strong>Zero-Risk Confirmation</strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                    Only after you are 100% happy with your custom plan will you confirm your booking.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/" className="btn btn--solid">
                Return to Homepage
              </Link>
              <Link to="/stories" className="btn btn--soft">
                Read Traveller Stories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------- Main Form Wizard
  return (
    <div className="booking-page">
      <div className="booking-hero">
        <div className="shell">
          <div className="booking-hero__top">
            <Link to="/" className="booking-back-btn">
              <ArrowLeft size={16} /> Back to explore
            </Link>
            <span className="bsummary-pill">No Payment Required</span>
          </div>

          <h1>Plan your custom journey</h1>
          <p>
            Connect with someone who actually lives there. Tell us what you're curious about and we'll
            craft a flexible day-by-day plan with an ID-verified buddy.
          </p>

          {/* Stepper */}
          <div className="booking-steps-bar" role="tablist">
            {STEPS.map((s) => {
              const isDone = s.id < step;
              const isActive = s.id === step;
              return (
                <div
                  key={s.id}
                  className={`booking-step-node ${isActive ? "booking-step-node--active" : ""} ${
                    isDone ? "booking-step-node--done" : ""
                  }`}
                  onClick={() => {
                    if (s.id < step) setStep(s.id);
                  }}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span className="booking-step-num">
                    {isDone ? <Check size={18} strokeWidth={2.6} /> : s.id}
                  </span>
                  <span className="booking-step-label">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="shell">
        <div className="booking-layout">
          {/* Main Step Form Card */}
          <div className="booking-main-card">
            {error && (
              <p className="form__summary form__summary--server" role="alert" style={{ marginBottom: "24px" }}>
                <AlertCircle size={16} strokeWidth={2.4} aria-hidden="true" />
                {error}
              </p>
            )}

            {/* STEP 1: TRIP DETAILS */}
            {step === 1 && (
              <div data-reveal>
                <div className="booking-step-head">
                  <h2>Where &amp; when are you travelling?</h2>
                  <p>Pick your destination and dates. Dates can still be adjusted later.</p>
                </div>

                <div className="bfield">
                  <label htmlFor="b-where">Destination *</label>
                  <select
                    id="b-where"
                    value={formData.where}
                    onChange={(e) => updateField("where", e.target.value)}
                  >
                    <option value="Anywhere in India">Anywhere in India (Surprise Me / Multi-City)</option>
                    {CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}, {c.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bform-grid-2">
                  <div className="bfield">
                    <label htmlFor="b-arrive">Arrive Date</label>
                    <input
                      id="b-arrive"
                      type="date"
                      min={today}
                      value={formData.arrive}
                      onChange={(e) => updateField("arrive", e.target.value)}
                    />
                  </div>

                  <div className="bfield">
                    <label htmlFor="b-depart">Depart Date</label>
                    <input
                      id="b-depart"
                      type="date"
                      min={formData.arrive || today}
                      value={formData.depart}
                      onChange={(e) => updateField("depart", e.target.value)}
                    />
                  </div>
                </div>

                <div className="bfield">
                  <label htmlFor="b-who">Travellers</label>
                  <select
                    id="b-who"
                    value={formData.who}
                    onChange={(e) => updateField("who", e.target.value)}
                  >
                    <option>Solo traveller</option>
                    <option>2 travellers</option>
                    <option>3–5 travellers</option>
                    <option>6+ family / group</option>
                  </select>
                </div>

                <div className="bform-actions">
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {nights > 0
                      ? `${nights} ${nights === 1 ? "night" : "nights"} duration`
                      : "Dates flexible"}
                  </span>
                  <button type="button" className="btn btn--solid" onClick={handleNext}>
                    Continue to Preferences <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PREFERENCES */}
            {step === 2 && (
              <div data-reveal>
                <div className="booking-step-head">
                  <h2>What kind of experience do you love?</h2>
                  <p>Choose what excites you. Your buddy will shape the day around your style.</p>
                </div>

                <div className="bfield">
                  <label>Travel Styles (Select all that apply)</label>
                  <div className="bpills-grid">
                    {TRAVEL_STYLES.map((style) => {
                      const selected = formData.styles.includes(style);
                      return (
                        <div
                          key={style}
                          className={`bpill ${selected ? "bpill--selected" : ""}`}
                          onClick={() => toggleStyle(style)}
                        >
                          {selected && <Check size={14} strokeWidth={2.4} />}
                          <span>{style}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bfield" style={{ marginTop: "24px" }}>
                  <label>Preferred Daily Pace</label>
                  <div className="bform-grid-3">
                    {TRAVEL_PACES.map((p) => {
                      const selected = formData.pace === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`bpill ${selected ? "bpill--selected" : ""}`}
                          style={{
                            borderRadius: "14px",
                            flexDirection: "column",
                            textAlign: "center",
                            padding: "16px 12px",
                          }}
                          onClick={() => updateField("pace", p.id)}
                        >
                          <strong>{p.label}</strong>
                          <span style={{ fontSize: "0.74rem", opacity: selected ? 0.95 : 0.7 }}>
                            {p.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bfield" style={{ marginTop: "20px" }}>
                  <label htmlFor="b-special">Any special wishes, accessibility, or dietary needs?</label>
                  <textarea
                    id="b-special"
                    rows="3"
                    value={formData.specialRequests}
                    onChange={(e) => updateField("specialRequests", e.target.value)}
                    placeholder="e.g. Vegetarian only, travelling with elderly parents, interested in early morning photography..."
                  />
                </div>

                <div className="bform-actions">
                  <button type="button" className="btn btn--soft" onClick={handleBack}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" className="btn btn--solid" onClick={handleNext}>
                    Choose Buddy Match <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: BUDDY MATCHING */}
            {step === 3 && (
              <div data-reveal>
                <div className="booking-step-head">
                  <h2>Local buddies in {formData.where}</h2>
                  <p>
                    Select a preferred buddy or let our desk match you with the best available host.
                  </p>
                </div>

                <div className="buddies-picker">
                  <div
                    className={`buddy-pick-card ${
                      formData.selectedBuddy === null ? "buddy-pick-card--active" : ""
                    }`}
                    onClick={() => updateField("selectedBuddy", null)}
                  >
                    <div className="buddy-pick-info">
                      <div className="buddy-avatar-mark" style={{ background: "var(--orange)" }}>
                        <Sparkles size={20} />
                      </div>
                      <div className="buddy-pick-details">
                        <h4>Best Match (Recommended)</h4>
                        <div className="buddy-pick-meta">
                          <span>Our local desk selects the best verified buddy for your dates</span>
                        </div>
                      </div>
                    </div>
                    {formData.selectedBuddy === null && (
                      <CheckCircle2 size={20} color="var(--orange)" />
                    )}
                  </div>

                  {cityBuddies.map((b) => {
                    const isSelected = formData.selectedBuddy?.name === b.name;
                    return (
                      <div
                        key={b.name}
                        className={`buddy-pick-card ${isSelected ? "buddy-pick-card--active" : ""}`}
                        onClick={() => updateField("selectedBuddy", b)}
                      >
                        <div className="buddy-pick-info">
                          <div className="buddy-avatar-mark" style={{ background: b.hue }}>
                            {b.name[0]}
                          </div>
                          <div className="buddy-pick-details">
                            <h4>{b.name}</h4>
                            <div className="buddy-pick-meta">
                              <span>
                                <MapPin size={12} /> {b.city}
                              </span>
                              <span>
                                <Star size={12} fill="currentColor" /> {b.rating.toFixed(1)}
                              </span>
                              <span>{b.years} yrs guiding</span>
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={20} color="var(--orange)" />}
                      </div>
                    );
                  })}
                </div>

                <div className="bform-actions">
                  <button type="button" className="btn btn--soft" onClick={handleBack}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" className="btn btn--solid" onClick={handleNext}>
                    Review Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {step === 4 && (
              <form onSubmit={handleSubmit} data-reveal>
                <div className="booking-step-head">
                  <h2>Review and confirm your request</h2>
                  <p>Check your details before we pair you with your buddy.</p>
                </div>

                {/* Review Blocks */}
                <div className="review-block">
                  <div className="review-block-head">
                    <h4>Trip Itinerary</h4>
                    <button type="button" className="review-edit-btn" onClick={() => setStep(1)}>
                      Edit
                    </button>
                  </div>
                  <div className="review-grid">
                    <div className="review-item">
                      <strong>Destination</strong>
                      <span>{formData.where}</span>
                    </div>
                    <div className="review-item">
                      <strong>Dates</strong>
                      <span>
                        {formData.arrive && formData.depart
                          ? `${formatDay(formData.arrive)} → ${formatDay(formData.depart)} (${nights} nights)`
                          : "Dates flexible"}
                      </span>
                    </div>
                    <div className="review-item">
                      <strong>Party Size</strong>
                      <span>{formData.who}</span>
                    </div>
                    <div className="review-item">
                      <strong>Assigned Buddy</strong>
                      <span>
                        {formData.selectedBuddy ? formData.selectedBuddy.name : "Best Match Assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="review-block">
                  <div className="review-block-head">
                    <h4>Preferences &amp; Style</h4>
                    <button type="button" className="review-edit-btn" onClick={() => setStep(2)}>
                      Edit
                    </button>
                  </div>
                  <div className="review-grid">
                    <div className="review-item">
                      <strong>Styles</strong>
                      <span>{formData.styles.join(", ") || "General Sightseeing"}</span>
                    </div>
                    <div className="review-item">
                      <strong>Pace</strong>
                      <span style={{ textTransform: "capitalize" }}>{formData.pace}</span>
                    </div>
                    {formData.specialRequests && (
                      <div className="review-item" style={{ gridColumn: "1 / -1" }}>
                        <strong>Notes &amp; Requests</strong>
                        <span>{formData.specialRequests}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="booking-step-head" style={{ marginTop: "24px" }}>
                  <h4>Your Contact Information</h4>
                  <p>Where should we send your draft itinerary and video call invite?</p>
                </div>

                <div className="bform-grid-2">
                  <div className="bfield">
                    <label htmlFor="b-name">Your Full Name *</label>
                    <input
                      id="b-name"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="e.g. Radhika Sharma"
                    />
                  </div>

                  <div className="bfield">
                    <label htmlFor="b-email">Email Address</label>
                    <input
                      id="b-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="radhika@example.com"
                    />
                  </div>
                </div>

                <div className="bfield">
                  <label htmlFor="b-phone">WhatsApp / Mobile Number</label>
                  <input
                    id="b-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="bform-actions">
                  <button type="button" className="btn btn--soft" onClick={handleBack} disabled={submitting}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="btn btn--solid btn--lg" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="spin" />
                        <span>Submitting Request…</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Submit Trip Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sticky Side Summary */}
          <aside className="booking-summary-card">
            <h3 className="bsummary-title">
              <span>Trip Summary</span>
              <span className="bsummary-pill">No Payment Yet</span>
            </h3>

            <div className="bsummary-row">
              <MapPin size={20} />
              <div>
                <span className="bsummary-label">Destination</span>
                <span className="bsummary-val">{formData.where}</span>
              </div>
            </div>

            <div className="bsummary-row">
              <Calendar size={20} />
              <div>
                <span className="bsummary-label">Dates</span>
                <span className="bsummary-val">
                  {formData.arrive && formData.depart
                    ? `${formatDay(formData.arrive)} – ${formatDay(formData.depart)}`
                    : "Dates flexible"}
                </span>
                {nights > 0 && <p className="bsummary-subval">{nights} nights total</p>}
              </div>
            </div>

            <div className="bsummary-row">
              <Users size={20} />
              <div>
                <span className="bsummary-label">Travellers</span>
                <span className="bsummary-val">{formData.who}</span>
              </div>
            </div>

            <div className="bsummary-row">
              <Compass size={20} />
              <div>
                <span className="bsummary-label">Assigned Buddy</span>
                <span className="bsummary-val">
                  {formData.selectedBuddy ? formData.selectedBuddy.name : "Desk Recommendation"}
                </span>
              </div>
            </div>

            <div className="bsummary-guarantee">
              <strong>100% Zero-Risk Policy</strong>
              <p>
                Video call your matched buddy before paying. If the vibe isn't right, we pair you with
                someone else at no cost.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
