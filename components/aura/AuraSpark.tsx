"use client";

import { useRef } from "react";
import { SPARK } from "@/lib/utils/paths";
import { spark } from "@/lib/motion/spark";
import { useIsoLayoutEffect } from "@/lib/motion/scroll";

/**
 * The one persistent AURA spark. It lives outside the page flow and is driven by the
 * spark engine (lib/motion/spark.ts): scroll waypoints from each scene, or the intro timeline.
 */
export function AuraSpark() {
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  useIsoLayoutEffect(() => {
    if (!wrap.current || !svg.current) return;
    return spark.attach(wrap.current, svg.current);
  }, []);

  return (
    <div ref={wrap} id="aura-spark" className="aura-spark" data-layer="front" aria-hidden="true">
      <svg ref={svg} viewBox={`0 0 ${SPARK.w} ${SPARK.h}`} focusable="false">
        <path d={SPARK.d} />
      </svg>
    </div>
  );
}
