"use client";

import { useRef } from "react";
import { freedom, teams } from "@/data/structure";
import { AuraLogo } from "@/components/aura/AuraLogo";
import { Lines } from "@/components/aura/Lines";
import { useScene, useSparkTrack } from "@/lib/motion/hooks";
import { StructureBranch } from "./StructureBranch";

/* ------------------------------------------------------------------ ONE AURA. THREE TEAMS. */
function StructureHeading() {
  const scene = useRef<HTMLDivElement>(null);

  useScene(scene, ({ tl, q }) => {
    tl.fromTo(q(".ln-i"), { yPercent: 108, opacity: 1 }, { yPercent: 0, stagger: 0.07, duration: 0.28, ease: "power4.out" }, 0.02);
    tl.fromTo(q(".stage-label"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.16 }, 0.12);
    tl.fromTo(q(".struct-title-a"), { xPercent: 4 }, { xPercent: -3, duration: 1 }, 0);
    tl.fromTo(q(".struct-title-b"), { xPercent: -4 }, { xPercent: 3, duration: 1 }, 0);
  });

  useSparkTrack("structure-heading", (h) => {
    const s = scene.current;
    if (!s) return [];
    const m = !h.pinned;
    return [
      { s: h.at(s, 0), x: 0.5, y: m ? 0.4 : 0.5, sc: m ? 1.8 : 2.4, r: -86 },
      { s: h.at(s, 0.5), x: 0.5, y: 0.5, sc: m ? 1.4 : 1.8, r: -62, bend: 0.05 },
      { s: h.at(s, 1), x: 0.5, y: m ? 0.3 : 0.2, sc: m ? 0.5 : 0.62, r: -90 },
    ];
  });

  return (
    <div ref={scene} className="scene struct-head">
      <div data-stage className="stage">
        <p className="stage-label t-mono" data-hide>
          02 / STRUCTURE
        </p>
        <h2 className="struct-title t-display">
          <Lines as="span" className="struct-title-a" lines={["ONE", "AURA."]} />
          <Lines as="span" className="struct-title-b" lines={["THREE", "TEAMS."]} />
        </h2>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ the tree */
function StructureTree() {
  const scene = useRef<HTMLDivElement>(null);

  useScene(scene, ({ tl, q, pinned }) => {
    if (pinned) {
      tl.fromTo(q(".tree-d .tree-logo"), { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.07, ease: "power2.out" }, 0.0);
      tl.fromTo(q(".tree-d .tl-trunk"), { scaleY: 0 }, { scaleY: 1, duration: 0.14, ease: "power2.inOut" }, 0.08);
      tl.fromTo(q(".tree-d .tl-bar"), { scaleX: 0 }, { scaleX: 1, duration: 0.12, ease: "power2.inOut" }, 0.22);
      tl.fromTo(q(".tree-d .tl-drop"), { scaleY: 0 }, { scaleY: 1, duration: 0.1, stagger: 0.0, ease: "power2.out" }, 0.34);
      tl.fromTo(q(".tree-d .tl-node"), { scale: 0 }, { scale: 1, duration: 0.05, ease: "back.out(3)" }, 0.42);
      const cols = ["technical", "creatives", "operations"];
      cols.forEach((id, i) => {
        const at = 0.36 + i * 0.16;
        const col = `.tree-d [data-team="${id}"]`;
        tl.fromTo(q(`${col} .branch-no, ${col} .branch-tag`), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, at);
        tl.fromTo(q(`${col} .ln-i`), { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: 0.12, ease: "power4.out" }, at);
        tl.fromTo(q(`${col} .branch-copy p`), { opacity: 0, y: 22 }, { opacity: 1, y: 0, stagger: 0.03, duration: 0.1, ease: "power2.out" }, at + 0.04);
        const areas = q(`${col} .branch-areas`);
        if (areas.length) tl.fromTo(areas, { opacity: 0 }, { opacity: 1, duration: 0.08 }, at + 0.1);
      });
      // the branches fold back toward the spark
      tl.to(q(".tree-d .tl-drop"), { scaleY: 0, transformOrigin: "50% 0%", duration: 0.07, ease: "power2.in" }, 0.88);
      tl.to(q(".tree-d .tl-bar"), { scaleX: 0, duration: 0.07, ease: "power2.in" }, 0.9);
      tl.to(q(".tree-d .tl-node"), { scale: 0, duration: 0.04 }, 0.88);
      tl.to(q(".tree-d .tl-trunk"), { scaleY: 0, transformOrigin: "50% 0%", duration: 0.06, ease: "power2.in" }, 0.94);
    } else {
      tl.fromTo(q(".tree-m .tree-logo"), { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.1 }, 0);
      tl.fromTo(q(".tree-m .tm-line"), { scaleY: 0 }, { scaleY: 1, duration: 0.92, ease: "none" }, 0.04);
      ["technical", "creatives", "operations"].forEach((id, i) => {
        const at = 0.1 + i * 0.28;
        const col = `.tree-m [data-team="${id}"]`;
        tl.fromTo(q(`${col} .tm-node`), { scale: 0 }, { scale: 1, duration: 0.05, ease: "back.out(3)" }, at);
        tl.fromTo(q(`${col} .branch-no, ${col} .branch-tag`), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.08 }, at);
        tl.fromTo(q(`${col} .ln-i`), { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: 0.1, ease: "power4.out" }, at);
        tl.fromTo(q(`${col} .branch-copy p`), { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.03, duration: 0.1 }, at + 0.04);
        const areas = q(`${col} .branch-areas`);
        if (areas.length) tl.fromTo(areas, { opacity: 0 }, { opacity: 1, duration: 0.08 }, at + 0.1);
      });
    }
  });

  useSparkTrack("structure-tree", (h) => {
    const s = scene.current;
    if (!s) return [];
    if (h.pinned) {
      const at = (p: number) => h.at(s, p);
      return [
        { s: at(0), x: 0.5, y: 0.2, sc: 0.62, r: -90 },
        { s: at(0.2), x: 0.5, y: 0.34, sc: 0.5, r: -90 },
        { s: at(0.34), x: 0.5, y: 0.34, sc: 0.44, r: -90 },
        { s: at(0.44), x: 0.1667, y: 0.455, sc: 0.44, r: -90 },
        { s: at(0.6), x: 0.5, y: 0.455, sc: 0.44, r: -90 },
        { s: at(0.76), x: 0.8333, y: 0.455, sc: 0.44, r: -90 },
        { s: at(0.88), x: 0.5, y: 0.34, sc: 0.5, r: -90, bend: -0.04 },
        { s: at(1), x: 0.5, y: 0.34, sc: 0.46, r: -90 },
      ];
    }
    const items = Array.from(s.querySelectorAll<HTMLElement>(".tree-m .tm-node"));
    const at = (p: number) => h.at(s, p);
    const wps = [{ s: at(0), x: 0.12, y: 0.22, sc: 0.7, r: -90 }];
    items.forEach((n) => {
      const b = n.getBoundingClientRect();
      wps.push({ s: b.top + window.scrollY - h.vh * 0.55, x: Math.min(0.9, (b.left + b.width / 2) / h.vw), y: 0.55, sc: 0.6, r: -90 });
    });
    wps.push({ s: at(1), x: 0.12, y: 0.5, sc: 0.7, r: -90 });
    return wps;
  });

  return (
    <div ref={scene} className="scene tree">
      <div data-stage className="stage tree-stage">
        {/* desktop / tablet: three horizontal branches */}
        <div className="tree-d">
          <div className="tree-logo">
            <AuraLogo className="tree-logo-svg" label="AURA" />
          </div>
          <i className="tl tl-trunk" />
          <i className="tl tl-bar" />
          <i className="tl tl-drop" style={{ left: "16.667%" }} />
          <i className="tl tl-drop" style={{ left: "50%" }} />
          <i className="tl tl-drop" style={{ left: "83.333%" }} />
          <i className="tl-node" style={{ left: "16.667%" }} />
          <i className="tl-node" style={{ left: "50%" }} />
          <i className="tl-node" style={{ left: "83.333%" }} />
          <div className="tree-cols">
            {teams.map((t, i) => (
              <StructureBranch key={t.id} team={t} no={i + 1} />
            ))}
          </div>
        </div>

        {/* mobile: one vertical line, three equal top-level teams */}
        <div className="tree-m">
          <div className="tree-logo">
            <AuraLogo className="tree-logo-svg" label="AURA" />
          </div>
          <div className="tm-list">
            <i className="tm-line" />
            {teams.map((t, i) => (
              <div key={t.id} className="tm-item" data-team={t.id}>
                <i className="tm-node" />
                <StructureBranch team={t} no={i + 1} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ YOUR TEAM IS YOUR RESPONSIBILITY. */
const NODES = [
  { id: "T", x: 150, y: 34, label: "TECHNICAL", anchor: "middle", dy: -12 },
  { id: "C", x: 34, y: 214, label: "CREATIVES", anchor: "start", dy: 24 },
  { id: "O", x: 266, y: 214, label: "OPERATIONS", anchor: "end", dy: 24 },
] as const;

function CrossTeam() {
  const scene = useRef<HTMLDivElement>(null);
  const graph = useRef<HTMLDivElement>(null);

  useScene(scene, ({ tl, q }) => {
    tl.fromTo(q(".cross-a .ln-i"), { yPercent: 110, opacity: 1 }, { yPercent: 0, stagger: 0.06, duration: 0.16, ease: "power4.out" }, 0.03);
    tl.fromTo(q(".cross-graph [data-edge]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.04, duration: 0.2, ease: "power2.inOut" }, 0.16);
    tl.fromTo(q(".cross-graph [data-gnode]"), { opacity: 0 }, { opacity: 1, stagger: 0.05, duration: 0.06 }, 0.14);
    tl.to(q(".cross-a"), { opacity: 0.22, duration: 0.12, ease: "power1.inOut" }, 0.4);
    tl.fromTo(q(".cross-b .ln-i"), { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: 0.18, ease: "power4.out" }, 0.4);
    tl.fromTo(q(".cross-b-fill"), { clipPath: "polygon(0% 0%, 0% 0%, -12% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 118% 0%, 106% 100%, 0% 100%)", duration: 0.3, ease: "power2.inOut" }, 0.5);
    tl.fromTo(q(".cross-copy p"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.14, ease: "power2.out" }, 0.62);
  });

  useSparkTrack("cross-team", (h) => {
    const s = scene.current;
    const g = graph.current;
    if (!s || !g) return [];
    const at = (p: number) => h.at(s, p);
    const stage = s.querySelector<HTMLElement>("[data-stage]")!;
    const pos = (nx: number, ny: number) => {
      if (h.pinned) {
        const r = h.rel(g, stage);
        return { x: (r.x + (nx / 300) * r.w) / h.vw, y: (r.y + (ny / 260) * r.h) / h.vh };
      }
      const b = g.getBoundingClientRect();
      return { x: (b.left + (nx / 300) * b.width) / h.vw, y: 0.5 + ((ny / 260 - 0.5) * b.height) / h.vh };
    };
    const T = pos(150, 34);
    const C = pos(34, 214);
    const O = pos(266, 214);
    const m = !h.pinned;
    return [
      { s: at(0), x: 0.5, y: 0.34, sc: 0.46, r: -90 },
      { s: at(0.2), ...T, sc: 0.5, r: -60 },
      { s: at(0.32), ...C, sc: 0.5, r: 20, bend: 0.03 },
      { s: at(0.44), ...O, sc: 0.5, r: -20, bend: -0.03 },
      { s: at(0.56), ...T, sc: 0.5, r: -60, bend: 0.03 },
      { s: at(0.72), x: m ? 0.88 : 0.9, y: m ? 0.85 : 0.5, sc: m ? 0.9 : 1.7, r: -14, bend: -0.05 },
      { s: at(1), x: m ? 0.9 : 0.82, y: m ? 0.9 : 0.86, sc: m ? 0.8 : 1.1, r: -12 },
    ];
  });

  return (
    <div ref={scene} className="scene cross">
      <div data-stage className="stage cross-stage">
        <div ref={graph} className="cross-graph-wrap">
        <svg className="cross-graph" viewBox="0 0 300 260" aria-hidden="true" focusable="false">
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path data-edge pathLength={1} strokeDasharray="1" d="M150 34 L34 214" />
            <path data-edge pathLength={1} strokeDasharray="1" d="M34 214 L266 214" />
            <path data-edge pathLength={1} strokeDasharray="1" d="M266 214 L150 34" />
            <path data-edge pathLength={1} strokeDasharray="1" d="M150 34 L150 214" opacity={0.5} />
            <path data-edge pathLength={1} strokeDasharray="1" d="M34 214 L208 124" opacity={0.5} />
            <path data-edge pathLength={1} strokeDasharray="1" d="M266 214 L92 124" opacity={0.5} />
          </g>
          {NODES.map((n) => (
            <g key={n.id} data-gnode>
              <rect x={n.x - 4} y={n.y - 4} width="8" height="8" fill="currentColor" />
              <text
                x={n.x}
                y={n.y + n.dy}
                textAnchor={n.anchor}
                fontSize="9"
                letterSpacing="1.4"
                fill="currentColor"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
        </div>

        <div className="cross-lines t-display">
          <Lines as="p" className="cross-a" lines={freedom.headline} />
          <p className="cross-b" aria-label={freedom.counter}>
            <span className="ln">
              <span className="ln-i" data-hide>
                {freedom.counter}
              </span>
            </span>
            <span className="cross-b-fill" aria-hidden="true">
              {freedom.counter}
            </span>
          </p>
        </div>

        <div className="cross-copy">
          {freedom.copy.map((p, i) => (
            <p key={i} data-hide>
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuraStructure() {
  return (
    <section id="structure" data-section="02 / STRUCTURE" aria-label="Structure">
      <StructureHeading />
      <StructureTree />
      <CrossTeam />
    </section>
  );
}
