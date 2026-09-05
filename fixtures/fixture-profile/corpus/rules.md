# THE FIXTURE CORPUS — THE RULES THE BATTERY ENFORCES

This corpus is the fixture-profile's rule battery source. Every rule card carries
its verbatim quote (D13), its classification, and its severity. The compiler
extracts the cards mechanically; a quote-less card is a D13_VIOLATION and cannot
compile. The battery runs the compiled predicates against the fixture's graph
and source; a violation fires a finding with the MPSE triplet.

## P6 — NO PRICE ANCHORING (the CRIT open class)

- P6: NOTHING SHOULD BE PRICE ANCHORED EVER
  "Nothing should be price anchored - the level is data, never a hardcoded anchor. E1 calculates the exact zones."
  classification: DOMAIN
  severity: HIGH

The P6 rule targets the price-anchored comparator class (C26.10): a selection or
designation decision bound to a hardcoded price level — the DXY 101.296 anchor,
the abs(open - level) edge, the 11 known sites. The golden shape is the
zone-anchored equivalent: the designation computed from the E1-calculated zone
levels, never a hardcoded price.

## The enforcement semantics

- The rule-card extractor reads this corpus (extractRuleCards).
- The compiler builds the battery (compileBattery — the corpus-hash cached).
- The engine runs the battery against the graph + the source (runBattery).
- A finding carries the MPSE triplet — no triplet = no finding.
- The calibration gate tests the battery: the FIRE fixture must fire P6, the
  GOLDEN fixture must stay silent — a MISS or FALSE-FIRE is a FLAGGED predicate.
