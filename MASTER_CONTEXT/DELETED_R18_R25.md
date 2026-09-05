# DELETED R18-R25 — Lineage (Wave A5, SPEC-A §2.6)

Operator ruling: R18-R25 wiped, R0-R17 kept, R16 pattern → ship-gate. Replaced, not merged.

| File | What it was | D-ids killed | What replaced it | Spec section |
|---|---|---|---|---|
| `r18-component-presence.ts` | Keyword ontology scoring LASME signature names (OracleRegistry, EvidenceTriad, createGate) with `score<2` magic threshold; detected LASME-incomplete modules via token counting. | D-7 (keyword ontology), F-A7, AP-A-1 | `r-lexicon.ts` + `r-actor.ts` + `r-state-machine.ts` + `r-engine.ts` + `r-adapter.ts` (five structural-shape LASME layers, Order-2 AST detectors, two-sided, no keyword scoring) | SPEC-A §2.3 |
| `r19-claims-without-machinery.ts` | Regex-only detector (`/Engine|Registry|.../`) flagging exports matching names but not wired — ISE SIG-2 self-slop. | D-8, F-A8, AP-A-1 | `r-engine.ts` (plain-class + createProgram + evidence-write + degrade checks via AST walkers) + `r-adapter.ts` (3-call leg verification) | SPEC-A §2.3 (R-ENGINE, R-ADAPTER) |
| `r20-ungrounded-thresholds.ts` | Scored numeric literals in comparison sites as "ungrounded" via literal-value heuristic; no spec binding, no epsilon, no tolerance. | D-7, F-A11 (magic numbers), D-4 | `r-mpse.ts` (contract-evaluation layer: specBindings parser → evalExpr delta vs tolerance, stage-respecting checkContract, epsilon-required oracle) | SPEC-A §2.4 (R-MPSE) |
| `r21-dead-enforcement-surface.ts` | Counted unenforced gate exports via callgraph parity heuristic, without stage or spec grounding. Regex-shaped, no AST. | D-8 (regex-only), D-10 (chain) | `r-engine.ts` + `r-state-machine.ts` (gate-as-GuardCondition via createMachine AST, decision pipeline INCONCLUSIVE law) | SPEC-A §2.3 (R-ENGINE, R-STATE-MACHINE) |
| `r22-spec-enablement.ts` | Contract anchoring via verb-substring scan (Order-1) — matched spec contract verbs as substrings in file text. | F-A12 (Order-1 verb-substring) | Deleted — its re-grounded successor is SPEC-B B6 `r-graph` (graph-verified spec→code traces, BFS ≤64, typed edges) — not in this repo's Batch B | SPEC-A §2.6 → SPEC-B B6 |
| `r23-wiring-conformance.ts` | Adapter↔machine wiring parity via O(N) per-call DB opens (chain/imports/awaits/readNodes each opened a DB). | F-A10 (O(N) fix partial), D-10 | Deleted — re-grounded as SPEC-B B6 `r-graph` with ONE shared DB handle (D-10 class dead) | SPEC-A §2.6 → SPEC-B B6 |
| `r24-findings-feed.ts` | Loaded hunter findings table as candidates with `cluster≥5` magic; no re-adjudication. | F-A11 (cluster≥5 magic) | Deleted — re-grounded as SPEC-B `r-dh-feed` (findings table → re-adjudicated by second shadow pass with specs) | SPEC-A §2.6 → SPEC-B B6 |
| `r25-provenance-lineage.ts` | Spec→code trace verification with `pairs<10` magic; incomplete lineage. | F-A11 (pairs<10 magic) | Deleted — re-grounded as SPEC-B `r-provenance` (every spec clause's spec→code trace verified over graph edges, TRACE_GAP candidates feed second pass) | SPEC-A §2.6 → SPEC-B B6 |

## Tests deleted
- `src/audit-engine/layers/__tests__/r18-r21-lasme.test.ts` — exercised the four slop layers' candidate/verity paths (score<2, regex, magic thresholds). No longer applicable: detectors are Order-2 AST with specBindings.
- `src/audit-engine/layers/__tests__/r22-r25-paragon.test.ts` — exercised the Batch-B graph consumers (verb-substring, O(N) wiring, cluster, pairs). Re-grounded in SPEC-B B6.

## Registrations removed (index.ts)
- Imports: lines 62-70 (r18-r25 imports) → replaced with 6 LASME/MPSE candidate imports + parseSpecBindings + runAuditPipeline
- `constructor()` registerLayers: R18-R25 entries removed (R0-R17 only)
- `reset()` registerLayers: same
- `auditSingleLayer()` allLayers list: R18-R25 removed
- `computeLayerStats()` layerNames: R18-R21 names removed, r-lexicon/r-actor/r-state-machine/r-engine/r-adapter/r-mpse added
- Batch-A void-brief block (void brief + all-TRUE_POSITIVE self-stamp + theatrical log) deleted; replaced by SPEC-A §2.5 mandate block (6 layers → specBindings → S4 runner → verdicts → verdictToFinding with triads at emission, machineId = layer, never layer-engine)
- `layer-engine.ts` triad back-fill branch (`if (!f.triad) synthesize layer-engine`) deleted — MC-A-03: grep machineId='layer-engine' = 0

## What was NOT touched (keep set)
R0-R17, triad.ts (PARAGON-attributed type authority), AuditGraph store, event ingest, project-shape gate, enforcement ring, hunter (SPEC-B), math/ substrate.

## DEBUG_LOG pointer
Wave A5 closure: D-1 (void brief), D-2 (double emission), D-9 (triad back-fill), D-7/D-8 (keyword/regex slop), D-10 (O(N) graph) closed. Ship-gate opened as one-shot container check (warheads.bound, graph.awaited, build.singleFile, manifest.complete) in `src/audit-engine/ship-gate/checks.ts` — R16's verified pattern preserved, speculative tails dropped.

## Verification
- `grep -rn "void brief" src/audit-engine/` → 0 (A-1)
- `grep -rn "machineId.*layer-engine" src/audit-engine/` → 0 (MC-A-03)
- `grep -rn "r18-|r19-|r20-|r21-|r22-|r23-|r24-|r25-" src/audit-engine/index.ts` → 0 (A-10)
- `tsc --noEmit` → 0 (project-local)
- Ship-gate: `runShipGate(projectRoot)` returns 4 checks, all pure functions over repo

**End of lineage — Wave A5.**
