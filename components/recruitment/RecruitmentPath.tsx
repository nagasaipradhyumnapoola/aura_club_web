"use client";

import { useRef } from "react";
import type { RecruitPath } from "@/data/recruitment";
import { useScene, useSparkTrack } from "@/lib/motion/hooks";

/**
 * One selection path, drawn as a line with its stages along it. Horizontal on wide screens,
 * vertical on phones. The spark rides the line as it draws.
 */
export function RecruitmentPath({ path, index }: { path: RecruitPath; index: number }) {
  const row = useRef<HTMLElement>(null);
  const line = useRef<HTMLElement>(null);

  useScene(
    row,
    ({ tl, q, pinned }) => {
      tl.fromTo(q(".rp-name .ln-i"), { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: 0.2, ease: "power4.out" }, 0.0);
      tl.fromTo(q(".rp-no"), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.0);
      tl.fromTo(
        q(".rp-line"),
        pinned ? { scaleX: 0 } : { scaleY: 0 },
        pinned ? { scaleX: 1, duration: 0.62, ease: "none" } : { scaleY: 1, duration: 0.7, ease: "none" },
        0.14,
      );
      const n = path.steps.length;
      path.steps.forEach((_, i) => {
        const at = 0.14 + (0.62 * i) / Math.max(1, n - 1);
        tl.fromTo(q(`.rp-step:nth-child(${i + 1})`), { opacity: 0, y: pinned ? 14 : 0, x: pinned ? 0 : 14 }, { opacity: 1, y: 0, x: 0, duration: 0.08, ease: "power2.out" }, at);
        tl.fromTo(q(`.rp-step:nth-child(${i + 1}) .rp-dot`), { scale: 0 }, { scale: 1, duration: 0.06, ease: "back.out(3)" }, at);
      });
      tl.fromTo(q(".rp-copy > *"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.14, ease: "power2.out" }, 0.3);
    },
    { flow: true, in: 0.85, out: 0.35 },
  );

  useSparkTrack(`recruit-${path.id}`, (h) => {
    const r = row.current;
    const l = line.current;
    if (!r || !l) return [];
    const at = (p: number) => h.at(r, p, 0, { flow: true, in: 0.5, out: 0.5 });
    const b = l.getBoundingClientRect();
    const docTop = b.top + window.scrollY;
    if (h.pinned) {
      const s0 = at(0.14);
      const s1 = at(0.76);
      const yAt = (s: number) => (docTop - s) / h.vh;
      return [
        { s: at(0.02), x: Math.max(0.04, (b.left - 24) / h.vw), y: yAt(at(0.02)), sc: 0.42, r: -12 },
        { s: s0, x: b.left / h.vw, y: yAt(s0), sc: 0.42, r: -12, ease: "none" },
        { s: s1, x: b.right / h.vw, y: yAt(s1), sc: 0.42, r: -12 },
      ];
    }
    const x = Math.max(0.05, (b.left + 1) / h.vw);
    const sA = docTop - h.vh * 0.5;
    const sB = docTop + b.height - h.vh * 0.5;
    return [
      { s: sA, x, y: 0.5, sc: 0.5, r: -90, ease: "none" },
      { s: sB, x, y: 0.5, sc: 0.5, r: -90 },
    ];
  });

  const n = path.steps.length;
  return (
    <article ref={row} className="rp" data-team={path.id} aria-labelledby={`rp-${path.id}`}>
      <header className="rp-head">
        <p className="rp-no t-mono">0{index + 1} / PATH</p>
        <h3 id={`rp-${path.id}`} className="rp-name t-display">
          <span className="ln">
            <span className="ln-i" data-hide>
              {path.name}
            </span>
          </span>
        </h3>
      </header>

      <div className="rp-steps">
        <i ref={line} className="rp-line" aria-hidden="true" />
        <ol className="rp-list-steps" style={{ ["--n" as string]: n }}>
          {path.steps.map((s, i) => (
            <li key={s + i} className="rp-step" data-last={i === n - 1 ? "true" : "false"} data-hide>
              <i className="rp-dot" aria-hidden="true" />
              <span className="rp-step-no t-mono">0{i + 1}</span>
              <b className="rp-step-label t-display">{s}</b>
            </li>
          ))}
        </ol>
      </div>

      <div className="rp-copy">
        {path.copy.map((c, i) => (
          <p key={i} data-hide>
            {c}
          </p>
        ))}
        {path.list && (
          <ul className="rp-chips t-mono" data-hide>
            {path.list.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        {path.line && (
          <p className="rp-quote t-display" data-hide>
            {path.line}
          </p>
        )}
      </div>
    </article>
  );
}
