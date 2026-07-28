import { useState, useEffect, useRef, useCallback } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useReveal } from "../hooks";
import { STORIES as STATIC_STORIES, asset } from "../data";
import { api } from "../lib/api";

export default function Stories() {
  const [stories, setStories] = useState(STATIC_STORIES);
  const [story, setStory] = useState(0);
  const timer = useRef(null);
  const pageRef = useReveal();

  useEffect(() => {
    api
      .get("/stories")
      .then((data) => {
        if (data?.stories?.length) setStories(data.stories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setStory((s) => (s + 1) % stories.length);
    }, 7000);
    return () => window.clearInterval(timer.current);
  }, [stories.length]);

  const pause = useCallback(() => window.clearInterval(timer.current), []);

  const go = useCallback(
    (step) => {
      window.clearInterval(timer.current);
      setStory((s) => (s + step + stories.length) % stories.length);
    },
    [stories.length],
  );

  return (
    <div ref={pageRef}>
      <PageHeader
        eyebrow="Stories"
        title="Trips that went sideways and got better for it"
        intro="Told by the travellers they happened to. We don't edit out the parts where the plan fell apart — those are usually the point."
        image={asset("img/alleppey.jpg")}
        pos="center 48%"
      />

      <section className="section section--dark">
        <div className="shell stories" onMouseEnter={pause}>
          <Quote className="stories__mark" size={56} strokeWidth={1.4} aria-hidden="true" />

          <blockquote key={story} className="stories__quote">
            <p>{stories[story].quote}</p>
            <footer>
              <strong>{stories[story].name}</strong>
              <span>{stories[story].trip}</span>
            </footer>
          </blockquote>

          <div className="stories__nav">
            <button type="button" onClick={() => go(-1)} aria-label="Previous story">
              <ChevronLeft size={18} strokeWidth={2.4} />
            </button>
            <span className="stories__dots">
              {stories.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  className={i === story ? "on" : ""}
                  onClick={() => {
                    pause();
                    setStory(i);
                  }}
                  aria-label={`Story ${i + 1}`}
                  aria-current={i === story}
                />
              ))}
            </span>
            <button type="button" onClick={() => go(1)} aria-label="Next story">
              <ChevronRight size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <header className="section__head" data-reveal>
            <div>
              <p className="eyebrow eyebrow--dark">All of them</p>
              <h2>Every story, in full</h2>
            </div>
          </header>

          <div className="grid grid--features">
            {stories.map((s, i) => (
              <article className="feature" key={s.name} data-reveal style={{ "--delay": `${i * 70}ms` }}>
                <span className="feature__icon">
                  <Quote size={20} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <p>{s.quote}</p>
                <p className="story__by">
                  <strong>{s.name}</strong> · {s.trip}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
