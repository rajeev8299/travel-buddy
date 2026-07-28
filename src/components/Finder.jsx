import { useState, useEffect, useRef, useCallback, memo } from "react";
import { MapPin, PlaneLanding, PlaneTakeoff, Users, Search } from "lucide-react";
import { CITIES } from "../data";
import { todayISO, formatDay, countNights } from "../hooks";
import { api } from "../lib/api";

/* ------------------------------------------------------- where-to combobox -- */

const WhereField = memo(function WhereField({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  /* Picking an option returns focus to the input, and the input opens the list
     on focus. Without this latch the two cancel out and the list never shuts. */
  const skipFocusOpen = useRef(false);

  const q = value.trim().toLowerCase();
  const matches = q
    ? CITIES.filter(
        (c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q),
      )
    : CITIES;

  /* click anywhere outside the field closes the list */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  /* keep the highlighted row inside the scroll area */
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const choose = useCallback(
    (city) => {
      onChange(city.name);
      setOpen(false);
      setActive(-1);

      // Only arm the latch when focus will actually move. On the Enter path the
      // input is already focused, focus() is a no-op, and a latch left armed
      // would swallow the next genuine focus instead.
      const el = inputRef.current;
      if (el && document.activeElement !== el) {
        skipFocusOpen.current = true;
        el.focus();
      }
    },
    [onChange],
  );

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + matches.length) % matches.length);
      return;
    }

    // Only swallow Enter when a row is highlighted — otherwise the form submits.
    if (e.key === "Enter" && open && active >= 0 && matches[active]) {
      e.preventDefault();
      choose(matches[active]);
    }
  };

  return (
    <div className="finder__field finder__field--where" ref={wrapRef}>
      <MapPin size={17} strokeWidth={2} aria-hidden="true" />
      <label className="finder__label" htmlFor="where-input">
        Where to
      </label>
      <input
        id="where-input"
        ref={inputRef}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls="where-listbox"
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `where-opt-${active}` : undefined}
        value={value}
        placeholder="Varanasi, Ladakh, anywhere…"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => {
          if (skipFocusOpen.current) {
            skipFocusOpen.current = false;
            return;
          }
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {open && (
        <ul className="suggest" id="where-listbox" role="listbox" ref={listRef}>
          {matches.map((c, i) => (
            <li key={c.name} id={`where-opt-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={i === active ? "is-active" : ""}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(c)}
              >
                <MapPin size={14} strokeWidth={2.2} aria-hidden="true" />
                <span className="suggest__name">{c.name}</span>
                <span className="suggest__state">{c.state}</span>
              </button>
            </li>
          ))}

          {matches.length === 0 && (
            <li className="suggest__empty">
              No match — but we probably still go there. Type it in anyway.
            </li>
          )}
        </ul>
      )}
    </div>
  );
});

/* ------------------------------------------------------------ search panel -- */

export default function Finder() {
  const [search, setSearch] = useState({ where: "", arrive: "", depart: "", who: "2 travellers" });
  const [receipt, setReceipt] = useState(null);
  const [dateError, setDateError] = useState("");

  const today = todayISO();
  const nights = countNights(search.arrive, search.depart);

  const setWhere = useCallback((where) => {
    setSearch((s) => ({ ...s, where }));
  }, []);

  const setField = useCallback(
    (key) => (e) => {
      const value = e.target.value;
      setDateError("");
      setSearch((s) => {
        const next = { ...s, [key]: value };
        // Moving arrival past the existing departure would invert the stay.
        if (key === "arrive" && next.depart && next.depart <= value) next.depart = "";
        return next;
      });
    },
    [],
  );

  const onSearch = useCallback(
    async (e) => {
      e.preventDefault();

      if (search.arrive && search.depart && search.depart <= search.arrive) {
        setDateError("Departure has to be at least one day after arrival.");
        setReceipt(null);
        return;
      }

      setDateError("");
      const where = search.where.trim() || "anywhere in India";
      const n = countNights(search.arrive, search.depart);
      const dates =
        search.arrive && search.depart
          ? `${formatDay(search.arrive)} → ${formatDay(search.depart)} (${n} ${n === 1 ? "night" : "nights"})`
          : "dates flexible";

      try {
        const data = await api.post("/plan-requests", {
          where: search.where,
          arrive: search.arrive,
          depart: search.depart,
          who: search.who,
        });
        setReceipt(
          `Got it — ${where}, ${dates}, ${search.who}. Reference ${data.reference}. ` +
            `We'll match you with a buddy and email a draft plan within 24 hours.`,
        );
      } catch {
        setReceipt(
          `Got it — ${where}, ${dates}, ${search.who}. ` +
            `We'll match you with a buddy and email a draft plan within 24 hours.`,
        );
      }
    },
    [search],
  );

  return (
    <>
      <form className="finder" onSubmit={onSearch} data-reveal style={{ "--delay": "180ms" }}>
        <WhereField value={search.where} onChange={setWhere} />

        <label className="finder__field">
          <PlaneLanding size={17} strokeWidth={2} aria-hidden="true" />
          <span className="finder__label">Arrive</span>
          <input type="date" value={search.arrive} min={today} onChange={setField("arrive")} />
        </label>

        <label className="finder__field">
          <PlaneTakeoff size={17} strokeWidth={2} aria-hidden="true" />
          <span className="finder__label">Depart</span>
          <input
            type="date"
            value={search.depart}
            min={search.arrive || today}
            onChange={setField("depart")}
          />
        </label>

        <label className="finder__field">
          <Users size={17} strokeWidth={2} aria-hidden="true" />
          <span className="finder__label">Who</span>
          <select value={search.who} onChange={setField("who")}>
            <option>Solo</option>
            <option>2 travellers</option>
            <option>3–5 travellers</option>
            <option>6+ travellers</option>
          </select>
        </label>

        <button className="finder__go" type="submit">
          <Search size={18} strokeWidth={2.4} aria-hidden="true" />
          <span>Find a buddy</span>
        </button>
      </form>

      {nights > 0 && !dateError && (
        <p className="finder__nights">
          {nights} {nights === 1 ? "night" : "nights"} · {formatDay(search.arrive)} →{" "}
          {formatDay(search.depart)}
        </p>
      )}

      {dateError && (
        <p className="receipt receipt--warn" role="alert">
          {dateError}
        </p>
      )}

      {receipt && (
        <p className="receipt" role="status">
          {receipt}
        </p>
      )}
    </>
  );
}
