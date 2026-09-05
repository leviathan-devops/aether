# TRIDENT_V443 CODE AUDIT TOOL OVERHAUL — L2 SPEC (PLAN A)

**Version:** 1.0 · **Date:** 2026-08-25 · **Status:** AUTHORITATIVE — the design authority for the audit-tool overhaul
**Project:** .../Active_Projects/v4.4.3 · **Predecessors:** V443_REGROUNDING_ARCHITECTURE_AUDIT_REPORT.md (D-1..D-15) · SRO-Code-Audit-Overhaul-Data.md · V443_LASME_MPSE_REGROUNDING_CLEANUP_L2_SPEC.md (§3/§4 SUPERSEDED; §2 doctrine ground truth KEPT)
**Consumes:** PLAN S (V443_PLAN_S_CODE_AUDIT_SHADOW_L2_SPEC.md — the shadow backend IS the adjudication core) · PLAN B's B1 ontology (the triple types)
**Baseline (operator-locked):** the five LASME layers scan for STRUCTURAL SHAPES and adjudicate against the ACTUAL SPECS — never keyword tokens · `.trident/audit-spec.json` same setup as wave-spec (workspace-scoped, self-contained) · specs[] MANDATORY · R18-R22 wiped, R0-R17 kept, R16's pattern → the ship-gate · MPSE substrate = doctrine-30 grammar × PARAGON runtime

## TABLE OF CONTENTS
- §0 THE FUNDAMENTAL PROBLEM
- §1 FAILURE INVENTORY
- §2 THE FIX PLAN
  - §2.1 The Input Pipeline (audit-spec.json)
  - §2.2 The Math Substrate (doctrine-30 × PARAGON runtime)
  - §2.3 The Five LASME Layers (the two-sided shape detectors)
  - §2.4 R-MPSE (the contract-evaluation layer)
  - §2.5 The Rewire (single emission + triads at emission)
  - §2.6 The Deletions + The Ship-Gate
  - §2.7 Batch B (the graph-activated consumers)
  - §2.8 THE MPSE WIRING (the meta-audit anchors)
- §3 IMPLEMENTATION ORDER (waves A1..A6)
- §4 TESTING STRATEGY
- §5 ANTI-PATTERNS AGAINST FALSE SUCCESS
- §6 SUCCESS CRITERIA
- §7 COMPACTION-PROOF IMPLEMENTATION GUIDE
- §8 FINAL NOTES / OPEN QUESTIONS
- APPENDIX A — ZERO-TRUST AUDIT
- APPENDIX B — THE MPSE CONTRACT REGISTRY

## §0 THE FUNDAMENTAL PROBLEM
**One sentence:** the audit tool's mandate core — the LASME/MPSE enforcement the operator ruled "nothing ships without it" — is a keyword-scanning theater with a voided shadow pass; this spec rebuilds it as the three-part machine the ruling demands: a **wave-spec-style input pipeline** (codebase + MANDATORY specs[] in), **five structural-shape LASME layers + the MPSE contract layer** (two-sided AST detectors emitting typed triples), and **the PLAN S shadow adjudication** (specs fully read, verdicts on disk, triads at emission).

**The root defect class (the audit report's D-1..D-15, all evidence-anchored there):** the R18-R25 layers scored NAME TOKENS (`OracleRegistry`, `EvidenceTriad`, `createGate`, `phase-machine`) as "LASME signatures" with a `score<2` magic threshold, while the pipeline's shadow brief was built, logged, and `void`-discarded (`index.ts:278`) with every candidate self-stamped `TRUE_POSITIVE` — the exact inverse of the operator's ruling: "we scan for structural shapes and adjudicate against the actual specs" (operator, 2026-08-25, ratifying the architecture).

**The three-part shape:**

```
┌─ PART 1 · INPUT     .trident/audit-spec.json — the wave-spec experience: template
│                     shell, in-turn compiler diagnostics, floors, specs[] MANDATORY
├─ PART 2 · CANDIDATES five LASME layers + R-MPSE — Order-2 AST detectors, each
│                     two-sided (SIDE 1: should-be-but-isn't | SIDE 2: is-but-wrong),
│                     emitting TYPED TRIPLES with evidence quotes onto PLAN B's
│                     ontology — zero keyword scoring
├─ PART 3 · ADJUDICATION PLAN S's shadow: specs FULLY READ (the read-turn ledger),
│                     the rubric applied, verdicts.json + report.md ON DISK,
│                     findingsFromVerdicts() → TRIADS AT EMISSION, single emission
└─ THE SUBSTRATE      math/ rebuilt: doctrine-30 grammar × PARAGON runtime,
                      stage-respecting checkContract, epsilon oracle, the brand gate
```

**What this spec is NOT:** it does not build the shadow (SPEC-S owns it), the graph (SPEC-B owns it), or the hunter (SPEC-B). It CONSUMES S's runner and B1's ontology and OWNS: the input pipeline, math/, the six layer files, the index.ts rewire, the deletions, the ship-gate, and the audit-side container test.

**The MPSE posture:** identical to SPEC-S — §2.8 registers this plan's MathContracts (MC-A-01..MC-A-12) + Appendix B's machine-readable registry; the meta-audit closure (S-7 class) runs the finished tool against THIS spec.


## §1 FAILURE INVENTORY
Condensed from the audit report (D-1..D-15 there, each with file:line); this inventory keeps the items THIS plan kills + the evidence:

| # | Sev | The failure | Evidence | Killed by |
|---|---|---|---|---|
| F-A1 | CRIT | Voided shadow adjudication — brief built, `void brief;`, all-TRUE_POSITIVE self-stamp, zero model calls | index.ts:277-279 | §2.5 (the S call) |
| F-A2 | CRIT | Double emission — R18-R21 registered in evaluateAll (:127→:253) AND re-run in the Batch-A block (:260-287); no downstream dedup | index.ts:127,253,260 | §2.5 |
| F-A3 | HIGH | checkContract ignores `stage` — evaluates pre+post+inv every call | math/contract.ts:63-95 | §2.2 |
| F-A4 | HIGH | Oracle has no epsilon/tolerance; PARAGON's discharge() dropped | math/oracle.ts:3-33 | §2.2 |
| F-A5 | MED | extractBindings casts Set→string (the type lie) | contract.ts:56 | §2.2 |
| F-A6 | HIGH | THREE grammars (doctrine-30 lit/var · PARAGON-24 num/bool/ref · as-built-31 sym/num/bool) — none interchangeable | expr.ts:10-27 | §2.2 |
| F-A7 | HIGH | R18 keyword ontology: PARAGON type names + 2 invented names scored as "LASME signatures"; score<2 magic | r18.ts:39-55,74 | §2.3 (deleted) |
| F-A8 | HIGH | R19/R21 regex-only detectors (ISE SIG-2 self-slop) | r19.ts:4, r21.ts:8 | §2.6 (deleted) |
| F-A9 | MED | Batch-B findings carry NO triad at emission; engine back-fills post-hoc | r22-r25 + layer-engine evaluateAll | §2.5/§2.7 |
| F-A10 | MED | R23's O(N) fix partial — chain/imports/awaits/readNodes open a DB per call | r23.ts:57-63,84,116,125 | SPEC-B B6 (one handle) |
| F-A11 | MED | Magic numbers uncalibrated (R24 cluster≥5, R25 pairs<10, R18 score<2) | r24/r25/r18:74 | §2.3/§2.7 |
| F-A12 | MED | R22 verb-substring contract anchoring (Order-1) | r22.ts:28-36 | §2.7 |
| F-A13 | HIGH | The theatrical log line ("single adjudication pass" for a pass that never happened) | index.ts:277 | §2.5 |
| F-A14 | MED | The port dropped PARAGON's enforcement chain (bare-regex rejection, born-off, sole-producer verdicts) | math/* vs PARAGON predicate-lexicon.ts:34 | §2.2 |
| F-A15 | LOW | Spec-file naming drift (V444 → V443) across DEBUG_LOG/wave-plan refs | DEBUG_LOG:980,996 | §2.6 (canon refresh) |

**What SURVIVES untouched (the keep set — audit report §5):** R0-R17 in full · triad.ts (the PARAGON-attributed type authority) · the AuditGraph store + event ingest + project-shape gate + the enforcement ring · the hunter in full (SPEC-B's concern) · eval.ts's PARAGON laws (subsumed into §2.2's rebuild).


## §2 THE FIX PLAN
### §2.1 The Input Pipeline (audit-spec.json)
**The law (operator Q3, verbatim):** "same setup as the wave manager. dont change anything here. should be visible basically right next to the wave-spec.json if one was to look in the filebase. everything self contained keep it clean."

**The file:** `<target>/.trident/audit-spec.json` — workspace-scoped (the target's own .trident/, beside wave-spec.json), auto-created on first run, editable in place, re-validated IN-TURN by the tool.after hook. **The port is a mechanic-for-mechanic replication of `V4.4.2_WAVE_MANAGER_BATTLE_TESTED/src/tools/wave-spec.ts`** (213L — the template shell, isPlaceholder, validateSpecFile, formatDiagnostics, ensure/reset, the FRESH→EDITING→VALIDATED→RUNNING machine).

**The template shell (every field carries its bracketed instruction):**

```json
{
  "codebase": "[ABS PATH: the src/ root the audit scans — must EXIST on disk]",
  "specs": ["[ABS PATH: a CURRENT-generation spec governing this codebase — must EXIST. NO stale specs from 8 checkpoints ago unless there is a tangible reason]"],
  "focuses": ["[OPTIONAL ≥30c: a specific audit focus, e.g. 'adapter wiring in brains/' — remove the key entirely if none]"],
  "knownContext": "[FLOOR 200c: measured state, prior findings, file:line anchors the audit must reconcile]",
  "doctrine": "[FLOOR 100c: verbatim operator rulings/conventions governing THIS codebase]",
  "measurements": "[FLOOR 100c: counts, sizes, line counts the audit must reconcile against]",
  "graphMode": "[auto|on|off — the graph-activated layers' activation. auto = active iff the SRO graph exists]"
}
```

**The validation (compiler-style SpecDiagnostic[] — the same turn, IDE-style):**

| Check | Severity | The diagnostic |
|---|---|---|
| codebase absent / placeholder / not-existing | error | `audit-spec.codebase: path does not exist → use the absolute src/ root` |
| codebase has no *.ts (recursive) | warning | `v1 scope is TypeScript — the tree contains 0 .ts files` |
| **specs array EMPTY or missing** | **error** | `audit-spec.specs: MANDATORY — ≥1 current-generation spec (the adjudication ground truth). A missing specs array is refused.` |
| specs[i] not-existing | error | `specs[0]: file not found → remove the stale/absent path` |
| specs[i] mtime older than the freshness horizon (default 45d) | warning | `specs[1]: mtime 94d old → current generation only (remove unless there is a tangible reason)` |
| knownContext < 200c / placeholder | error | `knownContext: 84c < 200c floor → anchors, numbers, prior findings` |
| doctrine < 100c / measurements < 100c | error | the same floor shape |
| focuses[i] < 30c (when present) | error | `focuses[0]: 12c < 30c floor` |
| graphMode=on ∧ no graph present | error | `graphMode=on but .trident/knowledge-graph has no SRO store → set auto or run the hunter first` |
| expectedCount analog — N/A | — | (no count contract; the file is singleton) |

**The state machine + the hook:** FRESH → EDITING (any edit) → VALIDATED (0 errors) → RUNNING (the audit call reads it) → reset → FRESH. The tool.after hook re-runs validation on every write to the file and returns the formatted diagnostic block in the tool result — the model never waits a turn to learn it broke a floor. **A run call with ✗ errors is REFUSED with the full block** (the IDE-throw experience).

**The intent-filter analog** (wave-spec's validateTemplateMatch kin): the graphMode check above + the .ts-scope warning — the mismatches that would waste a run are caught at the file.


### §2.2 The Math Substrate (doctrine-30 × PARAGON runtime)
**The decision (audit report §6.1, ratified):** doctrine-30 grammar as the SPEC LANGUAGE × PARAGON's RUNTIME SHAPE, with the rename table pinned in expr.ts's header. Files: `math/{expr,eval,contract,oracle,firewall,index}.ts` (firewall NEW).

**§2.2.1 expr.ts — the doctrine-30 union (KB-03:239-269, verified at source this session):**
`var, lit(number|string|boolean), add, sub, mul, div, mod, lt, le, gt, ge, eq, ne, and, or, not, if, card, sum, max, min, member, subset, setLit, forall, exists, prev, eventually, globally, until` — the 4 LTL kinds INCLUDED (the truncated 238-262 reading of the old plan would have shipped a 26-kind grammar unable to express temporal properties). The rename table (header comment, the interop law): `lit ↔ PARAGON num/bool/str · var ↔ PARAGON ref/as-built sym · forall.in ↔ as-built domain · setLit.xs ↔ as-built elems`. PARAGON's `foldAdd/foldAnd` are BUILDERS over add/and (grammar-neutral, exported from a builders module).

**§2.2.2 eval.ts — PARAGON's runtime, kept and extended:** the 6 `EvalErr` codes (`UNBOUND_SYMBOL, TYPE_MISMATCH, DIV_BY_ZERO, DOMAIN_UNBOUNDED, TEMPORAL_NOT_EVALUABLE, DEPTH_EXCEEDED`) verbatim (they ARE PARAGON eval.ts:11 — the unattributed port that was actually correct); depth-256, domain-10k, strict-and (no short-circuit), temporal-throws — all kept; extended to the full 30 kinds (lit's string arm; member/subset over set bindings).

**§2.2.3 contract.ts — stage-respecting checkContract (D-3 dead):**
```typescript
export type Stage = 'pre' | 'post' | 'inv' | 'temporal';
export function checkContract(c: MathContract, stage: Stage, b: BindingMap): ContractCheckResult {
  const exprs = stage === 'pre' ? c.preconditions : stage === 'post' ? c.postconditions
              : stage === 'inv' ? c.invariants : (c.temporal ?? []);
  // ONLY the stage's set is evaluated — KB-03:336-360's law. The role ladder:
  // pre→REJECT · post→THROW(MathPostconditionError) · inv→DIE(InvariantDeath)
  // · temporal→ESCALATE (TEMPORAL_NOT_EVALUABLE is the point-report, not a verdict)
}
```
The typed errors: `PreconditionRejected, MathPostconditionError, InvariantDeath, SupervisionEscalation` (KB-03:525/711/785/1162 — the doctrine's names, replacing the invented enum). `MathContract` keeps PARAGON's `provenance` field (the real port's contribution — the D5-provenance carrier).

**§2.2.4 oracle.ts — the epsilon law (D-4 dead):** `OracleDeclaration{exprId, oracleValue, anchor, unit?, epsilon}` — **epsilon REQUIRED at registration** (PARAGON oracle.ts:43's law); `discharge()` ported (PARAGON oracle.ts:75 — the integer-equality evaluation); `contentHash` kept; the comparison `|evaluated − oracle| ≤ epsilon` everywhere (KB-01:357-360).

**§2.2.5 firewall.ts (NEW) — the brand gate (KB-02:658-668, 744-751):**
```typescript
declare const __verified: unique symbol;
export type VerifiedMathSpec = { readonly expression: string; readonly bindings: Readonly<Record<string, number>>;
  readonly oracle: number; readonly tolerance: number; readonly [__verified]: true };
export function passThroughFirewall(raw: RawMathSpec): VerifiedMathSpec  // |eval−oracle|≤tol else FirewallError — the ONLY constructor
export function materializeCode(spec: VerifiedMathSpec): string           // brand-only (compile-time)
```

**§2.2.6 sets as first-class bindings (D-5 dead):** `extractBindings` maps Set/Array → the set binding (no cast); `evalExpr`'s set arms (member/subset/card/sum/max/min) consume them directly.


### §2.3 The Five LASME Layers (the two-sided shape detectors)
**The law:** every layer is a TWO-SIDED Order-2 AST detector emitting TYPED TRIPLES onto PLAN B's ontology — **zero keyword scoring** (`grep -rn "OracleRegistry|createGate|phase-machine|EvidenceTriad.*score" layers/r-*.ts` → 0). The shared shape:

```typescript
interface LayerCandidate {                    // the triple (PLAN B's types)
  readonly subject: string;                   // the module/symbol (canonical name)
  readonly predicate: 'shouldBe'|'isButWrong'|'violates'|'wraps'|'declares';
  readonly object: 'Lexicon'|'Actor'|'StateMachine'|'Engine'|'Adapter'|'Contract';
  readonly file: string; readonly line: number;
  readonly evidenceQuote: string;             // the verbatim code line(s)
  readonly implicatedSpecClause?: string;     // the detector's hint (specPath:line — the agent verifies)
  readonly side: 'SIDE-1' | 'SIDE-2';
}
export function candidates(ctx: AnalysisContext, specBindings: SpecBindings): LayerCandidate[];
```

**SIDE 1 = SHOULD be this architecture (per the specs) and IS NOT · SIDE 2 = IS this architecture and is coded WRONG.** The per-layer predicate tables (the doctrine anchors are the LASME wave's verified contract inventory):

**R-LEXICON** (C9/C10 — LEX:89-109, ISE:22-34): S1: decision logic the specBindings declare rule-driven, existing as if-chains/regex towers (ISE SIG-1: ≥5 pass-branches or default-pass; SIG-2: regex bodies + no AST walker) with no PatternFamily; repetitive judgment with no id/kind/matcher/severity/exampleHits shape. S2: a PatternFamily present but regex-only (Order-1), missing exampleHits (≥1 pos + ≥1 neg), missing triggerCondition/severity/messageTemplate/remediationHook, or a lexicon with NO consumer machine (LEX:736's I/O law).

**R-ACTOR** (C2/C7/C8 — ACTOR:202-230, 641-650, 688-714): S1: stateful concurrent units the specs describe (brains/engines/watchdogs) as bare classes with manual lifecycle — no createActor().start(), no send/subscribe; hook/warhead handlers not registered through the HookRegistry Map shape. S2: an actor never .start()ed, no failure subscription (failed/error→CHILD_FAILED), actor count ≠ machine count, fromPromise missing at invoke sites.

**R-STATE-MACHINE** (C1/C10/C12 — ACTOR:66-151, 02:577-692/303-359): S1: staged workflow logic (idle→building→testing→deploying→deployed) as scattered booleans/flags — no createMachine; spec-declared gates as ad-hoc if-checks — no GateCriteria/GuardCondition. S2: a machine untyped (no setup({types})), no final/error states (02:666-676), guards not MathExpr-routed, the decision pipeline missing INCONCLUSIVE (fail-open = SIG-1), the ladder absent (INFORM→WARN→BLOCK→REVERT→ESCALATE).

**R-ENGINE** (C3/C5/C6 — ACTOR:284-410, 496-506, 540-664): S1: heavy analysis the specs declare (ts.createProgram-class) living in hook handlers/module functions — no plain-class engine; evidence-generating work with no evidence-file writes. S2: an engine not a plain class, no real computation (the theatrical shell), no try/catch degrade (ACTOR:382-391), no .shark/*-evidence/ writes; a container WITH methods (C5's zero-methods law); a supervisor without budget/WAL.

**R-ADAPTER** (C4 — ACTOR:427-460, 489-492): S1: cross-boundary translation the specs declare (hook→machine, tool→engine, event→actor) done by direct calls — no 3-call adapter; the N/M adapters gap (machines wired without adapters). S2: an adapter missing a 3-call leg (delegate→actor.send(TOOL_AFTER)→snapshot merge), no snapshot merge, adapter count ≠ engine count.

**The detection mechanics (Order-2 only):** ts.isCallExpression callee resolution (createMachine/createActor/setup/fromPromise/subscribe/send), HeritageClause + InterfaceDeclaration walkers (the PatternFamily shape), PropertyAccess chains (registry.fire/HookRegistry), class-declaration analysis (plain-class vs extends-framework), and the callgraph's whoCalls/unwired (existing audit-graph verbs). **The detectors consult `specBindings`** (the parsed specs' declared-architecture table — which modules the specs SAY carry which component) so SIDE-1 fires only where a spec declares the should.


### §2.4 R-MPSE (the contract-evaluation layer)
**The only layer whose ground truth is fully the specs' NUMBERS** (SPEC-S §2 fleshed the concept; this is the mechanical contract). The detector is the §2.2 substrate, parameterized by specBindings:

```
SIDE 1 — SHOULD be contractual, ISN'T:
  for each literal-comparison site (ts.BinaryExpression, comparison operator,
    numeric literal ∉ {0,1,-1,2}) in a file whose specBindings declare an
    enforcement-domain binding for that domain:
      the spec's MathContract{id, pre=[bound], tolerance} exists (parsed from
      the spec text — "sl[3] = 2.5", "threshold 0.38 ± 0") BUT the site's
      literal is NOT bound: no NamedConstant reference, no evalExpr routing
      → candidate {subject: site, predicate: 'shouldBe', object: 'Contract',
                   evidenceQuote: the comparison line,
                   implicatedSpecClause: the spec's binding line}

SIDE 2 — IS contractual-shaped, but WRONG:
  a MathContract/checkContract/oracle call-site exists BUT:
    · stage not respected (all-stages evaluated — detect: checkContract calls
      whose stage argument is ignored/absent in the implementation the callgraph
      resolves to — the D-3 shape)
    · oracle without epsilon (registration missing the field)
    · a MathExpr declared but evalExpr never invoked on its route (the
      declaration-only contract — the callgraph finds no evaluation edge)
    · a named constant whose VALUE ≠ the spec binding (name collision, value
      drift: |code − spec| > tolerance)
  → candidate {predicate: 'violates'|'isButWrong', object: 'Contract', ...}

THE EVALUATION (the shadow's P1 evidence + P2 rubric, mechanically assisted):
  R-MPSE pre-computes per candidate: evalExpr(bound-expr, {codeValue}) vs
  {specValue, tolerance} → the |Δ| number rides the candidate. The shadow
  adjudicates: TRUE_DEFECT requires the spec clause + the code site + the
  divergence sentence (rubric Law 1); RED_HERRING names the structural reason
  ("the literal is an array-length guard, not enforcement-domain").
```

**The specBindings parser (the new mechanical leg):** a bounded parser over the specs[] text extracting `MathContract`-shaped declarations — numeric bindings (`name = value`, `name: value ± tol`, backtick tables, JSON blocks), threshold phrases ("threshold 0.38", "≥ 0.96"), and cardinalities ("|O| = 24"). Output: `SpecBindings{declarations: Array<{name, value, tolerance, specPath, line, quote}>}` — THE bridge from spec prose to the substrate (the D1 kill: one admissible reading, mechanically parsed, never "interpreted").


### §2.5 The Rewire (single emission + triads at emission)
**The one emission law (D-1/D-2/D-13 dead here):** the audit() pipeline becomes:

```
audit() :184
  ├─ :240-250 the unchanged prelude (countTsFilesInTarget, the EMPTY_TARGET fix — kept)
  ├─ :253 evaluateAll(R0-R17 ONLY — the legacy 18; the six new layers are NOT
  │        registered here; they are CANDIDATE PRODUCERS, never self-emitting)
  ├─ :256 enrichWithHiveKnowledge (kept)
  ├─ NEW  THE MANDATE BLOCK (replaces :257-290 wholesale):
  │        1. specBindings = parseSpecBindings(auditSpec.specs)
  │        2. candidates = concat(
  │             rLexicon.candidates(ctx, specBindings),
  │             rActor.candidates(ctx, specBindings),
  │             rStateMachine.candidates(ctx, specBindings),
  │             rEngine.candidates(ctx, specBindings),
  │             rAdapter.candidates(ctx, specBindings),
  │             rMpse.candidates(ctx, specBindings) )
  │        3. shadowRun = runAuditShadow({runId, targetRoot, specs, focuses,
  │             candidates, chain, budgetRounds})          ← SPEC-S's runner (S4)
  │        4. verdicts = parseVerdicts(shadowRun.ledger)  ← the on-disk file, never context text
  │        5. findings = candidates
  │             .map((c, i) => verdictToFinding(c, verdicts[i], LAYER_MACHINE_ID[c.layer]))
  │             .filter(Boolean)                          ← RED_HERRING→null; UNCLASSIFIED
  │                                                          when brain-dead (SPEC-S step 11)
  │        6. enrichedFindings = [...enrichedFindings, ...findings]   ← ONE append point
  ├─ the ScoreGate/score/graph/report tail — UNCHANGED (the findings flow the
  │  existing channels; the graph appendFinding's no-triplet skip becomes dead
  │  code because every finding now carries its emission-time triad)
```

**Triad at emission (D-9 dead):** `verdictToFinding` synthesizes the triad from the LAYER's own transition — `{pattern: {memberId: c.predicate+'.'+c.object, familySeverity}, state: {machineId: LAYER_MACHINE_ID[c.layer], from: 'ANALYZED', to: 'EVIDENCED'}, evidence: {file: c.file, line: c.line, graphNodeId?}}` — `LAYER_MACHINE_ID = {r-lexicon, r-actor, r-state-machine, r-engine, r-adapter, r-mpse}` (each layer's own machine, NEVER 'layer-engine'). The LayerEngine's post-hoc back-fill is DELETED (layer-engine.ts's dedup loop loses its triad branch; the store gate at :350 enforces — no-triplet = the WARN + skip, now unreachable in practice).

**The log line (D-14):** `tridentLog('INFO', 'audit-engine', 'MANDATE: ${candidates.length} candidates → shadow ${shadowRun.manifest.ready ? 'READY' : 'PARTIAL'} — verdicts TP:${...} RH:${...} UNCLEAR:${...} UNCLASSIFIED:${...}')` — the REAL counts from the manifest, replacing the theatrical "single adjudication pass".

**UNCLASSIFIED handling:** a brain-dead/budget-exhausted shadow (manifest.ready=false) still yields findings — every candidate becomes `{severity: 'MEDIUM', category: 'UNCLASSIFIED', description: 'the mechanical candidate; the shadow could not adjudicate (stage: <stage>)'}` with its triad. The audit NEVER silently loses candidates (SPEC-S MC-S-08's consumer side).


### §2.6 The Deletions + The Ship-Gate
**The wipe (operator Q2, ratified):** DELETE the source + tests for r18-component-presence, r19-claims-without-machinery, r20-ungrounded-thresholds, r21-dead-enforcement-surface, r22-spec-enablement (R23/R24/R25's files also go — their re-grounded successors are SPEC-B B6's r-graph/r-dh-feed/r-provenance). De-register every removed import/registration (index.ts:62-70, :127, :190-197, :519-520, the singleLayer list). Write `MASTER_CONTEXT/DELETED_R18_R25.md` — the lineage: what each layer was, why it died (the D-ids), what replaced it (the new layer + spec section), the DEBUG_LOG pointer. **The old layers' evaluate() self-stamp pattern dies with the files.**

**The ship-gate (R16's pattern preserved — the operator's warhead hunch, ratified):** `src/audit-engine/ship-gate/checks.ts` — the one-shot check-cluster extracted from r16-bible-enforcement's verified core (the 1,517L file dies; its warhead bindings, awaited-graph, single-file-bundle, container-invariant checks live on):
- `warheads.bound` — the registry's active warhead count matches the declaration table
- `graph.awaited` — no bare `Promise.all` over graph construction (the awaited-edge law)
- `build.singleFile` — the dist is one bundle (the container-deploy contract)
- `manifest.complete` — the ship manifest's sections all present
Run position: ONE-SHOT at container-test time (the ring-scan's position — NOT per-audit; the separation law: the ship-gate enforces BUILD contracts, the layers detect ARCHITECTURE shapes).

**The canon refresh (F-A15):** DEBUG_LOG gains the D-1..D-15 closure entries; CURRENT_STATE/NEXT_STEPS/BUILD_REPORT updated at A5's gate; the V443 naming audit re-run project-wide (0 V444 refs in living docs).


### §2.7 Batch B (the graph-activated consumers)
**The activation law (graphMode):** `auto` (default) — active iff the SRO store exists (SPEC-B B1's typed tables, non-empty); `on` — refuse at A1's gate if absent; `off` — never. When active, AFTER the mandate block's findings:

```
R-GRAPH      (replaces R23): the path queries via B3's engine — adapter↔machine
             wiring parity, unwired exports — ONE shared DB handle (the D-10
             class dead: the adapter holds one connection for its lifetime)
R-DH-FEED    (replaces R24): the hunter's findings table loaded as CANDIDATES —
             {ruleId, file, line, evidence} rows → re-adjudicated by the SECOND
             shadow pass against current code + specs (the cluster≥5 magic dead;
             the agent judges clusters with the specs in hand)
R-PROVENANCE (replaces R25): every spec clause the FIRST pass cited gets its
             spec→code trace verified over graph edges (BFS ≤64) — TRACE_GAP
             candidates feed the second pass
THE SECOND BRIEF: the same SPEC-S runner instantiated with the Batch-B
             candidates + the graph neighborhood (the bounded subgraph
             pre-read) — triads at emission, machineIds r-graph/r-dh-feed/
             r-provenance
```

**The two-batch sequencing (operator R-3, verbatim):** "these are 2 sequential batches. first happens graph agnostic, shadow enhanced, 2nd happens w/ full findings report + graph context. also shadow enhanced." Batch A's findings + the shadow report are INPUTS to Batch B's demand (PART 2's chain carries the first pass's verdict table).

**The L8 write-back:** both batches' findings land in the graph store as typed edges (`flagged_by` the layer, `violates` the spec clause — PLAN B's predicates), the run event appended — the compounding loop's audit side.


### §2.8 THE MPSE WIRING (the meta-audit anchors)
The meta-audit anchors (the same law as SPEC-S §2.8 — the tool audits its own implementation against THESE contracts; Appendix B is the machine registry):

| ID | Contract | The expr (condensed; full JSON in App B) | Oracle |
|---|---|---|---|
| **MC-A-01** | `audit.specs.mandatory` | pre: `card(specs) ≥ 1`; the A1 gate REFUSES otherwise | 0 empty-specs runs |
| **MC-A-02** | `audit.emission.single` | post: `count(findingEmissionPoints) = 1` (the code path: ONE append to enrichedFindings per batch) | 1, tol=0 |
| **MC-A-03** | `audit.triad.atEmission` | post: `forall f ∈ findings: f.triad.machineId ≠ 'layer-engine'` | 0 back-fills |
| **MC-A-04** | `audit.noKeywordScoring` | post: `grep("OracleRegistry\|createGate\|phase-machine", layers/r-*.ts) = 0 hits` | 0, tol=0 |
| **MC-A-05** | `math.stage.selection` | post: `checkContract(c,'post',b) evaluates ONLY c.postconditions` — the unit proof (evaluate a contract whose pre FAILS but post PASSES at 'post' → ok:true) | the fixture |
| **MC-A-06** | `math.oracle.epsilon` | post: `forall d ∈ oracleDeclarations: present(d.epsilon)` ∧ `\|eval−oracle\| = tol+1e-12 → FirewallError` (the boundary fixture) | the boundary |
| **MC-A-07** | `math.grammar.thirty` | post: `count(ExprKind union members) = 30` (the type-level count, asserted by a compile-time Exhaustive check + a runtime kinds set) | 30, tol=0 |
| **MC-A-08** | `audit.shadow.consumed` | post: `manifestReady ∨ unclassifiedEmitted = candidatesIn` (every run's candidates resolve to findings either way) | 0 lost |
| **MC-A-09** | `audit.goldenZero.paragon` | post: `audit(PARAGON_V1, specs=[its bible]) → count(R-LASME findings) = 0` (the reference implementation is conformant — the conformance ceiling proof) | 0, tol=0 |
| **MC-A-10** | `audit.dedup.dead` | post: `grep("dedup", index.ts) = 0` ∧ the doubling fixture (a candidate appears in findings EXACTLY once) | 0 doubled |
| **MC-A-11** | `layers.ise.order2` | post: the ISE scans (towers/ladders/regex-only) pass on every r-*.ts — `regexOnlyClassifierCount = 0` | 0 |
| **MC-A-12** | `rmpse.binding.bridge` | post: `forall d ∈ specBindings.declarations: present(d.quote) ∧ present(d.specPath) ∧ present(d.line)` (every parsed binding carries provenance — the D5 kill) | 0 orphans |

**The D1-D9 map (this plan's exposures):** D1 (a spec "interpreted" differently by detector vs shadow — the specBindings parser is ONE mechanical reading, the shadow cites the same line); D2/D3 (candidate/verdict cardinality — SPEC-S MC-S-05 + the emission count); D4 (the rewire touching legacy code beyond the mandate block — MINIMAL CHANGE, the keep set untouched); D5 (a binding parsed without provenance — MC-A-12); D6 (a layer skipping a spec-declared domain — the specBindings coverage fixture); D7 (the triad shape — the zod-parse); D8 (empty codebase/0 candidates/graphMode edge cases — A1's warnings + the honest-empty path); D9 (Batch B before Batch A — the sequential law).


## §3 IMPLEMENTATION ORDER (waves A1..A6)
| Wave | WHAT | Files owned | Gate (done-when) |
|---|---|---|---|
| **A1** | The input pipeline (§2.1): audit-spec.ts — the port of wave-spec mechanics + the audit-specific checks (specs mandatory, staleness, graphMode intent) + the tool.after hook | `src/audit-engine/input/audit-spec.ts` + `__tests__/audit-spec.test.ts` | the diagnostic battery (every ✗/⚠ fires on its fixture); the in-turn hook; the refusal on errors; tsc 0 |
| **A3** | The math substrate (§2.2): the 5-file rebuild + firewall.ts + builders | `src/audit-engine/math/*.ts` + `math/__tests__/*.test.ts` | ~20 fixtures: stage-selection (MC-A-05), epsilon boundary (MC-A-06), the 30-kind count (MC-A-07), temporal-throw, brand-forge-reject, discharge, sets-as-bindings; tsc 0; preflight ≥951 |
| **A4** | The six layers (§2.3-2.4): r-{lexicon,actor,state-machine,engine,adapter,mpse}.ts + the specBindings parser | `src/audit-engine/layers/r-*.ts` + `input/spec-bindings.ts` + fixtures | per-layer fire/silent pairs (the shape predicate, not rule-id text); the golden-zero fixture; `grep keyword-registry = 0` (MC-A-04); the ISE scans pass (MC-A-11); tsc 0 |
| **A5** | The rewire + deletions + ship-gate (§2.5-2.6): index.ts's mandate block, the triad law, the single emission; DELETE r18-r25 + their tests; DELETED_R18_R25.md; ship-gate/checks.ts | `src/audit-engine/index.ts`, `layer-engine.ts` (the back-fill branch), `ship-gate/checks.ts`, the deletions | `grep "void brief" = 0` (S-1); the doubling fixture (MC-A-10); `grep "layer-engine" triads = 0` (MC-A-03); the ledger row exists; the ship-gate checks pass on this repo; tsc 0; preflight ≥951 |
| **A6** | The audit container test (§4.3) | the rig + `.trident/container-test-results.json` | all scenarios PASS with doctrine pass-tokens (the §4.3 set) |

Dependencies: A1+A3 parallel (disjoint); A4 after A1 (specBindings consumes the specs array) + A3 (the substrate types) + B1 (the triple types); A5 after A4 + S4 (the runner call); A6 last (needs S6's harness live).


## §4 TESTING STRATEGY
**The unit battery:** A1's diagnostic matrix (placeholder/floor/existence/staleness/graphMode × error/warning) · A3's ~20 substrate fixtures · A4's per-layer fire/silent pairs + THE GOLDEN-ZERO (a doctrine-conformant fixture codebase → 0 candidates) + the RED_HERRING path · A5's doubling/void-brief/back-fill greps + the ship-gate checks.

**The replay tests (the real failures reconstructed — the skill's law):**
- REPLAY-D1: the void-brief scenario — a fixture where the OLD code's behavior (all-TRUE_POSITIVE) is asserted AGAINST (the new path must show the ledger's verdict row ≠ self-stamp)
- REPLAY-D2: the 26-module run — the old double-emission's counts vs the new single emission (findings appear once)
- REPLAY-F8: the R19 regex class — a file whose exports match /Engine|Registry|.../ but ARE wired (callgraph-proven) → 0 candidates (the old layer fired)
- REPLAY-MPSE: the 0.40-vs-0.38 case — the specBinding parses 0.38±0, the code site carries 0.40 → the R-MPSE candidate with |Δ|=0.02 pre-computed

**The container test (A6 — the W17 protocol):** fresh container, the real dist + the real provider. Scenarios + pass tokens (doctrine predicates, never rule-id text):
S1 BRIEF-SENT — the ledger's verdicts.json exists + schema-valid (passToken: the manifest's `counts.trueDefect` field)
S2 SPECS-READ — the read-turn ledger covers every specs[] path (passToken: `read-turns.json`'s covered-set = the specs array)
S3 GOLDEN-ZERO — audit PARAGON_V1 with its bible → 0 R-LASME findings (passToken: the findings array empty for layers r-*)
S4 BRAIN-DOWN — the provider stripped mid-run → UNCLASSIFIED findings = candidates (passToken: manifest.ready=false + counts.unclassifiedEmitted)
S5 STAGE-PROOF — in-container: checkContract('post') on a pre-failing contract → ok (passToken: the fixture's output marker)
S6 EPSILON-BOUNDARY — |eval−oracle|=tol+1e-12 → FirewallError (passToken: the error's name field)
S7 BATCH-B-SILENT — no graph → 0 Batch-B findings, count unchanged (passToken: the findings array lacks r-graph/*)
S8 NO-DOUBLING — a seeded candidate appears exactly once (passToken: count=1)


## §5 ANTI-PATTERNS AGAINST FALSE SUCCESS
| # | The trap | The failure mode | The detector |
|---|---|---|---|
| AP-A-1 | **The keyword ghost** — a "shape detector" that secretly greps names | MC-A-04's grep + the ISE scans + the golden-zero (a name-matched-but-conformant file stays silent) | A4's fixtures |
| AP-A-2 | **The re-registered self-emitter** — a new layer's evaluate() emitting findings directly (the R18 pattern reborn) | the layers export candidates() ONLY; evaluate is absent or returns [] — the A5 grep asserts no r-*.ts constructs AuditFinding outside verdictToFinding | A5's gate |
| AP-A-3 | **The back-fill resurrection** — layer-engine's triad branch kept "for safety" | MC-A-03's grep (machineId='layer-engine' = 0) | A5 |
| AP-A-4 | **The stage-laundering checkContract** — the signature takes stage but the body evaluates all | MC-A-05's unit proof (a pre-failing/post-passing contract at 'post' MUST return ok) | A3 |
| AP-A-5 | **The spec-skim** — the parser reading only the specs' first N lines | the coverage fixture: a binding declared at the spec's END is parsed | A4 |
| AP-A-6 | **The severity theater** — UNCLASSIFIED dressed as TRUE_DEFECT when the brain dies | the verdictToFinding mapping: ready=false → category UNCLASSIFIED, severity MEDIUM, never CONFIDENCE-fabricated | A5 + SPEC-S |
| AP-A-7 | **The golden-zero gamed** — the layers silenced on PARAGON_V1 by whitelisting it | the golden-zero fixture asserts 0 candidates PRE-shadow (the mechanical layers themselves) — a whitelist would show as a silent file-skip in the coverage | A4/A6 |
| AP-A-8 | **The double-brief** — Batch A and Batch B sharing one run's ledger (indexing chaos) | per-batch runIds (audit-<ts>-A/-B); the ledgers never share a dir | §2.7 |
| AP-A-9 | **The keep-set creep** — the rewire "improving" R0-R17 | MINIMAL CHANGE: index.ts's mandate block only; `git diff` scoped to the declared files at A5's audit | A5's review |
| AP-A-10 | **The dead-deletion** — r18-r25 files deleted but the imports/registrations left dangling | tsc 0 catches the dangling imports; the registry grep (r18|R19|...|r25 in index.ts = 0) | A5 |

## §6 SUCCESS CRITERIA

- **A-1** `grep -rn "void brief" src/audit-engine/` → 0
- **A-2** The audit refuses to run with an empty/missing specs[] (A1's gate — the container S-token)
- **A-3** A full run on the fixture target: candidates → ledger verdicts → findings; every finding's triad.machineId ∈ the six layer ids (0 'layer-engine')
- **A-4** The doubling fixture: a seeded candidate appears exactly once in the findings
- **A-5** MC-A-05/06/07 green (the stage proof, the epsilon boundary, the 30-kind count)
- **A-6** The golden-zero: PARAGON_V1 as target → 0 R-LASME findings (pre-shadow: 0 candidates)
- **A-7** The container's 8 scenarios PASS with pass-tokens in tool-result context; `.trident/container-test-results.json` written
- **A-8** THE META-AUDIT: the tool audits its own layers/input/rewire against THIS spec's §2.8 registry → 0 TRUE_DEFECTs
- **A-9** `tsc --noEmit` 0 · preflight ≥951/0 · the 44 committed legacy fixtures still green (zero broken windows)
- **A-10** DELETED_R18_R25.md exists with the lineage table; `grep -rn "r18-|r19-|r20-|r21-\|r22-\|r23-\|r24-\|r25-" src/audit-engine/index.ts` → 0


## §7 COMPACTION-PROOF IMPLEMENTATION GUIDE + §8 OPEN QUESTIONS
**Resume anchors:** THIS spec (§2 the contract, §2.8/App B the meta-anchors) · SPEC-S §2.7 (the runner being consumed) · the newest audit-ledger manifests · the wave-plan section in flight.

**Cross-consistency:** every new component names its spec section in a header comment (`// SPEC-A §2.5`); every threshold cites its MC id; the layer fixtures live beside the layers (`layers/__tests__/r-*.test.ts`) — the battery is the doctrine predicate set, never the rule-id text.

**Canon:** DEBUG_LOG entries at A1/A3/A4/A5 gates; BUILD_REPORT closure at A6 with the container evidence; CURRENT_STATE/NEXT_STEPS refreshed at A5 and A6.

## §8 FINAL NOTES / OPEN QUESTIONS

1. **The specBindings parser's grammar (§2.4):** v1 parses the 4 declaration shapes (name=value, name: value ± tol, threshold phrases, cardinalities). Exotic spec formats (mermaid tables, YAML blocks) → the UNCLEAR verdict path (the shadow names the unparseable clause) — by design, NOT a blocker. The parser grows by fixture evidence.
2. **The freshness horizon (A1's staleness warning):** 45d default, configurable via audit-spec's optional `freshnessDays`. Warning-only (never a refusal) — the operator's "unless there is a tangible reason" is honored by the human, not the gate.
3. **graphMode=on + no graph:** refused at the gate (the intent check). The alternative (silent downgrade to auto) is REJECTED — silent downgrades are the theatrical class.
4. **The ship-gate's run position:** one-shot at container-test. If the operator later wants it in every audit run, it's a flag flip — the checks are pure functions over the repo.


## APPENDIX A — ZERO-TRUST AUDIT + APPENDIX B — THE MPSE CONTRACT REGISTRY
**APPENDIX A — ZERO-TRUST AUDIT** (the adversarial pass, findings resolved at authoring):

| # | Sev | Finding | Resolution |
|---|---|---|---|
| Z-A1 | HIGH | §2.5's rewire depends on SPEC-S's runner existing — a builder could start A5 before S4 | The dependency is now explicit in §3's table (A5 after A4 + S4) + the wave-plan's DAG |
| Z-A2 | MEDIUM | The specBindings parser could silently drop specs it can't parse (the D6 class) | §2.4: unparseable → the UNCLEAR path (named, never dropped); the coverage fixture asserts the end-of-file binding |
| Z-A3 | MEDIUM | MC-A-09's golden-zero could pass vacuously if the layers never scan PARAGON's tree | The fixture asserts 0 candidates PRE-shadow with the coverage visible (AP-A-7's detector) |
| Z-A4 | LOW | The two-batch runId suffix (-A/-B) was implicit | §2.7 states it (AP-A-8) |
| Z-A5 | LOW | The ship-gate extraction could pull r16's unverified tails | checks.ts extracts ONLY the four verified check families (§2.6's list); r16's speculative checks die with the file |

**Verdict:** 5 findings (0 CRITICAL, 1 HIGH, 2 MEDIUM, 2 LOW) — resolved. No unresolvable gaps.

**APPENDIX B — THE MPSE CONTRACT REGISTRY** (`spec-a.mpse.v1`): the 12 contracts of §2.8 in the same JSON encoding as SPEC-S Appendix B (the 30-kind grammar; bound functions `count/grep/present` bound by the meta-audit harness). Entries: `audit.specs.mandatory` (pre: card≥1), `audit.emission.single` (post: count=1), `audit.triad.atEmission` (post: ∀f machineId≠'layer-engine'), `audit.noKeywordScoring` (post: grep=0), `math.stage.selection` (the fixture oracle), `math.oracle.epsilon` (the boundary), `math.grammar.thirty` (post: count=30), `audit.shadow.consumed` (post: manifestReady ∨ unclassified=candidatesIn), `audit.goldenZero.paragon` (post: count=0), `audit.dedup.dead` (post: grep=0 ∧ the fixture), `layers.ise.order2` (post: regexOnly=0), `rmpse.binding.bridge` (post: ∀d provenance-present). **The meta-audit invocation:** the tool audits `<this repo>/src/audit-engine/{input,layers,math,ship-gate,index.ts}` against THIS registry — 0 TRUE_DEFECTs = the A-8 closure.

**END OF SPEC — PLAN A. Contracts: 12. Waves: 5 (A1,A3,A4,A5,A6). Consumes: SPEC-S (the runner), PLAN-B B1 (the ontology), B3/B6 (Batch B's graph legs).**

