# PLAN A GAP ANALYSIS — V443 CODE AUDIT TOOL OVERHAUL

**Version:** 1.0 · **Date:** 2026-08-26 · **Status:** AUTHORITATIVE — the Plan A gap register
**Project:** `Shared Workspace Context/Trident_Agent/Active_Projects/v4.4.3`
**Author:** trident_build gap-analysis agent · **Reader:** the orchestrator's fix wave + Plan S closure
**Spec authority:** `MASTER_CONTEXT/V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md` (411 lines, Version 1.0, 2026-08-25)
**Scope:** Plan A owns the audit tool's input pipeline, math substrate, six ISE layers, rewire + deletions + ship-gate. It CONSUMES Plan S's shadow runner and Plan B B1's ontology. This document registers what the spec demanded, what the code delivers, and what remains to prove — with a file:line or command anchor per claim.

---

## TABLE OF CONTENTS
- §1 WHAT THE SPEC WAS
- §2 WHAT WAS BUILT
- §3 THE GAPS — the A-1..A-10 verdict table + the two load-bearing defects
- §4 CLEAR NEXT STEPS — ordered, dispatchable
- §5 THE COVERAGE MAP + THE HONEST RESIDUAL
- ANNEX A — Glossary of anchors
- ANNEX B — Files touched vs. files frozen

---

## §1 WHAT THE SPEC WAS — Plan A's intent, verbatim where the operator ruled

### §1.0 The one-sentence mandate

> "The audit tool is a production-grade CODE AUDITOR, not a prompt polisher" (operator, §0).

The spec rebuilds the mandate core — the LASME/MPSE enforcement the operator ruled "nothing ships without it" — as the three-part machine in `V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:36-48`:

```
Part 1 INPUT:       .trident/audit-spec.json — wave-spec-style, template shell,
                    in-turn compiler diagnostics, floors, specs[] MANDATORY
Part 2 CANDIDATES:  five LASME layers + R-MPSE — Order-2 AST detectors, two-sided
                    (SIDE-1 should-be-but-isn't | SIDE-2 is-but-wrong), emitting
                    typed triples onto PLAN B's ontology — zero keyword scoring
Part 3 ADJUDICATION: PLAN S's shadow — specs FULLY READ (read-turn ledger),
                    rubric applied, verdicts.json + report.md ON DISK,
                    findingsFromVerdicts() → TRIADS AT EMISSION, single emission
Substrate:          math/ rebuilt — doctrine-30 grammar × PARAGON runtime,
                    stage-respecting checkContract, epsilon oracle, brand firewall
```

What this spec does NOT build: the shadow runner (SPEC-S owns it), the graph (SPEC-B owns it), the hunter (SPEC-B). Plan A CONSUMES S's `runAuditPipeline` and B1's `LayerCandidate` triple types and OWNS: `input/audit-spec.ts`, `input/spec-bindings.ts`, `math/{expr,eval,contract,oracle,firewall}`, the six `layers/r-*.ts`, the `index.ts` rewire, the deletions, and `ship-gate/checks.ts`.

### §1.1 The input pipeline (spec §2.1, operator Q3 verbatim)

> "Same setup as the wave manager. dont change anything here. should be visible basically right next to the wave-spec.json if one was to look in the filebase. everything self contained keep it clean." (spec §2.1:81)

- **File:** `<target>/.trident/audit-spec.json`, workspace-scoped beside `wave-spec.json`, auto-created on first run, editable in place, re-validated in-turn by the `tool.after` hook.
- **Port:** mechanic-for-mechanic replication of `V4.4.2_WAVE_MANAGER_BATTLE_TESTED/src/tools/wave-spec.ts` (213L) — template shell, `isPlaceholder`, `validateSpecFile`, `formatDiagnostics`, ensure/reset, the `FRESH→EDITING→VALIDATED→RUNNING` machine.
- **Template shell (§2.1:88-96):** `codebase` (ABS src root, must EXIST), `specs[]` (ABS current-generation spec paths, must EXIST), optional `focuses[]` (≥30c), `knownContext` (≥200c), `doctrine` (≥100c), `measurements` (≥100c), `graphMode` (auto|on|off).
- **Validation (the 11-row compiler-style table, §2.1:100-112):** `codebase` absent/placeholder/not-existing → `error`; no `*.ts` recursively → `warning`; **`specs` EMPTY or missing → `error`: `audit-spec.specs: MANDATORY — ≥1 current-generation spec (the adjudication ground truth). A missing specs array is refused.`** (the law that kills silent adjudication without ground truth); specs[i] not-existing → `error`; mtime >45d → `warning`; floors <200c/100c → `error`; `focuses[i]` <30c → `error`; `graphMode=on` without graph → `error: graphMode=on but .trident/knowledge-graph has no SRO store → set auto or run the hunter first` (the silent-downgrade rejection: spec §8.3 verbatim — "graphMode=on + no graph: refused at the gate. The alternative (silent downgrade to auto) is REJECTED — silent downgrades are the theatrical class").
- **State machine + hook (§2.1:114):** `FRESH → EDITING (any edit) → VALIDATED (0 errors) → RUNNING (audit reads it) → reset → FRESH`. `tool.after` re-runs validation on every write and returns the formatted diagnostic block in the tool result. A run with ✗ errors is REFUSED with the full block.
- **Intent filter:** `graphMode` + `.ts`-scope warning — mismatches that would waste a run are caught at the file.

### §1.2 The math substrate (spec §2.2, audit report §6.1 ratified: doctrine-30 grammar × PARAGON runtime)

- **expr.ts — doctrine-30 union (KB-03:239-269, verified at source):** 30 kinds: `var, lit(number|string|boolean), add, sub, mul, div, mod, lt, le, gt, ge, eq, ne, and, or, not, if, card, sum, max, min, member, subset, setLit, forall, exists, prev, eventually, globally, until` — the 4 LTL kinds INCLUDED (the old plan's truncated read would have shipped 26). Rename table in the file header: `lit ↔ PARAGON num/bool/str · var ↔ PARAGON ref/sym · forall.in ↔ domain · setLit.xs ↔ elems`. `foldAdd/foldAnd` are BUILDERS over `add/and`, exported from a builders module.
- **eval.ts — PARAGON runtime, kept + extended:** 6 `EvalErr` codes (`UNBOUND_SYMBOL, TYPE_MISMATCH, DIV_BY_ZERO, DOMAIN_UNBOUNDED, TEMPORAL_NOT_EVALUABLE, DEPTH_EXCEEDED`) verbatim from PARAGON `eval.ts:11`; depth 256, domain 10k, strict-and, temporal-throws — kept; extended to 30 kinds (lit string arm; `member`/`subset` over set bindings).
- **contract.ts — stage-respecting checkContract (kills D-3/F-A3):** `type Stage = 'pre'|'post'|'inv'|'temporal'`; `checkContract(c, stage, bindings)` evaluates ONLY `stage`'s expr set (KB-03:336-360). Role ladder: `pre→REJECT · post→THROW(MathPostconditionError) · inv→DIE(InvariantDeath) · temporal→ESCALATE`. Typed errors `PreconditionRejected, MathPostconditionError, InvariantDeath, SupervisionEscalation` (KB-03:525/711/785/1162). Keeps PARAGON's `provenance` field.
- **oracle.ts — epsilon law (kills D-4/F-A4):** `OracleDeclaration{exprId, oracleValue, anchor, unit?, epsilon}` — **epsilon REQUIRED at registration** (PARAGON `oracle.ts:43`); `discharge()` ported (PARAGON `oracle.ts:75`); `contentHash` kept; `|evaluated − oracle| ≤ epsilon` everywhere (KB-01:357-360).
- **firewall.ts — brand gate (KB-02:658-668, 744-751), NEW file:** `declare const __verified: unique symbol`; `VerifiedMathSpec{expression, bindings, oracle, tolerance, [__verified]: true}`; `passThroughFirewall(raw): VerifiedMathSpec` — `|eval−oracle|≤tol` else `FirewallError`, the ONLY constructor; `materializeCode(spec: VerifiedMathSpec): string` — brand-only (compile-time).
- **Sets as bindings (kills D-5/F-A5):** `extractBindings` maps `Set/Array → set binding` (no `Set→string` cast); `evalExpr`'s set arms (`member/subset/card/sum/max/min`) consume them directly.

### §1.3 The six ISE layers — five LASME + R-MPSE (spec §2.3-2.4, the ISE law)

**The law:** every layer is a TWO-SIDED Order-2 AST detector emitting TYPED TRIPLES onto Plan B's ontology — zero keyword scoring (`grep -rn "OracleRegistry|createGate|phase-machine|EvidenceTriad.*score" layers/r-*.ts → 0`). Shared shape (`spec §2.3:158-168`):

```typescript
interface LayerCandidate {
  readonly subject: string;
  readonly predicate: 'shouldBe'|'isButWrong'|'violates'|'wraps'|'declares';
  readonly object: 'Lexicon'|'Actor'|'StateMachine'|'Engine'|'Adapter'|'Contract';
  readonly file: string; readonly line: number;
  readonly evidenceQuote: string;
  readonly implicatedSpecClause?: string; // detector's hint (specPath:line — agent verifies)
  readonly side: 'SIDE-1' | 'SIDE-2';
}
export function candidates(ctx: AnalysisContext, specBindings: SpecBindings): LayerCandidate[];
```

**SIDE-1 = SHOULD be this architecture (per specs) and IS NOT · SIDE-2 = IS this architecture and is coded WRONG.**

Per-layer predicate tables (spec §2.3:172-182):

| Layer | Spec § | S1 (shouldBe) | S2 (isButWrong) |
|---|---|---|---|
| **R-LEXICON** | C9/C10, LEX:89-109, ISE:22-34 | Decision logic `specBindings` declare rule-driven existing as if-chains/regex towers (ISE SIG-1 ≥5 pass-branches/default-pass; SIG-2 regex bodies + no AST walker) with no `PatternFamily`; repetitive judgment with no `id/kind/matcher/severity/exampleHits` shape | `PatternFamily` present but regex-only (Order-1), missing `exampleHits` (≥1 pos + ≥1 neg), missing `triggerCondition/severity/messageTemplate/remediationHook`, or lexicon with NO consumer machine (LEX:736 I/O law) |
| **R-ACTOR** | C2/C7/C8 | Stateful concurrent units specs describe as bare classes with manual lifecycle — no `createActor().start()`, no `send/subscribe`; hook/warhead handlers not via `HookRegistry` `Map` shape | Actor never `.start()`ed, no failure subscription, `actor count ≠ machine count`, `fromPromise` missing at invoke sites |
| **R-STATE-MACHINE** | C1/C10/C12 | Staged workflow (`idle→building→testing→deploying→deployed`) as scattered booleans/flags — no `createMachine`; spec-declared gates as ad-hoc `if` — no `GateCriteria/GuardCondition` | Machine untyped (no `setup({types})`), no `final`/`error` states, guards not `MathExpr`-routed, missing `INCONCLUSIVE`, ladder absent (`INFORM→WARN→BLOCK→REVERT→ESCALATE`) |
| **R-ENGINE** | C3/C5/C6 | Heavy analysis (`ts.createProgram`-class) in hook handlers/module functions — no plain-class engine; evidence-generating work with no evidence-file writes | Engine not plain class, no real computation (theatrical shell), no `try/catch` degrade, no `.shark/*-evidence/` writes; `Container` WITH methods; supervisor without `budget/WAL` |
| **R-ADAPTER** | C4 | Cross-boundary translation specs declare done by direct calls — no 3-call adapter; N/M adapters gap | Adapter missing 3-call leg (`delegate→actor.send(TOOL_AFTER)→snapshot merge`), no snapshot merge, `adapter count ≠ engine count` |
| **R-MPSE** | §2.4 | For each literal-comparison site (`ts.BinaryExpression`, `∉{0,1,-1,2}`) in an enforcement-domain file whose `specBindings` declare a binding: spec's `MathContract` exists BUT site literal NOT bound → `shouldBe Contract` | `MathContract/checkContract/oracle` call-site BUT stage not respected / oracle without epsilon / `MathExpr` declared but `evalExpr` never invoked / named constant VALUE ≠ spec binding (`|code−spec| > tolerance`) → `violates/isButWrong Contract`; per-candidate `|Δ|` pre-computed via `evalExpr` |

Order-2 mechanics only: `ts.isCallExpression` callee resolution (`createMachine/createActor/setup/fromPromise/subscribe/send`), `HeritageClause+InterfaceDeclaration` walkers (`PatternFamily` shape), `PropertyAccess` chains, `ClassDeclaration` analysis, `callgraph.whoCalls/unwired`. Detectors consult `specBindings` so S1 fires only where a spec declares the should.

**R-MPSE evaluation (§2.4:212-215):** pre-computes `evalExpr(bound-expr, {codeValue}) vs {specValue, tolerance} → |Δ|` riding the candidate. Shadow adjudicates: `TRUE_DEFECT` requires spec clause + code site + divergence sentence (rubric Law 1); `RED_HERRING` names the structural reason.

**specBindings parser (§2.4:220):** bounded parser over `specs[]` text extracting `MathContract`-shaped declarations — `name=value`, `name: value ± tol`, backtick tables, JSON blocks, threshold phrases (`threshold 0.38`, `≥ 0.96`), cardinalities (`|O|=24`). Output: `SpecBindings{declarations: Array<{name,value,tolerance,specPath,line,quote}>}` — THE bridge from spec prose to the substrate.

### §1.4 The rewire — single emission + triads at emission (spec §2.5, kills D-1/D-2/D-9/D-13)

The audit pipeline becomes single-emission. `index.ts` mandate block replaces the old Batch-A void-brief self-stamp at `:257-290`:

```
audit() :184
  ├─ :240-250 prelude (countTsFilesInTarget, EMPTY_TARGET — kept)
  ├─ :253 evaluateAll(R0-R17 ONLY — six new layers NOT registered there; they are CANDIDATE PRODUCERS)
  ├─ :256 enrichWithHiveKnowledge (kept)
  ├─ NEW MANDATE BLOCK (replaces :257-290 wholesale):
  │     1. specBindings = parseSpecBindings(auditSpec.specs)
  │     2. candidates = concat(rLexicon, rActor, rStateMachine, rEngine, rAdapter, rMpse)
  │     3. shadowRun = runAuditPipeline({runId, targetRoot, specs, candidates, chain, budgetRounds})  ← SPEC-S S4
  │     4. verdicts = parseVerdicts(shadowRun.ledger)  ← on-disk, never context text
  │     5. findings = candidates.map((c,i) => verdictToFinding(c, verdicts[i], LAYER_MACHINE_ID[c.layer])).filter(Boolean)  ← RED_HERRING→null
  │     6. enrichedFindings = [...enrichedFindings, ...findings]  ← ONE append point
  └─ ScoreGate/score/graph/report tail UNCHANGED
```

Triad at emission: `verdictToFinding` synthesizes `{pattern:{memberId: c.predicate+'.'+c.object, familySeverity}, state:{machineId: LAYER_MACHINE_ID[c.layer], from:'ANALYZED', to:'EVIDENCED'}, evidence:{file:c.file, line:c.line}}` where `LAYER_MACHINE_ID = {r-lexicon,r-actor,r-state-machine,r-engine,r-adapter,r-mpse}` — never `layer-engine`. `layer-engine.ts` post-hoc back-fill DELETED; store gate at `:350` enforces no-triplet skip (now dead code because every finding carries its triad). Log line: `MANDATE: ${candidates.length} candidates → shadow ${ready?'READY':'PARTIAL'} — verdicts TP:${...}` — real manifest counts. UNCLASSIFIED: brain-dead shadow still yields `MEDIUM/UNCLASSIFIED` findings — audit never loses candidates.

### §1.5 Deletions + ship-gate + Batch B (spec §2.6-2.7)

- **Wipe (operator Q2, spec §2.6:262):** DELETE source+tests for `r18-component-presence, r19-claims-without-machinery, r20-ungrounded-thresholds, r21-dead-enforcement-surface, r22-spec-enablement` (R23-R25 also go — successors are SPEC-B B6's `r-graph/r-dh-feed/r-provenance`). De-register every removed import/registration (`index.ts:62-70, :127, :190-197, :519-520`, singleLayer list). Write `MASTER_CONTEXT/DELETED_R18_R25.md` — lineage: what each layer was, why it died (D-ids), what replaced it, DEBUG_LOG pointer.
- **Ship-gate (R16 pattern preserved):** `src/audit-engine/ship-gate/checks.ts` — one-shot check-cluster: `warheads.bound`, `graph.awaited`, `build.singleFile`, `manifest.complete`. Run position: ONE-SHOT at container-test time (NOT per-audit).
- **Batch B (spec §2.7):** `graphMode` law: `auto` (active iff SRO store exists) / `on` (refuse if absent) / `off` (never). When active, AFTER mandate block's findings: `R-GRAPH` (wiring parity via B3 engine, ONE shared DB handle — D-10 dead), `R-DH-FEED` (hunter findings table as CANDIDATES re-adjudicated by second shadow pass), `R-PROVENANCE` (every spec clause's trace over graph edges BFS ≤64 — TRACE_GAP candidates feed second pass). Second brief: same SPEC-S runner with Batch-B candidates + graph neighborhood — triads at emission, machineIds `r-graph/r-dh-feed/r-provenance`. Two-batch sequencing: Batch A's findings+report are INPUTS to Batch B's demand. L8 write-back: both batches' findings land as typed edges.

### §1.6 The MPSE wiring + Appendix B — the A-1..A-10 criteria verbatim + the 12 contracts

**Success criteria (spec §6:368-377, verbatim):**

```
A-1  grep -rn "void brief" src/audit-engine/ → 0
A-2  audit refuses to run with empty/missing specs[] (A1's gate — container S-token)
A-3  full run on fixture target: candidates → ledger verdicts → findings; every finding's triad.machineId ∈ six layer ids (0 'layer-engine')
A-4  doubling fixture: seeded candidate appears exactly once in findings
A-5  MC-A-05/06/07 green (stage proof, epsilon boundary, 30-kind count)
A-6  golden-zero: PARAGON_V1 as target → 0 R-LASME findings (pre-shadow: 0 candidates)
A-7  container 8 scenarios PASS with pass-tokens in tool-result context; .trident/container-test-results.json written
A-8  META-AUDIT: tool audits own layers/input/rewire against §2.8 registry → 0 TRUE_DEFECTs
A-9  tsc --noEmit 0 · preflight ≥951/0 · 44 committed legacy fixtures still green
A-10 DELETED_R18_R25.md exists with lineage table; grep "r18-|r19-|r20-|r21-|r22-|r23-|r24-|r25-" src/audit-engine/index.ts → 0
```

**12 MPSE contracts (spec §2.8:302-315 + Appendix B:408):**

| ID | Contract | Expr / Oracle | What it proves |
|---|---|---|---|
| **MC-A-01** | `audit.specs.mandatory` | `pre: card(specs) ≥ 1` | A1 gate REFUSES otherwise; oracle 0 empty-specs runs |
| **MC-A-02** | `audit.emission.single` | `post: count(findingEmissionPoints)=1` (ONE append per batch) | single emission; `1, tol=0` |
| **MC-A-03** | `audit.triad.atEmission` | `post: ∀f ∈ findings: f.triad.machineId ≠ 'layer-engine'` | triads at emission; 0 back-fills |
| **MC-A-04** | `audit.noKeywordScoring` | `grep("OracleRegistry\|createGate\|phase-machine", layers/r-*.ts)=0` | zero keyword scoring; `0, tol=0` |
| **MC-A-05** | `math.stage.selection` | `checkContract(c,'post',b)` evaluates ONLY `c.postconditions` | stage unit proof |
| **MC-A-06** | `math.oracle.epsilon` | `∀d ∈ oracleDeclarations: present(d.epsilon) ∧ |eval−oracle|=tol+1e-12 → FirewallError` | epsilon boundary |
| **MC-A-07** | `math.grammar.thirty` | `count(ExprKind union members)=30` | 30-kind count; `30, tol=0` |
| **MC-A-08** | `audit.shadow.consumed` | `manifestReady ∨ unclassifiedEmitted = candidatesIn` | every candidate resolves |
| **MC-A-09** | `audit.goldenZero.paragon` | `audit(PARAGON_V1, specs=[bible]) → count(R-LASME findings)=0` | conformance ceiling |
| **MC-A-10** | `audit.dedup.dead` | `grep("dedup", index.ts)=0 ∧ doubling fixture` | no doubling; `0 doubled` |
| **MC-A-11** | `layers.ise.order2` | `regexOnlyClassifierCount=0` on every `r-*.ts` | ISE SIG-2 dead; `0` |
| **MC-A-12** | `rmpse.binding.bridge` | `∀d ∈ specBindings.declarations: present(d.quote) ∧ present(d.specPath) ∧ present(d.line)` | provenance present; 0 orphans |

---

## §2 WHAT WAS BUILT — the actual code on disk, file:line-anchored

### §2.0 Build health at the time of this analysis

| Signal | Value | Evidence |
|---|---|---|
| `tsc --noEmit` | `0` errors repo-wide | orchestrator + agent compile runs; `a4-six-layers.md:7` ("0 errors across all 6 layers"); `a5...:9` ("audit-engine battery 1745 pass / 0 fail") |
| `bun build src/index.ts --outdir dist --target bun --format esm --bundle` | byte-identical `sha256 aa1cdc6b90a7dcb7`, reproducible | known measurements table: "dist sha aa1cdc6b90a7dcb7 byte-reproducible"; `a4-six-layers.md:9` ("bun build 19.50KB exit 0") |
| Bundle mandate presence | `5x runAuditPipeline` strings in dist | known measurements: "bundle carries the mandate (5x runAuditPipeline)" |
| Bundle guard | `3x AST_FILE_TOO_LARGE` in dist | same |
| Fatal-abort strings | `2x scope probe FATAL` in dist | same |
| `.ts` inventory | `426` files under `src/` | `find src -name '*.ts' | wc -l = 426` (known context) |

### §2.1 The input pipeline — audit-spec.ts

**File:** `src/audit-engine/input/audit-spec.ts` (285 lines, read fully).

This file IS the A1-delivered port of wave-spec mechanics. Anchors:

- `audit-spec.ts:5` `AUDIT_SPEC_RELATIVE_PATH = '.trident/audit-spec.json'` — the wave-spec adjacency law (visible beside `wave-spec.json` in `.trident/`).
- `audit-spec.ts:7-19` `AuditSpecState` + `getAuditSpecState/setAuditSpecState` + `transitionOnValidate` + `markRunning/resetState` — the `FRESH→EDITING→VALIDATED→RUNNING` machine (`:13-19` encodes `hasError → EDITING else VALIDATED`).
- `audit-spec.ts:21-31` `buildTemplateShell()` — every field carries its bracketed instruction, exactly spec §2.1's shell.
- `audit-spec.ts:33-51` `isPlaceholder/isTemplateShell` — the `[FLOOR|TARGET|SET TO|...|ABS PATH|OPTIONAL]` detector.
- `audit-spec.ts:60-86` `hasTsFilesRecursive` — walks the tree with `skip = {node_modules, dist, .git, .trident, coverage, .next, build, out}` for the `.ts` existence warning.
- `audit-spec.ts:88-91` `hasKnowledgeGraph` — checks `.trident/knowledge-graph/shared.db`.
- **`audit-spec.ts:93-225` `validateAuditSpecContent`** — the 11-row table mechanically implemented:
  - `:101-126` `codebase` absent/placeholder/not-absolute/not-existing → `error` with the spec's verbatim diagnostic.
  - **`:128-162` THE MANDATORY specs gate:** `if (!Array.isArray(specs) || specs.length === 0) → error: 'audit-spec.specs: MANDATORY — ≥1 current-generation spec (the adjudication ground truth). A missing specs array is refused.'`** This is the exact string spec §2.8 MC-A-01 names. Per-spec checks: placeholder → error, not-absolute → error, not-existing → error, mtime >45d → warning (with `freshnessDays` override at `:133`).
  - `:164-178` `CTX_FLOORS` (`knownContext 200, doctrine 100, measurements 100`) with placeholder-aware floor checks.
  - `:180-202` `focuses[]` (`≥30c` per entry, placeholder-aware).
  - `:204-222` `graphMode` — `auto|on|off` only; `on` without graph → `error` with the spec's verbatim string (`:218`).
- `audit-spec.ts:237-257` `formatDiagnostics` — `✗/⚠` + `→ fix` compiler style, errors/warnings counts, ready message.
- `audit-spec.ts:266-285` `ensureAuditSpecFile/validateAuditSpecFile/assertAuditSpecValid/revalidateOnWrite` — the file-ensure, in-turn validate, and hook seam (`revalidateOnWrite` is what `tool.after` calls).

**Wave audit:** `a1-input-pipeline.md:5` verified `:129-130` fires exactly; `56 pass / 0 fail / 65 expect` on `__tests__/audit-spec.test.ts`; "Zero coupling: imports only `node:fs + node:path`" — CORRECT.

**One noted honesty:** the `tool.after` hook's OWN diagnostic render lives in the host's `trident-tools.ts` (not in this file) — `a1-input-pipeline.md:11` honestly logs "tool.after wiring deferred to A5 (mandate block consumes `assertAuditSpecValid`)".

### §2.2 The specBindings parser — spec-bindings.ts

**File:** `src/audit-engine/input/spec-bindings.ts` (295 lines, read fully).

Output type: `SpecBindings{declarations: SpecBindingDeclaration[], unclear: SpecBindingUnclear[]}` where each `SpecBindingDeclaration{ name, value, tolerance, specPath, line, quote }` — provenance-present per declaration (MC-A-12's shape).

Parsers tried in order per line (`tryParseLine:132-144`): `tryParseCardinality → tryParseThreshold → tryParseNameEquals → tryParseNameColon → parseTableRow`. Helpers:

- `extractTolerance:27-40` — `± / +/- / tolerance:`.
- `tryParseNameEquals:42-51` — `name = num [tol suffix]`.
- `tryParseNameColon:53-63` — `name: num [tol suffix]`.
- `tryParseThreshold:65-81` — `threshold/at least/≥/>= NUM`.
- `tryParseCardinality:83-93` — `|inner| = NUM`.
- `parseTableRow:95-117` — pipe tables `(headerHints set guards against false-positive on header rows)`.
- `isLooseBindingIntent:119-130` — gates the `unclear` path so non-binding prose is not silently dropped (D6-class).

Main loop `parseSpecBindings:146-294`: iterates `specPaths[]`, `readFileSync` per path (read failure → `unclear`), then per-line with three regimes: backtick-fenced blocks (`inBacktick` at `:184-208`), JSON blocks (`inJson` at `:210-262`, handling nested braces via `jsonDepth`), and plain prose (`:264-290`). Every successful parse pushes a declaration with `specPath, line, quote`; every loose-intent-but-unparseable line pushes `unclear` with `reason`. Empty input `specPaths.length===0 → {declarations:[], unclear:[]}` at `:153-155`.

The parser is BOUNDED (only the 4 declaration shapes + the two container formats) — exotic formats → `unclear`, never silent drop (Appendix A's Z-A2 closure). Coverage fixture required: a binding at spec END is parsed (AP-A-5's detector — not yet committed as a test; see §3 gap).

### §2.3 The six ISE layers — r-lexicon through r-mpse (Order-2, file:line-verified)

All six export `candidates(ctx: AnalysisContext, specBindings: SpecBindings): LayerCandidate[]` and share the `LayerCandidate` triple shape of spec §2.3:158-168. All walk `ts.SourceFile` via the TypeScript Compiler API — never whole-file `includes()` (the A4 QC steer killed the ISE SIG-2 class mid-wave; see §2.7.1).

#### r-lexicon.ts — 218 lines, Order-2 verified

- **`r-lexicon.ts:17-33` `collectSourceFiles`:** walks `ctx.constructsByFile` → `constructs[0]!.node.getSourceFile()` per file.
- **`r-lexicon.ts:35-100` `hasPatternFamilyShape`:** `visit` walks `InterfaceDeclaration|TypeAliasDeclaration` whose `name` contains `patternfamily` (case-folded), extracts members via `NamedDeclaration.name.getText(sf)` at `:54` and `:77` — the QC-steer fix: "18 → 4 includes + `sf.getPos()` bug" (`a4-six-layers.md:6`). Fields tracked: `id,kind,matcher,triggerCondition,severity,messageTemplate,remediationHook,exampleHits`. `hasExampleHits` flagged separately.
- **`r-lexicon.ts:102-139` `countIfChainDepth/hasDecisionLogicShape`:** `ts.isIfStatement` else-chain depth + `SwitchStatement caseBlock.clauses.length ≥ 3` — ISE SIG-1 detection, AST-based.
- **`r-lexicon.ts:141-161` `lexiconSpecDeclared`:** consults `specBindings.declarations` for `lexicon|pattern|rule` (fallback: `threshold|tolerance`).
- **`r-lexicon.ts:163-218` `candidates`:** S1 `specInfo.declared && !pf.found && hasDecision` → `{shouldBe, Lexicon, SIDE-1}` at `:178-189`; S2 `pf.found && missing∈{triggerCondition,severity,messageTemplate,remediationHook,exampleHits}` → `{isButWrong, Lexicon, SIDE-2}` at `:191-208`. Every push carries `file, line, evidenceQuote, implicatedSpecClause, side`.

#### r-actor.ts — 252 lines, Order-2

- **`r-actor.ts:43-53` `isCallByName`:** `Identifier` or `PropertyAccessExpression` callee `name` match — the ONLY callee resolution primitive.
- **`r-actor.ts:55-130` `analyzeActorCalls`:** walks `CallExpression` for `createActor/fromPromise/subscribe/send/start`, `PropertyAccessExpression` for `HookRegistry`, `ClassDeclaration` count, `NewExpression(Map)` → `hookRegistry` variable check.
- **`r-actor.ts:150-162` `countMachines`:** counts `createMachine` calls — needed for the `actor count ≠ machine count` parity check.
- **`r-actor.ts:164-252` `candidates`:** S1 `specInfo.declared && classDecls>0 && createActorCount===0` → `shouldBe Actor`; S2 `createActor>0 && startCount===0` → `isButWrong` (`:203-214`), `subscribeCount===0` → `isButWrong` (`:216-227`), `totalActors≠totalMachines` → `isButWrong` (`:233-247`).

#### r-state-machine.ts — 287 lines, Order-2 (QC-steered)

- **`r-state-machine.ts:43-72` `getSetupTypesInfo`:** walks `CallExpression` `setup` → `ObjectLiteralExpression` `types` prop via `isPropertyAssignment` + `name.getText(sf)` at `:56`.
- **`r-state-machine.ts:74-157` `analyzeMachineConfig`:** walks the `createMachine(config)` call's `ObjectLiteralExpression` `states` map — each `stateProp.name.getText(sf)` at `:95`, inner `type` check for `'final'` at `:105`, ladder set `INFORM|WARN|BLOCK|REVERT|ESCALATE` at `:97`, `INCONCLUSIVE` detection via `walkForInconclusive` at `:143-151` (PropertyAssignment name + StringLiteral text). Also resolves `setup(...).createMachine` chained case at `:124-141`.
- `a4-six-layers.md:5` explicitly records: "QC STEER LANDED: `r-state-machine` rewritten from whole-file `.includes()` (SIG-2) to Order-2 AST walkers (`isObjectLiteralExpression/PropertyAssignment/StringLiteral` over the `createMachine` config)" with the agent's ACK "QC steer received — rebuilding detectors to pure Order-2".
- **`r-state-machine.ts:221-287` `candidates`:** S1 `specInfo.declared && machines.length===0 && hasScatteredBooleanFlags` at `:246`; S2 per-machine `untyped/no-final/missing-INCONCLUSIVE/ladder-absent` at `:260-277`.

#### r-engine.ts — 300 lines, Order-2

- **`r-engine.ts:44-54` `isCallByName`** (same primitive).
- **`r-engine.ts:56-142` `analyzeEngineShape`:** `createProgram/writeFile/appendFile/degrade` via `CallExpression`; `PropertyAccessExpression` for `writeFile/writeFileSync/degrade`; `ClassDeclaration` with `heritageClauses` walk at `:86-92` (plain-class = no `extends Plugin/Framework/Base`); `Container` method count vs `Supervisor` `budget/WAL` identifier walk at `:98-117`; `TryStatement` at `:119-131`.
- **`r-engine.ts:194-300` `candidates`:** S1 `specInfo.declared && heavyInHook && !hasClass` at `:208-219`; S2 `hasClass && !isPlainClass` (`:220-231`), `!hasCreateProgram` (`:232-243`), `!hasEvidenceWrite` (`:244-255`), `!hasDegrade && !hasTryCatch` (`:256-267`), `containerWithMethods` (`:268-279`), `supervisorWithoutBudget` (`:280-291`).

#### r-adapter.ts — 237 lines, Order-2

- **`r-adapter.ts:53-113` `analyzeAdapterShape`:** `ClassDeclaration|InterfaceDeclaration` name `Adapter/*Adapter` at `:64`; `createMachine` is NOT this file's concern — instead `delegate/send` at `:67-80` (with `TOOL_AFTER` literal/property arg scan at `:75-77`), `ObjectLiteralExpression` spread / `Object.assign` at `:83-90` for snapshot merge, direct `tool.execute|handleEvent` without adapter at `:99-108`.
- **`r-adapter.ts:150-237` `candidates`:** S1 `specInfo.declared && hasDirectCallWithoutAdapter` at `:176-187`; S2 `adapterCount>0 && (!hasDelegate||!hasActorSend)` at `:189-200`, `!hasSnapshotMerge` at `:201-213`, `totalAdapters≠totalEngines` at `:218-232`.

#### r-mpse.ts — 291 lines, Order-2 + substrate-wired

- **`r-mpse.ts:58-105` `collectLiteralComparisons`:** `BinaryExpression` + comparison `SyntaxKind` (`<,<=,>,>=,==,===,!=,!==`) at `:65-72`, `NumericLiteral` extraction exclusive of `{0,1,-1,2}` at `:81`, exact `line+quote+literal+operator` tuple.
- **`r-mpse.ts:116-168` `analyzeContractCalls`:** `checkContract` arity check for `stage` arg at `:128-131`, `epsilon/tolerance` identifier + `ObjectLiteralExpression` prop scan at `:143-157`, `MathExpr/MathContract` decl at `:146-148`, `evalExpr` call at `:134`, `NumericLiteral` constant map at `:139-141`.
- **`r-mpse.ts:170-291` `candidates`:** S1 `:183-225` — for each site × each `specBindings` decl, builds `lit` `MathExpr` pair, runs the A3 substrate `evalExpr` under `{profile:'default', values:{}, depthLimit:256, domainSizeLimit:10_000}`, computes `delta = |site.literal − decl.value|`, synthesizes a `MathContract` with `le(delta, tolerance)` postcondition and runs `checkContract(contract,'post',{delta})` — only when `checkContract` verdict ≠ `VALID` and the constant is not already bound does it emit `shouldBe Contract` with `delta` riding the candidate. S2 `:227-283` — `checkContract && !hasStageArg` → `violates`; `!hasEpsilonField` → `isButWrong`; `hasMathExprDecl && !hasEvalExprCall` → `isButWrong`; value-drift `|codeVal − specVal| > tolerance` → `violates` with `delta`.

### §2.4 Batch-B layers — r-graph, r-dh-feed, r-provenance (graph-activated, ONE-handle law)

These three CONSUME the graph and are silent when `isBatchBActive(targetPath) === false` — the silent law (no findings, count unchanged).

- **r-graph.ts** (188 lines): `candidates(ctx, graph: QueryEngine)` — `temporal({liveOnly:true})` nodes+edges, `buildInboundMap/buildOutboundMap`, unwired-export parity (`hasOutExport && !hasInbound && !inbound.has('imports')` at `:99-103`), adapter→machine wiring (`kind Adapter` + `calls/wraps → Machine/Engine` at `:138`), fallback wiring-gap (`typed nodes but zero wiring predicates` at `:169`).
- **r-dh-feed.ts** (167 lines): `candidates(ctx, findings: HunterFindingRow[]|QueryEngine)` — loads `shared.db` `findings` rows via `SELECT rule_id,severity,file,line,evidence FROM findings LIMIT 200` at `:40`, or `graph.findings` array, maps each to `LayerCandidate` with `rule_id` as subject and a predicate/object inferred from the lowercased rule name at `:88-92`, `SIDE-1` always (needs second-pass adjudication; `cluster≥5` magic dead).
- **r-provenance.ts** (191 lines): `candidates(ctx, specClauses: string[]|QueryEngine)` — normalizes clauses (`:24-59`), synthesizes `SpecClause:<hash>` node ids (`:60-68`), when graph absent emits `TRACE_GAP` fallback per clause (`:116-131`), when graph present does bounded `path(fromId, targetId, {maxDepth:64})` BFS over `typed_edges` for each `SpecClause → Code` target (`:145-163`), missing path → `TRACE_GAP` `SIDE-1`. `PATH_BOUNDED` is re-thrown.

All three use `resolveTargetPath(ctx)` → `ctx.projectRoot` and check `isBatchBActive` via `layers/activation.ts` (the `graphMode` gate's consumer).

### §2.5 The mandate block — index.ts:245-360 (single emission, triads at emission)

**File:** `src/audit-engine/index.ts` (1008 lines, read fully; mandate spans `:284-397`).

This is the SPEC-A §2.5 wiring, replacing the old void-brief self-stamp. Structure exactly as spec mandates:

1. **`index.ts:287-298` specBindings parse:** reads `<target>/.trident/audit-spec.json` (exists → `specPaths = parsed.specs.filter(string>0)`), calls `parseSpecBindings(specPaths)` with degraded fallback `{declarations:[], unclear:[]}` on throw (`:298`).
2. **`index.ts:300-308` six-layer concat:** `LAYER_MAP['r-lexicon'] = rLexiconCandidates(ctx, specBindings)` through `rMpse` at `:308`, each in its own `try` with degraded `[]` on failure. `orderedLayers = ['r-lexicon','r-actor','r-state-machine','r-engine','r-adapter','r-mpse']` at `:310`, flattened into `allCandidates: Array<Lc & {layer,index}>` with global `index` at `:311-317`.
3. **`index.ts:319-326` shadow run S4:** maps `allCandidates → CandidateTriple[]` (the B1 ontology triple: `index,layer,side,file,line,predicate,evidenceQuote,implicatedSpecClause,subject,object`), calls `runAuditPipeline({runId: mandate-${Date.now()}, targetRoot, specs, candidates: triples})` at `:325`; throw → degraded `JSON.stringify({ready:false, counts:{candidatesIn: triples.length, ...unclassifiedEmitted: triples.length}})` at `:326`.
4. **`index.ts:328-342` verdicts parse:** reads `.trident/audit-ledger/<runId>/verdicts.json` (supports `{verdicts:[]}` or bare array) at `:334-341`.
5. **`index.ts:344-393` verdictToFinding + triads:** `LAYER_MACHINE_ID = {r-lexicon, r-actor, r-state-machine, r-engine, r-adapter, r-mpse}` at `:345`; `byIndex = Map(findingIndex→verdict)` at `:346`; for each candidate: `adjudication = v?.adjudication ?? (manifest.ready? 'UNCLEAR':'UNCLEAR')` at `:353`; `RED_HERRING → continue` at `:354`; `seenKeys` dedup at `:355-357` (MC-A-10); `isUnclassified = !manifest.ready || adjudication∈{UNCLEAR,UNCLASSIFIED}` at `:358`; severity/category/description mapped accordingly at `:359-363`; **triad synthesized** at `:378-382` with `pattern:{memberId: predicate.object, familySeverity}, state:{machineId: LAYER_MACHINE_ID[layer], from:'ANALYZED', to:'EVIDENCED'}, evidence:{file,line}` — machineId is the layer, never `layer-engine` (MC-A-03). **ONE append** at `:388`: `enrichedFindings = [...enrichedFindings, ...mandateFindings]` (the single emission MC-A-02). Log at `:393` carries real manifest counts.
6. Else `0 candidates → MANDATE: 0 candidates → shadow READY` at `:395`.

**Batch-B second brief** at `index.ts:399-507`: `isBatchBActive` check (`:401`, degraded `false`); ONE shared `Database(shared.db, {readonly:true})` + `PRAGMA query_only=ON` at `:409-411` (D-10 dead); single `QueryEngine(sharedDb)` at `:412`; reads `specPathsB` (`:416-422`), `rGraphCandidates(ctx, sharedEngine)` + `rDhFeedCandidates(ctx, sharedEngine)` + `rProvenanceCandidates(ctx, citedClauses||sharedEngine)` at `:424-433`, flattens to `batchBAll` (`:436-439`), second `runAuditPipeline({runId: audit-${Date.now()}-B, ...})` at `:444`, verdicts read from ledger `:448-457`, per-candidate triads at `:470-491` with `r-graph|r-dh-feed|r-provenance` machineIds, second ONE append at `:494`, close at `:505`.

The pre-existing tail (ScoreGate, project-shape gate, graph write-back, enforcement ring, Step-X, shadow report) at `:509-693` is untouched by Plan A except that the findings it scores now flow from the mandate.

### §2.6 Deletions + ship-gate

- **Deleted:** `r18-component-presence.ts, r19-claims-without-machinery.ts, r20-ungrounded-thresholds.ts, r21-dead-enforcement-surface.ts, r22-spec-enablement.ts, r23-wiring-conformance.ts, r24-findings-feed.ts, r25-provenance-lineage.ts` + tests `r18-r21-lasme.test.ts, r22-r25-paragon.test.ts` — 8+2 files gone.
- **De-registered:** `index.ts:62-77` imports now the six `candidates` + `parseSpecBindings + runAuditPipeline + isBatchBActive + rGraph/rDhFeed/rProvenance` (`:62-77`); constructor `registerLayers([R0..R17])` only at `:134`; `reset()` same at `:175-198`; `auditSingleLayer` `allLayers` list at `:728-736` is `R0..R17` only; `computeLayerStats` `layerNames` removed `r18..r25` (verified via `a5...:5`).
- **Lineage doc:** `MASTER_CONTEXT/DELETED_R18_R25.md` (42 lines, `5302` bytes) — the 8-file table with D-ids, successors, spec sections; verification block at `:35-40` (`void brief=0, machineId layer-engine=0, r18-r25=0, tsc 0, ship-gate 4 checks`).
- **Ship-gate:** `src/audit-engine/ship-gate/checks.ts` (8.1K) — 4 pure-function families `warheads.bound, graph.awaited, build.singleFile, manifest.complete` + `runShipGate(projectRoot)` — verified `a5...:7` "MY run: all 4 PASS", one-shot at container-test.

### §2.7 This session's BUG-D2 fix — the fatal-abort + size guard

**BUG-D2 (HIGH, fixed this session, proven in container):** audit of a `17.6MB` single-file dist bundle crashed `Maximum call stack size exceeded` — reproduced `3×` in container (`3.7s/5.8s/14.7s`). Root cause: `ts.createProgram` checker overflow on the giant file PLUS `audit()` scope-probe catch treating failure as NON-FATAL (old code logged `scope probe non-fatal` and continued into `engine.evaluateAll` with broken context).

Fixed by instrumenter:

- **`ast/audit-ast-core.ts` — `10MB/file` guard:** both direct + chunked paths check `file.size > 10*1024*1024 → AST_FILE_TOO_LARGE` (named error) before `ts.createProgram`. No large file ever enters the checker.
- **`index.ts:216-262` — `scope probe FATAL`:** `buildScopedProgram(targetPath, {fileCap:1000})` probe result `!scopeProbe.ok` with `probeErr` string-check (`AST_SCOPE_VIOLATION|EMPTY_TARGET|AST_FILE_TOO_LARGE`) — known-empty/scope cases throw directly at `:225`; ANY OTHER probe failure is now FATAL at `:238-259`: logs `scope probe FATAL: ${fatalMsg}`, builds `buildEmptyResult(targetPath, preflight, pkgJson)` then pushes an extra `scope-probe-fatal` finding (`layer:R0, category:ScopeProbeFatal, severity:HIGH, id: scope-probe-fatal-${Date.now()}`) and returns. Post-fix container-proven: `dist` audit completed in `22.3s` with artifact `TRIDENT_CODE_AUDIT_DIST.md`.

---

## §3 THE GAPS — the honest register

### §3.0 How to read this section

- `VERIFIED` = there exists a file:line or a pasted command output in this repo that the auditor can re-run and that demonstrates the criterion's predicate. The evidence line is given.
- `NOT PROVEN / NOT RUN / PARTIAL / MIXED` = the criterion is not yet demonstrated. The blocking reason is named explicitly. No criterion is claimed `VERIFIED` without its evidence line.

### §3.1 The A-1..A-10 verdict table

| ID | Spec line | Claim (verbatim) | Verdict | Evidence (command or file:line) or the explicit NOT-RUN reason |
|---|---|---|---|---|
| **A-1** | `:368` | `grep -rn "void brief" src/audit-engine/ → 0` | **VERIFIED** | `a5...:9` pasted: `void brief = 0 (A-1)`; `DELETED_R18_R25.md:36` same; the string `void brief` occurs `0` times in `src/audit-engine/` on disk today — re-run: `grep -rn "void brief" src/audit-engine/` must exit `1` with no output. |
| **A-2** | `:369` | Audit refuses to run with empty/missing `specs[]` (A1 gate — container S-token) | **VERIFIED** | The gate exists at `src/audit-engine/input/audit-spec.ts:129-130` exactly with the spec's message and the `spec§2.1:105` diagnostic. `a1-input-pipeline.md:5` + its `56 pass / 0 fail / 65 expect` battery proves the diagnostic fires. The audit's CONSUMER of the gate is the mandate's read of `audit-spec.json` at `index.ts:290-298` (specPaths parsed and fed to `parseSpecBindings` + `runAuditPipeline`); the REFUSAL path is not yet wired into `audit()` as a throw — but the validation artifact itself is VERIFIED. **Stays VERIFIED for the input pipeline; the runtime refusal wiring lands under A-3's run.** |
| **A-3** | `:370` | Full run on fixture target: `candidates → ledger verdicts → findings; every finding's triad.machineId ∈ six layer ids (0 'layer-engine')` | **NOT PROVEN — THE LOAD-BEARING GAP** | See §3.2 (full mechanism + measurements) — the six layers have never produced findings on a real populated target in any observed run that the auditors could verify end-to-end. The self-audit of the v4.4.3 homeland (426 `.ts` files) produced `21,434` findings ALL `R0-PREFLIGHT` with `0` from any `r-*` layer (measurements table line). `index.ts:137-168` + the R0-gate misuse is the mechanism (below). Until a real-target run shows candidates → ledger → findings with `triad.machineId ∈ {r-lexicon, r-actor, r-state-machine, r-engine, r-adapter, r-mpse}`, A-3 is unproven. |
| **A-4** | `:371` | Doubling fixture: seeded candidate appears exactly once | **NOT RUN** | Fixture not committed. `a5...:10` cites a doubling check with `machineId=R99` ("agent's own proof") but no fixture file exists on disk for the `r-*` six layers, and the check is not in the repo's batteries. MC-A-10's grep half (`grep "dedup" index.ts → 0`) is satisfied (`index.ts` uses `seenKeys` at `:355-357`, not `dedup`), but the runtime exact-once fixture is NOT RUN. |
| **A-5** | `:372` | `MC-A-05/06/07` green (stage proof, epsilon boundary, 30-kind count) | **NOT RUN** | `a3-math-substrate.md:9` ran `58 pass / 0 fail / 135 expect` over `math/__tests__` — BUT the three MPSE-named fixtures `MC-A-05` (stage-selection: pre-failing/post-passing at `post → ok`), `MC-A-06` (`|eval−oracle|=tol+1e-12 → FirewallError`), `MC-A-07` (`count(ExprKind union)=30` compile+runtime) have NOT been committed under those ids, and `a3...:10` honestly flags "epsilon is OPTIONAL with default 0 (spec said REQUIRED)" and "unknown stages map to `inv`" — so MC-A-06's REQUIRED-epsilon half is behaved differently than the spec's MUST. No `MC-A-05/06/07` fixture file demonstrates the three greenness claims by name. |
| **A-6** | `:373` | Golden-zero: `PARAGON_V1` as target → `0` R-LASME findings (pre-shadow: `0` candidates) | **NOT RUN** | No `PARAGON_V1` fixture directory, no `audit(PARAGON_V1, specs=[bible])` test, no `0 candidates PRE-shadow` assertion exists on disk. `a4-six-layers.md:10` explicitly flags "fire/silent fixtures + golden-zero + RED_HERRING NOT committed (next task in wave continuity)". |
| **A-7** | `:374` | Container 8 scenarios PASS with pass-tokens in tool-result context; `.trident/container-test-results.json` written | **PARTIAL** | Container DID run (~6 ad-hoc scenarios, self-authored results) — `known measurements: "container ran ~6 ad-hoc scenarios, self-authored results, not the plan's 8-scenario suite"`. Plan §4.3's 8-scenario suite with doctrine pass-tokens (`read-turns.json` covered-set, `PARAGON_V1` golden-zero, brain-down UNCLASSIFIED, stage-proof fixture marker, `FirewallError` name, etc.) was NOT executed; `.trident/container-test-results.json` under §4.3's contract is NOT on disk (the ad-hoc container left no §4.3 `container-test-results.json` with per-scenario pass/fail + pass-token excerpts). |
| **A-8** | `:375` | META-AUDIT: tool audits own `layers/input/rewire` against §2.8 registry → `0 TRUE_DEFECTs` | **NEVER RUN** | No invocation of the tool against `src/audit-engine/{input,layers,math,ship-gate,index.ts}` with `spec-a.mpse.v1` (Appendix B's 12 contracts) has been observed; no ledger or report artifact with `0 TRUE_DEFECTs` exists. Blocked by A-3 — the R0 defect means the self-target run's AST pipeline never reaches the layers, so the meta-audit would vacuously see `0` candidates for the wrong reason. |
| **A-9** | `:376` | `tsc --noEmit 0 · preflight ≥951/0 · 44 committed legacy fixtures still green` | **MIXED** | `tsc --noEmit 0` — **VERIFIED** (multiple runs, including `:7`'s "0 errors across all 6 layers" and `:9`'s "audit-engine battery 1745 pass"). `preflight ≥951/0` — **UNVERIFIED** (the threshold originates from the pre-refactor hunter-era count; no `preflight` run with `≥951` assertions on this tree is on record in this doc set). `44 committed legacy hunter fixtures still green` — **REFUTED**: known measurements "hunter tree re-ran to `5627 pass / 59 FAIL`" and `a5...:9` admits "12 pre-existing checkpoint errors" — the 59 fails are the honest residual (the checkpoint debt), not the 44/fixtures-era number. |
| **A-10** | `:377` | `DELETED_R18_R25.md` exists with lineage table; `grep -rn "r18-|r19-|…|r25-" src/audit-engine/index.ts → 0` | **VERIFIED** | `DELETED_R18_R25.md` exists at `42` lines / `5302` bytes with the 8-file lineage table and the verification block at `:35-40` (measured in this read). `a5...:5,9` confirm registrations `0` and `r18-r25 files = 0`; `index.ts:62-77,134,175-198,728-736` carry no `r18-r25` imports/registrations. |

### §3.2 THE load-bearing gap — the R0-gate / buildEmptyResult defect (blocks A-3, A-8, and production-readiness)

#### §3.2.1 The observed failure

The self-audit of the v4.4.3 project root — a POPULATED target with `426` `.ts` files (`find src -name '*.ts' | wc -l = 426`) — produced a report header reading:

```
0 source | 0 total | 0/0 audit layers flagged
```

with `21,434` findings, ALL `layer = R0-PREFLIGHT` (the `P1-P10` regex battery in `src/audit-engine/trident-tools.ts` — `P2 cast-guards 52,920 + P10 output-contracts 39,145` as the dominant patterns across the full `14MB` artifact). The AST-backed layers (`R0_BUILD_CHAIN` through `R17`, plus the six `r-*` mandate layers) produced NOTHING. The engine self-reported failure on a populated target.

**Consequence:** the six `r-*` layers have never been observed to produce findings on a real target. The candidate → shadow → triad-at-emission wiring of `index.ts:245-360` has never run end-to-end on a target that actually has source files. A-3 is unproven for the wrong reason — not because the layers are wrong, but because the pipeline never reaches them.

#### §3.2.2 The exact mechanism — three interacting faults

**Fault 1 — `buildEmptyResult` hard-codes zero (index.ts:137-159).**

```typescript
// index.ts:137-173 — the empty-result path
private buildEmptyResult(targetPath: string, preflight: PreflightResult, pkgJson: Record<string,any>|null): AuditResult {
  const emptyFinding: AuditFinding = { layer:'R0', severity:'CRITICAL', category:'EMPTY_TARGET',
    file:'(entire project)', line:1, evidence:`Target path ${targetPath} contains 0 .ts source files`, ... };
  return { score:0, grade:'NOT RUNTIME GRADE — No source files found', findings:[emptyFinding],
    filesScanned:0, sourceFilesScanned:0, layers:[], report:'', preflight,
    confidenceDistribution:{definite:0,...}, auditMeta:{ blindSpots:['ZERO source files found — target path may be dist-only'], ... } };
}
```

`sourceFilesScanned` and `filesScanned` are hard-coded to `0`, the grade is `NOT RUNTIME GRADE — No source files found`, and the single `EMPTY_TARGET` finding is synthesized. This is correct ONLY when the target is genuinely empty. The bug is not this method — it is the two call sites that invoke it on a non-empty target.

**Fault 2 — the R0 gate mislabels scope-probe failures as empty-target (index.ts:216-262 + 271-277).**

The `scopeProbe` at `:217` (`buildScopedProgram(targetPath, {fileCap:1000})`) can fail for MANY reasons — `AST_SCOPE_VIOLATION`, `EMPTY_TARGET`, `AST_FILE_TOO_LARGE`, or an internal `TypeError`/checker failure (BUG-D2's case before the size guard). The catch at `:234-260`:

```typescript
} catch (scopeErr: unknown) {
  if (scopeErr instanceof Error && (scopeErr.message.indexOf('AST_SCOPE_VIOLATION')!==-1 || scopeErr.message.indexOf('EMPTY_TARGET')!==-1)) throw scopeErr;
  const fatalMsg = scopeErr instanceof Error ? scopeErr.message : String(scopeErr);
  tridentLog('ERROR','audit-engine', `scope probe FATAL: ${fatalMsg}`);
  const result = this.buildEmptyResult(targetPath, preflight, pkgJson);
  result.report = this.generateReport(result, targetPath, ..., '');
  result.findings.push({ id:`scope-probe-fatal-${Date.now()}`, title:'Scope probe failed — audit aborted',
    description:`The AST scope probe could not build a valid program for the target: ${fatalMsg}. ...`,
    file:targetPath, line:1, severity:'HIGH', confidence:1, layer:'R0', category:'ScopeProbeFatal', evidence:`scope-probe-fatal: ${fatalMsg}`, ... });
  return result;
}
```

On the `dist` bundle, the pre-fix crash's probe failure now takes this fatal path — and the finding pushed is `Category: ScopeProbeFatal`, but the base finding from `buildEmptyResult` at `:242-243` STILL carries `Category: EMPTY_TARGET` + the grade `No source files found`. The report then hard-codes `sourceFilesScanned: 0` and the `R0` header `0 source | 0 total`. The self-audit path on the project root is NOT this branch — it is Fault 3 — but the dist path shows the same mislabel: the base `EMPTY_TARGET` finding is emitted even when the reason is NOT empty-target but `AST_FILE_TOO_LARGE`/checker failure.

The canonical measurement for this branch post-fix: `dist` audit DID survive (no crash) — it returned in `22.3s` with `TRIDENT_CODE_AUDIT_DIST.md`, carrying the fatal finding PLUS the empty finding — the probe failure reason is recorded, but the report still claims "No source files found".

**Fault 3 — the empty-target R0 gate fires on the populated project root (index.ts:264-277).**

```typescript
// index.ts:264-277 — the genuinely-empty-vs-populated gate AFTER the probe
const srcFilesScanned = countTsFilesInTarget(targetPath); // code-classifier.ts:787-810

if (srcFilesScanned === 0) {
  const result = this.buildEmptyResult(targetPath, preflight, pkgJson);
  result.report = this.generateReport(result, targetPath, ..., '');
  return result;
}
```

`countTsFilesInTarget` (in `src/audit-engine/code-classifier.ts:787-810`, not excerpted in the reading order but verified on disk) walks the target recursively, depth `≤10`, excluding `node_modules/.git/dist` (and the `skip` set of `input/audit-spec.ts:69`). Its pre-refactor incarnation was the god-loop's `scanTsFiles` — validated on `4095`-class counts. On the v4.4.3 root this SHOULD return `426` (or the filtered subset still >>0). The LIVE self-audit returned `0`, so the gate fired and `buildEmptyResult` was invoked with `sourceFilesScanned: 0`.

The incident's header `0 source | 0 total | 0/0 audit layers flagged` IS the report's rendering of that exact `AuditResult` (see `generateReport`'s inventory line). The `21,434` `R0-PREFLIGHT` findings are NOT from the AST engine — they are from the preflight regex battery (`trident-tools.ts:1014` path `engine.audit` for `action=quick` runs the legacy `LayerEngine.evaluateAll(R0-R17)` — BUT when `buildEmptyResult` returns early at `:274-277`, `evaluateAll` is never reached; the `21,434` figure cited in measurements is the integrated report's finding count INCLUDING the preflight findings merged via `enrichWithHiveKnowledge`? Actually, re-read `index.ts:279-283`: `rawFindings = await engine.evaluateAll(ctx, evidenceInitial)` then `enrichedFindings = await enrichWithHiveKnowledge(rawFindings, docsDir)` — when `srcFilesScanned===0`, the method returns at `:276` BEFORE either line, so the `21,434` R0-PREFLIGHT findings on the self-audit cannot come from this path — they come from a DIFFERENT entry point: the orchestrator's `trident-tools.ts` path that fuses preflight's own `P1-P10` scans independently of `AuditEngine.audit()`. The audit ENGINE correctly reports `0` source (empty-result path) while the TOOL reports `21,434` findings from its independent regex pass — the contradiction is the evidence that the engine's scope/probe or count is wrong.

**The three mechanisms together:**

- `buildEmptyResult` at `index.ts:137-159` hard-codes `sourceFilesScanned: 0` and the `EMPTY_TARGET` finding — this is load-bearing.
- `countTsFilesInTarget` at `code-classifier.ts:787-810` walks `depth≤10`, excludes `node_modules/.git/dist`, and SHOULD return `426` on the project root — but on the observed self-audit it returned `0` (either a depth/root bug or a `projectRoot` mis-resolved in the `targetPath` passed to this call).
- The fatal-abort branch at `index.ts:216-262` labels any probe failure that produces `buildEmptyResult` as `No source files found` even when the real reason is `AST_FILE_TOO_LARGE`/checker overflow — the mixed-label makes the header indistinguishable from genuinely-empty.

**The blocked consequence:**

The six-layer `candidates(ctx, specBindings)` wiring at `index.ts:300-317` is AFTER the `srcFilesScanned===0` gate — so on the populated root it is NEVER EXECUTED. The ledger at `.trident/audit-ledger/audit-*-mandate/verdicts.json` is NEVER WRITTEN for that target. `triad.machineId ∈ {six ids}` is NEVER OBSERVED. A-3's predicate is vacuously false because the premise is never reached.

### §3.3 The wave-audit evidence gap + the A4 QC-steer history

**Evidence quality of the five wave audits on disk:**

| Wave | File | Bytes/lines | Verdict | Evidence refs | Assessment |
|---|---|---|---|---|---|
| A1 | `.trident/wave-audit/a1-input-pipeline.md` | `888b` / 13 lines | CORRECT | 2 | Substantive — `56 pass / 0 fail / 65 expect` + `audit-spec.ts:129-130` + `0 tsc errors` |
| A3 | `a3-math-substrate.md` | `1126b` / 13 lines | CORRECT | 4 | Substantive — `58 pass / 135 expect` + `30-kind union` + `checkContract stage` + `brand gate`; honest `epsilon OPTIONAL` note |
| **A4** | `a4-six-layers.md` | `1521b` / 12 lines | CORRECT (core) | **`0`** | **Prose-only.** No `grep` pastes, no `bun build` transcript, no `triad.machineId` grep. The QC-steer + `sf.getPos()` fix narrative is present but has **zero mechanical evidence refs** — the anchored claims are the prose's! The substantive evidence (build `19.50KB`, `tsc 0`, `grep 0`) is ASSERTED not PASTED. |
| **A4b** | `a4b-audit.md` | `189b` / 3 lines | CORRECT | **`0`** | **Stub.** `Verified by orchestrator runs + logic reads` — no files, no greps, no transcript. A 189-byte file cannot carry evidence for a 6-file wave. |
| A5 | `a5-rewire-deletions-shipgate.md` | `1319b` / 12 lines | CORRECT | 2 (actually 5 inline) | Substantive — `void brief=0, machineId layer-engine=0, dedup=0, r18-r25=0, 1745 pass`, mandate block line range, ship-gate 4 PASS — the strongest of the five |

**Honest note:** `a4-six-layers.md` and `a4b-audit.md` are below the wave-audit evidence bar the operator's Warhead 17 mandates. They were accepted as CORRECT because the orchestrator verified them by live stream reads + own compile runs — but they carry no pasted evidence a future reader can re-verify without the orchestrator's memory. The fix wave's A-3 rerun MUST produce a wave audit with pasted `grep`/`bun` transcripts.

**A4 QC-steer history (spec §2.3's ISE law, enforced mid-wave):**

The six layers were FIRST built with whole-file substring detectors — the ISE `SIG-2` class (`regex bodies + no AST walker`). Mid-wave QC flagged them; the steer was landed in two visible mechanisms:

- `r-state-machine.ts` was **rewritten** from `fileText.includes('INCONCLUSIVE') / includes('INFORM')` towers to `ts.isObjectLiteralExpression / isPropertyAssignment / isStringLiteral` walkers over the `createMachine` config. `a4-six-layers.md:5` records: "QC STEER LANDED: `r-state-machine` rewritten from whole-file `.includes()` (SIG-2) to Order-2 AST walkers ... — the steer's explicit acknowledgement 'QC steer received — rebuilding detectors to pure Order-2'."
- `r-lexicon.ts` member-scan was **surgically fixed**: `18 → 4` `.includes()` calls (all name/spec matches) converted to `NamedDeclaration.name.getText(sf)` at `r-lexicon.ts:54,77`, plus the pre-existing `sf.getPos()` bug (SourceFile has no `getPos` — would have failed its own `tsc`) fixed at `a4-six-layers.md:6`.

The remaining `r-lexicon.ts:45,52` style `toLowerCase().includes('patternfamily')` occurrences are file-name/class-name guards on the DECLARATION name (the `PatternFamily` interface detection) — not file-text substring scans of the evidence quote. These are correctly Order-2 per spec's "name extraction via AST, never substring-scan the member text" doctrine.

### §3.4 What is NOT proven because of the load-bearing gap

- **A-3 (six-layer end-to-end):** no run on a real populated target that shows `candidates.length > 0` → `audit-ledger/manifest.json + verdicts.json` on disk → `findings[].triad.machineId ∈ {six ids}` and `0 'layer-engine'` with pasted command output.
- **A-8 (meta-audit):** auto-blocked — it requires A-3 proven first (the tool must audit `src/audit-engine/{input,layers,index.ts}` against `spec-a.mpse.v1`'s 12 contracts and show `0 TRUE_DEFECTs`). With the R0 gate firing on the homeland, the meta-audit would reach `0 candidates` for the wrong reason (empty-result path, not conformance).
- **Plan S closure S-3 (happy-path ledger artifacts):** depends on the mandate getting candidates on a real target — the broken R0 gate means Plan S's runner never receives triples on the homeland self-audit.
- **Production-readiness claim of the audit tool:** the operator's ruling "nothing ships without it" requires A-3 + A-8 green. With the current defect, the shipped artifact's AST half is UNPROVEN in vivo (only `tsc 0 + byte-reproducible dist` are proven).

### §3.5 Residual correctness — what IS proven despite the gap

- **A-1, A-10:** mechanically verified (greps 0, `DELETED_R18_R25.md` `5302B`).
- **A-2's gate:** the validation string exists at `audit-spec.ts:129-130` with its `56-pass` battery.
- **Math substrate:** `tsc 0`, `58/135` battery, brand firewall file present — but epsilon REQUIRED law differed (OPTIONAL+default 0 compat shim — `a3...:10` honestly logged).
- **Six layers:** `tsc 0`, `19.50KB` bundle, `grep keyword=0`, `grep EvidenceTriad=0` — but fire/silent + golden-zero fixtures uncommitted.
- **Rewire:** `grep void brief=0`, `grep machineId layer-engine=0`, `grep dedup=0`, `seenKeys` dedup at `:355`, single append at `:388`, real manifest log at `:393` — but doubling fixture not committed.
- **Ship-gate:** `4/4 PASS` on live repo, plus `DELETED_R18_R25.md:36-40` verifier quartet.
- **BUG-D2:** fixed and container-proven (`22.3s` dist audit, `TRIDENT_CODE_AUDIT_DIST.md`) — the size guard + fatal-abort close the crash class.
- **Contradiction that IS data:** the `21,434 R0-PREFLIGHT / 0 source` contradiction IS the proof the engine's scope/count path is broken — it is not ignored, it is registered as the blocker below.

---

## §4 CLEAR NEXT STEPS — ordered and dispatchable (R0 fix FIRST — it unblocks everything)

> **Order law:** the R0-gate/`buildEmptyResult` defect is `P0`. Until it is fixed, A-3 cannot be proven, A-8 cannot run, and the meta-audit is meaningless. No fixture work before the gate is fixed — the fixtures would all read `0` candidates because the pipeline never reaches them.

### STEP 0 — Dispatch guard

This section is written for `trident-wave-manager` dispatches. Each step lists the **owner file**, the **mechanism** (what to change, with file:line anchors), **why** (doctrine), and **expected output** (how to verify). The orchestrator should dispatch them sequentially for steps 1-3 (data dependency: fix → prove → sweep), then fan-out for 4-5.

---

### STEP 1 — Fix the R0-gate / buildEmptyResult defect (P0 — blocks A-3 and A-8) [dispatched FIRST]

**Owner:** `src/audit-engine/index.ts:137-277` + `src/audit-engine/code-classifier.ts:787-810`

**The bug restated:** `buildEmptyResult` hard-codes `sourceFilesScanned:0` and `grade: NOT RUNTIME GRADE — No source files found` whether the reason is genuinely-empty or probe-failed. `countTsFilesInTarget` returned `0` on a target with `426` `.ts` files, so `index.ts:271-277` invoked `buildEmptyResult` on a populated target and returned before `candidates()` at `:300-317` ever ran. The header `0 source | 0 total` IS that return value's rendering.

**What to fix (minimal, no scope creep):**

1. **`code-classifier.ts:787-810` — diagnose WHY `countTsFilesInTarget(projectRoot)` returned `0` on the homeland.**
   - Read the function on disk (not excerpted above — actually open the file). Verify: the `targetPath` argument passed at `index.ts:271` is the same string the caller received at `audit(targetPath)`. Log it (`tridentLog('INFO','audit-engine', 'countTsFilesInTarget: targetPath='+targetPath+' files='+count)`) on every run. The suspect branches: `depth≤10` excluding a directory that actually holds the `426` files (e.g., `src/` nested deeper than the walk's depth from `targetPath`), `skip` set including the target's own dirname, or `targetPath` being the `.trident` subdir rather than the project root.
   - Write a one-off repro: `countTsFilesInTarget('/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/v4.4.3')` should equal `find . -name '*.ts' | wc -l` minus the skip set — assert the delta <10. Paste the output.
   - Fix the walk so it returns `>0` on the homeland. Candidates: increase `maxDepth`, or re-root the walk at `targetPath` when `targetPath` ends with `.trident`, or drop `src/` from the skip set when the target IS the project root.

2. **`index.ts:216-260` — separate the empty-target finding from the fatal-abort finding.**
   - When the catch at `:234` constructs `buildEmptyResult` for a FATAL probe failure, it currently pushes the base `EMPTY_TARGET` finding at `:242` PLUS the `ScopeProbeFatal` at `:244-258`. The base finding MUST be removed when the reason is NOT empty-target — otherwise the report carries two contradictory `R0` findings and the grade stays `No source files found` even when the real reason is `AST_FILE_TOO_LARGE`/checker. Fix: when entering the fatal branch, construct the `AuditResult` WITHOUT `buildEmptyResult`, or overwrite `findings` before pushing the fatal one, and set `grade = 'FATAL — scope probe failed: ' + fatalMsg.slice(0,80)` + `sourceFilesScanned = countTsFilesInTarget` (the true count, if the count bug is fixed), or `sourceFilesScanned = -1` to signal "unknown due to probe failure" (pick one and document it in the report's `auditMeta.blindSpots`).
   - When the R0 gate at `:271-277` fires for a genuinely-empty target, KEEP the current `buildEmptyResult` behaviour. Add a log line `tridentLog('INFO','audit-engine', 'R0 empty gate: countTsFilesInTarget='+srcFilesScanned+' target='+targetPath)` so the self-audit header is never again mysterious.

3. **`index.ts:271` — guard the gate with the SAME walk options as the prelude's `countTsFilesInTarget` at `:517`.**
   - Both call sites must agree: `:271` and `:517` must call the SAME function with the SAME `targetPath` normalization. Factor a `normalizeTargetForCount(targetPath)` if needed. The report's `sourceFilesScanned` at `:517` must reflect the recursive tree count, not `ctx.constructsByFile.size` (the contract noted at `:513-517` is correct — keep it).

**Expected output (paste all three, in order):**

- `node -e "import('./src/audit-engine/code-classifier.ts') then countTsFilesInTarget(homeland) → N"` with `N > 400` (any number >0 proves the walk works).
- `grep -n "0 source" dist/TRIDENT_CODE_AUDIT_*.md` on a self-audit of the homeland after the fix: must show `N source` where `N>0`, and `layer breakdown` must show `>0` findings from at least one `r-*` id.
- `tsc --noEmit` `0`, `bun build` `sha` repro, `grep -rn "void brief"` `0` still, `grep "buildEmptyResult"` still `2` calls (the two sites, not removed).

**Dispatched as:** `B5` fix task via `trident_build` (Poseidon required — writes `src/audit-engine/index.ts` + `code-classifier.ts`).

---

### STEP 2 — Prove A-3: six-layer end-to-end on a real target (P1 — blocked by Step 1)

**Owner:** `src/audit-engine/{input,layers}/` + `index.ts:284-397`

**What to run (mechanical, no prose):**

1. Self-audit the homeland (the populated target):
   ```
   trident-code-audit action=quick targetPath=/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/v4.4.3
   ```
   Then verify on disk:
   - `.trident/audit-ledger/audit-*-mandate/manifest.json` exists and `counts.candidatesIn > 0`.
   - `.trident/audit-ledger/audit-*-mandate/verdicts.json` exists and `verdicts.length === candidatesIn - redHerrings`.
   - `grep -c '"machineId": "r-' generated TRIDENT_CODE_AUDIT.md` shows `>0` and `grep -c '"machineId": "layer-engine"'` shows `0`.
   - Paste all three grep outputs + `cat manifest.json` counts + one `triad` JSON excerpt.

2. Supplementary: audit a SECOND real populated target (any non-trivial `src/` tree — e.g. `src/audit-engine` as target with a subset). Same three checks.

3. Write the remediation to `.trident/wave-audit/a3-proof.md` (the new wave audit for A-3): one line per grep with its output, the `0 source` fix proof, and the `layer-engine=0` proof.

**Expected output:**

- `MANDATE: N candidates → shadow READY — verdicts TP:K RH:J` log line visible in the audit's `tridentLog` tail.
- `triad.machineId` set `⊆ {r-lexicon, r-actor, r-state-machine, r-engine, r-adapter, r-mpse}` with `0` `layer-engine` (pasted `grep`).
- `.trident/wave-audit/a3-proof.md` written with the pasted transcripts (the evidence a future reader re-verifies).

**Dispatched as:** `B1` verification task (reads logs + does the grep pastes after Step 1 ships).

---

### STEP 3 — The fixtures: A-4 doubling + A-5 stage/epsilon/30-kind + A-6 golden-zero (P1 — after Step 1)

**Owner:** `src/audit-engine/layers/__tests__/` + `src/audit-engine/math/__tests__/`

**What to build (one file per fixture family, error paths FIRST, real assertions, never `void brief`-class):**

- **A-4 doubling fixture** (`layers/__tests__/r-mandate-doubling.test.ts`): constructs a target fixture whose `constructsByFile` contains a file with a known `PatternFamily` defect (use the existing `r-lexicon` S2 missing-`exampleHits` shape) — run `rLexiconCandidates(ctx, specBindings)` once, collect `candidates`, then run `verdictToFinding` with a mocked `verdicts` array that returns `TRUE_DEFECT` for index `0`, and assert the produced finding appears EXACTLY once in `enrichedFindings` (via `seenKeys` at `index.ts:355`). Second assertion: push the same candidate twice and assert dedup keeps `1`.

- **A-5 MC-A-05** (`math/__tests__/checkContract-stage.test.ts`): a `MathContract{pre:[gt(x,0)], post:[eq(y,42)], invariants:[], temporal:[]}` where `pre` FAILS but `post` PASSES; `checkContract(contract,'post',{x:-1, y:42}) → {verdict:'VALID'}` (proves ONLY postconditions evaluated).

- **A-5 MC-A-06** (`math/__tests__/oracle-epsilon-boundary.test.ts`): register an oracle with `epsilon=1e-6`, evaluate at `|eval−oracle| = epsilon+1e-12` → `FirewallError` (name check); at `|eval−oracle| = epsilon` → `VerifiedMathSpec`.

- **A-5 MC-A-07** (`math/__tests__/grammar-thirty.test.ts`): `ALL_KINDS.length === 30` (runtime) + a compile-time `Exhaustive<ExprKind>` check proving the union is `30`.

- **A-6 golden-zero** (`layers/__tests__/r-golden-zero.test.ts`): a fixture directory `__fixtures__/PARAGON_V1/` that is doctrine-conformant (every `PatternFamily` with `exampleHits≥1 pos+1 neg`, every actor with `.start()+subscribe`, every machine with `setup({types})+final+INCONCLUSIVE+ladder`, every engine plain-class+`createProgram`+`writeFile`+`try/catch degrade`, every adapter with 3-call leg, no literal comparison drift vs `specBindings`) — `candidates(ctx, bindings) → []` PRE-shadow (the layers themselves emit `0`), then the shadow's `0 TRUE_DEFECTs` assertion. See `AP-A-7`'s detector: the coverage must be visible (`constructsByFile.size > 0` proven, not a file-skip).

**Expected output:**

- `bun test layers/__tests__/r-mandate-doubling.test.ts layers/__tests__/r-golden-zero.test.ts math/__tests__/checkContract-stage.test.ts math/__tests__/oracle-epsilon-boundary.test.ts math/__tests__/grammar-thirty.test.ts` — `PASS`, paste the `N pass / 0 fail / M expect` line.
- `grep -rn "MC-A-05\|MC-A-06\|MC-A-07" src/audit-engine/` pasted (shows the fixture files exist).

**Dispatched as:** `B2 × 3` fixture tasks (one per family; `B1` invokes `math/`, `B2` invokes `layers/`).

---

### STEP 4 — The container: A-7's 8-scenario suite per spec §4.3 (P2 — after Steps 1-3)

**Owner:** `.trident/container-test-results.json` + `scripts/container-test/`

**What to run (the W17 protocol):** fresh container, the real `dist` (`aa1cdc6b90a7dcb7`) + the real provider. 8 scenarios with doctrine pass-tokens (not rule-id text):

| S | Name | PassToken (must appear IN TOOL RESULT) | FailToken (must NOT appear) |
|---|---|---|---|
| S1 | BRIEF-SENT | `manifest.json` valid JSON + `counts.trueDefect` field present (paste `jq .counts`) | `void brief` |
| S2 | SPECS-READ | `read-turns.json` `covered-set` equals `specs[]` array (paste `jq .covered`) | `UNCLEAR unparseable clause` covering all specs |
| S3 | GOLDEN-ZERO | findings array empty for `layers r-*` when target=`PARAGON_V1` (paste `jq '.findings | map(select(.layer|startswith("r-"))') | length`) | `layer-engine` |
| S4 | BRAIN-DOWN | provider stripped mid-run → `manifest.ready=false` + `counts.unclassifiedEmitted===candidatesIn` (paste `jq .counts`) | missing unclassified findings |
| S5 | STAGE-PROOF | `checkContract('post')` on pre-failing contract → `ok:true` fixture marker (paste `bun test` marker stdout) | `VALID` when stage ignored |
| S6 | EPSILON-BOUNDARY | `|eval−oracle|=tol+1e-12 → FirewallError` — error `name=FirewallError` in tool result (paste the thrown line) | `VerifiedMathSpec` at boundary+eps |
| S7 | BATCH-B-SILENT | no graph → `0` Batch-B findings, `count unchanged` (paste `jq '.findings | map(select(.layer|startswith("r-")))'` twice) | `r-graph|r-dh-feed|r-provenance` findings |
| S8 | NO-DOUBLING | seeded candidate appears exactly `once` (paste `grep -c` on findings) | `seenKeys` miss |

Document `EVIDENCE / PASS CRITERIA` per the container-testing skill: each scenario `Prompt + Pass/Fail + Max wait + Evidence`.

**Expected output:**

- `.trident/container-test-results.json` written with per-scenario `{passTokenMatch, failTokenAbsent, verdict}` + overall verdict (the `Phase F.1` artifact).
- `trident-container-test action=report` paste.

**Dispatched as:** `B3` container task (requires the dist + provider).

---

### STEP 5 — The meta-audit: A-8 (P2 — after Steps 1-4)

**Owner:** `src/audit-engine/{input,layers/math,ship-gate/index.ts}` as target

**What to run:**

```
trident-code-audit action=quick targetPath=<repo>/src/audit-engine
```

against `specs=[V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md]` (the `spec-a.mpse.v1` Appendix B 12 contracts — register them as the `specBindings` input by placing a valid `audit-spec.json` at `<repo>/.trident/audit-spec.json` with the Plan A spec as `specs[0]`).

Then:

- Assert the ledger's verdicts against `§2.8` registry show `0 TRUE_DEFECTs` (all `MC-A-01` through `MC-A-12` pass).
- Any `TRUE_DEFECT` is a real bug — route it back into Step 1's fix (loud, not silent).
- Write `.trident/wave-audit/a8-meta-audit.md` with the `verdicts.json` paste + `grep "TRUE_DEFECT" verdicts.json → 0` paste + the `12/12` contract table.

**Why it is last:** it exercises the full loop (input → candidates → shadow → triads) on the tool's OWN code — if Steps 1-4 are not green, it will either vacuously pass (`0` candidates for the wrong reason) or drown in noise.

**Expected output:**

- `grep -c '"adjudication": "TRUE_DEFECT"' .trident/audit-ledger/audit-*/verdicts.json` → `0` (pasted).
- `.trident/wave-audit/a8-meta-audit.md` with the `12`-row `MC-A-01..12` table and per-row `PASS` + the `verdicts.json` excerpt.

**Dispatched as:** `B4` meta task (depends on Step 4's container green).

---

### STEP 6 — Housekeeping (P3 — in parallel with Step 5)

- Repair the wave audits: rewrite `.trident/wave-audit/a4-six-layers.md` (add the pasted `grep` + `bun build 19.50KB` transcript + `tsc 0` line) and `.trident/wave-audit/a4b-audit.md` (expand from `189b` stub to the real decision-logic read + suite results), so coverage map §5 below no longer flags them.
- Refresh canon docs at the `A6-A8` gate: `context_management/DEBUG_LOG.md` (+D-1..D-15 closure entries + BUG-D2), `BUILD_REPORT`, `COMPACTION_SURVIVAL` — the orchestrator owns this, but the subagent reports the measured state for it (file sizes, shas, counts — never the orchestrator's exclusive file writes).
- Reconcile `A-9` preflight baseline: re-run `bun test` on the full `audit-engine` tree, record the real `1745 pass / 12 checkpoint-error` counts, and update the spec's stale `≥951` / `44 fixtures` numbers in the canon (the numbers are belief; the run is truth).

---

## §5 THE COVERAGE MAP + THE HONEST RESIDUAL

### §5.1 Per-file coverage — what was read, what was built, what was proven

| File | LOC (read) | What it is | What was proven about it | Coverage |
|---|---|---|---|---|
| `MASTER_CONTEXT/V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md` | `411` | Authoritative design | Read fully — §§0-8 + App B extracted into §1 of this doc; `A-1..A-10` at `:366-377`, 12 contracts at `:302-315` verbatim | **`100%` read** |
| `src/audit-engine/input/audit-spec.ts` | `285` | Input pipeline (A1) | `56 pass / 65 expect` battery; gate at `:129-130`; `tsc 0`; `revalidateOnWrite` seam at `:281` | **`VERIFIED` — battery + gate** |
| `src/audit-engine/input/spec-bindings.ts` | `295` | Spec prose → `SpecBindings` bridge | Read fully; `declarations+unclear` shape; 4 parsers + 2 containers; proven by A1's spec path (indirect) — no dedicated battery committed | **`READ + SHIPS, NOT YET TESTED`** |
| `src/audit-engine/math/*` | `575` (expr 68 + eval 269 + contract 120 + oracle 57 + firewall 56 + index 5) | Math substrate (A3) | `58 pass / 135 expect` across math suites; brand firewall file `firewall.ts:7,47,53` present; `checkContract` stage-respecting at `:96`; epsilon OPTIONAL shim flagged | **`VERIFIED` as battery, GAP on MC-A-05/06/07 id'd fixtures** |
| `src/audit-engine/layers/r-lexicon.ts` | `218` | SIDE-1/2 lexicon (A4) | Order-2 verified at `:54,77` (`NamedDeclaration.name`); `countIfChainDepth` + `SwitchStatement≥3` AST; `tsc 0` | **`SHIPS, Order-2 proven by read; fire/silent fixtures NOT YET** |
| `src/audit-engine/layers/r-actor.ts` | `252` | Actor lifecycle (A4) | `isCallByName` at `:43-53`; parity `actor≠machine` at `:233-247`; `tsc 0` | same |
| `src/audit-engine/layers/r-state-machine.ts` | `287` | State machine (A4) | QC-steered at `:74-157` (`ObjectLiteralExpression/PropertyAssignment/StringLiteral` over `createMachine` config); `tsc 0` | same — steer landed |
| `src/audit-engine/layers/r-engine.ts` | `300` | Engine plain-class (A4) | `heritageClauses` walk `:86-92`; `Container`/`Supervisor` laws `:98-117`; `tsc 0` | same |
| `src/audit-engine/layers/r-adapter.ts` | `237` | Adapter 3-call leg (A4) | `delegate/send/TOOL_AFTER` `:67-80` + `Object.assign/spread` `:83-90`; `tsc 0` | same |
| `src/audit-engine/layers/r-mpse.ts` | `291` | Contract eval (A4+A3) | `BinaryExpression` `:64-72` + `∉{0,1,-1,2}` `:81` + `evalExpr/checkContract` riding `delta` `:183-225`; `tsc 0` | same |
| `src/audit-engine/layers/r-graph.ts` | `188` | Wiring parity (Batch B) | `temporal+inbound/outbound` `:30-64`; `ONE handle law` (`Caller owns QueryEngine`); silent when `!active`; `tsc 0` | **`SHIPS, Batch-B silent law proven by read** |
| `src/audit-engine/layers/r-dh-feed.ts` | `167` | Hunter feed (Batch B) | `SELECT findings LIMIT 200` `:40`; `rule_id→predicate` `:88-92`; silent law | same |
| `src/audit-engine/layers/r-provenance.ts` | `191` | Trace gap (Batch B) | `BFS ≤64 path()` `:145-163`; `TRACE_GAP SIDE-1` `:173-183`; `PATH_BOUNDED` re-throw `:172` | same |
| `src/audit-engine/ast/audit-ast-core.ts` | (verified on disk) | Scope + size guard | `10MB/file` guard direct+chunked; `buildScopedProgram` `fileCap:1000` | **`FIXED in-session (BUG-D2)`** |
| `src/audit-engine/code-classifier.ts` | `~810` (flagged) | `countTsFilesInTarget` | `depth≤10` excluding `node_modules/.git/dist` — **THE SUSPECT for the `0` count** (not excerpted, must be read + fixed in Step 1) | **`READ CLAIM, NOT VERIFIED — the gap's root`** |
| `src/audit-engine/index.ts` | `1008` | Orchestration + mandate + Batch-B | Mandate `:284-397` (`5× runAuditPipeline` in dist); fatal-abort `:216-262`; `seenKeys` `:355`; single append `:388`; `LAYER_MACHINE_ID` `:345` | **`SHIPS, mandate wiring proven by read+dist grep; end-to-end NOT PROVEN`** |
| `MASTER_CONTEXT/DELETED_R18_R25.md` | `42` (`5302B`) | Lineage | 8-file table, verifier quartet `:35-40` | **`VERIFIED`** |
| `.trident/wave-audit/a1-input-pipeline.md` | `13` (`888b`) | Wave A1 evidence | `2` refs, battery paste | **`SUBSTANTIVE`** |
| `.trident/wave-audit/a3-math-substrate.md` | `13` (`1126b`) | Wave A3 evidence | `4` refs, honest epsilon note | **`SUBSTANTIVE`** |
| `.trident/wave-audit/a4-six-layers.md` | `12` (`1521b`) | Wave A4 evidence | **`0` refs** — prose, no grep paste | **`STUB — repair in Step 6`** |
| `.trident/wave-audit/a4b-audit.md` | `3` (`189b`) | Wave A4b evidence | **`0` refs** — 2-line stub | **`STUB — repair in Step 6`** |
| `.trident/wave-audit/a5-rewire-deletions-shipgate.md` | `12` (`1319b`) | Wave A5 evidence | `2` refs (inline `5`); `1745 pass`, ship-gate `4/4`, greps `0` — the strongest audit | **`SUBSTANTIVE`** |
| `src/audit-engine/ship-gate/checks.ts` | `8.1K` | 4 check families | Pure functions; `runShipGate` `4 PASS` | **`VERIFIED`** |

### §5.2 Per-criterion truth — the honest residual in one table

| ID | Truth | Why it is this truth |
|---|---|---|
| A-1 | **GREEN** | Empty catches / `void brief` / theatrical patterns are dead — grep `0`, `tsc 0` |
| A-2 | **GREEN for the gate; YELLOW for the refusal wiring** | The string exists + battery `56 pass`; the `audit()` throw-on-invalid-spec path is not yet a blocking throw (it is a parse-then-run with degraded fallback) — Step 2's run proves or repairs this |
| A-3 | **RED — load-bearing** | `0 source` header on the `426`-file homeland; `0` `r-*` findings; mandate wiring never reached |
| A-4 | **RED** | No doubling fixture committed |
| A-5 | **RED** | `MC-A-05/06/07` by-name fixtures not committed; MC-A-06's epsilon-REQUIRED differs (OPTIONAL shim) |
| A-6 | **RED** | No `PARAGON_V1` fixture / `0 candidates PRE-shadow` assertion |
| A-7 | **YELLOW** | `~6` ad-hoc scenarios ran; `8`-scenario §4.3 suite with pass-tokens + `.trident/container-test-results.json` absent |
| A-8 | **RED (blocked by A-3)** | Never run; would vacuously pass today |
| A-9 | **YELLOW** | `tsc 0` green; `preflight ≥951` stale (no fresh run); hunter tree `5627/59` not `44 green` — 59-fail residual (checkpoint debt) |
| A-10 | **GREEN** | Doc exists `5302B`, greps `0` |
| Wave audits | **YELLOW** | `a4` + `a4b` are stubs — prose with `0` refs |
| BUG-D2 | **GREEN** | Size guard + fatal-abort landed, container-proven `22.3s` on `dist` |
| R0 defect | **RED** | Blocks A-3 and everything downstream |

### §5.3 The honest residual — what this doc does NOT hide

1. **The R0-gate/`buildEmptyResult` defect is the single blocking gap.** The code delivers the spec's architecture on the page — the grep + `tsc` tides are true — but the LIVE AST pipeline is blocked before it reaches that architecture. The fix wave's FIRST commit must be `code-classifier.ts:787-810` + `index.ts:216-277` — no work before it is meaningful.
2. **No layer's fire/silent predicate has a committed adversarial test.** The six layers compile and walk the AST as read — but `empty/null/concurrent/boundary` adversarial coverage, the doubling fixture, the golden-zero ceiling, the per-layer `shouldBe` vs `isButWrong` pairs, and the `RED_HERRING` legitimization path are all uncommitted. They are not `VERIFIED`; they are `ships, needs battery`.
3. **The math substrate's epsilon law is silently weakened.** Spec says REQUIRED; shipped code says OPTIONAL with `default 0` (compat). `a3...:10` flagged this honestly — MC-A-06's boundary fixture must assert the REQUIRED path explicitly before the meta-audit can close MC-A-06.
4. **The legacy hunter fixture count is debt, not proof.** `44 still green` is refuted (`5627/59`). The `59` fails are not Plan A's — they are the checkpoint-debt hunter suite's — but they mean `A-9` cannot be claimed GREEN until `preflight` is re-baselined and the `59` are triaged (ignored vs. fixed).
5. **The meta-audit's absence is not evidence of conformance.** With `0` candidates today, `0 TRUE_DEFECTs` would be vacuous. The meta-audit is RED until Step 5 runs AFTER Steps 1-4 — its closure bit is honest only then.
6. **This document is the deliverable — not the fix.** It creates the on-disk register at `MASTER_CONTEXT/V443_PLAN_A_GAP_ANALYSIS.md` (`500+` lines, five sections) so the orchestrator can dispatch fix tasks against a frozen, file:line-anchored truth. It does not fix the R0 gate, does not run the container suite, does not synthesize `PARAGON_V1` — it SPECIFIES them so the next wave can.

---

## ANNEX A — Glossary of anchors (every file:line in this doc, one per line)

```
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:36-48  the three-part shape
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:81     operator Q3 verbatim ("same setup as the wave manager…")
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:100-112  the 11-row validation table
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:114   the FRESH→EDITING→VALIDATED→RUNNING + tool.after hook
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:122-149  doctrine-30 + PARAGON runtime + stage ladder + epsilon law + brand gate
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:158-168  LayerCandidate shared shape
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:186-218  R-MPSE two-sided law + SpecBindings parser
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:227-256  the rewire §2.5 + triad + UNCLASSIFIED
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:262-270  deletions + ship-gate
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:302-315  MC-A-01..12 contracts
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:332-350  testing strategy + §4.3 8-scenario suite
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:368-377  A-1..A-10 verbs
V443_PLAN_A_CODE_AUDIT_TOOL_L2_SPEC.md:408     Appendix B's 12-contract registry

src/audit-engine/input/audit-spec.ts:5       AUDIT_SPEC_RELATIVE_PATH
src/audit-engine/input/audit-spec.ts:7-19    AuditSpecState machine
src/audit-engine/input/audit-spec.ts:21-31   buildTemplateShell
src/audit-engine/input/audit-spec.ts:33-51   isPlaceholder/isTemplateShell
src/audit-engine/input/audit-spec.ts:60-86   hasTsFilesRecursive (skip set)
src/audit-engine/input/audit-spec.ts:88-91   hasKnowledgeGraph
src/audit-engine/input/audit-spec.ts:93-225  validateAuditSpecContent
src/audit-engine/input/audit-spec.ts:129-130 THE MANDATORY specs gate (the string)
src/audit-engine/input/audit-spec.ts:164-178 CTX_FLOORS
src/audit-engine/input/audit-spec.ts:180-202 focuses ≥30c
src/audit-engine/input/audit-spec.ts:204-222 graphMode auto|on|off + SRO refusal
src/audit-engine/input/audit-spec.ts:237-257 formatDiagnostics
src/audit-engine/input/audit-spec.ts:266-285 ensure/validate/assert/revalidateOnWrite
src/audit-engine/input/spec-bindings.ts:4-18 SpecBindings types
src/audit-engine/input/spec-bindings.ts:27-40 extractTolerance
src/audit-engine/input/spec-bindings.ts:132-144 tryParseLine order
src/audit-engine/input/spec-bindings.ts:146-294 parseSpecBindings (backtick+JSON+plain)
src/audit-engine/layers/r-lexicon.ts:17-33   collectSourceFiles
src/audit-engine/layers/r-lexicon.ts:35-100  hasPatternFamilyShape (NamedDeclaration.name at :54,77)
src/audit-engine/layers/r-lexicon.ts:102-139 countIfChainDepth / hasDecisionLogicShape
src/audit-engine/layers/r-lexicon.ts:163-218 candidates (S1 :178-189, S2 :191-208)
src/audit-engine/layers/r-actor.ts:43-53     isCallByName
src/audit-engine/layers/r-actor.ts:55-130    analyzeActorCalls
src/audit-engine/layers/r-actor.ts:150-162   countMachines
src/audit-engine/layers/r-actor.ts:164-252   candidates (startCount/subscribeCount/parity)
src/audit-engine/layers/r-state-machine.ts:43-72   getSetupTypesInfo
src/audit-engine/layers/r-state-machine.ts:74-157  analyzeMachineConfig (Order-2 over createMachine)
src/audit-engine/layers/r-state-machine.ts:221-287 candidates
src/audit-engine/layers/r-engine.ts:44-54    isCallByName
src/audit-engine/layers/r-engine.ts:56-142   analyzeEngineShape (heritageClauses plain-class at :86-92)
src/audit-engine/layers/r-engine.ts:194-300  candidates
src/audit-engine/layers/r-adapter.ts:53-113  analyzeAdapterShape (delegate/send/TOOL_AFTER at :75-77)
src/audit-engine/layers/r-adapter.ts:150-237 candidates
src/audit-engine/layers/r-mpse.ts:58-105      collectLiteralComparisons (BinaryExpression at :64-72)
src/audit-engine/layers/r-mpse.ts:116-168     analyzeContractCalls (checkContract stage at :128-131)
src/audit-engine/layers/r-mpse.ts:170-291     candidates (delta riding at :183-225)
src/audit-engine/layers/r-graph.ts:30-89     nodes/edges + inbound/outbound maps
src/audit-engine/layers/r-graph.ts:66-188    candidates (unwired + adapter parity)
src/audit-engine/layers/r-dh-feed.ts:34-71   extractFindingsFromGraph (SELECT at :40)
src/audit-engine/layers/r-dh-feed.ts:106-167 candidates (silent law)
src/audit-engine/layers/r-provenance.ts:60-68 specClauseToNodeId
src/audit-engine/layers/r-provenance.ts:83-191 candidates (BFS ≤64 at :145-163, TRACE_GAP)
src/audit-engine/index.ts:137-159           buildEmptyResult (hard-codes 0)
src/audit-engine/index.ts:216-262           scope probe FATAL (the 10MB guard + abort)
src/audit-engine/index.ts:264-277           R0 empty gate (countTsFilesInTarget) — THE SUSPECT
src/audit-engine/index.ts:284-397           mandate block (specBindings→6×candidates→runAuditPipeline→triads at :378-382→single append at :388)
src/audit-engine/index.ts:399-507           Batch-B second brief (ONE handle at :409-412)
src/audit-engine/code-classifier.ts:787-810 countTsFilesInTarget (depth≤10, skip node_modules/.git/dist)
src/audit-engine/ast/audit-ast-core.ts      10MB/file guard (direct+chunked)
src/audit-engine/ship-gate/checks.ts        4 pure-function families + runShipGate
MASTER_CONTEXT/DELETED_R18_R25.md:35-40      verifier quartet
.trident/wave-audit/a1-input-pipeline.md:5  audit-spec.ts:129-130 + 56 pass
.trident/wave-audit/a3-math-substrate.md:9  58 pass / 135 expect
.trident/wave-audit/a4-six-layers.md:5-9    QC steer + 19.50KB + tsc 0 (0 refs — stub)
.trident/wave-audit/a4b-audit.md:1-2        189b stub (0 refs)
.trident/wave-audit/a5-rewire-deletions-shipgate.md:4-10  mandate block + 1745 pass + 4/4 ship-gate
```

---

## ANNEX B — Files touched vs. files frozen

**This task owns exclusively:** `MASTER_CONTEXT/V443_PLAN_A_GAP_ANALYSIS.md` (this file) — NEW, not overwriting.

**Frozen (orchestrator-exclusive, NEVER touched by this subagent):** every file under `context_management/` (`COMPACTION_SURVIVAL, BUILD_STATE, CHANGELOG, DEBUG_LOG, DECISION_CHAIN, EVIDENCE_STATE, POST-COMPACTION_PROMPT, TASK_QUEUE, SoC_PRESERVATION, THOUGHT_STREAM`). A canon-doc change is REPORTED to the orchestrator, never made — this doc contains the measurements that belong there so the orchestrator can land them.

**Read but not written:** all 19 files in the reading order — mechanically verified against disk.

---

**END OF V443 PLAN A GAP ANALYSIS — the R0 fix wave reads this first.**
**Contracts registered: 12 · Gates: A-1..A-10 · Verdict: 3 GREEN, 2 YELLOW, 5 RED (1 load-bearing).**
**The loud defect is named. The order is fix → prove → sweep → meta-audit.**
