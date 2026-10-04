/** Pinned (sticky stage) layouts need real height; short landscape phones fall back to flowing layouts. */
export const PIN_QUERY = "(min-width: 768px) and (min-height: 560px)";
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
export const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export function isPinned() {
  return typeof window !== "undefined" && window.matchMedia(PIN_QUERY).matches;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_QUERY).matches;
}

export function hasFinePointer() {
  return typeof window !== "undefined" && window.matchMedia(FINE_POINTER_QUERY).matches;
}
