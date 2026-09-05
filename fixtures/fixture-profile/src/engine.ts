// src/engine.ts — the price-anchored entry (the C26.10 class — the DXY 101.296 anchor)
export function selectZone(open: number, level: number): string {
  // THE PRICE ANCHOR: the level is hardcoded-relative — abs(open - level) < 0.01
  const anchor = Math.abs(open - level);
  if (anchor < 0.01) return "zone-hit";
  return "no-zone";
}
