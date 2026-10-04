"use client";

import { useRef } from "react";
import type { Activity } from "@/data/activities";
import {
  conversationTopics,
  externalWords,
  hackathonLoop,
  projectSteps,
  sessionTopics,
  sessionVerbs,
} from "@/data/activities";
import { Lines } from "@/components/aura/Lines";
import { useScene, useSparkTrack } from "@/lib/motion/hooks";
import type { Helpers, SparkWaypoint } from "@/lib/motion/spark";
import { mulberry32 } from "@/lib/utils/random";

type Props = { activity: Activity; index: number };

const WIPE_FROM = "polygon(0% 0%, 0% 0%, -16% 100%, 0% 100%)";
const WIPE_TO = "polygon(0% 0%, 120% 0%, 104% 100%, 0% 100%)";

/** Waypoints that walk the spark through a list of nodes, whether the stage is pinned or flowing. */
function walkNodes(
  h: Helpers,
  scene: HTMLElement,
  stage: HTMLElement,
  nodes: HTMLElement[],
  p0: number,
  p1: number,
  extra: Partial<SparkWaypoint> = {},
): SparkWaypoint[] {
  return nodes.map((n, i) => {
    const p = p0 + ((p1 - p0) * i) / Math.max(1, nodes.length - 1);
    if (h.pinned) {
      const r = h.rel(n, stage);
      return { s: h.at(scene, p), x: (r.x + 0.04 * h.vw) / h.vw, y: (r.y + r.h * 0.5) / h.vh, ...extra };
    }
    const b = n.getBoundingClientRect();
    const top = b.top + window.scrollY;
    return { s: top - h.vh * 0.5 + b.height / 2, x: Math.min(0.9, (b.left + 18) / h.vw), y: 0.5, ...extra };
  });
}

export function ActivityScene({ activity: a, index }: Props) {
  const scene = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const flip = index % 2 === 1;

  // ---------------------------------------------------------------- scroll choreography
  useScene(scene, ({ tl, q }) => {
    // 1. title lines rise
    tl.fromTo(q(".act-title .ln-i"), { yPercent: 110, opacity: 1 }, { yPercent: 0, stagger: 0.04, duration: 0.2, ease: "power3.out" }, 0.04);
    tl.fromTo(q(".act-index, .act-meta"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.1);
    // 2. the numeral is cut open by the spark
    tl.fromTo(q("[data-fill]"), { clipPath: WIPE_FROM }, { clipPath: WIPE_TO, duration: 0.36, ease: "power2.inOut" }, 0.08);
    // 3. copy follows the spark
    tl.fromTo(q(".act-copy p"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.18, ease: "power2.out" }, 0.28);

    if (a.id === "internal-hackathons") {
      tl.fromTo(q(".act-loop li"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, stagger: 0.07, duration: 0.14, ease: "power3.out" }, 0.58);
    }
    if (a.id === "external-hackathons") {
      tl.fromTo(q(".act-words-row:nth-child(1)"), { xPercent: 6 }, { xPercent: -26, duration: 1 }, 0);
      tl.fromTo(q(".act-words-row:nth-child(2)"), { xPercent: -30 }, { xPercent: 4, duration: 1 }, 0);
      tl.fromTo(q(".act-words-row:nth-child(3)"), { xPercent: 2 }, { xPercent: -24, duration: 1 }, 0);
    }
    if (a.id === "continuous-projects") {
      tl.fromTo(q(".act-steps-line"), { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "none" }, 0.3);
      tl.fromTo(q(".act-step"), { opacity: 0.12 }, { opacity: 1, stagger: 0.1, duration: 0.1, ease: "none" }, 0.3);
    }
    if (a.id === "podcasts-panels") {
      tl.fromTo(q(".act-wave"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.24);
      tl.fromTo(q("[data-playhead]"), { left: "0%" }, { left: "100%", duration: 0.68, ease: "none" }, 0.28);
      tl.fromTo(q(".act-frag"), { opacity: 0 }, { opacity: 1, stagger: 0.05, duration: 0.1 }, 0.3);
      tl.fromTo(q(".act-frag-rail"), { xPercent: 10 }, { xPercent: -30, duration: 1 }, 0);
    }
    if (a.id === "open-learning") {
      tl.fromTo(q(".act-topics li"), { opacity: 0, x: 28 }, { opacity: 1, x: 0, stagger: 0.06, duration: 0.12, ease: "power3.out" }, 0.34);
      tl.fromTo(q(".act-verbs li"), { opacity: 0.14 }, { opacity: 1, stagger: 0.07, duration: 0.07, ease: "none" }, 0.62);
    }
  });

  // ---------------------------------------------------------------- the spark's path through this scene
  useSparkTrack(`act-${a.id}`, (h) => {
    const sc = scene.current;
    const nm = numRef.current;
    if (!sc || !nm) return [];
    const stage = sc.querySelector<HTMLElement>("[data-stage]")!;
    const at = (p: number) => h.at(sc, p);
    const mobile = !h.pinned;

    if (a.id === "internal-hackathons") {
      if (mobile) {
        return [
          { s: at(0), x: 0.1, y: 0.18, sc: 1.8, r: -64 },
          { s: at(0.4), x: 0.9, y: 0.3, sc: 1.8, r: -64 },
          { s: at(0.75), x: 0.86, y: 0.82, sc: 0.8, r: -20 },
          { s: at(1), x: 0.5, y: 0.85, sc: 0.5, r: -20 },
        ];
      }
      const r = h.rel(nm, stage);
      const yMid = (r.y + r.h * 0.52) / h.vh;
      return [
        { s: at(0), x: (r.x - 0.1 * r.w) / h.vw, y: yMid, sc: 2.5, r: -66 },
        { s: at(0.46), x: (r.x + 1.0 * r.w) / h.vw, y: yMid, sc: 2.5, r: -66 },
        { s: at(0.72), x: 0.9, y: 0.86, sc: 0.8, r: -20, bend: 0.08 },
        { s: at(1), x: 0.4, y: 0.9, sc: 0.5, r: -30, bend: -0.06 },
      ];
    }

    if (a.id === "external-hackathons") {
      if (mobile) {
        return [
          { s: at(0), x: 0.5, y: 0.9, sc: 0.5, r: -30 },
          { s: at(0.5), x: 1.05, y: 0.4, sc: 3.2, r: 10, z: "back", ol: 1, o: 0.9 },
          { s: at(1), x: 0.5, y: 0.2, sc: 1.2, r: -10, z: "front", ol: 0 },
        ];
      }
      return [
        { s: at(0), x: 0.4, y: 0.9, sc: 0.5, r: -30 },
        { s: at(0.3), x: 0.5, y: 0.5, sc: 3.6, r: -8, z: "back", ol: 1, o: 1, bend: 0.1 },
        { s: at(0.7), x: 0.62, y: 0.46, sc: 4.2, r: 6, z: "back", ol: 1, o: 1 },
        { s: at(1), x: 0.9, y: 0.2, sc: 1.4, r: -6, z: "front", ol: 0, o: 1, bend: -0.05 },
      ];
    }

    if (a.id === "continuous-projects") {
      const nodes = Array.from(sc.querySelectorAll<HTMLElement>(".act-step"));
      const walk = walkNodes(h, sc, stage, nodes, 0.32, 0.84, { sc: mobile ? 0.7 : 0.9, r: -30 });
      return [
        { s: at(0), x: mobile ? 0.8 : 0.9, y: mobile ? 0.12 : 0.2, sc: 1.4, r: -6 },
        ...walk,
        { s: at(1), x: 0.88, y: 0.9, sc: 0.6, r: -30 },
      ];
    }

    if (a.id === "podcasts-panels") {
      const wave = sc.querySelector<HTMLElement>(".act-wave");
      if (!wave) return [];
      if (mobile) {
        return [
          { s: at(0), x: 0.88, y: 0.9, sc: 0.6, r: -30 },
          { s: at(0.5), x: 0.2, y: 0.55, sc: 0.8, r: 12 },
          { s: at(1), x: 0.9, y: 0.6, sc: 0.8, r: -12 },
        ];
      }
      const r = h.rel(wave, stage);
      const yMid = (r.y + r.h * 0.42) / h.vh;
      return [
        { s: at(0), x: 0.88, y: 0.9, sc: 0.6, r: -30 },
        { s: at(0.28), x: (r.x + 0.02 * r.w) / h.vw, y: yMid, sc: 1.1, r: -18, ease: "none" },
        { s: at(0.96), x: (r.x + 0.98 * r.w) / h.vw, y: yMid, sc: 1.1, r: -18 },
        { s: at(1), x: 0.9, y: 0.82, sc: 0.8, r: -24 },
      ];
    }

    // open-learning — spark settles, then accelerates downward into Structure
    const verbs = sc.querySelector<HTMLElement>(".act-verbs");
    if (mobile) {
      return [
        { s: at(0), x: 0.9, y: 0.84, sc: 0.8, r: -24 },
        { s: at(0.6), x: 0.12, y: 0.5, sc: 0.8, r: 14 },
        { s: at(1), x: 0.5, y: 1.15, sc: 2.2, r: -88, ease: "power3.in" },
      ];
    }
    const vr = verbs ? h.rel(verbs, stage) : { x: 0.1 * h.vw, y: 0.8 * h.vh, w: 0.8 * h.vw, h: 40 };
    return [
      { s: at(0), x: 0.9, y: 0.82, sc: 0.8, r: -24 },
      { s: at(0.55), x: (vr.x - 0.02 * h.vw) / h.vw, y: (vr.y + vr.h * 0.5) / h.vh, sc: 0.7, r: 6, bend: 0.06 },
      { s: at(0.92), x: (vr.x + vr.w * 0.98) / h.vw, y: (vr.y + vr.h * 0.5) / h.vh, sc: 0.7, r: 6 },
      { s: at(1), x: 0.5, y: 0.5, sc: 2.4, r: -86, ease: "power3.in" },
    ];
  });

  return (
    <article
      ref={scene}
      id={a.id}
      className="act"
      data-act={a.id}
      data-flip={flip ? "true" : "false"}
      aria-labelledby={`${a.id}-title`}
    >
      <div data-stage className="act-stage">
        {a.id === "external-hackathons" && <WordsBackdrop />}

        <div ref={numRef} className="act-num-wrap" aria-hidden="true">
          <span className="act-num">{a.no}</span>
          <span className="act-num act-num-fill" data-fill>
            {a.no}
          </span>
        </div>

        <div className="act-body">
          <p className="act-index t-mono" data-hide>
            {a.no} / WHAT WE DO
          </p>
          <h3 id={`${a.id}-title`} className="act-title t-display">
            {a.title.map((l, i) => (
              <span key={i} className="ln">
                <span className="ln-i" data-hide>
                  {l}
                </span>
                {i < a.title.length - 1 && <span className="sr-only"> </span>}
              </span>
            ))}
          </h3>
          {a.meta && (
            <p className="act-meta t-mono" data-hide>
              <span>{a.meta.label}</span>
              <b>{a.meta.value}</b>
            </p>
          )}
          <div className="act-copy">
            {a.copy.map((p, i) => (
              <p key={i} data-hide>
                {p}
              </p>
            ))}
          </div>
        </div>

        {a.id === "internal-hackathons" && (
          <ul className="act-loop t-display" aria-label="Build, break, learn, repeat">
            {hackathonLoop.map((w) => (
              <li key={w} data-hide>
                {w}
              </li>
            ))}
          </ul>
        )}
        {a.id === "continuous-projects" && <ProjectSteps />}
        {a.id === "podcasts-panels" && <Conversation />}
        {a.id === "open-learning" && <SessionLists />}
      </div>
    </article>
  );
}

function WordsBackdrop() {
  return (
    <div className="act-words" aria-hidden="true">
      {externalWords.map((w, i) => (
        <div key={w} className="act-words-row t-display" data-i={i}>
          <span>{w}</span>
          <span>{w}</span>
          <span>{w}</span>
        </div>
      ))}
    </div>
  );
}

function ProjectSteps() {
  return (
    <ol className="act-steps" aria-label="Idea, build, test, demo, improve">
      <li className="act-steps-line" aria-hidden="true" />
      {projectSteps.map((s, i) => (
        <li key={s} className="act-step" data-hide>
          <span className="t-mono">0{i + 1}</span>
          <b className="t-display">{s}</b>
          {i < projectSteps.length - 1 && (
            <svg viewBox="0 0 12 28" className="act-step-arrow" aria-hidden="true" focusable="false">
              <path d="M6 0v24M1 19l5 7 5-7" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}
        </li>
      ))}
    </ol>
  );
}

function Conversation() {
  const rnd = mulberry32(42);
  const bars = Array.from({ length: 96 }, (_, i) => {
    const env = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.19) * Math.cos(i * 0.043 + 1));
    return { h: Math.round((0.18 + rnd() * 0.82) * env * 100), d: Math.round(rnd() * 1400) };
  });
  return (
    <div className="act-convo">
      <div className="act-frag-rail t-display" aria-hidden="true">
        {conversationTopics.concat(conversationTopics).map((t, i) => (
          <span key={i} className="act-frag" data-hide>
            {t}
          </span>
        ))}
      </div>
      <div className="act-wave" data-hide>
        <div className="act-speakers t-mono">
          <span>
            <i /> Host
          </span>
          <span>
            <i /> Guest
          </span>
          <span>
            <i /> Room
          </span>
        </div>
        <div className="act-wave-bars" aria-hidden="true">
          {bars.map((b, i) => (
            <span key={i} style={{ height: `${b.h}%`, animationDelay: `${b.d}ms` }} />
          ))}
        </div>
        <div className="act-timeline" aria-hidden="true">
          <i data-playhead />
        </div>
      </div>
    </div>
  );
}

function SessionLists() {
  return (
    <div className="act-session">
      <ul className="act-topics t-display">
        {sessionTopics.map((t) => (
          <li key={t} data-hide>
            {t}
          </li>
        ))}
      </ul>
      <ul className="act-verbs t-display" aria-label="Show, build, question, teach, experiment">
        {sessionVerbs.map((v) => (
          <li key={v} data-hide>
            {v}
          </li>
        ))}
      </ul>
    </div>
  );
}
