import type { ElementType } from "react";

/**
 * Masked lines for headline reveals. Each line is clipped; its inner span is what GSAP moves
 * (`.ln-i`). Marked `data-hide` so it stays hidden until a scene reveals it.
 */
export function Lines({
  lines,
  as: Tag = "span",
  className = "",
  lineClass = "",
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  lineClass?: string;
}) {
  return (
    <Tag className={className}>
      {lines.map((l, i) => (
        <span key={i} className={`ln ${lineClass}`}>
          <span className="ln-i" data-hide>
            {l}
          </span>
          {i < lines.length - 1 && <span className="sr-only"> </span>}
        </span>
      ))}
    </Tag>
  );
}
