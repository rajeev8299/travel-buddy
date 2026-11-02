"use client";

import Link from "next/link";
import { CATALOGUE, SLOT_LABEL, eligible, minutes, walkingSummary, type Plan, type PlanItem } from "@/lib/planner";
import styles from "./Planner.module.css";

const formatDay = (iso?: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : null;

/** Renders a plan. When `onChange` is given the plan is editable:
 *  reorder within a day, move to another day, remove, and add activities. */
export default function PlanView({ plan, onChange }: { plan: Plan; onChange?: (p: Plan) => void }) {
  const editable = Boolean(onChange);
  const used = new Set(plan.days.flatMap((d) => d.items.map((i) => i.blockId)).filter(Boolean));

  const update = (fn: (days: Plan["days"]) => Plan["days"]) =>
    onChange?.({ ...plan, days: fn(plan.days.map((d) => ({ ...d, items: [...d.items] }))) });

  const move = (dayIdx: number, idx: number, dir: -1 | 1) =>
    update((days) => {
      const items = days[dayIdx].items;
      const j = idx + dir;
      if (j < 0 || j >= items.length) return days;
      [items[idx], items[j]] = [items[j], items[idx]];
      return days;
    });

  const moveDay = (dayIdx: number, idx: number, to: number) =>
    update((days) => {
      const [item] = days[dayIdx].items.splice(idx, 1);
      days[to].items.push(item);
      return days;
    });

  const remove = (dayIdx: number, idx: number) =>
    update((days) => {
      days[dayIdx].items.splice(idx, 1);
      return days;
    });

  const add = (dayIdx: number, blockId: string) =>
    update((days) => {
      const b = CATALOGUE.find((x) => x.id === blockId);
      if (b) {
        // Insert by time of day (a sunrise ride goes before the evening, not at the end).
        const order = { dawn: 0, morning: 1, midday: 2, break: 2, afternoon: 3, evening: 4 };
        const items = days[dayIdx].items;
        const at = items.findIndex((i) => order[i.slot] > order[b.slot]);
        items.splice(at === -1 ? items.length : at, 0, {
          key: `a${Date.now().toString(36)}`, blockId: b.id, title: b.title, href: b.href, slot: b.slot,
          durationMin: b.durationMin, walking: b.walking, area: b.area, note: b.note,
        });
      }
      return days;
    });

  const addable = CATALOGUE.filter((b) => !used.has(b.id) && eligible(b, plan.input));

  return (
    <div className={styles.plan}>
      {plan.days.map((day, dayIdx) => (
        <section key={day.day} className={styles.day} aria-labelledby={`day-${day.day}`}>
          <header className={styles.dayHead}>
            <h3 id={`day-${day.day}`}>Day {day.day}{day.date ? <span> · {formatDay(day.date)}</span> : null}</h3>
            <p>{walkingSummary(day.items)}</p>
          </header>
          {day.items.length === 0 && <p className="empty">Nothing planned — add an activity below.</p>}
          <ol className={styles.items}>
            {day.items.map((item: PlanItem, idx) => (
              <li key={item.key} className={item.slot === "break" ? `${styles.item} ${styles.break}` : styles.item}>
                <div className={styles.when}>{item.slot === "break" ? "Break" : SLOT_LABEL[item.slot]}</div>
                <div className={styles.what}>
                  <strong>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</strong>
                  <span className={styles.meta}>
                    About {minutes(item.durationMin)}
                    {item.slot !== "break" && <> · {item.walking} walking</>}
                    {item.area && <> · {item.area}</>}
                  </span>
                  {item.note && <span className={styles.note}>{item.note}</span>}
                </div>
                {editable && (
                  <div className={styles.controls}>
                    <button type="button" onClick={() => move(dayIdx, idx, -1)} disabled={idx === 0} aria-label={`Move ${item.title} earlier`}>↑</button>
                    <button type="button" onClick={() => move(dayIdx, idx, 1)} disabled={idx === day.items.length - 1} aria-label={`Move ${item.title} later`}>↓</button>
                    {plan.days.length > 1 && (
                      <select aria-label={`Move ${item.title} to another day`} value="" onChange={(e) => e.target.value && moveDay(dayIdx, idx, Number(e.target.value))}>
                        <option value="">Day…</option>
                        {plan.days.map((d, i) => i !== dayIdx && <option key={d.day} value={i}>Day {d.day}</option>)}
                      </select>
                    )}
                    <button type="button" onClick={() => remove(dayIdx, idx)} aria-label={`Remove ${item.title}`}>✕</button>
                  </div>
                )}
              </li>
            ))}
          </ol>
          {editable && addable.length > 0 && (
            <div className={styles.add}>
              <label htmlFor={`add-${day.day}`}>Add to day {day.day}</label>
              <select id={`add-${day.day}`} value="" onChange={(e) => e.target.value && add(dayIdx, e.target.value)}>
                <option value="">Choose an activity…</option>
                {addable.map((b) => <option key={b.id} value={b.id}>{SLOT_LABEL[b.slot]} — {b.title}</option>)}
              </select>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
