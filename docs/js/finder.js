// The "Where to / Arrive / Depart / Who" search widget shared by the
// homepage and the Plan page. Renders into any element with id="finder-slot".

const CITIES = [
  { name: "Varanasi", state: "Anywhere in the city" },
  { name: "Dashashwamedh Ghat", state: "Ganga Aarti" },
  { name: "Assi Ghat", state: "Southern ghats" },
  { name: "Manikarnika Ghat", state: "Northern ghats" },
  { name: "Kashi Vishwanath", state: "Old city" },
  { name: "Godowlia & Chowk", state: "Old-city bazaars" },
  { name: "Madanpura", state: "Silk weavers" },
  { name: "Sarnath", state: "Day trip, 10 km" },
  { name: "Ramnagar Fort", state: "Across the river" },
  { name: "BHU & Lanka", state: "University area" },
];

const ICON_MAPPIN = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const ICON_LANDING = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 20h20"/><path d="M4 18l6.5-2 8-7.5c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0L8 13l-4-1"/></svg>`;
const ICON_TAKEOFF = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 20h20"/><path d="M17.8 11.2 21 8c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-3.2 3.2-7-2-2 1 5 4-3 3-3-1-1.5 1.5L8 16l3.5 3.5L13 18l-1-3 3-3 4 5 1-2-2-6.8Z"/></svg>`;
const ICON_USERS = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const ICON_CONTACT_USER = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const ICON_CONTACT_MAIL = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>`;
const ICON_CONTACT_PHONE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>`;
const ICON_CONTACT_SEND = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
const ICON_SEARCH = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

function finderMarkup() {
  return `
    <form class="finder" id="finder-form" data-reveal style="--delay:180ms">
      <div class="finder__field finder__field--where" id="where-wrap">
        ${ICON_MAPPIN}
        <label class="finder__label" for="where-input">Where to</label>
        <input id="where-input" type="text" role="combobox" autocomplete="off" aria-expanded="false"
          aria-autocomplete="list" placeholder="Ghats, old city, Sarnath…" />
      </div>

      <label class="finder__field">
        ${ICON_LANDING}
        <span class="finder__label">Arrive</span>
        <input type="date" id="arrive-input" />
      </label>

      <label class="finder__field">
        ${ICON_TAKEOFF}
        <span class="finder__label">Depart</span>
        <input type="date" id="depart-input" />
      </label>

      <label class="finder__field">
        ${ICON_USERS}
        <span class="finder__label">Who</span>
        <select id="who-input">
          <option>Solo</option>
          <option selected>2 travellers</option>
          <option>3–5 travellers</option>
          <option>6+ travellers</option>
        </select>
      </label>

      <button class="finder__go" type="submit">
        ${ICON_SEARCH}
        <span>Find a buddy</span>
      </button>
    </form>
    <p class="finder__nights" id="finder-nights" hidden></p>
    <p class="finder__ask" id="finder-ask" hidden>Last step — where should your buddy send the plan?</p>
    <form class="finder finder--contact" id="finder-contact" novalidate hidden>
      <label class="finder__field">
        ${ICON_CONTACT_USER}
        <span class="finder__label">Your name</span>
        <input type="text" id="contact-name" autocomplete="name" maxlength="120" placeholder="Full name" />
      </label>

      <label class="finder__field">
        ${ICON_CONTACT_MAIL}
        <span class="finder__label">Email</span>
        <input type="email" id="contact-email" autocomplete="email" maxlength="200" placeholder="you@example.com" />
      </label>

      <label class="finder__field">
        ${ICON_CONTACT_PHONE}
        <span class="finder__label">Or phone</span>
        <input type="tel" id="contact-phone" autocomplete="tel" maxlength="20" placeholder="10-digit mobile" />
      </label>

      <button class="finder__go" type="submit" id="contact-send">
        ${ICON_CONTACT_SEND}
        <span>Send</span>
      </button>
    </form>
    <p class="receipt" id="finder-receipt" role="status" hidden></p>
    <p class="receipt receipt--warn" id="finder-error" role="alert" hidden></p>`;
}

function initFinder() {
  let slot = document.getElementById("finder-slot");
  if (!slot) {
    slot = document.getElementById("pagehead-custom-slot");
  }
  if (!slot) return;
  slot.innerHTML = finderMarkup();

  const whereWrap = document.getElementById("where-wrap");
  const whereInput = document.getElementById("where-input");
  // Arriving from an experience page (plan.html?experience=<slug>): prefill
  // its area and send the experience along with the request.
  let interest = "";
  const experienceSlug = new URLSearchParams(location.search).get("experience");
  if (experienceSlug) {
    fetch("experiences.json")
      .then((r) => r.json())
      .then((list) => {
        const x = list.find((e) => e.slug === experienceSlug);
        if (!x) return;
        interest = x.name;
        if (!whereInput.value) whereInput.value = x.area;
      })
      .catch(() => {});
  }
  const arriveInput = document.getElementById("arrive-input");
  const departInput = document.getElementById("depart-input");
  const whoInput = document.getElementById("who-input");
  const form = document.getElementById("finder-form");
  const nightsEl = document.getElementById("finder-nights");
  const receiptEl = document.getElementById("finder-receipt");
  const errorEl = document.getElementById("finder-error");
  const askEl = document.getElementById("finder-ask");
  const contactForm = document.getElementById("finder-contact");
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");
  const sendBtn = document.getElementById("contact-send");

  const today = todayISO();
  arriveInput.min = today;

  let suggestList = null;
  let active = -1;

  function closeSuggest() {
    if (suggestList) {
      suggestList.remove();
      suggestList = null;
    }
    whereInput.setAttribute("aria-expanded", "false");
    active = -1;
  }

  function matches() {
    const q = whereInput.value.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
  }

  function renderSuggest() {
    if (suggestList) suggestList.remove();
    const list = matches();

    suggestList = document.createElement("ul");
    suggestList.className = "suggest";
    suggestList.id = "where-listbox";
    suggestList.setAttribute("role", "listbox");

    if (list.length === 0) {
      suggestList.innerHTML = `<li class="suggest__empty">No match — but we probably still go there. Type it in anyway.</li>`;
    } else {
      list.forEach((c, i) => {
        const li = document.createElement("li");
        li.setAttribute("role", "option");
        li.innerHTML = `<button type="button" class="${i === active ? "is-active" : ""}">${ICON_MAPPIN}<span class="suggest__name">${c.name}</span><span class="suggest__state">${c.state}</span></button>`;
        li.querySelector("button").addEventListener("mouseenter", () => {
          active = i;
          renderSuggest();
        });
        li.querySelector("button").addEventListener("click", () => choose(c));
        suggestList.appendChild(li);
      });
    }

    whereWrap.appendChild(suggestList);
    whereInput.setAttribute("aria-expanded", "true");
    whereInput.setAttribute("aria-controls", "where-listbox");
  }

  function choose(city) {
    whereInput.value = city.name;
    closeSuggest();
  }

  whereInput.addEventListener("input", () => {
    active = -1;
    renderSuggest();
  });

  whereInput.addEventListener("focus", renderSuggest);

  whereInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSuggest();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!suggestList) {
        renderSuggest();
        return;
      }
      const list = matches();
      const step = e.key === "ArrowDown" ? 1 : -1;
      active = (active + step + list.length) % list.length;
      renderSuggest();
      return;
    }
    if (e.key === "Enter" && suggestList && active >= 0) {
      const list = matches();
      if (list[active]) {
        e.preventDefault();
        choose(list[active]);
      }
    }
  });

  document.addEventListener("pointerdown", (e) => {
    if (suggestList && !whereWrap.contains(e.target)) closeSuggest();
  });

  function updateNights() {
    const n = countNights(arriveInput.value, departInput.value);
    if (n > 0 && arriveInput.value && departInput.value) {
      nightsEl.hidden = false;
      nightsEl.textContent = `${n} ${n === 1 ? "night" : "nights"} · ${formatDay(arriveInput.value)} → ${formatDay(departInput.value)}`;
    } else {
      nightsEl.hidden = true;
    }
  }

  arriveInput.addEventListener("change", () => {
    departInput.min = arriveInput.value || today;
    if (departInput.value && departInput.value <= arriveInput.value) departInput.value = "";
    errorEl.hidden = true;
    updateNights();
  });

  departInput.addEventListener("change", () => {
    errorEl.hidden = true;
    updateNights();
  });

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    receiptEl.hidden = true;
  }

  function datesInvalid() {
    return arriveInput.value && departInput.value && departInput.value <= arriveInput.value;
  }

  // Step 1: the search itself. The API can't do anything with a trip request
  // it can't reply to, so this only asks for contact details next.
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (datesInvalid()) {
      showError("Departure has to be at least one day after arrival.");
      return;
    }
    errorEl.hidden = true;
    receiptEl.hidden = true;
    askEl.hidden = false;
    contactForm.hidden = false;
    nameInput.focus();
  });

  // Step 2: send the search plus contact details as one plan request.
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (datesInvalid()) {
      showError("Departure has to be at least one day after arrival.");
      return;
    }

    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    if (!fullName) return showError("Tell us your name so your buddy knows who they're meeting.");
    if (!email && !phone) return showError("Add an email or a phone number so we can send your plan.");
    if (email && !isValidEmail(email)) return showError("That email doesn't look complete.");
    if (phone && !isValidPhone(phone)) return showError("Enter a 10-digit Indian mobile number.");
    errorEl.hidden = true;

    const arrive = arriveInput.value;
    const depart = departInput.value;
    const where = whereInput.value.trim() || "anywhere in Varanasi";
    const who = whoInput.value;
    const n = countNights(arrive, depart);
    const dates = arrive && depart ? `${formatDay(arrive)} → ${formatDay(depart)} (${n} ${n === 1 ? "night" : "nights"})` : "dates flexible";

    sendBtn.disabled = true;
    try {
      const data = await api.post("/plan-requests", {
        where,
        arrive,
        depart,
        who,
        fullName,
        email,
        phone: phone.replace(/[\s-]/g, ""),
        specialRequests: interest ? `Interested in: ${interest}` : "",
      });
      receiptEl.textContent = `Got it — ${where}, ${dates}, ${who}. Reference ${data.reference}. We'll match you with a buddy and send a draft plan to ${email || phone} within 24 hours.`;
      receiptEl.hidden = false;
      askEl.hidden = true;
      contactForm.hidden = true;
      contactForm.reset();
    } catch (err) {
      showError(err.message);
    } finally {
      sendBtn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", initFinder);
