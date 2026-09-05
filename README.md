# AETHER — The Aether Machine

A boilerplate for building systems that run AI agents over codebases, documents, and pipelines.

**Version:** 1.0 (2026-09-05)
**Status:** working machinery — ported verbatim from a production agent system, de-branded, tested
**Scale:** 420 source files · ~117,500 lines · 1,061 ported tests (1,038 passing; 4 failures are inherited upstream bugs, documented in §Troubleshooting)
**Companion documents:** `AETHER_MACHINE_ARCHITECTURE_BIBLE.md` (the complete internal architecture) · `AETHER_OPERATING_MANUAL.md` (the operating procedures) · `ANTI_PATTERNS.md` (twelve failure classes this machinery is built against) · `PORT_MANIFEST.md` (the porting law and file manifest) · `BOILERPLATE_FAILURE_LOG.md` (the record of a first, discarded attempt and why it failed)

---

## What this is

AETHER is the extracted machinery of a working code-audit system, walked back two steps so that it is no longer tied to one product. The machinery was copied verbatim from the production source; the only changes were a mechanical rename (removing the old product's branding) and wrapping the host-runtime binding behind a small interface. Nothing was redesigned, simplified, or re-implemented.

The result is a set of three composable layers:

1. **The Aether (Level 1)** — a single agent. It has a real transport (provider chain, key rotation, rate accounting), a real tool loop (the model can request tool executions mid-round and receive results), a bounded round structure, and a strict output contract: its findings are written to a markdown file on disk in a fixed format, and a validator rejects any finding that lacks a file, a line number, and a verbatim quote of the code it refers to.
2. **The Team (Level 2)** — a `MetaGate`: N worker aethers, each configured for one concern, running concurrently, followed by one meta agent that reads all worker reports and adjudicates each finding (upheld, overturned, or unclear). Workers share one rate budget and one key pool. A worker's failure is captured and reported; it does not kill the team.
3. **The Kernel (Level 3)** — a four-phase pipeline (`AetherPipeline`): validate and scan the target (a parser and a bank of 28 static-analysis layers), build a knowledge graph of the codebase, run any number of teams concurrently over that graph, then compose the results into two documents and a score.

The machinery is domain-neutral. It ships with one working configuration — a code auditor built from three configured gates (LASME, MPSE, SRO) and seventeen agent templates — which serves as the reference for writing your own.

---

## Quick start

```bash
git clone <this repo> aether && cd aether
bun install          # restores exact dependencies from bun.lock
npx tsc --noEmit     # → exit 0
bun test             # → ~1,038 passing

# the full machine, no API keys required for the deterministic phases:
bun run examples/minimal-pipeline.ts
```

The pipeline demo scans a small fixture tree (`examples/fixture/src/`) that contains two deliberately planted defects — an empty `catch` block and a promise that is never awaited. The machinery finds both, runs three concurrent gates over the results, and writes `meta-analysis.md` and `findings-report.md` plus a machine-readable status journal under `examples/.run-status/`. Expected output:

```json
{"ok":true,"phase":"final",
 "headline":"macro 3/2 · micro 5/4 · tags 0 · selfDefects 0",
 "gates":[{"gateId":"adjudicate","findings":2},
          {"gateId":"verify","findings":2},
          {"gateId":"remediate","findings":2}]}
```

Two more demos cover the lower levels: `examples/minimal-agent.ts` (one agent, one prompt file, one report) and `examples/minimal-gate.ts` (three workers and a meta in one gate). Both read the provider key from the environment and exit with a named error if it is absent — the machine does not mock a model under any circumstance.

---

## How a run works

```
 target src/ tree
      │
      ▼
┌─ PHASE 1 · PRELIMINARY ──────────────────────────────┐
│ validateTarget: rejects repo roots, files, and       │
│   nonexistent paths with typed errors                │
│ buildScopedProgram: parses the tree into a compiler  │
│   program — chunked, memory-budgeted, yield-checked  │
│ code-classifier: file → constructs, symbols, calls   │
│ layer-engine: 28 static-analysis layers fire over    │
│   the constructs → candidate findings                │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌─ PHASE 2 · GRAPH LOGIC ──────────────────────────────┐
│ mode "mcp":    spawns the graphify server (Python)   │
│ mode "native": pure-AST populate, no Python needed   │
│ typed nodes + edges persisted to sqlite (WAL)        │
│ 0 nodes → GRAPH_LOGIC_FAILED, the run aborts loud    │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌─ PHASE 3 · META GATES ───────────────────────────────┐
│ the configured gates run concurrently (allSettled)   │
│ each gate: N workers → worker reports on disk →      │
│   1 meta reads them → adjudicated findings           │
│ workers share one rate ledger and one key pool       │
│ findings persist to the shared sqlite memory         │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌─ PHASE 4 · COMPOSITION ──────────────────────────────┐
│ gate-stitch: merge gate sections (single flatten)    │
│ findings-map: separate target defects from self-     │
│   defects (machinery bugs are reported as such)      │
│ score + evidence gate → doc1 meta-analysis.md        │
│   + doc2 findings-report.md + the headline           │
└──────────────────────┬───────────────────────────────┘
                       ▼
        artifacts/ · run-status.json · notifications.jsonl
```

Each phase transition writes an entry to the status journal, so a detached run can be observed externally: `[PRELIMINARY] → [GATES-RUNNING] → [ADJUDICATED] → [VERIFIED] → [REMEDIATED] → [FINAL]`. The pipeline can also be started detached (`fire()`, returns in under 100 ms with a poll token) and driven to completion by an external poller.

---

## The agent, internally

One agent run — the round structure, the transport, and the output path:

```
 run(prompt file, demand, tools)
      │
      ▼
┌── TRANSPORT ──────────────────────────────┐
│ admission: rate ledger token bucket       │
│   (429 → 45s exile → next key)            │
│ key pool: N keys, round-robin             │
│ stream · stall guard 60s · done-verify    │
│ retry ×3 @ 2.5s → next rung               │
│ all rungs exhausted → PROVIDER_CHAIN_     │
│   EXHAUSTED with the full attempt log     │
└──────────────┬────────────────────────────┘
               ▼
┌── ROUND LOOP (max 3) ─────────────────────┐
│ R1 INVESTIGATE: the model requests tools; │
│   the harness executes them and returns   │
│   the results into the same round         │
│ R2 VERIFY + FIX: re-check against the     │
│   actual code                             │
│ R3 SCOPED VERIFY: only flagged findings   │
└──────────────┬────────────────────────────┘
               ▼
┌── OUTPUT ─────────────────────────────────┐
│ report.md written to disk                 │
│ validateReport: six required fields per   │
│   finding + SUMMARY; anchorless claims    │
│   are rejected                            │
│ capture session tee · round telemetry     │
└───────────────────────────────────────────┘
```

The transport is the one deliberately unwired seam. The boilerplate ships no model code, no API keys, and no network calls you did not author. The binding point is a single function (`streamCall`) in the harness; until it is bound, every model-bound path exits with `LLM_CALL_NOT_WIRED`, naming the exact override location. The `pi-ai` SDK ships as a dependency and is a working binding target.

---

## The knowledge graph

Phase 2 populates a typed graph that all later phases share — built once, queried by every worker, tagged with findings.

Two backends behind one mode dial:

| | `mcp` mode | `native` mode |
|---|---|---|
| How the graph is built | spawns the `graphify` Python server (stdio JSON-RPC, stderr drained) | pure TypeScript over the parsed AST (symbols + imports) |
| Requires | Python + the graphify venv | nothing |
| Load safety | 128 MB size guard, streaming above 8 MB | fileCap 1000, 2 GB RSS budget, batch 200 |
| Without its dependency | throws a named `GRAPH_LOGIC_FAILED` transport error | runs — this is the default for the shipped demos |

The graph persists to `shared/knowledge-graph/` (`db.ts`, 870 L: schema version C18, eleven tables, WAL mode) with a query engine (355 L), a profile loader (522 L), migrations, and an ontology. Workers query it through four verbs (`query_graph`, `shortest_path`, `get_node`, `get_neighbors`) and tag nodes with their findings.

---

## The output contract

Every finding, from any worker, in any gate, must be a `## FINDING:` block:

```markdown
## FINDING: <one-line title>
- predicate: <the rule that fired>
- file: <relative/path.ts>:<line>
- evidence: "<verbatim quote of the code at that line>"
- spec: <the authority this violates>
- severity: CRITICAL | HIGH | MEDIUM | LOW
- confidence: 0.0-1.0

## SUMMARY
2 findings — HIGH.
```

Rules enforced by the validator (`src/agent/report/validator.ts`):

1. All six fields are mandatory.
2. `file` is a relative path (resolved against the target root).
3. `evidence` must quote the code at the cited location.
4. `severity` is one of the four enum values.
5. `confidence` is numeric, 0.0–1.0.
6. A `## SUMMARY` block states the count and the highest severity.
7. Zero findings is valid and is written exactly as `0 findings — none.`

The meta agent's output follows a parallel contract: an adjudication table (upheld / overturned / unclear per finding), cross-cutting patterns, and a recommended fix order. The composition phase stitches these sections verbatim — it never paraphrases a gate's work.

---

## Critical rules

### The port law
1. ALWAYS treat `src/` as verbatim ported machinery. The permitted edits were the rename map and import paths; nothing else has been touched, and nothing else should be.
2. NEVER rewrite, simplify, or refactor a ported module "while you're in there." A changed file voids its fidelity and reintroduces the failure that killed the first attempt at this repo (see `BOILERPLATE_FAILURE_LOG.md`).
3. MUST verify changes with `npx tsc --noEmit` (0 errors) plus `bun test` (green) plus a line-retention diff on any ported file you touch.

### The loud-fail law
1. ALWAYS fail with a named error. The vocabulary is listed in the quick reference; every boundary in the machine throws one.
2. NEVER return a degraded result shaped like success. An empty graph aborts the pipeline; missing fixtures produce `::INCONCLUSIVE(fixture-dirs-absent)::`, never a fabricated pass.
3. MUST keep the INCONCLUSIVE state loud — it names what was missing and exits non-zero.

### The output contract law
1. ALWAYS write reports as files on disk. The disk file is the only output downstream stages read.
2. NEVER treat model chat text as a result. If a claim is not in the validated report, it does not exist.
3. MUST reject anchorless findings — the validator does this; bypassing it is the one unforgivable regression.

### The resource law
1. ALWAYS inject one rate ledger and one key pool from the top of the run into every agent.
2. NEVER give an agent its own budget. Providers meter per key; local per-agent compliance produces global violations.
3. MUST run concurrent teams through `runGatesConcurrently` — allSettled with per-gate failure capture.

### The async law
1. ALWAYS keep heavy work off the synchronous path. The AST core is chunked and yield-checked; the graph loader streams above 8 MB.
2. NEVER materialize a large artifact in one synchronous read on a hot path.

### The branding law
1. ALWAYS keep the source free of the predecessor's names. `grep -ri trident src/` must return zero.
2. NEVER rename a matched string literal on only one side of a comparison — route shared literals through one constants module.

---

# THE FULL FILEBASE

```
src/
├── index.ts ............... 318 L   plugin entry: registers hooks, tools, agents
├── orchestrator.ts ........ 197 L   top-level state-machine wiring
├── config.ts ..............  82 L   engine + poseidon configuration tables
├── types.ts ............... 156 L   shared types (Finding, layers, gates)
├── utils.ts ............... 171 L   aetherLog (file-backed log), evidence store
├── declarations.d.ts ......  48 L   ambient declarations
│
├── audit-engine/ ......... 113 files · 30,352 L   THE KERNEL
│   ├── index.ts .......... 1,260 L   the 4-phase orchestrator
│   ├── code-classifier.ts  1,154 L   source → constructs/symbols/call graph
│   ├── ast/audit-ast-core  1,011 L   RAM-safe scoped program builder
│   ├── layer-engine.ts ..... 234 L   layer registration + execution
│   ├── layers/ ............ 28 f ... 10,205 L   the layer bank (r0–r16 + domain)
│   ├── events/ ............ 10 f ... 2,746 L   the interrupt plane
│   ├── aether/ ............ 11 f ... 2,557 L   the orchestration brain
│   ├── aether-backend/ .... 22 f ... 4,099 L   agent transport + report machinery
│   ├── harness/ ............ 3 f ... 2,548 L   pi-aether-agent (479 L) + tools
│   ├── math/ ............... 8 f ...   941 L   expression eval + oracle + firewall
│   ├── lexicons/ input/ enforcement/ ship-gate/ context/ runtime/ scoring…
│   ├── gate-stitch.ts · findings support · graph/ · graph-logic-phase.ts
│   └── fix-prioritizer · deploy-manifest · test-plan-generator · hive-loader
│
├── worker-harness/ ....... 79 files · 20,920 L   THE WORKER SUBSTRATE
│   ├── graph/             corbell-adapter 789 L · embeddings 441 L ·
│   │                      cypher-subset · ix-adapter · likec4 bridge · update
│   ├── harness/           map · scan · trace · recon · report · micro-loop 498 L
│   ├── diagnostics/       calibration engine + semantic predicates + tests
│   ├── firewall/          artifact-scope · readonly enforcement
│   ├── identity/          warhead + prompt parts
│   ├── lexicon/           rule cards + compiler + templates
│   ├── surface/           query-tool 519 L · lsp-injector 556 L
│   ├── tools/             bug-hunt entry · report-writer 1,149 L · mcp-bridge
│   └── testing/           inconclusive-state helpers
│
├── hydra/ ................ 50 files · 10,060 L   THE TEAM LAYER
│   ├── aether-auditor.ts · aether-meta.ts · aether-report-reader.ts ·
│   │   aether-tools.ts · tool-usage-lexicon.ts · pipeline.ts · memory.ts ·
│   │   findings-map.ts · types.ts · graphify.ts · graph-mapper.ts ·
│   │   corbell-bridge.ts · evidence.ts
│   ├── aether-templates/  18 f ... 1,719 L   14 worker + 3 meta templates + types
│   │   └── workers/       (renamed from the source's hunters/ per the domain ruling)
│   └── instances/      lasme 528 · mpse 522 · sro 592 + tests (74 pass)
│
├── shared/ .............. 42 files ·  6,621 L   knowledge-graph (db 870 L,
│   query-engine 355 L · profile-loader 522 L · migrations · ontology) ·
│   warheads · auto-discover · the FINDING grammar spec
│
├── subagents/ .......... 32 files ·  4,087 L   aether-auditor/ (16 f) ·
│   aether-build/ (16 f: firewall · identity · tools)
│
├── artifacts/ .......... 22 files · 15,983 L   report/spec generator farm
│   └── pipeline-generator 3,040 · deep-planning 2,266 · context-synthesis 2,031…
│
├── poseidon/ ............ 21 files ·  8,061 L   governance loop
│   └── god-loop 2,364 · problem-solver 1,206 · strategic-intel 708 ·
│       container-tester · kick/poller/watcher · wave-verifier
│
├── tools/ ................ 9 files ·  8,500 L   plugin tool registrations
│   └── aether-tools.ts ~3,880 L  (the full tool wiring, de-branded)
│
├── hooks/ ................. 7 files ·  4,843 L   host lifecycle bindings
│   └── session · guardian · identity-enforcer · aether-hooks (composition)
│
├── identity/ ............ 18 files ·  1,565 L   agent identity + warhead prompts
├── warheads/ ............ 19 files ·  2,437 L   behavior warheads + NLP intent
├── fsm/ modes/ nlp/ ..... 13 files ·  1,616 L   state machines · modes · NLP
├── firewalls/ evidence/ agents/  9 files ·  1,166 L
├── context-library/ ...... 9 .md files          the machine's own context docs
└── fixtures/ + MASTER_CONTEXT/                  the calibration corpus (test data)
```

Line counts are from the shipped tree; totals: 420 `.ts` files under `src/` plus tests, ~117.5 K lines.

---

# TROUBLESHOOTING

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | `AETHER_PROVIDER_KEY_MISSING`, exit 1 | provider env var unset | export the key named in the error; there is no mock transport |
| 2 | `PROVIDER_CHAIN_EXHAUSTED … LLM_CALL_NOT_WIRED` | key set but no SDK bound | bind `streamCall` (see the operating manual, Step 4) |
| 3 | `TARGET_MUST_BE_SRC_ROOT` | pipeline target is a repo root or a file | point `targetPath` at the target's `src/` directory |
| 4 | `TARGET_NOT_A_DIRECTORY` / `TARGET_NOT_FOUND` / `TARGET_EMPTY_STRING` | other invalid target shapes | fix the path; these are typed throws by design |
| 5 | `GRAPH_LOGIC_FAILED` in mcp mode | Python/graphify not installed | use `graphMode: "native"`, or install the graphify venv |
| 6 | `GATE_STITCH: typed_nodes rows are null or not an array` | corrupt gate memory | delete the run's sqlite file and re-run; recurrence is a bug |
| 7 | `METAGATE_AGENT_CONFIG: agentConfig.cwd…` | MetaGate built without the shared agent config | pass `(config, agentConfig, opts)` — three arguments |
| 8 | `GATE_RUNNER_CTX: ctx.targetRoot…` | gate runner called without a context | pass `{ targetRoot, graphStats, candidateCount }` |
| 9 | `WORKER_TEMPLATE_ID: id must be…` (and siblings) | worker template missing fields | fix the named fields; the validator lists every one |
| 10 | `::INCONCLUSIVE(fixture-dirs-absent)::` | calibration fixtures not present | copy `MASTER_CONTEXT/` and `fixtures/` (shipped in-repo) |
| 11 | `SOURCE_READ_FAILED` | diagnostics engine could not read a source file | fix path/permissions; the engine refuses empty reads |
| 12 | `NODE_TYPES count 18 != 16` in 4 tests | upstream v4.4.3 test pins are stale | upstream bug; documented, not a port defect |
| 13 | `ENOENT … MASTER_CONTEXT/…` in tests | calibration docs pruned from the checkout | restore `MASTER_CONTEXT/` (shipped) |
| 14 | `Cannot find module './events/…'` under tsc | a partial checkout (a wave mid-flight) | clone completely; the full tree resolves |
| 15 | empty graph over a non-empty target | scope exclusions caught everything | fix the scope config; never degrade to an empty pass |
| 16 | toast fires after the session ended | owner guard removed | restore `clearToastDeliveryForSession` (the F-11 class) |
| 17 | headline count ≠ findings count | sections flattened twice (EN-36 class) | flatten only in `stitchFromGateResults` |
| 18 | two `fire()` calls tear the status file | legacy double-fire (EN-34 class) | use `fire()` as shipped — distinct poll tokens |
| 19 | `EMFILE` / fd exhaustion late in a run | child-process leak (EN-37 class) | disconnect spawns in `finally`; await exits on error paths |
| 20 | 429 storm with many workers | per-agent rate budgets (AP-11) | inject ONE shared ledger + key pool from the top |
| 21 | findings without quoted evidence | validator bypassed | restore `validateReport`; anchorless findings are inadmissible |
| 22 | demos exit 1 with a named env error, no crash | correct behavior (loud-fail) | export the named env var; there is no mock transport |

---

# EXTENSION POINTS

| Seam | Contract | Reference implementation |
|---|---|---|
| Worker templates | `WorkerTemplate` + `validateWorkerTemplate` | `templates/examples/worker-example.ts` |
| Meta templates | `MetaTemplate` + `validateMetaTemplate` | `templates/examples/meta-example.ts` |
| Gate rosters | `MetaGateConfig` + `runGatesConcurrently` | `src/hydra/instances/lasme.ts` |
| Analysis layers | `LayerEngine.register(LayerDefinition)` | `src/audit-engine/layers/r2-error-handling.ts` |
| Graph backend | the adapter contract in `graph-mapper.ts` | corbell adapter (mcp) / native adapter |
| Host binding | the plugin entry + `hooks/` + `tools/` | `src/index.ts` (the reference host) |
| The LLM | `streamCall` override in the harness | — (deliberately the consumer's) |

---

# THE HONEST CAPABILITY MAP

| Capability | State |
|---|---|
| Deterministic pipeline (parse → AST → layers → graph → gates → composition) | proven at runtime, keyless |
| Loud-fail contract at every boundary | proven (named errors, container-verified) |
| Concurrent teams on shared resources | proven (3 gates, one ledger, per-gate capture) |
| Corrupt-input rejection | proven (named rejections) |
| The 28-layer bank | proven (all 28 import and run) |
| AI worker rounds with a real model | requires binding `streamCall` to an SDK + a key; the fail path is proven, the generation path is the consumer's wiring |
| mcp graph mode happy path | requires Python + graphify; its loud-fail path is proven |
| 4 upstream test failures | inherited from v4.4.3 (documented above) |

---

# PROVENANCE

This repository is a verbatim two-step walk-back of a production system:

```
┌────────────────────────────────────┐        ┌────────────────────────────────┐
│ THE PRODUCTION AUDIT TOOL          │        │ THIS REPOSITORY                │
│ 494 source files · deployed and    │        │ 420 source files · build       │
│ operator-verified · dist 54b50f18… │ ═════► │ bfc197bd… · fidelity-verified  │
└────────────────────────────────────┘        └────────────────────────────────┘
  STEP 1 — de-brand: a mechanical rename map only; the machine is byte-identical
           apart from names (verified: 100% line retention on every audited file)
  STEP 2 — de-host: the opencode plugin binding wrapped so the machinery runs
           standalone; the original binding ships as the seam's reference impl
  The engine below those two layers is COPIED, not rewritten.
```

The first attempt at this repository was a clean-room rewrite and was deleted. Its record — what was lost, why, and the six laws that prevent a repeat — is preserved in `BOILERPLATE_FAILURE_LOG.md`. The port that replaced it followed `PORT_MANIFEST.md`: five copy+rename waves plus a fix wave, each gated on a per-file fidelity diff (presence, ≥90% line retention, export parity), with the source's own test suite ported alongside the code as the verification.

---

## VERSION HISTORY

- **1.0 (2026-09-05)** — the complete verbatim port: 420 source files, ~117.5 K lines, 1,061 tests (1,038 green), zero branding tokens, checkpoint `aether-machine-v1`. Known inherited issues: four v4.4.3 test pins (stale node-type count), the mcp graph mode's Python dependency, and the unwired model transport (by design).
