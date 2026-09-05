# ⚡ AETHER — The Universal Agent Machine

> **Trigger:** you are about to build ANY system that runs AI agents over code, documents, or pipelines — an auditor, a kernel, a governance loop, a build machine.
> **Duty:** absorb this README + `AETHER_MACHINE_ARCHITECTURE_BIBLE.md`, then operate. A fresh engineer (or agent) with zero prior context can install, run, extend, and ship from this document alone.
> **One-shot protocol:** Read fully. Then build.

**Version:** 1.0 — the verbatim port of a production agent machine
**The proof:** 420 source files · 117K+ lines of working machinery · 1,061 ported tests (1,038 green / 4 upstream) · `tsc` 0 errors · builds to an 18.25 MB bundle
**License of intent:** this is a **functioning machine walked two steps backwards** from a production code-audit tool — de-branded, universalized, and ready to be configured into anything.

---

## THE 30-SECOND PITCH

Most "agent frameworks" give you a loop and a prayer. AETHER gives you the **whole computer**:

```
┌──────────────────────────────────────────────────────────┐
│ THE AETHER COMPUTER                                      │
│                                                          │
│  HOST BINDING   hooks/ + tools/ (pluggable runtime)      │
│  ────────────────────────────────────────────────────    │
│  KERNEL         4-phase engine: PRELIMINARY → GRAPH →    │
│                 META GATES → COMPOSITION (1,260L)        │
│  ────────────────────────────────────────────────────    │
│  PROCESSORS     The Aether agents — each with a real     │
│                 provider chain, key pool, rate ledger,   │
│                 TOOL LOOP, and a report contract that    │
│                 rejects unevidenced claims               │
│  ────────────────────────────────────────────────────    │
│  MEMORY BUS     knowledge graph (sqlite WAL, 11 tables)  │
│                 + corbell embeddings + query engine      │
│  ────────────────────────────────────────────────────    │
│  INTERRUPTS     events plane: sentinels, triage machine, │
│                 observer-enforcer, enforcement planes    │
│  ────────────────────────────────────────────────────    │
│  FIRMWARE       17 worker/meta templates + 3 configured  │
│                 machine instances (LASME/MPSE/SRO)       │
└──────────────────────────────────────────────────────────┘
```

Three composable levels:

| Level | Unit | One-liner |
|---|---|---|
| **L1 — THE AETHER** | one agent | transport + tool loop + rounds + a report contract that rejects unevidenced claims |
| **L2 — THE TEAM** | `MetaGate` | N aethers + 1 meta adjudicator + shared memory, `allSettled`-concurrent |
| **L3 — THE KERNEL** | `AetherPipeline` | a 4-phase cycle over M teams with a graph substrate |

**This is not a framework of interfaces.** It is ~117K lines of working machinery — ported verbatim from a production system — that runs, fails loud, journals everything, and refuses unevidenced claims *structurally*.

---

## QUICKSTART (60 seconds)

```bash
git clone <this repo> aether && cd aether
bun install          # deps: pi-agent-core/pi-ai, zod, xstate, sql.js, wink-nlp…
npx tsc --noEmit     # → 0 errors
bun test             # → 1,038+ pass (the ported production battery)
bun run examples/minimal-pipeline.ts
```

The last command runs the **entire deterministic machine** — parser → AST → layer bank → graph → 3 concurrent gates → composition — over a fixture with planted bugs, **with zero API keys**, and writes two evidence documents plus a run journal:

```
{"ok":true,"phase":"final",
 "headline":"macro 3/2 · micro 5/4 · tags 0 · selfDefects 0",
 "gates":[{"gateId":"adjudicate","findings":2},…]}
```

Then read, in order:
1. `AETHER_OPERATING_MANUAL.md` — how to drive it
2. `AETHER_MACHINE_ARCHITECTURE_BIBLE.md` — how it works inside
3. `ANTI_PATTERNS.md` — the 12 failure classes this machinery exists to kill

---

## THE PIPELINE — one cast, start to finish

```
 you cast a run against a target src/ tree
      │
      ▼
┌─ FETCH · PRELIMINARY ────────────────────────────────┐
│ validateTarget: typed throws on bad roots            │
│ buildScopedProgram: chunked AST — fileCap 1000,      │
│   2GB RSS budget, batch 200, yields (OOM-proof)      │
│ code-classifier (1,154L): file → constructs +        │
│   symbol table + call graph                          │
│ layer-engine fires the LAYER BANK r0→r16:            │
│   build-chain · hooks · errors · state · async ·     │
│   data-flow · theatrical · container · deps ·        │
│   config · runtime · invocation · isolation · CFG…   │
│ → CANDIDATES (findings with evidence triads)         │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌─ DECODE · GRAPH LOGIC ───────────────────────────────┐
│ mode dial: mcp | native                              │
│   mcp:    graphify server (stdio JSON-RPC)           │
│   native: pure-AST populate — zero Python            │
│ knowledge-graph: typed_nodes + typed_edges (WAL)     │
│ 0 nodes → GRAPH_LOGIC_FAILED — loud abort            │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌─ EXECUTE · META GATES ───────────────────────────────┐
│ LASME · MPSE · SRO (or YOUR gates) — allSettled      │
│  each gate = N workers + 1 meta adjudicator          │
│  workers: template prompt + real tools + graph query │
│    → FINDING blocks (6 fields + verbatim quote)      │
│  meta: reads every worker report → adjudicates       │
│    UPHELD / OVERTURNED / UNCLEAR                     │
│  shared: ONE rate ledger + ONE key pool + sqlite     │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌─ WRITEBACK · COMPOSITION ────────────────────────────┐
│ gate-stitch → findings-map (self-defect guard) →     │
│ score → evidence-gate → meta-analysis.md +           │
│ findings-report.md + the one-line headline           │
└──────────────────────┬───────────────────────────────┘
                       ▼
        artifacts/ · run-status.json · journal
              PASS or FAIL — with evidence
```

---

## INSIDE THE AETHER — one processor's anatomy

```
        THE AETHER (one universal agent)
┌───────────────────────────────────────────────┐
│ run(prompt-file, demand, tools)               │
│                                               │
│  ┌── TRANSPORT ─────────────────────────┐    │
│  │ rpm-ledger admission (429→exile)     │    │
│  │ key-pool ×N rotation                 │    │
│  │ stream · stall 60s · done-verify     │    │
│  │ retry ×3 → next rung → LOUD fail     │    │
│  └──────────────┬───────────────────────┘    │
│                 ▼                             │
│  ┌── ROUND LOOP (≤3) ───────────────────┐    │
│  │ R1 investigate (tools fire for real) │    │
│  │ R2 verify + fix                      │    │
│  │ R3 scoped re-verify                  │    │
│  └──────────────┬───────────────────────┘    │
│                 ▼                             │
│  ┌── OUTPUT ────────────────────────────┐    │
│  │ report.md ON DISK (6-field FINDINGs) │    │
│  │ validator rejects anchorless claims  │    │
│  └──────────────────────────────────────┘    │
└───────────────────────────────────────────────┘
  a TEAM = N aethers + 1 meta (allSettled)
  the KERNEL = 4 phases × M teams, shared memory
```

**The output contract** — every finding is a `## FINDING:` block:

```markdown
## FINDING: <one-line title>
- predicate: <the rule that fired>
- file: <relative/path.ts>:<line>
- evidence: "<the verbatim code quote from that line>"
- spec: <the authority this violates>
- severity: CRITICAL | HIGH | MEDIUM | LOW
- confidence: 0.0-1.0

## SUMMARY
2 findings — HIGH.
```

The validator (`src/agent/report/validator.ts`) enforces all six fields plus the verbatim quote. **An anchorless claim is structurally inadmissible.** That single contract is why the machine's output can be trusted without trusting the model.

---

# THE CRITICAL RULES (the iron laws)

### 1A — THE PORT LAW
1. **ALWAYS** treat `src/` as the working machinery — ported verbatim from the production audit tool. The only historical edits: the de-brand rename map + import paths.
2. **NEVER** rewrite, simplify, "modernize," or refactor ported modules. A rewrite voids the file. (The predecessor repo was deleted for exactly this — read `BOILERPLATE_FAILURE_LOG.md` before you doubt it.)
3. **MUST** prove any change with `npx tsc --noEmit` (0 errors) + `bun test` (green) + the per-file line-retention diff when touching ported files.

### 1B — THE LOUD-FAIL LAW
1. **ALWAYS** fail with a NAMED error: `AETHER_PROVIDER_KEY_MISSING`, `PROVIDER_CHAIN_EXHAUSTED`, `LLM_CALL_NOT_WIRED`, `TARGET_NOT_FOUND`, `GRAPH_LOGIC_FAILED`, `GATE_STITCH`, `WORKER_TEMPLATE_*`…
2. **NEVER** return a degraded result shaped like success. 0 graph nodes = `GRAPH_LOGIC_FAILED` abort. Missing fixtures = `::INCONCLUSIVE(fixture-dirs-absent)::`. The machine refuses to guess.
3. **MUST** keep INCONCLUSIVE loud — an inconclusive run prints why, names what was missing, and exits non-zero.

### 1C — THE OUTPUT CONTRACT
1. **ALWAYS** write reports as `.md` files on disk. The file is the output; the model's stream is not.
2. **NEVER** treat agent free text as a finding. If it isn't in the validated report, it doesn't exist.
3. **MUST** reject anchorless claims — the validator does this; do not bypass it.

### 1D — THE RESOURCE LAW
1. **ALWAYS** inject ONE `RpmLedger` + ONE `KeyPool` down through every agent in a run (the fleet shares the provider's per-key metering).
2. **NEVER** give an agent its own budget — per-agent budgets are how 429 storms happen at scale.
3. **MUST** run concurrent gates through `runGatesConcurrently` (allSettled + per-gate capture) — one gate's death never kills a sibling.

### 1E — THE ASYNC LAW
1. **ALWAYS** default to async for heavy work. The AST core is chunked (fileCap 1000, 2GB budget, batch 200, yields between batches) — the EN-38 OOM fix is baked in; keep it baked in.
2. **NEVER** materialize a whole artifact synchronously on a hot path (graph loads carry a 128MB guard with streaming above 8MB).

### 1F — THE BRANDING LAW
1. **ALWAYS** keep `grep -ri "trident" src/` at **0**. The machine is domain-neutral; the names are `aether-*`.
2. **NEVER** rename matched string literals inconsistently — markers and labels route through constants so behavior stays identical under the new name.

---

# CORRECT vs WRONG (the anti-pattern pairs)

### P1 — Porting a file
**WRONG:** "I'll write a cleaner version of this 1,200-line classifier — the interface is clear."
→ The predecessor repo died this way: ~6,300 lines of invention replacing ~117K lines of working machinery. Clean-room code compiles and passes shape checks while missing the entire tool loop, the brain, and the graph engine.
**CORRECT:** `cp` the file. Apply the rename map (`trident→aether`, `hunters→workers`). Fix import paths. **Change nothing else.** Prove it: `wc -l` retention ≥90%, export parity, `diff` shows rename-only deltas.
**Fix when it doesn't compile:** MORE transform (imports, map entries) — never less machinery.

### P2 — A failing dependency
**WRONG:** `catch (e) { console.log("skip"); }` — the swallowed error that turns a broken run into a green run.
**CORRECT:** every catch logs via `aetherLog` **and** recovers or rethrows. The diagnostics engine treats an unreadable source as `SOURCE_READ_FAILED` — a loud, named fail.
**Worked example:** the container gate proved `GATE_STITCH: typed_nodes rows are null or not an array` fires on corrupt memory — corrupt input gets a named rejection, never silent acceptance.

### P3 — Agent output handling
**WRONG:** scraping the model's chat stream for findings — non-reproducible runs, hallucinated defects, adjudication over prose.
**CORRECT:** the agent writes `report.md` to disk → `validateReport` gates the grammar → every downstream stage reads the file. What appears only in free text is circular and fails the gate.

### P4 — Concurrency
**WRONG:** `Promise.all` over N agent dispatches — one rejection kills the wave; per-agent rate budgets cause 429 storms at fleet scale.
**CORRECT:** `runGatesConcurrently` (allSettled + per-gate capture + stagger) with ONE shared `RpmLedger`/`KeyPool` injected top-down. Container-proven: 3 concurrent gates, one ledger, per-gate `status:'failed'` capture, zero cascade.

### P5 — Green checks
**WRONG:** "tsc passes and the file exists — it works." Compilation is not runtime. Existence is not behavior.
**CORRECT:** execution evidence — run the artifact, paste the counts. The port's own gate was execution-class: `bun test` full-suite counts + `tsc` error counts + artifact paths, pasted raw.

### P6 — A "small" fix to ported machinery
**WRONG:** refactoring a ported module "while you're in there" — every drive-by edit is a fidelity break that the next fidelity diff flags as a rewrite.
**CORRECT:** need different behavior? Add a NEW module or configure via the seams (templates, instances, layers, injection points). The machinery gains by configuration, never by mutation.

---

# PROCEDURES (copy-pasteable)

### PR-1 — Install + verify
```bash
git clone <this-repo> aether && cd aether
bun install                 # deps from bun.lock
npx tsc --noEmit; echo $?   # → 0
bun test                    # → ~1,038 pass / 19 skip / 4 upstream fails
```

### PR-2 — Run the three levels
```bash
bun run examples/minimal-pipeline.ts      # L3: full machine, keyless (native graph)
bun run examples/minimal-gate.ts          # L2: one team (loud-fails without a key)
bun run examples/minimal-agent.ts examples/prompt-demo.md   # L1: one agent
```

### PR-3 — Wire your LLM (the one seam)
Open `src/audit-engine/harness/pi-aether-agent.ts`, find `streamCall`, override:
```typescript
streamCall = async (demand: string, systemPrompt: string) => {
  const res = await yourSDK.chat({ system: systemPrompt, user: demand });
  return res.text;
};
```
Then set the provider env (`OPENCODE_GO_API_KEY`-style, per your `ProviderRung.envKey`) and re-run the demos — real rounds, real reports.

### PR-4 — Compose your own worker + gate
1. Copy `templates/examples/worker-example.ts` → your domain (change `id/name/focus/systemPromptSection/demandTemplate`).
2. `validateWorkerTemplate(yours)` — throws at import if malformed.
3. Compose a `MetaGateConfig` with N workers + a meta (copy `examples/minimal-gate.ts`).
4. Run; expect worker reports + the meta adjudication on disk.

### PR-5 — Add an analysis layer
Copy `src/audit-engine/layers/r2-error-handling.ts` as the pattern: a `LayerDefinition` with `PatternFamily` entries — structural AST matchers, evidence triads, `exampleHits`. Register via `LayerEngine` (`src/audit-engine/layer-engine.ts`). Add ≥2 adversarial tests.

### PR-6 — Add a tool
Implement a `ToolSurface` (`name/description/parameters/execute`), register in the agent's tool list (`setTools` / the tools map in `aether-tools.ts`). The round loop executes it and feeds the result back — telemetry counts it.

### PR-7 — Detached run + poll
```typescript
const h = pipeline.fire();           // returns <100ms with pollToken
// later: readDetachedStatus(h.statusPath)
```

---

# TROUBLESHOOTING MATRIX

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | `AETHER_PROVIDER_KEY_MISSING` exit 1 | provider env var unset | export the key (the demos name the exact var); no mock transport exists |
| 2 | `PROVIDER_CHAIN_EXHAUSTED … LLM_CALL_NOT_WIRED` | key set, SDK not bound | override `streamCall` (PR-3) |
| 3 | `TARGET_MUST_BE_SRC_ROOT` | pipeline target is a repo root or file | point `targetPath` at the `src/` tree |
| 4 | `TARGET_NOT_A_DIRECTORY` / `TARGET_NOT_FOUND` / `TARGET_EMPTY_STRING` | invalid target shapes | fix the path; these are typed throws by design |
| 5 | `GRAPH_LOGIC_FAILED` in mcp mode | Python/graphify absent | run `graphMode: 'native'`, or install the graphify venv |
| 6 | `GATE_STITCH: typed_nodes rows are null…` | corrupt cross-gate memory | delete the run's sqlite; recurring = report a bug |
| 7 | `METAGATE_AGENT_CONFIG: agentConfig.cwd…` | MetaGate built without the 3-arg form | pass `(config, agentConfig, opts)` |
| 8 | `WORKER_TEMPLATE_ID: …` (×N) | malformed worker template | fix the named fields; the validator lists all |
| 9 | `::INCONCLUSIVE(fixture-dirs-absent)::` | calibration corpus not copied | copy `MASTER_CONTEXT/` + `fixtures/` (shipped in-repo) |
| 10 | `SOURCE_READ_FAILED` | the diagnostics engine couldn't read a source | the lockdown surface failing loud — fix the path/permissions |
| 11 | `NODE_TYPES count 18 != 16` (4 tests) | v4.4.3's own stale test pins | upstream bug — documented in the port; fix upstream or ignore |
| 12 | `bun build src/index.ts` fails on `./tools/…` | ran from the wrong root / stale dist | run from the repo root; `rm -rf dist` and rebuild |
| 13 | `ENOENT … MASTER_CONTEXT/…` in tests | calibration docs pruned | restore `MASTER_CONTEXT/` (shipped) or accept INCONCLUSIVE for those tests |
| 14 | hanging provider call | stall guard should fire at 60s | if truly hung past 120s, file it — the stall guard is machinery |
| 15 | 429 storm at scale | per-agent budgets (AP-11) | inject ONE shared ledger/key pool top-down |
| 16 | findings without evidence quoted | validator bypassed | re-enable `validateReport`; anchorless = inadmissible (SC-9) |
| 17 | `Cannot find module './events/…'` in tsc | partial tree (a wave mid-flight) | the full tree resolves; check you cloned completely |
| 18 | empty graph but target has code | scope wrong (exclude caught it) | fix `excludeNames`/scope; never degrade to an empty pass |
| 19 | toast fires after session end | owner guard removed | restore `clearToastDeliveryForSession` (F-11 class) |
| 20 | headline count ≠ findings count | double-flattened sections (EN-36 class) | one flattening site only: `stitchFromGateResults` |
| 21 | two fires tear the status file | double-fire without tokens | use `fire()` (distinct poll tokens, EN-34-safe) |
| 22 | `EMFILE`/fd exhaustion late in a run | child process leak (EN-37 class) | finally-disconnect every spawn; await exits on error paths too |

---

# QUICK REFERENCE

### A — The level table

| Level | Unit | Standalone? | Composable? | Entry |
|---|---|---|---|---|
| L1 | `AetherAgent` / harness | ✅ `minimal-agent.ts` | into any gate | `run({promptFile,…})` |
| L2 | `MetaGate` | ✅ `minimal-gate.ts` | into the kernel's phase 3 | `gate.run(ctx)` |
| L3 | `AetherPipeline` | ✅ `minimal-pipeline.ts` | is the whole machine | `run()` / `fire()` / `status()` |

### B — The tool surface (registered via `tools/aether-tools.ts`)

| Tool | What it does |
|---|---|
| `aether-code-audit` | the full audit cast |
| bug-hunt + the 7-verb query surface | hunt / who-calls / chain / must-implement / unwired / rule / violations |
| `query_graph` `shortest_path` `get_node` `get_neighbors` | the graph verbs (workers, phase 3) |
| report-writer | the chunked, contract-locked report assembly |
| mcp-bridge · lsp-injector · ui-server | the live surfaces |

### C — The named errors (fail-closed vocabulary)

`AETHER_PROVIDER_KEY_MISSING` · `PROVIDER_CHAIN_EXHAUSTED` · `LLM_CALL_NOT_WIRED` · `TARGET_EMPTY_STRING` · `TARGET_NOT_FOUND` · `TARGET_NOT_A_DIRECTORY` · `TARGET_MUST_BE_SRC_ROOT` · `GRAPH_LOGIC_FAILED` · `GRAPH_EMPTY` · `GATE_RUNNER_GATES` · `GATE_RUNNER_CTX` · `GATE_RUNNER_SUMMARY` · `METAGATE_AGENT_CONFIG` · `GATE_STITCH` · `FINDINGS_MAP` · `DOC_COMPOSER` · `RUN_STATUS` · `DETACHED_FIRE` · `PHASE_RUNNER` · `WORKER_TEMPLATE_*` · `META_TEMPLATE_*` · `MINIMAL_AGENT_PROMPT_NOT_FOUND` · `MINIMAL_AGENT_UNSUCCESSFUL` · `SOURCE_READ_FAILED` · `::INCONCLUSIVE(…)::`

### D — The real paths

| What | Path |
|---|---|
| the kernel | `src/audit-engine/index.ts` (1,260L) |
| the parser front-end | `src/audit-engine/code-classifier.ts` (1,153L) |
| the RAM-safe AST | `src/audit-engine/ast/audit-ast-core.ts` (1,011L) |
| the layer bank | `src/audit-engine/layers/` (28 files, ~10.2K L) |
| the brain | `src/audit-engine/aether/` (11 files, ~2.6K L) |
| the interrupt plane | `src/audit-engine/events/` (10 files, ~2.7K L) |
| the agent harness | `src/audit-engine/harness/pi-aether-agent.ts` (479L) |
| the agent transport | `src/audit-engine/aether-backend/` (22 files) |
| the team layer | `src/hydra/` (auditor 234L · meta 465L · report-reader 409L · tools 392L…) |
| the templates | `src/hydra/aether-templates/workers/` + `meta/` (17 + types) |
| the instances | `src/hydra/instances/{lasme,mpse,sro}.ts` |
| the graph substrate | `src/worker-harness/graph/` (corbell 789+441L…) + `src/shared/knowledge-graph/` (db 870L + query-engine 355L + profile-loader 522L) |
| the governance loop | `src/poseidon/` (god-loop 2,364L · problem-solver 1,206L…) |
| the report generators | `src/artifacts/` (22f, ~16K L) |
| the host binding | `src/index.ts` (318L) + `src/hooks/` (7f) + `src/tools/` (9f) |
| the grammar | `templates/GRAMMAR.md` + `src/agent/report/validator.ts` |

### E — The doctrine (verbatim)

> "THIS IS A COPY PASTE OF THE CODE AUDIT TOOL SIMPLY WALKED BACKWARDS 1-2 STEPS SO ITS NOT A LITERALLY 'TRIDENT CODE AUDIT' TOOL BUT IS INSTEAD A FUNCTIONING 'AETHER MACHINE' BOILERPLATE"

> "DO NOT DELETE ANY TOOLS, HARNESSES, WORKING MACHINERY, ETC."

> "with as minimal simplifications as possible to truly reach universal prototype shell status"

> "The model is not the intelligence. The model writes; the machinery verifies; the disk is the truth."

---

# THE PROVENANCE (where this came from)

This repo is a **verbatim two-step walk-back** of a production code-audit machine:

```
┌────────────────────────────────────┐      ┌────────────────────────────────────┐
│ THE PRODUCTION AUDIT TOOL (v4.4.3) │      │ THIS REPO (/aether)                │
│ 494 files · dist 54b50f18… ·       │      │ 420 src files · dist bfc197bd… ·   │
│ deployed + operator-verified       │ ═══► │ fidelity-verified port             │
└────────────────────────────────────┘      └────────────────────────────────────┘
   STEP 1: de-brand (rename map only — machine byte-identical)
   STEP 2: de-host (the opencode plugin binding wrapped → runs standalone)
   The machine itself: COPIED, not rewritten. 100% line retention on every
   audited file. The ported test suite IS the production test suite.
```

Port provenance: `PORT_MANIFEST.md` (the law + the frozen manifest) · the wave ledger in `BOILERPLATE_FAILURE_LOG.md` (which also documents the first, deleted attempt — the clean-room rewrite that cost this project its first build and produced this repo's iron laws).

---

# THE HONEST CAPABILITY MAP

| Capability | State |
|---|---|
| The deterministic machine (parser → AST → layers → graph → gates → composition) | ✅ runtime-proven, keyless |
| The loud-fail contract (every boundary) | ✅ container-proven |
| Concurrent teams on shared resources | ✅ container-proven (3 gates, 1 ledger) |
| Corrupt-input rejection | ✅ named rejections proven |
| The 28-layer bank | ✅ runtime-loaded (28/28) |
| AI worker rounds with a REAL model | ⚠️ transport unwired by design — wire `streamCall` (PR-3); the fail path is proven, the generation path is yours to key |
| mcp graph mode happy path | ⚠️ needs Python + graphify; its loud-fail half is proven |
| 4 upstream test pins | v4.4.3's own stale assertions (documented) |

---

## VERSION HISTORY

- **v1.0 (2026-09-05)** — the complete verbatim port. 6 waves + a fix wave, fidelity-diffed. The predecessor clean-room build was deleted; its autopsy ships as `BOILERPLATE_FAILURE_LOG.md`.

---

*Companions: `AETHER_MACHINE_ARCHITECTURE_BIBLE.md` (the deep architecture) · `AETHER_OPERATING_MANUAL.md` (the operating recipe) · `PORT_MANIFEST.md` (the port law) · `ANTI_PATTERNS.md` (the 12 failure classes) · `templates/GRAMMAR.md` (the FINDING contract).*
