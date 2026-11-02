"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Interest } from "@/content/types";
import { INTERESTS } from "@/lib/content";
import { track } from "@/lib/analytics";
import {
  DEFAULT_INPUT, decodePlan, encodePlan, generatePlan, loadTrips, planAsText, saveTrip, seasonNote,
  type Plan, type PlannerInput,
} from "@/lib/planner";
import { SITE_URL } from "@/lib/site";
import PlanView from "./PlanView";
import styles from "./Planner.module.css";

const ALL_INTERESTS = new Set(INTERESTS.map((i) => i.key));

export default function TripPlanner({ templates }: { templates: Record<string, Plan> }) {
  const params = useSearchParams();
  // Prefill once from the URL: ?interests=a,b · ?from=<itinerary slug> · ?trip=<saved id> · ?d=<shared plan>.
  // This component only renders in the browser (useSearchParams inside <Suspense>), so storage is available.
  const [initial] = useState(() => {
    const interests = (params.get("interests") ?? "").split(",").filter((i) => ALL_INTERESTS.has(i as Interest)) as Interest[];
    const from = params.get("from");
    const tripParam = params.get("trip");
    const shared = params.get("d");
    let loaded: Plan | null = from && templates[from] ? templates[from] : null;
    let id: string | null = null;
    if (tripParam) {
      const saved = loadTrips().find((t) => t.id === tripParam);
      if (saved) {
        loaded = saved.plan;
        id = saved.id;
      }
    }
    if (shared) loaded = decodePlan(shared) ?? loaded;
    const input = loaded?.input ?? (interests.length ? { ...DEFAULT_INPUT, interests } : DEFAULT_INPUT);
    return { input, plan: loaded, tripId: id };
  });
  const [input, setInput] = useState<PlannerInput>(initial.input);
  const [plan, setPlan] = useState<Plan | null>(initial.plan);
  const [message, setMessage] = useState("");
  const [tripId, setTripId] = useState<string | null>(initial.tripId);
  const started = useRef(false);
  const resultRef = useRef<HTMLHeadingElement>(null);
  // Bumped on "Create" so focus moves to the new plan once it has rendered.
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    if (generation) resultRef.current?.focus();
  }, [generation]);

  const set = <K extends keyof PlannerInput>(k: K, v: PlannerInput[K]) => {
    if (!started.current) {
      started.current = true;
      track("itinerary_started");
    }
    setInput((i) => ({ ...i, [k]: v }));
  };

  const toggleInterest = (key: Interest) =>
    set("interests", input.interests.includes(key) ? input.interests.filter((i) => i !== key) : [...input.interests, key]);

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const p = generatePlan(input);
    setPlan(p);
    setTripId(null);
    setMessage("");
    track("itinerary_generated", { days: input.days, pace: input.pace, seniors: input.seniors, children: input.children });
    setGeneration((g) => g + 1);
  };

  const edit = (p: Plan) => {
    setPlan(p);
    track("itinerary_edited");
  };

  const shareUrl = plan ? `${SITE_URL}/plan/trip?d=${encodePlan(plan)}` : "";

  const save = () => {
    if (!plan) return;
    const id = tripId ?? `t${Date.now().toString(36)}`;
    const name = `Varanasi, ${plan.days.length} day${plan.days.length > 1 ? "s" : ""}${plan.input.startDate ? ` from ${plan.input.startDate}` : ""}`;
    const ok = saveTrip({ id, name, savedAt: new Date().toISOString(), plan });
    setTripId(id);
    setMessage(ok ? "Saved on this device. Find it under My trips." : "Couldn't save — your browser is blocking storage. Use Share instead.");
    if (ok) {
      track("itinerary_saved");
      track("itinerary_completed", { via: "save" });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage("Link copied. Anyone with the link can view this plan.");
    } catch {
      setMessage(`Copy this link: ${shareUrl}`);
    }
    track("itinerary_shared", { via: "link" });
    track("itinerary_completed", { via: "share" });
  };

  const whatsappHref = plan
    ? `https://wa.me/?text=${encodeURIComponent(`${planAsText(plan)}\n\n${shareUrl}`)}`
    : "#";

  const enquire = () => {
    if (!plan) return;
    try {
      sessionStorage.setItem("vtc-enquiry-plan", planAsText(plan));
    } catch {
      /* the enquiry still works without the attached plan */
    }
    track("itinerary_completed", { via: "enquiry" });
  };

  const season = seasonNote(input.startDate);

  return (
    <div className={styles.planner}>
      <form className={styles.form} onSubmit={create} aria-label="Trip preferences">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="p-date">Arrival date <span className="field__hint">(optional)</span></label>
            <input id="p-date" type="date" value={input.startDate ?? ""} onChange={(e) => set("startDate", e.target.value || undefined)} />
          </div>
          <div className="field">
            <label htmlFor="p-days">Number of days</label>
            <select id="p-days" value={input.days} onChange={(e) => set("days", Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? "day" : "days"}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-travellers">Travellers</label>
            <input id="p-travellers" type="number" min={1} max={30} value={input.travellers} onChange={(e) => set("travellers", Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <div className="field">
            <label htmlFor="p-pace">Pace</label>
            <select id="p-pace" value={input.pace} onChange={(e) => set("pace", e.target.value as PlannerInput["pace"])}>
              <option value="relaxed">Relaxed — no early starts</option>
              <option value="balanced">Balanced</option>
              <option value="full">Full days</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-walk">Walking</label>
            <select id="p-walk" value={input.walking} onChange={(e) => set("walking", e.target.value as PlannerInput["walking"])}>
              <option value="low">Low — minimal steps</option>
              <option value="moderate">Moderate</option>
              <option value="high">Happy to walk a lot</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-budget">Budget</label>
            <select id="p-budget" value={input.budget} onChange={(e) => set("budget", e.target.value as PlannerInput["budget"])}>
              <option value="low">Budget</option>
              <option value="mid">Mid-range</option>
              <option value="high">Comfort</option>
            </select>
          </div>
        </div>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: "18px 0 0" }}>
          <legend>Interests</legend>
          <div className="chips">
            {INTERESTS.map((i) => (
              <label key={i.key} className="chip">
                <input type="checkbox" checked={input.interests.includes(i.key)} onChange={() => toggleInterest(i.key)} />
                <span>{i.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: "18px 0 0" }}>
          <legend>Travelling with</legend>
          <div className="chips">
            <label className="chip"><input type="checkbox" checked={input.seniors} onChange={(e) => set("seniors", e.target.checked)} /><span>Seniors</span></label>
            <label className="chip"><input type="checkbox" checked={input.children} onChange={(e) => set("children", e.target.checked)} /><span>Children</span></label>
          </div>
        </fieldset>

        <button type="submit" className="btn btn--primary" style={{ marginTop: 22 }}>{plan ? "Create a new plan" : "Create my plan"}</button>
      </form>

      <div aria-live="polite">
        {plan && (
          <div className={styles.result}>
            <h2 ref={resultRef} tabIndex={-1}>Your {plan.days.length}-day Varanasi plan</h2>
            <div className="notice notice--info" style={{ margin: "14px 0 20px" }}>
              <span aria-hidden="true">ⓘ</span>
              <div>
                <strong>A suggested plan, not live routing</strong>
                Times are suggestions and this plan doesn&apos;t know today&apos;s crowds or closures. Check{" "}
                <Link href="/travel-guide/today">Today in Varanasi</Link> before you head out.
                {season && <> {season}</>}
              </div>
            </div>

            <PlanView plan={plan} onChange={edit} />

            <div className={styles.actions}>
              <button type="button" className="btn btn--primary" onClick={save}>{tripId ? "Save changes" : "Save plan"}</button>
              <button type="button" className="btn btn--outline" onClick={copyLink}>Copy share link</button>
              <a className="btn btn--whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => track("itinerary_shared", { via: "whatsapp" })}>Send to WhatsApp</a>
              <button type="button" className="btn btn--ghost" onClick={() => window.print()}>Print</button>
            </div>
            {message && <p role="status" className={styles.message}>{message}</p>}

            <div className="cta-panel" style={{ marginTop: 28 }}>
              <h2>Want help making it happen?</h2>
              <p>Send this plan to our local team. We&apos;ll suggest changes and line up checked partners for boats, guides and transfers.</p>
              <Link className="btn btn--primary" href="/enquiry?service=assistance&context=My%20trip%20plan" onClick={enquire}>Send my plan to the team</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
