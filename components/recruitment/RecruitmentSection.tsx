"use client";

import { useRef } from "react";
import { recruitPaths } from "@/data/recruitment";
import { Lines } from "@/components/aura/Lines";
import { useScene, useSparkTrack } from "@/lib/motion/hooks";
import { RecruitmentPath } from "./RecruitmentPath";
import { ApplyCTA } from "./ApplyCTA";

/* ------------------------------------------------------------------ DON'T JUST JOIN A CLUB. */
function JoinStatement() {
  const scene = useRef<HTMLDivElement>(null);

  useScene(scene, ({ tl, q }) => {
    tl.fromTo(q(".join-a .ln-i"), { yPercent: 110, opacity: 1 }, { yPercent: 0, stagger: 0.06, duration: 0.2, ease: "power4.out" }, 0.1);
    tl.to(q(".join-a"), { opacity: 0.14, duration: 0.16, ease: "power1.inOut" }, 0.48);
    tl.fromTo(q(".join-b .ln-i"), { yPercent: 110, opacity: 1 }, { yPercent: 0, stagger: 0.06, duration: 0.22, ease: "power4.out" }, 0.5);
    tl.fromTo(q(".join-tag"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.82);
  });

  useSparkTrack("join", (h) => {
    const s = scene.current;
    if (!s) return [];
    const m = !h.pinned;
    return [
      { s: h.at(s, 0), x: 0.5, y: 0.6, sc: m ? 0.9 : 1.1, r: -12, z: "front", ol: 0 },
      { s: h.at(s, 0.45), x: m ? 0.8 : 0.78, y: m ? 0.78 : 0.7, sc: m ? 0.6 : 0.75, r: -16, bend: 0.05 },
      { s: h.at(s, 0.8), x: m ? 0.14 : 0.14, y: m ? 0.78 : 0.74, sc: m ? 0.4 : 0.5, r: -16, bend: -0.04 },
      { s: h.at(s, 1), x: m ? 0.1 : 0.12, y: 0.5, sc: m ? 0.5 : 0.55, r: -16 },
    ];
  });

  return (
    <div ref={scene} className="scene join">
      <div data-stage className="stage">
        <h2 className="join-title t-display">
          <Lines as="span" className="join-a" lines={["DON'T JUST", "JOIN A CLUB."]} />
          <Lines as="span" className="join-b" lines={["JOIN WHAT", "WE'RE BUILDING."]} />
        </h2>
        <p className="join-tag t-mono" data-hide>
          04 / AURA RECRUITMENT
        </p>
      </div>
    </div>
  );
}

export function RecruitmentSection() {
  const head = useRef<HTMLDivElement>(null);

  useScene(
    head,
    ({ tl, q }) => {
      tl.fromTo(q(".ln-i"), { yPercent: 110, opacity: 1 }, { yPercent: 0, stagger: 0.08, duration: 0.3, ease: "power4.out" }, 0);
      tl.fromTo(q(".rec-sub"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.25);
    },
    { flow: true, in: 0.85, out: 0.4 },
  );

  return (
    <section id="recruitment" data-section="04 / RECRUITMENT" aria-label="Recruitment">
      <JoinStatement />

      <div ref={head} className="rec-head">
        <h2 className="rec-title t-display">
          <Lines lines={["AURA", "RECRUITMENT"]} />
        </h2>
        <p className="rec-sub" data-hide>
          Three teams, three ways in. Here is exactly what happens after you apply.
        </p>
      </div>

      <div className="rec-paths">
        {recruitPaths.map((p, i) => (
          <RecruitmentPath key={p.id} path={p} index={i} />
        ))}
      </div>

      <ApplyCTA />
    </section>
  );
}
