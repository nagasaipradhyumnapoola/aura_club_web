import { forwardRef } from "react";
import { WORDMARK } from "@/lib/utils/paths";

type Props = {
  className?: string;
  label?: string;
};

/** The supplied AURA wordmark, vectorised. Static: the logo itself never animates on its own. */
export const AuraLogo = forwardRef<SVGSVGElement, Props>(function AuraLogo({ className, label = "AURA" }, ref) {
  const { w, h, letters } = WORDMARK;
  return (
    <svg
      ref={ref}
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={label}
      focusable="false"
      overflow="visible"
    >
      <g fill="currentColor">
        {letters.map((l, i) => (
          <path key={i} d={l.d} />
        ))}
      </g>
    </svg>
  );
});
