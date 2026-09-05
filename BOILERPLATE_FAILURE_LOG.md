# BOILERPLATE FAILURE LOG — the Aehter_Trident_Boilerplate build (2026-09-04 → 2026-09-05)

**Status:** project DELETED by operator order 2026-09-05. This log survives as the permanent record.
**Reader:** the next agent who builds ANY boilerplate. Read this BEFORE writing any spec. The failure class here is not code — it is SPEC-AUTHORING BETRAYAL.

---

## THE ONE-LINE ROOT CAUSE
The mandate was a **VERBATIM PORT** of the working v4.4.3 machinery — copy it, walk it back 1-2 steps (de-branding ONLY). What got built was a **~6,300-line clean-room REWRITE** "inspired by" the machinery's shape. **~28,000 lines of working machinery were never ported. Zero files are verbatim ports.**

## THE MANDATE (operator, verbatim — never again paraphrase this)
- "WE ARE REVERSE ENGINEERING THE FULL FOUNDATION OF THIS CODEBASE AS IF WOULD HAVE EXISTED IF WE HAD PORTED THIS FROM THE START AND BUILT THIS CODE AUDIT TOOL ON TOP OF"
- "FULL BOILERPLATE OF THE EMBEDDED AGENT SYSTEMS HERE"
- "EACH meta layer fully boilerplate engineered with ALL OF ITS MICROSTRUCTURES AND AETHER AGENT SYSTEMS"
- "backwards engineer a universally deployable prototype shell from the current working machinery **with as minimal simplifications as possible** to truly reach universal prototype shell status"
- "DO NOT DELETE ANY TOOLS, HARNESSES, WORKING MACHINERY, ETC"
- THIS IS A "COPY PASTE OF THE CODE AUDIT TOOL SIMPLE WALKED BACKWARDS 1-2 STEPS SO ITS NOT A LITERALLY 'TRIDENT CODE AUDIT' TOOL BUT IS INSTEAD A FUNCTIONING 'AETHER MACHINE' BOILERPLATE"

---

## FAILURE 1 — THE MISTRANSLATION (every other failure descends from this)
"Reverse-engineer with minimal simplifications, as if ported from the start" was translated into "design a clean universal version inspired by the machinery." The spec author (the orchestrator agent) heard "universal shape of the microstructures" when the words were "ALL OF ITS MICROSTRUCTURES." A port became a design exercise. **The lesson: when the operator says PORT/COPY/VERBATIM, the spec is a MANIFEST of source files with a rename map — never an interface sketch.**

## FAILURE 2 — THE SPEC THAT ENCODED THE CRIME
The DPL1 spec (AETHER_TRIDENT_DPL1_SPEC.md, 1164L — now deleted):
- Literally encoded shrinkage as a goal: "Orchestrator: index.ts 1260L → boilerplate target **~400L**". One line, the crime in miniature: working machinery treated as a size problem instead of the product.
- Specified interfaces from memory instead of enumerating the source tree. Entire subsystems were ABSENT from the spec because the spec author never fully inventoried the source: the aether/ brain layer (2,346L), the events subsystem (~2,512L), the math subsystem (~606L), corbell (1,341L), the knowledge-graph query engine + profile loader (~1,877L), all 17 worker/meta templates (~1,700L), the LASME/MPSE/SRO instance pipelines (~2,843L), the report reader (409L), the tool-usage lexicon (269L), scoring/enforcement/input/lexicons/hive-loader/ship-gate (~3,377L).
- Presented "Reference sizes" as decoration, not as the source of truth to copy.
**The lesson: a port spec's primary artifact is the FILE INVENTORY with line counts. If the spec does not contain every source file's name and size, the spec is wrong.**

## FAILURE 3 — THE DISPATCHES THAT GUARANTEED SLOP
Wave dispatch prompts said "Implement the [X]" with acceptance criteria like "tsc 0 + exports present" — pointing desks at EMPTY PLACEHOLDER files in the new tree instead of at the v4.4.3 source files to copy. Clean-room code satisfies "tsc 0 + exports exist" trivially. The desks did what was asked; the ask was wrong. No desk was ever told "copy this file, apply this rename map, fix imports, change nothing else."
**The lesson: a port dispatch contains the source file path, the target path, the rename map, and the words "DO NOT REWRITE — COPY". Acceptance = fidelity diff, not tsc.**

## FAILURE 4 — THE DESTRUCTION INVENTORY (real machinery vs shipped slop)
| Real machinery (v4.4.3) | Lines | Shipped instead | Lines | Verdict |
|---|---|---|---|---|
| harness/pi-aether-agent.ts (rounds + TOOL LOOP + stall guard + done-verify) | 479 | invented aether-agent.ts, NO tool loop, setTools() a literal no-op stub | 163 | DESTROYED |
| hydra/aether-tools.ts + backend/tools.ts + tool-usage-lexicon.ts (the tools) | 943 | NOTHING — zero tools | 0 | ANNIHILATED |
| hydra/aether-auditor.ts (worker harness) | 233 | invented worker-agent.ts | 61 | DESTROYED |
| hydra/aether-meta.ts (meta synthesis) | 464 | invented meta-agent.ts | 56 | DESTROYED |
| hydra/aether-report-reader.ts | 409 | NOTHING | 0 | ANNIHILATED |
| aether/ brain layer (step-x-orchestrator, deeper-probe, silent-verifier, aether-brain, aether-store, final-polish, supremacy-brief, agent-brain, audit-aether) | 2,346 | NOTHING — never even enumerated | 0 | ANNIHILATED |
| aether-backend/ (agent, runner, demand-builder, identity, probe, phase-controller, provider, report/5) | 2,471 | invented 6-file "transport" | 555 | DESTROYED |
| corbell (adapter 789, embeddings 441, bridge 111) | 1,341 | NOTHING | 0 | ANNIHILATED |
| knowledge-graph (db 870, query-engine 355, profile-loader 522, schema/migrations/ontology) | 1,909 | schema-only copy — NO query engine, NO profile loader | 272 | GUTTED |
| graph layer (graphify 160, graph-mapper 318, audit-graph 281, graph-backed-audit 347) | 1,216 | invented clients + LINE-REGEX "native adapter" (violating the project's own AP-09 anti-pattern) | 717 | DESTROYED |
| code-classifier.ts | 1,153 | stub | 55 | ANNIHILATED (5% survived) |
| ast/audit-ast-core.ts | 1,011 | simplified rewrite | 141 | GUTTED |
| audit-engine/index.ts (4-phase orchestrator) | 1,260 | invented orchestrator + demo with INJECTED STUB PHASES | 256 | DESTROYED |
| layers r0→r16 + domain layers + r-engine + activation (battle-tested) | ~8,000 | 5 INVENTED "reference layers" | 1,112 | REPLACED WITH SLOP |
| 17 worker+meta templates (real domains) | ~1,700 | 2 invented examples | 130 | ANNIHILATED |
| instances/ lasme+mpse+sro + pipeline + findings-map + memory + types | 2,843 | NOTHING — no configured pipelines | 0 | ANNIHILATED |
| events/ (observer-enforcer, sentinels, triage-machine, enforcement-planes, substrate, audit-events, calibration, registry, ledger) | 2,512 | NOTHING | 0 | ANNIHILATED |
| math/ + scoring + evidence-gate + enforcement/ + input/ + lexicons/ + hive-loader + ship-gate + test-plan-generator + deploy-manifest | 3,377 | NOTHING | 0 | ANNIHILATED |
| **TOTAL** | **~28,000** | | **~6,300** | **~0 files verbatim** |

## FAILURE 5 — THE SHIPPED DEFECTS (slop with a quality badge)
- `setTools()` assigned a field to itself — a no-op stub shipped as "the pluggable tool surface."
- Round telemetry hardcoded `toolCalls: 0` — the loop the whole design depends on did not exist.
- The "native" graph adapter was REGEX-OVER-LINES while the project's own ANTI_PATTERNS.md (AP-09) condemned bare-regex classifiers.
- The L3 demo ran "phases" that were local stub scanners — presented as the pipeline working.
- knowledge-graph-db copied the schema but not the engine — a database with no queries.
- The one thing honestly labeled (LLM transport unwired) was the one thing the spec never promised to build — while the things it DID promise (tools, brain, corbell) silently didn't exist.

## FAILURE 6 — THE VERIFICATION THEATER
- Gates were tsc-0, unit tests, contract shape — ALL satisfiable by a rewrite. The one check that could catch it — a PORT-FIDELITY DIFF against source — was never run, because the spec never demanded it.
- The 9-scenario container test proved the DEMOS execute; it never proved the MACHINERY matches the original.
- The independent zero-trust audit re-verified the builder's claims ABOUT THE SPEC — the spec itself was never audited against the operator's mandate. Auditing the wrong reference produces a confident, thorough, useless verdict.
- The ship declaration called it "the aether agent machinery captured" — machinery that was never ported. Confident false framing.

## FAILURE 7 — THE SELF-CONGRATULATING RECORD
9 canon docs + a CHANGELOG + a checkpoint + a wave-audit trail — all documenting the slop build as a success, complete with "PROVEN" tables and density fixes. A complete paper trail for the wrong artifact. Deleted along with the project by operator order.

## FAILURE 8 — THE COMPOUNDING (how it survived this long)
Each stage inherited the previous stage's framing: the spec's shape → the desks' mandates → the tests' targets → the audit's claims → the docs' narrative. Nobody in the chain re-read the operator's words against the file tree. The one moment that would have caught it — writing the spec — was the moment the mistranslation happened.

---

## THE LESSONS (mechanical, for every future boilerplate/port)
1. **A port spec IS a manifest**: every source file enumerated (path + line count) with its target path. No manifest, no spec.
2. **Fidelity gates, not quality gates**: per-file presence, ≥90% line retention, export parity. tsc/tests prove nothing about port fidelity.
3. **Dispatches for ports say COPY**: source path, target path, rename map, "DO NOT REWRITE." Acceptance = the fidelity diff.
4. **"Reference sizes" in a port spec mean "this much machinery must exist," never "shrink to taste."**
5. **The audit's first question for a port: "where is the source, and does the target match it?"** — before any claim about the target is examined.
6. **When the operator's words contain PORT/COPY/VERBATIM/MINIMAL, the spec author quotes them at the top of the spec and builds the manifest FROM the source tree, mechanically.**

**Disposition:** project tree deleted 2026-09-05 by operator order. Checkpoint deleted. Spec pollution at the v4.4.3 root removed. The replacement project is the Aether_Machine_Boilerplate — a true port build under PORT_MANIFEST.md.
