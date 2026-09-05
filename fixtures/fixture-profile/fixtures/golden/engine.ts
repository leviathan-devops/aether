// src/engine.ts — the GOLDEN fixture: the zone-anchored E2 designation (the wild-type)
// E1 CALCULATES THE EXACT ZONES — the designation derives from the computed zone
// levels, NEVER a hardcoded price. The P6 rule (no-price-anchored-comparator) is
// SILENT here: the comparator edge is the same abs(open - level) shape, but the
// level is the E1-calculated zone level, so the value stays under the 1.0 ceiling.
//
// Structurally parallel to the FIRE fixture (same module, same comparator site) —
// the ONLY semantic difference is the price anchor: the fire hardcodes 101.296;
// this file derives the level from E1's zone math. That is what makes the SILENT
// verdict meaningful — the predicate discriminates on the anchor, not the shape.

export function selectE2(open: number, e1ZoneBackEdge: number): number {
  const comparator = Math.abs(open - e1ZoneBackEdge); // the zone-anchored comparator — line 12
  if (comparator > 1.0) return e1ZoneBackEdge;       // the computed-zone leg — NO hardcoded price
  return 0;
}
