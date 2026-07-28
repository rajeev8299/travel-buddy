const ROLES = [
  { id: "user", label: "Traveller", blurb: "I'm planning a trip and want to be matched with a local buddy." },
  { id: "client", label: "Client", blurb: "I run a hotel, travel desk or concierge and want to refer guests." },
];

const AUTH_COPY = {
  login: {
    cta: "Log in",
    switchPrompt: "New to TravelOnBuddy?",
    switchLabel: "Create an account",
    switchTo: "signup.html",
  },
  signup: {
    cta: "Create account",
    switchPrompt: "Already with us?",
    switchLabel: "Log in instead",
    switchTo: "login.html",
  },
};

const ICON_ALERT_A = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
const ICON_ALERT_B = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
const ICON_CHECK_A = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_EYE = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const ICON_EYE_OFF = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.4 18.4 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
const ICON_LOGIN = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;
const ICON_USERPLUS = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>`;
const ICON_LOADER_A = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" class="spin"><path d="M21 12a9 9 0 1 1-9-9"/></svg>`;
const ICON_PARTY_A = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.8 11.3 2 22l10.7-3.8"/><path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-4 4M2 22l4-4"/><path d="M13 4.5l6.5 6.5"/></svg>`;

function authFieldMsg(id, hint) {
  return `<p class="field__msg" id="${id}-msg" data-hint="${hint || ""}">${hint || ""}</p>`;
}

function authFormMarkup(mode) {
  const isSignup = mode === "signup";
  const copy = AUTH_COPY[mode];

  return `
    <form class="form form--auth" id="auth-form" novalidate>
      <fieldset class="form__group auth__roles" aria-label="I'm signing in as">
        <legend class="form__legend"><span>01</span> I'm a…</legend>
        <div class="auth__roles-grid" id="role-grid">
          ${ROLES.map(
            (r, i) => `
            <label class="role ${i === 0 ? "role--on" : ""}" id="role-${r.id}-label">
              <input type="radio" name="role" value="${r.id}" ${i === 0 ? "checked" : ""} id="role-${r.id}">
              <span class="role__radio" aria-hidden="true"></span>
              <span class="role__body"><strong>${r.label}</strong><span>${r.blurb}</span></span>
            </label>`,
          ).join("")}
        </div>
      </fieldset>

      <fieldset class="form__group">
        <legend class="form__legend"><span>02</span> ${isSignup ? "Your details" : "Sign in"}</legend>
        <div class="form__grid">
          ${isSignup ? `
          <div class="field" id="fullName-field">
            <label for="fullName">Full name *</label>
            <input id="fullName" type="text" autocomplete="name">
            ${authFieldMsg("fullName")}
          </div>` : ""}

          <div class="field ${isSignup ? "" : "field--full"}" id="email-field">
            <label for="email">Email *</label>
            <input id="email" type="email" autocomplete="email" placeholder="you@example.com">
            ${authFieldMsg("email")}
          </div>

          ${isSignup ? `
          <div class="field" id="phone-field">
            <label for="phone">Mobile *</label>
            <input id="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="98765 43210">
            ${authFieldMsg("phone", "10 digits, no +91")}
          </div>` : ""}

          <div class="field ${isSignup ? "" : "field--full"}" id="password-field">
            <label for="password">Password *</label>
            <div class="field__pw">
              <input id="password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}">
              <button type="button" class="field__pw-toggle" id="pw-toggle" aria-label="Show password" aria-pressed="false">${ICON_EYE}</button>
            </div>
            ${authFieldMsg("password", isSignup ? "At least 8 characters." : "")}
          </div>

          ${isSignup ? `
          <div class="field" id="confirm-field">
            <label for="confirm">Confirm password *</label>
            <input id="confirm" type="password" autocomplete="new-password">
            ${authFieldMsg("confirm")}
          </div>` : ""}

          ${isSignup ? `
          <div class="field" id="city-field" data-role="user">
            <label for="city">Home city *</label>
            <input id="city" type="text" placeholder="Bengaluru, Delhi…">
            ${authFieldMsg("city", "So we can match you with buddies near the places you travel.")}
          </div>
          <div class="field" id="company-field" data-role="client" hidden>
            <label for="company">Hotel / company *</label>
            <input id="company" type="text" placeholder="Taj, ITC, MakeMyTrip concierge…">
            ${authFieldMsg("company", "We'll reach out before activating client tools.")}
          </div>` : ""}
        </div>

        ${!isSignup ? `
        <div class="auth__extras">
          <label class="check check--inline">
            <input type="checkbox" id="remember" checked>
            <span class="check__box" aria-hidden="true">${ICON_CHECK_A}</span>
            Keep me signed in
          </label>
          <a class="auth__forgot" href="plan.html">Forgot password?</a>
        </div>` : ""}
      </fieldset>

      ${isSignup ? `
      <div class="form__consent" id="consent-field">
        <label class="check">
          <input type="checkbox" id="consent">
          <span class="check__box" aria-hidden="true">${ICON_CHECK_A}</span>
          I agree to the <a href="why-buddy.html">terms of use</a> and the <a href="why-buddy.html">privacy promise</a>. *
        </label>
        ${authFieldMsg("consent")}
      </div>` : ""}

      <p class="form__summary form__summary--server" role="alert" id="auth-server-error" hidden></p>
      <p class="form__summary" role="alert" id="auth-error-count" hidden></p>

      <button class="btn btn--solid btn--lg form__submit" type="submit" id="auth-submit">
        ${isSignup ? ICON_USERPLUS : ICON_LOGIN}<span>${copy.cta}</span>
      </button>

      <p class="auth__switch">${copy.switchPrompt} <a href="${copy.switchTo}">${copy.switchLabel}</a></p>
    </form>`;
}

function showAlreadySignedIn(container, name) {
  container.innerHTML = `
    <div class="form__done" role="status">
      <span class="form__done-icon">${ICON_PARTY_A}</span>
      <h2>You're already signed in, ${name}.</h2>
      <p>Use the menu in the top right to switch accounts, or jump straight into planning your trip.</p>
      <div class="form__done-actions">
        <a class="btn btn--solid" href="plan.html">Plan my trip</a>
      </div>
    </div>`;
}

function clearAuthFieldError(id) {
  const wrap = document.getElementById(`${id}-field`);
  const msg = document.getElementById(`${id}-msg`);
  if (wrap) wrap.classList.remove("field--bad");
  if (msg) {
    msg.classList.remove("field__msg--bad");
    msg.innerHTML = msg.dataset.hint || "";
  }
}

function showAuthFieldError(id, message) {
  const wrap = document.getElementById(`${id}-field`);
  const msg = document.getElementById(`${id}-msg`);
  if (wrap) wrap.classList.add("field--bad");
  if (msg) {
    msg.classList.add("field__msg--bad");
    msg.innerHTML = `${ICON_ALERT_A}${message}`;
  }
}

function validateAuth(mode, v) {
  const e = {};
  const isSignup = mode === "signup";

  if (!v.email.trim()) e.email = "Email is required.";
  else if (!isValidEmail(v.email)) e.email = "That email doesn't look complete.";

  if (!v.password) e.password = "Password is required.";
  else if (isSignup && v.password.length < 8) e.password = "Use at least 8 characters.";

  if (isSignup) {
    if (!v.fullName.trim()) e.fullName = "We need a name to call you by.";
    if (!v.phone.trim()) e.phone = "Phone number is required.";
    else if (!isValidPhone(v.phone)) e.phone = "Enter a 10-digit Indian mobile number.";

    if (!v.confirm) e.confirm = "Type the password once more.";
    else if (v.confirm !== v.password) e.confirm = "Passwords don't match.";

    if (v.role === "user" && !v.city.trim()) e.city = "Which city are you usually travelling from?";
    if (v.role === "client" && !v.company.trim()) e.company = "Which hotel / company are you with?";

    if (!v.consent) e.consent = "We can't create the account without this.";
  }

  return e;
}

function initAuthForm(mode) {
  const slot = document.getElementById("auth-form-slot");

  api
    .get("/auth/me")
    .then((data) => {
      if (data?.user) {
        showAlreadySignedIn(slot, data.user.name);
        return;
      }
      renderForm();
    })
    .catch(renderForm);

  function renderForm() {
    slot.innerHTML = authFormMarkup(mode);
    const isSignup = mode === "signup";
    const form = document.getElementById("auth-form");
    const submitBtn = document.getElementById("auth-submit");
    const serverErrorEl = document.getElementById("auth-server-error");
    const errorCountEl = document.getElementById("auth-error-count");

    if (isSignup) {
      document.querySelectorAll('input[name="role"]').forEach((radio) => {
        radio.addEventListener("change", () => {
          ROLES.forEach((r) => document.getElementById(`role-${r.id}-label`).classList.toggle("role--on", radio.value === r.id));
          document.getElementById("city-field").hidden = radio.value !== "user";
          document.getElementById("company-field").hidden = radio.value !== "client";
        });
      });
    }

    const pwToggle = document.getElementById("pw-toggle");
    pwToggle.addEventListener("click", () => {
      const pw = document.getElementById("password");
      const show = pw.type === "password";
      pw.type = show ? "text" : "password";
      const confirm = document.getElementById("confirm");
      if (confirm) confirm.type = show ? "text" : "password";
      pwToggle.innerHTML = show ? ICON_EYE_OFF : ICON_EYE;
      pwToggle.setAttribute("aria-pressed", String(show));
      pwToggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });

    const clearableIds = isSignup
      ? ["fullName", "email", "phone", "password", "confirm", "city", "company", "consent"]
      : ["email", "password"];
    clearableIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", () => clearAuthFieldError(id));
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      serverErrorEl.hidden = true;

      const role = document.querySelector('input[name="role"]:checked')?.value || "user";
      const v = {
        role,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        fullName: isSignup ? document.getElementById("fullName").value : "",
        phone: isSignup ? document.getElementById("phone").value : "",
        confirm: isSignup ? document.getElementById("confirm").value : "",
        city: isSignup ? document.getElementById("city").value : "",
        company: isSignup ? document.getElementById("company").value : "",
        consent: isSignup ? document.getElementById("consent").checked : true,
      };

      const errors = validateAuth(mode, v);
      const ids = Object.keys(errors);
      ids.forEach((id) => showAuthFieldError(id, errors[id]));

      if (ids.length > 0) {
        errorCountEl.hidden = false;
        errorCountEl.innerHTML = `${ICON_ALERT_B}${ids.length} ${ids.length === 1 ? "field needs" : "fields need"} fixing before this can go.`;
        const firstBad = document.querySelector(".field--bad input");
        firstBad?.focus();
        firstBad?.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      errorCountEl.hidden = true;

      submitBtn.disabled = true;
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = `${ICON_LOADER_A}<span>One moment…</span>`;

      try {
        if (isSignup) {
          await api.post("/auth/signup", v);
        } else {
          await api.post("/auth/login", { email: v.email, password: v.password });
        }
        location.href = "plan.html";
      } catch (err) {
        serverErrorEl.hidden = false;
        serverErrorEl.innerHTML = `${ICON_ALERT_B}${err.message}`;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });
  }
}
