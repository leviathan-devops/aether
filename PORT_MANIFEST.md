# PORT MANIFEST — Aether_Machine_Boilerplate (THE spec; there is no other spec)

**Source of truth:** `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Active_Projects/v4.4.3/src/` (dist 54b50f18…, host-verified working machinery)
**Target:** `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/Aether_Machine_Boilerplate/`
**Predecessor:** the deleted Aehter_Trident_Boilerplate — its failure record is `../BOILERPLATE_FAILURE_LOG.md`. READ IT FIRST. This spec exists to make its failure class mechanically impossible.

## THE MANDATE (operator, verbatim — the interpretation law)
- "THIS IS A COPY PASTE OF THE CODE AUDIT TOOL SIMPLY WALKED BACKWARDS 1-2 STEPS SO ITS NOT A LITERALLY 'TRIDENT CODE AUDIT' TOOL BUT IS INSTEAD A FUNCTIONING 'AETHER MACHINE' BOILERPLATE"
- "WE ARE REVERSE ENGINEERING THE FULL FOUNDATION OF THIS CODEBASE AS IF WOULD HAVE EXISTED IF WE HAD PORTED THIS FROM THE START AND BUILT THIS CODE AUDIT TOOL ON TOP OF"
- "FULL BOILERPLATE OF THE EMBEDDED AGENT SYSTEMS HERE… EACH meta layer fully boilerplate engineered with ALL OF ITS MICROSTRUCTURES AND AETHER AGENT SYSTEMS"
- "with as minimal simplifications as possible"
- "DO NOT DELETE ANY TOOLS, HARNESSES, WORKING MACHINERY, ETC"
- "hunters" → "workers"; graph mode dial `mcp | native`; do not remove ANY core infra.

## THE LAW (one sentence)
**PORT, DON'T WRITE.** Every file below is COPIED from source and transformed ONLY by the §TRANSFORM map (de-branding renames + import-path fixes). No file is designed, re-implemented, simplified, "referenced," or modernized. If a file's logic changes beyond the rename map, the port of that file is VOID and is redone.

**The mental model:** the v4.4.3 tree IS the boilerplate. We are renaming it, not rebuilding it. "Walked back 1-2 steps" means: the trident plugin registration/identity layer is wrapped behind a neutral seam — NOT that any engine, tool, harness, brain, graph, layer, template, or instance is absent.

## §SCOPE
Seed trees (the aether machine):
1. `src/audit-engine/**` — the 4-phase audit engine, layers, events, math, enforcement, lexicons, harness, aether-backend, aether/ brain dir
2. `src/hydra/**` — the agent team layer: auditor, meta, tools, report-reader, pipeline, memory, graphify, graph-mapper, corbell-bridge, instances (LASME/MPSE/SRO), 17 templates
3. `src/shared/knowledge-graph/**` — db, query-engine, profile-loader, migrations, ontology
4. `src/subagents/trident-bug-hunter/graph/**` — corbell-adapter, corbell-embeddings

**§PHASE-0 CLOSURE (mechanical, before any wave):** the seed trees import beyond themselves (verified: `identity/`, `subagents/trident-bug-hunter/harness/{map,scan,trace}.ts`, `subagents/trident-bug-hunter/surface/query-tool.ts`, `shared/*`, `utils/`, `types/`, `testing/`, `tools/`, `instances/`, `poseidon/`). Write a closure script (walk static imports from the seed set, BFS, exclude `node_modules`/`dist`) → APPEND every closure file to §MANIFEST with its line count → FREEZE the manifest. **The frozen manifest is the complete port contract. Nothing outside it changes; everything inside it ports.**

## §MANIFEST (the file contract — source path → target path, with source line counts)

Target tree mirrors source structure 1:1 except the §TRANSFORM path renames. Test files (`__tests__/`, `*.test.ts`) PORT WITH their modules — they are the fidelity verification.

### PW1 — THE ATOM'S MUSCLE (harness + tools + backend) — the JESL-blocking wave
| Source (under src/) | L | Target (under src/) |
|---|---|---|
| audit-engine/harness/pi-aether-agent.ts | 479 | audit-engine/harness/pi-aether-agent.ts |
| audit-engine/harness/pi-audit-tools.ts | 46 | audit-engine/harness/pi-audit-tools.ts |
| audit-engine/harness/__tests__/pi-aether-agent.test.ts | 224 | ported alongside |
| hydra/aether-tools.ts | 391 | hydra/aether-tools.ts |
| hydra/__tests__/aether-tools.test.ts | 197 | ported alongside |
| hydra/tool-usage-lexicon.ts | 269 | hydra/tool-usage-lexicon.ts |
| audit-engine/aether-backend/agent.ts | 364 | audit-engine/aether-backend/agent.ts |
| audit-engine/aether-backend/runner.ts | 394 | audit-engine/aether-backend/runner.ts |
| audit-engine/aether-backend/tools.ts | 283 | audit-engine/aether-backend/tools.ts |
| audit-engine/aether-backend/demand-builder.ts | 224 | audit-engine/aether-backend/demand-builder.ts |
| audit-engine/aether-backend/identity.ts | 134 | audit-engine/aether-backend/identity.ts |
| audit-engine/aether-backend/probe.ts | 136 | audit-engine/aether-backend/probe.ts |
| audit-engine/aether-backend/phase-controller.ts | 145 | audit-engine/aether-backend/phase-controller.ts |
| audit-engine/aether-backend/provider.ts | 52 | audit-engine/aether-backend/provider.ts |
| audit-engine/aether-backend/go-key-pool.ts | 90 | audit-engine/aether-backend/go-key-pool.ts |
| audit-engine/aether-backend/rpm-ledger.ts | 142 | audit-engine/aether-backend/rpm-ledger.ts |
| audit-engine/aether-backend/report/{evidence,validator,manifest,verdicts,markers}.ts | 230 | report/ ported 1:1 |
| audit-engine/aether-backend/index.ts | 8 | index.ts |
| aether-backend tests (battery 635, ledger-artifacts 349, identity-demand 306, meta-audit 278, go-key-pool 239, report 68) | 1,875 | ported alongside |

### PW2 — THE TEAM LAYER (hydra core) 
| Source | L | Target |
|---|---|---|
| hydra/aether-auditor.ts | 233 | hydra/aether-auditor.ts |
| hydra/aether-meta.ts | 464 | hydra/aether-meta.ts |
| hydra/aether-report-reader.ts | 409 | hydra/aether-report-reader.ts |
| hydra/pipeline.ts | 168 | hydra/pipeline.ts |
| hydra/findings-map.ts | 259 | hydra/findings-map.ts |
| hydra/memory.ts | 158 | hydra/memory.ts |
| hydra/types.ts | 268 | hydra/types.ts |
| hydra/evidence.ts | 57 | hydra/evidence.ts |
| hydra tests (integration 627, aether-meta 345, memory 315, pipeline 313, aether-auditor 170, aether-report-reader 152, evidence 137) | 2,059 | ported alongside |

### PW3 — THE GRAPH + CORBELL CORE
| Source | L | Target |
|---|---|---|
| shared/knowledge-graph/db.ts | 870 | shared/knowledge-graph/db.ts |
| shared/knowledge-graph/query-engine.ts | 355 | shared/knowledge-graph/query-engine.ts |
| shared/knowledge-graph/profile-loader.ts | 522 | shared/knowledge-graph/profile-loader.ts |
| shared/knowledge-graph/{profile-schema,migrations,ontology,kind-for-layer,bun-modules.d.ts}.ts | 259 | ported 1:1 |
| knowledge-graph tests (profile 230, family-store 203, db 190, retrieval 182, compounding 142) | 947 | ported alongside |
| hydra/graphify.ts | 160 | hydra/graphify.ts |
| hydra/graph-mapper.ts | 318 | hydra/graph-mapper.ts |
| hydra/corbell-bridge.ts | 111 | hydra/corbell-bridge.ts |
| hydra/__tests__/{graphify 168, corbell-bridge 125} | 293 | ported alongside |
| subagents/trident-bug-hunter/graph/corbell-adapter.ts | 789 | graph-corbell/corbell-adapter.ts (path de-brand) |
| subagents/trident-bug-hunter/graph/corbell-embeddings.ts | 441 | graph-corbell/corbell-embeddings.ts |
| graph tests (corbell-adapter 661, corbell-embeddings 344, corbell-native 327) | 1,332 | ported alongside |

### PW4 — THE ENGINE CORE (audit-engine)
| Source | L | Target |
|---|---|---|
| audit-engine/index.ts | 1,260 | audit-engine/index.ts |
| audit-engine/code-classifier.ts | 1,153 | audit-engine/code-classifier.ts |
| audit-engine/ast/audit-ast-core.ts | 1,011 | audit-engine/ast/audit-ast-core.ts |
| audit-engine/layer-engine.ts | 234 | audit-engine/layer-engine.ts |
| audit-engine/layers/** — r0→r16 + r-actor, r-lexicon, r-adapter, r-graph, r-mpse, r-state-machine, r-dh-feed, r-provenance, r-engine, activation (~25 files) | ~8,000 | layers/** ported 1:1 |
| audit-engine/graph/{audit-graph.ts 281, graph-backed-audit.ts 347} | 628 | graph/** ported 1:1 |
| audit-engine/graph-logic-phase.ts | 110 | ported 1:1 |
| audit-engine/run-status.ts / gate-stitch.ts / types.ts / preflight.ts | 918 | ported 1:1 |
| audit-engine/events/** (9 files) | 2,512 | events/** ported 1:1 |
| audit-engine/aether/** brain (10 files: step-x-orchestrator…pi-report-write-tool) | 2,418 | aether/** ported 1:1 |
| audit-engine/math/** (eval, contract, oracle, expr, firewall, index) | 606 | math/** ported 1:1 |
| audit-engine/{scoring,evidence-gate,fix-prioritizer,triad,hive-loader,deploy-manifest,test-plan-generator}.ts | 1,237 | ported 1:1 |
| audit-engine/enforcement/{self-audit,audit-enforcement}.ts | 491 | ported 1:1 |
| audit-engine/input/{audit-spec,spec-bindings}.ts | 580 | ported 1:1 |
| audit-engine/lexicons/** (4 files) | 690 | ported 1:1 |
| audit-engine/ship-gate/checks.ts | 193 | ported 1:1 |
| audit-engine/{context/audit-project-context,runtime/runtime-verification}.ts | 324 | ported 1:1 |
| audit-engine __tests__ (~40 files) | ~6,000 | ported alongside |

### PW5 — THE TEMPLATES + INSTANCES (the configured machine)
| Source | L | Target |
|---|---|---|
| hydra/aether-templates/hunters/*.ts (14 workers: lasme-{actor,adapter,engine,lexicon,mpse-threshold,state-machine}, mpse-{contract,oracle,provenance,stage}, sro-{cycles,dead-code,graph,path}) | ~1,430 | hydra/aether-templates/workers/*.ts (hunters→workers) |
| hydra/aether-templates/meta/{lasme-meta,mpse-meta,sro-meta}.ts | 275 | aether-templates/meta/** |
| hydra/aether-templates/types.ts | 45 | ported 1:1 |
| hydra/instances/{lasme,mpse,sro}.ts | 1,642 | instances/** (the configured pipelines — domain examples, kept) |
| instances tests (sro 302, lasme 229, mpse 216) | 747 | ported alongside |

(§PHASE-0 appends the closure rows: identity/, bug-hunter harness/+surface/, shared/*, utils/, types/… — with line counts — then this manifest is FROZEN.)

## §TRANSFORM (the ONLY permitted edits)
**Path renames:**
- `src/subagents/trident-bug-hunter/graph/` → `src/graph-corbell/`
- `hydra/aether-templates/hunters/` → `hydra/aether-templates/workers/`
**Identifier/string renames (mechanical, whole-word, per file):**
- `trident-bug-hunter` → `aether-worker` · `bug-hunter`/`bugHunter`/`BugHunter` → `aether-worker`/`aetherWorker`/`AetherWorker`
- `hunter`/`Hunter` → `worker`/`Worker` (in agent-role senses; NEVER in unrelated words)
- `Trident`/`trident` → `Aether`/`aether` ONLY where it names the tool/brand; **domain-lexicon strings that the machinery matches on (marker literals, gate labels like `[TRIDENT …]`) are renamed via ONE constants module so behavior is identical under the new name**
- The identity strings in aether-backend/identity.ts → neutral (`aether-machine` namespace)
**Always permitted:** import-path fixes for the renamed dirs, the rename map itself, adding the neutral seam wrappers of §SEAMS.
**Never permitted:** logic changes, signature changes, deletions, "simplifications," reformatting, dependency swaps, size reductions, file splits/merges. **If it doesn't compile after the rename map, the fix is more transform — never less machinery.**

## §SEAMS (the "walked back 1-2 steps" — wrap, don't delete)
1. **The plugin runtime seam:** references to the opencode plugin runtime (client/session/tool-registration) get a thin adapter interface (`src/runtime-seam/`) with the v4.4.3 wiring as the ONE implementation. The machinery's calls route through the seam; NOTHING is deleted.
2. **The graphify Python server + corbell data paths:** stay exactly as source (env-configurable paths). The `mcp` mode is the default as in source; no invented "native" fallback — if source has one, it ports; if not, it doesn't exist.
3. **Domain lexicons/enforcement configs (LASME/MPSE/SRO, trident-specific rules):** they ARE the examples of a configured machine. They port verbatim as the shipped reference instances.

## §GATES (per wave — fidelity first, compilation second)
1. **PORT-FIDELITY DIFF (the gate that was missing):** for every manifest row: file PRESENT in target; line count ≥ 90% of source (post-rename delta documented); every source `export` present in target. Produced as a table in `.port/fidelity-PW<n>.md`. A row failing = the wave fails.
2. `npx tsc --noEmit` exit 0 on the growing tree.
3. **The wave's ported tests green** (`bun test` on the ported test files).
4. `grep -ri "trident" src/` = 0 authored matches (the §TRANSFORM constants-module pattern keeps matched literals consistent).
5. No NEW files outside the manifest + §SEAMS wrappers.

## §FINAL-PROOF (after PW5)
1. The full ported test suite green in the target tree.
2. **A LIVE ROUND: one real agent run through the ported harness with the TOOLS FIRING** (a worker reads a target file, queries the graph, emits FINDING blocks, the validator accepts the report from disk). Recorded as artifacts + exit codes.
3. The complete fidelity report `.port/fidelity-FINAL.md` — every manifest row, source L vs target L vs delta, export parity.
4. Zero-branding grep; the §SEAMS documented; checkpoint saved.

## §FORBIDDEN (the list that kills the failure class)
- NO re-implementations. NO "reference implementations." NO clean-room code. NO interface sketches as specs. NO size targets (the previous spec's "1260L → ~400L" line is the canonical crime). NO simplifications "for clarity." NO deleting tools/harnesses/brains/graphs/layers/templates/instances/events/math. NO new architecture. NO mock transports. A dispatch for this work contains the words: **"COPY the source file. Apply the rename map. Fix imports. Change NOTHING else."**

## §WAVES + DISPATCH MECHANICS
Five waves (PW1→PW5), serialized (each wave's fidelity gate before the next fires), B1 desks with disjoint file sets. Dispatch from the v4.4.3 root as projectToken (the aether-pipeline requirement); the wave-spec lives at BOTH `.trident/wave-spec.json` and the session-scoped copy. Every dispatch prompt carries: the source file list, the target list, the §TRANSFORM excerpt, the §GATES, and the forbidden list verbatim. The wave audit runs the fidelity diff itself — the desk's "done" means nothing without it.
