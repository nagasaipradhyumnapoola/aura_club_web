"use client";

import gsap from "gsap";
import { SPARK } from "@/lib/utils/paths";
import { isPinned, prefersReducedMotion } from "./media";

export type SparkLayer = "front" | "back";

/** One keyframe of the spark's journey. x / y are viewport fractions of the spark's core. */
export interface SparkWaypoint {
  s: number;
  x: number;
  y: number;
  sc?: number;
  r?: number;
  o?: number;
  ol?: number;
  z?: SparkLayer;
  bend?: number;
  ease?: string;
}
type W = Required<SparkWaypoint>;

export interface SparkPose {
  x: number;
  y: number;
  sc: number;
  r: number;
  o: number;
  ol: number;
  z: SparkLayer;
}

export interface Helpers {
  vw: number;
  vh: number;
  pinned: boolean;
  top: (el: Element) => number;
  height: (el: Element) => number;
  /** scroll range during which a scene is "live": pinned stage, or flowing through the viewport */
  range: (el: Element, o?: RangeOpts) => [number, number];
  /** scroll position at scene progress p (plus an offset in viewport heights) */
  at: (el: Element, p: number, offVh?: number, o?: RangeOpts) => number;
  /** layout rect of el inside `stage`, ignoring transforms (valid while the stage is pinned) */
  rel: (el: HTMLElement, stage: HTMLElement) => { x: number; y: number; w: number; h: number };
}

export interface RangeOpts {
  /** force the flowing (unpinned) range even on layouts that pin */
  flow?: boolean;
  /** flowing ranges start when the element top is this far down the viewport (fraction of vh) */
  in?: number;
  /** flowing ranges end when the element bottom is this far down the viewport */
  out?: number;
}

type Build = (h: Helpers) => SparkWaypoint[];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function layoutRect(el: HTMLElement, stage: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== stage) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

export function makeHelpers(): Helpers {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const pinned = isPinned();
  const top = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
  const height = (el: Element) => (el as HTMLElement).offsetHeight;
  const range = (el: Element, o: RangeOpts = {}): [number, number] => {
    const t = top(el);
    const H = height(el);
    if (pinned && !o.flow) return [t, t + Math.max(1, H - vh)];
    return [t - (o.in ?? 0.5) * vh, t + H - (o.out ?? 0.5) * vh];
  };
  const at = (el: Element, p: number, offVh = 0, o: RangeOpts = {}) => {
    const [a, b] = range(el, o);
    return a + (b - a) * p + offVh * vh;
  };
  return { vw, vh, pinned, top, height, range, at, rel: layoutRect };
}

class SparkEngine {
  el: HTMLElement | null = null;
  svg: SVGSVGElement | null = null;
  private tracks = new Map<string, Build>();
  private wps: W[] = [];
  private dirty = true;

  /** While set, the pose is driven by hand (the intro sequence) instead of the scroll path. */
  manual: SparkPose | null = null;

  private cur: SparkPose = { x: 0.2, y: 0.7, sc: 0.2, r: 0, o: 0, ol: 0, z: "front" };
  private dis = { x: 0, y: 0 };
  private pointer = { x: 0, y: 0, active: false };
  private lastScroll = 0;
  private vel = 0;
  private stretch = 1;
  private time = 0;
  private base = 240;
  private vw = 1;
  private vh = 1;
  private reduced = false;
  private layerNow: SparkLayer = "front";

  attach(el: HTMLElement, svg: SVGSVGElement) {
    this.el = el;
    this.svg = svg;
    this.reduced = prefersReducedMotion();
    this.dirty = true;
    return () => {
      this.el = null;
      this.svg = null;
    };
  }

  setTrack(id: string, build: Build) {
    this.tracks.set(id, build);
    this.dirty = true;
    return () => {
      this.tracks.delete(id);
      this.dirty = true;
    };
  }

  invalidate() {
    this.dirty = true;
  }

  setPointer(x: number, y: number, active: boolean) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.active = active;
  }

  /** current core position in px (used by the intro to aim hops, and by the CTA mask) */
  corePx() {
    return { x: this.cur.x * this.vw, y: this.cur.y * this.vh };
  }

  /** copy of the pose currently on screen, plus its rendered width in px */
  snapshot(): SparkPose & { width: number } {
    return { ...this.cur, width: this.base * this.cur.sc };
  }

  rebuild() {
    this.dirty = false;
    if (!this.el || !this.svg) return;
    const h = makeHelpers();
    this.vw = h.vw;
    this.vh = h.vh;
    this.reduced = prefersReducedMotion();
    this.base = Math.max(150, Math.min(h.vw, h.vh) * 0.3);

    const B = this.base;
    const k = B / SPARK.w;
    this.svg.style.width = `${B}px`;
    this.svg.style.height = `${SPARK.h * k}px`;
    this.svg.style.left = `${-SPARK.core[0] * k}px`;
    this.svg.style.top = `${-SPARK.core[1] * k}px`;
    this.svg.style.transformOrigin = `${SPARK.core[0] * k}px ${SPARK.core[1] * k}px`;

    const all: W[] = [];
    this.tracks.forEach((build) => {
      try {
        for (const w of build(h)) {
          all.push({
            s: w.s,
            x: w.x,
            y: w.y,
            sc: w.sc ?? 1,
            r: w.r ?? 0,
            o: w.o ?? 1,
            ol: w.ol ?? 0,
            z: w.z ?? "front",
            bend: w.bend ?? 0,
            ease: w.ease ?? "power2.inOut",
          });
        }
      } catch {
        /* a scene that is mid-unmount can throw while measuring; skip it */
      }
    });
    all.sort((a, b) => a.s - b.s);
    this.wps = all;
  }

  private sample(scroll: number): SparkPose {
    const w = this.wps;
    if (!w.length) return { ...this.cur, o: 0 };
    if (this.reduced) {
      const maxScroll = document.documentElement.scrollHeight - this.vh;
      const atEnd = scroll > maxScroll - this.vh * 1.2;
      const atTop = scroll < this.vh * 0.9;
      const p = atEnd ? w[w.length - 1] : w[0];
      return { x: p.x, y: p.y, sc: p.sc, r: p.r, o: atEnd || atTop ? p.o : 0, ol: p.ol, z: p.z };
    }
    if (scroll <= w[0].s) return { x: w[0].x, y: w[0].y, sc: w[0].sc, r: w[0].r, o: w[0].o, ol: w[0].ol, z: w[0].z };
    const last = w[w.length - 1];
    if (scroll >= last.s) return { x: last.x, y: last.y, sc: last.sc, r: last.r, o: last.o, ol: last.ol, z: last.z };
    let i = 0;
    for (let n = 0; n < w.length - 1; n++) {
      if (scroll >= w[n].s && scroll < w[n + 1].s) {
        i = n;
        break;
      }
    }
    const a = w[i];
    const b = w[i + 1];
    const t = (scroll - a.s) / Math.max(1, b.s - a.s);
    const e = gsap.parseEase(a.ease)(t);
    let x = a.x + (b.x - a.x) * e;
    let y = a.y + (b.y - a.y) * e;
    if (a.bend) {
      const dx = (b.x - a.x) * this.vw;
      const dy = (b.y - a.y) * this.vh;
      const len = Math.hypot(dx, dy) || 1;
      const off = a.bend * Math.min(this.vw, this.vh) * Math.sin(Math.PI * e);
      x += (-dy / len) * off / this.vw;
      y += (dx / len) * off / this.vh;
    }
    const sc = a.sc * Math.pow(b.sc / a.sc, e);
    return {
      x,
      y,
      sc,
      r: a.r + (b.r - a.r) * e,
      o: a.o + (b.o - a.o) * e,
      ol: a.ol + (b.ol - a.ol) * e,
      z: t < 0.5 ? a.z : b.z,
    };
  }

  tick(dt: number, scroll: number) {
    const el = this.el;
    const svg = this.svg;
    if (!el || !svg) return;
    if (this.dirty) this.rebuild();
    dt = Math.min(dt, 0.1);
    this.time += dt;

    const v = (scroll - this.lastScroll) / Math.max(dt, 0.001);
    this.lastScroll = scroll;
    this.vel += (v - this.vel) * Math.min(1, dt * 8);
    const stretchTarget = this.reduced ? 1 : 1 + clamp(Math.abs(this.vel) / 7000, 0, 0.2);
    this.stretch += (stretchTarget - this.stretch) * Math.min(1, dt * 6);

    const tgt: SparkPose = this.manual ? this.manual : this.sample(scroll);
    const kp = this.manual ? 1 : 1 - Math.exp(-dt * 9);
    const ks = this.manual ? 1 : 1 - Math.exp(-dt * 7);
    const c = this.cur;
    c.x += (tgt.x - c.x) * kp;
    c.y += (tgt.y - c.y) * kp;
    c.sc += (tgt.sc - c.sc) * ks;
    c.r += (tgt.r - c.r) * ks;
    c.o += (tgt.o - c.o) * ks;
    c.ol += (tgt.ol - c.ol) * ks;
    c.z = tgt.z;

    // the pointer disturbs the aura; it never steers it
    let px = 0;
    let py = 0;
    if (this.pointer.active && !this.manual && !this.reduced) {
      const cx = c.x * this.vw;
      const cy = c.y * this.vh;
      const dx = cx - this.pointer.x;
      const dy = cy - this.pointer.y;
      const reach = Math.max(180, this.base * c.sc * 0.55);
      const d = Math.hypot(dx, dy);
      const f = Math.pow(Math.max(0, 1 - d / reach), 2);
      if (f > 0 && d > 0.001) {
        px = (dx / d) * f * 22;
        py = (dy / d) * f * 22;
      }
    }
    this.dis.x += (px - this.dis.x) * (1 - Math.exp(-dt * 5));
    this.dis.y += (py - this.dis.y) * (1 - Math.exp(-dt * 5));

    const float = this.reduced || this.manual ? 0 : 1;
    const fx = Math.sin(this.time * 0.55) * 5 * float;
    const fy = Math.cos(this.time * 0.47) * 4 * float;
    const fr = Math.sin(this.time * 0.37) * 1.2 * float;

    const X = c.x * this.vw + this.dis.x + fx;
    const Y = c.y * this.vh + this.dis.y + fy;
    el.style.transform = `translate3d(${X.toFixed(2)}px, ${Y.toFixed(2)}px, 0)`;
    el.style.opacity = c.o.toFixed(3);
    el.style.visibility = c.o < 0.01 ? "hidden" : "visible";
    el.style.setProperty("--ol", c.ol.toFixed(3));
    svg.style.transform = `rotate(${(c.r + fr).toFixed(2)}deg) scale(${(c.sc * this.stretch).toFixed(4)}, ${c.sc.toFixed(4)})`;
    if (c.z !== this.layerNow) {
      this.layerNow = c.z;
      el.dataset.layer = c.z;
    }
  }
}

export const spark = new SparkEngine();
