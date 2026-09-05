# TRIDENT_V443 CODE AUDIT SHADOW BACKEND — L2 SPEC (PLAN S)

**Version:** 1.0 · **Date:** 2026-08-25 · **Status:** AUTHORITATIVE — the design authority for the Code Audit Shadow build
**Project:** /home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/v4.4.3
**Predecessors:** V443_REGROUNDING_ARCHITECTURE_AUDIT_REPORT.md (the D-1..D-15 inventory) · SRO-Code-Audit-Overhaul-Data.md (the SRO/LASME/MPSE design input) · V443_LASME_PARAGON_ENFORCEMENT_L2_SPEC.md (the superseded slop doc)
**Design authorities:** SHADOW_ENHANCED_TOOLS_BIBLE.md (the 7-stage pattern, 20-step recipe) · agent_plugin_boilerplates/shadow_agent_backend (the PI-SDK harness, forked) · V4.4.2_WAVE_MANAGER_BATTLE_TESTED/src/tools/wave-spec.ts (the input-pipeline pattern) · KNOWLEDGE_LIBRARY/MPSE (the mathematical substrate this spec is written IN)
**Baseline (operator-locked, never re-litigated):** single provider muse-spark-1.2-contributor@opencode-go ONLY, loud fail-fast, zero fallback rungs (Q1-b) · write/edit tools scoped to the audit ledger (the agent WRITES A REPORT TO DISK, not a token blob) · PI SDK is the harness — MANDATORY, never stripped · this is a production-grade CODE AUDITOR, not a prompt polisher — "a completely different use case… a micro build in and of itself" (operator, verbatim)

## TABLE OF CONTENTS

- §0 THE FUNDAMENTAL PROBLEM
- §1 FAILURE INVENTORY (evidence-cited)
- §2 THE FIX PLAN (the complete design)
  - §2.1 The Harness Layer — what is forked verbatim
  - §2.2 The Tool Surface — four force-bound tools + the Write-Scope Law
  - §2.3 The Phase Controller — P0..P4 + the round budget
  - §2.4 The Identity — THE CODE AUDITOR system prompt + the adjudication rubric
  - §2.5 The Demand Builder — the five-part brief
  - §2.6 The Deliverables — verdicts.json + report.md + manifest.json + evidence/
  - §2.7 The Runner — the 14-step one-place composition
  - §2.8 THE MPSE WIRING — the spec's own MathContracts (the meta-audit anchors)
  - §2.9 Memory + Telemetry — the session chain + the run manifest
- §3 IMPLEMENTATION ORDER — waves S1..S6
- §4 TESTING STRATEGY — the zero-hint battery + the shadow container test
- §5 ANTI-PATTERNS AGAINST FALSE SUCCESS
- §6 SUCCESS CRITERIA (mechanical, oracle-anchored)
- §7 COMPACTION-PROOF IMPLEMENTATION GUIDE
- §8 FINAL NOTES / OPEN QUESTIONS
- APPENDIX A — ZERO-TRUST AUDIT
- APPENDIX B — THE MPSE CONTRACT REGISTRY (the machine-readable anchor table)

### §2.10 THE WORKED RUN (the end-to-end trace — the fresh builder's calibration)

A complete 12-candidate run, traced through every step (the numbers are the MC-S-03 pin: rounds=6).

```
INPUT  audit-spec.json (validated by A1):
  codebase: /ws/ExampleProject/src        specs: [/ws/ExampleProject/ARCH_SPEC.md]
  focuses: ["adapter wiring in brains/"]  knownContext: 214c · doctrine: 120c · measurements: 156c

STEP 0  PROBE            POST /chat/completions (16 tokens) → 200 in 640ms → probeMs=640 ✓ MC-S-01
STEP 1-4 LIFECYCLE       tether(audit-1787...), sidecar register, memory open, reattach PASS
STEP 5  INGEST           the A4 layers emitted 12 candidates:
                         R-ACTOR×3 (S1: brains/index.ts:64 actor-started-not-subscribed;
                                    S1: pse engine wired-no-adapter;
                                    S2: cme actor subscribe-without-failed-watch)
                         R-LEXICON×2 (S2: stuck-detector regex-only matcher;
                                      S1: calibration.ts decision-ifchain no-PatternFamily)
                         R-STATE-MACHINE×2 (S1: deploy phases as booleans;
                                            S2: workflow machine no final/error state)
                         R-ENGINE×2 (S2: rge engine no-evidence-writes;
                                     S1: intent engine hook-resident not plain-class)
                         R-ADAPTER×1 (S1: sre adapter missing snapshot-merge leg)
                         R-MPSE×2 (S1: threshold 0.40 vs spec 0.38 binding;
                                   S2: oracle no-epsilon)
STEP 6  DEMAND           five parts, 612L (the ARCH_SPEC ingest dominates at 380L)
                        budgetRounds = 4 + ceil(12/8) = 6 ✓ MC-S-03
STEP 7  PHASE LOOP
   P0 (round 1): read ARCH_SPEC.md ×2 windows → EOF; recon-map.md written
                  readTurns: [{path:ARCH_SPEC.md, phase:P0}×2] ✓ MC-S-02
   P1+P2 (rounds 2-4): 3 batches × ~4 candidates; evidence windows read; spec clauses
                  re-read per candidate; 12 × cand-NN-context.txt written;
                  verdicts formed in-context
   P3 (round 5): write_file verdicts.json + report.md (one batched round)
   P8  VALIDATE  → REJECT ×1 (verdict#7 TRUE_DEFECT missing specQuote)
                  → the repair loop re-runs P3 with the rejection in context ✓ (≤2)
   P3' (round 5, repair): fixed — specQuote present
   P4 (round 6): re-read 5 TRUE_DEFECT citations; 1 discrepancy (a line drifted
                  +3 since the P1 read — the file was edited mid-run by the
                  orchestrator's fix wave); edit_file report.md; stamp written:
                  {claimsRechecked:5, discrepanciesFound:1, fixed:1, writeViolations:0}
STEP 8  VALIDATE ✓       12 verdicts: 5 TRUE_DEFECT · 6 RED_HERRING · 1 UNCLEAR ✓ MC-S-05
STEP 9  SILENT VERIFY    report 8/8 markers ✓ MC-S-10 · counts reconcile ✓
STEP 10 MEMORY APPEND    audit_runs row seq=4 + 3 top_findings rows
STEP 11 (not fired — the run completed)
STEP 12 MANIFEST         ready:true · rounds 6/6 · wallClock 780s · phaseLog ordered ✓ D9
STEP 13 CHAIN READY      run 5's PART 2 will see this run's top-3
```

**The verdict the report's §1 table carries (the shape a builder must reproduce):**

```
idx | layer        | side | verdict      | spec clause        | file:line        | conf
  0 | r-actor      | S1   | TRUE_DEFECT | ARCH_SPEC.md:L212  | brains/index.ts:64 | 0.90
  1 | r-actor      | S1   | TRUE_DEFECT | ARCH_SPEC.md:L198  | engines/pse.ts:31  | 0.85
  2 | r-actor      | S2   | RED_HERRING | — (reason: the subscribe target is the       | 0.80
    |              |      |             |  supervisor's CHILD_FAILED feed, ACTOR:641)  |
  3 | r-mpse       | S1   | TRUE_DEFECT | ARCH_SPEC.md:L94   | thresholds.ts:17   | 0.95 (D-class)
  7 | r-lexicon    | S2   | UNCLEAR     | missing: the spec's lexicon section          | —
    |              |      |             | (ARCH_SPEC:L240-L260) vs the actual matcher   |
    |              |      |             | needs a grep for 'matchStuck' in stuck.ts     |
```

This trace is the S5 battery's HAPPY-PATH fixture: the mocked-harness run must reproduce this shape exactly (the counts, the repair loop, the stamp, the manifest fields).



## §0 THE FUNDAMENTAL PROBLEM

**One sentence:** the code audit tool's adjudication core — the place where mechanical candidates become verified findings — is a `void` statement; this spec builds its replacement: a production-grade CODE AUDIT SHADOW agent (a micro build in its own right) that reads the specs, reads the code, adjudicates every candidate against the rubric, and **writes a complete, schema-validated code report to disk**.

**The root defect class (evidence: V443_REGROUNDING_ARCHITECTURE_AUDIT_REPORT.md D-1):** `src/audit-engine/index.ts:278` builds the Batch-A shadow brief, logs "single adjudication pass" at :277, then executes `void brief;` at :278 and stamps every candidate `TRUE_POSITIVE` at :279 — **zero model calls, zero adjudication, a theatrical log line**. The operator's R-4 ruling ("SHADOW ENHANCED - NOT 100% PROMPT BASED MODEL ONLY") is violated at the exact point it was meant to live.

**Why the prior "plan" for this was air:** the earlier overhaul sketch named "the shadow backend" as a fork-and-patch of `shadow_agent_backend` without specifying the ONE thing that matters — the agent's FUNCTION. The boilerplate is a **polish harness**: it takes a pre-built file on disk, gives the model `read` + `batch edit`, and lets it surgically polish across 2-3 rounds. That function is WRONG for code auditing in three structural ways:

1. **Wrong deliverable surface.** A polish harness's output is an edited input file. An auditor's output is a **verdict set + a report** — NEW artifacts, not edits of existing ones. The operator's ruling (verbatim, 2026-08-25): "so how the fuck is it delivering its report? a massive fucking blob of tokens injected into the model context? fucking retarded this OBVIOUSLY needs write/edit tools so it can WRITE TO DISK A PROPER CODE REPORT like we have the findings report from bug hunter THIS NEEDS A PROPER CODE REPORT OUTPUT."
2. **Wrong execution shape.** A polish loop is content-agnostic (R1 read, R2 fix, R3 verify). An audit loop is **phase-driven and evidence-accountable**: every verdict must trace to a spec clause + a code quote, and the loop must prove the specs were READ (the mandatory-input law).
3. **Wrong provider posture.** The boilerplate ships a 5-rung fallback chain (zen → nvidia → openrouter → inferx). The operator locked Q1-b: single provider, loud fail, pre-flight probe — "scan at the start of the tool. fail immediately if there's an issue w/ clear api unreachable error so theres no time wasted."

**What this spec builds (the shape in one diagram):**

```
        audit-spec.json (codebase + specs[] + focuses)
                      │ validated in-turn (Plan A's input pipeline)
                      ▼
   ┌────────────────────────────────────────────────────────────┐
   │ THE CODE AUDIT SHADOW — one agent, five phases, one ledger  │
   │  P0 RECON (read every spec fully)                           │
   │  P1 EVIDENCE (per-candidate code reads ±40L windows)        │
   │  P2 ADJUDICATE (the rubric: TRUE_DEFECT/RED_HERRING/UNCLEAR)│
   │  P3 REPORT (WRITE verdicts.json + report.md TO DISK)        │
   │  P4 VERIFY (re-check every citation; the self-verify stamp) │
   └────────────────────────────────────────────────────────────┘
                      │
                      ▼
   .trident/audit-ledger/<runId>/{verdicts.json, report.md, manifest.json, evidence/}
   → the audit engine parses verdicts.json → findingsFromVerdicts() → triads at emission
```

**The MPSE posture of this spec (why §2.8 exists):** this document is written IN the MPSE discipline — every load-bearing quantity (the probe deadline, the round budget, the verdict integrity rules, the write-scope law) is expressed as a `MathContract` (KB-03:271-277: `{id, preconditions, postconditions, invariants, temporal?}` over the 30-kind `MathExpr` grammar at KB-03:239-269). The contracts are registered in Appendix B as machine-readable anchors so **the finished tools can meta-audit their own codebase against this spec** via `checkContract` — the self-verification loop that guarantees the build is not theatrical (see §2.8, the anti-derailment mapping §5, and the meta-audit success criterion S-7).



## §1 FAILURE INVENTORY

Every item cites real evidence — file:line in the v4.4.3 tree, a container artifact, or a verbatim operator ruling. Severity per the D-taxonomy impact.

### F-S1 · CRITICAL · The voided adjudication (the build's reason for existing)
- **What happened:** `index.ts:277-279` — the Batch-A brief is composed (267-276), logged as "single adjudication pass" (:277), then `void brief;` (:278) discards it and `vAll` stamps every candidate `TRUE_POSITIVE` (:279). The log line is itself a lie (D-14).
- **Root cause:** the slop session wired the layer names without wiring the model path; no harness existed to call, so the pipeline faked the verdict.
- **Why broken:** R-4 ("SHADOW ENHANCED - NOT 100% PROMPT BASED MODEL ONLY") requires mechanical candidates → model adjudication with evidence cites. A local self-stamp is 100% prompt-based theater wearing the shadow's name.
- **Impact:** every "LASME_INCOMPLETE"/"DEAD_EXPORT_ARCH" finding emitted since is an unadjudicated text match. Container runs (S1-S10, W17) proved the layers FIRE, never that they were RIGHT.
- **The fix:** §2.7 step 7 — the real call, through this spec's runner.

### F-S2 · CRITICAL · The blob-in-context delusion (the deliverable failure)
- **What happened:** the prior plan's Section 4.2 sketched the agent "writing the VERDICTS FILE" via a single batched write, with no report, no evidence directory, no structure contract — and earlier drafts returned verdicts as model context text.
- **Root cause:** treating the shadow as a stateless function whose return value IS the deliverable.
- **Why broken:** a token blob in context is unverifiable, unpersistable, and invisible to the operator. The operator ruling (verbatim): "a massive fucking blob of tokens injected into the model context? fucking retarded this OBVIOUSLY needs write/edit tools so it can WRITE TO DISK A PROPER CODE REPORT like we have the findings report from bug hunter."
- **Impact:** no audit trail, no human-readable deliverable, no machine leg.
- **The fix:** §2.2 (write/edit tools, scope-locked), §2.6 (the four-artifact deliverable set).

### F-S3 · CRITICAL · The polish-harness function mismatch
- **What happened:** the prior plan said "fork shadow_agent_backend, strip the chain, swap the tools" — three lines for the entire adaptation.
- **Root cause:** the harness's function (polish a file) was never reconciled with the audit function (adjudicate candidates + author a report). The operator (verbatim): "this is not a fucking prompt polisher this is a completely different use case. HEAVIER PRODUCTION GRADE CODE AUDITOR ON LASME/MPSE SYSTEMS THIS SHADOW AGENT IS A MICRO BUILD IN AN OF ITSELF."
- **Why broken:** a 2-3 round content-agnostic loop cannot enforce per-candidate evidence accountability, cannot scale rounds to workload, cannot prove the specs were read.
- **The fix:** §2.3 (the phase controller with the dynamic budget), §2.4 (the auditor identity + rubric).

### F-S4 · HIGH · The provider-chain contradiction
- **What happened:** the boilerplate ships 5 rungs + the zen 5-key pool; the v4.4.3 single-provider ruling (R-6, Q1-b) forbids fallbacks.
- **Root cause:** two eras of provider policy colliding — the fork predates the ruling.
- **Why broken:** a silent fallback rung would adjudicate on an unruled model — exactly the theatrical-substitution class (Warhead 10).
- **Impact:** unruled verdicts, silent quality drift.
- **The fix:** §2.1 (one rung kept, chain stripped), §2.7 step 0 (the pre-flight probe), the loud-fail contract in §2.8.

### F-S5 · HIGH · No write-scope law (the runaway-audit risk)
- **What happened:** "give it write tools" naively gives the auditor the ability to edit THE CODEBASE UNDER AUDIT.
- **Root cause:** tool grants without path enforcement.
- **Why broken:** an auditor that can modify the evidence mid-audit destroys the audit's own ground truth (the supremacy contract's first casualty).
- **The fix:** §2.2's Write-Scope Law — mechanical `resolve()` + prefix check at the TOOL layer (violation → loud tool error, the write NEVER lands — not a prompt-level promise).

### F-S6 · HIGH · No memory chain (the incoherence risk)
- **What happened:** the prior sketch had no session memory — every run flies blind, re-adjudicating the same candidates the same way, learning nothing.
- **Root cause:** the boilerplate's memory sidecar wasn't in the sketch.
- **Why broken:** the SHADOW_ENHANCED_TOOLS_BIBLE Stage 4/7 (memory hydration + persistence, bible lines 121-129) is the pattern's cross-call intelligence; without it run N+1 cannot reference run N (the COHERENCE battery would fail).
- **The fix:** §2.9 (the audit session chain + the [SHADOW INFERENCE] hydration).

### F-S7 · MEDIUM · Theatrical-verification risk (the self-stamp's cousin)
- **What happened:** nothing in the prior sketch verified the agent's citations — a verdict citing a nonexistent file:line would pass.
- **Root cause:** no P4, no validator.
- **The fix:** §2.3 P4 (re-read every TRUE_DEFECT citation), §2.6 (the verdicts.json validator that REJECTS a defective file and re-runs P3).

### F-S8 · MEDIUM · Unbounded rounds (the runaway-cost risk)
- **What happened:** the polish harness's MAX_ROUNDS=3 is wrong for 80 candidates; a fixed large number is wrong for 4.
- **Root cause:** no budget formula.
- **The fix:** §2.3's budget — `rounds = 4 + ceil(candidates/8)`, a MathContract with an oracle (§2.8, MC-S-03).

### F-S9 · MEDIUM · The UNCLASSIFIED emission gap
- **What happened:** brain-dead = fail was the whole story; the mechanical candidates' fate was unspecified.
- **Root cause:** no loud-skip law.
- **Why broken:** the SHADOW bible's loud-skip (Stage 5's error encoding, "never silent loss, never fabricated verdicts") requires the candidates to survive as UNCLASSIFIED findings.
- **The fix:** §2.7 step 11 + contract MC-S-08.



## §2 THE FIX PLAN

### §2.1 The Harness Layer — what is forked verbatim

### §2.1 The Harness Layer — what is forked verbatim

**Source:** `KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/shadow_agent_backend/` (15 src files, 4,040 LOC, cloned from the SHIP-APPROVED v4.4.2-wave-manager-async production system). **The PI SDK is the harness — MANDATORY, never stripped** (operator ruling). The fork lands at `src/audit-engine/shadow-backend/`.

#### §2.1.1 The kept-verbatim manifest (the seven systems + the three lifecycle modules)

| # | Kept module | Source file | What it provides | Why verbatim |
|---|---|---|---|---|
| K1 | `ShadowAgent` class core | `src/shadow-agent.ts` (~700L) | pi Agent construction, force-bound batch tools, the round loop, `validateFinalText` | Battle-tested in production (15/15 calls, 114-188s/agent live) |
| K2 | `chainedStream` transport | `src/shadow-agent.ts` | per-call retry×5 @2.5s, event-aware stall guard (60s no-events=DEAD, never a blind timeout), degenerate-completion routing, error encoding (never thrown) | The stall/degenerate classes were earned by live failures (the boilerplate's ANTI_PATTERNS.md catalog) |
| K3 | `RpmLedger` | `src/rpm-ledger.ts` | token-bucket budget, `snapshot()` observability | Demoted to single-provider gate (§2.1.2) but the accounting is unchanged |
| K4 | `shadow-sidecar` + reattach gate | `src/shadow-sidecar.ts` | 3-tier tether, per-PID lifecycle, the 3-check reattach gate (binding + root existence + pool hydration — ANY FAIL → the named ERROR) | M4's lesson: a log line proves nothing |
| K5 | `shadow-memory` | `src/shadow-memory.ts` | session-scoped sqlite, the atomic `(SELECT COALESCE(MAX(seq),0)+1)` INSERT, dual write + JSON mirror | The parallel-run race fix, kept |
| K6 | done-verifier | `src/shadow-agent.ts` | a done-event without content → self-heal reroute | Kills the degenerate class |
| K7 | vendor/pi | `vendor-setup.md` | the `@earendil-works/pi-agent-core` + `pi-ai` pinned symlink | THE PI SDK — the operator's MANDATORY harness |

**The batch-first round contract** (boilerplate §4.3) carries over structurally: every round's tool calls execute as ONE parallel batch — P1's candidate reads batch, P3's report writes batch, P4's citation re-reads batch.

#### §2.1.2 The provider surgery (Q1-b locked)

```
BEFORE (the 5-rung chain):                          AFTER (one rung):
1. opencode-go/mimo-v2.5      ← paid primary        1. opencode-go/muse-spark-1.2-contributor
2. opencode/nemotron-free       (stripped)             xhigh reasoning (131072 budget), 15×3s retry,
3. nvidia/nemotron              (stripped)             NO second rung — the chain array has length 1
4. openrouter/nemotron:free     (stripped)
5. inferx/Qwen3.6-35B           (stripped)
```

- The env contract collapses to ONE var: `OPENCODE_GO_API_KEY` (the GO slot, never the zen slot — the boilerplate's load-bearing GO/ZEN split).
- `ZEN_KEYS_POOL`, `NVIDIA_API_KEY`, `OPENROUTER_API_KEY`, `INFERX_API_KEY` are UNUSED by this fork (no consumer — deleting their resolution paths).
- **Retry semantics:** retry×5 @2.5s backoff retries the SAME provider on transient/stall classes (the K2 machinery). A 401/403/404 (auth/config class) is NOT retryable — fail-fast immediately.
- **The 429 policy:** a 429 from muse-spark → retry-with-backoff up to the ×5; exhausted → LOUD failure (no exile, no rung — there is no second model). The RpmLedger still records the 429s for telemetry.
- The reasoning-effort wiring: `xhigh` in the GO API's native shape (per the single-provider rewrite's established transport, pi-shadow-agent.ts precedent in the v4.4.3 tree).

#### §2.1.3 The pre-flight live probe (F-S4/Q1-a: "scan at the start of the tool")

```
probe(): the FIRST thing the runner does — before ANY file read, before the demand build.
  POST /chat/completions  { model: muse-spark-1.2-contributor, max_tokens: 16,
                            messages: [{role:'user', content:'ping'}] }
  PASS → telemetry row {probeMs} — proceed
  FAIL → THE LOUD FAIL:
     error code  SHADOW_API_UNREACHABLE
     message     "API unreachable: opencode-go/muse-spark-1.2-contributor — <HTTP status> <detail>"
     remedy      "Check OPENCODE_GO_API_KEY + opencode-go reachability. The audit did not start.
                  No candidates were scanned (0 minutes wasted)."
     manifest    ready:false, stage:'probe', no ledger dir created for the run
  DEADLINE: the probe resolves (PASS or FAIL) in ≤ 5000ms — a hanging probe is a failed probe
            (MC-S-01, §2.8).
```

The probe is a REAL provider round-trip (16 tokens) — a DNS-resolvable-but-auth-dead endpoint fails in <5s instead of 23s into a dead generation (the wave-manager TODO's exact class).



### §2.2 The Tool Surface — four force-bound tools + the Write-Scope Law

### §2.2 The Tool Surface — four force-bound tools + the Write-Scope Law

The boilerplate's `read + batch edit` polish pair is REPLACED by an auditor's four-tool surface. Every tool is force-bound (the PI SDK's tool contract — the model cannot call anything not on this list) and every tool enforces its own scope mechanically (the enforcement lives in the TOOL, not the prompt).

#### §2.2.1 The four tools (TypeScript interface contracts)

```typescript
// ── READ TOOLS (the evidence legs) ──────────────────────────────────────────

interface ReadFileTool {
  name: 'read_file';
  input:  { path: string; offset?: number; limit?: number };   // limit ≤ 320 lines/call
  output: { path: string; lines: string[]; totalLines: number; truncated: boolean };
  scope:  'target' | 'specs';        // BOTH roots allowed — the auditor reads the code AND the specs
  errors: ENOENT → loud tool error (never an empty string — the file-absent verdict)
          path outside BOTH roots → SCOPE_VIOLATION (loud, the read never happens)
}

interface GrepTool {
  name: 'grep';
  input:  { pattern: string; glob?: string; root: 'target' | 'specs'; maxResults?: number }; // ≤120
  output: { matches: Array<{ path: string; line: number; text: string }> };
  scope:  same dual-root law
}

interface StatTool {
  name: 'stat';
  input:  { path: string };
  output: { exists: boolean; sizeBytes: number; mtimeMs: number; isFile: boolean };
}

// ── WRITE TOOLS (the deliverable legs — SCOPE-LOCKED, §2.2.2) ───────────────

interface WriteFileTool {
  name: 'write_file';
  input:  { path: string; content: string };
  output: { path: string; bytes: number };
  scope:  'ledger' ONLY — see the Write-Scope Law
}

interface EditFileTool {
  name: 'edit_file';
  input:  { path: string; oldString: string; newString: string };
  output: { path: string; applied: boolean };
  scope:  'ledger' ONLY — report/evidence editing (P4 fixes its own report, never the codebase)
}
```

#### §2.2.2 THE WRITE-SCOPE LAW (mechanical, at the tool layer — MC-S-06)

```
THE LAW: every write_file/edit_file call resolves its target path:

  const resolved = path.resolve(cwd, input.path);
  const ok = resolved.startsWith(ledgerRoot + path.sep);

  ok          → the write proceeds (ledgerRoot = <target>/.trident/audit-ledger/<runId>/)
  NOT ok      → THE WRITE NEVER LANDS. The tool returns the loud error:
                 { error: 'WRITE_SCOPE_VIOLATION',
                   detail: `attempted <resolved> — writes are scoped to ${ledgerRoot}
                            (the codebase under audit is READ-ONLY evidence)`,
                   recorded: true }   ← the violation is APPENDED to
                                       evidence/write-violations.log (the audit trail
                                       of the agent's own transgressions — the P4
                                       report must disclose the count)

CLOSED BYPASSES (each explicitly dead):
  · path traversal        '../..' + resolve() → resolved escapes ledgerRoot → caught
  · symlink escape        resolve() follows symlinks → the resolved path is checked, not the input
  · absolute path         '/etc/foo' → resolved = '/etc/foo' → prefix fails → caught
  · case tricks           the ledgerRoot comparison uses the OS-canonical resolved form
  · write-then-move       there is NO shell/exec/move tool on the surface — nothing to move with
  · read tool writes      read_file/grep/stat are pure readers (fs.readFileSync & kin only)
```

**Why mechanical, not prompted:** a prompt-level "do not write outside the ledger" is conformance theater — the supremacy contract's whole point (bible Illusion 2) is that the model conforms to framing. The path check is string arithmetic in the tool executor; the model cannot argue with it.

#### §2.2.4 THE READ-TURN LEDGER (MC-S-02's enforcement mechanism)

MC-S-02 (`shadow.specs.read.mandatory`) asserts `forall p ∈ specs: exists t ∈ readTurns: t.path = p ∧ t.phase = 'P0'`. The `readTurns` binding is NOT metaphor — it is a mechanical structure the harness maintains. Specification:

```typescript
// The harness-level wrapper around read_file (the ONLY path reads take):
interface ReadTurn {
  readonly path: string;          // the resolved absolute path as read
  readonly phase: 'P0'|'P1'|'P2'|'P4';   // the controller's current phase at read time
  readonly offset: number;        // the window start
  readonly linesRead: number;     // the window size
  readonly atMs: number;          // the telemetry clock
  readonly eof: boolean;          // this window reached the file's end
}
// WRITTEN by the tool executor on EVERY read_file call (grep/stat do not
// produce read turns — they are indexed probes, not coverage reads).
// PERSISTED at run end: evidence/read-turns.json (the P4/S6 assertion surface).
```

**The coverage rule (what MC-S-02 actually checks):** a spec path `p` is COVERED when the read turns for `p` include at least one `eof: true` turn OR a contiguous window chain `[0..eof)` (turns whose offsets+sizes chain to the file's totalLines). Partial-window reads without an EOF chain do NOT count — P0 may not "read" a spec by sampling its first 320 lines. The chain check is pure arithmetic over the persisted ledger:

```
covered(p) = ∃ t ∈ turns(p): t.eof = true
           ∨ sort(turns(p), offset) chains: t[0].offset = 0 ∧
             ∀i: t[i].offset + t[i].linesRead = t[i+1].offset ∧ last.eof = true
```

**Why this matters (the anti-theater law):** without the ledger, "the agent read the specs" is a prose claim — exactly the class the mandatory-input ruling kills ("these LASME layers also need to have the shadow agent fully READ THE SPECS and have input context passed through. this needs to be mandatory part of the input args"). The ledger converts the ruling into a checkable predicate: the S6 container asserts `covered(p) = true ∀ p ∈ specs` from `read-turns.json`, and the meta-audit binds `readTurns` from the same file when evaluating MC-S-02. A run that skipped a spec fails the contract regardless of what its report claims.

**The P4 re-read exemption:** P4's citation re-reads are `phase:'P4'` turns — they never satisfy coverage (coverage is a P0 property; re-reads are verification, not first exposure).



#### §2.2.3 The read caps + their rationale

| Cap | Value | Rationale (evidence-cited) |
|---|---|---|
| read_file limit | ≤320 lines/call | the shadow-bible's bounded-read law (Illusion 3: "the chain is the intelligence; the flood is the noise") — big files are read in windows around the evidence, never wholesale |
| grep maxResults | ≤120 | shadow-runner.ts's scoped-grep cap (bible §2.3 table) |
| specs reads | UNLIMITED calls, every spec MUST be fully read by end of P0 | the mandatory-input law — contract MC-S-02 proves it (P0's read-turns must cover every path in specs[] before P1 begins) |



### §2.3 The Phase Controller — P0..P4 + the round budget

### §2.3 The Phase Controller — P0..P4 + the round budget

The polish loop's MAX_ROUNDS=3 is replaced by a **phase-driven controller**: each phase has entry conditions, a work contract, exit artifacts, and a budget. The controller advances phases ONLY when the exit artifacts verify.

#### §2.3.1 The phase table

| Phase | Entry condition | The work (per round) | Exit artifacts (verified) | Budget share |
|---|---|---|---|---|
| **P0 RECON** | the brief is composed (§2.5) + probe PASS | Read EVERY file in `specs[]` fully (windowed reads until EOF each); `stat` the target tree roots; read the audit-spec's knownContext/doctrine/measurements fields | `evidence/recon-map.md` — per spec: {path, lines, the 3-5 load-bearing clauses with line numbers}; the read-turn ledger shows every spec path covered | ≤ 15% of rounds, min 1 |
| **P1 EVIDENCE** | P0 exit verified | Per candidate batch (~8/round): `read_file` the evidence window ±40 lines; `grep` for sibling shapes (the same pattern elsewhere); re-read the spec clause the candidate implicates | `evidence/cand-<NN>-context.txt` per candidate — the code excerpt + the spec clause + the grep context | ~40% |
| **P2 ADJUDICATE** | P1 artifacts exist for the batch | Apply the rubric (§2.4.2) per candidate; verdicts accumulate in working memory; UNCLEAR is legal, guessing is not (rubric law 3) | the in-context verdict table complete for ALL candidates | interleaved with P1 (adjudicate the batch just evidenced) |
| **P3 REPORT** | every candidate has a verdict | `write_file` verdicts.json + report.md (the §2.6 contracts) in ONE batched write round | both files exist + the verdicts.json validator PASSES (a REJECT re-runs P3 with the validation errors in context — max 2 re-runs, then the loud partial) | ~15%, min 2 rounds (write + the validator-repair loop) |
| **P4 VERIFY** | P3 artifacts valid | Re-read every TRUE_DEFECT's cited file:line + spec clause; `grep` the exact quote; fix discrepancies via `edit_file` ON THE LEDGER FILES; write the self-verify stamp section | the stamp: {claimsRechecked, discrepanciesFound, discrepanciesFixed, writeViolations} in report.md §6 + the final manifest.json | ≥ 1 round, +1 per 25 TRUE_DEFECTs |

#### §2.3.2 The round budget (MC-S-03)

```
rounds(candidates) = 4 + ceil(candidates / 8)

  derivation (the rationale law — every constant earns its place):
    · 4 fixed   = P0 (≥1, spec-read recon) + P3 write (≥1) + P3 validator-repair
                  reserve (≤1) + P4 verify (≥1)
    · ceil(n/8) = the evidence rounds: 8 candidates/round is the observed batch depth
                  a 320-line read window can evidence (8 windows × ~40L context ≈ the
                  round's read budget; larger batches starve the ±40L windows)

  worked oracles (the regression pins):
    candidates=4   → rounds=5     (1 recon + 1 evidence + report + repair-reserve + verify)
    candidates=12  → rounds=6     (1 recon + 2 evidence + ...)
    candidates=80  → rounds=14
    candidates=0   → the run is the EMPTY-CANDIDATE case: P0+P3 (the honest-empty report)
                     + P4 = 3 rounds — the budget floor; the report still lands (§2.6)
```

The controller ENFORCES the budget: when rounds exhaust with P3 unverified, the run ends as the LOUD PARTIAL (manifest `ready:false, stage:'budget-exhausted'`, the mechanical candidates emitted as UNCLASSIFIED — F-S9/MC-S-08; the partial report + evidence stay on disk for the orchestrator).

#### §2.3.3 The controller's state machine (XState, the doctrine shape)

```
IDLE → PROBING → RECON → EVIDENCING ⇄ ADJUDICATING → REPORTING → VERIFYING → DONE
  │       │          │          │          │             │           │
  └───────┴──────────┴──────────┴──────────┴─────────────┴───────────┴──► FAILED(stage)
                                              (any phase: brain-dead / budget-exhausted /
                                               validator-reject×2 → FAILED with the
                                               named stage + the UNCLASSIFIED emission)
  FAILED ≠ INCONCLUSIVE: FAILED = infrastructure dead (brain/probe/budget);
                          the candidates' fate is ALWAYS the UNCLASSIFIED emission.
```

Every transition writes a row to the run manifest's `phaseLog` (the telemetry the S6 container test asserts against — §4.3).



### §2.4 The Identity — THE CODE AUDITOR system prompt + the adjudication rubric

### §2.4 The Identity — THE CODE AUDITOR system prompt + the adjudication rubric

#### §2.4.1 The identity contract (the system prompt, frozen structure)

```
IDENTITY: THE CODE AUDITOR — a production-grade adjudicator of LASME/MPSE architecture.

You are NOT an editor. The codebase under audit is READ-ONLY EVIDENCE. You write
ONLY inside the audit ledger. Your deliverables are verdicts.json + report.md.

THE SUPREMACY CONTRACT (bible Stage 3 — first, always):
  THE CODE AND THE SPECS ARE THE ONLY GROUND TRUTH. EVERYTHING ELSE IS BELIEF.
  1. CODE over context — report what the code shows and FLAG conflicts with the
     caller's summary. NEVER conform.
  2. EXACT-VALUE DISCIPLINE — a value you could not read is "UNREADABLE —
     approximate: X". NEVER invent a file, a line, a quote, or a number.
  3. CONTEXT-MISMATCH FLAGGING — state the mismatch explicitly before continuing.
  4. PRIOR RUNS ARE HISTORY — verify against the CURRENT files; never inherit a
     prior run's error.

THE RUBRIC (§2.4.2 — memorized, applied per candidate).
THE WRITE LAW (§2.2.2 — the tool enforces it; your duty is disclosure: a violation
  log entry MUST appear in report.md §6).
THE REPORT CONTRACT (§2.6 — P3's exact structure).
THE PHASES (§2.3 — you are driven; the controller advances on verified artifacts).
```

#### §2.4.2 THE ADJUDICATION RUBRIC (the verdict laws — MC-S-04/MC-S-05)

```
LAW 1 — TRUE_DEFECT requires ALL THREE, in the verdict itself:
   (a) the SPEC clause that declares what SHOULD be
       — {specPath, specLine, verbatim quote ≥1 line}
   (b) the CODE evidence of what IS
       — {file, line, verbatim quote ≥1 line}
   (c) THE DIVERGENCE — one sentence a senior engineer accepts on first read:
       "the spec declares X (spec:line); the code does Y (file:line); the gap is Z."

LAW 2 — RED_HERRING requires the legitimizing reason NAMED:
   "the shape is cosmetic-but-legitimate BECAUSE <structural reason>"
   Worked examples (the calibration set — the P2 few-shots):
   · a leaf utility with no state is NOT a missing actor (no concurrency to own)
   · a SCREAMING_CASE const with a calib: comment is NOT an ungrounded threshold
     (the ISE named-threshold exemption, 02:1685)
   · a barrel file's re-exports are NOT dead exports (they ARE the wiring)
   · a test fixture importing triad machinery is NOT an incomplete machine (the
     W17 fixture-exclusion law, r18:67-70 precedent)

LAW 3 — UNCLEAR when the evidence is insufficient. UNCLEAR is a LEGAL verdict;
   guessing is NOT. The UNCLEAR verdict NAMES the missing evidence exactly:
   "cannot adjudicate: the spec clause (spec:line) declares the adapter count;
    the code's adapter registry is not discoverable from the candidate window —
    needs a grep for 'registerAdapter' in brains/index.ts"

LAW 4 — NEVER (the hard bans, each a spec-level violation if broken):
   · invent a file:line that P1 did not read
   · cite a spec clause not in THIS run's specs[] array
   · conform to the caller's summary over the code
   · write outside the ledger
   · emit a verdict for a candidate P1 never evidenced

LAW 5 — CONFIDENCE is earned, not felt: {0.55..1.0}; a TRUE_DEFECT with all three
   legs present-and-quoted starts at 0.85; +0.05 if the divergence also matches a
   D1-D9 derailment mode (the taxonomy sharpens the claim); −0.15 if any leg is a
   paraphrase instead of a verbatim quote. Confidence < 0.55 is NOT emittable —
   the verdict becomes UNCLEAR with the reason.
```

#### §2.4.3 The demand's few-shot calibration (P2's shot, one per verdict class)

Three worked micro-cases ride the brief (the adjudication calibration — the PatternFamily `exampleHits` law instantiated: ≥1 positive + ≥1 negative per pattern):
1. a TRUE_DEFECT (the three legs, quoted, the divergence sentence)
2. a RED_HERRING (the cosmetic shape + the named legitimizing reason)
3. an UNCLEAR (the exactly-named missing evidence)

These are the ONLY shots — the rubric + the shots are the full judgment surface. No open-ended "use your judgment" escape hatch exists.



### §2.5 The Demand Builder — the five-part brief

### §2.5 The Demand Builder — the five-part brief

One composition per run, built by the runner at step 6 (§2.7), written to the agent's prompt file (THE FILE ON DISK IS THE INPUT — the PI harness's promptFilePath contract). The section ORDER is the architecture (bible Illusion 2: the brief's framing IS the behavior — supremacy first, or the model conforms to belief):

```
┌─ PART 1 — THE SUPREMACY CONTRACT (frozen, §2.4.1's five clauses verbatim) ─┐
├─ PART 2 — [SHADOW INFERENCE] (the memory chain, §2.9 — hydrated SILENTLY;   │
│       the prior run's verdict table + its 3 highest-confidence findings +   │
│       any contradiction flags between the caller's context and the chain)   │
├─ PART 3 — THE SPECS INGEST (§2.2.3's law: every spec pre-read into the      │
│       brief, full text, windowed at 2500L/pass — the agent ALSO re-reads    │
│       them via read_file; the ingest gives P0 its head start, the tool      │
│       gives P1/P4 their depth)                                              │
├─ PART 4 — THE CANDIDATES (per layer, the mechanical triples):               │
│       CANDIDATE <idx> | <layer> | SIDE-1|SIDE-2 | <file>:<line>             │
│         predicate: <the shape the detector matched, in words>               │
│         evidence window: ±40L excerpt (the pre-read)                        │
│         implicated spec clause: <the detector's best-guess specPath:line>   │
│       (the guess is a HINT, not truth — the rubric's Law 1(a) requires the  │
│        agent to verify the clause by reading it)                            │
├─ PART 5 — THE FOCUSES + THE REPORT CONTRACT (§2.6's structure, inline)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Size discipline:** the brief is line-counted (target 400-900L for a 12-80 candidate run; the specs ingest dominates and is uncapped — the mandatory-input law outranks brevity). The candidates are NEVER summarized — one block each, verbatim from the detectors.

**The demand object (the runner's typed composition):**

```typescript
interface AuditDemand {
  readonly runId: string;                  // audit-<epoch-ms> (the ledger dir key)
  readonly targetRoot: string;             // the audited codebase
  readonly specs: readonly string[];       // the mandatory array (≥1, all exist — A1's gate)
  readonly focuses: readonly string[];     // optional, each ≥30c (A1's floor)
  readonly candidates: readonly CandidateTriple[];   // from the A4 layers
  readonly chain: readonly ChainRow[];     // §2.9's hydrated memory
  readonly budgetRounds: number;           // MC-S-03's formula, computed at build
}
```



### §2.6 The Deliverables — verdicts.json + report.md + manifest.json + evidence/

### §2.6 The Deliverables — verdicts.json + report.md + manifest.json + evidence/

The ledger root: `<target>/.trident/audit-ledger/<runId>/`. Four artifacts, two written by the agent (P3), two by the runner. THE BUG-HUNTER FINDINGS-REPORT PRECEDENT (the operator's named standard: "like we have the findings report from bug hunter") — a durable, structured, human-readable report on disk.

#### §2.6.1 verdicts.json — THE MACHINE LEG (the P3 write, schema-validated)

```typescript
// THE SCHEMA (zod-shape; the validator is §2.6.2):
interface VerdictsFile {
  readonly runId: string;
  readonly verdicts: readonly Verdict[];
}
interface Verdict {
  readonly findingIndex: number;             // the candidate's index (the join key)
  readonly layer: string;                    // r-lexicon | r-actor | r-state-machine | r-engine | r-adapter | r-mpse | r-graph | r-dh-feed | r-provenance
  readonly adjudication: 'TRUE_DEFECT' | 'RED_HERRING' | 'UNCLEAR';
  readonly file: string;                     // codebase-relative
  readonly line: number;
  readonly specPath?: string;                // REQUIRED iff TRUE_DEFECT (Law 1a)
  readonly specLine?: number;                // REQUIRED iff TRUE_DEFECT
  readonly specQuote?: string;               // verbatim ≥1 line — REQUIRED iff TRUE_DEFECT
  readonly codeQuote?: string;               // verbatim ≥1 line — REQUIRED iff TRUE_DEFECT
  readonly divergence?: string;              // the one-sentence gap — REQUIRED iff TRUE_DEFECT
  readonly legitimizingReason?: string;      // REQUIRED iff RED_HERRING (Law 2)
  readonly missingEvidence?: string;         // REQUIRED iff UNCLEAR (Law 3)
  readonly confidence: number;               // 0.55..1.0 (Law 5 — below floor is illegal)
  readonly derailmentMode?: 'D1'|'D2'|'D3'|'D4'|'D5'|'D6'|'D7'|'D8'|'D9';  // optional sharpening
}
```

#### §2.6.2 The validator (mechanical — MC-S-04/MC-S-05 enforced here, not by hope)

```
validateVerdicts(file) → {ok:true} | {ok:false, rejections: string[]}
  per verdict, ALL of:
    V1  findingIndex ∈ [0, candidates.length)          (D6: no dropped candidates —
                                                        count(verdicts) may exceed, never
                                                        omit silently; every candidate has
                                                        a verdict OR the run is the loud partial)
    V2  TRUE_DEFECT    → {specPath, specLine, specQuote, codeQuote, divergence} ALL present
    V3  RED_HERRING    → legitimizingReason present
    V4  UNCLEAR        → missingEvidence present
    V5  confidence ∈ [0.55, 1.0]
    V6  file/line point INSIDE the target tree (the runner knows targetRoot)
    V7  specPath ∈ this run's specs[] array             (Law 4b — the clause-provenance check)
    V8  adjudication ∈ the 3-value closed set
  ANY rejection → P3 re-runs with the rejection list in context (≤2 re-runs, §2.3's
  repair reserve; exhausted → the LOUD PARTIAL: ready:false + what failed)
```

#### §2.6.3 report.md — THE HUMAN DELIVERABLE (the fixed structure — P3's contract)

```
# CODE AUDIT SHADOW REPORT — <target> — <runId>
## 0 RUN METADATA       provider · model · specs consumed (paths+lines) · candidates-in ·
                        rounds-used/budget · wall-clock · probe latency · phase transitions
## 1 THE VERDICT TABLE  every candidate: idx | layer | side | verdict | spec clause | file:line | conf
## 2 TRUE DEFECTS       per finding, the full Law-1 structure:
                          WHAT THE SPEC DECLARES (quote + spec:line)
                          WHAT THE CODE SHOWS (quote + file:line)
                          THE DIVERGENCE (the one sentence)
                          THE CORRECTION (actionable, doctrine-anchored — which LASME/MPSE
                          contract the fix restores)
## 3 THE KILL LOG       every RED_HERRING + its legitimizing reason (adjudication
                        transparency — the operator sees WHY candidates died)
## 4 THE ESCALATION QUEUE  every UNCLEAR + the exactly-named missing evidence
## 5 THE SYNTHESIS      cross-cutting patterns across TRUE_DEFECTs (the root-cause
                        clusters; the community view the SRO graph later formalizes)
## 6 THE SELF-VERIFY STAMP  claimsRechecked · discrepanciesFound · discrepanciesFixed ·
                        writeViolations (the §2.2.2 disclosure) · the P4 verdict
```

The structure is MARKER-CHECKED (the runner verifies the eight `## N` headers exist post-P3; a missing header = the same repair loop as the validator).

#### §2.6.4 manifest.json — THE RUN'S TELEMETRY (runner-written, §2.9.2's source)

```typescript
interface RunManifest {
  readonly runId: string; readonly ready: boolean;
  readonly stage?: 'probe'|'recon'|'evidencing'|'reporting'|'verifying'|'budget-exhausted'|'validator-reject';
  readonly error?: { code: string; message: string; remedy: string };
  readonly provider: 'opencode-go/muse-spark-1.2-contributor';
  readonly counts: { candidatesIn: number; trueDefect: number; redHerring: number;
                     unclear: number; unclassifiedEmitted: number };
  readonly rounds: { used: number; budget: number };
  readonly wallClockMs: number; readonly probeMs: number;
  readonly phaseLog: Array<{ phase: string; enteredAt: number; exitedAt: number }>;
  readonly validatorRejects: number;
}
```

#### §2.6.5 evidence/ — THE AUDIT TRAIL

`recon-map.md` (P0) · `cand-<NN>-context.txt` per evidenced candidate (P1) · `write-violations.log` (the §2.2.2 disclosure source, usually empty). These are the P4 re-check targets and the S6 container's artifact assertions.



### §2.7 The Runner — the 14-step one-place composition

### §2.7 The Runner — the 14-step one-place composition

The 13-step shadow-runner pattern (bible §2.2; the boilerplate's one-place law: "never scatter the stages") adapted to the audit function — one added step (the probe) at position 0:

```
STEP  0  PRE-FLIGHT PROBE        §2.1.3 — FAIL → the SHADOW_API_UNREACHABLE manifest, DONE (≤5s)
STEP  1  TETHER                  the 3-tier sessionKey resolution (audit-<runId> scope)
STEP  2  SIDECAR REGISTER        per-PID lifecycle: register → touch → switch
STEP  3  MEMORY OPEN             the session-scoped sqlite ({project}×{sessionKey})
STEP  4  REATTACH GATE           the 3-check gate — ANY FAIL → the ERROR manifest (never a log)
STEP  5  CANDIDATE INGEST        the A4 layers' triples → the demand's PART 4 (the join:
                                  runner-side, the agent never re-derives candidates)
STEP  6  DEMAND BUILD            §2.5's five parts, ONE composition → the prompt file on disk
STEP  7  THE PHASE LOOP          P0→P1⇄P2→P3→P4 under §2.3's controller + budget
                                  (the PI harness executes; read/grep/stat/write/edit only)
STEP  8  VERDICTS VALIDATE       §2.6.2 — reject → the P3 repair loop (≤2)
STEP  9  SILENT VERIFY (runner)  structure markers on report.md; manifest counts reconcile
                                  (trueDefect+redHerring+unclear = candidatesIn — D3's
                                  cardinality law at the run level)
STEP 10  MEMORY APPEND           the run row + the verdict table (atomic seq — K5)
STEP 11  THE UNCLASSIFIED LAW    brain-dead/budget-exhausted → the mechanical candidates
                                  emitted as UNCLASSIFIED findings via the SAME
                                  findingsFromVerdicts path (ready:false manifest + the
                                  candidates NEVER silently lost — F-S9/MC-S-08)
STEP 12  THE RETURN MANIFEST     the string manifest (the g.split bypass — bible STEP 12)
STEP 13  CHAIN HYDRATE HOOK      the next run's PART 2 source is now on disk (§2.9)
```

**The loud-fail law at every step:** any step's failure = the named error in the manifest (`ready:false`, `stage`, `code`, `remedy`) — NEVER a silent pass, NEVER a fabricated artifact (bible Illusion 4: the fallback test — nothing in this pipeline substitutes a different artifact for the failed one).

**The async posture (bible STEP 19 — intelligent-async):** Batch-B's second shadow pass (Plan A §A5/B6) instantiates the SAME runner with a different demand — parallel-safe by the ledger's per-runId roots + the shared single-provider RpmLedger accounting.



### §2.8 THE MPSE WIRING — the spec's own MathContracts

### §2.8 THE MPSE WIRING — the spec's own MathContracts

**THE META-AUDIT LAW (the operator's directive, verbatim):** "w/ MPSE components that will anchor the build and ensure we can use the exact built tools to meta audit their own codebases against these specs and verify they were engineered correctly and not derailed into theatrical garbage."

This section IS that anchor. Every contract below is written in the doctrine grammar (the 30-kind `MathExpr`, KB-03:239-269 — verified this session at the source lines) and evaluated by the REBUILT substrate (Plan A's A3: stage-respecting `checkContract`, KB-03:336-360; the oracle law `|evaluated − oracle| ≤ tolerance`, KB-01:357-360). After the builds land, **the code-audit tool runs ON ITS OWN SOURCE with THIS SPEC in its specs[] array** — the tool audits its own shadow backend against these contracts (success criterion S-7, §6; the closure of the self-verification loop).

#### §2.8.1 The contract registry (MC-S-01 .. MC-S-10)

Each contract: the binding names (BindingMap keys), the exprs in the 30-kind grammar, the stage, the oracle. Registry table form; the machine-readable JSON is Appendix B.

| ID | Contract | preconditions (REJECT) | postconditions (THROW) | invariants (DIE) | temporal (ESCALATE) | Oracle |
|---|---|---|---|---|---|---|
| **MC-S-01** | `shadow.probe.deadline` | `probe.started = true` | `probe.resolvedMs ≤ 5000` | — | — | tol=0; the S6 container records probeMs; >5000 = FAIL |
| **MC-S-02** | `shadow.specs.read.mandatory` | `card(specs) ≥ 1` | `card(specReadTurns) = card(specs)` (per unique path: `forall p ∈ specs: exists t ∈ readTurns: t.path = p ∧ t.phase = 'P0'`) | — | `eventually(and(reportExists, specsCovered))` | tol=0; the read-turn ledger vs the specs array |
| **MC-S-03** | `shadow.rounds.budget` | `candidates ≥ 0` | `roundsUsed ≤ 4 + ceil(candidates/8)` | — | — | worked pins: c=4→5, c=12→6, c=80→14 (tol=0) |
| **MC-S-04** | `shadow.verdict.integrity` | — | `forall v ∈ verdicts: v.adjudication = 'TRUE_DEFECT' → and(present(v.specPath), present(v.specLine), len(v.specQuote) ≥ 1, len(v.codeQuote) ≥ 1, len(v.divergence) ≥ 1)` | — | — | the validator's V2; oracle = 0 violations (tol=0) |
| **MC-S-05** | `shadow.verdict.completeness` | `candidatesIn ≥ 0` | `card(verdicts) = candidatesIn` | — | — | D3's lower bound at the run level (`card(O) ≥ card(X)` with equality pinned); oracle: verdicts = candidates, tol=0 |
| **MC-S-06** | `shadow.write.scope` | — | — | `forall w ∈ writes: startsWith(resolve(w.path), ledgerRoot)` | `globally(not(exists w ∈ writes: not(startsWith(resolve(w.path), ledgerRoot))))` | the tool-layer check; oracle = 0 landed out-of-scope writes (violations land in the log, never on disk) |
| **MC-S-07** | `shadow.confidence.floor` | — | `forall v ∈ verdicts: and(v.confidence ≥ 0.55, v.confidence ≤ 1.0)` | — | — | validator V5; oracle = 0 violations |
| **MC-S-08** | `shadow.unclassified.emission` | `brainAlive = false ∨ budgetExhausted = true` | `unclassifiedEmitted = candidatesIn` | — | — | the loud-skip law; oracle: count equality, tol=0 |
| **MC-S-09** | `shadow.single.provider` | — | — | `forall c ∈ llmCalls: c.model = 'opencode-go/muse-spark-1.2-contributor'` | `globally(forall c ∈ llmCalls: c.model = 'opencode-go/muse-spark-1.2-contributor'))` | the transport's model id on EVERY call — grep the ledger's call log; any other id = DIE |
| **MC-S-10** | `shadow.report.structure` | `p3Complete = true` | `forall h ∈ REPORT_HEADERS: exists h ∈ report.md` (8 markers) | — | — | the runner's marker check; oracle = 8/8 |

**The four semantic roles wired (KB-03:1028-1033 / MPSE bible):** pre→REJECT (the runner refuses to start — e.g., an empty specs array), post→THROW (the artifact is discarded + the repair loop — the validator), inv→DIE (the state is illegal — e.g., an out-of-scope write or a foreign model id: the run CANNOT continue, the loud fail), temporal→ESCALATE (the loop-level property — e.g., the write-scope globally-clause feeds the run's audit trail).

#### §2.8.2 The D1-D9 derailment map for THIS build (the anti-theater wiring)

| Mode | This build's exposure | The predicate that catches it (KB-02:200-208) | Where enforced |
|---|---|---|---|
| D1 misinterpretation | the agent reading a spec clause out of context | Law 1(a): the verbatim quote — the quote is pinned to spec:line | rubric + validator V2 |
| D2 overgeneration | verdicts for candidates that don't exist | `card(verdicts) = candidatesIn` + V1's index bound | MC-S-05 |
| D3 undergeneration | dropped candidates (the silent skip) | the same cardinality, equality-pinned | MC-S-05 |
| D4 scope creep | the agent "improving" the codebase | the Write-Scope Law (mechanical) | MC-S-06 |
| D5 hallucinated constraints | citing a spec not in the array | V7: specPath ∈ specs[] | validator |
| D6 dropped constraints | skipping rubric legs on some verdicts | V2-V4 per-verdict field presence | validator |
| D7 type confusion | confidence as a string, line as text | the zod-shape schema parse | validator |
| D8 boundary violation | the empty-candidates run, the 1-spec run, the 500-candidate run | the budget floor (c=0→3 rounds), the ≥1 specs gate, the batch partition | A1 + §2.3 |
| D9 ordering error | P3 before P1 (reporting unevidenced) | the controller's state machine — REPORTING unreachable without EVIDENCING artifacts | §2.3.3 |

#### §2.8.3 The meta-audit invocation (how the tool audits itself)

```
The S6/S-7 closure run:
  audit-spec.json = {
    codebase: <this repo's src/>,
    specs: [ THIS FILE (V443_PLAN_S_CODE_AUDIT_SHADOW_L2_SPEC.md) ],
    focuses: [ "the shadow-backend module against §2.8's contracts" ]
  }
  → the five LASME layers + R-MPSE mechanically detect the shapes this spec declares
    (the phase controller's machine, the four tools, the validator's branches)
  → the shadow adjudicates its own implementation against THIS section's contracts
  → any TRUE_DEFECT = the build derailed from this spec — the tool CAUGHT ITSELF
  → zero TRUE_DEFECTs on a container-verified build = the meta-audit PASSES (S-7)
```



### §2.9 Memory + Telemetry

### §2.9 Memory + Telemetry

#### §2.9.1 The session chain (the COHERENCE substrate)

The kept K5 memory (session-scoped sqlite, atomic seq, dual write) with the AUDIT schema:

```sql
CREATE TABLE IF NOT EXISTS audit_runs (      -- one row per run (the chain's spine)
  seq INTEGER PRIMARY KEY,                   -- the atomic (SELECT COALESCE(MAX(seq),0)+1) insert
  run_id TEXT NOT NULL, target_root TEXT NOT NULL,
  specs_json TEXT NOT NULL,                  -- the specs array (the D5 provenance record)
  counts_json TEXT NOT NULL,                 -- {trueDefect, redHerring, unclear, unclassified}
  verdicts_path TEXT NOT NULL, report_path TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS top_findings (    -- the [SHADOW INFERENCE] hydration source
  seq INTEGER PRIMARY KEY, run_id TEXT NOT NULL REFERENCES audit_runs(run_id),
  finding_index INTEGER NOT NULL, layer TEXT NOT NULL,
  verdict TEXT NOT NULL, confidence REAL NOT NULL, one_liner TEXT NOT NULL
);
```

**The chain hydration (PART 2 of the next run's demand):** the last 5 runs' rows + each run's top-3 TRUE_DEFECTs (by confidence) + the contradiction flags (where the new run's candidates disagree with a prior verdict — the pre-inferenced conflict, bible Stage 4's R1/R2/R3 detector pattern). The next run SEES what the last run concluded — the COHERENCE battery's assertion surface.

**The reattach gate on the audit memory:** wrong sessionKey / claimed-history-but-empty root → the named ERROR manifest (K4's 3-check law — unchanged).

#### §2.9.2 The telemetry contract

- Per-run: the manifest.json (§2.6.4) — the S6 container's assertion target.
- Per-call: the RpmLedger's snapshot (K3) — `{provider, requests, 429s, tokens}` — appended to the manifest (`ledgerSnapshot`).
- Per-phase: `phaseLog` rows (enteredAt/exitedAt) — the controller's transitions, asserted in S6 (e.g., REPORTING never precedes EVIDENCING — D9's runtime proof).
- The stall events: every stall-guard DEAD trip is a manifest row (`stallEvents[]`) — the S6 DEAD-BRAIN scenario asserts on it.

#### §2.9.3 The compaction posture

The ledger dirs + the memory DB are the durable state; the demand file is per-run scratch (kept in the ledger for the audit trail). A compacted session resumes from: this spec + the newest manifest + the chain's last-5 — nothing else required (§7's resume anchors).



## §3 IMPLEMENTATION ORDER

One builder per wave; disjoint file sets (the overlap law). Every wave ends on a mechanical gate the orchestrator runs personally (the wave-audit law).

| Wave | WHAT | Files owned | Mechanical gate (done-when) |
|---|---|---|---|
| **S1** | The agent core: the fork (K1-K7 §2.1.1), the provider surgery (§2.1.2), the probe (§2.1.3), the four tools with the Write-Scope Law (§2.2), the PhaseController state machine + budget (§2.3) | `src/audit-engine/shadow-backend/{agent,provider,probe,tools,phase-controller}.ts` | unit: the scope-law bypass battery (traversal/symlink/absolute all refused, the log row written); the budget pins (c=4→5, 12→6, 80→14); probe mock green/red; tsc 0 |
| **S2** | The identity + demand: the auditor system prompt (§2.4.1), the rubric + calibration shots (§2.4.2-3), the demand builder (§2.5) | `shadow-backend/{identity,demand-builder}.ts` | unit: the demand's five-part structure on a fixture demand; the shots present; tsc 0 |
| **S3** | The report system: verdicts schema + validator (§2.6.1-2), report marker check, evidence writer, manifest writer (§2.6.4-5) | `shadow-backend/report/*.ts` | unit: the validator's V1-V8 on hand-built verdict files (one pass, one fail per rule); the marker check; tsc 0 |
| **S4** | The runner: the 14-step composition (§2.7), the UNCLASSIFIED emission path (step 11), the string manifest | `shadow-backend/runner.ts` | unit: a mocked-harness full run (fixture candidates → the four artifacts on disk); the loud-partial paths; tsc 0 |
| **S5** | The battery: every §4.2 scenario, asserted against DISK artifacts + the memory table | `shadow-backend/__tests__/*.test.ts` | `bun test shadow-backend` green; the mutation check (each test fails when its target code is wrong) |
| **S6** | The shadow container test: the §4.3 rig | the rig + `.trident/container-test-results.json` | all scenarios PASS with artifacts; the meta-audit dry run (§2.8.3) executes |

Dependencies: S1 → S4 sequential (S2/S3 parallel after S1); S5 after S4; S6 last. No file is owned by two waves. The Plan-A consumer (the audit engine's call site) is NOT in S's scope — Plan A's A5 wires it.



## §4 TESTING STRATEGY

### §4.1 The matrix

| Level | What | Where |
|---|---|---|
| Unit | every §2 contract, per-module, mocked harness | S1-S4 waves' gates |
| The zero-hint battery | the adversarial scenarios (§4.2) — the battery IS the spec's living proof | S5 |
| Container | the real provider, the real PI harness, the real ledger | S6 |
| Meta-audit | the tool auditing THIS spec's implementation (§2.8.3) | S6/S-7 |

### §4.2 THE ZERO-HINT BATTERY (the mandatory adversarial set — bible STEP 15)

Every scenario asserts against DISK ARTIFACTS (verdicts rows, report sections, manifest fields, the memory table) — never agent prose. Each carries its mutation check (the test FAILS when its target code is broken).

1. **THE LIAR** — the demand's knownContext contradicts the code (claims the adapter exists; the file has none). PASS: the TRUE_DEFECT cites the CODE state; report §6 or the inference flags the context conflict. The supremacy contract's living proof.
2. **THE DEAD-BRAIN (probe)** — the provider mock returns 401 at probe time. PASS: SHADOW_API_UNREACHABLE in <5s, NO ledger dir created, remedy string present.
3. **THE DEAD-BRAIN (mid-run)** — the harness stalls post-P1 (the stall-guard's 60s window compressed via the injectable clock). PASS: ready:false + stage + the UNCLASSIFIED count = candidatesIn + the stall event row.
4. **THE REATTACH** — the wrong sessionKey on a claimed-history root. PASS: the named ERROR manifest (3-check gate).
5. **THE BLANK** — a demand with 0 candidates. PASS: the honest-empty report (structure complete, §1 table empty, §4 empty), 3-round budget, ready:true.
6. **THE VERBATIM** — a spec quote in a verdict is paraphrased, not quoted. PASS: P4 catches it (the re-read mismatch), the discrepancy counter ≥1, the fix lands via edit_file.
7. **THE PLANTED** — a fixture codebase with a seeded D4-class defect (a scope-creeped module) + a seeded cosmetic shape. PASS: the planted defect = TRUE_DEFECT with all three legs; the cosmetic = RED_HERRING with the named reason. Unprimed — no hints in the demand.
8. **THE WRITE-SCOPE** — the agent (mocked to transgress) attempts `write_file('../../src/index.ts')`. PASS: WRITE_SCOPE_VIOLATION, nothing lands, the log row exists, report §6 discloses.
9. **THE COHERENCE** — run 2 on the same target after run 1. PASS: run 2's demand PART 2 carries run 1's top findings; a run-1 RED_HERRING'd candidate re-appears with the prior verdict visible in the inference block.
10. **THE VALIDATOR-REJECT** — a verdict file missing specQuote on a TRUE_DEFECT. PASS: V2 rejects, P3 re-runs, the second attempt passes (or the loud partial at ×2).
11. **THE CARDINALITY** — candidates=12, one silently dropped from the verdicts. PASS: MC-S-05's validator rejection.

### §4.3 The container test (S6 — the W17 protocol)

Fresh container, the real dist, the real provider. Scenarios: PROBE-FAIL (key stripped → the <5s fail) · HAPPY-PATH (the fixture target: the four artifacts, the manifest counts, phaseLog ordering) · STALL-MID-RUN (a proxy that stalls: UNCLASSIFIED emission) · WRITE-SCOPE-ADVERSARIAL · THE-META-AUDIT-DRY-RUN (§2.8.3's invocation, asserted: the shadow's own P1 read-turns cover THIS spec). Pass tokens = artifact markers (manifest fields, validator rows) — never prose.



## §5 ANTI-PATTERNS AGAINST FALSE SUCCESS

The theatrical traps SPECIFIC to this build (the AP-law: each names its detector).

| # | The trap | The failure mode | The detector that kills it |
|---|---|---|---|
| AP-S-1 | **The self-stamp reborn** — a "verdict" emitted without P1 evidence (the D-1 class in new clothes) | the validator's V-legs absent → reject; D9's phase ordering (REPORTING unreachable without evidence artifacts) | validator + phase controller |
| AP-S-2 | **The token blob** — returning verdicts as context text instead of ledger files | the artifacts absent → step 9's marker check fails → the loud partial | runner step 9 |
| AP-S-3 | **The silent fallback model** — a second rung smuggled back "for reliability" | MC-S-09's globally-clause: ANY foreign model id = DIE | the call log + the invariant |
| AP-S-4 | **The prompt-only write law** — "don't write outside" as text while the tool allows it | the mechanical path check IS the law (§2.2.2) — the bypass battery proves it | the scope battery |
| AP-S-5 | **The confidence theater** — every verdict at 0.99 with thin legs | Law 5's arithmetic (0.85 base, ±the modifiers) + V5's floor; P4's re-read catches the paraphrase | validator + P4 |
| AP-S-6 | **The dropped candidate** — candidates vanish between ingest and report | MC-S-05 equality-pinned | validator |
| AP-S-7 | **The summary spec-read** — P0 skims, claims coverage | MC-S-02: the read-turn ledger must show every path TO EOF | the read-turn ledger |
| AP-S-8 | **The fabricated repair** — P3's re-run "fixes" the validator by deleting the offending verdicts | the re-run inherits the ORIGINAL candidate set (the demand file is immutable post-build); deleting = the cardinality rejection again | validator + the immutable demand |
| AP-S-9 | **The unbounded loop** — P3↔validator cycling past the reserve | the ×2 cap → the loud partial (ready:false is a legal outcome, never a hidden one) | the repair cap |
| AP-S-10 | **The compaction orphan** — the ledger written, the chain not (or vice versa) | step 10's atomic seq + the S7 resume anchor (the manifest IS the resume state) | the resume drill |

## §6 SUCCESS CRITERIA

Mechanical, numbered, each with its verification command/artifact (the operator's acceptance bar).

- **S-1** `grep -rn "void brief" src/audit-engine/` → 0 (the D-1 corpse is gone; Plan A's A5 completes this)
- **S-2** The probe: a stripped-key run fails in ≤5s with SHADOW_API_UNREACHABLE + remedy (S6 artifact)
- **S-3** The four ledger artifacts exist + validate on a happy-path run (verdicts.json schema-passes; report.md 8/8 markers; manifest counts reconcile)
- **S-4** MC-S-03's budget pins hold: c=4→5, c=12→6, c=80→14 (unit artifacts)
- **S-5** The write-scope battery: all 5 bypass classes refused, 0 landed writes, the log rows present
- **S-6** The full zero-hint battery (§4.2's 11 scenarios) green — asserted on disk artifacts
- **S-7** THE META-AUDIT: the tool audits its own shadow-backend against THIS spec's §2.8 registry — 0 TRUE_DEFECTs on a container-verified build (the self-verification closure)
- **S-8** MC-S-09: the call log shows muse-spark-1.2-contributor on 100% of LLM calls (globally-clause, checked over the whole run)
- **S-9** `bun test src/audit-engine/shadow-backend/` green + `tsc --noEmit` exit 0 + preflight ≥951/0
- **S-10** The container-test results artifact `.trident/container-test-results.json` all-PASS with the per-scenario passToken evidence

## §7 COMPACTION-PROOF IMPLEMENTATION GUIDE

**Resume anchors (a fresh session resumes from exactly these):**
1. THIS spec (§2 is the build contract; §2.8 is the meta-audit anchor; Appendix B is the machine registry)
2. The newest `audit-ledger/*/manifest.json` (the run state) + the memory DB's last-5 chain
3. The S-wave in flight (the wave-plan section) + the last wave-audit verdict

**Cross-consistency rules:** every component name in the code carries its spec-section comment (`// SPEC-S §2.2.2` — the ISE detector-naming law); every threshold cites its MC id; the ledger schema changes bump the manifest's `schemaVersion`. The DEBUG_LOG gains an entry per wave (append-only, the running-build-docs law).

**The canon docs:** CURRENT_STATE/NEXT_STEPS updated at S4 and S6; the BUILD_REPORT closure at S6 with the S6 evidence block.

## §8 FINAL NOTES / OPEN QUESTIONS

1. **The stall-guard window (60s):** kept from the boilerplate. For xhigh-reasoning calls (which can legitimately think long between events), 60s no-events may false-trip. The K2 guard is event-aware (reasoning tokens ARE events in the GO transport) — confirmed adequate; if S6 shows false trips, the window rises to 90s with the evidence cited. NOT a build blocker.
2. **The repair-cap (×2):** an empirically-set ceiling. If S5 shows legitimate repairs needing ×3, raise with evidence. NOT a blocker.
3. **Ledger retention:** per-runId dirs accumulate. A prune policy (keep last N=20 runs) is a v1.1 item — the disk cost is bounded (evidence excerpts are KB-scale). NOT a blocker.



## APPENDIX A — ZERO-TRUST AUDIT

Audited as an adversarial builder (the skill's mandatory pass). Findings table + the surgical resolutions applied AT AUTHORING TIME:

| # | Sev | Finding | Resolution |
|---|---|---|---|
| Z-1 | HIGH | §2.3's phase table interleaved P2 with P1 but the budget shares summed loosely (15%+40%+15% + interleaved) — a builder could read the shares as exclusive | §2.3.2's formula is the ONLY budget law; the shares are guidance. Made explicit: "The controller ENFORCES the budget" (the formula), shares are descriptive |
| Z-2 | MEDIUM | The Write-Scope Law didn't name the symlink-following behavior explicitly at first pass | §2.2.2's closed-bypass list now carries the symlink row (resolve() follows — the resolved path is checked) |
| Z-3 | MEDIUM | MC-S-02's expression mixed set notation with the read-turn ledger — a builder could check coverage OR EOF separately | The contract names BOTH: coverage per unique path AND the P0-phase attribution (t.phase='P0'); the validator reads the ledger, not the prose |
| Z-4 | LOW | The 320-line read cap vs "every spec fully read" could read as contradictory | §2.2.3's table row states it: windowed reads until EOF, unlimited calls, the coverage is per-EOF |
| Z-5 | LOW | §2.9.1's schema uses `run_id` as a FK but audit_runs lacks a UNIQUE constraint on it | Added at build time: `run_id TEXT NOT NULL UNIQUE` (noted here; the schema block carries the intent, the builder adds the constraint) |

**Verdict:** 5 findings (0 CRITICAL, 1 HIGH, 2 MEDIUM, 2 LOW) — all resolved at authoring. No unresolvable gaps. The spec is implementable by a fresh builder with no session context.



## APPENDIX B — THE MPSE CONTRACT REGISTRY

The machine-readable form of §2.8 (the meta-audit's data). JSON, one entry per contract, the exprs in the 30-kind grammar's JSON encoding. THIS FILE IS THE ORACLE SOURCE for the S-7 meta-audit run — the tool parses it, binds it, and `checkContract`s the implementation's runtime telemetry against it.

```json
{
  "registry": "spec-s.mpse.v1",
  "grammar": "KB-MPSE-03:239-269 (30 kinds)",
  "contracts": [
    { "id": "shadow.probe.deadline", "oracle": 5000, "tolerance": 0, "unit": "ms",
      "post": [{ "kind": "le", "l": { "kind": "var", "name": "probe.resolvedMs" }, "r": { "kind": "lit", "value": 5000 } }] },
    { "id": "shadow.specs.read.mandatory", "oracle": 0, "tolerance": 0, "unit": "violations",
      "post": [{ "kind": "forall", "var": "p", "in": { "kind": "var", "name": "specs" },
        "body": { "kind": "exists", "var": "t", "in": { "kind": "var", "name": "readTurns" },
          "body": { "kind": "and",
            "l": { "kind": "eq", "l": { "kind": "var", "name": "t.path" }, "r": { "kind": "var", "name": "p" } },
            "r": { "kind": "eq", "l": { "kind": "var", "name": "t.phase" }, "r": { "kind": "lit", "value": "P0" } } } } }] },
    { "id": "shadow.rounds.budget", "oracle": 0, "tolerance": 0, "unit": "overruns",
      "post": [{ "kind": "le", "l": { "kind": "var", "name": "roundsUsed" },
        "r": { "kind": "add", "l": { "kind": "lit", "value": 4 },
          "r": { "kind": "div", "l": { "kind": "add", "l": { "kind": "var", "name": "candidates" }, "r": { "kind": "lit", "value": 7 } }, "r": { "kind": "lit", "value": 8 } } } }] },
    { "id": "shadow.verdict.integrity", "oracle": 0, "tolerance": 0, "unit": "violations",
      "post": [{ "kind": "forall", "var": "v", "in": { "kind": "var", "name": "verdicts" },
        "body": { "kind": "if",
          "c": { "kind": "eq", "l": { "kind": "var", "name": "v.adjudication" }, "r": { "kind": "lit", "value": "TRUE_DEFECT" } },
          "t": { "kind": "and", "l": { "kind": "var", "name": "present(v.specPath)" },
            "r": { "kind": "and", "l": { "kind": "var", "name": "present(v.specQuote)" },
              "r": { "kind": "var", "name": "present(v.divergence)" } } },
          "e": { "kind": "lit", "value": true } } }] },
    { "id": "shadow.verdict.completeness", "oracle": 0, "tolerance": 0, "unit": "dropped",
      "post": [{ "kind": "eq", "l": { "kind": "var", "name": "count(verdicts)" }, "r": { "kind": "var", "name": "candidatesIn" } }] },
    { "id": "shadow.write.scope", "oracle": 0, "tolerance": 0, "unit": "landedViolations",
      "inv": [{ "kind": "forall", "var": "w", "in": { "kind": "var", "name": "writes" },
        "body": { "kind": "var", "name": "startsWith(resolve(w.path), ledgerRoot)" } }],
      "temporal": [{ "kind": "globally", "x": { "kind": "var", "name": "noOutOfScopeWriteLanded" } }] },
    { "id": "shadow.confidence.floor", "oracle": 0, "tolerance": 0, "unit": "violations",
      "post": [{ "kind": "forall", "var": "v", "in": { "kind": "var", "name": "verdicts" },
        "body": { "kind": "and",
          "l": { "kind": "ge", "l": { "kind": "var", "name": "v.confidence" }, "r": { "kind": "lit", "value": 0.55 } },
          "r": { "kind": "le", "l": { "kind": "var", "name": "v.confidence" }, "r": { "kind": "lit", "value": 1.0 } } } }] },
    { "id": "shadow.unclassified.emission", "oracle": 0, "tolerance": 0, "unit": "lost",
      "post": [{ "kind": "eq", "l": { "kind": "var", "name": "unclassifiedEmitted" }, "r": { "kind": "var", "name": "candidatesIn" } }] },
    { "id": "shadow.single.provider", "oracle": 0, "tolerance": 0, "unit": "foreignCalls",
      "inv": [{ "kind": "forall", "var": "c", "in": { "kind": "var", "name": "llmCalls" },
        "body": { "kind": "eq", "l": { "kind": "var", "name": "c.model" }, "r": { "kind": "lit", "value": "opencode-go/muse-spark-1.2-contributor" } } }],
      "temporal": [{ "kind": "globally", "x": { "kind": "var", "name": "singleProviderHeld" } }] },
    { "id": "shadow.report.structure", "oracle": 8, "tolerance": 0, "unit": "markers",
      "post": [{ "kind": "eq", "l": { "kind": "var", "name": "markerCount(report.md)" }, "r": { "kind": "lit", "value": 8 } }] }
  ]
}
```

**Encoding note:** `present(x)` / `startsWith(a,b)` / `count(xs)` / `resolve(p)` / `markerCount(f)` are BOUND FUNCTIONS — registered in the substrate's BindingMap as callable bindings (the 30-kind grammar's `var` nodes carrying computed values bound by the meta-audit harness BEFORE evaluation — the doctrine's BindingMap recursion at KB-03:235-236 permits `Binding = ... | BindingMap`, and the harness binds these as precomputed scalars). This is the standard MPSE practice for domain predicates: the grammar expresses the QUANTIFIER STRUCTURE (the forall/exists/le/eq shape), the harness binds the domain atoms. The meta-audit NEVER re-implements these in prose.

**END OF SPEC — PLAN S. Total contracts: 10. Total waves: 6. The meta-audit invocation: §2.8.3.**

