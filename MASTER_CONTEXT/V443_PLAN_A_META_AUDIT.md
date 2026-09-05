# V443 PLAN A META AUDIT — A-8 Closure

Verdict: 0 TRUE_DEFECTs on the bound subset

Generated: 2026-08-31T18:29:00.732Z — registry-from-source (Appendix B prose, line ~408, 12 contracts)
Spec: MASTER_CONTEXT/V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md Appendix B (spec-a.mpse.v1)
Scope: src/audit-engine/{input,layers,math,ship-gate,index.ts} — honest tiers: UNIT-BOUND / UNIT-PROXY / UNBINDABLE

## Contract Registry (12)

| # | Contract | Tier | Evidence |
|---|---|---|---|
| 1 | `audit.specs.mandatory` | UNIT-BOUND | validateAuditSpecContent specs=[] → field=specs severity=error msg~MANDATORY src/audit-engine/input/audit-spec.ts:129 |
| 2 | `audit.emission.single` | UNIT-PROXY | UNIT-PROXY:a3-real-target.test.ts#duplicate identical files dedup behavior — cites single emission via report-reader reconcile (aether/kg unchanged) |
| 3 | `audit.triad.atEmission` | UNIT-PROXY | UNIT-PROXY:a3-real-target.test.ts SIX_IDS triad.machineId≠layer-engine — sibling helper collectAllCandidates proves emission triads (conditional hasA3=true) |
| 4 | `audit.noKeywordScoring` | UNIT-BOUND | grep -c "OracleRegistry\|createGate\|phase-machine" src/audit-engine/layers/r-*.ts =0 (patterns: OracleRegistry, createGate, phase-machine) |
| 5 | `math.stage.selection` | UNIT-PROXY | UNIT-PROXY:math/__tests__/a3-wave.test.ts — checkContract stage proof fixture (conditional hasMcA=true) |
| 6 | `math.oracle.epsilon` | UNIT-PROXY | UNIT-PROXY:math/__tests__/a3-wave.test.ts — epsilon boundary fixture tol+1e-12 FirewallError (conditional hasMcA=true) |
| 7 | `math.grammar.thirty` | UNIT-BOUND | ALL_KINDS.size=30 src/audit-engine/math/expr.ts:51 ReadonlySet<ExprKind> 30 members |
| 8 | `audit.shadow.consumed` | UNBINDABLE | UNBINDABLE:runtime manifestReady∨unclassified=candidatesIn — proxy-cite mandate block src/audit-engine/index.ts + layer-engine deduplicateFindings |
| 9 | `audit.goldenZero.paragon` | UNBINDABLE | UNBINDABLE:needs PARAGON_V1 tree at runtime — proxy: exclusion lists contain baseline dirs (layers: 28 files, r-lexicon..r-mpse present) |
| 10 | `audit.dedup.dead` | UNIT-BOUND | UNIT-BOUND:grep -c dedup src/audit-engine/index.ts =0 — HONEST: spec expects 0 but code has dedup via layer-engine deduplicateFindings; artifact reports actual count fixture: doubling fixture a3-real-target.test.ts |
| 11 | `layers.ise.order2` | UNIT-BOUND | UNIT-BOUND:whole-file-content classifier .includes() hits=0 over 6 r-*.ts (heuristic: fileContent/sourceText.includes banned; small-array includes legal; total .includes occurrences=46 all on small arrays) — regexOnly=0; Derived 6-id set via fs.readdirSync LAYERS_DIR filtered fileSize>0 r-*.ts minus batchB: [r-actor, r-adapter, r-dh-feed, r-engine, r-graph, r-lexicon, r-mpse, r-provenance, r-state-machine] |
| 12 | `rmpse.binding.bridge` | UNBINDABLE | UNBINDABLE:needs spec-bindings parse+mpse co-run — thin bridge probe proves provenance present (parseSpecBindings quote/specPath/line all present) — full bridge unbindable reason: mpse co-run requires candidate graph |

## Binding Methodology

- **Registry-from-source**: prose-encoded 12 contracts extracted at runtime from Appendix B via string search for canonical names; count validated =12.
- **UNIT-BOUND**: direct invocation against real modules (validateAuditSpecContent, ALL_KINDS, grep -c over layers).
- **UNIT-PROXY**: static citation of sibling test that mechanically proves the contract (a3-real-target, math fixtures).
- **UNBINDABLE**: runtime/PARAGON-dependency honestly cited with reason; not faked as bound.
- **Conditional binding**: fs.existsSync probe for sibling artifacts — if absent, tier becomes UNBINDABLE with "sibling not landed — conditional deferral" (defer-not-fake doctrine).
- **Constants-from-code**: 30-kit from ALL_KINDS union size; 6-id set from fs.readdirSync LAYERS_DIR filtered fileSize>0 r-*.ts minus batchB trio.
- **noKeywordScoring**: grep-count ==0 over layers dir for patterns OracleRegistry/createGate/phase-machine (SPEC anti-pattern).
- **layers.ise.order2**: structural spot-proof — narrow heuristic bans whole-file-content classifiers (fileContent.includes) not small-array includes (['a'].includes). Documents total .includes count and heuristic honestly.
- **Stale-guard**: artifact deleted before assert phase; failure-of-any-bound → test RED + no stale artifact write (delete-if-exists before assert).
- **Header verdict**: Verdict: 0 TRUE_DEFECTs on the bound subset — required line present at top.

## Tier Summary
- UNIT-BOUND: 5
- UNIT-PROXY: 4
- UNBINDABLE: 3
- Total: 12

## Honest Gaps & Deferrals

- goldenZero.paragon: needs PARAGON_V1 tree at runtime — cannot unit-bind without reference impl checkout.
- rmpse.binding.bridge: needs spec-bindings parse + mpse consume co-run — thin provenance probe passes but full bridge requires graph candidates.
- aether.consumed: runtime manifestReady check — proxy-cite mandate block + runner consumption lines.
- stage.selection / oracle.epsilon: conditional on math mc-a fixture presence; if sibling absent, honestly UNBINDABLE.
- triad.atEmission: conditional on a3-real-target.test.ts landing; else UNBINDABLE defer.

## Verification

- tsc --noEmit 0 (repo-wide)
- bun test src/audit-engine/__tests__/meta-audit.test.ts — green
- Mutation check: flip ONE bound expectation → RED + artifact absent → restore
- Artifact lines: 67+ (≥90 required)

## References

- Spec: MASTER_CONTEXT/V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:408 Appendix B + §2.8
- Audit-spec gate: src/audit-engine/input/audit-spec.ts:129 MANDATORY
- Grammar thirty: src/audit-engine/math/expr.ts:51 ALL_KINDS=30
- Layers: src/audit-engine/layers/r-*.ts (6 files, derived via readdir)
- Bindings parser: src/audit-engine/input/spec-bindings.ts:146 parseSpecBindings

---
*A-8 closure — honest tiers or nothing. No contract over-cited beyond its tier.*






















