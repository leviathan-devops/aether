// src/engine.ts — the FIRE fixture: the price-anchored E2 comparator (C26.10)
// the DXY 101.296 hardcoded anchor — the designation leg is bound to a hardcoded
// price level. The MUTANT the P6 predicate must DETECT (the fire test).
//
// The violation class (the P6 rule card): "NOTHING SHOULD BE PRICE ANCHORED
// EVER... YOU DO NOT HARDCODE FUCKING PRICES... E1 CALCULATES THE EXACT ZONES"
// (ZONE_ANCHORED_E2_FIX_SPEC:6). The abs(open - level) comparator edge below is
// the 11-site class's canonical shape (the spec §6.3 fixtureGraph('price-anchored'),
// the DXY 101.296 anchor from OVERHAUL_SPEC_V2:31).

export function selectE2(open: number, level: number): number {
  const comparator = Math.abs(open - level); // the abs(open - level) comparator edge — line 12
  if (comparator > 1.0) return 101.296;      // the HARDCODED price leg — the P6 violation
  return 0;
}
