"use client";

import { useRef } from "react";
import type { Principle } from "@/data/principles";
import { Lines } from "@/components/aura/Lines";
import { useScene, useSparkTrack } from "@/lib/motion/hooks";

/** Where the (outlined, cropped) spark sits behind each principle. */
const POSES = [
  { x: 0.66, y: 0.5, sc: 4.2, r: -5 },
  { x: 0.3, y: 0.56, sc: 4.8, r: 7 },
  { x: 0.72, y: 0.48, sc: 3.9, r: -11 },
  { x: 0.32, y: 0.52, sc: 5, r: 9 },
  { x: 0.62, y: 0.5, sc: 4.4, r: -7 },
];

export function PrincipleScene({ principle: p, index }: { principle: Principle; index: number }) {
  const scene = useRef<HTMLElement>(null);
  const flip = index % 2 === 1;

  useScene(scene, ({ tl, q }) => {
    tl.fromTo(q(".pr-num"), { opacity: 0, xPercent: flip ? 8 : -8 }, { opacity: 1, xPercent: 0, duration: 0.22, ease: "power3.out" }, 0);
    tl.fromTo(q(".pr-head .ln-i"), { yPercent: 108, opacity: 1 }, { yPercent: 0, stagger: 0.05, duration: 0.22, ease: "power4.out" }, 0.04);
    tl.fromTo(q(".pr-index"), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.1);
    tl.fromTo(q(".pr-copy p"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.16, ease: "power2.out" }, 0.3);
    tl.to(q(".pr-head"), { xPercent: flip ? 2 : -2, duration: 1 }, 0);
  });

  useSparkTrack(`principle-${p.id}`, (h) => {
    const s = scene.current;
    if (!s) return [];
    const base = POSES[index % POSES.length];
    const m = !h.pinned;
    const k = m ? 0.62 : 1;
    const common = { z: "back" as const, ol: 1, o: 0.7 };
    const last = index === POSES.length - 1;
    const wps = [
      { s: h.at(s, 0), x: base.x, y: base.y, sc: base.sc * k, r: base.r, ...common },
      { s: h.at(s, 0.55), x: base.x + (flip ? 0.05 : -0.05), y: base.y - 0.03, sc: base.sc * k * 1.06, r: base.r + (flip ? 5 : -5), ...common, bend: 0.03 },
    ];
    if (last) {
      wps.push({ s: h.at(s, 1), x: 0.5, y: 0.62, sc: 1.1 * k, r: -12, z: "front", ol: 0, o: 1 } as never);
    } else {
      wps.push({ s: h.at(s, 1), x: base.x + (flip ? 0.08 : -0.08), y: base.y - 0.05, sc: base.sc * k * 1.1, r: base.r + (flip ? 9 : -9), ...common });
    }
    return wps;
  });

  return (
    <article
      ref={scene}
      id={`principle-${p.id}`}
      className="pr"
      data-flip={flip ? "true" : "false"}
      aria-labelledby={`${p.id}-h`}
    >
      <div data-stage className="pr-stage">
        <span className="pr-num" aria-hidden="true">
          {p.no}
        </span>
        <p className="pr-index t-mono" data-hide>
          {p.no} / 05
        </p>
        <h3 id={`${p.id}-h`} className="pr-head t-display">
          <Lines lines={p.headline} />
        </h3>
        <div className="pr-copy">
          {p.copy.map((c, i) => (
            <p key={i} data-hide>
              {c}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
