"use client";

import { useRef } from "react";
import { principles } from "@/data/principles";
import { Lines } from "@/components/aura/Lines";
import { useScene, useSparkTrack } from "@/lib/motion/hooks";
import { PrincipleScene } from "./PrincipleScene";

function Heading() {
  const scene = useRef<HTMLDivElement>(null);

  useScene(scene, ({ tl, q }) => {
    tl.fromTo(q(".ln-i"), { yPercent: 108, opacity: 1 }, { yPercent: 0, stagger: 0.08, duration: 0.3, ease: "power4.out" }, 0.04);
    tl.fromTo(q(".stage-label"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.16 }, 0.14);
    tl.to(q(".why-title"), { xPercent: 3, duration: 1 }, 0);
  });

  useSparkTrack("why-heading", (h) => {
    const s = scene.current;
    if (!s) return [];
    const m = !h.pinned;
    return [
      { s: h.at(s, 0), x: m ? 0.9 : 0.82, y: m ? 0.9 : 0.86, sc: m ? 0.8 : 1.1, r: -12 },
      { s: h.at(s, 0.5), x: 0.55, y: 0.5, sc: m ? 3 : 4.6, r: -6, z: "back", ol: 1, bend: 0.06 },
      { s: h.at(s, 1), x: 0.62, y: 0.46, sc: m ? 3.2 : 5, r: -4, z: "back", ol: 1 },
    ];
  });

  return (
    <div ref={scene} className="scene why-head">
      <div data-stage className="stage">
        <p className="stage-label t-mono" data-hide>
          03 / WHY AURA
        </p>
        <h2 className="why-title t-display">
          <Lines lines={["WHAT MAKES", "AURA,", "AURA?"]} />
        </h2>
      </div>
    </div>
  );
}

export function AuraPrinciples() {
  return (
    <section id="why-aura" data-section="03 / WHY AURA" aria-label="What makes AURA, AURA">
      <Heading />
      {principles.map((p, i) => (
        <PrincipleScene key={p.id} principle={p} index={i} />
      ))}
    </section>
  );
}
