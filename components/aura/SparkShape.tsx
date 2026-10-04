import { SPARK } from "@/lib/utils/paths";

/** The supplied elongated four-point AURA spark, as a reusable inline SVG. */
export function SparkShape({ className, outline = false }: { className?: string; outline?: boolean }) {
  return (
    <svg className={className} viewBox={`0 0 ${SPARK.w} ${SPARK.h}`} aria-hidden="true" focusable="false">
      <path
        d={SPARK.d}
        fill={outline ? "none" : "currentColor"}
        stroke={outline ? "currentColor" : "none"}
        strokeWidth={outline ? 1.5 : 0}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
