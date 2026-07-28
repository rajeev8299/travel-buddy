import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Check, LogIn, UserPlus, PartyPopper, Eye, EyeOff, Loader2 } from "lucide-react";
import { AUTH, ROLES } from "../data";
import { useAuth } from "../auth/authContext";

/* The two pages share a form shape: only the mode (login / signup) and the
   extra fields in signup differ. Keeping it in one component means copy and
   validation stay in lockstep — the worst feeling is the login and signup
   pages disagreeing on what counts as a valid email. */

const LOGIN_EMPTY = { role: "user", email: "", password: "", remember: true };
const SIGNUP_EMPTY = {
  role: "user",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
  city: "",
  company: "",
  consent: false,
};

/**
 * Same contract as the one in BuddyForm: the message line is always rendered,
 * even empty, so fields sitting side by side keep a single vertical rhythm.
 */
function Field({ id, label, error, hint, full, children }) {
  return (
    <div className={`field ${full ? "field--full" : ""} ${error ? "field--bad" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      <p
        className={`field__msg ${error ? "field__msg--bad" : ""}`}
        id={error ? `${id}-error` : undefined}
      >
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

/* Light client-side validation only — the real auth call lives on the server.
   Keeping the rules in one function makes it easy to mirror them later if a
   backend lands. */
function validate(mode, v) {
  const e = {};
  const phone = (s) => /^[6-9]\d{9}$/.test(s.replace(/[\s-]/g, ""));

  if (!v.email.trim()) e.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()))
    e.email = "That email doesn't look complete.";

  if (!v.password) e.password = "Password is required.";
  else if (mode === "signup" && v.password.length < 8)
    e.password = "Use at least 8 characters.";

  if (mode === "signup") {
    if (!v.fullName.trim()) e.fullName = "We need a name to call you by.";
    if (!v.phone.trim()) e.phone = "Phone number is required.";
    else if (!phone(v.phone)) e.phone = "Enter a 10-digit Indian mobile number.";

    if (!v.confirm) e.confirm = "Type the password once more.";
    else if (v.confirm !== v.password) e.confirm = "Passwords don't match.";

    if (v.role === "user" && !v.city.trim())
      e.city = "Which city are you usually travelling from?";
    if (v.role === "client" && !v.company.trim())
      e.company = "Which hotel / company are you with?";

    if (!v.consent) e.consent = "We can't create the account without this.";
  }

  return e;
}

export default function AuthForm({ mode }) {
  const copy = AUTH[mode];
  const isSignup = mode === "signup";
  const { signIn, signUp, user } = useAuth();
  const [v, setV] = useState(isSignup ? SIGNUP_EMPTY : LOGIN_EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  /* Declared above the early return below: a hook that only runs on some
     renders changes the hook order, and React throws the moment `user` flips. */
  const set = useCallback(
    (key) => (e) => {
      const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setV((s) => ({ ...s, [key]: val }));
      setErrors((s) => (s[key] ? { ...s, [key]: undefined } : s));
    },
    [],
  );

  /* Already signed in? Don't show a form — bounce to a sensible page. Keeps
     the back button from landing a logged-in user on a login page. */
  if (user && !submitting) {
    return (
      <div className="form__done" role="status">
        <span className="form__done-icon">
          <PartyPopper size={26} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <h2>You're already signed in, {user.name}.</h2>
        <p>
          Use the menu in the top right to switch accounts, or jump straight into
          planning your trip.
        </p>
        <div className="form__done-actions">
          <button
            type="button"
            className="btn btn--solid"
            onClick={() => navigate("/plan")}
          >
            Plan my trip
          </button>
        </div>
      </div>
    );
  }

  /* Switching role mid-form wipes the role-specific fields, so an old company
     name doesn't bleed into a brand-new traveller signup. */
  const setRole = (role) => {
    setV((s) => ({
      ...LOGIN_EMPTY,
      ...(isSignup ? SIGNUP_EMPTY : {}),
      ...s,
      role,
      email: s.email,
    }));
    setErrors({});
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const found = validate(mode, v);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      const firstBad = formRef.current?.querySelector(
        ".field--bad input, .field--bad select, .field--bad textarea",
      );
      firstBad?.focus();
      firstBad?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        await signUp(v);
      } else {
        await signIn({ email: v.email, password: v.password });
      }
      /* On success the user lands on the form; context already updated, so
         a tiny pause before navigation gives the success state a frame. */
      navigate("/plan");
    } catch (err) {
      setServerError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* This branch is only reachable if signIn/signUp throw — we don't
     simulate a "done" state any more, navigation handles it. Kept here
     as a defensive fallback in case navigation is blocked. */
  if (user && !serverError && !submitting) {
    return null;
  }

  const errorCount = Object.values(errors).filter(Boolean).length;
  const SubmitIcon = isSignup ? UserPlus : LogIn;
  const ActionIcon = submitting ? Loader2 : SubmitIcon;

  return (
    <form className="form form--auth" onSubmit={onSubmit} ref={formRef} noValidate>
      <fieldset className="form__group auth__roles" aria-label="I'm signing in as">
        <legend className="form__legend">
          <span>01</span> I'm a…
        </legend>

        <div className="auth__roles-grid">
          {ROLES.map((r) => {
            const checked = v.role === r.id;
            return (
              <label
                key={r.id}
                className={`role ${checked ? "role--on" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.id}
                  checked={checked}
                  onChange={() => setRole(r.id)}
                />
                <span className="role__radio" aria-hidden="true" />
                <span className="role__body">
                  <strong>{r.label}</strong>
                  <span>{r.blurb}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="form__group">
        <legend className="form__legend">
          <span>{isSignup ? "02" : "02"}</span> {isSignup ? "Your details" : "Sign in"}
        </legend>

        <div className="form__grid">
          {isSignup && (
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
          )}

          <Field
            id="email"
            label="Email *"
            error={errors.email}
            full={!isSignup}
          >
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

          {isSignup && (
            <Field
              id="phone"
              label="Mobile *"
              error={errors.phone}
              hint="10 digits, no +91"
            >
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
          )}

          <Field
            id="password"
            label={isSignup ? "Password *" : "Password *"}
            error={errors.password}
            hint={isSignup ? "At least 8 characters." : undefined}
            full={!isSignup}
          >
            <div className="field__pw">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={v.password}
                onChange={set("password")}
                autoComplete={isSignup ? "new-password" : "current-password"}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                className="field__pw-toggle"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
              >
                {showPw ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
              </button>
            </div>
          </Field>

          {isSignup && (
            <Field
              id="confirm"
              label="Confirm password *"
              error={errors.confirm}
            >
              <input
                id="confirm"
                type={showPw ? "text" : "password"}
                value={v.confirm}
                onChange={set("confirm")}
                autoComplete="new-password"
                aria-invalid={!!errors.confirm}
                aria-describedby={errors.confirm ? "confirm-error" : undefined}
              />
            </Field>
          )}

          {isSignup && v.role === "user" && (
            <Field
              id="city"
              label="Home city *"
              error={errors.city}
              hint="So we can match you with buddies near the places you travel."
            >
              <input
                id="city"
                type="text"
                value={v.city}
                onChange={set("city")}
                placeholder="Bengaluru, Delhi…"
                aria-invalid={!!errors.city}
              />
            </Field>
          )}

          {isSignup && v.role === "client" && (
            <Field
              id="company"
              label="Hotel / company *"
              error={errors.company}
              hint="We'll reach out before activating client tools."
            >
              <input
                id="company"
                type="text"
                value={v.company}
                onChange={set("company")}
                placeholder="Taj, ITC, MakeMyTrip concierge…"
                aria-invalid={!!errors.company}
              />
            </Field>
          )}
        </div>

        {!isSignup && (
          <div className="auth__extras">
            <label className="check check--inline">
              <input
                type="checkbox"
                checked={v.remember}
                onChange={set("remember")}
              />
              <span className="check__box" aria-hidden="true" />
              Keep me signed in
            </label>
            <Link className="auth__forgot" to="/plan">
              Forgot password?
            </Link>
          </div>
        )}
      </fieldset>

      {isSignup && (
        <div className={`form__consent ${errors.consent ? "field--bad" : ""}`}>
          <label className="check">
            <input
              type="checkbox"
              checked={v.consent}
              onChange={set("consent")}
            />
            <span className="check__box" aria-hidden="true">
              <Check size={12} strokeWidth={3.2} />
            </span>
            {/* One wrapper on purpose: .check is a two-column grid, so loose
                text and links would each land in their own cell and the
                sentence would break across rows. */}
            <span>
              I agree to the <Link to="/why-buddy">terms of use</Link> and the{" "}
              <Link to="/why-buddy">privacy promise</Link>. *
            </span>
          </label>
          {errors.consent && (
            <p className="field__msg field__msg--bad">
              <AlertCircle size={13} strokeWidth={2.4} aria-hidden="true" />
              {errors.consent}
            </p>
          )}
        </div>
      )}

      {serverError && (
        <p className="form__summary form__summary--server" role="alert">
          <AlertCircle size={15} strokeWidth={2.4} aria-hidden="true" />
          {serverError}
        </p>
      )}

      {errorCount > 0 && (
        <p className="form__summary" role="alert">
          <AlertCircle size={15} strokeWidth={2.4} aria-hidden="true" />
          {errorCount} {errorCount === 1 ? "field needs" : "fields need"} fixing before
          this can go.
        </p>
      )}

      <button
        className="btn btn--solid btn--lg form__submit"
        type="submit"
        disabled={submitting}
      >
        <ActionIcon
          size={17}
          strokeWidth={2.2}
          aria-hidden="true"
          className={submitting ? "spin" : undefined}
        />
        {submitting ? "One moment…" : copy.cta}
      </button>

      <p className="auth__switch">
        {copy.switchPrompt}{" "}
        <Link to={copy.switchTo}>{copy.switchLabel}</Link>
      </p>
    </form>
  );
}
