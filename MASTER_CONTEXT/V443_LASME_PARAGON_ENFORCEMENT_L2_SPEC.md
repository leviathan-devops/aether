# V4.4.3 LASME-MANDATE + PARAGON-ENFORCEMENT L2 SPEC

**Version:** 1.0 · **Date:** 2026-08-24 (operator ruling: "every single fucking project is hereby MANDATED to have LASME wired into its fundamental components. nothing ships without it") · **Status:** AUTHORITATIVE
**Predecessor:** V443_SINGLE_PROVIDER_CLEANUP_L2_SPEC.md (completed, dist e47ac117) · **Baseline dist:** e47ac1175c4076a145c962ad458d5975f8c64437f3d8b48994385ee2ce02562b
**Design authorities referenced:** PARAGON_CODE_AUDIT_OVERHAUL_L2_SPEC.md (SPEC-1, 4,870L), SPEC2_SHADOW_ENHANCED_CODE_AUDIT_L2_SPEC.md (2,095L), SPEC3_EVENT_AWARE_PARAGON_GOD_LOOP_L2_SPEC.md (1,526L)

## THE OPERATOR'S RULINGS (verbatim, never re-litigated)

- R-1: "every single fucking project is hereby MANDATED to have LASME wired into its fundamental components. nothing ships without it"
- R-2: "the 2nd is better so we have LASME enforced on the code audit by default on every project" (Batch A = graph-agnostic, default-on)
- R-3: "the depth and precision is auto-activated if a knowledge graph exists and derailment hunter has already been run — findings report feeds into this as well. these are 2 sequential batches. first happens graph agnostic, shadow enhanced, 2nd happens w/ full findings report + graph context. also shadow enhanced"
- R-4: "SHADOW ENHANCED - NOT 100% PROMPT BASED MODEL ONLY" — every shadow layer emits mechanical candidates BEFORE any model call; the model adjudicates evidence, never invents targets
- R-5 (from earlier ruling): tool rename — bug-hunt tool → DERAILEMENT HUNTER (first-class alias `logic-audit`); agent stays `bug hunter`; both tools first-class in a designed workflow
- R-6 (from cleanup spec): ONLY opencode-go/muse-spark-1.2-contributor @ https://opencode.ai/zen/go/v1/chat/completions, xhigh, 15×3s, zero fallbacks, loud isolated fail

## THE TWO BATCHES (the architecture)

### BATCH A — LASME MANDATE (default-on, graph-agnostic, ships in EVERY audit)
Four new audit layers (R18-R21), each = mechanical candidate generation + shadow-enhanced adjudication:

- R18 COMPONENT-PRESENCE — LASME machines must exist and be wired. Mechanical: AST scan for mandated LASME signatures (state-machine setups, oracle registries, evidence-triad emissions, gate chains, phase machines). No LASME → CRITICAL "nothing ships without it".
- R19 CLAIMS-WITHOUT-MACHINERY — exports named */Engine|Registry|Gate|Machine|Ledger|Observer/* with ZERO construction or wiring call-sites → theatrical-arch finding.
- R20 UNGROUNDED-THRESHOLDS — magic-number comparisons inside enforcement paths not routed through evalExpr/oracle/named constant → MPSE-grounding violation.
- R21 DEAD-ENFORCEMENT-SURFACE — gates/validators imported but never invoked on any execution path.

### BATCH B — PARAGON DEPTH (auto-activates when: shared.db knowledge graph EXISTS ∧ derailment-hunt runId present)
Four more layers (R22-R25), same shadow-enhanced pattern, SILENT when preconditions absent:

- R22 SPEC-ENABLEMENT — per graph-declared pipeline stage/contract → locate the enforcing component; absence or theater where a PARAGON component should be → finding.
- R23 WIRING-CONFORMANCE — wiring.* templates (from TEMPLATE_LIBRARY) evaluated over audit-graph edges — the never-connected consumer finally connected.
- R24 FINDINGS-FEED — derailment runId findings ingested → root-cause clusters + fix-presence verification.
- R25 PROVENANCE-LINEAGE — traces-to-source over graph edges (MPSE oracle lineage, declared feeds).

### THE SHADOW-ENHANCED PATTERN (R-4 law — the same for ALL 8 layers)
```
MECHANICAL CANDIDATE GENERATION (AST/graph, deterministic, no model)
        │  each candidate = {file, line, kind, evidence-window, mechanical-score}
        ▼
SHADOW ADJUDICATION (muse-spark ONLY, 15×3s, brief→judgment.md, Step-X harness)
        │  model classifies: TRUE_POSITIVE / RED_HERRING / UNCLEAR
        │  model cites file:line from the evidence windows — never invents
        ▼
LOUD-SKIP LAW: brain down → STEP-X SKIPPED header, machinery candidates still
        emitted as UNCLASSIFIED findings (never silent loss, never fabricated verdicts)
```

## THE IMPLEMENTATION SURFACE (what exists to build on)

- `src/audit-engine/layers/` — 18 R-layer files, ~7,900 lines, regex-verdict ≈ 0 (metered). New layers land here as r18-*.ts … r21-*.ts.
- `src/audit-engine/ast/audit-ast-core.ts` — RAM-safe scoped program + checker (the mechanical candidate source).
- `src/audit-engine/graph/audit-graph.ts` — AuditGraph with whoCalls/chain/imports/awaits/unwired/nodes (BATCH B's edge source).
- `src/subagents/trident-bug-hunter/lexicon/templates.ts` — TEMPLATE_LIBRARY (7 arch templates incl wiring.*, contract.must-implement, provenance.traces-to-source, domain.numeric-threshold, process.gates). **Currently consumed ONLY by the hunter** — Batch B R23 connects it to audit-graph.
- `src/audit-engine/harness/pi-shadow-agent.ts` + `shadow/agent-brain.ts` + `shadow/step-x-orchestrator.ts` — the single-provider Step-X harness (muse-only, 15×3s, loud skip). REUSED as-is for all 8 layers' adjudication (per-layer briefs).
- `src/audit-engine/index.ts` — audit() pipeline: the wiring point for R18-R25 (after ringScan :317, before/around Step-X :330+).
- `src/audit-engine/math/` — MPSE substrate (expr/eval/contract/oracle). R20's ground-truth source (ungrounded = not routed through it).
- `src/audit-engine/triad.ts` + `db.ts:469` — the triad store gate. R18 checks emissions exist; triad gate enforces them.

## THE MECHANICAL CANDIDATE SPECS (per layer — the R-4 law)

### R18 COMPONENT-PRESENCE (default-on)
- Mechanical: walk the target's AST; score LASME signatures per module: xstate setup/`createMachine`/`Machine` states, `OracleRegistry`/`createOracleRegistry`, `EvidenceTriad`/`assertEvidenceTriad` call sites, named gate functions invoked, phase machines (INIT→…→PASS). Module LASME-score = Σ weighted signature hits.
- Candidate rule: a module claiming architecture role (imports LASME/math/triad/gates) with score < threshold (2 signatures) → candidate "LASME_INCOMPLETE".
- Shadow brief: per candidate, the evidence window = the module's imports + the present/absent signature lines. Model adjudicates: TRUE_POSITIVE (really missing machinery) / RED_HERRING (score threshold wrong for a legit leaf).
- Severity: CRITICAL when the module is on the declared-critical list (entrypoints, index, orchestrator), else HIGH.

### R19 CLAIMS-WITHOUT-MACHINERY (default-on)
- Mechanical: find exported identifiers matching /Engine|Registry|Gate|Machine|Ledger|Observer|Validator/; for each, count construction (`new X`, `X(...)` call) + registration/wiring references. Export with ZERO references outside its own file → candidate "DEAD_EXPORT_ARCH".
- Shadow brief: the export's declaration + the grep of references (empty). Model confirms it's truly unwired (not invoked dynamically via strings/registry).
- Severity: HIGH (architectural dead weight).

### R20 UNGROUNDED-THRESHOLDS (default-on)
- Mechanical: in files importing math/oracle/contract machinery, find numeric literal comparisons (`> 0.40`, `>= 3`, `=== 15` etc.) in enforcement/decision paths NOT bound to a named constant, an oracle, or an evalExpr call → candidate "MAGIC_THRESHOLD".
- Named-constant detector: is the literal assigned to a const in scope, or is the comparison against a `NaN-checked` bound? Mechanical whitelist of legit patterns.
- Shadow brief: the comparison site + the surrounding enforcement context. Model adjudicates whether the threshold is a magic number (violation) or a structural delimiter (not).
- Severity: HIGH.

### R21 DEAD-ENFORCEMENT-SURFACE (default-on)
- Mechanical: imports of gate/validator/firewall modules; count actual invocation sites (`gate(...)`, `.validate(`, `.check(`) on any path reachable from entrypoints. Import with zero call sites → candidate "UNINVOKED_GATE".
- Shadow brief: the import site + the grep of call references (empty) + the module's exported surface. Model confirms no dynamic/indirect invocation.
- Severity: HIGH (declared enforcement that never fires = theatrical).

### R22 SPEC-ENABLEMENT (graph-activated)
- Activation precondition: shared.db graph exists (`.trident/knowledge-graph/shared.db` with graph_nodes rows) ∧ a derailment-hunt runId exists with stored findings.
- Mechanical: read the profile's `pipeline.stages[]` (declared contracts with entry files); for each stage, check the entry file EXISTS and the declared contract has a mechanical anchor (the contract's key verbs present in the file). Missing entry / absent anchor → candidate "STAGE_UNIMPLEMENTED".
- Shadow brief: the stage declaration + the entry-file read + the verb grep. Model adjudicates implemented/theater/absent.
- Severity: CRITICAL for stage-1 (foundation) through stage-N dependencies.

### R23 WIRING-CONFORMANCE (graph-activated)
- Activation precondition: graph present.
- Mechanical: run TEMPLATE_LIBRARY's wiring.* checks (no-dead-module, every-export-has-an-importer) against the audit-graph edges (NOT corbell — the audit's own graph). Emit candidates exactly as the hunter would.
- Shadow brief: per candidate, the graph edges (who-calls / no-importers) + the declaration sites. Model adjudicates true dead module vs intentional leaf.
- Severity: MEDIUM/HIGH by reachability.

### R24 FINDINGS-FEED (graph-activated)
- Activation precondition: derailment runId findings present in shared.db.
- Mechanical: load findings; group by ruleId; compute per-rule counts; detect: rules with findings whose file paths are NOT in the current audit scope → candidate "STALE_TARGET"; high-count rules → root-cause cluster candidate.
- Shadow brief: the rule's findings (top N) + the current-tree presence check. Model synthesizes the root-cause statement from evidence.
- Severity: informational-to-HIGH (feeds the final report's precision section).

### R25 PROVENANCE-LINEAGE (graph-activated)
- Activation precondition: graph present.
- Mechanical: for each finding/rule with a declared provenance source (corpus card's `provenance` field, oracle contentHash), verify a path exists in the graph from source symbol → consumer symbol (BFS ≤ CHAIN_MAX_DEPTH). Missing path → candidate "TRACE_GAP".
- Shadow brief: the source → target pair + the graph neighborhood (edges found/absent). Model adjudicates genuine gap vs intentional decoupling.
- Severity: MEDIUM.

## THE WIRING PLAN (index.ts integration)

```
audit() :184
  ├─ … preflight, classify, evaluate, enrich, scoring, graph, events :193-320
  ├─ BATCH A layers (R18-R21) run on the AST + module inventory — ALWAYS
  │    mechanical candidates → shadow adjudication (batched into ONE brief
  │    per audit run, not 4 separate model calls — one Step-X pass, 4 sections)
  ├─ BATCH A findings merge into the finding stream (triad-wrapped, store-gated)
  ├─ … existing Step-X + shadow report :330-419 (unchanged)
  ├─ BATCH B activation check: graph exists ∧ derailment runId present?
  │    YES → R22-R25 candidates → second shadow pass (findings-feed aware)
  │    NO  → layers SILENT (born-silent — inverse of D17: no candidates, no findings, zero noise)
  └─ return result (findings + score + report; Batch B augments when active)
```

**Batch B's silent-law is structural:** no graph, no candidates, no findings — the layers literally produce nothing (an empty battery like D17's born-dryRun). The audit's count/score are UNCHANGED by absent Batch B. Only when the preconditions land does depth appear.

## THE WAVES (implementation order — one builder per disjoint set)

### W14 — BATCH A LAYERS (R18-R21)
Builder: owns `src/audit-engine/layers/r18*.ts` + `r19*.ts` + `r20*.ts` + `r21*.ts` + their unit fixtures + the index.ts wiring.
Gate: preflight ≥ baseline; new layer fixtures fire/silent per layer; `grep -c "LASME_INCOMPLETE\|DEAD_EXPORT_ARCH\|MAGIC_THRESHOLD\|UNINVOKED_GATE" dist/index.js` ≥ 4; tsc 0.

### W15 — BATCH B LAYERS (R22-R25) + the activation gate
Builder: owns `r22*.ts` + `r23*.ts` + `r24*.ts` + `r25*.ts` + the activation-check module + fixtures.
Gate: silent-without-graph fixture (no graph → zero findings, count unchanged) + active-with-graph fixture (graph+runId → R22-R25 findings appear); preflight holds; tsc 0.

### W16 — RENAME SURFACING + WORKFLOW GLUE
Builder: `bug-hunt` gains first-class alias `logic-audit` in the tool registry (non-breaking, both names call the same handler); the derailment agent's prompt updated to the dual-tool workflow (derailment-hunt FIRST, then code-audit w/ findings-feed).
Gate: `trident-logic-audit` registered + executes same path; agent workflow doc updated; preflight holds.

### W17 — DEEP CONTAINER TEST (the skill's protocol — orchestrator-executed)
Per deep-container-testing skill Part I: plan-first (6 sections), preflight target=ct, fresh container, auth probe, positive/negative suites per layer, adversarial, Phase-E breaker, `.trident/container-test-results.json` artifact, declaration with sha + screenshot evidence.

### W18 — BUILD REPORT + DEBUG LOG + CANON (orchestrator)
DEBUG_LOG append-only milestone + BUILD_REPORT closure + canon SHA/status refresh.

## THE SUCCESS CRITERIA (mechanical)

- S-1: `action=full` on ANY project (no graph) → R18-R21 fire; audit WITHOUT LASME components → CRITICAL findings (the mandate: nothing ships without it).
- S-2: the SAME project WITH a graph + derailment runId → R22-R25 findings appear; the count/score rise (depth auto-activated).
- S-3: no graph + no runId → Batch B produces EXACTLY zero findings (structural silence — grep the artifact for the R22-R25 ruleIds absent).
- S-4: every finding from R18-R25 has a triad (store gate enforced — a bare finding throws).
- S-5: the shadow adjudication path uses ONLY muse-spark-1.2-contributor @ zen/go/v1 (grep the bundle: no other model id in any new layer's transport path); brain-down → loud STEP-X SKIPPED-style header, machinery candidates still emitted as UNCLASSIFIED.
- S-6: preflight never below 906; tsc 0; full-suite env-fails ≤58.
- S-7: container suite GREEN per the deep-testing skill with the results artifact; every layer's positive (fires) + negative (silent on legit) recorded.
- S-8: rename — `trident-logic-audit` works as a first-class alias of the derailment hunt; agent doc shows the dual-tool workflow.

## THE ANTI-PATTERNS (specific to this build)

1. **AP-LASME-1 THE PROMPT-ONLY SHADOW** — a layer that asks the model "is LASME present?" with no mechanical candidate = R-4 violation. Every layer's candidate list must be deterministic output of AST/graph code.
2. **AP-LASME-2 THE REGEX VERDICT** — regex matching for "looks like a machine" as the DECISION. The regex is a detector only; the decision is the candidate structure + model adjudication.
3. **AP-LASME-3 THE ALWAYS-SILENT BATCH B** — the activation gate must be TESTED both ways (silent without graph, active with graph). A layer that never fires = dead enforcement (R21's own target).
4. **AP-LASME-4 THE UNBOUNDED SHADOW CALL** — 8 layers × separate model calls = 8× 45s upstream risk. Batch ALL candidates into ONE brief per batch (A brief, B brief); the model returns 4-section judgments.
5. **AP-LASME-5 THE FABRICATED VERDICT** — model says TRUE_POSITIVE with a file:line not in the evidence window = reject (the silent-verifier's checks reused).
6. **AP-LASME-6 THE SCOPE-LEAK** — a layer touching files outside its own new module (layers are leaf consumers of ast/graph/triad; they never redefine types).
7. **AP-LASME-7 THE NO-TRIAD FINDING** — any layer emission without an EvidenceTriad = the db.ts:469 throw fires; the layer tests must assert the triad round-trips.
8. **AP-LASME-8 THE COUNT-SILENT BATCH B** — Batch B must NOT change the count when silent; test asserts count equality with/without graph.

## THE EVIDENCE REQUIRED AT CLOSE

- Spec on disk (this file, ≥ 1,200 lines by close with the fixtures' exact expect() text)
- `.trident/wave-audit/wave-14.md` … `wave-18.md` per-wave verdicts (orchestrator-run greps + batteries)
- `.trident/container-test-results.json` (deep-testing skill's per-scenario records)
- BUILD_REPORT closure + DEBUG_LOG milestone entries
- The bundle greps: R18-R25 markers present; single-provider transport markers unchanged
- The rename surfacing (trident-logic-audit registered + executed)
