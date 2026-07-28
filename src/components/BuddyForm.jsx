import { useState, useCallback, useRef } from "react";
import { Check, AlertCircle, Send, PartyPopper, Loader2 } from "lucide-react";
import { CITIES } from "../data";
import { api } from "../lib/api";

const LANGUAGES = [
  "Hindi", "English", "Bengali", "Marathi", "Tamil", "Telugu",
  "Kannada", "Malayalam", "Gujarati", "Punjabi", "Urdu", "Odia",
  "Assamese", "Konkani", "Kashmiri", "Ladakhi", "Khasi", "Bhojpuri",
];

const SPECIALITIES = [
  "Heritage & history", "Food & markets", "Trekking & outdoors",
  "Spiritual & ritual", "Photography walks", "Wildlife & nature",
  "Craft & textiles", "Music & nightlife",
];

const GROUP_SIZES = ["Solo travellers", "Couples", "3–5 people", "6+ people"];

const EMPTY = {
  fullName: "", dob: "", gender: "", email: "", phone: "", whatsapp: "",
  city: "", state: "", yearsInCity: "", areas: "",
  languages: [], otherLanguage: "",
  guidingYears: "", specialities: [], occupation: "",
  daysPerWeek: "", groupSizes: [], noticeDays: "", vehicle: "", firstAid: false,
  idType: "", idNumber: "",
  ref1Name: "", ref1Phone: "", ref2Name: "", ref2Phone: "",
  whyJoin: "", showThem: "",
  consent: false,
};

/** Age in whole years, or null if the date is unusable. */
function ageFrom(dob) {
  if (!dob) return null;
  const b = new Date(dob);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age;
}

function validate(v) {
  const e = {};
  const phone = (s) => /^[6-9]\d{9}$/.test(s.replace(/[\s-]/g, ""));

  if (!v.fullName.trim()) e.fullName = "We need a name to call you by.";

  const age = ageFrom(v.dob);
  if (!v.dob) e.dob = "Date of birth is required.";
  else if (age === null) e.dob = "That date doesn't look right.";
  else if (age < 18) e.dob = "Buddies have to be 18 or older.";
  else if (age > 90) e.dob = "Please check the year.";

  if (!v.email.trim()) e.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()))
    e.email = "That email doesn't look complete.";

  if (!v.phone.trim()) e.phone = "Phone number is required.";
  else if (!phone(v.phone)) e.phone = "Enter a 10-digit Indian mobile number.";

  if (v.whatsapp.trim() && !phone(v.whatsapp))
    e.whatsapp = "Enter a 10-digit number, or leave it blank.";

  if (!v.city.trim()) e.city = "Which town would you be guiding in?";
  if (!v.state.trim()) e.state = "State is required.";
  if (v.yearsInCity === "") e.yearsInCity = "Roughly how long have you lived there?";
  else if (Number(v.yearsInCity) < 0) e.yearsInCity = "That can't be negative.";

  if (v.languages.length === 0 && !v.otherLanguage.trim())
    e.languages = "Pick at least one language.";

  if (!v.guidingYears) e.guidingYears = "Choose one — 'none yet' is a fine answer.";
  if (!v.daysPerWeek) e.daysPerWeek = "How many days a week suits you?";

  if (!v.idType) e.idType = "Pick an ID type.";
  if (!v.idNumber.trim()) e.idNumber = "ID number is required for verification.";

  if (!v.ref1Name.trim()) e.ref1Name = "One reference is the minimum.";
  if (!v.ref1Phone.trim()) e.ref1Phone = "We need a number we can call.";
  else if (!phone(v.ref1Phone)) e.ref1Phone = "Enter a 10-digit mobile number.";
  if (v.ref2Phone.trim() && !phone(v.ref2Phone))
    e.ref2Phone = "Enter a 10-digit number, or leave it blank.";

  if (v.whyJoin.trim().length < 30)
    e.whyJoin = "A few sentences, please — at least 30 characters.";
  if (v.showThem.trim().length < 30)
    e.showThem = "This is the part we actually read. At least 30 characters.";

  if (!v.consent) e.consent = "We can't process the application without this.";

  return e;
}

/* ---------------------------------------------------------------- fields -- */

/**
 * The message line is always rendered, even when empty. Showing it only when a
 * hint or error exists makes neighbouring cells different heights, which reads
 * as uneven gaps down the column — reserving the line keeps one rhythm.
 */
function Field({ id, label, error, hint, full, children }) {
  return (
    <div className={`field ${full ? "field--full" : ""} ${error ? "field--bad" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      <p className={`field__msg ${error ? "field__msg--bad" : ""}`} id={error ? `${id}-error` : undefined}>
        {error ? (
          <>
            <AlertCircle size={13} strokeWidth={2.4} aria-hidden="true" />
            {error}
          </>
        ) : (
          hint
        )}
      </p>
    </div>
  );
}

function CheckGrid({ name, options, selected, onToggle, error, legend, hint }) {
  return (
    <fieldset className={`checks ${error ? "field--bad" : ""}`}>
      <legend>{legend}</legend>
      {hint && !error && <p className="checks__hint">{hint}</p>}
      <div className="checks__grid">
        {options.map((opt) => (
          <label key={opt} className="check">
            <input
              type="checkbox"
              name={name}
              value={opt}
              checked={selected.includes(opt)}
              onChange={() => onToggle(name, opt)}
            />
            <span className="check__box" aria-hidden="true">
              <Check size={12} strokeWidth={3.2} />
            </span>
            {opt}
          </label>
        ))}
      </div>
      {error && (
        <p className="field__msg field__msg--bad">
          <AlertCircle size={13} strokeWidth={2.4} aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ form -- */

export default function BuddyForm() {
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const formRef = useRef(null);

  const age = ageFrom(v.dob);

  const set = useCallback(
    (key) => (e) => {
      const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setV((s) => ({ ...s, [key]: val }));
      setErrors((s) => (s[key] ? { ...s, [key]: undefined } : s));
    },
    [],
  );

  const toggle = useCallback((key, option) => {
    setV((s) => {
      const list = s[key];
      return {
        ...s,
        [key]: list.includes(option) ? list.filter((x) => x !== option) : [...list, option],
      };
    });
    setErrors((s) => (s[key] ? { ...s, [key]: undefined } : s));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const found = validate(v);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Send focus to the first thing that needs fixing, not the top of the page.
      const firstBad = formRef.current?.querySelector(".field--bad input, .field--bad select, .field--bad textarea");
      firstBad?.focus();
      firstBad?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post("/buddy-applications", v);
      setDone({ ref: data.reference, name: data.name, email: data.email });
      window.scrollTo({ top: formRef.current.offsetTop - 120, behavior: "smooth" });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="form__done" role="status">
        <span className="form__done-icon">
          <PartyPopper size={26} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <h2>Thanks, {done.name} — that's in.</h2>
        <p>
          Your reference is <strong>{done.ref}</strong>. We've noted{" "}
          <strong>{done.email}</strong> and someone from the buddy team will reply within
          three working days. If your town is one we're actively hiring in, expect a video
          call invite in the same email.
        </p>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => {
            setV(EMPTY);
            setErrors({});
            setDone(null);
          }}
        >
          Submit another application
        </button>
      </div>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form className="form" onSubmit={onSubmit} ref={formRef} noValidate>
      {/* -------------------------------------------------------- about you */}
      <fieldset className="form__group">
        <legend className="form__legend">
          <span>01</span> About you
        </legend>

        <div className="form__grid">
          <Field id="fullName" label="Full name *" error={errors.fullName}>
            <input
              id="fullName"
              type="text"
              value={v.fullName}
              onChange={set("fullName")}
              autoComplete="name"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
            />
          </Field>

          <Field
            id="dob"
            label="Date of birth *"
            error={errors.dob}
            hint={age !== null && age >= 0 ? `You're ${age} years old.` : "You must be 18 or older."}
          >
            <input
              id="dob"
              type="date"
              value={v.dob}
              max={new Date().toISOString().slice(0, 10)}
              onChange={set("dob")}
              aria-invalid={!!errors.dob}
              aria-describedby={errors.dob ? "dob-error" : undefined}
            />
          </Field>

          <Field id="gender" label="Gender">
            <select id="gender" value={v.gender} onChange={set("gender")}>
              <option value="">Prefer not to say</option>
              <option>Woman</option>
              <option>Man</option>
              <option>Non-binary</option>
              <option>Self-describe</option>
            </select>
          </Field>

          <Field id="occupation" label="Current occupation">
            <input
              id="occupation"
              type="text"
              value={v.occupation}
              onChange={set("occupation")}
              placeholder="Teacher, shopkeeper, student…"
            />
          </Field>

          <Field id="email" label="Email *" error={errors.email}>
            <input
              id="email"
              type="email"
              value={v.email}
              onChange={set("email")}
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </Field>

          <Field id="phone" label="Mobile *" error={errors.phone} hint="10 digits, no +91">
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={v.phone}
              onChange={set("phone")}
              autoComplete="tel"
              placeholder="98765 43210"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
          </Field>

          <Field
            id="whatsapp"
            label="WhatsApp"
            error={errors.whatsapp}
            hint="Only if different from your mobile"
          >
            <input
              id="whatsapp"
              type="tel"
              inputMode="numeric"
              value={v.whatsapp}
              onChange={set("whatsapp")}
              placeholder="Optional"
            />
          </Field>
        </div>
      </fieldset>

      {/* ------------------------------------------------------ where you are */}
      <fieldset className="form__group">
        <legend className="form__legend">
          <span>02</span> Where you'd guide
        </legend>

        <div className="form__grid">
          <Field id="city" label="Town or city *" error={errors.city}>
            <input
              id="city"
              type="text"
              list="city-options"
              value={v.city}
              onChange={set("city")}
              placeholder="Varanasi, Shillong…"
              aria-invalid={!!errors.city}
            />
            <datalist id="city-options">
              {CITIES.map((c) => (
                <option key={c.name} value={c.name} />
              ))}
            </datalist>
          </Field>

          <Field id="state" label="State *" error={errors.state}>
            <input id="state" type="text" value={v.state} onChange={set("state")} />
          </Field>

          <Field
            id="yearsInCity"
            label="Years lived there *"
            error={errors.yearsInCity}
            hint="Visiting often doesn't count — we mean lived."
          >
            <input
              id="yearsInCity"
              type="number"
              min="0"
              max="90"
              value={v.yearsInCity}
              onChange={set("yearsInCity")}
              aria-invalid={!!errors.yearsInCity}
            />
          </Field>

          <Field id="vehicle" label="Do you have a vehicle?">
            <select id="vehicle" value={v.vehicle} onChange={set("vehicle")}>
              <option value="">No</option>
              <option>Two-wheeler</option>
              <option>Car</option>
              <option>Both</option>
            </select>
          </Field>

          <Field
            id="areas"
            label="Which parts do you know best?"
            full
            hint="Neighbourhoods, ghats, trails, markets — whatever you'd actually take someone to."
          >
            <textarea id="areas" rows={3} value={v.areas} onChange={set("areas")} />
          </Field>
        </div>
      </fieldset>

      {/* --------------------------------------------------------- languages */}
      <fieldset className="form__group">
        <legend className="form__legend">
          <span>03</span> Languages
        </legend>

        <CheckGrid
          name="languages"
          legend="Which can you hold a conversation in? *"
          hint="Tick everything you're comfortable guiding in, not just what you can read."
          options={LANGUAGES}
          selected={v.languages}
          onToggle={toggle}
          error={errors.languages}
        />

        <div className="form__grid">
          <Field id="otherLanguage" label="Any others" full>
            <input
              id="otherLanguage"
              type="text"
              value={v.otherLanguage}
              onChange={set("otherLanguage")}
              placeholder="Tulu, Mizo, French…"
            />
          </Field>
        </div>
      </fieldset>

      {/* -------------------------------------------------------- experience */}
      <fieldset className="form__group">
        <legend className="form__legend">
          <span>04</span> Experience & availability
        </legend>

        <div className="form__grid">
          <Field id="guidingYears" label="Years of guiding experience *" error={errors.guidingYears}>
            <select
              id="guidingYears"
              value={v.guidingYears}
              onChange={set("guidingYears")}
              aria-invalid={!!errors.guidingYears}
            >
              <option value="">Choose…</option>
              <option>None yet</option>
              <option>Under 1 year</option>
              <option>1–3 years</option>
              <option>3–5 years</option>
              <option>5–10 years</option>
              <option>10+ years</option>
            </select>
          </Field>

          <Field id="daysPerWeek" label="Days a week you're free *" error={errors.daysPerWeek}>
            <select
              id="daysPerWeek"
              value={v.daysPerWeek}
              onChange={set("daysPerWeek")}
              aria-invalid={!!errors.daysPerWeek}
            >
              <option value="">Choose…</option>
              <option>1–2 days</option>
              <option>3–4 days</option>
              <option>5–6 days</option>
              <option>Every day</option>
              <option>Weekends only</option>
            </select>
          </Field>

          <Field id="noticeDays" label="Notice you need">
            <select id="noticeDays" value={v.noticeDays} onChange={set("noticeDays")}>
              <option value="">Same day is fine</option>
              <option>1–2 days</option>
              <option>3–7 days</option>
              <option>More than a week</option>
            </select>
          </Field>

          <Field id="firstAid" label="First-aid trained?">
            <label className="check check--inline">
              <input
                id="firstAid"
                type="checkbox"
                checked={v.firstAid}
                onChange={set("firstAid")}
              />
              <span className="check__box" aria-hidden="true">
                <Check size={12} strokeWidth={3.2} />
              </span>
              Yes, I hold a current certificate
            </label>
          </Field>
        </div>

        <CheckGrid
          name="specialities"
          legend="What are you best at?"
          options={SPECIALITIES}
          selected={v.specialities}
          onToggle={toggle}
        />

        <CheckGrid
          name="groupSizes"
          legend="Group sizes you're happy with"
          options={GROUP_SIZES}
          selected={v.groupSizes}
          onToggle={toggle}
        />
      </fieldset>

      {/* ------------------------------------------------------ verification */}
      <fieldset className="form__group">
        <legend className="form__legend">
          <span>05</span> Verification
        </legend>
        <p className="form__note">
          Every buddy is ID-checked and reference-checked before their first trip. We only
          use these to verify you — they're never shown to travellers.
        </p>

        <div className="form__grid">
          <Field id="idType" label="ID document *" error={errors.idType}>
            <select id="idType" value={v.idType} onChange={set("idType")} aria-invalid={!!errors.idType}>
              <option value="">Choose…</option>
              <option>Aadhaar</option>
              <option>Passport</option>
              <option>Driving licence</option>
              <option>Voter ID</option>
              <option>PAN card</option>
            </select>
          </Field>

          <Field id="idNumber" label="ID number *" error={errors.idNumber}>
            <input
              id="idNumber"
              type="text"
              value={v.idNumber}
              onChange={set("idNumber")}
              autoComplete="off"
              aria-invalid={!!errors.idNumber}
            />
          </Field>

          <Field id="ref1Name" label="Reference 1 — name *" error={errors.ref1Name}>
            <input id="ref1Name" type="text" value={v.ref1Name} onChange={set("ref1Name")} />
          </Field>

          <Field id="ref1Phone" label="Reference 1 — phone *" error={errors.ref1Phone}>
            <input
              id="ref1Phone"
              type="tel"
              inputMode="numeric"
              value={v.ref1Phone}
              onChange={set("ref1Phone")}
              aria-invalid={!!errors.ref1Phone}
            />
          </Field>

          <Field id="ref2Name" label="Reference 2 — name">
            <input id="ref2Name" type="text" value={v.ref2Name} onChange={set("ref2Name")} />
          </Field>

          <Field id="ref2Phone" label="Reference 2 — phone" error={errors.ref2Phone}>
            <input
              id="ref2Phone"
              type="tel"
              inputMode="numeric"
              value={v.ref2Phone}
              onChange={set("ref2Phone")}
            />
          </Field>
        </div>
      </fieldset>

      {/* --------------------------------------------------------- your words */}
      <fieldset className="form__group">
        <legend className="form__legend">
          <span>06</span> In your own words
        </legend>

        <div className="form__grid">
          <Field
            id="whyJoin"
            label="Why do you want to do this? *"
            full
            error={errors.whyJoin}
            hint="No right answer. We're reading for honesty, not polish."
          >
            <textarea
              id="whyJoin"
              rows={4}
              value={v.whyJoin}
              onChange={set("whyJoin")}
              aria-invalid={!!errors.whyJoin}
            />
          </Field>

          <Field
            id="showThem"
            label="Someone lands tomorrow with one free day. Where do you take them? *"
            full
            error={errors.showThem}
            hint="This is the question we actually judge applications on."
          >
            <textarea
              id="showThem"
              rows={5}
              value={v.showThem}
              onChange={set("showThem")}
              aria-invalid={!!errors.showThem}
            />
          </Field>
        </div>
      </fieldset>

      {/* -------------------------------------------------------------- send */}
      <div className={`form__consent ${errors.consent ? "field--bad" : ""}`}>
        <label className="check">
          <input type="checkbox" checked={v.consent} onChange={set("consent")} />
          <span className="check__box" aria-hidden="true">
            <Check size={12} strokeWidth={3.2} />
          </span>
          I confirm the details above are true, and I agree to an ID check and reference
          calls as part of the application. *
        </label>
        {errors.consent && (
          <p className="field__msg field__msg--bad">
            <AlertCircle size={13} strokeWidth={2.4} aria-hidden="true" />
            {errors.consent}
          </p>
        )}
      </div>

      {serverError && (
        <p className="form__summary form__summary--server" role="alert">
          <AlertCircle size={15} strokeWidth={2.4} aria-hidden="true" />
          {serverError}
        </p>
      )}

      {errorCount > 0 && (
        <p className="form__summary" role="alert">
          <AlertCircle size={15} strokeWidth={2.4} aria-hidden="true" />
          {errorCount} {errorCount === 1 ? "field needs" : "fields need"} fixing before this
          can go.
        </p>
      )}

      <button className="btn btn--solid btn--lg form__submit" type="submit" disabled={submitting}>
        {submitting ? (
          <Loader2 size={17} strokeWidth={2.2} aria-hidden="true" className="spin" />
        ) : (
          <Send size={17} strokeWidth={2.2} aria-hidden="true" />
        )}
        {submitting ? "Sending…" : "Send application"}
      </button>
    </form>
  );
}
