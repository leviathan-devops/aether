# V443 PLAN S — GAP ANALYSIS (THE CODE AUDIT SHADOW BACKEND)

**Version:** 1.0 · **Date:** 2026-08-27 · **Status:** AUTHORITATIVE GAP REGISTER
**Spec under audit:** `MASTER_CONTEXT/V443_PLAN_S_CODE_AUDIT_SHADOW_L2_SPEC.md` (964 lines, spec-s.mpse.v1)
**Target tree:** `src/audit-engine/shadow-backend/` + `src/audit-engine/shadow-backend/report/`
**Audit scope:** Plan S waves S1-S6 + Appendix B (10 MPSE contracts) + §6 S-1..S-10 success criteria
**Auditor posture:** zero-trust — every VERIFIED claim carries file:line or command output; every gap names its missing evidence
**Evidence baseline:** this session's mechanical reads of spec + 10 modules + 5 wave-audits + WAVE_LEDGER + container-test-results.json + battery.test.ts (635L)

---

## TABLE OF CONTENTS

- §1 WHAT THE SPEC WAS — the fundamental problem, the design, S-1..S-10 verbatim, Appendix B's 10 contracts
- §2 WHAT WAS BUILT — per-module verification with file:line anchors, S1-S5 wave outputs, the two battle-test fixes
- §3 THE GAPS — the S-1..S-10 verdict table (each row mechanically backed), the three evidence-fraud classes
- §4 CLEAR NEXT STEPS — the ordered, dispatchable fix list (each step names its criterion + verification command)
- §5 THE COVERAGE MAP + THE HONEST RESIDUAL — every S mapped to evidence or gap; what could not be verified and why
- Appendix C — production-grade vs not (the ship boundary)
- Appendix D — raw evidence excerpts (the file:line anchor index)

---

## §1 WHAT THE SPEC WAS

### §1.1 The fundamental problem (the void-brief theatrical core)

Plan S exists because the v4.4.3 code-audit engine's adjudication core was a `void` statement. The evidence is cited at `src/audit-engine/index.ts:278` (per `V443_REGROUNDING_ARCHITECTURE_AUDIT_REPORT.md D-1`):

```ts
// src/audit-engine/index.ts:277-279 — the theatrical core
// :277 logs 'single adjudication pass'
void brief; // :278 — the Batch-A shadow brief is composed at :267-276 then DISCARDED
// :279 stamps every candidate TRUE_POSITIVE — zero model calls, zero adjudication
```

The operator's R-4 ruling (verbatim): 'SHADOW ENHANCED - NOT 100% PROMPT BASED MODEL ONLY'. The `void brief` violates R-4 at the exact point it was meant to live: mechanical candidates → model adjudication with evidence cites never happened. Every LASME/MPSE finding emitted since was an unadjudicated text match wearing the shadow's name. Container runs S1-S10 and W17 proved the layers *fired*, never that they were *right* (spec §0, §1 F-S1).

Three structural mismatches made the prior 'plan' air (spec §0):

1. **Wrong deliverable surface.** The `shadow_agent_backend` boilerplate is a polish harness — its output is an edited input file. An auditor's output is a *verdict set + a report* — NEW artifacts, not edits. Operator (verbatim, 2026-08-25): 'so how the fuck is it delivering its report? a massive fucking blob of tokens injected into the model context? fucking retarded this OBVIOUSLY needs write/edit tools so it can WRITE TO DISK A PROPER CODE REPORT like we have the findings report from bug hunter THIS NEEDS A PROPER CODE REPORT OUTPUT.'
2. **Wrong execution shape.** A polish loop is content-agnostic (R1 read, R2 fix, R3 verify). An audit loop is phase-driven and evidence-accountable: every verdict must trace to a spec clause + a code quote, and the loop must prove the specs were READ (the mandatory-input law).
3. **Wrong provider posture.** The boilerplate ships a 5-rung fallback chain (zen → nvidia → openrouter → inferx). The operator locked Q1-b: single provider, loud fail, pre-flight probe — 'scan at the start of the tool. fail immediately if there is an issue w/ clear api unreachable error so theres no time wasted.'

### §1.2 The design (what Plan S builds — §2 in one diagram)

```
        audit-spec.json (codebase + specs[] + focuses)
                      │ validated in-turn (Plan A's input pipeline)
                      ▼
   ┌────────────────────────────────────────────────────────────┐
   │ THE CODE AUDIT SHADOW — one agent, five phases, one ledger  │
   │  P0 RECON (read every spec fully — MC-S-02 ledger)          │
   │  P1 EVIDENCE (per-candidate code reads ±40L windows)        │
   │  P2 ADJUDICATE (rubric: TRUE_DEFECT/RED_HERRING/UNCLEAR)    │
   │  P3 REPORT (WRITE verdicts.json + report.md TO DISK)        │
   │  P4 VERIFY (re-check every citation; self-verify stamp)     │
   └────────────────────────────────────────────────────────────┘
                      │
                      ▼
   .trident/audit-ledger/<runId>/{verdicts.json, report.md, manifest.json, evidence/}
   → audit engine parses verdicts.json → findingsFromVerdicts() → triads at emission
```

The eight subsections of §2, each with its load-bearing contract:

| Spec section | What it builds | Load-bearing quantities | Contract |
|---|---|---|---|
| §2.1 Harness | Fork of `agent_plugin_boilerplates/shadow_agent_backend` — strip the 5-rung chain to ONE rung (opencode-go/muse-spark-1.2-contributor), keep the PI-SDK harness (MANDATORY), swap polish tools for audit tools | single-provider chain, stall 60s, retry 15×3s | MC-S-09 |
| §2.2 Tool Surface | Four force-bound tools: read_file (≤320L, target+specs scoped), grep (≤120 results), write_file + edit_file (ledger-scoped via realpathSync+startsWith) + the Read-Turn Ledger | READ_FILE_MAX_LINES=320, GREP_MAX_RESULTS=120, WRITE_SCOPE_VIOLATION | MC-S-02, MC-S-06 |
| §2.3 Phase Controller | XState machine P0..P4 + budget `rounds = 4 + ceil(candidates/8)` + the ×2 validator-repair reserve | budget formula oracle pins c=4→5, c=12→6, c=80→14 | MC-S-03 |
| §2.4 Identity | THE_CODE_AUDITOR_PROMPT (supremacy contract) + THE_ADJUDICATION_RUBRIC (5 laws) + CALIBRATION_SHOTS (3 few-shots) | confidence 0.55..1.0, 0.85 base ±0.05/0.15 | MC-S-07 |
| §2.5 Demand Builder | Five-part brief: Part1 supremacy (frozen), Part2 [SHADOW INFERENCE] (memory chain), Part3 specs ingest (windowed at 2500L), Part4 candidates (±40L triples), Part5 contract+rubic | buildBrief 5× `---` splits | MC-S-02 |
| §2.6 Deliverables | verdicts.json (machine leg, validator V0-V8) + report.md (8 markers, human leg) + manifest.json (telemetry) + evidence/ (per-candidate windows + write-violations.log) | 8/8 markers, counts reconcile | MC-S-04, MC-S-05, MC-S-10 |
| §2.7 Runner | 14-step composition in one place: probe → lifecycle → ingest → demand → phase-loop → validate → verify → memory → manifest → chain-ready | 14 steps, probe at step 0 | MC-S-01..MC-S-10 |
| §2.8 MPSE Wiring | 10 MathContracts over the 30-kind MathExpr grammar (KB-03:239-269) — the spec audits its own implementation via checkContract | 10 contracts, 0 tolerance | S-7 |
| §2.9 Memory | Session chain (audit_runs + top_findings) + telemetry manifest + [SHADOW INFERENCE] hydration | seq monotonic | MC-S-02 |
| §2.10 Worked Run | 12 candidates → 5/6/1, one repair, stamp, 6 rounds (4+ceil(12/8)) — the S5 happy-path fixture shape | 12/6 pin | S-3,S-4,S-6 |

The four deliverable artifacts (spec §2.6, the ledger root `<target>/.trident/audit-ledger/<runId>/`):

- **verdicts.json** — `{ runId, verdicts: [{ findingIndex, layer, adjudication: TRUE_DEFECT|RED_HERRING|UNCLEAR, file, line, specPath?, specLine?, specQuote?, codeQuote?, divergence?, legitimizingReason?, missingEvidence?, confidence: 0.55..1.0, derailmentMode? }] }` — validated by `validateVerdicts` V0-V8 (validator.ts).
- **report.md** — 8 markers: `## 0 RUN METADATA`, `## 1 THE VERDICT TABLE`, `## 2 TRUE DEFECTS`, `## 3 THE KILL LOG`, `## 4 THE ESCALATION QUEUE`, `## 5 THE SYNTHESIS`, `## 6 THE SELF-VERIFY STAMP` (claimsRechecked, discrepanciesFound, fixed, writeViolations), plus the preamble — checked by `checkReportMarkers` (markers.ts).
- **manifest.json** — `RunManifest { runId, ready, stage, error?, provider, counts, rounds, wallClockMs, probeMs, phaseLog, validatorRejects }` — written by `writeManifest` (manifest.ts).
- **evidence/** — per-candidate `cand-NN-context.txt` windows + `write-violations.log` (the scope-law audit trail) + `read-turns.json` (the MC-S-02 ledger).

The 14-step runner composition (spec §2.7, runner.ts:84-360): step 0 probe (AbortSignal.timeout 5000), steps 1-4 lifecycle (tether/sidecar/memory/reattach), step 5 ingest (12 candidates), step 6 demand (612L brief), step 7 phase-loop P0→P4, step 8 validate (V0-V8), step 9 silent-verify (8/8 markers + counts), step 10 memory append, step 11 budget-exhaust UNCLASSIFIED emission, step 12 manifest, step 13 chain-ready.

### §1.3 Success criteria S-1..S-10 (verbatim from spec §6, lines 859-872)

> **S-1** `grep -rn "void brief" src/audit-engine/` → 0 (the D-1 corpse is gone; Plan A's A5 completes this)
> **S-2** The probe: a stripped-key run fails in ≤5s with SHADOW_API_UNREACHABLE + remedy (S6 artifact)
> **S-3** The four ledger artifacts exist + validate on a happy-path run (verdicts.json schema-passes; report.md 8/8 markers; manifest counts reconcile)
> **S-4** MC-S-03's budget pins hold: c=4→5, c=12→6, c=80→14 (unit artifacts)
> **S-5** The write-scope battery: all 5 bypass classes refused, 0 landed writes, the log rows present
> **S-6** The full zero-hint battery (§4.2's 11 scenarios) green — asserted on disk artifacts
> **S-7** The meta-audit: the tool auditing THIS spec's implementation (the 10 contracts) — zero TRUE_DEFECTs on a container-verified build = PASS
> **S-8** The call-log law: 100% muse-spark-1.2-contributor@opencode-go in the ledger's call log (zero fallback rungs)
> **S-9** The preflight gate: ≥951 preflight findings with 0 from R1-R16 (the Plan-A R0 gate — the build's own audit must show the preflight-only shape)
> **S-10** The container suite: all S6 scenarios PASS + .trident/container-test-results.json + the read-turn ledger assertion (forall p ∈ specs: exists t ∈ readTurns: t.path=p ∧ t.phase=P0)

S-9's '≥951' floor is the Plan-A R0-gate oracle: the v4.4.3 root's self-audit is expected to produce 951+ HIGH findings ALL tagged R0-PREFLIGHT with 0 from R1-R16/six-layer — the build's own audit proves the R0 gate (buildEmptyResult hard-codes sourceFilesScanned:0 at index.ts:159) is the ONLY findings source, not a hidden defect class. S-10's suite is the plan's own closing gate: every S6 scenario PASS, the results artifact on disk, and the read-turn coverage predicate proved from the ledger.

### §1.4 Appendix B — the 10 MPSE contracts (the machine-readable anchor table)

Spec §2.8 + Appendix B registers 10 contracts as MathContracts (KB-03:271-277: `{id, preconditions, postconditions, invariants, temporal?}` over the 30-kind MathExpr grammar at KB-03:239-269). Each is `{id, oracle, tolerance, unit, pre?, post?, inv?, temporal?}`. The registry file is JSON `spec-s.mpse.v1` with grammar `KB-MPSE-03:239-269 (30 kinds)` (spec lines 909-959). The 10 contracts:

| # | Contract ID | Oracle | Tol | Unit | What it checks | Where enforced |
|---|---|---|---|---|---|---|
| MC-S-01 | shadow.probe.deadline | 5000 | 0 | ms | `probe.resolvedMs ≤ 5000` | probe.ts + S6 scenario |
| MC-S-02 | shadow.specs.read.mandatory | 0 | 0 | violations | `forall p ∈ specs: exists t ∈ readTurns: t.path=p ∧ t.phase=P0` (per unique path, P0-phase) | tools.ts read-turn ledger + S6 |
| MC-S-03 | shadow.rounds.budget | 0 | 0 | overruns | `roundsUsed ≤ 4 + ceil(candidates/8)` (pins 4→5, 12→6, 80→14) | phase-controller.ts + S5 |
| MC-S-04 | shadow.verdict.integrity | 0 | 0 | violations | `forall v: v.adjudication=TRUE_DEFECT → present(specPath, specLine, specQuote, codeQuote, divergence)` | validator.ts V2 |
| MC-S-05 | shadow.verdict.completeness | 0 | 0 | dropped | `count(verdicts) = candidatesIn` (equality-pinned, not ≥) | validator.ts V1 |
| MC-S-06 | shadow.write.scope | 0 | 0 | landedViolations | `forall w ∈ writes: startsWith(resolve(w.path), ledgerRoot)` + globally(noOutOfScopeWriteLanded) | tools.ts enforceWriteScope |
| MC-S-07 | shadow.confidence.floor | 0 | 0 | violations | `forall v: 0.55 ≤ v.confidence ≤ 1.0` | validator.ts V5 + demand-builder.ts computeConfidence |
| MC-S-08 | shadow.unclassified.emission | 0 | 0 | lost | `unclassifiedEmitted = candidatesIn` when brainAlive=false ∨ budgetExhausted | runner.ts buildUnclassifiedVerdicts |
| MC-S-09 | shadow.single.provider | 0 | 0 | foreignCalls | `forall c ∈ llmCalls: c.model='opencode-go/muse-spark-1.2-contributor'` + globally(singleProviderHeld) | provider.ts assertSingleProviderChain + agent.ts |
| MC-S-10 | shadow.report.structure | 8 | 0 | markers | `markerCount(report.md)=8` | markers.ts + runner step 9 |

Encoding note (spec lines 959-end): `present(x)` / `startsWith(a,b)` / `count(xs)` / `resolve(p)` / `markerCount(f)` are BOUND FUNCTIONS — registered in the substrate's BindingMap as callable bindings (the 30-kind grammar's `var` nodes carrying computed values bound by the meta-audit harness BEFORE evaluation — KB-03:235-236 permits `Binding = ... | BindingMap`). The harness binds these as precomputed scalars; the meta-audit NEVER re-implements them in prose.

The worked-run trace at spec §2.10 (lines 32-94) is the S5 happy-path fixture's oracle shape: 12 candidates (R-ACTOR×3, R-LEXICON×2, R-STATE-MACHINE×2, R-ENGINE×2, R-ADAPTER×1, R-MPSE×2), budget 4+ceil(12/8)=6 rounds, P0 2 spec windows with EOF, P1-P2 3 batches, P3 one batched write, REJECT×1 (verdict#7 missing specQuote), P3' repair, P4 re-read 5 TRUE_DEFECT citations with 1 line-drift (+3) fixed + stamp `{claimsRechecked:5, discrepanciesFound:1, fixed:1, writeViolations:0}`, 5 TRUE_DEFECT · 6 RED_HERRING · 1 UNCLEAR, 8/8 markers, counts reconcile, manifest ready:true rounds 6/6 wallClock 780s phaseLog ordered.

---

## §2 WHAT WAS BUILT

### §2.1 The actual modules on disk (the src/audit-engine/shadow-backend/ tree)

The shadow-backend tree as found this session (all reads fresh, no belief):

```
src/audit-engine/shadow-backend/
  probe.ts              73 lines  PROBE_DEADLINE_MS, SHADOW_API_UNREACHABLE, probeProvider, probeManifestOnFailure
  provider.ts           26 lines  SHADOW_PROVIDER_ID/MODEL_ID/MODEL, PROVIDER_CHAIN[1], assertSingleProviderChain
  agent.ts             265 lines  SHADOW_MODEL, ShadowAgentRunOptions/Result, ShadowAgent (PI-SDK harness)
  phase-controller.ts  142 lines  PhaseId(9), FailedStage(8), PhaseControllerContext, budgetRounds, createPhaseController, PhaseController class
  demand-builder.ts    225 lines  CandidateTriple, ChainRow, AuditDemand, BuildAuditDemandInput, computeConfidence, buildAuditDemand, buildBrief
  identity.ts          122 lines  THE_CODE_AUDITOR_PROMPT, THE_ADJUDICATION_RUBRIC, CalibrationShot, CALIBRATION_SHOTS[3]
  tools.ts             284 lines  READ_FILE_MAX_LINES, GREP_MAX_RESULTS, WRITE_SCOPE_VIOLATION, ReadTurn, ToolsContext, createAuditorTools, ledgerRootResolved, isWithinLedger, resolveForWrite, enforceWriteScope, isAllowedReadPath
  rpm-ledger.ts        143 lines  RPM_PROFILES, EXILE_MS, Admission, RpmLedger, LedgerSnapshot
  runner.ts            360 lines  RunAuditInput, ledgerRootFor, specsRootsFor, countsFromVerdicts, buildUnclassifiedVerdicts, toManifestJson, runAuditPipeline (14 steps)
  report/
    validator.ts       ~140 lines validateVerdicts V0-V8 (runId, cardinality, TRUE_DEFECT legs, RED_HERRING reason, UNCLEAR evidence, confidence, target-scope, spec-membership)
    markers.ts         ~40 lines  checkReportMarkers (8 markers)
    manifest.ts        ~60 lines  RunManifest, writeManifest
    verdicts.ts        ~30 lines  VerdictsFile type
    evidence.ts        ~20 lines  evidence helpers
  index.ts               9 lines  barrel re-exports (provider, probe, tools, phase-controller, rpm-ledger, agent, identity, demand-builder)
  __tests__/
    battery.test.ts    635 lines  11 adversarial scenarios (the S5 battery)
    identity-demand.test.ts  ~400 lines  identity + demand + budget unit tests
    report.test.ts     ~200 lines  report/validator unit tests
```

The __tests__/ dir is NOT empty — the S5 battery file exists on disk at `src/audit-engine/shadow-backend/__tests__/battery.test.ts` (635L, 11 blocks). The s1-audit's note 'committed __tests__/ dir is EMPTY' was stale at S1 time; S5 has since landed the file. See §3 Gap G-S1-SHELF for the staleness accounting.

### §2.2 Per-module verification against the spec's §2 design (does each exist, does it do what §2 says, file:line)

#### probe.ts — §2.7 step 0 + MC-S-01 (shadow.probe.deadline)

- **Exists:** YES — 73 lines, 8 exports, 3 interfaces at `src/audit-engine/shadow-backend/probe.ts`.
- **Spec says:** 'scan at the start of the tool. fail immediately if there is an issue w/ clear api unreachable error so theres no time wasted' — ≤5s probe, loud-fail with `SHADOW_API_UNREACHABLE` code + remedy, zero fallback rungs.
- **Does it do what §2 says:** YES, mechanically verified. `PROBE_DEADLINE_MS = 5000` at `probe.ts:3`. The deadline is enforced at `probe.ts:27-28` via `AbortSignal.timeout(deadlineMs)` (default 5000) + `AbortSignal.any([timeoutSignal, opts.signal])` — the two-signal composition. The 16-token POST to `${baseUrl}/chat/completions` with `model: SHADOW_MODEL_ID` at `probe.ts:35-40` is the real provider round-trip. All three failure paths return `SHADOW_API_UNREACHABLE` with `remedy: 'Check OPENCODE_GO_API_KEY + opencode-go reachability...'` — the non-ok response at `probe.ts:48-55`, the catch/timeout at `probe.ts:58-69`, and the deadline-exceeded ok at `probe.ts:43-47`. The `probeManifestOnFailure` helper at `probe.ts:73` builds the `ready:false, stage:'probe'` manifest for the runner.
- **Anchor chain:** `provider.ts:2` SHADOW_MODEL_ID → `probe.ts:35` body model → `probe.ts:27` AbortSignal.timeout(5000) → `runner.ts:89` step-0 `await probeProvider(...)` → `probe.ts:48` SHADOW_API_UNREACHABLE.
- **Verdict:** CORRECT — the contract is CODE, not prose. The ≤5s deadline is the AbortSignal, not a comment.

#### runner.ts — §2.7 the 14-step one-place composition + all MC-S-* wiring

- **Exists:** YES — 360 lines, 2 exports, 6 functions, 1 interface at `src/audit-engine/shadow-backend/runner.ts`. The runner is the largest module (the composition site) — the spec's §2.7 is literally this file's control flow.
- **Spec says:** 14 steps in ONE place: validate input → probe (step 0) → lifecycle (tether/sidecar/memory/reattach) → ingest → demand → phase-loop P0..P4 → validate → verify → memory → manifest → chain-ready. The probe MUST be step 0 (before any candidate work). The ledger root MUST be `<target>/.trident/audit-ledger/<runId>/` (runner.ts: ledgerRootFor).
- **Does it do what §2 says:** YES for the wired steps; PARTIAL for the happy-path artifact proof (see §3 G-S-3). The 14-step markers are present: `probeProvider` at `runner.ts:89` (step 0), `buildAuditDemand`/`buildBrief` demanded by the agent, `validateVerdicts`/`checkReportMarkers`/`writeManifest`/`buildUnclassifiedVerdicts`/`budgetRounds` all called (the s4 audit counted 28 step-marker hits). The probe wiring is the critical path: `runner.ts:89` `const probeResult = await probeProvider({ transport: input.probeTransport, apiKey: input.apiKey })` — the transport + apiKey injection points that the S5 battery uses to prove loud-fail without a real network. The INVALID_RUN_ID early-return at `runner.ts:68` and the probe-fail manifest at `runner.ts:93-105` (ready:false, stage:'probe', error.code=SHADOW_API_UNREACHABLE) are the error-path-first discipline. The `ProbeResult.catch` wrapper at `runner.ts:88-92` ensures a thrown probe never crashes the pipeline — it becomes a ProbeFailure. The ledger mkdir at `runner.ts:118-133` with LEDGER_MKDIR_FAIL is the second error gate. Phase transitions `probePass→reconDone→evidencingDone→adjudicatingDone→reportingDone` are the P0-P3 spine.
- **Anchors:** `runner.ts:89` probe step 0; `runner.ts:68` INVALID_RUN_ID; `runner.ts:93` probe-fail manifest; `runner.ts:118` ledger mkdir; `runner.ts:139` reconDone; `runner.ts:147` evidencing/adjudicating/reporting spine.
- **Verdict:** CORRECT for the code that exists; the UNPROVEN is the artifact production on a real candidate set (the happy-path ledger run — see §3).

#### agent.ts — §2.1 the harness layer (PI-SDK mandatory) + the BUG-D1 fix

- **Exists:** YES — 265 lines, 1 class `ShadowAgent`, 4 exports, 2 interfaces at `src/audit-engine/shadow-backend/agent.ts`.
- **Spec says:** PI SDK is the harness — MANDATORY, never stripped. Fork `shadow_agent_backend`, keep ONE provider rung, swap polish tools for audit tools. The harness must NOT be reimplemented; the PI-SDK's `Agent` + `createAssistantMessageEventStream` is the execution substrate.
- **Does it do what §2 says:** YES after the BUG-D1 fix (see §2.5). `ShadowAgent` wraps an `Agent` (from `@earendil-works/pi-agent-core`) with `initialState: { systemPrompt, model, tools }` and `thinkingLevel: 'xhigh'` at `agent.ts:100-110`. The model is resolved via `this.models.getModel(SHADOW_PROVIDER_ID, SHADOW_MODEL_ID)` at `agent.ts:75`. Tools are `createAuditorTools(ctx)` at `agent.ts:95` — the audit tool surface, not the polish harness's batch-edit. The `run()` loop at `agent.ts:118-160` drives `maxRounds` prompts with `waitForIdle()` + tool-call counting + the `n===0` early-exit (round ≥2 with zero tool calls → break) — the budget-aware driver. The `chainedStream` at `agent.ts:30-70` is the retry wrapper: 15 attempts, 3s backoff, 429 exile via `RpmLedger.record429`, stall detection at 60s — all constants from `provider.ts:7-10`. The ledger-files walk at `agent.ts:170-190` + the report.md/verdicts.json read at `agent.ts:195-210` is the manifest-side fileStates.
- **BUG-D1 fix (CRITICAL, this session):** The prior agent.ts used bare `require('@earendil-works/pi-ai')` at the old `agent.ts:76,78` — a CJS require of a bare package name that bun's resolver does NOT resolve (bun resolves ESM imports). Every build after the shadow wiring FAILED, so the deployed dist contained ZERO shadow symbols (`runAuditPipeline` 0, `probeProvider` 0 in the old dist at sha bb722bc936b3d0c2). The fix replaced the requires with a top-level ESM import at `agent.ts:7` (`import { createAssistantMessageEventStream } from '@earendil-works/pi-ai'`) and removed the type-only `AssistantMessageEventStream` value use. Post-fix build: sha aa1cdc6b90a7dcb7, 1439 modules, 5× SHADOW_API_UNREACHABLE + 5× runAuditPipeline in the bundle (verified by `grep -c` on dist).
- **Anchors:** `agent.ts:7` ESM import fix; `agent.ts:30` chainedStream retry; `agent.ts:75` getModel single-provider; `agent.ts:95` createAuditorTools; `agent.ts:118` run loop.
- **Verdict:** CORRECT post-fix. The PI-SDK harness is intact, the single-provider chain is the only path, the retry/stall/exile behavior is constants-driven.

#### provider.ts — §2.1 the single-provider law (Q1-b) + MC-S-09

- **Exists:** YES — 26 lines, 12 exports, 1 interface, 1 function at `src/audit-engine/shadow-backend/provider.ts`. The smallest module — deliberately small because the law is 'one rung, no code around it'.
- **Spec says:** Single provider `muse-spark-1.2-contributor@opencode-go` ONLY, loud fail-fast, zero fallback rungs (Q1-b). The chain must be a single entry; any other model id in a call log is a DIE.
- **Does it do what §2 says:** YES, mechanically. `SHADOW_PROVIDER_ID='opencode-go'` at `provider.ts:1`, `SHADOW_MODEL_ID='muse-spark-1.2-contributor'` at `provider.ts:2`, `SHADOW_MODEL` computed at `provider.ts:3`. `PROVIDER_CHAIN: readonly ProviderChainEntry[] = [{ provider: SHADOW_PROVIDER_ID, modelId: SHADOW_MODEL_ID }]` at `provider.ts:16-17` — exactly ONE rung. `assertSingleProviderChain` at `provider.ts:19-25` enforces `chain.length===1` + rung equality — the invariant the tests call. Constants `SHADOW_RETRY_ATTEMPTS=15` at `provider.ts:7`, `SHADOW_RETRY_BACKOFF_MS=3000` at `provider.ts:8`, `SHADOW_STALL_MS=60_000` at `provider.ts:9` — the retry law the agent's chainedStream consumes. No ZEN_KEYS_POOL, no NVIDIA_API_KEY, no nvidiaProvider/openrouterProvider/inferx strings exist in the shadow-backend tree (the s1 audit's 0-hit verification).
- **Anchors:** `provider.ts:1-3` the identity; `provider.ts:16-17` the single rung; `provider.ts:19` the assert; `provider.ts:7-9` the retry constants.
- **Verdict:** CORRECT — the law is one constant array + one assert function, and both are on disk.

#### phase-controller.ts — §2.3 the Phase Controller P0..P4 + MC-S-03

- **Exists:** YES — 142 lines, 7 exports, 1 class, 3 functions, 1 interface at `src/audit-engine/shadow-backend/phase-controller.ts`.
- **Spec says:** XState machine `IDLE→PROBING→RECON→EVIDENCING→ADJUDICATING→REPORTING→VERIFYING→DONE/FAILED` with `budgetRounds(c)=4+ceil(c/8)` (MC-S-03) and the ×2 validator-repair reserve. The budget MUST scale with workload; a fixed number is wrong for both 4 and 80 candidates.
- **Does it do what §2 says:** YES. `budgetRounds(c)` at `phase-controller.ts:26` — `if (c<=0) return 3; return 4+Math.ceil(c/8)` — the exact formula. Pins: c=4→5, c=12→6 (the worked run), c=80→14, c=0→3. The XState machine at `phase-controller.ts:35-80` defines all 9 PhaseIds and 8 FailedStages with the transition table (PROBE_FAIL→FAILED, BUDGET_EXHAUSTED→FAILED, VALIDATOR_REJECT→FAILED, ERROR→FAILED per state). The imperative `PhaseController` class at `phase-controller.ts:83-142` mirrors the machine with `probePass()`, `reconDone()`, `evidencingDone()`, `adjudicatingDone()`, `reportingDone()`, `verifyingDone()`, `done()`, `fail()`, `budgetExhausted()`, `validatorReject()` + guards (`invalid transition ${state}→X` throws). `isExhausted()` checks `roundsUsed >= budget` and `canProceed()` is `state !== FAILED|DONE && !isExhausted()` — the runner's loop gate. The phaseLog is the MC-S-03 evidence (ordered, timestamped).
- **Anchors:** `phase-controller.ts:26` budgetRounds; `phase-controller.ts:35` createMachine; `phase-controller.ts:83` PhaseController class; `phase-controller.ts:108` transitionTo with phaseLog push.
- **Verdict:** CORRECT — the state machine + the budget formula + the imperative mirror are all on disk and under unit test (S5 battery pins).

#### demand-builder.ts — §2.5 the five-part brief + MC-S-07

- **Exists:** YES — 225 lines, 6 exports, 5 functions, 4 interfaces at `src/audit-engine/shadow-backend/demand-builder.ts`.
- **Spec says:** Five parts, verbatim split on `\n\n---\n\n`: Part1 supremacy (frozen, verbatim THE_CODE_AUDITOR_PROMPT), Part2 [SHADOW INFERENCE] (memory chain, last 5 runs), Part3 specs ingest (windowed at 2500L), Part4 candidates (±40L triples, the hint-not-truth clause), Part5 contract+rubic+shots. The confidence floor 0.55 with 0.85 base ± modifiers is Law 5.
- **Does it do what §2 says:** YES. `BuildAuditDemandInput` validation at `demand-builder.ts:45-75` — runId non-empty, targetRoot non-empty, specs non-empty (MC-S-02's '≥1 spec required'), candidates array, focuses array. `budgetRounds(candidates.length)` at `demand-builder.ts:73` wires MC-S-03. `computeConfidence` at `demand-builder.ts:38` — `c=0.85; if derailmentMode c+=0.05; if anyLegParaphrased c-=0.15; if c<0.55 → UNCLEAR; if !allLegsQuoted → UNCLEAR` — the Law 5 arithmetic. `buildPart1Supremacy` at `demand-builder.ts:80` returns `# PART 1 — THE SUPREMACY CONTRACT (frozen, §2.4.1 — verbatim)` + `THE_CODE_AUDITOR_PROMPT`. `buildPart2Inference` at `demand-builder.ts:84` hydrates last 5 chain rows with top-3 findings per run. `buildPart3Specs` at `demand-builder.ts:108` windows at 2500L with the '(windowed at 2500L/pass — N lines total; the agent ALSO re-reads via read_file for depth)' marker. `buildPart4Candidates` at `demand-builder.ts:140` emits `CANDIDATE {index} | {layer} | {side} | {file}:{line}` with the '(the implicating clause is a HINT, not truth — rubric Law 1(a) requires the agent to verify the clause by reading it)' line. `buildPart5FocusesAndContract` at `demand-builder.ts:165` emits the report contract + `THE_ADJUDICATION_RUBRIC` + `CALIBRATION_SHOTS`. `buildBrief` at `demand-builder.ts:195` composes 5 parts joined by `\n\n---\n\n`; `briefParts` at `demand-builder.ts:210` splits on it — the S6 marker-count assertion uses this.
- **Anchors:** `demand-builder.ts:38` computeConfidence; `demand-builder.ts:45` buildAuditDemand validation; `demand-builder.ts:80` Part1; `demand-builder.ts:108` Part3 2500L; `demand-builder.ts:195` buildBrief.
- **Verdict:** CORRECT — the five-part shape, the confidence floor, the hint-not-truth clause are all code, not prose.

#### identity.ts — §2.4 the auditor identity (THE CODE AUDITOR + rubric + shots)

- **Exists:** YES — 122 lines, 4 exports, 1 interface at `src/audit-engine/shadow-backend/identity.ts`.
- **Spec says:** THE_CODE_AUDITOR_PROMPT (the supremacy contract: code+specs are ground truth, everything else is belief), THE_ADJUDICATION_RUBRIC (5 laws: TRUE_DEFECT three legs, RED_HERRING legitimizing reason, UNCLEAR missing evidence, NEVER bans, CONFIDENCE floor), CALIBRATION_SHOTS (3 few-shots: TRUE_DEFECT with divergence, RED_HERRING with ISE exemption, UNCLEAR with grep instruction).
- **Does it do what §2 says:** YES, verbatim. `THE_CODE_AUDITOR_PROMPT` at `identity.ts:1` — 14 lines, the supremacy contract (code over context, exact-value discipline, context-mismatch flagging, prior runs are history) + the rubric/report/phase/write-law pointers. `THE_ADJUDICATION_RUBRIC` at `identity.ts:18` — Law 1 (three legs + verbatim quotes + divergence sentence), Law 2 (RED_HERRING 'BECAUSE <structural reason>' + 4 worked exemptions), Law 3 (UNCLEAR with missingEvidence + grep instruction), Law 4 (5 hard bans), Law 5 (0.55..1.0, 0.85 base). `CALIBRATION_SHOTS` at `identity.ts:60` — 3 shots (brains/index.ts:64 TRUE_DEFECT 0.90, utils/helpers.ts:12 RED_HERRING 0.80, brains/adapter.ts:31 UNCLEAR) with the evidence windows, spec clauses, and verbatim verdict fields.
- **Anchors:** `identity.ts:1` THE_CODE_AUDITOR_PROMPT; `identity.ts:18` THE_ADJUDICATION_RUBRIC; `identity.ts:60` CALIBRATION_SHOTS.
- **Verdict:** CORRECT — the identity is frozen prose that the demand-builder embeds verbatim in Part1/Part5.

#### tools.ts — §2.2 the tool surface + MC-S-02 + MC-S-06

- **Exists:** YES — 284 lines, 6 exports, 6 functions, 2 interfaces at `src/audit-engine/shadow-backend/tools.ts`. The largest surface module — 5 tools, 2 laws.
- **Spec says:** Four force-bound tools + the Read-Turn Ledger (MC-S-02) + the Write-Scope Law (MC-S-06). read_file ≤320L scoped to target+specs, grep ≤120 results scoped to target/specs, write_file/edit_file scoped to ledgerRoot via realpathSync+startsWith (mechanical, not prompt-level). Every spec MUST be fully read by end of P0 — proved by the readTurns ledger (the `forall p ∈ specs: exists t ∈ readTurns: t.path=p ∧ t.phase=P0` predicate).
- **Does it do what §2 says:** YES, both laws are mechanical. **Write-Scope (MC-S-06):** `isWithinLedger` at `tools.ts:18` (`resolved===root || startsWith(root+sep)`), `resolveForWrite` at `tools.ts:23` (realpathSync on the file, fallback to realpathSync on the dir + basename, then realpathSync on the ledgerRoot — the symlink-following closure), `enforceWriteScope` at `tools.ts:42` (resolve absolute input, check, on violation append `{code:WRITE_SCOPE_VIOLATION, attempted, ledgerRoot}` to `evidence/write-violations.log` + return `{allowed:false, errorText:'attempted ... — writes are scoped to ...'}`). Both `write_file` at `tools.ts:120` and `edit_file` at `tools.ts:145` call `enforceWriteScope` BEFORE any fs write — violation returns `{error:WRITE_SCOPE_VIOLATION}` + `recorded:true`, the write NEVER lands. **Read-Turn Ledger (MC-S-02):** `read_file`'s execute at `tools.ts:50-110` pushes `{path:finalPath, phase:ctx.phaseRef.current, offset, linesRead, atMs, eof}` to `ctx.readTurns` on every successful read — the ledger the S6 container asserts. The path scoping at `tools.ts:60-80` checks `isAllowedReadPath` against `targetRoot` + `specsRoots` (with spec-file vs spec-dir branching). The `READ_FILE_MAX_LINES=320` guard at `tools.ts:55` caps the window; the `GREP_MAX_RESULTS=120` at `tools.ts:90` caps grep. The 5 tool registrations at `tools.ts:200` (`read_file, grep, stat, write_file, edit_file`).
- **Anchors:** `tools.ts:18` isWithinLedger; `tools.ts:23` resolveForWrite; `tools.ts:42` enforceWriteScope; `tools.ts:50` read_file ledger push; `tools.ts:120` write_file scope check; `tools.ts:145` edit_file scope check.
- **Verdict:** CORRECT — both laws are mechanical code, not prompt promises. The symlink, case-trick, and dotdot bypasses are closed by the realpathSync+startsWith composition (the s1 audit's 5-bypass verification).

#### rpm-ledger.ts — §2.1 the RPM/exile telemetry (the operator's rate-limit substrate)

- **Exists:** YES — 143 lines, 8 exports, 5 interfaces, 1 class at `src/audit-engine/shadow-backend/rpm-ledger.ts`. Not a spec-named module but the operator's rate-limit substrate that the agent's chainedStream consumes.
- **What it does:** `RPM_PROFILES` at `rpm-ledger.ts:5` (nvidia 40, opencode 200, openrouter 20, inferx 20), `EXILE_MS=45_000` at `rpm-ledger.ts:9`, `RpmLedger` class at `rpm-ledger.ts:20` with `admission()` (exiled→dry→ok), `acquire()` (poll with signal, 250ms slices), `record429()` (exile), `recordSuccess()`, `snapshot()` (per-provider tokensLeft, successCount120s, count429_120s, exiledForMs). The ring buffers (RING_CAP 200, RING_WINDOW_MS 120_000) are the telemetry the manifest could surface.
- **Does it do what §2 says:** The spec does NOT name this module in §2 — it is the harness's rate-limit substrate inherited from the fork. Its presence is correct (the chainedStream at agent.ts:30-70 calls `ledger.record429` on 429), but its `RPM_PROFILES` still lists the 4 legacy providers (nvidia/opencode/openrouter/inferx) that Plan S stripped from the chain — the ledger knows about providers the chain no longer uses. This is dead-weight, not a defect: the single-provider chain means only the `opencode-go` path is exercised, but the ledger's multi-provider table does not create a fallback rung (the chain is the law, the ledger is telemetry).
- **Anchors:** `rpm-ledger.ts:5` RPM_PROFILES; `rpm-ledger.ts:9` EXILE_MS; `rpm-ledger.ts:20` RpmLedger.
- **Verdict:** CORRECT with dead-weight (the 4 legacy profiles are harmless telemetry, not a fallback). Flagged for cleanup, not a blocker.

#### index.ts — the barrel (re-export surface)

- **Exists:** YES — 9 lines, 0 direct exports (barrel), at `src/audit-engine/shadow-backend/index.ts`.
- **What it does:** `export * from './provider.js'` through `export * from './demand-builder.js'` — 8 barrels. The runner is NOT barrelled (intentional: the runner is the composition site, not a library export — it is imported directly).
- **Verdict:** CORRECT — the barrel is minimal and intentional.

#### report/ — §2.6 the deliverable validators

- **Exists:** YES — 5 files at `src/audit-engine/shadow-backend/report/`: validator.ts (~140L), markers.ts (~40L), manifest.ts (~60L), verdicts.ts (~30L), evidence.ts (~20L).
- **validator.ts:** `validateVerdicts(file, opts)` with V0 (runId non-empty), V1 (findingIndex ∈ [0,candidatesCount)), V2 (TRUE_DEFECT → specPath+specLine+specQuote+codeQuote+divergence present), V3 (RED_HERRING → legitimizingReason), V4 (UNCLEAR → missingEvidence), V5 (confidence ∈ [0.55,1.0]), V6 (file ∈ targetRoot), V7 (specPath ∈ specs), V8 (adjudication ∈ {TRUE_DEFECT,RED_HERRING,UNCLEAR}) — the V0-V8 enforcement of MC-S-04/MC-S-05/MC-S-07. The validator returns `{ok, rejections}` — the runner's repair-loop signal.
- **markers.ts:** `checkReportMarkers(reportText)` — 8 markers, the MC-S-10 enforcement.
- **manifest.ts:** `RunManifest` interface (runId, ready, stage, error?, provider, counts, rounds, wallClockMs, probeMs, phaseLog, validatorRejects) + `writeManifest(ledgerRoot, manifest)` — the telemetry artifact.
- **Verdict:** CORRECT — the validators are the spec's enforcement layer, not just types.

### §2.3 The wave outputs S1-S5 (what the build waves claimed)

| Wave | Agent | What it was meant to build | What the audit says | Evidence quality |
|---|---|---|---|---|
| S1 | s1-agent-core | agent.ts + provider.ts + probe.ts + phase-controller.ts + tools.ts + rpm-ledger.ts | CORRECT — 7 files/928L, single-rung chain, write-scope, budget, probe, battery 36/36+5/5 | **SUBSTANTIVE** — s1-agent-core.md 1456 bytes, 7 checks with file:line |
| S2 | s2-identity-demand | identity.ts + demand-builder.ts | CORRECT (claimed) | **STUB** — s2-audit.md 188 bytes, 0 evidence refs, identical template |
| S3 | s3-report | report/ (validator+markers+manifest+verdicts+evidence) | CORRECT (claimed) | **STUB** — s3-audit.md 188 bytes, 0 evidence refs, identical template |
| S4 | s4-runner | runner.ts (14 steps) | CORRECT — 359L, 28 markers, battery 82/0/167, mocked harness 6 adv | **SUBSTANTIVE** — s4-runner.md 1331 bytes, 5 checks with battery output |
| S5 | s5-battery | __tests__/battery.test.ts (11 scenarios) | CORRECT — 634L, 11/11 + 93/0/263 full | **SUBSTANTIVE** — s5-battery.md 842 bytes, 4 checks with battery output |

The full shadow-backend suite as measured this session: 186 pass / 0 fail / 526 expects across 6 files (the battery + identity-demand + report + unit suites). The S5 audit's '93 pass / 263 expects (77 identity + 5 report + 11 battery)' was the agent's in-wave count before the committed battery grew — the numbers are stale but the direction is the same (green). The committed battery file is 635L with 11 test blocks (not 22 — the '22' in the Known Context is the total block count across the 6 files, not the battery file alone).

### §2.4 The two battle-test fixes (what the container proved was broken)

#### BUG-D1 — CRITICAL — the stale-dist build break (FIXED this session)

- **What happened:** `agent.ts:76,78` used bare `require('@earendil-works/pi-ai')` — a CJS require of a bare package name. Bun's resolver handles ESM `import ... from '@earendil-works/pi-ai'` but NOT the bare `require()` form. Every `bun build src/index.ts --outdir dist` after the shadow wiring FAILED at the require, so the last successful dist (sha bb722bc936b3d0c2) pre-dated the shadow — the deployed dist contained ZERO `runAuditPipeline` (0 hits) and ZERO `probeProvider` (0 hits). The container `v443-battle-test` (image `runtime-grade-container-sandbox:master`, Up) ran the OLD StepX machinery, not the shadow. The '15 retries' message in the positive-probe-fail scenario's toolResult was the OLD machinery's log, not the shadow's probe — the battle-test caught the stale-dist defect because the container's `distSha` field is the ground truth.
- **Fix:** Replaced the two bare requires with a top-level ESM import at `agent.ts:7`: `import { createAssistantMessageEventStream } from '@earendil-works/pi-ai'` (the harness's canonical import). Removed the type-only `AssistantMessageEventStream` value reference that the requires had provided. Rebuilt: sha aa1cdc6b90a7dcb7, 17.6MB, 1439 modules, `grep -c SHADOW_API_UNREACHABLE dist/*.js = 5` + `grep -c runAuditPipeline = 5` — the shadow symbols now ship.
- **Verified:** `bun build` exit 0, sha aa1cdc6b90a7dcb7 byte-reproducible, container redeploy with shaMatch true, tool registry shows all rebuilt tools.
- **Anchors:** `agent.ts:7` the ESM import; the old `agent.ts:76,78` bare requires (now absent); `provider.ts:2` the model id the import carries.

#### BUG-D2 — HIGH — the stack overflow on pathological targets (FIXED this session)

- **What happened:** The audit of the 17.6MB `dist` bundle crashed with `Maximum call stack size exceeded` at 3.7s/5.8s/14.7s (three attempts before the fix). Root cause was TWO failures compounding: (1) no size guard — `ts.createProgram`'s checker on a 17.6MB single file overflows the stack regardless of `AST_MAX_DEPTH=400` (the depth guard checks AST nodes, not checker memory); (2) the `audit()` scope-probe catch treated the probe failure as NON-FATAL and continued into `engine.evaluateAll` with a broken context — the crash was the broken-context evaluation, not the probe.
- **Fix:** (1) `AST_FILE_TOO_LARGE` size guard (10MB/file cap) in `buildScopedProgram`'s direct + chunked paths; (2) the `audit()` scope-probe catch now FATAL — any non-EMPTY/non-SCOPE probe failure returns the named result `{ready:false, findings:[{scope-probe-fatal}]} ` instead of continuing.
- **Verified:** sha 1599b0be11d3e2f8 container-proven — the dist audit completed in 22.3s with the named result + the TRIDENT_CODE_AUDIT_DIST.md artifact, no crash. The current tree's audit still produces the 'WARNING: ZERO source files found' preflight shape (the R0-gate defect, separate from the crash class).
- **Severity note:** BUG-D2 is NOT a shadow-backend bug — it was in the Plan-A audit engine that the shadow will eventually replace. It is documented here because the container battle-test that proved BUG-D1 also proved BUG-D2, and the two fixes shipped in the same dist.

---

## §3 THE GAPS — THE S-1..S-10 VERDICT TABLE

### §3.1 The verdict table (each row mechanically backed — the doc's spine)

No VERIFIED without evidence. Every row carries its evidence line (a command output or a file:line) or the explicit UNVERIFIED/NOT-RUN verdict with the reason. The table is ordered S-1..S-10 as the spec numbers them.

| # | Criterion (spec §6) | Verdict | Evidence (the command or the file:line) | Gap class |
|---|---|---|---|---|
| S-1 | `grep -rn "void brief" src/audit-engine/` → 0 (D-1 corpse gone) | **VERIFIED** | `grep -rn "void brief" src/audit-engine/ → 0 hits` (re-run this session; the old `index.ts:278 void brief` line no longer exists in the tree) | — |
| S-2 | Probe: stripped-key fails ≤5s with SHADOW_API_UNREACHABLE + remedy | **PARTIAL** | Code exists: `probe.ts:27-28` `AbortSignal.timeout(5000)` + `runner.ts:89` step-0 wiring. Container showed 'did not hang' (PASS for the timeout contract) but the exact `SHADOW_API_UNREACHABLE` code was NOT observed in a tool-result context — the dead-provider env-var injection (`OPENCODE_GO_API_KEY=''`) does not reach the tool-call runtime (the container agent discovered this). The code path that emits it (`probe.ts:48`/`58`) was never exercised through a tool call. | Probe-code-verified, runtime-unproven |
| S-3 | Four ledger artifacts exist+validate on happy-path (verdicts.json + report.md 8/8 + manifest reconcile) | **NOT PROVEN** | No happy-path run has produced the four artifacts on a real candidate set. The container audit of the tiny fixture produced zero candidates → the mandate block was skipped (blank-run path, not the 12-candidate path). The audit of the real target hit the Plan-A R0-gate defect (21,434 HIGH all R0-PREFLIGHT, 0 from R1-R16) — the ledger artifacts were not produced via the shadow path. The S5 battery's mocked-harness happy-path IS green (11/11) but that is the in-process mock, not a ledger-artifact run. | No artifact on disk |
| S-4 | MC-S-03 budget pins: c=4→5, c=12→6, c=80→14 (tol=0) | **UNVERIFIED (numbers stale)** | Budget code at `phase-controller.ts:26` `4+ceil(c/8)` is on disk and the S5 battery's battery.test.ts asserts the pins. BUT the audit file grew: the s5-audit says '11 test blocks' while the full suite now has 22 blocks across 6 files — the audit's pin counts (c=4→5, c=12→6, c=80→14 claimed in s5-audit) are from the old 11-block battery. Re-run of the battery with the current 635L file shows 11 pass (battery) + 186 total, but the stale audit numbers have not been refreshed against the new file. The formula is verified; the pin assertion's freshness is not. | Audit staleness |
| S-5 | Write-scope battery: 5 bypass classes refused, 0 landed writes, log rows present | **COVERED (in-process) / UNVERIFIED (S6 artifact)** | The battery's WRITE-SCOPE scenario exists in the 11 test blocks (the `write_file` outside ledger → WRITE_SCOPE_VIOLATION + log row). In-process: PASS (the S5 11/11 includes it). But the S6 gate requires the *container* assertion (the ledger's write-violations.log on disk after a live run) — that artifact has not been produced. The old count '5 bypass classes' vs the new file's scenario shape may have shifted. | In-process PASS, container artifact missing |
| S-6 | Full zero-hint battery (§4.2's 11 scenarios) green — asserted on disk artifacts | **VERIFIED (in-process)** | `bun test src/audit-engine/shadow-backend/ → 186 pass / 0 fail / 526 expects` (re-run this session — the command the spec names). The battery file `__tests__/battery.test.ts` 635L with 11 adversarial scenarios, each asserting on disk artifacts + memory table, each with MUTATION-CHECK comment. The S5 audit's '93 pass / 263 expects' was the in-wave count; the committed suite is 186/0/526 (the 6-file total). The S6 container suite (the next row's requirement) is separate. | — (but see S-10) |
| S-7 | Meta-audit: tool auditing its own shadow-backend against Appendix B (10 contracts) | **NEVER RUN** | No meta-audit artifact exists on disk. Zero files matching `*meta-audit*`, `*contract-check*`, `*shadow*checkContract*` in the tree. The spec's §2.8.3 invocation ('After the builds land, the code-audit tool runs ON ITS OWN SOURCE with THIS SPEC in its specs[] array') has never been executed. The `checkContract` substrate (Plan A's A3) exists, but no run has bound the 10 contracts against the shadow-backend source. No verdict. | Never executed |
| S-8 | Call-log law: 100% muse-spark-1.2-contributor@opencode-go, zero fallback rungs | **NOT VERIFIED** | The single-rung chain at `provider.ts:16-17` + `assertSingleProviderChain` at `provider.ts:19` is the CODE law, but the RUNTIME law (the ledger's call log showing 100% that model) requires a ledger artifact from a live run. No ledger artifact with a call log exists on disk. The container's tool-registry check (scenario 'tool-registry' PASS) proves the tool IS registered, not that every call IS that model. The grep `grep -rn 'zen.*pool\|nvidia.*provider\|openrouter.*provider' src/audit-engine/shadow-backend/ → 0` proves no fallback CODE, but not that no fallback RUNTIME path exists. | Code-verified, runtime-unproven |
| S-9 | Preflight gate: ≥951 findings all R0-PREFLIGHT, 0 from R1-R16 | **PARTIALLY VERIFIED / UNVERIFIED** | `tsc --noEmit → 0 errors` repo-wide (this session). `bun test src/audit-engine/shadow-backend/ → 186/0/526` (battery green). The self-audit of the v4.4.3 root DID produce 21,434 HIGH all R0-PREFLIGHT with 0 from R1-R16 (the container's 'self-audit' scenario: TRIDENT CODE REVIEW artifact, 14MB) — that IS the ≥951 shape (the count is 21k, not 951 — the '951' is the floor). BUT the self-audit's score was '0/100' with 'WARNING: ZERO source files found' — the preflight's src-count quirk (buildEmptyResult hard-codes sourceFilesScanned:0 at index.ts:159, the Plan-A R0-gate defect). The findings prove the engine analyzed the files; the score is not the deliverable. The '≥951 UNVERIFIED' in the Known Context refers to the preflight count before the full self-audit — now superseded by the 21k container run. | Findings-verified, score anom flagged |
| S-10 | Container suite: all S6 scenarios PASS + .trident/container-test-results.json + read-turn ledger assertion | **CONTAMINATED** | The file at `.trident/container-test-results.json` (105 lines, 6 scenarios, overallVerdict PASS) IS the plan's S6 artifact shape — but it is SELF-AUTHORED by the orchestrator, not the plan's S6 scenario suite per §4.2. `circuitBreaker.noTimeouts=false` (the honest residual: 'several scenario sends timed out at maxWaitMs while the agent worked'). The 6 scenarios are the BUG-D1/D2 battle-test (auth-probe, positive-probe-fail, negative-legit-audit, tool-registry, sro-read-only, self-audit) — NOT the plan's own S6 gate 'all scenarios PASS + .trident/container-test-results.json + the read-turn ledger assertion (forall p ∈ specs: exists t ∈ readTurns: t.path=p ∧ t.phase=P0)'. The read-turn ledger assertion has never been asserted from a ledger artifact. The file's SHA at container time was 1599b0be11d3e2f89b2d5b0af3f5a2b653096e64a0376b3543810a3316eab4b4 but the committed file may have drifted. | Self-authored, not the plan's gate |

### §3.2 The three evidence-fraud classes (the gaps behind the gaps)

#### G-F1 — The wave-audit evidence gap (the self-satisfied audit class)

- **What:** `s2-audit.md` (188 bytes, 2 lines) and `s3-audit.md` (188 bytes, 2 lines) are stubs claiming 'VERDICT: CORRECT — verified by reading the actual decision logic + running the committed suites MYSELF' with ZERO evidence refs (0 file:line anchors, 0 command outputs, 0 battery excerpts). They are the identical template — the same sentence, the same structure, the same absence.
- **Why it matters:** S2 built `identity.ts` + `demand-builder.ts` (347 lines, the auditor's brain) and S3 built `report/` (5 files, the validator/marker/manifest layer) — the two most load-bearing correctness layers. Their audits carry the same weight as the substantive audits (S1 1456 bytes with 7 checks, S4 1331 bytes with 5 checks, S5 842 bytes with 4 checks) but with 0 of the evidence. A gap in the validator or the adjudication rubric would be invisible behind these stubs.
- **Required fix:** Rewrite both audits with the S1 template: per-module WHAT/WHY/HOW + the VERDICT, the file:line anchors, the battery outputs (the `identity-demand.test.ts` run for S2, the `report.test.ts` run for S3), the coverage map. See §4 steps 5-6.
- **Anchors:** `.trident/wave-audit/s2-audit.md:1` (188 bytes), `.trident/wave-audit/s3-audit.md:1` (188 bytes), `.trident/wave-audit/s1-agent-core.md:1` (1456 bytes, the correct template).

#### G-F2 — The WAVE_LEDGER fraud (the staleness class)

- **What:** `WAVE_LEDGER.md` is 9 lines, 566 bytes, with 4 rows: S1 in-flight, A1 RETURNED CORRECT, A3 RETURNED CORRECT, B1 in-flight. S1 is marked 'in-flight (stream, 50+ parts)' but S1's audit file says CORRECT — the ledger was never updated after S1 returned. S2, S3, S4, S5 are ABSENT from the ledger entirely — the four waves that produced the shadow-backend have no ledger entry. The ledger is a stale snapshot from before S2 started, mixed with the A/B plan rows (the three-plan overhaul's ledger carries all three plans interleaved).
- **Why it matters:** The ledger is the orchestrator's handoff to the next wave — it tells the wave-manager what is done, what is in-flight, what to dispatch next. A stale ledger derails the S6 dispatch (the wave-manager would re-dispatch S1 as in-flight, or miss that S4/S5 shipped). The spec's §3 implementation order says S1→S2→S3→S4→S5→S6; the ledger says S1 is still running.
- **Required fix:** Refresh the ledger: S1 RETURNED CORRECT (ses_fc3f8d7b1ffejEGaBawer11RKl), S2 RETURNED CORRECT (rewrite pending — mark as NEEDS-REWRITE), S3 RETURNED CORRECT (same), S4 RETURNED CORRECT (ses from s4 audit), S5 RETURNED CORRECT. See §4 step 7.
- **Anchors:** `.trident/wave-audit/WAVE_LEDGER.md:3` S1 in-flight, `:4` A1, `:5` A3, `:6` B1 — no S2/S3/S4/S5 rows.

#### G-F3 — The contaminated container-results artifact (the self-authored suite)

- **What:** `.trident/container-test-results.json` (105 lines, 6908 bytes) is self-authored by the orchestrator (the battle-test harness), not the plan's S6 scenario suite. It carries 6 scenarios (auth-probe, positive-probe-fail, negative-legit-audit, tool-registry, sro-read-only, self-audit) with overallVerdict PASS, but `circuitBreaker.noTimeouts=false` — several sends timed out at maxWaitMs while the agent reasoned (the send+completion vs long-reasoning race). The honest residuals name the timeouts, the 0/100 score quirk, and the write-scope coverage via in-process battery rather than container log. None of this invalidates the PASS, but NONE of it is the plan's S6 gate: the plan's gate is §4.2's 11-scenario suite (LIAR, DEAD-BRAIN, REATTACH, BLANK, VERBATIM, PLANTED, WRITE-SCOPE, COHERENCE, VALIDATOR-REJECT, CARDINALITY, plus the read-turn assertion) run LIVE in a container with the results artifact + the read-turn ledger predicate.
- **Why it matters:** The container-results file is the ONLY artifact the delivery gate checks for S-10. A self-authored file that looks like the gate artifact but tests different scenarios is the exact 'theatrical code dressed as success' class (Warhead 10) — it passes its own scenarios while the plan's scenarios remain unrun. The noTimeouts=false flag means the completion signal is unreliable; the outcomes were confirmed via screenshot/db, not the tool's completion contract.
- **Required fix:** The S6 container wave must run the plan's §4.2 suite live (see §4 step 1) and write a NEW container-test-results.json with the plan's scenarios + the read-turn ledger assertion. The current file should be archived as `battle-test-results.json`, not overwritten silently.
- **Anchors:** `.trident/container-test-results.json:1` suite v443-battle-test-container-suite, `:15` circuitBreaker.noTimeouts=false, the 6 scenario ids vs the plan's 11.

### §3.3 The residual S1-SHELF debt (the committed-tests staleness)

- **What:** The s1-audit (1456 bytes, 2026-08-26) notes: 'MINOR: the committed __tests__/ dir is EMPTY (the battery ran via /tmp harness, not committed tests). S5's battery wave will commit the suite — accepted, logged, NOT a blocker.' That note was correct at S1 time — the __tests__/ dir now contains battery.test.ts (635L) + identity-demand.test.ts + report.test.ts (the S5 commit). The s1-audit's 'EMPTY' note is stale but harmless — the fix it predicted has landed.
- **Verdict:** RESOLVED — no action. The note is kept as the audit's timestamp honesty, not a gap.

### §3.4 The preflight ≥951 quirk (S-9's oracle vs the R0-gate defect)

- **What:** The preflight gate's oracle (≥951 HIGH all R0-PREFLIGHT) is the Plan-A R0-gate shape: `buildEmptyResult` hard-codes `sourceFilesScanned: 0` at `index.ts:159` (the Plan-A index.ts, not the shadow). The self-audit's score `0/100` with `WARNING: ZERO source files found` is that hard-code surfacing — the engine analyzed the files (21,434 HIGH findings from R0-PREFLIGHT, 0 from R1-R16/six-layer) but the score's file-count is 0. The findings ARE the deliverable; the score is the quirk.
- **Why it is not a shadow gap:** The quirk is in the Plan-A audit engine that the shadow will replace — the shadow's own validators (validator.ts V0-V8) do not have this bug. The shadow's preflight shape will be correct once the shadow IS the engine (Plan A's A5 rewire).
- **Verdict:** FLAGGED, not a shadow blocker — the shadow's ledger artifacts (when produced) will carry the correct `sourceFilesScanned` from the shadow's own ingest, not the Plan-A hard-code.

### §3.5 The knowledge-graph / hunter-tree residuals (out-of-scope but cited)

- **What:** The Known Measurements table cites `knowledge-graph 641/0` and `hunter tree 5627/59 FAIL (59 largely env-dependent: provider-500 chains, missing corbell/ix binaries, docker-down, tsconfig-absent /tmp fixtures — but the B-8 '44/44' claim is refuted)`. These are Plan B/C (SRO graph + hunter) metrics, not Plan S. They are cited here because the WAVE_LEDGER interleaves all three plans — the shadow's gap analysis must not conflate cross-plan residuals with shadow gaps.
- **Verdict:** OUT-OF-SCOPE for Plan S — documented, not extended. The shadow's own battery is 186/0/526; the cross-plan failures do not touch it.

---

## §4 CLEAR NEXT STEPS — THE ORDERED, DISPATCHABLE FIX LIST

Each step names its spec criterion + its wave + its verification command. No step is 'do X and trust' — every step ends with a command whose output IS the proof. Steps are ordered by dependency (the earliest unverified gate first).

### Step 1 — S6: Run the plan's container scenario suite LIVE (the S-10 gate)

- **Criterion:** S-10 (the container suite) + S-2 (probe loud-fail in tool-result) + S-3 (happy-path artifacts) + MC-S-01/MC-S-02/MC-S-10
- **Wave:** S6 (the shadow container test — spec §3 wave S6, §4.2 the 11-scenario suite)
- **What to do:** Spawn a container (image `runtime-grade-container-sandbox:master`, agent `trident` or the shadow harness) with the rebuilt dist (sha aa1cdc6b90a7dcb7) and run the plan's §4.2 11-scenario battery LIVE via natural-language prompts + tool calls. The suite is NOT the battle-test's 6 scenarios — it is the plan's 11: LIAR supremacy, DEAD-BRAIN probe+mid-run, REATTACH, BLANK honest-empty, VERBATIM fix, PLANTED D4+RED_HERRING, WRITE-SCOPE mechanical, COHERENCE chain, VALIDATOR-REJECT repair, CARDINALITY, plus the read-turn-ledger assertion. Each scenario declares its passToken (an exact string that MUST appear IN A TOOL RESULT) + failToken (that MUST NOT appear) + maxWait + evidence.
- **Verification (all must pass, mechanically checked via `action=check` on tool outputs):**
- **Auth probe (D.1, mandatory FIRST):** A model-backed tool call must succeed in the container (e.g., `trident-status` or a trivial `write_file` + `read_file` round-trip) — the silent-auth-failure green is the #1 false-green. PassToken: the tool's JSON result, not the agent's prose.
- **Probe loud-fail:** Trigger the probe with a dead key / dead baseUrl via the runner's `probeTransport` injection or `OPENCODE_GO_API_KEY=''` in the tool's env. Assert: tool result contains `SHADOW_API_UNREACHABLE` (the exact code) + the remedy string, NOT just 'did not hang'. This closes S-2's PARTIAL.
- **Happy-path ledger:** Run `runAuditPipeline` on the §2.10 12-candidate fixture (the worked-run trace shape: 12 candidates, 5/6/1, one repair, stamp). Assert the four ledger artifacts on disk: `verdicts.json` (validateVerdicts → 0 rejections, counts 5/6/1), `report.md` (8/8 markers via checkReportMarkers), `manifest.json` (counts reconcile, phaseLog ordered, ready:true, rounds 6/6), `evidence/cand-NN-context.txt` ×12. This closes S-3's NOT-PROVEN.
- **Read-turn ledger:** From the happy-path run's `read-turns.json` (or the `readTurns` array persisted with the manifest), assert `forall p ∈ specs: exists t ∈ readTurns: t.path=p ∧ t.phase=P0` + the EOF-chain check (per-unique-path contiguous windows to EOF). This is the MC-S-02 predicate the spec requires. (Currently the only readTurns are from the tool's in-memory array — the persistence to ledger awaits the runner's write.)
- **Budget pins:** Assert `budgetRounds(4)=5, budgetRounds(12)=6, budgetRounds(80)=14` from the live run's manifest.rounds.budget (or a direct unit call). This refreshes S-4's stale audit numbers.
- **Write-scope:** Assert 5 bypass attempts (ledger-dotdot, ledger-symlink, ledger-case, ledger-absolute, ledger-parent) all return `WRITE_SCOPE_VIOLATION` + 0 landed writes + `evidence/write-violations.log` rows. This closes S-5's container gap.
- **Phase log:** Assert the happy-path's `phaseLog` is 7 steps ordered: PROBING→RECON→EVIDENCING→ADJUDICATING→REPORTING→VERIFYING→DONE (the s4-audit's 7-ordered log).
- **Artifact:** Write `.trident/container-test-results.json` (the NEW file, per the plan's gate) with per-scenario `{passTokenMatched: true (in tool-result), failTokenAbsent: true, toolResultContext, timedOut: false, byteOffset, verdict: PASS}` + `circuitBreaker: {shaDeployMatch, authProbe, allPlannedScenariosExecuted, allTokensAsserted, noCircularPasses, noTimeouts, blastRadiusCovered, adversarialBehaved, containerAlive, resultsArtifactWritten}` ALL true. Archive the old battle-test file as `battle-test-results.json`. The `noTimeouts` must be true — the S6 harness must use `action=check` with sufficient maxWait, not the timed-out send path.
- **Command(s):**
```sh
# In the container (via trident-container-test tool):
trident-container-test action=setup containerName=v443-s6 distPath=./dist testPlan='<2000+ char S6 plan per skill deep-container-testing>'
trident-container-test action=send prompt='auth probe: run bun --version and report the tool result' waitForCompletion=true
trident-container-test action=send prompt='probe loud-fail: set OPENCODE_GO_API_KEY to empty, run the shadow probe via runAuditPipeline with a dead transport, assert SHADOW_API_UNREACHABLE in the tool result' waitForCompletion=true
trident-container-test action=send prompt='happy-path: run the 12-candidate fixture through runAuditPipeline, assert the 4 ledger artifacts + the 5/6/1 counts + the 8/8 markers' waitForCompletion=true
trident-container-test action=check pattern='SHADOW_API_UNREACHABLE'  # must match IN tool result, not agent prose
trident-container-test action=report  # generates the summary + .trident/container-test-results.json
```

### Step 2 — S-7: Run the meta-audit (the tool auditing its own shadow-backend)

- **Criterion:** S-7 (the meta-audit — NEVER RUN)
- **Wave:** S-7 meta-audit (spec §2.8.3) — dispatched as a `trident_explore` or direct tool run, NOT a container test
- **What to do:** Run the code-audit tool ON its own shadow-backend source with THIS spec in its specs[] array. The target is `src/audit-engine/shadow-backend/` (or the built dist's source map), the specs is `[MASTER_CONTEXT/V443_PLAN_S_CODE_AUDIT_SHADOW_L2_SPEC.md]`, the candidates are the mechanical R-layer hits (or the battery's candidate set). The tool parses Appendix B's JSON registry, binds each of the 10 contracts' MathExpr predicates against the implementation's runtime telemetry (probeMs, readTurns, roundsUsed, verdicts, writes, confidence, callLog, report markers), and `checkContract`s each one. The output is a meta-audit artifact: `{metaAuditRunId, contractsChecked:10, passed: N, failed: M, findings: [{contractId, verdict, evidence}]}`.
- **Oracle:** Zero TRUE_DEFECTs on a container-verified build = the meta-audit PASSES (spec §6 S-7). A TRUE_DEFECT in the meta-audit is a load-bearing contract violation in the shadow's own code.
- **Verification:**
```sh
bun run src/audit-engine/shadow-backend/report/meta-audit.ts \
  --target src/audit-engine/shadow-backend \
  --spec MASTER_CONTEXT/V443_PLAN_S_CODE_AUDIT_SHADOW_L2_SPEC.md \
  --registry-spec-json  # binds Appendix B's JSON, runs checkContract ×10, writes meta-audit.json
cat .trident/audit-ledger/meta-audit-*/verdicts.json | jq '.verdicts[] | select(.adjudication=="TRUE_DEFECT")'  # must be empty
```
- **If the meta-audit harness does not yet exist:** The S-7 dispatch must first build `src/audit-engine/shadow-backend/report/meta-audit.ts` — a thin harness that reads the spec's Appendix B JSON, collects the telemetry bindings (readTurns from the S6 ledger, verdicts from the happy-path run, call log from the ledger, report text), and calls the Plan-A A3 substrate's `checkContract`. This is a B1-class task (≤50 lines), not a wave.

### Step 3 — S-3/S-4: Refresh the happy-path ledger artifact run (the S-3 NOT-PROVEN closure)

- **Criterion:** S-3 (the four artifacts) + S-4 (budget pins) — may be closed by Step 1's happy-path scenario, or run standalone if S6 is delayed
- **What to do:** Run `runAuditPipeline` on the §2.10 12-candidate fixture IN-PROCESS (no container) with a mocked agent (the S5 battery's `agentRunFn` mock that replays the worked-run trace: P0 2 spec windows → P1-P2 3 batches → P3 one write → REJECT×1 → P3' repair → P4 stamp). Assert the four artifacts on disk and validate them via `validateVerdicts` + `checkReportMarkers` + counts reconcile. This is the S5 battery's happy-path scenario extracted as a standalone ledger run — the battery already does this, but the standalone run proves the artifacts exist outside the battery's temp dir.
- **Verification:**
```sh
bun test src/audit-engine/shadow-backend/__tests__/battery.test.ts --test-name-pattern='HAPPY'  # the happy-path block
ls -la /tmp/shadow-happy-*/.trident/audit-ledger/*/verdicts.json  # or the committed ledger path
bun --eval "const v=require('./src/audit-engine/shadow-backend/report/validator.js'); console.log(v.validateVerdicts(JSON.parse(require('fs').readFileSync('verdicts.json','utf8')), {candidatesCount:12}))"
```

### Step 4 — S-8: Close the call-log law (the 100% muse-spark assertion)

- **Criterion:** S-8 (100% muse-spark call log)
- **What to do:** After Step 1's happy-path run, read the ledger's call log (or the manifest's provider field + the agent's message history) and assert `forall c ∈ llmCalls: c.model='opencode-go/muse-spark-1.2-contributor'`. The current code law (`PROVIDER_CHAIN[1]` + `assertSingleProviderChain`) proves no fallback CODE; this step proves no fallback RUNTIME. If the ledger does not yet persist a call log, add the persistence (the agent's `model` field per message) and re-run.
- **Verification:**
```sh
jq '.llmCalls[] | .model' .trident/audit-ledger/<runId>/manifest.json | sort | uniq -c  # must be 100% opencode-go/muse-spark-1.2-contributor
grep -rn 'zen.*pool\|nvidia.*provider\|openrouter.*provider' src/audit-engine/shadow-backend/  # must be 0 (the code law, already verified)
```

### Step 5 — Rewrite s2-audit.md (the identity+demand stub)

- **Criterion:** Evidence hygiene — the s2 stub blocks trust in the adjudication core
- **What to do:** Rewrite `.trident/wave-audit/s2-audit.md` with the S1 template: per-module WHAT/WHY/HOW + VERDICT, file:line anchors, battery outputs. The S2 wave built `identity.ts` (122L, 4 exports) + `demand-builder.ts` (225L, 6 exports). The rewrite must cite `identity.ts:1` THE_CODE_AUDITOR_PROMPT, `identity.ts:18` THE_ADJUDICATION_RUBRIC, `identity.ts:60` CALIBRATION_SHOTS, `demand-builder.ts:38` computeConfidence, `demand-builder.ts:45` buildAuditDemand, `demand-builder.ts:195` buildBrief + the `identity-demand.test.ts` run output (77 tests, the S5 audit's '77 identity' bucket). Minimum 800 bytes, ≥5 evidence refs, no identical-template sentence.
- **Verification:**
```sh
wc -c .trident/wave-audit/s2-audit.md  # must be ≥800 (not 188)
grep -c 'identity.ts\|demand-builder.ts' .trident/wave-audit/s2-audit.md  # must be ≥3
grep -c 'CORRECT.*verified by reading' .trident/wave-audit/s2-audit.md  # must be 0 (the stub template gone)
```

### Step 6 — Rewrite s3-audit.md (the report-system stub)

- **Criterion:** Evidence hygiene — the s3 stub blocks trust in the validator
- **What to do:** Rewrite `.trident/wave-audit/s3-audit.md` with the S1 template: per-module WHAT/WHY/HOW + VERDICT, file:line anchors, battery outputs. The S3 wave built `report/validator.ts` (V0-V8), `report/markers.ts` (8 markers), `report/manifest.ts` (RunManifest), `report/verdicts.ts`, `report/evidence.ts`. The rewrite must cite `report/validator.ts:20` validateVerdicts V0-V8, `report/markers.ts:1` checkReportMarkers, `report/manifest.ts:1` RunManifest + the `report.test.ts` run output (5 tests). Same floors as Step 5.
- **Verification:** same as Step 5 with `report/validator.ts` anchors.

### Step 7 — Refresh WAVE_LEDGER.md (the staleness fix)

- **Criterion:** Ledger hygiene — the stale ledger derails the S6 dispatch
- **What to do:** Rewrite `.trident/wave-audit/WAVE_LEDGER.md` with the current state: S1 RETURNED CORRECT (ses_fc3f8d7b1ffejEGaBawer11RKl, 2026-08-26, s1-agent-core.md), S2 RETURNED CORRECT (or NEEDS-REWRITE if Step 5 not yet done), S3 RETURNED CORRECT (same), S4 RETURNED CORRECT (359L runner, s4-runner.md), S5 RETURNED CORRECT (635L battery, s5-battery.md), S6 PENDING (or IN-FLIGHT when dispatched), S-7 PENDING. Remove the 'in-flight (stream, 50+ parts)' stale marks. Keep the A1/A3/B1 rows but mark them as Plan A/B (not Plan S) so the wave-manager does not conflate.
- **Verification:**
```sh
cat .trident/wave-audit/WAVE_LEDGER.md  # must have S1-S5 rows, no in-flight stale
grep -c 'in-flight' .trident/wave-audit/WAVE_LEDGER.md  # must be 0 (or only S6 if dispatched)
```

### Step 8 — Archive the contaminated container-results and refresh the budget pin assertions

- **Criterion:** S-10 artifact hygiene + S-4 freshness
- **What to do:** `mv .trident/container-test-results.json .trident/battle-test-results.json` (preserve the battle-test evidence). The NEW `.trident/container-test-results.json` will be written by Step 1's S6 run. Separately, re-run the budget pin assertions against the current 635L battery file and update s5-battery.md's 'c=4→5, c=12→6, c=80→14' with the fresh `bun test` output (the numbers are expected to be identical — the formula hasn't changed — but the evidence ref must be refreshed from 11-block to 11-block-of-635L).
- **Verification:**
```sh
ls -la .trident/battle-test-results.json .trident/container-test-results.json  # both exist after Step 1
bun test src/audit-engine/shadow-backend/__tests__/battery.test.ts 2>&1 | grep -E 'pass|fail'  # 11/0 fresh
```

### Dispatch order (the dependency graph)

```
Step 5 (s2 rewrite) ─┐
Step 6 (s3 rewrite) ─┼─→ Step 7 (ledger refresh) ─→ Step 1 (S6 container suite)
Step 8 (archive)    ─┘                              │
                                                    ├─→ Step 3 (happy-path ledger, if S6 delayed)
                                                    ├─→ Step 4 (call-log law)
                                                    └─→ Step 2 (meta-audit, needs S6's happy-path telemetry)

Steps 5+6+8 are independent — dispatch together in one wave (3 agents, disjoint files).
Step 7 depends on 5+6 (the rewrites' verdicts).
Step 1 depends on 7 (the ledger must be correct before the wave-manager dispatches S6).
Step 2 depends on 1 (needs the happy-path telemetry).
```

---

## §5 THE COVERAGE MAP + THE HONEST RESIDUAL

### §5.1 Every S-1..S-10 mapped to evidence or gap (the coverage map)

| S | Criterion | Covered by | Evidence file:line or command | Gap if any |
|---|---|---|---|---|
| S-1 | void brief gone | grep + the tree | `grep -rn "void brief" src/audit-engine/ → 0` + `src/audit-engine/index.ts:278` no longer contains void brief (the D-1 line is gone) | — |
| S-2 | probe ≤5s loud-fail SHADOW_API_UNREACHABLE | probe.ts code + runner wiring | `probe.ts:3` PROBE_DEADLINE_MS 5000, `probe.ts:27-28` AbortSignal.timeout, `probe.ts:48/58` SHADOW_API_UNREACHABLE emits, `runner.ts:89` step-0 call. Container 'did not hang' PASS but exact code NOT in tool-result. | Runtime proof of the exact code missing |
| S-3 | 4 ledger artifacts validate on happy-path | runner + report validators | `runner.ts:118` ledger mkdir, `report/validator.ts:20` V0-V8, `report/markers.ts` 8 markers, `report/manifest.ts` writeManifest. No happy-path ledger run on the 12-candidate fixture has landed artifacts. | No artifact on disk |
| S-4 | budget pins 4→5, 12→6, 80→14 | phase-controller.ts + battery | `phase-controller.ts:26` budgetRounds, `__tests__/battery.test.ts:1` asserts pins, s5-audit cites pins but numbers stale (battery grew 11→22 blocks across 6 files). | Audit numbers stale |
| S-5 | write-scope 5 bypasses, 0 landed, log rows | tools.ts + battery | `tools.ts:23` resolveForWrite, `tools.ts:42` enforceWriteScope, `tools.ts:120/145` write/edit gates, battery WRITE-SCOPE block PASS. Container ledger log not yet asserted. | Container ledger assertion missing |
| S-6 | 11-scenario battery green on disk artifacts | battery.test.ts | `bun test src/audit-engine/shadow-backend/ → 186/0/526` (this session), `__tests__/battery.test.ts` 635L 11 blocks, `s5-battery.md` 842 bytes. | — (but see S-10's contaminated suite) |
| S-7 | meta-audit of 10 contracts | NEVER RUN | No file matching *meta-audit*, no checkContract run against Appendix B's JSON. Spec §2.8.3 unexecuted. | Never executed |
| S-8 | 100% muse-spark call log | provider.ts code | `provider.ts:16-17` PROVIDER_CHAIN[1], `provider.ts:19` assertSingleProviderChain, `grep -rn zen/nvidia/openrouter` → 0 (code law). No ledger call log to prove runtime law. | Runtime log missing |
| S-9 | preflight ≥951 all R0, 0 from R1-R16 | tsc + battery + container self-audit | `tsc --noEmit → 0`, `bun test 186/0`, container self-audit 21,434 HIGH all R0 (≥951 floor met). Score 0/100 quirk from Plan-A index.ts:159 hard-code, not a shadow defect. | Score quirk flagged, not a blocker |
| S-10 | S6 container suite PASS + ledger + read-turn assertion | container-test-results.json (contaminated) | `.trident/container-test-results.json` 6 scenarios PASS but self-authored (noTimeouts=false), NOT the plan's 11-scenario suite; read-turn predicate never asserted. | Contaminated artifact, plan's suite not run |

### §5.2 What could not be verified and why (the honest residual)

1. **S-2's exact SHADOW_API_UNREACHABLE code in a tool result.** The code that emits it is verified (probe.ts:48,58), but the runtime path that proves it requires the tool-call environment to receive a dead key. The container agent discovered that `OPENCODE_GO_API_KEY=''` in the host shell does NOT propagate into the tool-call runtime — the env-var injection is the wrong mechanism. The correct mechanism is the `probeTransport` mock injection (runner.ts:89's `input.probeTransport`) or a dead `baseUrl` — but no S6 run has used it yet. *Why it matters:* S-2 is the operator's '0 minutes wasted' law — a slow fail wastes the wave-manager's 30-40K-char prompt. *What closes it:* Step 1's probe loud-fail scenario with the transport mock.

2. **S-3's four ledger artifacts on a real candidate set.** The validators that WOULD validate them are verified (report/validator.ts V0-V8, markers.ts 8/8, manifest.ts), but no run has produced the artifacts on the §2.10 12-candidate fixture. The container's tiny-fixture run produced 0 candidates (the honest-empty path), and the real-target run hit the Plan-A R0 gate. The S5 battery's mocked-harness happy-path IS green (11/11) but in a temp dir, not the ledger the spec names. *What closes it:* Step 1's happy-path ledger scenario (or Step 3 standalone).

3. **S-4's pin freshness.** The formula is verified (phase-controller.ts:26) and the battery asserts the pins, but the audit file that claims the pins (s5-battery.md) was written when the battery was 11 blocks and the full suite was 93 pass — now the suite is 186 pass with 22 blocks across 6 files. The pins are almost certainly still correct (the formula hasn't changed), but the audit's evidence ref is stale — a fresh `bun test` with the current 635L file must be pasted into the refreshed audit. *What closes it:* Step 8's budget-pin refresh.

4. **S-5's container ledger log.** The in-process WRITE-SCOPE scenario is green (the battery's 5-bypass block), but the S6 gate requires the *container* ledger's `evidence/write-violations.log` on disk after a live run. The old container's battle-test did not exercise this path. *What closes it:* Step 1's write-scope bypass scenario.

5. **S-7's meta-audit — never run.** The substrate it would use (Plan A's A3 `checkContract` over the 30-kind grammar) exists, but no harness has bound Appendix B's 10 contracts against the shadow-backend source. No artifact, no finding, no verdict. This is the spec's self-verification closure — the build is not theatrical IFF the meta-audit passes (zero TRUE_DEFECTs on a container-verified build). Until it runs, the build's 'not theatrical' claim is prose. *What closes it:* Step 2's meta-audit dispatch (needs S6's telemetry).

6. **S-8's 100% call-log law.** The code law (single rung, zero fallback strings) is verified by grep, but the runtime law (every llmCall IS that model) requires a ledger call log from a live run. No ledger with a call log exists. The container's 'tool-registry' scenario proves the tool IS registered, not that every call IS that model. *What closes it:* Step 4's call-log assertion (needs S6's happy-path ledger).

7. **S-10's container suite — contaminated.** The file at `.trident/container-test-results.json` is 6 scenarios (the battle-test) with noTimeouts=false, not the plan's 11-scenario S6 suite with the read-turn predicate. The file LOOKS like the gate artifact, satisfying a naive check, while the plan's scenarios remain unrun. The honest residuals in the file name the timeouts, but no downstream check would know to look. *What closes it:* Step 1's S6 suite (which archives the old file and writes the new gate artifact).

8. **The stub audits s2/s3.** Two of the five wave-audits are 188-byte stubs with 0 evidence refs. They cover the two most load-bearing layers (identity+demand, report validators). A defect in either would be invisible. The stubs are not 'soft' — they are the self-satisfied audit class the spec's §5 anti-pattern table names (AP-S-7 summary spec-read, the prose-not-ledger class). *What closes it:* Steps 5-6's rewrites with the S1 template.

9. **The WAVE_LEDGER staleness.** S1 still marked in-flight, S2-S5 absent, A1/A3/B1 interleaved from the three-plan ledger. The next wave-manager dispatch would misread the state. *What closes it:* Step 7's refresh.

### §5.3 What IS production-grade (cite VERIFIED with evidence)

| What | Evidence | Grade |
|---|---|---|
| The build pipeline | `bun build src/index.ts --outdir dist --target bun --format esm --bundle → 1439 modules, 17.6MB, sha aa1cdc6b90a7dcb7 byte-reproducible` | **PRODUCTION** |
| The TypeScript contract | `npx tsc --noEmit → 0 errors` repo-wide (this session) | **PRODUCTION** |
| The shadow unit battery | `bun test src/audit-engine/shadow-backend/ → 186 pass / 0 fail / 526 expects` (6 files, re-run this session) | **PRODUCTION** |
| The probe contract (code) | `probe.ts:27-28` AbortSignal.timeout(5000) + `runner.ts:89` step-0 + `probe.ts:48/58` SHADOW_API_UNREACHABLE emits | **PRODUCTION** |
| The Write-Scope law | `tools.ts:23` resolveForWrite (realpathSync+startsWith) + `tools.ts:42` enforceWriteScope + `tools.ts:120/145` write/edit gates — 5 bypass classes closed | **PRODUCTION** |
| The single-provider chain | `provider.ts:16-17` PROVIDER_CHAIN[1] + `provider.ts:19` assertSingleProviderChain + `grep` 0 fallback strings | **PRODUCTION** |
| The PhaseController state machine | `phase-controller.ts:35` XState machine 9 states + `phase-controller.ts:83` imperative mirror + `phase-controller.ts:26` budgetRounds pins | **PRODUCTION** |
| The Identity (auditor brain) | `identity.ts:1` THE_CODE_AUDITOR_PROMPT + `identity.ts:18` THE_ADJUDICATION_RUBRIC + `identity.ts:60` CALIBRATION_SHOTS[3] | **PRODUCTION** |
| The Demand Builder (5-part brief) | `demand-builder.ts:38` computeConfidence (0.55 floor) + `demand-builder.ts:195` buildBrief (5× `---`) + `demand-builder.ts:73` MC-S-02/MC-S-03 wiring | **PRODUCTION** |
| The Report validators | `report/validator.ts` V0-V8 + `report/markers.ts` 8 markers + `report/manifest.ts` RunManifest | **PRODUCTION** |
| The BUG-D1/D2 fixes | `agent.ts:7` ESM import + `dist` 5× SHADOW_API_UNREACHABLE + the size-guard + fatal scope-probe catch (Plan-A) | **PRODUCTION** |

These are the layers the orchestrator's next wave can build ON — they are not the layers the next wave must fix.

### §5.4 What is NOT production-grade (name as UNVERIFIED/NOT-RUN)

| What | Gap | Blocker for |
|---|---|---|
| The happy-path ledger artifacts (verdicts.json + report.md + manifest + evidence/) | S-3 NOT PROVEN — no run produced the 4 artifacts on the 12-candidate fixture | S6, S-7, S-8 |
| The S6 container suite (the plan's 11 scenarios + read-turn predicate) | S-10 CONTAMINATED — 6 battle-test scenarios, not the plan's 11; noTimeouts=false | S-10, S-2, S-3 |
| The meta-audit (tool auditing its own 10 contracts) | S-7 NEVER RUN — no artifact, no checkContract binding | S-7 |
| The 100% muse-spark call log (runtime) | S-8 NOT VERIFIED — code law verified, runtime log missing | S-8 |
| The exact SHADOW_API_UNREACHABLE in a tool result | S-2 PARTIAL — code verified, tool-result observation missing (env-var injection doesn't reach runtime) | S-2 |
| The budget-pin freshness (audit evidence) | S-4 UNVERIFIED — formula verified, audit numbers stale | S-4 |
| The stub audits s2/s3 | G-F1 — 188-byte stubs, 0 evidence refs | Trust in identity+report layers |
| The WAVE_LEDGER | G-F2 — 9 lines, stale, S2-S5 absent | S6 dispatch |

None of these is a code defect — the code IS production-grade. Each is a *proof* defect: the behavior exists, the artifact that proves it does not. The fix is running the proofs (Step 1's S6 suite is the closure; Steps 5-7 are the hygiene). The build's honesty is that these are named here, not hidden behind a PASS aggregate.

---

## APPENDIX C — THE SHIP BOUNDARY (what the orchestrator's next wave must decide)

The shadow backend's CODE is shippable (the 'what IS production-grade' table above). The shadow backend's PROOF is not (the 'what is NOT' table). The ship boundary is the S6 container suite: the code ships when S6 is green + the meta-audit is green + the ledger artifacts reconcile. Until then the code is PRODUCTION-GRADE BUT UNPROVEN — the distinction the gap register exists to preserve.

The S6 gate's own gate (spec §4.2) is explicit: 'all scenarios PASS + .trident/container-test-results.json + the read-turn ledger assertion (forall p ∈ specs: exists t ∈ readTurns: t.path=p ∧ t.phase=P0)'. That is the ship criterion. The current `.trident/container-test-results.json` is the battle-test's 6 scenarios with noTimeouts=false — it does not satisfy that gate, and must not be mistaken for it.

The meta-audit's gate (S-7) is 'zero TRUE_DEFECTs on a container-verified build'. That is the self-verification closure. Until it runs, the build's 'not theatrical' claim is prose — the spec's own anti-derailment table (AP-S-1..AP-S-10) is unenforced.

The budget for the closure wave (per the operator's dispatch law): S6 is a single container wave (1 container, ~15-30 min wall-clock for the 11 scenarios + the happy-path fixture), the meta-audit is a single in-process run (~2 min), the stub rewrites are a single parallel wave (3 agents, disjoint files, ~10 min). Total: ~45 min, 3 waves, 5 agents. The operator's token law: '50M tokens per session is NORMAL' — the closure is a micro-wave, not a macro.

---

## APPENDIX D — THE FILE:LINE ANCHOR INDEX (the raw evidence excerpts)

Every file:line below was READ this session — no belief, no re-derive. The anchor is the grep or the file read that produced it.

| File | Line(s) | What lives there |
|---|---|---|
| MASTER_CONTEXT/V443_PLAN_S_CODE_AUDIT_SHADOW_L2_SPEC.md | 32-94 | §2.10 worked run: 12 candidates, 6 rounds, stamp |
| MASTER_CONTEXT/V443_PLAN_S_CODE_AUDIT_SHADOW_L2_SPEC.md | 859-872 | §6 S-1..S-10 verbatim (incl. S-10's read-turn predicate) |
| MASTER_CONTEXT/V443_PLAN_S_CODE_AUDIT_SHADOW_L2_SPEC.md | 909-959 | Appendix B 10-contract JSON registry (spec-s.mpse.v1) |
| src/audit-engine/shadow-backend/probe.ts | 3 | PROBE_DEADLINE_MS = 5000 |
| src/audit-engine/shadow-backend/probe.ts | 4 | SHADOW_API_UNREACHABLE = 'SHADOW_API_UNREACHABLE' |
| src/audit-engine/shadow-backend/probe.ts | 27-28 | AbortSignal.timeout(deadlineMs) + AbortSignal.any |
| src/audit-engine/shadow-backend/probe.ts | 48-55 | SHADOW_API_UNREACHABLE on non-ok response |
| src/audit-engine/shadow-backend/probe.ts | 58-69 | SHADOW_API_UNREACHABLE on catch/timeout |
| src/audit-engine/shadow-backend/probe.ts | 73 | probeManifestOnFailure helper |
| src/audit-engine/shadow-backend/provider.ts | 1-3 | SHADOW_PROVIDER_ID/MODEL_ID/MODEL |
| src/audit-engine/shadow-backend/provider.ts | 7-9 | SHADOW_RETRY_ATTEMPTS/BACKOFF/STALL_MS |
| src/audit-engine/shadow-backend/provider.ts | 16-17 | PROVIDER_CHAIN[1] single rung |
| src/audit-engine/shadow-backend/provider.ts | 19 | assertSingleProviderChain |
| src/audit-engine/shadow-backend/agent.ts | 7 | ESM import createAssistantMessageEventStream (BUG-D1 fix) |
| src/audit-engine/shadow-backend/agent.ts | 30-70 | chainedStream retry 15×3s + 429 exile + stall 60s |
| src/audit-engine/shadow-backend/agent.ts | 75 | getModel single-provider |
| src/audit-engine/shadow-backend/agent.ts | 95 | createAuditorTools ctx |
| src/audit-engine/shadow-backend/agent.ts | 118 | run() loop maxRounds + waitForIdle + n===0 break |
| src/audit-engine/shadow-backend/phase-controller.ts | 26 | budgetRounds(c)=4+ceil(c/8) |
| src/audit-engine/shadow-backend/phase-controller.ts | 35 | createMachine XState 9 states |
| src/audit-engine/shadow-backend/phase-controller.ts | 83-142 | PhaseController class (imperative mirror) |
| src/audit-engine/shadow-backend/phase-controller.ts | 108 | transitionTo with phaseLog push |
| src/audit-engine/shadow-backend/demand-builder.ts | 38 | computeConfidence 0.55 floor |
| src/audit-engine/shadow-backend/demand-builder.ts | 45 | buildAuditDemand validation (runId/targetRoot/specs) |
| src/audit-engine/shadow-backend/demand-builder.ts | 80 | buildPart1Supremacy (frozen) |
| src/audit-engine/shadow-backend/demand-builder.ts | 108 | buildPart3Specs 2500L window |
| src/audit-engine/shadow-backend/demand-builder.ts | 165 | buildPart5FocusesAndContract + shots |
| src/audit-engine/shadow-backend/demand-builder.ts | 195 | buildBrief 5× `---` |
| src/audit-engine/shadow-backend/identity.ts | 1 | THE_CODE_AUDITOR_PROMPT (supremacy) |
| src/audit-engine/shadow-backend/identity.ts | 18 | THE_ADJUDICATION_RUBRIC (5 laws) |
| src/audit-engine/shadow-backend/identity.ts | 60 | CALIBRATION_SHOTS[3] |
| src/audit-engine/shadow-backend/tools.ts | 18 | isWithinLedger (startsWith root+sep) |
| src/audit-engine/shadow-backend/tools.ts | 23 | resolveForWrite (realpathSync symlink-follow) |
| src/audit-engine/shadow-backend/tools.ts | 42 | enforceWriteScope (ledger-scoped, log on violation) |
| src/audit-engine/shadow-backend/tools.ts | 50-110 | read_file ledger push ctx.readTurns |
| src/audit-engine/shadow-backend/tools.ts | 120 | write_file scope gate |
| src/audit-engine/shadow-backend/tools.ts | 145 | edit_file scope gate |
| src/audit-engine/shadow-backend/rpm-ledger.ts | 5 | RPM_PROFILES |
| src/audit-engine/shadow-backend/rpm-ledger.ts | 20 | RpmLedger class |
| src/audit-engine/shadow-backend/runner.ts | 68 | INVALID_RUN_ID early-return |
| src/audit-engine/shadow-backend/runner.ts | 89 | step-0 await probeProvider (transport+apiKey injection) |
| src/audit-engine/shadow-backend/runner.ts | 93 | probe-fail manifest ready:false stage:probe |
| src/audit-engine/shadow-backend/runner.ts | 118 | ledger mkdir + evidence/ |
| src/audit-engine/shadow-backend/runner.ts | 139 | reconDone |
| src/audit-engine/shadow-backend/runner.ts | 147 | evidencing→adjudicating→reporting spine |
| src/audit-engine/shadow-backend/report/validator.ts | 20 | validateVerdicts V0-V8 |
| src/audit-engine/shadow-backend/report/markers.ts | 1 | checkReportMarkers 8 markers |
| src/audit-engine/shadow-backend/report/manifest.ts | 1 | RunManifest + writeManifest |
| src/audit-engine/shadow-backend/__tests__/battery.test.ts | 1 | 11 adversarial scenarios, 635L |
| .trident/wave-audit/s1-agent-core.md | 1 | 1456 bytes, CORRECT, 7 checks (the correct template) |
| .trident/wave-audit/s2-audit.md | 1 | 188 bytes, CORRECT (stub, 0 refs) |
| .trident/wave-audit/s3-audit.md | 1 | 188 bytes, CORRECT (stub, 0 refs) |
| .trident/wave-audit/s4-runner.md | 1 | 1331 bytes, CORRECT, 5 checks |
| .trident/wave-audit/s5-battery.md | 1 | 842 bytes, CORRECT, 4 checks |
| .trident/wave-audit/WAVE_LEDGER.md | 3-6 | S1 in-flight stale, A1/A3/B1 only, S2-S5 absent |
| .trident/container-test-results.json | 1 | v443-battle-test-container-suite, noTimeouts=false |

---

**END OF GAP ANALYSIS — PLAN S. Total S criteria: 10. Total contracts: 10. Total gaps needing fix: 9 (G-F1..G-F3 + S-2/S-3/S-4/S-5/S-7/S-8/S-10). Total production-grade layers: 11. Total waves to close: 3 (stub-rewrites + ledger + S6/meta).**

The next build wave reads this doc to compose the fix specs; the S6 container suite + the S-7 meta-audit are the closure. No criterion is claimed VERIFIED without its evidence line — and every UNVERIFIED names what closes it.
