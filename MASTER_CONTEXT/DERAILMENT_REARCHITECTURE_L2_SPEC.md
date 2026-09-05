# THE DERAILMENT RE-ARCHITECTURE L2 SPEC — Graph Logic → Meta Layers

**Version:** 1.0 · **Date:** 2026-08-30 · **Status:** DRAFT — awaiting operator approval
**Purpose:** Re-architect the v4.4.3 Aether Code Audit tool: the derailment hunter (graph logic) becomes the pipeline's first class phase; the mechanical R0-R17 battery slims to its immortal core; the meta layers run concurrently on a GROUNDED graph.
**Predecessor:** supersedes the sequential LASME→MPSE→SRO pipeline shape (MASTER_CONTEXT/CONCURRENT_META_LAYERS_SPEC.md remains authoritative for the meta-layer internals — this spec changes what feeds them).
**B4 SHARPENED (operator, 2026-08-30): the battery is EXACTLY 5 layers — R1, R2, R3, R4, R5. All others CUT (not fix-semantics, not merge — CUT). The pipeline is: these 5 → graph logic → meta layers.**
- B1: the subagent keeps the name bug-hunter (dir `src/subagents/trident-bug-hunter/`, symbols, tool internals — NO rename).
- B2 (SHARPENED per operator correction 2026-08-30): the TOOL is **Graph Logic** — `trident-graph-logic` is the SOLE primary name (no aliases on the primary surface — clean and simple); the bug-hunter subagent keeps its own internal naming/aliases per B1.
- B3: sequencing = derailment hunter FIRST (mechanical, sequential), THEN meta layers CONCURRENT (as built), then stitch.
- B4: the mechanical battery slims to the immortal core; the slop rules are removed per LEGACY_RULE_VERDICTS.md.
- B5: all keys failing = AETHER_PROBE_FAILED loud abort (no deterministic fallback) — already landed 2026-08-30.
- B6: the GO key cycler (3 embedded keys, pool-gated) is live infra — not to be modified.

---

## §0 THE FUNDAMENTAL PROBLEM

The audit tool adjudicates code it has never grounded. Today's pipeline runs a 3,343-finding mechanical battery (42 FP / 1 TP sampled — LEGACY_RULE_VERDICTS.md) whose output nothing consumes, then fires 14 meta hunters whose graph queries hit a **phantom graph** — typed_edges held 7-14 rows total because the only code that populates it (`populateTypedGraph`, harness/map.ts:55) lives in the derailment hunter, which the audit pipeline has never invoked. The result: the meta layers — the tool's actual intelligence — reason over an empty graph while a 97%-FP battery burns the wall clock and the score denominator. The root defect class: **the pipeline's phases are wired in consumption order, not in dependency order** — the judgment layer (meta) runs before the evidence layer (graph) that it was designed to consume. The fix inverts the wiring: graph logic first (mechanical, seconds, zero muse), meta layers second (concurrent, grounded), deterministic noise out of the score.

**The operator's directives this spec implements (verbatim):**
- "BUG HUNTER TOOL WAS RENAMED DERAILMENT HUNTER. GET FULL CONTEXT ON THIS AND BUG HUNTER AND CORBELL"
- "the SUBAGENT should still be named bug-hunter" / "the TOOL we should rename to Graph Logic"
- "are the AST layers even providing anything useful or is it all just noise and we should rip it out so this is just the meta layers. Or we replace it with the derailment hunter pipeline instead so it is graph logic --> meta layers"
- "should we have it sequential derailment hunter THEN meta layers async w/ macro graph context or should we let everything run async concurrently and then polish after gens complete"
- "if ALL the keys fail then have a loud failure dont just fallback to a deterministic only"

**Consequences:** B1 (subagent name frozen) → the rename targets only the tool surface; B2 (tool = Graph Logic) → `trident-logic-audit` becomes primary; B3 (sequential hunter → concurrent metas) → the hunter's MAP phase populates the graph before the gates dispatch; B4 (battery slim) → score retune mandatory (§2.6); B5 → already landed (index.ts:485-500).

## §1 THE FAILURE INVENTORY

**F-1 (CRITICAL) — THE PHANTOM GRAPH: the meta layers query a graph nobody populates.**
What: every audit run to date dispatched 14 meta hunters whose `graphQueries` + `graphify:query|path|subgraph` tools need a populated graph; the typed tables (`typed_nodes/typed_edges`) held **7-14 rows total** across runs (the runner's own tags only).
Root cause: the only bulk populate — `populateTypedGraph` (`src/subagents/trident-bug-hunter/harness/map.ts:55`) — lives in the derailment hunter harness, which `src/audit-engine/index.ts` never imports (zero references). `memory.getGraph(){return null}` (`src/hydra/memory.ts:115`) is the unimplemented hydration stub.
Impact: hunter `graphify:query` results are noise or empty; CORRELATIONS computed from ~7 edges are meaningless; the SRO `TRIPLE_CONFIRMED` classification is mechanically impossible (R28 FINDING 1, `_meta-sro:225` "graphify:query never sees SRO tags and QueryEngine never sees graphify edges").
Evidence: container run 1168308 ledger + `typed_edges` counts in RUNNING_DEBUG_LOG 2026-08-30; explore-corbell desk return §5 (V1).

**F-2 (CRITICAL) — THE 97% NOISE BATTERY: 3,343-4,633 findings, 42 FP / 1 TP sampled.**
What: the mechanical R0-R17 battery produces the preliminary findings mass — 3,343 live (container 1168308), 4,633 in the audited DB (LEGACY_RULE_VERDICTS.md:3: 4,633 findings · 458 files · 431 flagged = 94% · 10.1/flagged-file).
Root cause: 8 rules = 4,127 findings (89.1%) with sampled 42 FP / 1 TP; the D17 calibration gates ONLY the 7 lexicon patterns (5 layers) — the 13 hand-rolled layers (~4,100 findings) are **never calibrated** (explore-mech-value §7.2).
Impact: the Step-X chunk pass adjudicated this noise (706 muse calls, ~25 min — deleted 2026-08-30); `computeScore` density spends weight on FP (densityPenalty up to 60 pts on noise); triage reads tables of slop.

**F-3 (HIGH) — THE DEAD STEP-X CLASS + DEAD CLUSTER: ~1,800L of orphaned judgment machinery.**
What: `src/audit-engine/aether/{step-x-orchestrator, deeper-probe, final-polish, supremacy-brief, silent-verifier, aether-brain, agent-brain, aether-store, pi-report-write-tool, rpm-ledger}.ts` — zero prod importers post-deletion (audit-aether.ts is the live exception).
Root cause: the Step-X consumer was deleted (operator ruling: the legacy chunk pass was adjudicating noise through the dead-era transport); its 10 suppliers were left behind.
Impact: bundle + discovery contamination; AP-1 dead-gate class.

**F-4 (HIGH) — THE DEAD SECOND HIERARCHY + DEAD PIPELINE CLASS.**
What: `SubagentSpec` hierarchy (`src/hydra/instances/{lasme,mpse,sro}.ts` 1,642L) imported at index.ts:89-91 but never used beyond import — `AuditorTemplate` (aether-templates/) is the only live hierarchy. `AetherHydraPipeline` (`pipeline.ts:15`): `new` = 0 prod hits; `dispatchSubagent` (:152-160) always-throws `AETHER_MIGRATION` with `void tools`.
Impact: index.ts god-node out-degree 17; dual-surface divergence risk (two definitions of the gates); 168L scar tissue.

**F-5 (HIGH) — GRAPH DEFECT CLUSTER V1-V10 (explore-corbell §6).**
V1 dual stores: graph.json (MCP-served) vs typed tables (shared.db) never merge — hunter tags invisible to meta queries and vice versa. V3 `graphify.ts:141 void depth` — subgraph depth dropped, blast-radius truncated ~60% (R29 FINDING 16). V4 `QueryEngine.path` predicateFilter splice bug (`query-engine.ts:135-151` duplicated bindings) — filtered paths return `[]`, `downstreamCount=0`, SRO_POST_DOWNSTREAM_MISMATCH. V6 file-lump: `computeBlastRadius` maps absolute graph files vs relative finding files with no normalization (`sro.ts:311-328`, grep path.resolve/relative = 0). V8 DDL re-typing: `aether-tools.ts:307` inlines the CHECK lists instead of importing TYPED_GRAPH_DDL — ontology drift forks the schema. V9 `kindForLayer` duplicated (`aether-tools.ts:234` ≡ `aether-meta.ts:115`) and collapses R28-R31 all → `Gate` (community detection pollution). V5 community undirected merge; V7 INFERRED-blind + direction divergence; V10 pipeline scar. Full table: explore-corbell return §6.

**F-6 (MEDIUM) — THE IMPORT CYCLE: hydra ↔ audit-engine (len 3).**
`hydra/aether-auditor.ts:3 → audit-engine/aether-backend/agent.js`; `audit-engine/index.ts:68,88 → hydra/aether-meta.ts + 14 template imports`. Inflates blast-radius hops to cyclic (SRO R31 SCC spurious), pollutes R29 hop counts.

**F-7 (MEDIUM) — THE RENAME IS CONCEPT-ONLY.**
`trident-logic-audit` exists as an alias (`tools/bug-hunt.ts:83` "derailment hunt" phrase; `tool-allowlist.ts:36`); the dir/symbols stay `trident-bug-hunter`/`createBugHuntTool` (393 grep remnants). Per B1 the subagent name stays; per B2 the TOOL surface becomes Graph Logic — the alias must be promoted to primary naming with the Graph Logic surface spec'd in §2.3.

**F-8 (MEDIUM) — THE SCORE INVERSION.**
`computeScore` density: `densityPenalty = clamp(findings/files,0,1)*60` (scoring.ts:292-296). On the slim battery, findings drop ~4,633→~30 hydra → density 10.1→0.07 → score **+56 inflation** → every NOT-RUNTIME codebase grades RUNTIME (false PASS). Also: P1-P10 contributes 1,603 same-class findings into findings (trident-tools.ts:1047) — noise into the same denominator.

**F-9 (LOW) — THE RENAME REMNANT INVENTORY** — 393 grep hits enumerated in explore-derailment §7 (dir, tools, symbols, allowlist, templates, ledgers). Tracked for the cosmetic sweep — NOT in scope for the functional re-architecture (B1: subagent name stays).

## §2 THE FIX PLAN

### 2.1 The New Pipeline Shape

**THE NEW ORDER (dependency-wired, not consumption-wired):**

```
[BOOT] validateAuditTarget (src/ mandate, index.ts:195) + preflight (slim)
   │
   ▼  mechanical, ~seconds, ZERO muse
[GRAPH LOGIC PHASE — the derailment hunter, in-process]
   MAP:    populateTypedGraph(db, runId, root)     (harness/map.ts:55)
           typed_nodes/typed_edges INSERTs (ontology-locked, evidence_quote mandatory)
   SCAN:   compile battery → calibration → findings ledger
   TRACE:  runL6Loop (l6-agent.ts:94, budget 2+ceil(t/6)+2) + verifyClaim (L7)
   L8:     classifyFact → graph_facts (no-delete compounding)
   │
   ▼  the graph is now GROUNDED — every edge carries evidence_quote
[GATES-RUNNING]: LASME ∥ MPSE ∥ SRO — 14 hunters + 3 metas CONCURRENT (as built, unchanged)
   the hunters' graphify:query/path/subgraph + graph_tag now operate on a REAL graph
   │
   ▼  Promise.allSettled
[STITCH]: gate-stitch (doc1/doc2 canonical order + CORRELATIONS from populated typed_edges)
   │
   ▼
[FINAL]: score (retuned §2.6) + report
```

**What changes vs today (the delta list):**
1. NEW phase between preflight and the gates: the derailment hunter's MAP+SCAN+TRACE stages, invoked in-process (not the tool spawn — the direct function calls `map(profile)` → `solveTrace(findings, adapter)`), so the audit owns no extra process.
2. The mechanical battery slims to the immortal core (§2.5) — the 3,343-finding flood dies; the prelim carries the immortal findings + the graph stats.
3. The gates run UNCHANGED — same roster, same templates, same runMetaLayer, same allSettled. Their input improves: graphify:query now traverses 18K+ typed nodes instead of 7 edges.
4. The stitch + CORRELATIONS run UNCHANGED — but now read populated tables.
5. Step-X stays RESTORED (the operator's correction — the machinery was functioning; the AP-7 over-fire gate now controls its input). The legacy fallback stays deleted (AETHER_PROBE_FAILED loud abort). The GO cycler stays live.

**What does NOT change:**
- The 14 meta templates' staticPrompts (hunters hunt predicates — the design is correct).
- The GO key cycler (B6 frozen).
- The subagent naming (B1: bug-hunter stays).
- The concurrent gate dispatch (the 15ms-proven allSettled wiring from Wave 1).

**The hunter invocation contract (in-process, NOT tool-spawn):**
```typescript
// index.ts — new phase between classifyProject and the probe
import { map } from '../subagents/trident-bug-hunter/harness/map.ts';
import { solveTrace } from '../subagents/trident-bug-hunter/harness/trace.ts';

// MAP — populate the typed graph (mechanical, seconds)
const mapResult = await map(projectProfile);  // { adapter, buildResult, db, dbPath, mirrorPath }
// SCAN — the corpus battery (mechanical; feeds the hunter's OWN findings ledger)
// TRACE — the L6 graph-traversal verification (mechanical)
const traceRows = await solveTrace(hunterFindings, mapResult.adapter);

// the graph is now populated — the gates' graphify tools + graph_tag + CORRELATIONS
// all read real data
```
**The profile dependency:** `map(profile)` requires a `ProjectProfile` with `rules.corpus[]` (empty corpus → `HUNT_NO_COVERAGE` → INCONCLUSIVE, scan.ts:70). The audit must resolve the profile path: `profilePath = path.join(targetPath, '..', '<name>.profile.yaml')` — the spec'd default is a **generic corpus profile** shipped at `src/subagents/trident-bug-hunter/profiles/default-corpus.yaml` listing `src/**/*.ts` (the audit target's own tree). `validateAuditTarget` mandates basename `src/` (index.ts:205); the hunter's `map` resolves `profile.project.root` — the audit passes `targetPath`'s parent as project root.

**The wrapper (new file `src/audit-engine/graph-logic-phase.ts`):**
```typescript
export interface GraphLogicResult {
  graphPopulated: boolean;      // typed_nodes count > 0 after populate
  nodesCount: number;
  edgesCount: number;
  hunterFindings: number;       // the hunter's own findings count (informational)
  durationMs: number;
  error?: string;               // LOUD on failure — never a silent skip
}
export async function runGraphLogicPhase(targetPath: string, runId: string): Promise<GraphLogicResult>
```
Failure rule (OPERATOR CORRECTION 2026-08-30 — the B5 law applied UNIFORMLY): a graph-logic phase failure is a **LOUD ABORT of the whole audit — NOT a degrade, NOT a fallback.** `map()` or `solveTrace()` throw → `runGraphLogicPhase` catches → `tridentLog('ERROR', 'graph-logic', ...)` → the audit STOPS: status `GRAPH_LOGIC: FAILED`, the error named in the artifact, the toast fires, error data returned to the caller. The gates DO NOT run on a failed graph — no "predicate-only hunting" degrade, no partial artifacts, no best-effort substitutes. Rationale (the operator, verbatim): "if any core component has a loud error this SHOULD abort the tool and return error data. NO STUPID FALLBACKS THAT WERE NOT EXPLICITLY SPECD." The graph is a core dependency of the meta gates — it is the entire point of this re-architecture; running the gates without it would silently recreate F-1 (the phantom graph) with a green status line. Same contract as B5 (all keys dead → AETHER_PROBE_FAILED): core component fails → named abort, error data, full stop.


### 2.2 Phase G — Graph Ground + The Wiring Fixes (the migration completion)

**THE CORE INSIGHT (from the instances-wiring desk):** `pipeline.ts` and `instances/` are not dead — they are the **unmigrated portion** of the original design. The A4 migration replaced the dispatch mechanism (`runMetaLayer` replacing `dispatchSubagent`) but dropped: (a) the graphify extract + MCP connect, (b) the per-gate synthesis, (c) the pre/post structural gates, (d) the `memory.setGateOutput/getGateOutput` cross-gate enrichment. **The fix is to complete the migration by wiring these into the live path — not to delete them.**

**THE GRAPH ARCHITECTURE (the operator's correction):**

```
MICRO GRAPH (graphify)                        MACRO GRAPH (corbell/typed)
  graphify-out/graph.json                      shared.db typed_nodes/typed_edges
  codebase-specific, per-layer                 project-wide, cross-cutting
  tree-sitter extracted (no LLM)               ontology-tagged (16 kinds, 20 predicates)
  serves: graphify:query/path/                 serves: CORRELATIONS, blast-radius,
          explain/subgraph                            compounding (L8 graph_facts),
  consumed by: individual hunters                     cross-gate enrichment
  context: per-gate code structure             consumed by: meta review + SRO synthesis

  FIREWALL: these are SEPARATE. They exchange through structured comms:
    MICRO → MACRO: hunter findings → writeRunnerTag → typed_edges (the tags)
    MACRO → MICRO: macro graphDigest → meta brief (the enrichment context)
    NEVER: direct table merges, hydration of one into the other's shape
```

**THE WIRING FIXES (8 items):**

**G-W1: The HunterSettlement → SubagentSettlement adapter (6 lines, verified compatible).**
The 3 synthesis functions consume `SubagentSettlement<SubagentOutput>[]` but the live hunters produce `HunterSettlement`. Structurally compatible (verified: same discriminant, `findings` is already zod-validated to the right shape, just typed `unknown`). The adapter:
```typescript
function hunterToSettlement<T>(h: HunterSettlement): SubagentSettlement<T> {
  if (h.status === 'fulfilled')
    return { subagentId: h.layerId, status: 'fulfilled', value: h.findings as T };
  return { subagentId: h.layerId, status: 'rejected', reason: new Error(h.error) };
}
```

**G-W2: The synthesis calls.**
After the adapter, call the gate's synthesis function. INSERTION: in `aether-meta.ts`, after the adapter (G-W1), before the runner tagging:
- LASME → `lasmeSynthesize(results, graph, memory)` — dedupes + cross-ref-boosts + ranks candidates
- MPSE → `mpseSynthesize(results, graph, memory)` — reads LASME from `memory.getGateOutput('LASME')`, produces the conformance matrix
- SRO → `sroSynthesize(results, graph, memory)` — reads both gates, computes blast-radius + TRIPLE_CONFIRMED correlations

**G-W3: The pre/post structural gates (10 total, all boolean-returning, all currently unwired).**
- PRE (before hunter dispatch): validates input shape — spec exists, LASME output available (MPSE/SRO), graph valid (SRO)
- POST (after synthesis): validates output shape — candidates have required fields, conformance matrix complete, blast-radius computed
- The pre-gate input-shape bug (V5): MPSE/SRO pre-gates cast `target as {memory?}` — fix by passing `memory` explicitly on a proxy gate target: `const gateTarget = {...input, memory, graph}` (3 lines)

**G-W4: `memory.setGateOutput` wiring (the cross-gate chain).**
`memory.ts:37 setGateOutput` and `memory.ts:54 getGateOutput` are BOTH implemented (real SQLite `INSERT OR REPLACE` / `SELECT` on `gate_outputs` table). `aether-meta.ts:runMetaLayer` never calls either. Fix: after synthesis + post-gates, call `memory.setGateOutput(gateName, {synthesis, results, telemetry})`. This enables the cross-gate chain: LASME persists → MPSE reads → MPSE persists → SRO reads both. NOTE: the concurrent dispatch (allSettled) means MPSE/SRO synthesis may see null LASME/MPSE if the earlier gate hasn't finished. This is ACCEPTABLE (degraded synthesis, not crashing — the synthesis functions handle null gracefully with `lasmeCandidates=[]` fallback). For the full cross-gate intelligence, a future optimization could add a barrier (LASME settles → then MPSE+SRO concurrently).

**G-W5: The graphify extract once + MCP connect.**
`GraphifyMCPMapper.extract(targetRoot, {codeOnly:true})` → `graphify-out/graph.json` → `GraphifyMCPClient.connect(graphPath)` → `createGraphifyTools(mcpClient)` → 4 working tools. Currently: `graphMapper` is passed to `runMetaLayer` but extract never fires (it lived in the dead `pipeline.ts:43`). Fix: extract ONCE in index.ts after the graph-logic phase, before the gates. The `graphify:subgraph` depth void (`graphify.ts:141`) is also fixed here (pass `depth` to the MCP call).

**G-W6: `memory.getGraph` hydration (the MACRO graph, post-tagging).**
`memory.ts:112 getGraph` returns null. The fix: read `typed_nodes/typed_edges` (live rows) into `GraphifyGraph` shape. This is the MACRO graph — the project-level accumulated graph from all tagged findings across ALL gates. It feeds `sro-pre-merged-graph-valid` and `sroSynthesize`'s blast-radius. NOT a merge with the micro graph (AD-7 firewall).

**G-W7: The kindForLayer extraction (V9).**
Extract the duplicated `kindForLayer` (`aether-tools.ts:234` ≡ `aether-meta.ts:115`) into `src/shared/knowledge-graph/kind-for-layer.ts`. Add R28→Graph, R29→Path, R30→File, R31→Container granularity.

**G-W8: The gate naming normalization (V8).**
`lasmePreGates` → alias `export const createLasmePreGates = lasmePreGates` (1 line). Fixes the factory-prefix inconsistency that would break uniform dispatch.

**G-W9: The L8 compounding closure.**
`harness/trace.ts` never calls `classifyFact` (L8 writes evaporate). Fix: after the L6 loop, per verified finding, call `classifyFact` → `graph_facts` rows. The compounding loop compounds across runs.

### 2.3 The Graph Logic Tool (the rename + the operator surface)

**B2 implemented (OPERATOR CORRECTION 2026-08-30 — CLEAN AND SIMPLE): the TOOL is `trident-graph-logic`. ONE name. The SUBAGENT stays bug-hunter (B1) with its own internal tool aliases.**

**The tool surface (src/tools/trident-tools.ts:2909-2919):**
| Before | After |
|---|---|
| `trident-logic-audit` (alias, "derailment hunt" description) | **REMOVED.** The primary agent-facing tool is `trident-graph-logic` ONLY — no alias on the primary surface. Clean and simple (the operator: "primary agent just has the graph logic aliasing to keep it clean and simple"). |
| — | **`trident-graph-logic`** — THE primary name (sole primary registration). Description: "Run the Graph Logic pipeline: populate the typed code graph, run the derailment hunt (L6/L7 verified), report." |
| `trident-bug-hunter-hunt` | **UNCHANGED** — the bug-hunter SUBAGENT's own tool (B1-frozen subagent surface, not a primary alias). |
| `trident-bug-hunter-query` | **UNCHANGED** (B1). |
| `trident-bug-hunter-report-writer` | **UNCHANGED** (B1). |

**What renames and what doesn't:**
| Surface | Renames? | Why |
|---|---|---|
| The primary tool registration | YES → `trident-graph-logic` (sole name) | B2 — the operator-facing surface is ONE clean name; `trident-logic-audit` is dropped entirely |
| The allowlist (`tool-allowlist.ts:36`) | REPLACE `trident-logic-audit` → `trident-graph-logic` | one entry, not two — no zombie alias entries |
| The poseidon enforcer `AUDIT_TOOLS` list (`poseidon-enforcer-hook.ts:74`) | REPLACE the old name with `trident-graph-logic` | the enforcer must not block the renamed primary |
| The tool handler file (`tools/bug-hunt.ts`) | NO | B1 — the subagent internals stay |
| The dir (`src/subagents/trident-bug-hunter/`) | NO | B1 |
| The symbols (`createBugHuntTool`, `spawnBugHunterLoop`, `BUG_HUNTER_WARHEAD`) | NO | B1 — symbol renames are churn without behavior |
| The agent instruction (`src/index.ts:254` "you are trident_bug_hunter") | NO | B1 |
| The `trident-bug-hunter-*` tools | NO | the bug-hunter SUBAGENT's own surface — aliases live HERE (the operator: aliases "only for the bug hunter subagent") |

**The description text (bug-hunt.ts:82-90):** update the primary tool description to "Run a **Graph Logic** derailment hunt — populate the typed code graph, run L6 traversal + L7 verified tracing, produce grounded findings. The audit pipeline's first-class graph phase." — the name the operator sees.

**The cosmetic sweep (bug-hunter remnants, 393 hits): OUT OF SCOPE for this spec.** B1 freezes the subagent naming; the remnants are tracked (explore-derailment §7) and swept in a cosmetic wave AFTER the functional re-architecture proves itself. Renaming 393 references before the architecture works is churn.

### 2.4 The Graph Defect Fixes (V1-V10 from the graph-stack audit)

| Defect | Fix | Where | Gate |
|---|---|---|---|
| **V1** dual stores (CRITICAL) | G-1 hydration + G-8 QueryEngine fall-through (§2.2) | memory.ts + graphify tools wiring | SRO `mergedGraphValid` passes; `getGraph()` returns >0 nodes |
| **V3** `void depth` (HIGH) | pass `depth` to `get_neighbors` | graphify.ts:141 | `graphify:subgraph({depth:3})` returns ≥ depth-1 hops |
| **V4** predicate splice (HIGH) | fix the parameter ordering in `path()` — bind `predicateFilter` values AFTER the CTE recursion params, or use named params | query-engine.ts:135-151 | `path(from,to,{predicateFilter:['violates']})` returns edges when they exist |
| **V6** file-lump (MEDIUM) | `computeBlastRadius`: normalize both sides — `path.resolve(graphNode.file)` vs `path.resolve(finding.file)` before the Map key | sro.ts:311-328 | the 14-nodes-one-file lump test passes (graph nodes match finding files) |
| **V5** community undirected (MEDIUM) | keep undirected (connected-components semantics) but DOCUMENT it + expose `directed` option default false | query-engine.ts:228 | no code change; comment + option |
| **V7** INFERRED-blind (MEDIUM) | `computeBlastRadius` counts `EXTRACTED` edges as downstream; `INFERRED` edges tagged `impactPaths[].inferred=true` (report shows the split) | sro.ts:325-330 | the impactPaths rows carry the confidence flag |
| **V8** DDL drift (MEDIUM) | `aether-tools.ts:307` imports `TYPED_GRAPH_DDL` from migrations.ts (delete the inline re-type) | aether-tools.ts:307 | grep: no inline CHECK list in aether-tools.ts |
| **V9** kindForLayer dup (MEDIUM) | extract to `src/shared/knowledge-graph/kind-for-layer.ts` (single source); BOTH files import it; R28-R31 map to Graph/Path/DeadCode/Cycles kinds (not all Gate) | aether-tools.ts:234 + aether-meta.ts:115 | grep: 1 definition, 2 importers; R28 kind ≠ R29 kind |
| **V10** pipeline scar (LOW) | K2 deletion covers it | pipeline.ts | gone with the class |

### 2.5 Phase M — The Mechanical Slim (keep immortal, remove slop, fix semantics)

**The slim battery (what registers after this spec):**
| Verdict | Layers | Post-purge findings | Action |
|---|---|---|---|
| **KEEP IMMORTAL** | R2 (empty-catch + swallowed-fixed), R3 (current comment-scoped), R4 (type-unsafe), R5 (fake-return + always-pass), R1 (hook-contract, plugin-gated tiny) | ~159 + fresh (the container-proven true classes) | Register as-is; the D17 calibration stays wired |
| **REMOVE** | R10 INVOCATION_INTEGRITY (955 — the `typeStrings.size>1` detector), R11 (the R17 duplicate fossil — de-register, keep file as doc), R6-A checker-resolution sub-detector (700-750 — `tsc`-redundant) | −1,700 | Delete the sub-detector code blocks (r10:354-371, r6:249-269) + de-register R11 |
| **FIX-SEMANTICS** | R3 async (exclude tests/fixtures/Promise.resolve → 40-70 survive), R6-B dead-import (keep — 1 TP found `poseidonState`), R9 runtime-contract (T1 keep; T2 boundary; T3 suppress inherited-any → 100-160), R15 container (exclude fixtures/host keys → 20-40), R16 TYPE_CERTAINTY (extend `hasPrecedingRuntimeGuard` lookback; exclude construction bridges → survivor ~50-100), R16 OUTPUT_CONTRACT (exclude ctors/`ok:false`/structural-evidence negatives → survivor ~40-80) | ~350-550 | Surgical detector edits; re-measure per fix |
| **MERGE→HYDRA** | R2 state-machine → `lasme-state-machine` hunter; R14 control-flow → `sro-path/graph`; R12 gated (non-plugin excluded already) | 0 from battery | De-register from the battery; the hydra hunters own the predicate |

**Post-purge numbers:** 4,633 → **~700-1,100** (LEGACY doc §3 conservative arithmetic). The preliminary artifact carries the immortal findings + graph stats; the noise mass dies.

**The consumers that need retouching (from explore-mech-value §8):**
1. `computeScore` density — retuned (§2.6).
2. Report layer-stats — R-rows drop to the immortal 5; hydra rows carry the mass. Acceptable (the re-anchoring).
3. D17 CalibrationGate — stays wired (the immortal 5 keep it alive).
4. Self-audit (`initSelfAudit` :109-140) — runs the immortal R17+R4 pair (the seeded `return true` MUST still be caught).
5. Prelim ≤15s contract — preserved (the immortal scan is sub-second).
6. `enrichWithHiveKnowledge` — input shrinks but the call survives (hive enriches hydra findings too).

### 2.6 The Score Retune (the density collapse fix)

**The problem:** `computeScore` (scoring.ts:248) computes `densityPenalty = clamp(findings/files, 0, 1) * 60`. With the slim battery + hydra-only findings (~30-50), density → 0.07 → penalty → 4 → score +56 → false PASS.

**The fix — hydra-normalized density:**
```typescript
// scoring.ts — the density denominator becomes the HUNTER's expected finding mass,
// not the files count. A calibrated finding density on the IMMORTAL battery stays
// meaningful; hydra findings are scored on the confidence distribution instead.
const immortalDensity = immortalFindings.length / filesScanned;       // the R4/R8/R13/R17 mass
const hydraConfidenceMass = hydraFindings.reduce((s,f) => s + f.confidence, 0) / hunterCount;
const densityPenalty = clamp(immortalDensity * DENSITY_SCALE_IMMORTAL, 0, 15)
  + clamp((1 - hydraConfidenceMass) * DENSITY_SCALE_HYDRA, 0, 20);
// DENSITY_SCALE_IMMORTAL = 30 (the immortal findings are HIGH-precision: 1 per file is 1 real defect)
// DENSITY_SCALE_HYDRA = 20 (the meta confidence mass: unconfident findings cost, verified ones don't)
```
**The gate:** a known-dirty fixture scores NOT-RUNTIME; the golden fixture scores RUNTIME. Both directions tested (§4).

**The P1-P10 contribution (K6):** the scan's 1,603 findings STOP entering `allHydraFindings` (`trident-tools.ts:1047` — log the score, don't append findings). The scan stays as a status-line signal; its FP mass exits the denominator.

### 2.7 The Corrected Architecture Plan (the wiring completion — NOT deletions)

**REVISED per the operator's correction:** `pipeline.ts` and `instances/` are not dead — they are the unmigrated portion of the original design. The fix is to WIRE them into the live path by completing the A4 migration. The Step-X pass and its supply chain are RESTORED and stay.

**The wiring plan (replaces the old kill list):**

| # | Wire | Files touched | What connects |
|---|---|---|---|
| W-1 | The graph-logic phase | NEW `graph-logic-phase.ts` + index.ts insertion | `populateTypedGraph` → typed graph populated before gates |
| W-2 | The synthesis adapter + calls | `aether-meta.ts` (the runner) | HunterSettlement→SubagentSettlement adapter → per-gate synthesis after allSettled |
| W-3 | The pre/post gates | `aether-meta.ts` | Gate structural validation before dispatch + after synthesis |
| W-4 | `memory.setGateOutput` | `aether-meta.ts` | After synthesis + post-gates → enables cross-gate reads |
| W-5 | The graphify extract once + MCP connect | index.ts + graphify.ts | ONE extract before gates; depth param fix; MCP tools get real graph |
| W-6 | `memory.getGraph` hydration (macro) | memory.ts | Read typed_nodes/typed_edges → GraphifyGraph shape (macro graph) |
| W-7 | kindForLayer extraction | NEW kind-for-layer.ts + both importers | Single source, R28-R31 granularity |
| W-8 | Gate naming normalization | lasme.ts (alias) | `createLasmePreGates = lasmePreGates` |
| W-9 | L8 compounding closure | harness/trace.ts | classifyFact after L6 verification |

**The `pipeline.ts` disposition: REFERENCE IMPLEMENTATION, not deleted.** Its extract-once + MCP connect + evidence collection pattern is the reference for how W-5 should be wired. The dispatchSubagent throw stays (it correctly redirects to runMetaLayer). The class itself is a design artifact documenting the intended flow — not production code, not garbage.

**The `instances/` disposition: WIRED, not deleted.** The synthesis functions + gates become part of the meta layer flow via W-2/W-3. The SubagentSpec objects (r-lexicon etc.) are reference definitions that map 1:1 to the AuditorTemplate layerIds. Both hierarchies serve different roles: instances define the SYNTHESIS + GATES (how results are processed); templates define the HUNTING (what the LLM agents look for).

## §3 THE IMPLEMENTATION ORDER

**Wave W — THE WIRING COMPLETION (§2.2 G-W1..G-W9) — 1 desk, the migration completion.**
Owner: 1 build desk. Files: `aether-meta.ts` (synthesis+gates+memory insertion) + `memory.ts` (getGraph hydration) + `graphify.ts` (depth fix) + NEW `kind-for-layer.ts` + `lasme.ts` (naming alias) + NEW `graph-logic-phase.ts` + `index.ts` (phase insertion) + `harness/trace.ts` (L8 call).
Gate: tsc 0 · hydra 0 fail · aether-backend 0 fail · NEW graph-logic tests (populate→typed_nodes>0; hydration→getGraph non-null; depth reaches MCP; synthesis adapter produces correct shape; pre-gates pass with injected memory) · the wiring: lasmeSynthesize called with real SubagentSettlement data · setGateOutput called · getGraph returns non-null.
Depends: nothing (all prerequisite waves complete — concurrent dispatch + cycler + probe rotation are live).

**Wave T — THE GRAPH LOGIC TOOL (§2.3) — 1 desk, small.**
Owner: 1 build desk. Files: src/tools/trident-tools.ts (the registration rename) + src/security/tool-allowlist.ts (+ trident-graph-logic) + src/hooks/poseidon-enforcer-hook.ts (AUDIT_TOOLS += trident-graph-logic) + bug-hunt.ts description.
Gate: the tool registered under the new name; the old aliases still fire; the allowlist + enforcer admit it.
Depends: Wave W.

**Wave M — THE MECHANICAL SLIM (§2.5) + SCORE (§2.6) — 1 desk.**
Owner: 1 build desk. Files: index.ts (de-register the 9 slop layers, keep the immortal 5 + the structural gates) + layers/{r3,r6,r9,r15,r16}.ts (the semantic fixes) + scoring.ts (the density retune) + trident-tools.ts:1047 (the P1-P10 contribution stop).
Gate: tsc 0 · the battery suite green (the immortal patterns fire; the removed rules absent) · a score unit test (dirty→NOT-RUNTIME; golden→RUNTIME) · the immortal 5 fire on the existing fixtures.
Depends: Wave W + T (the graph phase provides the replacement grounding before the battery shrinks).

**Wave X — THE RE-MEASUREMENT (orchestrator-run) — the proof.**
Deploy the final dist → re-fire the container audit → the oracles:
- OR-A: the graph-logic phase lands in <60s (mechanical) with typed_nodes > 1,000
- OR-B: the meta hunters' graphify:query returns REAL graph data (spot-check 1 query result)
- OR-C: CORRELATIONS computed from typed_edges ≥ 50 rows (not the 7-edge phantom)
- OR-D: the wall clock total < 20 min (concurrent gates, no Step-X chunk noise)
- OR-E: the slim battery: the preliminary findings ≤ 200 (from 3,343)
- OR-F: the GO cycler: go-1 SKIP lines + go-2 OK lines in the engine log
- OR-G: the immortal battery fires on the dirty fixture (r17.fake-return parity)

## §4 THE TESTING STRATEGY

**Unit (per wave, the desk's own gate):**
- Wave W: the synthesis adapter (HunterSettlement→SubagentSettlement); the memory hydration (seeded db → getGraph non-null); the subgraph depth test (depth reaches MCP mock); the splice test (predicateFilter returns the seeded edge); kind-for-layer granularity (R28→Graph, R29→Path, R30→File, R31→Container)
- Wave T: the tool registration test (trident-graph-logic in the allowlist; the aliases still work)
- Wave M: score.test.ts (the density retune: immortal 5 + 30 hydra → the honest band; 0+30 → RUNTIME); the immortal fixture test (r17.fake-return parity)

**Integration (host, post-Wave W+M):**
- The audit on the v4.4.3 src itself: the graph-logic phase populates ~18K nodes; the gates run on the grounded graph; CORRELATIONS from typed_edges; the wall clock measured.
- The immortal battery: the dirty fixture (r17.fake-return bad.ts:6 parity) — MUST fire post-slim.

**Live (container, Wave X):**
The container test per the 12-step law: the plan (the scenarios OR-A..OR-G above + the adversarial set: the all-keys-dead AETHER_PROBE_FAILED abort, the graph-logic failure → named-degraded gates, the sqlite BUSY stress under 3-gate tagging) → the results artifact → the declaration.

## §5 THE ANTI-PATTERNS AGAINST FALSE SUCCESS

**THE ANTI-DERAILMENT LAYERS — built from the 2026-08-30 session failure catalogue (RUNNING_DEBUG_LOG for the full 8-failure evidence).**

These are NOT documentation — they are mechanical guardrails that MUST be built as code in the graph-logic branch:

| Layer | Prevents | Implementation |
|---|---|---|
| **AD-1 SUPPLY-CHAIN CHECK** | deleting a module that has live importers | Pre-edit hook: grep the module across src/ — any hit outside the module = HALT + surface |
| **AD-2 WIRING-VS-DELETION GATE** | deleting unmigrated capability | Before "dead" classification: (a) was it ever wired? (b) why unwired? (c) gap or intentional? Gap → WIRE |
| **AD-3 OPERATOR-CUT LAW** | unsupervised ripouts | Deletions >10 lines: agent maps + proposes; operator cuts |
| **AD-4 RESTORE-POINT** | irreversible cascades | Multi-file edits require a pre-edit checkpoint (tmp copy or git stash) |
| **AD-5 TYPE-CHECK PER-EDIT** | compound edit errors | After each file edit: tsc scoped to that file. New error = STOP |
| **AD-6 GRAPH-STATE MONITOR** | the phantom graph recurring | After graph populate: `SELECT COUNT(*) FROM typed_nodes` > 0 asserted. 0 = LOUD error |
| **AD-7 MICRO/MACRO FIREWALL** | graph store conflation | graphify (micro) and corbell (macro) are SEPARATE. Exchange: structured comms (tags + graphDigest), never schema merge |
| **AD-8 INCOMPLETE-MIGRATION CHECK** | calling unmigrated capability "dead" | Diff current pipeline vs the original design. Missing = migration gap → WIRE |
| **AD-9 EVIDENCE-BEFORE-CLASSIFICATION** | pattern-matching "unused" → "useless" | No "dead" classification without: caller grep + wiring history + capability inventory |
| **AD-10 OPERATOR-CORRECTION LOOP** | corrections not compounding | When corrected: log + analyze + convert to prevention + verify the next decision applies it |

**These layers are the graph-logic branch's FIRST deliverable.**

| # | Trap | Detection | Consequence |
|---|---|---|---|
| AP-G1 | The graph-logic phase "runs" but typed_nodes stays ~0 | OR-A asserts nodes > 1,000 — a count, not a presence | The metas query a phantom graph (F-1 persists) |
| AP-G2 | The score retune "normalized" but every codebase grades RUNTIME | The dirty-fixture score test — NOT-RUNTIME must survive | False PASS class |
| AP-G3 | The immortal battery dies in the slim | The immortal fixture test per kept pattern | The self-audit sentinel dies |
| AP-G4 | The depth fix lands but the MCP server ignores depth | The subgraph depth unit test with a MOCK asserting the ARGS | V3 persists invisibly |
| AP-G5 | A deleted file is still imported by a test | The wave gate runs the FULL suite | Zombie resurrection |
| AP-G6 | The sequential hunter phase becomes an LLM phase | The phase's muse-call count MUST be 0 | The 30-min regression returns |
| AP-G7 | The rename touches the subagent internals (violating B1) | grep trident-derailment src = 0 hits allowed | The operator's B1 violated |

## §6 THE SUCCESS CRITERIA

| # | Criterion | Mechanical verification |
|---|---|---|
| SC-1 | The graph-logic phase populates ≥1,000 typed nodes on the v4.4.3 src | `sqlite3 shared.db 'SELECT COUNT(*) FROM typed_nodes'` > 1000 post-run |
| SC-2 | The meta gates run on the grounded graph | the engine log: graphify:query results non-empty; the hunters' reports cite graph-node ids |
| SC-3 | CORRELATIONS from ≥50 typed_edges | post-FINAL sqlite count |
| SC-4 | The wall clock < 20 min (container) | notifications.jsonl PRELIMINARY→FINAL timestamps |
| SC-5 | The preliminary findings ≤ 200 (the slim battery + immortal) | run-status candidatesSoFar at PRELIMINARY |
| SC-6 | The Step-X pass runs with the AP-7 gate (findings ≤ files×3) | the engine log: no chunk-adjudication of over-fired findings |
| SC-7 | The tool surface: `trident-graph-logic` is the SOLE primary; `trident-logic-audit` gone; the bug-hunter subagent tools unchanged (B1) | the tool list in the container agent's registry + grep: no trident-logic-audit registration |
| SC-8 | The score honesty: the dirty fixture NOT-RUNTIME, the golden RUNTIME | the score unit tests (both directions) |
| SC-9 | Zero regressions: hydra + aether-backend + math suites | the full battery 0 fail |
| SC-10 | The container-test results artifact: all scenarios PASS per the deep-container-testing law | .trident/container-test-results.json + Phase-E 10/10 |
| SC-11 | The abort contract: a graph-logic failure aborts the audit with error data (no degraded run) | the failure-injection test: map() throws → status GRAPH_LOGIC: FAILED, no gates dispatched, artifact carries the named error |

## §7 THE COMPACTION-PROOF IMPLEMENTATION GUIDE

The implementation waves update, per wave:
1. `Context_Management/RUNNING_BUILD_LOG.md` — the wave entry with the evidence.
2. `Context_Management/BUILD_STATE.md` — the new dist SHA + the suite counts at every gate.
3. `Context_Management/CURRENT_STATE.md` — the module inventory changes.
4. THIS SPEC's §6 checklist — tick SC items as they prove.
5. The compaction anchors: THIS spec, the wave ledger, the checkpoint (post-Wave X).
Cross-consistency: every doc's dist SHA matches dist/sha256.txt at cite time.

## §8 THE OPEN QUESTIONS

| # | Question | Recommendation |
|---|---|---|
| Q1 | The generic corpus profile | GENERATE per-target in the graph-logic phase |
| Q2 | The semantic extraction pass (currently `semantic=[]`) | LATER — the mechanical MAP is the grounding |
| Q3 | The bug-hunter remnants sweep (393 hits) | AFTER Waves W/T/M/X prove — cosmetic wave |
| Q4 | The R6-B dead-import sub-detector | Keep until SRO proves in-degree-0 recall on the same fixtures |

## APPENDIX A — THE ZERO-TRUST AUDIT

| Severity | Finding | Surgical edit |
|---|---|---|
| HIGH | The graph-logic phase's profile dependency (Q1) unresolved | Q1's recommendation: generate per-target |
| MEDIUM | The hunter's map(profile) root translation implicit | The wrapper owns the translation |
| MEDIUM | The V4 splice fix lacks the exact SQL | The spec names the mechanism + the gate |
| LOW | The score retune constants (30/20) are estimates | Both directions must hold; tune to satisfy both |
| LOW | instances/ deletion: types.ts may carry imports beyond instances | The K3 gate greps SubagentSpec post-delete |

**THE ANTI-DERAILMENT LAYERS — built from the 2026-08-30 session failure catalogue (see RUNNING_DEBUG_LOG for the full 8-failure evidence).**

These are NOT documentation — they are mechanical guardrails that MUST be built as code in the graph-logic branch:

| Layer | Prevents | Implementation |
|---|---|---|
| **AD-1 SUPPLY-CHAIN CHECK** | deleting a module that has live importers | Pre-edit hook: `grep -rn <module> src/ --include="*.ts" | grep -v __tests__ | grep -v Checkpoints` — any hit outside the module = HALT + surface |
| **AD-2 WIRING-VS-DELETION GATE** | deleting unmigrated capability | Before "dead" classification: (a) was it ever wired? (b) why unwired? (c) gap or intentional? Gap → WIRE |
| **AD-3 OPERATOR-CUT LAW** | unsupervised ripouts | Deletions >10 lines: agent maps + proposes; operator cuts |
| **AD-4 RESTORE-POINT** | irreversible cascades | Multi-file edits require a pre-edit checkpoint (tmp copy or git stash) |
| **AD-5 TYPE-CHECK PER-EDIT** | compound edit errors | After each file edit: tsc scoped to that file. New error = STOP |
| **AD-6 GRAPH-STATE MONITOR** | the phantom graph recurring | After graph populate: `SELECT COUNT(*) FROM typed_nodes` > 0 asserted. 0 = LOUD error |
| **AD-7 MICRO/MACRO FIREWALL** | graph store conflation | graphify (micro) and corbell (macro) are SEPARATE. Exchange: structured comms (tags + graphDigest), never schema merge |
| **AD-8 INCOMPLETE-MIGRATION CHECK** | calling unmigrated capability "dead" | Diff current pipeline vs AETHER_CODE_AUDIT_OVERHAUL_ARCHITECTURE.md. Missing = migration gap → WIRE |
| **AD-9 EVIDENCE-BEFORE-CLASSIFICATION** | pattern-matching "unused" → "useless" | No "dead" classification without: caller grep + wiring history + capability inventory |
| **AD-10 OPERATOR-CORRECTION LOOP** | corrections not compounding | When corrected: log + analyze + convert to prevention + verify the next decision applies it |

**These layers are the graph-logic branch's FIRST deliverable** — they prevent the re-architecture from creating the same class of damage this session already caused (F-1 through F-8 in RUNNING_DEBUG_LOG).

| # | Trap | Detection | Consequence |
|---|---|---|---|
| AP-G1 | The graph-logic phase "runs" but typed_nodes stays ~0 (the populate silently failed) | OR-A asserts nodes > 1,000 — a count, not a presence | The metas query a phantom graph (F-1 persists) |
| AP-G2 | The score retune "normalized" but every codebase grades RUNTIME | The dirty-fixture score test — NOT-RUNTIME must survive | False PASS class (the operator's F-8) |
| AP-G3 | The immortal battery dies in the slim (a kept rule's matcher quietly stopped firing) | The immortal fixture test per kept pattern (r17.fake-return parity) | The self-audit sentinel dies |
| AP-G4 | The depth fix lands but the MCP server ignores depth (the server-side param name differs) | The subgraph depth unit test with a MOCK asserting the ARGS (not the result) | V3 persists invisibly |
| AP-G5 | The kill list deletes a file a test still imports → the suite "fails" → someone re-adds the file | The wave gate runs the FULL suite (not scoped) | Zombie resurrection |
| AP-G6 | The sequential hunter phase becomes an LLM phase (scope creep: "let's add semantic extraction") | The phase's muse-call count MUST be 0 (grep muse/llm in graph-logic-phase.ts) | The 30-min regression returns |
| AP-G7 | The rename touches the subagent internals (violating B1) | grep trident-derailment src = 0 hits allowed | The operator's B1 violated |

