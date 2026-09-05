# THE AETHER MACHINE — OPERATING MANUAL

**How to use the boilerplate — from `bun install` to your own configured machine.**
**Version:** 1.0 — 2026-09-05
**Companion:** `AETHER_MACHINE_ARCHITECTURE_BIBLE.md` (the complete architecture — the why and the file:line anchors)
**Project:** `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/Aether_Machine_Boilerplate/`

> *"Any fresh agent knows exactly how to use it."* — the packaging standard this manual enforces.

---

## THE ONE-LINE MODEL

The machine is a **universal agent government** in three composable levels:

```
LEVEL 1 — THE AETHER (one agent)      = transport + tool loop + report contract
LEVEL 2 — THE TEAM   (MetaGate)       = N aethers + 1 meta + shared sqlite memory
LEVEL 3 — THE KERNEL  (AetherPipeline) = 4 phases over M teams + the graph
```

You configure; it governs. Every finding carries a file, a line, and a verbatim quote — or the validator rejects it. Every failure is a named error. There is no silent pass.

---

## STEP 0 — INSTALL AND VERIFY (2 minutes)

```bash
cd /home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/Aether_Machine_Boilerplate
bun install          # restores from bun.lock (deps: pi-agent-core/pi-ai 0.84.2, zod, xstate, sql.js, wink-nlp, @modelcontextprotocol/sdk)
npx tsc --noEmit     # → exit 0 (the compile gate)
bun test             # → 1,038 pass / 19 skip / 4 fail (the 4 are v4.4.3's own stale pins — see §TROUBLESHOOTING)
```

**The gates you just met:** tsc and the battery are the floor. If either is red, STOP — the tree drifted; diff against `Checkpoints/aether-machine-v1/`.

---

## STEP 1 — CONFIGURE THE TRANSPORT (one env var)

The agent transport is deliberately unwired — no SDK, no keys, no network you did not author. The demos read:

```bash
export OPENCODE_GO_API_KEY=your-key     # the provider key (provider: opencode-go/muse-spark)
```

Without it, every model-bound path exits **exit 1** with the named error:

```
AETHER_PROVIDER_KEY_MISSING: env var OPENCODE_GO_API_KEY is unset or empty —
set it to your provider API key, then re-run. No mock transport is used;
without a key the agent cannot run.
```

With a key but no wired SDK, the chain walks and exhausts loudly:

```
PROVIDER_CHAIN_EXHAUSTED: Provider chain exhausted: opencode-go/muse-spark-1.3-contributor
→ LLM_CALL_NOT_WIRED: the boilerplate ships with the transport abstracted.
  Override streamCall() or wire your LLM SDK (pi-ai, openai, anthropic, etc.) here.
  Rung: opencode-go/muse-spark-1.3-contributor
```

**That error is the integration point, not a defect.** Wire `streamCall()` (Part 6 of the architecture bible) and the same path produces real rounds.

---

## STEP 2 — RUN THE THREE DEMOS (the levels, keyless where possible)

### LEVEL 3 — the full pipeline (works with ZERO keys — the deterministic phases)

```bash
bun run examples/minimal-pipeline.ts
```

Expected: `{"ok":true,"phase":"final","headline":"macro 3/2 · micro 5/4 · tags 0 · selfDefects 0", …, "gates":[{adjudicate,2},{verify,2},{remediate,2}]}` + exit 0 + two documents on disk (`examples/.docs/meta-analysis.md`, `findings-report.md`) + `examples/.run-status/run-status.json` showing the gate ladder `[PRELIMINARY]→…→[FINAL]`. The demo targets `examples/fixture/src/` — a tiny tree with two PLANTED defects (an empty catch at `handler.ts:13`, a floating `saveRecords` at `processor.ts:9`) — and the machinery finds them for real.

### LEVEL 2 — the team (needs a key for live workers)

```bash
bun run examples/minimal-gate.ts    # 3 workers + 1 meta over the fixture
```

Without a key: the named `AETHER_PROVIDER_KEY_MISSING` error, exit 1. With a wired SDK: worker reports + the meta adjudication on disk.

### LEVEL 1 — the atom

```bash
bun run examples/minimal-agent.ts examples/prompt-demo.md    # → report path + rounds
```

Read the demo sources — they are the working copies for your own machines: `examples/minimal-agent.ts`, `minimal-gate.ts`, `minimal-pipeline.ts`.

---

## STEP 3 — COMPOSE YOUR OWN MACHINE

### 3a. Write a worker template (the vocabulary)

Copy `templates/examples/worker-example.ts` (a `secretHygieneWorker` for a security domain) and change the four domain fields:

```typescript
export const myDomainWorker: WorkerTemplate = {
  id: 'my-check',                          // unique in the gate
  name: 'My Check',
  focus: 'What this worker hunts, in one line.',
  systemPromptSection: 'You are the My-Check worker. …' + FINDING_GRAMMAR_SPEC,
  demandTemplate: (ctx) => `Audit ${ctx.targetRoot} for X. ` +
    `Graph: ${ctx.graphStats.macroNodes}/${ctx.graphStats.macroEdges}. ` +
    `Candidates: ${ctx.candidateCount}. Emit FINDING blocks.`,
  requiredTools: ['read_file'],
  graphPredicates: ['my-predicate'],
  authorityRef: 'my-spec §1: the rule this enforces',
};
validateWorkerTemplate(myDomainWorker);   // throws at import if malformed
```

The 17 shipped templates (`src/hydra/aether-templates/workers/` + `meta/`) are the copy sources — lasme/mpse/sro domains, each with the same 8-member shape.

### 3b. Compose a gate (the team)

```typescript
const gate = new MetaGate(
  { gateId: 'my-gate', gateName: 'MY-GATED',
    workerTemplates: [w1, w2, w3],          // N workers
    metaTemplate: myMeta },                  // 1 adjudicator
  { cwd: process.cwd(), ledger: myLedger, keyPool: myPool },  // SHARED resources
);
const settled = await runGatesConcurrently([gate], { targetRoot, graphStats, candidateCount });
```

The reference composition: `src/hydra/instances/{lasme,mpse,sro}.ts` — the configured pipelines (74 tests prove the pattern).

### 3c. Run the kernel (the pipeline)

```typescript
const p = new AetherPipeline(
  { targetPath, graphMode: 'native', runStatusDir, outDir },
  { phases: { … } }                        // inject real phases where you want them
);
await p.run();    // or p.fire() — detached, poll token in <100ms
```

### 3d. Register a custom layer (the analysis)

Copy `src/audit-engine/layers/r2-error-handling.ts` as your pattern: a `LayerDefinition` with `PatternFamily` entries — structural matchers over the compiler AST (never bare regex — AP-09), evidence triads mandatory, `exampleHits` for calibration. `LayerEngine.register(yourLayer)`.

---

## STEP 4 — WIRE THE LLM (the one deliberate seam)

The transport is abstracted at ONE point. Open `src/audit-engine/harness/pi-aether-agent.ts`, find `streamCall`, and bind your SDK:

```typescript
override streamCall = async (demand: string, systemPrompt: string) => {
  const res = await yourLLM.chat({ system: systemPrompt, user: demand });
  return res.text;                          // the raw model text
};
```

Everything downstream — the rounds, the report write, the validator, the teams, the stitch — already works. `pi-ai` is already a dependency; the 0.84.2 API is the shipped binding target.

---

## STEP 5 — THE FINDING GRAMMAR (the contract your workers must emit)

Full spec: `templates/GRAMMAR.md` (163L). The block:

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

The 7 rules: all 6 fields mandatory · file is relative · evidence is verbatim · severity from the enum · confidence 0.0-1.0 · SUMMARY required · zero findings is `0 findings — none.` The validator (`src/agent/report/validator.ts`) enforces all of it; the meta agent refuses anchorless findings.

---

## STEP 6 — TROUBLESHOOTING (the named errors → the fixes)

| You see | It means | Do this |
|---|---|---|
| `AETHER_PROVIDER_KEY_MISSING: env var … is unset` | no provider key in env | export the key; the demos fail loud by design |
| `PROVIDER_CHAIN_EXHAUSTED … LLM_CALL_NOT_WIRED` | key present, SDK not wired | override `streamCall()` (Step 4) |
| `TARGET_MUST_BE_SRC_ROOT / TARGET_NOT_A_DIRECTORY / TARGET_NOT_FOUND / TARGET_EMPTY_STRING` | bad pipeline target | point `targetPath` at a real `src/` tree |
| `GRAPH_LOGIC_FAILED` (mcp mode) | Python/graphify absent | use `graphMode: 'native'`, or install the graphify venv |
| `GATE_STITCH: typed_nodes rows are null…` | corrupt cross-gate memory | the memory db is per-run tmp state — delete and re-run; persistent corruption = a bug, report it |
| `METAGATE_AGENT_CONFIG: agentConfig.cwd must be…` | MetaGate built without the 2nd arg | pass the shared `agentConfig` (3-arg constructor) |
| `WORKER_TEMPLATE_ID: id must be…` (×N fields) | malformed worker template | fix the named fields; the validator lists all |
| tests fail with `NODE_TYPES count 18 != 16` | the 4 v4.4.3-inherited pins | source bug, documented — ignore or fix upstream |

---

## STEP 7 — THE ANTI-PATTERNS (read before extending)

`ANTI_PATTERNS.md` (201L, 12 classes) — distilled from the real v4.4.3 debug chain. The heads:

AP-01 sync-heavy-load OOM (EN-38) · AP-02 child-process leak (EN-37) · AP-03 toast into a dead session (F-11) · AP-04 headline double-count (EN-36) · AP-05 concurrent double-fire (EN-34) · AP-06 case-sensitive markers (EN-33) · AP-07 silent graph degradation · AP-08 fake-work returns · AP-09 bare-regex classifiers · AP-10 free-text-as-output · AP-11 per-agent budgets · AP-12 success without side effects.

Every class: Pattern / Symptom / Root cause / Fix / **the law it violates**. The layers, gates, and demos are written to violate none of them — keep it that way.

---

## THE EXTENSION POINTS (where new machinery plugs in)

| Seam | Interface | Reference impl |
|---|---|---|
| worker templates | `WorkerTemplate` + `validateWorkerTemplate` | aether-templates/workers/ |
| gate rosters | `MetaGateConfig.workerTemplates` + instances/ | lasme/mpse/sro.ts |
| analysis layers | `LayerEngine.register(LayerDefinition)` | layers/r1-r16 |
| graph backend | the adapter contract (`graph-mapper.ts`) | corbell + native |
| host binding | `src/index.ts` + hooks/ + tools/ | the opencode registrations |
| the LLM | `streamCall` override | — (deliberately yours) |

**The rule for all of them:** configure/extend — never rewrite the machinery. The failure log exists because someone did.

---

## THE PACKAGE MAP (what ships where)

```
Aether_Machine_Boilerplate/
├── src/                                420 .ts files · 117,494 lines — the machine
├── dist/index.js                       the 18.25 MB bundle
├── templates/GRAMMAR.md                the FINDING contract (163L)
├── templates/examples/                 validator-guarded worker + meta examples
├── examples/                           the 3 level demos + the fixture + prompt
├── tests/                              the ported battery (81 boilerplate tests)
├── README.md · ANTI_PATTERNS.md · PORT_MANIFEST.md
├── BOILERPLATE_FAILURE_LOG.md          the first attempt's autopsy — read it
└── Checkpoints (external)              Active_Projects/Checkpoints/aether-machine-v1/
```

The architecture bible + this manual also live in `KNOWLEDGE_LIBRARY/Bibles/` (`AETHER_MACHINE_ARCHITECTURE_BIBLE.md`, `AETHER_OPERATING_MANUAL.md`).
