const BF_CITIES = [
  "Varanasi", "Jaipur", "Udaipur", "Jaisalmer", "Pushkar", "Agra", "Rishikesh", "Amritsar",
  "Leh–Ladakh", "Spiti Valley", "Darjeeling", "Shillong", "Cherrapunji", "Kaziranga", "Alleppey",
  "Munnar", "Kochi", "Hampi", "Coorg", "Mysore", "Pondicherry", "South Goa", "Khajuraho", "Andaman Islands",
];

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

const ICON_CHECK = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_ALERT = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
const ICON_SEND = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
const ICON_LOADER = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" class="spin"><path d="M21 12a9 9 0 1 1-9-9"/></svg>`;
const ICON_PARTY = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.8 11.3 2 22l10.7-3.8"/><path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-4 4M2 22l4-4"/><path d="M13 4.5l6.5 6.5"/></svg>`;

function field({ id, label, hint, full, inputHTML }) {
  return `
    <div class="field ${full ? "field--full" : ""}" id="${id}-field">
      <label for="${id}">${label}</label>
      ${inputHTML}
      <p class="field__msg" id="${id}-msg" data-hint="${hint || ""}">${hint || ""}</p>
    </div>`;
}

function checkGrid(name, legend, options, hint) {
  return `
    <fieldset class="checks" id="${name}-fieldset">
      <legend>${legend}</legend>
      ${hint ? `<p class="checks__hint">${hint}</p>` : ""}
      <div class="checks__grid">
        ${options
          .map(
            (opt, i) => `
          <label class="check">
            <input type="checkbox" name="${name}" value="${opt}" id="${name}-${i}">
            <span class="check__box" aria-hidden="true">${ICON_CHECK}</span>
            ${opt}
          </label>`,
          )
          .join("")}
      </div>
      <p class="field__msg" id="${name}-msg" data-hint=""></p>
    </fieldset>`;
}

function formMarkup() {
  return `
    <form class="form" id="buddy-form" novalidate>
      <fieldset class="form__group">
        <legend class="form__legend"><span>01</span> About you</legend>
        <div class="form__grid">
          ${field({ id: "fullName", label: "Full name *", inputHTML: `<input id="fullName" type="text" autocomplete="name">` })}
          ${field({ id: "dob", label: "Date of birth *", hint: "You must be 18 or older.", inputHTML: `<input id="dob" type="date" max="${todayISO()}">` })}
          ${field({ id: "gender", label: "Gender", inputHTML: `<select id="gender"><option value="">Prefer not to say</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Self-describe</option></select>` })}
          ${field({ id: "occupation", label: "Current occupation", inputHTML: `<input id="occupation" type="text" placeholder="Teacher, shopkeeper, student…">` })}
          ${field({ id: "email", label: "Email *", inputHTML: `<input id="email" type="email" autocomplete="email" placeholder="you@example.com">` })}
          ${field({ id: "phone", label: "Mobile *", hint: "10 digits, no +91", inputHTML: `<input id="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="98765 43210">` })}
          ${field({ id: "whatsapp", label: "WhatsApp", hint: "Only if different from your mobile", inputHTML: `<input id="whatsapp" type="tel" inputmode="numeric" placeholder="Optional">` })}
        </div>
      </fieldset>

      <fieldset class="form__group">
        <legend class="form__legend"><span>02</span> Where you'd guide</legend>
        <div class="form__grid">
          ${field({ id: "city", label: "Town or city *", inputHTML: `<input id="city" type="text" list="city-options" placeholder="Varanasi, Shillong…"><datalist id="city-options">${BF_CITIES.map((c) => `<option value="${c}">`).join("")}</datalist>` })}
          ${field({ id: "state", label: "State *", inputHTML: `<input id="state" type="text">` })}
          ${field({ id: "yearsInCity", label: "Years lived there *", hint: "Visiting often doesn't count — we mean lived.", inputHTML: `<input id="yearsInCity" type="number" min="0" max="90">` })}
          ${field({ id: "vehicle", label: "Do you have a vehicle?", inputHTML: `<select id="vehicle"><option value="">No</option><option>Two-wheeler</option><option>Car</option><option>Both</option></select>` })}
          ${field({ id: "areas", label: "Which parts do you know best?", full: true, hint: "Neighbourhoods, ghats, trails, markets — whatever you'd actually take someone to.", inputHTML: `<textarea id="areas" rows="3"></textarea>` })}
        </div>
      </fieldset>

      <fieldset class="form__group">
        <legend class="form__legend"><span>03</span> Languages</legend>
        ${checkGrid("languages", "Which can you hold a conversation in? *", LANGUAGES, "Tick everything you're comfortable guiding in, not just what you can read.")}
        <div class="form__grid">
          ${field({ id: "otherLanguage", label: "Any others", full: true, inputHTML: `<input id="otherLanguage" type="text" placeholder="Tulu, Mizo, French…">` })}
        </div>
      </fieldset>

      <fieldset class="form__group">
        <legend class="form__legend"><span>04</span> Experience &amp; availability</legend>
        <div class="form__grid">
          ${field({ id: "guidingYears", label: "Years of guiding experience *", inputHTML: `<select id="guidingYears"><option value="">Choose…</option><option>None yet</option><option>Under 1 year</option><option>1–3 years</option><option>3–5 years</option><option>5–10 years</option><option>10+ years</option></select>` })}
          ${field({ id: "daysPerWeek", label: "Days a week you're free *", inputHTML: `<select id="daysPerWeek"><option value="">Choose…</option><option>1–2 days</option><option>3–4 days</option><option>5–6 days</option><option>Every day</option><option>Weekends only</option></select>` })}
          ${field({ id: "noticeDays", label: "Notice you need", inputHTML: `<select id="noticeDays"><option value="">Same day is fine</option><option>1–2 days</option><option>3–7 days</option><option>More than a week</option></select>` })}
          <div class="field" id="firstAid-field">
            <label for="firstAid">First-aid trained?</label>
            <label class="check check--inline">
              <input type="checkbox" id="firstAid">
              <span class="check__box" aria-hidden="true">${ICON_CHECK}</span>
              Yes, I hold a current certificate
            </label>
            <p class="field__msg"></p>
          </div>
        </div>
        ${checkGrid("specialities", "What are you best at?", SPECIALITIES)}
        ${checkGrid("groupSizes", "Group sizes you're happy with", GROUP_SIZES)}
      </fieldset>

      <fieldset class="form__group">
        <legend class="form__legend"><span>05</span> Verification</legend>
        <p class="form__note">Every buddy is ID-checked and reference-checked before their first trip. We only use these to verify you — they're never shown to travellers.</p>
        <div class="form__grid">
          ${field({ id: "idType", label: "ID document *", inputHTML: `<select id="idType"><option value="">Choose…</option><option>Aadhaar</option><option>Passport</option><option>Driving licence</option><option>Voter ID</option><option>PAN card</option></select>` })}
          ${field({ id: "idNumber", label: "ID number *", inputHTML: `<input id="idNumber" type="text" autocomplete="off">` })}
          ${field({ id: "ref1Name", label: "Reference 1 — name *", inputHTML: `<input id="ref1Name" type="text">` })}
          ${field({ id: "ref1Phone", label: "Reference 1 — phone *", inputHTML: `<input id="ref1Phone" type="tel" inputmode="numeric">` })}
          ${field({ id: "ref2Name", label: "Reference 2 — name", inputHTML: `<input id="ref2Name" type="text">` })}
          ${field({ id: "ref2Phone", label: "Reference 2 — phone", inputHTML: `<input id="ref2Phone" type="tel" inputmode="numeric">` })}
        </div>
      </fieldset>

      <fieldset class="form__group">
        <legend class="form__legend"><span>06</span> In your own words</legend>
        <div class="form__grid">
          ${field({ id: "whyJoin", label: "Why do you want to do this? *", full: true, hint: "No right answer. We're reading for honesty, not polish.", inputHTML: `<textarea id="whyJoin" rows="4"></textarea>` })}
          ${field({ id: "showThem", label: "Someone lands tomorrow with one free day. Where do you take them? *", full: true, hint: "This is the question we actually judge applications on.", inputHTML: `<textarea id="showThem" rows="5"></textarea>` })}
        </div>
      </fieldset>

      <div class="form__consent" id="consent-field">
        <label class="check">
          <input type="checkbox" id="consent">
          <span class="check__box" aria-hidden="true">${ICON_CHECK}</span>
          I confirm the details above are true, and I agree to an ID check and reference calls as part of the application. *
        </label>
        <p class="field__msg" id="consent-msg"></p>
      </div>

      <p class="form__summary form__summary--server" role="alert" id="bf-server-error" hidden></p>
      <p class="form__summary" role="alert" id="bf-error-count" hidden></p>

      <button class="btn btn--solid btn--lg form__submit" type="submit" id="bf-submit">
        ${ICON_SEND}<span>Send application</span>
      </button>
    </form>`;
}

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

function checkedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
}

function readForm() {
  const g = (id) => document.getElementById(id).value;
  return {
    fullName: g("fullName"), dob: g("dob"), gender: g("gender"),
    email: g("email"), phone: g("phone"), whatsapp: g("whatsapp"),
    city: g("city"), state: g("state"), yearsInCity: g("yearsInCity"), areas: g("areas"),
    languages: checkedValues("languages"), otherLanguage: g("otherLanguage"),
    guidingYears: g("guidingYears"), specialities: checkedValues("specialities"), occupation: g("occupation"),
    daysPerWeek: g("daysPerWeek"), groupSizes: checkedValues("groupSizes"), noticeDays: g("noticeDays"),
    vehicle: g("vehicle"), firstAid: document.getElementById("firstAid").checked,
    idType: g("idType"), idNumber: g("idNumber"),
    ref1Name: g("ref1Name"), ref1Phone: g("ref1Phone"), ref2Name: g("ref2Name"), ref2Phone: g("ref2Phone"),
    whyJoin: g("whyJoin"), showThem: g("showThem"),
    consent: document.getElementById("consent").checked,
  };
}

function validateBuddyForm(v) {
  const e = {};
  const phoneOK = (s) => isValidPhone(s || "");

  if (!v.fullName.trim()) e.fullName = "We need a name to call you by.";

  const age = ageFrom(v.dob);
  if (!v.dob) e.dob = "Date of birth is required.";
  else if (age === null) e.dob = "That date doesn't look right.";
  else if (age < 18) e.dob = "Buddies have to be 18 or older.";
  else if (age > 90) e.dob = "Please check the year.";

  if (!v.email.trim()) e.email = "Email is required.";
  else if (!isValidEmail(v.email)) e.email = "That email doesn't look complete.";

  if (!v.phone.trim()) e.phone = "Phone number is required.";
  else if (!phoneOK(v.phone)) e.phone = "Enter a 10-digit Indian mobile number.";

  if (v.whatsapp.trim() && !phoneOK(v.whatsapp)) e.whatsapp = "Enter a 10-digit number, or leave it blank.";

  if (!v.city.trim()) e.city = "Which town would you be guiding in?";
  if (!v.state.trim()) e.state = "State is required.";
  if (v.yearsInCity === "") e.yearsInCity = "Roughly how long have you lived there?";
  else if (Number(v.yearsInCity) < 0) e.yearsInCity = "That can't be negative.";

  if (v.languages.length === 0 && !v.otherLanguage.trim()) e.languages = "Pick at least one language.";

  if (!v.guidingYears) e.guidingYears = "Choose one — 'none yet' is a fine answer.";
  if (!v.daysPerWeek) e.daysPerWeek = "How many days a week suits you?";

  if (!v.idType) e.idType = "Pick an ID type.";
  if (!v.idNumber.trim()) e.idNumber = "ID number is required for verification.";

  if (!v.ref1Name.trim()) e.ref1Name = "One reference is the minimum.";
  if (!v.ref1Phone.trim()) e.ref1Phone = "We need a number we can call.";
  else if (!phoneOK(v.ref1Phone)) e.ref1Phone = "Enter a 10-digit mobile number.";
  if (v.ref2Phone.trim() && !phoneOK(v.ref2Phone)) e.ref2Phone = "Enter a 10-digit number, or leave it blank.";

  if (v.whyJoin.trim().length < 30) e.whyJoin = "A few sentences, please — at least 30 characters.";
  if (v.showThem.trim().length < 30) e.showThem = "This is the part we actually read. At least 30 characters.";

  if (!v.consent) e.consent = "We can't process the application without this.";

  return e;
}

function clearFieldError(id) {
  const wrap = document.getElementById(`${id}-field`) || document.getElementById(`${id}-fieldset`);
  const msg = document.getElementById(`${id}-msg`);
  if (wrap) wrap.classList.remove("field--bad");
  if (msg) {
    msg.classList.remove("field__msg--bad");
    msg.innerHTML = msg.dataset.hint || "";
  }
}

function showFieldError(id, message) {
  const wrap = document.getElementById(`${id}-field`) || document.getElementById(`${id}-fieldset`);
  const msg = document.getElementById(`${id}-msg`);
  if (wrap) wrap.classList.add("field--bad");
  if (msg) {
    msg.classList.add("field__msg--bad");
    msg.innerHTML = `${ICON_ALERT}${message}`;
  }
}

function showDone(done) {
  const container = document.getElementById("buddy-form-slot");
  container.innerHTML = `
    <div class="form__done" role="status">
      <span class="form__done-icon">${ICON_PARTY}</span>
      <h2>Thanks, ${done.name} — that's in.</h2>
      <p>
        Your reference is <strong>${done.ref}</strong>. We've noted <strong>${done.email}</strong> and
        someone from the buddy team will reply within three working days. If your town is one we're
        actively hiring in, expect a video call invite in the same email.
      </p>
      <button type="button" class="btn btn--outline" id="bf-again">Submit another application</button>
    </div>`;
  document.getElementById("bf-again").addEventListener("click", initBuddyForm);
  container.scrollIntoView({ block: "center", behavior: "smooth" });
}

function initBuddyForm() {
  const slot = document.getElementById("buddy-form-slot");
  slot.innerHTML = formMarkup();

  const form = document.getElementById("buddy-form");
  const submitBtn = document.getElementById("bf-submit");
  const serverErrorEl = document.getElementById("bf-server-error");
  const errorCountEl = document.getElementById("bf-error-count");

  ["fullName", "dob", "email", "phone", "whatsapp", "city", "state", "yearsInCity", "guidingYears",
    "daysPerWeek", "idType", "idNumber", "ref1Name", "ref1Phone", "ref2Phone", "whyJoin", "showThem", "consent"]
    .forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener("input", () => clearFieldError(id));
      el.addEventListener("change", () => clearFieldError(id));
    });
  ["languages", "specialities", "groupSizes"].forEach((name) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((el) =>
      el.addEventListener("change", () => clearFieldError(name)),
    );
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    serverErrorEl.hidden = true;
    const v = readForm();
    const errors = validateBuddyForm(v);
    const ids = Object.keys(errors);

    ids.forEach((id) => showFieldError(id, errors[id]));

    if (ids.length > 0) {
      errorCountEl.hidden = false;
      errorCountEl.innerHTML = `${ICON_ALERT}${ids.length} ${ids.length === 1 ? "field needs" : "fields need"} fixing before this can go.`;
      const firstBad = document.querySelector(".field--bad input, .field--bad select, .field--bad textarea");
      firstBad?.focus();
      firstBad?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    errorCountEl.hidden = true;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `${ICON_LOADER}<span>Sending…</span>`;
    try {
      const data = await api.post("/buddy-applications", v);
      showDone({ ref: data.reference, name: data.name, email: data.email });
    } catch (err) {
      serverErrorEl.hidden = false;
      serverErrorEl.innerHTML = `${ICON_ALERT}${err.message}`;
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${ICON_SEND}<span>Send application</span>`;
    }
  });
}

document.addEventListener("DOMContentLoaded", initBuddyForm);
