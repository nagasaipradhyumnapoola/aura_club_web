"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PIN_QUERY, REDUCED_QUERY } from "./media";
import { useIsoLayoutEffect } from "./scroll";
import { makeHelpers, spark, type Helpers, type RangeOpts, type SparkWaypoint } from "./spark";

export type SceneCtx = {
  el: HTMLElement;
  tl: gsap.core.Timeline;
  q: gsap.utils.SelectorFunc;
  pinned: boolean;
};

export type SceneOptions = RangeOpts & {
  scrub?: number | boolean;
};

/**
 * Scrubbed timeline over a scene's live scroll range. The timeline is normalised to duration 1,
 * so positions are scene progress (0 → 1). Reduced-motion visitors get content with a plain fade.
 */
export function useScene(
  ref: RefObject<HTMLElement | null>,
  setup: (ctx: SceneCtx) => void,
  opts: SceneOptions = {},
) {
  const setupRef = useRef(setup);
  setupRef.current = setup;
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    // `all` always matches: matchMedia only runs the callback when at least one query matches,
    // and the flowing phone layout matches neither `pin` nor `reduce`.
    mm.add({ all: "(min-width: 0px)", pin: PIN_QUERY, reduce: REDUCED_QUERY }, (c) => {
      const { pin, reduce } = c.conditions as { pin: boolean; reduce: boolean };
      const hidden = gsap.utils.toArray<HTMLElement>("[data-hide]", el);
      if (reduce) {
        gsap.set(hidden, { opacity: 1, y: 0, x: 0, yPercent: 0, xPercent: 0, scale: 1, rotation: 0, clearProps: "transform,visibility" });
        hidden.forEach((h) => {
          gsap.fromTo(
            h,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.7,
              ease: "power1.out",
              scrollTrigger: { trigger: h, start: "top 92%", once: true },
            },
          );
        });
        return;
      }
      const range = () => makeHelpers().range(el, opts);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: () => range()[0],
          end: () => range()[1],
          scrub: opts.scrub ?? 0.5,
          invalidateOnRefresh: true,
        },
      });
      tl.to({}, { duration: 1 }, 0);
      setupRef.current({ el, tl, q: gsap.utils.selector(el), pinned: pin });
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Register a stretch of the spark's journey. `build` runs on every layout refresh. */
export function useSparkTrack(id: string, build: (h: Helpers) => SparkWaypoint[]) {
  const buildRef = useRef(build);
  buildRef.current = build;
  useIsoLayoutEffect(() => {
    return spark.setTrack(id, (h) => buildRef.current(h));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}

/** Run once after mount, cleaning up on unmount. */
export function useMountEffect(fn: () => void | (() => void)) {
  useEffect(fn, []); // eslint-disable-line react-hooks/exhaustive-deps
}

export { ScrollTrigger };
