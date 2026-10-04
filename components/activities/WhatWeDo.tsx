"use client";

import { useRef } from "react";
import { activities } from "@/data/activities";
import { Lines } from "@/components/aura/Lines";
import { useScene, useSparkTrack } from "@/lib/motion/hooks";
import { ActivityScene } from "./ActivityScene";

function Heading() {
  const scene = useRef<HTMLDivElement>(null);

  useScene(scene, ({ tl, q }) => {
    tl.fromTo(q(".ln-i"), { yPercent: 108, opacity: 1 }, { yPercent: 0, stagger: 0.07, duration: 0.3, ease: "power4.out" }, 0.02);
    tl.fromTo(q(".stage-label, .wwd-sub"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.16);
    tl.to(q(".wwd-title"), { xPercent: -3, duration: 1 }, 0);
  });

  useSparkTrack("wwd-heading", (h) => {
    const s = scene.current;
    if (!s) return [];
    const m = !h.pinned;
    return [
      { s: h.at(s, 0), x: m ? 0.9 : 0.86, y: m ? 0.7 : 0.34, sc: m ? 1.5 : 2.3, r: -10 },
      { s: h.at(s, 0.5), x: m ? 0.74 : 0.62, y: m ? 0.42 : 0.6, sc: m ? 1.3 : 1.7, r: 8, bend: 0.07 },
      { s: h.at(s, 1), x: m ? 0.2 : 0.2, y: m ? 0.2 : 0.5, sc: m ? 1.8 : 2.5, r: -66, bend: -0.05 },
    ];
  });

  return (
    <div ref={scene} className="scene wwd-head">
      <div data-stage className="stage">
        <p className="stage-label t-mono" data-hide>
          01 / WHAT WE DO
        </p>
        <h2 className="wwd-title t-display">
          <Lines lines={["WHAT", "WE", "DO?"]} />
        </h2>
        <p className="wwd-sub t-mono" data-hide>
          Five ways we keep building
        </p>
      </div>
    </div>
  );
}

export function WhatWeDo() {
  return (
    <section id="what-we-do" data-section="01 / WHAT WE DO" aria-label="What we do">
      <Heading />
      {activities.map((a, i) => (
        <ActivityScene key={a.id} activity={a} index={i} />
      ))}
    </section>
  );
}
