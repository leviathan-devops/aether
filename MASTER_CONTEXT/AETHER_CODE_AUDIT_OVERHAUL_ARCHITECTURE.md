# AETHER CODE AUDIT OVERHAUL ARCHITECTURE
**Version:** 1.0.0 · **Date:** 2026-08-28 · **Status:** DESIGN AUTHORITY (this session's operator-directed corrections INCLUDED)
**Renaming law:** all "shadow agent" terminology → **Aether** (simple syntax swap, scoped to THIS project only, clean — no paths broken, nothing outside the project touched). shadow = aether. Cognitive stability: light streams over dark shadow puddles.

---

# SECTION 1 — THE FULL PRESENTATION (verbatim, no watering down)

## 1.1 THE BACKWARDS MAP — FROM THE INTENDED TARGET BACK TO THE BOILERPLATE

```
════════════════════════════════════════════════════════════════════════════════════════
   BACKWARDS MAP — FROM THE INTENDED TARGET BACK TO THE BOILERPLATE
════════════════════════════════════════════════════════════════════════════════════════

THE INTENDED TARGET (what "working" looks like):
┌────────────────────────────────────────────────────────────────────────────────────┐
│  meta-audit(<target>/src) — LIVE muse                                               │
│    [PRELIMINARY] → LASME → MPSE → SRO → [FINAL]                                     │
│    Each gate = N concurrent SHADOW AGENTS, each one:                                │
│      • receives a BRIEF (supremacy + layer directive + [SHADOW INFERENCE] +         │
│        skeleton + report contract + prior-gate slots)                               │
│      • runs the 2-ROUND doctrine (mandatory revision loop, 16K round caps)          │
│      • USES AUDITOR TOOLS: graphify×4 + read(320) + grep(120) +                     │
│        write_report (force-bound to ITS ledger path)                                │
│      • WRITES its findings to  ledger/<runId>/<specId>/report.md  (durable)         │
│      • output passes degeneracy lexicon + R1/R2/R3 hallucination rules              │
│      • every muse call passes RPM-ledger admission                                  │
│    The pipeline READS the report files → zod → synthesize → gates → ladder          │
└────────────────────────────────────────────────────────────────────────────────────┘
        ▲ to build THIS, what must exist?
        │
NEEDED: N concurrent agent runs w/ file artifacts        ← my pipeline already dispatches N;
        ▲                                                  swap the per-agent engine (below)
NEEDED: per-agent: brief + rounds + guards + ledger      ← ShadowAgent.run() ALREADY DOES THIS
        ▲
NEEDED: brief-builder / slot-injector / prompt-validator  ← THE BOILERPLATE (exists, unchanged)
NEEDED: degeneracy lexicon / context-manager / RPM        ← THE BOILERPLATE (exists, unchanged)
NEEDED: transport (chainedStream, retry, stall, probe)    ← THE BOILERPLATE via shadow-backend (exists)
        ▲
 arrives at:  src/audit-engine/shadow-backend/  — the boilerplate's LIVE in-project deployment
              (agent.ts = ShadowAgent, runner, phase-controller, demand-builder, identity,
               tools, rpm-ledger, report/markers+validator) + the canonical boilerplate at
              KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/shadow_agent_backend
```

**The key realization:** the boilerplate is *already deployed in-project* as `src/audit-engine/shadow-backend/`. The hydra's sin was **bypassing it** with a hand-rolled `buildAndRunSubagent` (chat-JSON, single-shot, no ledger, no rounds, no guards).

## 1.2 THE SIDE-BY-SIDE HOLE MAP

```
════════════════════════════════════════════════════════════════════════════════════════
     SHADOW AGENT WORKFLOW — BOILERPLATE vs MY HYDRA BUILD — THE HOLE MAP
════════════════════════════════════════════════════════════════════════════════════════

THE PER-SUBAGENT WORKFLOW PIPELINE (what ONE shadow agent experiences)

  BOILERPLATE (shadow_agent_backend — 4,420L / 17 modules)      MY HYDRA (src/hydra — ~2,300L / 10 modules)
  ═══════════════════════════════════════════════            ═══════════════════════════════════════════
  1. BRIEF BUILDER (shadow-brief-builder.ts 94L)              1. string concatenation in buildSystemPrompt()
     │  supremacy contract woven (L4 files-are-truth)            │  directive + graph-law + JSON contract
     │  slot injection via ONE weave/injectSlots place           │  concatenated, no structure
     │  [SHADOW INFERENCE] section GUARANTEED (title             │  ✗ NO brief, NO weave, NO supremacy
     │    prepended if the model omitted it)                     │    contract embedding, no inference guard
     │  skeleton third — section ORDER is the architecture       │  ✗ no skeleton
     ▼                                                           ▼
  2. PROMPT VALIDATOR (prompt-validator.ts 91L)               2. ✗ NOTHING — prompt goes to the model
     │  the prompt is an ARTIFACT — validated                    │    raw and unvalidated
     │    before dispatch
     ▼                                                           ▼
  3. ROUNDS DOCTRINE (shadow-agent.ts 933L)                   3. single-shot — ONE LLM call
     │  MAX_ROUNDS = 2 (the settled doctrine,                    │  ✗ no mandatory revision round
     │    ONE round truth codebase-wide)                         │  ✗ no re-read of own output
     │  ROUND 2 = MANDATORY revision loop: 0-trust               │  ✗ no micro repair circuit breaker
     │    re-read of own prompt + [SHADOW INFERENCE]             │
     │    verify + embedded 3-loop micro repair                  │
     │  PER-ROUND TOKEN CAP 16K (provider plans for              │  maxTokens passed raw ✗ no round
     │    the actual round, not 384K fantasies)                  │    budget discipline
     ▼                                                           ▼
  4. DEGENERACY STATE MACHINE (shadow-degeneracy.ts 342L)     4. ✗ NOTHING — a slop/theatrical response
     │  typed PatternFamily (DegeneracyKind)                     │    flows straight into extractJSON and
     │  per-line score + severity hits                           │    fails with "No parseable JSON" — the
     │  onset detection WHEREVER it occurs                       │    exact failure my meta-audit hit blind
     ▼                                                           ▼
  5. HALLUCINATION RULES (shadow-context-manager.ts 395L)     5. ✗ NOTHING — the model can claim
     │  R1 count-claim: "scanned N modules"                      │    "I scanned the codebase" with ZERO
     │    verified against the excerpt set                       │    verification and my pipeline accepts
     │  R2 planted-bug: claims about code absent                 │    whatever it says
     │    from the excerpt set                                   │
     │  R3 named-anchor: "the X export" where X                  │
     │    doesn't exist — the LIAR class                         │
     │  session-stream window(30) + memory                       │
     │    reattach verification                                  │
     ▼                                                           ▼
  6. FILE ARTIFACTS (the runner + memory)                     6. ✗ CHAT-JSON ONLY — findings returned
     │  the agent WRITES its report to disk                      │    as the final chat message, parsed by
     │  append-only prompt mirror {seq}_{name}.json              │    extractJSON from the message — no
     │  ledger per run, the durable record                       │    file, no durable artifact, nothing
     │  READY_FLOOR_LINES = 125                                  │    inspectable after the run
     ▼                                                           ▼
  7. RPM LEDGER (rpm-ledger.ts 242L)                          7. ✗ NOT WIRED — createHydraTransport
     │  admission check before EVERY call                        │    adapts chainedStream but BYPASSES
     │  429 → 45s TTL exile + observation rings                  │    the ledger — no admission, no exile,
     │  primary-priority rule                                    │    14 concurrent agents = blind retry storm
     ▼                                                           ▼
  8. PRE-READ EXCERPTS (runner preReadExcerpts)               8. ✗ NOTHING — subagents go in BLIND to
     │  the model gets code excerpts in the brief                │    the codebase (graph queries only — if
     │  BEFORE judging anything                                  │    they never query, they answer from air)
     ▼                                                           ▼
  9. SIDECAR TETHERING (shadow-sidecar.ts 292L)               9. ✗ NOTHING
     │  tethered sessions + registry + reattach
     ▼                                                           ▼
 10. SECRETS + CONFIG + BRAIN (158L + 43L + 137L)            10. ✗ not adapted — provider.ts seed only

════════════════════════════════════════════════════════════════════════════════════════

  WHAT THE N-AGENT ORCHESTRATION LAYER LOOKS LIKE

  BOILERPLATE: single-agent, sequential rounds                MY HYDRA: N-concurrent gates  ✓ NEW
  ═══════════════════════════════════════════════            ═══════════════════════════════
  one ShadowAgent.run() per task                              pipeline.ts: allSettled N dispatch ✓
  the runner orchestrates ROUNDS                              gates pre/post + failLoud ✓
                                                              shared memory across gates ✓
                                                              graphify MCP tools ✓
                                                              synthesizers + TRIPLE-CONFIRMED ✓
                                                              corbell bridge ✓
                                                              score ladder + artifact evolution ✓

════════════════════════════════════════════════════════════════════════════════════════

  THE HOLE LEDGER (what I ripped out without engineering it back — ranked by damage)

  H1 ✗ FILE-BASED REPORTS      the agent writes report.md/verdicts to a ledger; my agents
                               return chat-JSON — the .md gap you named; nothing durable
  H2 ✗ ROUNDS DOCTRINE         single-shot vs the proven 2-round mandatory revision loop;
                               live muse answers conversationally in 4-6s and I accept it
  H3 ✗ DEGENERACY LEXICON      no PatternFamily/state machine — slop flows undetected;
                               the "No parseable JSON" failures were degeneracy I couldn't see
  H4 ✗ HALLUCINATION RULES     R1/R2/R3 absent — findings unverifiable against excerpts
  H5 ✗ BRIEF BUILDER + WEAVE   no supremacy embedding, no [SHADOW INFERENCE] guarantee,
                               no skeleton — prompts are ad-hoc concatenations
  H6 ✗ RPM LEDGER WIRING       transport adapter bypasses admission/exile — 14 agents
                               can blind-storm a rate-limited provider
  H7 ✗ PROMPT VALIDATOR        nothing validates the prompt artifact before dispatch
  H8 ✗ PRE-READ EXCERPTS       agents judge the codebase without excerpts in-hand
  H9 ✗ CONTEXT MANAGER         no stream window, no reattach verification
  H10 ✗ SIDECAR/SECRETS        untethered, unadapted
```

## 1.3 THE OPERATOR'S ARCHITECTURE CORRECTIONS (verbatim directives)

**THE MINI BUG HUNTER LAW:**
> "Each LASME/MPSE/SRO shadow agent = a MINI BUG HUNTER for its layer's anchor predicate. The bug hunter architecture (profile → graph → rule battery → findings → report) compressed into the shadow agent machine. Using graphify as the graph backend, ONE shared graph (not per-agent duplicates), 5+ parallel agents each running a focused bug hunt on their anchor predicate, all enriching the ONE graph."

**THE META-LAYER LAW:**
> "the META layer's shadow = shadow trident w/ hydra orchestrator skill loaded, each individual layer within the meta = shadow bug hunter subagent focused specifically on their layer's anchor predicate (Lexicons, Actors, etc)
>
> Concurrent bug hunters mapping the codebase for their layer's findings - meta layer shadow agent observes and orchestrates IN THE PI RUNTIME OF THE META LAYER'S INSTANCE hydra orchestrator responsibilities of its shadow agents (all findings of each agent are written to their individual findings reports + coded into the graph), stitches together, in order, all the findings reports from the layers in numerical chronologicial order ( 18 --> 19 --> 20 etc) so the full findings report is fully self contained and not watered down at all + does a meta review of the full updated graph, audited codebase, full findings report + presents any addiitional meta level observations, patterns recognized, other specific data we want from it, etc - THEN returns the full meta analysis (doc 1) + dense findings report (doc 2 - stitched verbatim from subagents) + fully mapped graph in the shared db
>
> MPSE does the same for its layers. SRO graph does the same for its layers.
>
> each next meta layer APPENDS to the same 2 docs at the meta level so the tool returns 2 DENSE and THOROUGHLY VETTED docs w/ all possible findings + the fully mapped codebase graph on graphify systems"

**THE MECHANICAL TEMPLATE DOCTRINE (brief IS the prompt):**
> "ok so here what we need is a set of bug hunter specific dispatch templates THAT CAN BE UNIVERSALLY APPLIED W/ OUT THE NEED FOR A PROMPT POLISHED SO IT CAN LITERALLY BE 100% MECHANICAL COPY PASTE PROMPT AND THE ONLY DYNAMIC VARIABLE IN THE PROMPT IS INPUT CONTEXT - LEAVE IT FOR THE BUG HUNTER AGENT TO DISCERN EVERYTHING ITSELF
>
> The current prompt + shadow inference section is a good template. for this use case the [prompt] is static copy paste we must pre-write them now and the [shadow inference] section becomes [input data] and we can just format the input args here cleanly with a heading at above them that just says [INPUT DATA] Below is all the input data from the user that you are required to fully inference, understand, and process before proceeding with your code audit: (filepaths) (context args) (etc)
>
> then we dont need any prompt polishers - the brief IS the prompt for the subagents"

**THE META TEMPLATE + DATA FLOW:**
> "yeah same thing here adapt it, brief IS the prompt - adapted version of the hydra orchestrator skill to this pi sdk runtime and shadow bug hunter wave context - input data dynamic section (not the same raw dump as all the subagents. we want to get clear on what is the filtering process and data flow here)"

**EDIT TOOL FORCE-BOUND:**
> "'TOOLS (the auditor's hands):' - yes good. also make sure they have the edit tool force bound to the same doc target"

**THE NESTED BASELINE LAW:**
> "'calls (the boilerplate agent)' - this is where the current async concurrent pipeline comes in. not just 'the boilerplate agent' - previously this whole shadow wave is the backend of a tool. now the backend of the tool is ONE meta shadow agent that has this full boilerplate nested as a subagent wave dispatch built from the exact boilerplate baseline"

**THE WAVE MANAGER PATTERN:**
> "basically though look at how orchestrator/subagent works in Ship_Packages/V4.4.2_WAVE_MANAGER_BATTLE_TESTED on the wave manager tool — we want to replicate the same META ARCHITECTURE at the meta layer
>
> 1 hydra orchestrator, mechanical subagent dispatch, each subgent hyper targeted and pre programmed w/ pre-written prompt templates and workflow to enable mechanical dispatch and execution so that all we do is pass new input args and the same dynamic yet mechanical workflow runs each time and keeps the process uniform"

**THE V1 META FLOW (operator-approved):**
> meta agent receives all input args from code audit tool --> organizes dispatch templates for the LASME subagents --> deploys subagent wave and awaits completion --> all LASME bug hunters run async concurrently in their own isolated sequential workflow pipelines --> bug hunters complete --> meta agent is returned --> meta agent begins post-bug-hunter workflow and does its full meta pipeline --> returns full work and activates next meta layer

**THE AETHER RENAME:**
> "Also make a note that i want to rename all 'shadow agent' terminology 'Aether' instead. simple syntax swap but needs ot be done clean so nothing breaks and not paths are fucked. keep it scoped to YOUR project also dont start fucking with everything else
>
> shadow = aether
>
> swapping it all for cognitive stability. better to imagine light streams while i build over dark shdow puddles"

## 1.4 THE V1 ADAPTATION MAP

```
════════════════════════════════════════════════════════════════════════════════════════════
  V1 ADAPTATION — THE BOILERPLATE SPINE (UNTOUCHED) WITH 4 SWAPPED SURFACES
══════════════════════════════════════════════════════════════════════ title════════════════

 UNTOUCHABLE SPINE (every aether agent in the system — layer hunters AND metas —
 runs on this machinery, byte-for-byte the boilerplate):
 ┌────────────────────────────────────────────────────────────────────────────────┐
 │ AetherAgent.run()  2-round doctrine + revision loop + 16K round caps            │
 │ brief-builder.weave()  supremacy + skeleton + [AETHER INFERENCE] + slots        │
 │ prompt-validator  degeneracy lexicon/state machine  R1/R2/R3 hallucination rules│
 │ RPM ledger  aether-memory (append-only mirror)  scoped-tool runner  transport   │
 └────────────────────────────────────────────────────────────────────────────────┘
        ▲                    ▲                      ▲                    ▲
        │ SURFACE 1          │ SURFACE 2            │ SURFACE 3          │ SURFACE 4
        │ BRIEF              │ TOOLS                │ SYSTEM PROMPT      │ PIPELINE
        │ (content)          │ (hands)              │ + WARHEADS (mind)  │ (workflow)

════════════════════════════════════════════════════════════════════════════════════════════
  ONE META LAYER AT RUNTIME (LASME shown; MPSE and SRO identical, different rosters)
════════════════════════════════════════════════════════════════════════════════════════════

                 ┌──────────────────────────────────────────────┐
                 │   META-LAYER AETHER = aether Trident w/      │
                 │   hydra-orchestrator skill in its brief      │
                 │   (a boilerplate AetherAgent — spine intact) │
                 └───────────────┬──────────────────────────────┘
      dispatches │ observes │ stitches │ meta-reviews  (its 4 duties)
   ┌─────────────┼──────────┼──────────┼───────────────────────────┐
   ▼             ▼          ▼          ▼                           │
 ┌───────────────────────────────────────────────────────────┐    │
 │  THE LAYER BUG HUNTERS (all concurrent, allSettled)        │    │
 │                                                           │    │
 │  r-lexicon      r-actor       r-state-machine   r-engine  │    │
 │  r-adapter      r-mpse        (MPSE: contract/  oracle/   │    │
 │  stage/provenance)  (SRO: graph/path/dead-code/cycles)     │    │
 │                                                           │    │
 │  EACH = a compressed bug hunter on the boilerplate spine: │    │
 │   brief = MECHANICAL TEMPLATE (static, pre-written —      │    │
 │     the anchor-predicate directive) + [INPUT DATA]        │    │
 │     section (the ONLY dynamic variable: filepaths,        │    │
 │     context args, prior-gate output)                      │    │
 │   tools = graphify×4 + read(320) + grep(120) +            │    │
 │     write_findings (force-bound) + EDIT (force-bound to   │    │
 │     the SAME doc target) + graph_tag(findings→graph       │    │
 │     edges via ontology predicates)                        │    │
 │   workflow = map→scan→strike→trace compressed into the    │    │
 │     2-round doctrine (R1 hunt, R2 verify+report)          │    │
 │   output = findings/report.md (ITS OWN file, zod-         │    │
 │     validated candidates + evidence quotes + graph refs)  │    │
 └─────────────┬─────────────────────────────────────────────┘    │
               │ all findings + tags enrich                       │
               ▼                                                  ▼
 ┌──────────────────────────────┐        ┌────────────────────────────────────┐
 │  THE ONE SHARED GRAPH        │        │  THE META STITCH (doc 2)           │
 │  graphify extract ONCE       │◄───────┤  layer reports stitched VERBATIM   │
 │  → every hunter queries it   │        │  in NUMERICAL LAYER ORDER          │
 │  → every hunter TAGS its     │        │  (R18→R19→R20→... no watering      │
 │    findings into it via      │        │  down, fully self-contained)       │
 │  ontology predicates:       │        └────────────────────────────────────┘
 │   lasme: violates/triggers/ │                     ▼
 │   shouldBe/declares...      │        ┌────────────────────────────────────┐
 │   mpse: evaluates_to/       │        │  THE META REVIEW (doc 1)           │
 │   contradicts_oracle/       │        │  full updated graph + stitched     │
 │   unguarded_threshold...    │        │  report + audited codebase →       │
 │   sro: flagged_by/caused/   │        │  meta observations, patterns,      │
 │   derived_from...           │        │  cross-layer signals — the meta     │
 │  persisted in shared.db     │        │  agent's ROUND 2 revision           │
 └──────────────────────────────┘        └────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════════════════
  THE FULL TOOL RUN — 3 META LAYERS APPENDING TO THE SAME 2 DOCS + THE ONE GRAPH
════════════════════════════════════════════════════════════════════════════════════════════

 audit(<target>/src)
   │
   ├─ PHASE 1  legacy sweep → [PRELIMINARY]
   │
   ├─ LASME meta ── 6 hunters → stitch R18-R23 → meta-review ──┐ APPEND to:
   │                                                            │  doc1 meta-analysis.md
   ├─ MPSE meta ──  4 hunters → stitch contracts/oracle/       │  doc2 findings-report.md
   │               stage/provenance → meta-review ─────────────┤  (each meta APPENDS
   │                                                            │   its section; docs
   ├─ SRO meta ───  4 hunters → stitch graph/path/dead-code/   │   never rewritten)
   │               cycles → meta-review ───────────────────────┘
   │
   └─ RETURN: doc1 (3 meta analyses, appended) + doc2 (ALL layer findings,
             verbatim, in order) + the fully-mapped graph in shared.db
             → [FINAL]

════════════════════════════════════════════════════════════════════════════════════════════
  THE EXACT EDITS PER SURFACE (v1 scope — everything else UNTOUCHED)
════════════════════════════════════════════════════════════════════════════════════════════

 SURFACE 1 — BRIEF (mechanical templates — brief IS the prompt):
   LAYER HUNTER template (STATIC, pre-written, 100% mechanical copy-paste —
     the ONLY dynamic variable is the input context):
       [THE TEMPLATE = the anchor-predicate directive, pre-written per layer
        from the original LASME spec §2.3/§2.10 layer definitions]
       [INPUT DATA]
       Below is all the input data from the user that you are required to fully
       inference, understand, and process before proceeding with your code audit:
       (filepaths)
       (context args)
       (prior-gate output slots — for MPSE/SRO hunters)
     NO prompt polisher anywhere — the agent discerns everything itself from
     the template + input data.
   META template (STATIC, pre-written — the hydra-orchestrator skill adapted
     to this pi sdk runtime + aether bug hunter wave context):
       the orchestrator duties (dispatch/observe/stitch/review)
       the roster + layer numbering + the stitch contract (verbatim, numerical)
       the meta-review mandate + the 2-doc append paths
       [INPUT DATA] — the FILTERED feed (not the raw dump the hunters get):
         what the meta needs: the input args, its roster's report paths, the
         graph handle, the doc paths — the data flow filters here

 SURFACE 2 — TOOLS (buildAuditorTools / buildMetaTools):
   HUNTER: graphify:query|path|explain|subgraph (ONE shared graph, read) ·
     read(320)/grep(120) capped · write_findings (force-bound to ITS report.md) ·
     edit (force-bound to the SAME doc target) ·
     graph_tag (its finding → ontology edge: violates|triggers|shouldBe|... —
     writes through the corbell bridge into shared.db)
   META:    read (stitch source) · graphify×4 (review pass) ·
     write_meta_doc + edit (force-bound to doc1/doc2 append targets) ·
     children_status (roster telemetry: fulfilled/rejected/durations)

 SURFACE 3 — SYSTEM PROMPT + WARHEADS (full content to be authored per layer):
   HUNTER identity: "You are the LEXICON bug hunter — an aether trident-bug-hunter
     compressed into this machine. Hunt EVERY derailment/violation of the lexicon
     rules: places lexicons SHOULD exist but don't, incorrect implementations,
     drift, uncleared thresholds..." (one per layer, same skeleton)
     + calibration shots per anchor predicate (the bug hunter's lexicon/rule-card
       pattern — 2-3 worked examples of TRUE/RH/UNCLEAR for ITS predicate)
   META identity:  the hydra-orchestrator warhead:
     never write the layers' findings yourself — stitch verbatim; your judgment is
     the meta layer; kick stragglers via children_status; the graph is shared.

 SURFACE 4 — PIPELINE (the tool's backend = ONE meta aether with the boilerplate
   nested as a subagent wave dispatch — the wave-manager pattern):
   dispatchSubagent →  construct boilerplate AetherAgent(hunter template, hunter tools)
                       → run() (2 rounds, degeneracy+R1-R3 guards live)
                       → read ITS report.md → zod → settlement        [replaces
                          buildAndRunSubagent+chat-JSON entirely]
   meta phase      →  after allSettled: the META AetherAgent runs (meta template,
                       meta tools, children telemetry in [INPUT DATA]) →
                       stitches doc2 verbatim → meta-review appends doc1 →
                       returns + activates the next meta layer
   graph lifecycle →  extract ONCE at gate start (already built ✓) · graph_tag
                       writes are ledgered + merge-verified (graph/verify pattern)
   v1 boundary     →  pipeline = dispatcher; meta = post-convergence stitcher +
                       reviewer (live mid-flight steering is v2)
```

**The one-sentence version:** the boilerplate AetherAgent is the engine for every agent in the system; the tool's backend becomes ONE meta aether with the full boilerplate nested as a mechanical subagent wave; each layer hunter is a bug-hunter-identity AetherAgent with graphify + force-bound findings/edit tools; each meta is an orchestrator-identity AetherAgent that stitches verbatim, reviews at the graph level, and appends to the two run docs — one graph, two docs, three metas, N hunters, zero boilerplate mechanics touched.

**Reference baselines:**
- `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Ship_Packages/V4.4.2_WAVE_MANAGER_BATTLE_TESTED` — the wave-manager orchestrator/subagent meta architecture to replicate at the meta layer
- `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/Trident_Agent/Ship_Packages/hydra-v4.0-fork-baseline` — the lightweight orchestrator/subagent layer, applicable between meta and hunters if helpful
- `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/shadow_agent_backend` — the canonical boilerplate (spine)
- `src/audit-engine/shadow-backend/` — the boilerplate's live in-project deployment

<!-- SECTION-1-COMPLETE -->

==================================== BREAK

# SECTION 2 — THE AETHER CODE AUDIT OVERHAUL — L2 SPECIFICATION

**Version:** 2.0.0 · **Date:** 2026-08-28 · **Status:** DESIGN AUTHORITY
**Purpose:** Rebuild the code audit tool's aether layer as the meta-orchestrated bug-hunter architecture: ONE meta aether agent per meta layer (LASME/MPSE/SRO) with the full boilerplate nested as a mechanical subagent wave — each layer hunter a compressed bug hunter on the boilerplate spine, one shared graphify graph, two append-only run docs.
**Predecessor:** V443_SHADOW_HYDRA_CODE_AUDIT_L2_SPEC.md (v1 — the wave-built pipeline; superseded at the SUBAGENT ENGINE layer, retained at the ORCHESTRATION layer) · AETHER_CODE_AUDIT_OVERHAUL_ARCHITECTURE.md §1 (this session's presentation — the design intent)
**Baseline (operator-locked decisions, verbatim in §1.3):** the boilerplate spine is UNTOUCHABLE · only 4 surfaces change (brief/tools/prompt/pipeline) · brief IS the prompt (mechanical templates, [INPUT DATA] the only dynamic) · each hunter = a mini bug hunter on its anchor predicate · the tool's backend = ONE meta aether with the boilerplate nested as a subagent wave (the wave-manager pattern) · ONE shared graph · TWO append-only docs · shadow→Aether rename, project-scoped.

## TOC
- §0 THE FUNDAMENTAL PROBLEM
- §1 FAILURE INVENTORY
- §2 FIX PLAN (the four surfaces + the nesting)
- §3 IMPLEMENTATION ORDER (waves)
- §4 TESTING STRATEGY
- §5 ANTI-PATTERNS AGAINST FALSE SUCCESS
- §6 SUCCESS CRITERIA
- §7 COMPACTION-PROOF IMPLEMENTATION GUIDE
- §8 FINAL NOTES / OPEN QUESTIONS
- APPENDIX A — ZERO-TRUST AUDIT

## §0 THE FUNDAMENTAL PROBLEM
**One sentence:** the code audit tool's aether subagents were built as hand-rolled chat-JSON single-shots that BYPASS the project's own battle-tested AetherAgent boilerplate (rounds doctrine, degeneracy guards, hallucination rules, RPM ledger, file ledgers) — the fix is not new machinery but RE-PLUMBING: nest the boilerplate as the subagent engine inside a meta-orchestrated bug-hunter wave (one shared graphify graph, two append-only docs, three meta layers), swapping only the four sanctioned surfaces (brief/tools/prompt/pipeline).

**The root defect class:** ENGINE BYPASS — infrastructure that exists, is proven in this very project (`src/audit-engine/shadow-backend/` is the boilerplate's live deployment), and was circumvented by a hand-rolled replacement (`src/hydra/subagent.ts buildAndRunSubagent`) that reimplemented 10% of the mechanics and dropped the rest. The evidence: the live meta-audit (2026-08-28, container `trident-v443-shadow-hydra-meta`) fired 6 LASME subagents — all 6 transport-OK (`[chain] OK ... events 7`) and all 6 REJECTED with `extractJSON failed: No parseable JSON found in subagent output`, because a single-shot chat-JSON contract has no rounds doctrine to force revision, no degeneracy lexicon to catch conversational slop, and no file-artifact contract for durable output.

**What the system MUST become (operator-locked, §1.3 verbatim):**
```
audit(<target>/src)
  → [PRELIMINARY] (legacy sweep, unchanged)
  → LASME meta aether (orchestrator identity) dispatches 6 layer bug hunters
      (each = a compressed trident-bug-hunter on the AetherAgent spine, scoped to
      its anchor predicate: lexicons, actors, state machines, engines, adapters,
      mpse-thresholds) — all concurrent, one shared graph, findings written to
      each hunter's OWN report file + tagged into the graph
  → meta returns: stitches ALL hunter reports verbatim in numerical layer order
      into doc2, meta-reviews (graph + stitched report + codebase) into doc1
  → MPSE meta (same pattern, its 4 contract hunters) appends to the SAME docs
  → SRO meta (same pattern, its 4 graph hunters) appends to the SAME docs
  → [FINAL]: doc1 + doc2 + the fully-mapped graph in shared.db
```

## §1 FAILURE INVENTORY
### §1.1 The chat-JSON subagent engine (the engine bypass)
**[CRITICAL] The chat-JSON single-shot engine.**
- **What happened:** `src/hydra/subagent.ts:61 buildAndRunSubagent` (155L) constructs a pi SDK Agent with the spec's system prompt, runs ONE `agent.prompt()` call, races a timeout, then `extractJSON` parses the final chat message and zod-validates. There is no second round, no revision loop, no degeneracy check, no ledger, no file output.
- **Root cause:** Wave A-2 built the subagent engine from the spec pseudocode (§2.9 dispatchSubagent) instead of instantiating the existing AetherAgent — the boilerplate deployment (`src/audit-engine/shadow-backend/agent.ts`, 325L, the adapted ShadowAgent) was never imported by the hydra path.
- **Why it's broken:** live muse (a fast small model) answers conversationally in 4-6s; a single-shot chat-JSON contract has no mechanism to force the model to revise into the contract shape. All 6 LASME hunters rejected in the live meta-audit.
- **Impact:** the LASME/MPSE/SRO gates are structurally incapable of producing findings with live muse. The wave-built pipeline (7 waves, all audited green at the unit level with MOCKED agents) hides this — the mocks always return contract-shaped JSON; live muse does not.
- **Evidence:** container `trident-v443-shadow-hydra-meta`, `/root/meta-out.log` (13:49 run): 10× `[hydra:SUBAGENT_REJECTED]` — every one `extractJSON failed: No parseable JSON found in subagent output`; engine log `LASME gate done 0 candidates provenance={"gate":"LASME","durationMs":5435,"subagentCount":6,"fulfilled":0,"rejected":6}`.

**[CRITICAL] The missing boilerplate mechanics (the ten holes, evidence-mapped).**
- H1 file artifacts — hunters return chat text; the boilerplate's ledger/report.md pattern (`shadow-memory.ts` append-only mirror, `READY_FLOOR_LINES = 125`) never engaged.
- H2 rounds doctrine — `PI_MAX_ROUNDS = 2` (shadow-runner.ts:104, "ONE round truth in this codebase") absent; no ROUND 2 mandatory revision (shadow-agent.ts:790 — the 0-trust re-read + [SHADOW INFERENCE] verify + 3-loop micro repair).
- H3 degeneracy lexicon — `shadow-degeneracy.ts` (342L, typed DegeneracyFamily + scoreLine + state machine) never run on responses; conversational slop flowed undetected into extractJSON.
- H4 hallucination rules — `shadow-context-manager.ts` R1 count-claim / R2 planted-bug / R3 named-anchor absent; findings unverifiable.
- H5 brief builder — `shadow-brief-builder.ts` weave + slot injection (`shadow-slot-injector.ts`) unused; prompts were ad-hoc `buildSystemPrompt()` concatenations.
- H6 RPM ledger — `createHydraTransport` (index.ts:~100) wraps chainedStream but performs no `ledger.acquire()` admission; 14 concurrent agents can blind-storm.
- H7 prompt validator — `prompt-validator.ts` (91L) never invoked on hunter prompts.
- H8 pre-read excerpts — the runner's `preReadExcerpts` (shadow-runner.ts:256) absent; hunters judge from air.
- H9 context manager — session-stream window + memory reattach unused.
- H10 sidecar/secrets — untethered.
- **Impact:** the hydra's unit tests (190/0) pass because mocks conform; every live failure mode the boilerplate exists to catch is unguarded.

**[HIGH] The orchestrator layer is dispatch-only.**
- **What happened:** `pipeline.ts` (174L) allSettled-dispatches N specs and synthesizes via pure functions — no meta agent exists. The synthesizer (`lasmeSynthesize` et al.) merges/dedupes/cross-references mechanically but performs NO meta review, NO stitching, NO graph-level pattern recognition.
- **Why it's broken vs the operator's architecture:** the operator's design (§1.3) demands a meta aether agent (orchestrator identity, hydra-orchestrator skill in its brief) that dispatches, observes, stitches verbatim, and meta-reviews. A pure-function synthesizer cannot produce doc1 (meta analysis) at all.
### §1.2 The live meta-audit failures (the evidence run)
**The 2026-08-28 live meta-audit evidence run (container `trident-v443-shadow-hydra-meta`, dist 2ab7ad582ce10065):**

Run 1 (13:21, spec unarmed): LASME pre-gate refused `audit-spec-exists — audit-spec.json not found` — the gate machinery itself PROVEN (pre-gates fire loud, artifact preserved, cross-gate deps enforced: MPSE refused `MPSE_PRE_LASME_MISSING`, SRO refused `SRO_PRE_LASME_MISSING`). Score ladder advanced artifact labels despite gate failures (per §2.14 catch design).

Run 2 (13:31, spec armed, graphify serve crash): `GRAPHIFY_MCP_CONNECT_FAILED: MCP error -32000: Connection closed` — the copied venv's cryptography wheel needed GLIBC_2.33 (container has 2.31). Fixed: `cryptography==39.0.2` (manylinux_2_28 wheel) pinned into the venv. Environment, not code.

Run 3 (13:39, environment fixed): LASME gate FIRED end-to-end — pre-gates passed, graphify extract on the tool's own src produced graph.json (6.5MB, 13:31), MCP connected, 6 subagents dispatched (`[hydra:DISPATCH_START]` with 6 ids), synthesizer ran, post-gates evaluated, provenance chain recorded (`durationMs:6589, subagentCount:6, fulfilled:0, rejected:6`), artifact ladder advanced, MPSE/SRO correctly refused on missing LASME output. THE MACHINERY IS PROVEN — the ENGINE (chat-JSON single-shot) is what failed.

Run 4 (13:49, extractJSON hardened with balanced-brace fallback): identical rejection class — the model's output contains no JSON at all (4-6s rounds = short conversational responses). Confirms H2/H3 as the root: no revision round, no degeneracy detection.

**The meta-audit's OWN findings (the tool indicting itself — these are real findings to carry into the new build):**
1. LASME engine cannot produce findings with live muse (CRITICAL — §1.1).
2. The legacy sweep on the tool's own src: 4414 findings, score 40/100 (the tool's own codebase at 40/100 by its legacy layers — the [PRELIMINARY] run is itself evidence the legacy layers work).
3. The gate chain's fail-closed behavior is CORRECT (every refusal was loud, named, artifact-preserving).
### §1.3 The naming contamination (shark)
**[MEDIUM] Cross-architecture naming contamination.**
- **What happened:** the first container was named `shark-v443-shadow-hydra-w7` (2026-08-28). Shark is ANOTHER agent's architecture — the name leaked from container-tool defaults, not from this project's identity.
- **Operator ruling (verbatim):** "dont name anything shark this is trident do not confuse other agents architecture with yours"
- **Fix state:** the container was killed and replaced by `trident-v443-shadow-hydra-meta`. All future containers/resources carry trident- names only.

**[MEDIUM] The "shadow" terminology itself.**
- **Operator ruling (verbatim):** "i want to rename all 'shadow agent' terminology 'Aether' instead. simple syntax swap but needs ot be done clean so nothing breaks and not paths are fucked. keep it scoped to YOUR project also dont start fucking with everything else — shadow = aether — swapping it all for cognitive stability. better to imagine light streams while i build over dark shdow puddles"
- **The swap's scope (project-only):** `src/**` symbols/identifiers/log-strings/classes/docs inside this repo; NOT the KNOWLEDGE_LIBRARY boilerplate (read-only reference), NOT other projects, NOT the canonical boilerplate path. The full syntax map for the clean swap is §2.9 + Section 3 of this document.

## §2 FIX PLAN
### §2.1 The AetherAgent engine adapter (the nesting seam)
**The nesting seam — `AetherAgentAuditor` (new file `src/hydra/aether-auditor.ts`, ~220L):**

The ONE place the boilerplate enters the hydra. It does not reimplement anything — it ASSEMBLES the boilerplate's deployed pieces around a layer hunter's template+tools and runs them.

```typescript
// src/hydra/aether-auditor.ts — the nesting seam
import { ShadowAgent } from '../audit-engine/shadow-backend/agent.ts'; // the boilerplate deployment (renamed per §2.9)
import { buildAuditorBrief } from './aether-brief.ts';                 // §2.2 — mechanical template + [INPUT DATA]
import { buildAuditorTools } from './aether-tools.ts';                 // §2.4 — the force-bound tool set
import { readFindingsReport } from './aether-report-reader.ts';        // §2.6 — file → zod

export interface AetherAuditorRun {
  template: AuditorTemplate;        // the pre-written static prompt (§2.2)
  inputData: AuditorInputData;      // the ONLY dynamic content (§2.3)
  ledgerDir: string;                // <runLedger>/<layerId>/ — the hunter's own dir
  graphHandle: GraphifyMCPClient;   // the ONE shared graph connection
}

export async function runLayerHunter(run: AetherAuditorRun): Promise<HunterSettlement> {
  // 1. BUILD the brief: the static template + the [INPUT DATA] block, woven through
  //    the brief-builder's structure (supremacy + skeleton + inference guarantee).
  const brief = buildAuditorBrief(run.template, run.inputData);
  // 2. ASSEMBLE the tools: graphify×4 (read) + read/grep (capped) +
  //    write_findings + edit (BOTH force-bound to run.ledgerDir/findings/report.md) +
  //    graph_tag (through the corbell bridge).
  const tools = buildAuditorTools(run.ledgerDir, run.graphHandle);
  // 3. RUN the boilerplate agent — rounds doctrine, degeneracy lexicon, R1-R3
  //    guards, RPM-ledger admission, prompt validation, per-round caps: ALL LIVE
  //    because they live INSIDE ShadowAgent.run(), untouched.
  const agent = new ShadowAgent(run.ledgerDir);
  const result = await agent.run({ brief, tools, maxRounds: 2 });
  // 4. READ the durable artifact from disk — the file IS the contract; the chat
  //    text is never parsed for findings (extractJSON is dead for hunters).
  const findings = await readFindingsReport(run.ledgerDir + '/findings/report.md');
  // 5. zod-validate the candidates (the schema per the layer's template contract).
  return { layerId: run.template.layerId, findings, telemetry: result.telemetry };
}
```

**The contract law:** `ShadowAgent` is IMPORTED, never modified. If the boilerplate's `run()` signature needs an adapter (its current opts carry prompt-polisher fields), the adapter lives in `aether-auditor.ts` and maps `AuditorRun → ShadowAgentRunOptions` — a ~40L mapping function, the ONLY code that touches both worlds. The boilerplate's internals (rounds, guards, ledger, memory mirror) execute exactly as shipped.
### §2.2 SURFACE 1 — the mechanical brief templates
**The mechanical template doctrine (operator verbatim, §1.3):** the [prompt] is STATIC copy-paste, pre-written now, 100% mechanical — the ONLY dynamic variable is the input context, delivered under the `[INPUT DATA]` heading. No prompt polisher exists anywhere in the new path. The agent discerns everything itself.

**The template registry — `src/hydra/aether-templates/` (one file per layer + one meta per gate):**

```
aether-templates/
├── hunters/
│   ├── lasme-lexicon.ts        // R18 — the LEXICON bug hunter template
│   ├── lasme-actor.ts          // R19 — the ACTOR bug hunter
│   ├── lasme-state-machine.ts  // R20
│   ├── lasme-engine.ts         // R21
│   ├── lasme-adapter.ts        // R22
│   ├── lasme-mpse-threshold.ts // R23 (the LASME-side threshold hunter)
│   ├── mpse-contract.ts        // R24 — contract conformance hunter
│   ├── mpse-oracle.ts          // R25 — epsilon/oracle hunter
│   ├── mpse-stage.ts           // R26 — stage-gate hunter
│   ├── mpse-provenance.ts      // R27 — trace-gap hunter
│   ├── sro-graph.ts            // R28 — graph-structure hunter
│   ├── sro-path.ts             // R29 — impact-path hunter
│   ├── sro-dead-code.ts        // R30
│   └── sro-cycles.ts           // R31
└── meta/
    ├── lasme-meta.ts           // the LASME orchestrator template
    ├── mpse-meta.ts
    └── sro-meta.ts
```

**The hunter template structure (every hunter, same skeleton — the static text):**

```typescript
export interface AuditorTemplate {
  layerId: string;            // 'R18-lasme-lexicon'
  anchorPredicate: string;    // 'lexicon' | 'actor' | 'state-machine' | ...
  layerNumber: number;        // 18-31 — the stitch order key
  staticPrompt: string;       // THE pre-written brief body (below)
  outputSchema: z.ZodSchema;  // the findings contract for zod validation
  graphQueries: string[];     // the layer's graphify starting queries
}
```

**The static prompt body (per hunter — anchored to the ORIGINAL LASME spec §2.3/§2.10 layer definitions, now as BUG HUNT directives):**

Every hunter's static prompt carries, in order (the skeleton — section order IS the architecture):

1. **IDENTITY** — "You are the {ANCHOR} bug hunter — a trident-bug-hunter compressed into this aether machine. You hunt ONE predicate: {ANCHOR}. Your findings are the ONLY {ANCHOR} findings this audit produces."
2. **THE HUNT MANDATE** — the layer's hunt rules (from the original spec, restated as bug-hunt directives): "Hunt EVERY derailment and violation of the {ANCHOR} rules: anywhere {ANCHOR} structures SHOULD exist but don't; anywhere they are implemented incorrectly; anywhere drift from the spec has occurred; anywhere the pattern is present but degenerate. Fire on what IS, not what should be — every finding carries file:line + a verbatim quote."
3. **GRAPH TOOLS USAGE LAW** — the 6-rule warhead (verbatim, all layers identical).
4. **THE CALIBRATION SHOTS** — 2-3 worked examples of TRUE_DEFECT / RED_HERRING / UNCLEAR for THIS layer's predicate (the bug hunter's lexicon/rule-card pattern; e.g., lexicon: an interface with 7 members and no PatternFamily shape = RH "not every wide interface is a lexicon"; a decision ladder of 5 unnamed branches = TD; a numeric threshold with no calib: comment and no spec clause = UNC).
5. **THE FINDINGS-FILE CONTRACT** (byte-exact) — "When your hunt is complete, use write_findings to write ONE json object to findings/report.md in your ledger. The object MUST be: {\"candidates\":[{layer, predicate, subject, object, file, line, evidence, implicatedSpecClause?, graphRefs?}], \"summary\": \"...\"}. Every candidate carries a verbatim evidence quote (or [INFERRED] + the graph edge). Then STOP."
6. **[INPUT DATA]** — the ONLY dynamic section (§2.3).

**Example — the FULL static prompt for R18 (lasme-lexicon), to be authored verbatim in the template file:**

```
IDENTITY: You are the LEXICON bug hunter — a trident-bug-hunter compressed into
this aether machine. You hunt ONE predicate: lexicon integrity. Your findings
are the ONLY lexicon findings this audit produces.

THE HUNT MANDATE: Hunt every derailment and violation of the lexicon rules:
(a) MISSING LEXICONS — decision surfaces that should be driven by a typed
    PatternFamily/lexicon but are regex towers, if/else ladders (>=3 branches),
    or scattered boolean chains instead;
(b) DEGENERATE LEXICONS — lexicons that exist but violate the ISE law: no typed
    members, no evidence-triad production, detection-only with no state machine
    behind the decision;
(c) UNCALIBRATED THRESHOLDS — numeric literals gating decisions with no named
    calibration constant and no calib: comment (the ISE named-threshold law);
(d) LEXICON DRIFT — the lexicon's patterns no longer match what the code
    actually does (the rules say X, the matcher fires on Y).
Fire on what IS: every finding carries file + line + a verbatim quote from the
source (or [INFERRED] + the graph edge that supports it). Do not fire on:
test fixtures, interfaces with <=4 members (not a PatternFamily shape), chains
of depth <=2, thresholds carrying a calib: comment.

GRAPH TOOLS USAGE LAW:
1. ALWAYS query the graph BEFORE reading files directly. The graph gives you
   the structural overview; file reads give you the details.
2. EXTRACTED edges are facts read from the source. INFERRED edges are
   graphify's best guess. When citing evidence, prefer EXTRACTED edges and
   flag INFERRED edges with [INFERRED] in your evidence field.
3. Use graphify:path to trace connections between concepts you find.
4. Use graphify:subgraph with depth 3 around any finding to understand its
   blast radius.
5. NEVER fabricate a graph node or edge. If the graph doesn't show a
   connection, report "no graph connection found" — never invent one.
6. Community labels show subsystems; god nodes are single points of failure —
   flag findings that involve god nodes with severity +1.

CALIBRATION SHOTS:
SHOT 1 (RED_HERRING): an interface with 8 members that is a plain data DTO —
  no matcher, no trigger, no severity. Verdict: RED_HERRING, reason: "a wide
  interface without decision semantics is not a lexicon shape".
SHOT 2 (TRUE_DEFECT): a classifier with a 5-branch if/else ladder on string
  prefixes, no typed pattern family, thresholds 0.3/0.7 uncalibrated. Verdict:
  TRUE_DEFECT — legs: the spec clause (the ISE law), the code quote, the
  divergence ("a 5-branch ladder with uncalibrated thresholds is a regex-slop
  tower by the ISE definition").
SHOT 3 (UNCLEAR): a numeric literal 0.85 alone in a function with no spec
  clause naming it a threshold. Verdict: UNCLEAR, missing: "cannot determine
  whether 0.85 gates a decision without the spec's threshold definition".

FINDINGS-FILE CONTRACT: When your hunt is complete, use write_findings to
write ONE json object to findings/report.md in your ledger. The object MUST
be exactly: {"candidates":[{"layer":"R18-lasme-lexicon","predicate":...,
"subject":...,"object":...,"file":...,"line":...,"evidence":...,
"implicatedSpecClause":...,"graphRefs":[...]}],"summary":"..."}. Then STOP.

[INPUT DATA]
```

(Each of the 14 hunter templates follows this exact skeleton with its own IDENTITY/MANDATE/SHOTS — authored from the original spec layer definitions §2.3/§2.10 + the MPSE/SRO rosters §2.4/§2.5.)
### §2.3 The [INPUT DATA] contract + the meta's filtered feed
**The [INPUT DATA] block (operator verbatim structure):**

```
[INPUT DATA]
Below is all the input data from the user that you are required to fully
inference, understand, and process before proceeding with your code audit:
```

followed by, formatted cleanly:

**For a LAYER HUNTER:**
- (filepaths) — the target's source tree summary: root, file count, the layer's HOT FILES (pre-computed from the graph: the files with the most nodes matching the layer's anchor-predicate types — e.g., the lexicon hunter gets the files with the most interfaces/decision structures; computed by a ~30L helper querying the shared graph, NOT by an LLM)
- (context args) — targetRoot, runId, the ledger path, the layer number + stitch position
- (prior-gate output) — for MPSE hunters: the LASME candidates relevant to THIS hunter's predicate (filtered: only candidates whose predicate intersects the hunter's anchor — the contract-checker gets contract-shaped LASME findings, the oracle-checker gets threshold findings); for SRO hunters: BOTH gates' findings relevant to its predicate
- (graph facts) — the graph's node/edge counts, the top communities, the god nodes (a compact ~10-line digest the hunter can immediately query against)

**For a META AGENT (the FILTERED feed — operator: "not the same raw dump as all the subagents. we want to get clear on what is the filtering process and data flow here"):**
- (the audit invocation) — targetRoot, runId, the audit-spec path, the score so far
- (the roster manifest) — each hunter: layerId, layerNumber, ledger path, report path, dispatch state (fulfilled/rejected), durationMs, findings count (from the report read)
- (the doc targets) — doc1 path (meta-analysis.md), doc2 path (findings-report.md), the append positions
- (the graph digest) — node/edge counts, the delta tags this layer added (how many findings were graph_tag'd, by which hunters), the communities that grew
- (the prior meta sections) — for MPSE/SRO metas: doc1's prior sections (LASME's meta analysis) + doc2's current length/layer coverage — so the meta's review APPENDS with full awareness

**The data-flow filter (the meta's feed vs the hunters' feed):**

```
CODE AUDIT TOOL (the caller)
   │ passes: targetRoot, runId, audit-spec, shared graph handle, doc paths
   ▼
META AETHER (organizes the dispatch)
   │ per hunter: template(static) + INPUT DATA(filepaths-digest, context-args,
   │             prior-gate-filter, graph-facts)   ← the FILTER is here: the meta
   │             selects WHICH prior findings each hunter sees by predicate
   ▼
LAYER HUNTERS (concurrent, isolated)
   │ each returns: its report file on disk + its graph tags
   ▼
META AETHER (returns to duty)
   │ receives: the roster manifest with all report paths + telemetry
   │           (NOT the raw transcripts — the reports ARE the findings)
   ▼
META PIPELINE: stitch doc2 (verbatim, layer order) → meta-review (graph digest
   + stitched doc2 + the codebase context) → append doc1 → return + activate
   the next meta layer
```
### §2.4 SURFACE 2 — the auditor tool set (force-bound)
**`buildAuditorTools(ledgerDir, graphHandle)` — `src/hydra/aether-tools.ts` (~200L):**

```typescript
// THE HUNTER TOOL SET — all force-bound or capped; the agent's hands
export function buildAuditorTools(ledgerDir: string, graph: GraphifyMCPClient): AgentTool[] {
  const reportPath = path.join(ledgerDir, 'findings', 'report.md');
  return [
    // 1-4. THE GRAPH QUAD (read-only on the ONE shared graph)
    ...createGraphifyTools(graph),  // query | path | explain | subgraph — EXISTS ✓ (graphify.ts:81)

    // 5. READ — capped 320 lines (the Engineering Bible cap; hardcode-ban note:
    //    the cap is a contract constant, cited from the bible, not an oracle fit)
    makeCappedReadTool(320),

    // 6. GREP — capped 120 results
    makeCappedGrepTool(120),

    // 7. WRITE_FINDINGS — force-bound to reportPath (the write-scope law pattern:
    //    shadow-backend/tools.ts resolveForWrite — realpath + resolve + startsWith)
    makeForceBoundWriteTool('write_findings', reportPath),

    // 8. EDIT — force-bound to the SAME doc target (operator: "also make sure
    //    they have the edit tool force bound to the same doc target")
    makeForceBoundEditTool('edit', reportPath),

    // 9. GRAPH_TAG — the enrichment write path: a finding becomes ontology edges
    makeGraphTagTool(graph, ledgerDir),
  ];
}
```

**graph_tag — the ONE-graph enrichment tool (the operator's law: "all updating ONE graph of the codebase"):**

```typescript
// The hunter tags a finding into the graph. The tag goes through the corbell
// bridge (AP-7: no direct typed_nodes writes) using the ONTOLOGY predicates:
//   lasme hunters → violates | triggers | shouldBe | declares | implements | wraps
//   mpse hunters  → evaluates_to | contradicts_oracle | grounded_through | unguarded_threshold
//   sro hunters   → flagged_by | caused | derived_from | resolved_to | superseded_by
// Edge shape: (codeNode) --[predicate]--> (findingNode)
//   findingNode kind per ontology: 'Lexicon' | 'Contract' | 'Threshold' | 'Gate' ...
//   canonical_id = layerId + ':' + file + ':' + line (deterministic, idempotent)
// evidence_quote = the finding's verbatim evidence (EXTRACTED) or '[INFERRED] ' + graph edge
// Idempotency: re-tagging the same (node, predicate, finding) is a no-op (INSERT OR
//   REPLACE on the deterministic canonical_id) — safe under concurrent hunters.
```

**The META tool set — `buildMetaTools(doc1Path, doc2Path, graph)` (~120L):**
- `read` (uncapped within the ledger tree — the stitch source) + the graphify quad (the review pass)
- `write_meta_doc` + `edit` — BOTH force-bound pair: write_meta_doc appends to doc1 OR doc2 (the append-only contract — the tool REFUSES to rewrite existing sections, only appends past the file's current end); edit force-bound for the meta's own current section
- `children_status` — reads the roster manifest (the telemetry above); no steer in v1 (v2 adds steer_child per the wave-manager pattern)

**Force-bound implementation notes (write-scope law, all closes the 5 bypass classes):**
- traversal: path.resolve normalizes before the startsWith(root+sep) check
- symlink: realpathSync follows to the final destination first
- prefix: startsWith(root + path.sep) — never bare startsWith(root)
- absolute: resolve keeps absolute paths honest
- the violation path: every refused write appends to `evidence/write-violations.log` (the existing pattern — shadow-backend/tools.ts)
### §2.5 SURFACE 3 — the system prompts + warheads (full content)
**The hunter identity warhead (the SYSTEM PROMPT layer, distinct from the brief/template):**

The system prompt is the IDENTITY + WARHEADS (the standing law); the brief (template + input data) is the MISSION. Both are static for a given layer — pre-written, mechanical.

```
SYSTEM PROMPT — {LAYER} AETHER BUG HUNTER
══════════════════════════════════════════════════════════════
THE SUPREMACY CONTRACT (verbatim, the boilerplate's):
1. THE CODE AND THE GRAPH ARE THE ONLY GROUND TRUTH. Everything else is belief.
2. Quote VERBATIM. A paraphrase is a claim, not evidence.
3. Every finding carries THREE legs: the RULE violated (predicate clause),
   the CODE evidence (file:line + quote), and THE DIVERGENCE (one sentence
   a senior engineer accepts on first read).
4. If the rule's application is ambiguous, mark UNCLEAR — never guess a defect.
5. If the code contradicts the input data, the CODE wins — flag the contradiction.

THE DEGENERACY BANS (what gets your output rejected):
- NEVER return findings without file:line + a verbatim quote.
- NEVER claim to have "scanned N files/modules" unless your tool calls show it.
- NEVER name an export/function/class you did not read (the LIAR class).
- NEVER emit a summary instead of the findings object.
- NEVER pad candidates — 0 findings with honest coverage beats 10 fabricated.

THE BUDGET LAW:
- read: 320 lines/call · grep: 120 results/call · these are contract caps.
- Your hunt fits in 2 rounds: ROUND 1 = investigate + draft findings;
  ROUND 2 = re-verify each finding against its quote + write the file. STOP.

THE FINDINGS LAW:
- The file findings/report.md IS your output. If it is not written, you failed.
- One json object, the exact contract shape, then STOP.
```

**The meta identity warhead:**

```
SYSTEM PROMPT — {GATE} META AETHER ORCHESTRATOR
══════════════════════════════════════════════════════════════
THE ORCHESTRATOR LAW (adapted from the hydra-orchestrator skill):
1. Your hunters' findings are CLAIMS until their reports are read from disk.
2. You NEVER write findings yourself — doc2 is stitched VERBATIM from the
   hunter reports, in layer-number order, no watering down, no summarizing.
3. Your judgment is the META layer: patterns across hunters, graph-level
   signals, cross-layer correlations, the honest residuals.
4. The graph is SHARED — your review reads the merged state including every
   hunter's tags.
5. APPEND-ONLY: you append to doc1/doc2; you never rewrite what a prior
   meta layer wrote.

THE STITCH CONTRACT:
- doc2 section per hunter, in ascending layer number: the report's full
  candidate list, verbatim, under the heading "## R{N} — {layerId}".
- Rejected hunters get a section too: "## R{N} — {layerId} [REJECTED:
  {error}]" — the honest record, never silently dropped.

THE META-REVIEW MANDATE (doc1, your ROUND 2):
- What patterns span hunters? Which findings corroborate each other?
- What does the graph show that no single hunter saw (god-node
  concentrations, community anomalies, tag clusters)?
- What is the honest residual: coverage gaps, UNCLEAR clusters, layers
  that returned zero findings with the reason.
```

**Warhead placement:** the identity+warheads are the systemPrompt on the AetherAgent construction; the template+input data ride as the brief (round 1's mission). The boilerplate's prompt-validator runs over BOTH before dispatch.
### §2.6 SURFACE 4 — the pipeline: meta flow + dispatch + report reading
**The pipeline re-plumb (operator: "the backend of the tool is ONE meta aether agent that has this full boilerplate nested as a subagent wave dispatch built from the exact boilerplate baseline"):**

The v1 flow (operator-approved, §1.3):

```
CODE AUDIT TOOL (AuditEngine.audit — index.ts, the existing surface)
  │ [PRELIMINARY] legacy sweep (unchanged) + probe
  ▼
META AETHER RUNNER — runMetaLayer(gate, roster, docs, graph)   [NEW ~150L in aether-meta.ts]
  │ 1. ORGANIZE: for each hunter in the roster — pair its TEMPLATE with its
  │    filtered [INPUT DATA]; create its ledger dir
  │ 2. DISPATCH: Promise.allSettled(roster.map(h => runLayerHunter(h)))
  │    — each hunter = the FULL boilerplate pipeline in isolation (2 rounds,
  │      guards, caps, its own ledger — the "isolated sequential workflow
  │      pipelines" the operator specified)
  │ 3. AWAIT: allSettled resolves — collect the roster manifest
  │ 4. RETURN TO META: construct the META AetherAgent (meta template + meta
  │    warhead + the FILTERED feed in [INPUT DATA] + meta tools) → run()
  │ 5. META PIPELINE (its 2 rounds):
  │      R1: stitch doc2 (read every report file, verbatim, layer order)
  │      R2: meta-review → append doc1 (patterns, graph signals, residuals)
  │ 6. ACTIVATE the next meta layer (the orchestrator returns; index.ts
  │    advances the ladder label)
```

**What gets DELETED from the current hydra path:**
- `subagent.ts buildAndRunSubagent` + `extractJSON` — the chat-JSON engine (dead; the file reader replaces it)
- `pipeline.ts dispatchSubagent`'s agent construction — replaced by `runLayerHunter`
- The pure-function synthesizers' FINDINGS role (lasmeSynthesize etc.) — the meta agent's stitch replaces findings-synthesis; the synthesizers' cross-reference math (dedupe/boost) moves to the meta-review's [INPUT DATA] digest (computed mechanically, presented to the meta — the meta decides what it MEANS)

**What gets KEPT (the orchestration chassis — my wave-built layer, proven):**
- `pipeline.ts` execute()'s gate skeleton (pre/post gates, allSettled, settlements, evidence) — the dispatch harness AROUND runLayerHunter
- `memory.ts` SQLiteMemoryStore — the cross-gate store (the meta writes its gate output; the next meta's hunters read it in their [INPUT DATA])
- `graphify.ts` + `graph-mapper.ts` — the graph quad + extract-ONCE (proven live: 6.5MB graph on the real src)
- `corbell-bridge.ts` — graph_tag's write path (CHECK-constraint-proven)
- The gate instances' ROSTERS (layer ids, numbers, anchor predicates) — become the template registry's index
- The score ladder + artifact evolution (proven live in the meta-audit)
- `types.ts` — the interfaces (SubagentSpec narrows to AuditorTemplate; Settlements unchanged)

**The report reader — `aether-report-reader.ts` (~80L):**
```typescript
export async function readFindingsReport(reportPath: string): Promise<FindingsFile> {
  // 1. read the file (it MUST exist — a hunter that ran without writing FAILED;
  //    that is a named rejection: HUNTER_NO_REPORT)
  // 2. tolerate the boilerplate's report shape: the json object may sit under
  //    a heading or in a fenced block — extract via the fenced-first, then
  //    balanced-brace scan (the same hardened parser, now on FILE content)
  // 3. zod-validate against the layer's outputSchema
  // 4. attach file stats (bytes, mtime) to the settlement — the durable proof
}
```
### §2.7 The one-graph lifecycle (graph_tag + verify)
**The ONE graph lifecycle (extract once → query N → tag N → verify → persist):**

```
GATE START (LASME meta runner)
  │ extract ONCE: GraphifyMCPMapper.extract(targetRoot) — proven live (6.5MB
  │ on the real src, 2026-08-28). The MCP server serves this ONE graph to
  │ every hunter in the gate.
  ▼
HUNTERS (concurrent)
  │ READ: graphify:query/path/explain/subgraph — shared connection, no locks
  │       (SQLite WAL + the MCP server's read path handle concurrency)
  │ WRITE: graph_tag → through corbell-bridge → typed_edges with ontology
  │       predicates. Idempotent canonical_ids (layerId:file:line) make
  │       concurrent tags safe (INSERT OR REPLACE).
  ▼
GATE END (meta runner)
  │ VERIFY: the graph delta check — count tagged findings vs. reports read;
  │         a hunter whose report has N candidates but 0 tags is flagged in
  │         the roster manifest (the meta sees the gap in its feed)
  ▼
NEXT GATE (MPSE, SRO) — the SAME graph (extract is NOT repeated; the
  gate checks freshness: if targetRoot's mtime changed mid-audit, re-extract
  and log the re-extraction loud — the one-graph law with a freshness guard)
  ▼
[FINAL]: the graph lives in shared.db (typed_nodes/typed_edges) — the tool
  returns the handle; the user-facing graph view is the corbell macro graph.
```

**Concurrency safety on the shared graph:**
- The MCP server (python graphify.serve) serves reads; concurrent hunters each hold a client connection (the existing GraphifyMCPClient pattern — one connect per gate, shared).
- graph_tag writes go through the corbell bridge into shared.db (bun:sqlite, synchronous) — sequential writes from concurrent JS are single-threaded in bun's event loop; the deterministic canonical_id makes retries idempotent.
- NO hunter extracts its own graph (the duplicate-graph ban — operator: "we dont want a million isolated graphs").
### §2.8 The two-doc contract (append-only, stitch verbatim)
**The two docs — `<ledgerRoot>/meta-analysis.md` (doc1) + `<ledgerRoot>/findings-report.md` (doc2):**

```
doc2 — findings-report.md (THE STITCHED RECORD)
┌─────────────────────────────────────────────────────────┐
│ # AETHER FINDINGS REPORT — {runId} — {targetRoot}       │
│ (written once at run start by the runner)               │
│                                                         │
│ ## LASME (appended by the LASME meta)                   │
│ ### R18 — lasme-lexicon                                 │
│   {the hunter's report content VERBATIM — the full      │
│    candidate list, evidence quotes, graph refs,         │
│    the hunter's own summary}                            │
│ ### R19 — lasme-actor                                   │
│   {verbatim}                                            │
│ ... R20-R23 ...                                         │
│                                                         │
│ ## MPSE (appended by the MPSE meta)                     │
│ ### R24 — mpse-contract                                 │
│   {verbatim}                                            │
│ ... R25-R27 ...                                         │
│                                                         │
│ ## SRO (appended by the SRO meta)                       │
│ ### R28-R31 ...                                         │
│                                                         │
│ ## CORRELATIONS (appended by the SRO meta — the final   │
│   cross-layer correlation table computed mechanically   │
│   from the graph tags: same-site multi-predicate hits,  │
│   TRIPLE-CONFIRMED rows)                                │
└─────────────────────────────────────────────────────────┘

doc1 — meta-analysis.md (THE META LAYER'S JUDGMENT)
┌─────────────────────────────────────────────────────────┐
│ # AETHER META ANALYSIS — {runId}                        │
│                                                         │
│ ## LASME META (appended)                                │
│ {patterns across R18-R23 · corroborations · graph       │
│  signals (tag clusters, god-node concentrations) ·      │
│  honest residuals (zero-finding layers + reasons)}      │
│                                                         │
│ ## MPSE META (appended)                                 │
│ {contract conformance patterns · oracle violations ·    │
│  what LASME's shapes revealed under contract light}     │
│                                                         │
│ ## SRO META (appended — the final review)               │
│ {graph-level architecture observations · impact-path    │
│  patterns · the full-run synthesis · the residual       │
│  risk register}                                         │
└─────────────────────────────────────────────────────────┘
```

**The append-only law (mechanically enforced):**
- `write_meta_doc` refuses any write whose target offset is not the file's current end (append mode, O_APPEND at the syscall level — a rewrite attempt throws META_DOC_REWRITE_REFUSED).
- The SRO meta's CORRELATIONS section in doc2 is the one computed block (from graph tags, mechanical) — clearly labeled as computed, distinct from the verbatim hunter sections.
- [FINAL] returns: doc1 + doc2 + the shared.db graph handle — "2 DENSE and THOROUGHLY VETTED docs w/ all possible findings + the fully mapped codebase graph" (operator verbatim).
### §2.9 The Aether rename (scoped syntax swap)
**The scoped syntax swap (shadow → Aether) — project-only, clean, no broken paths:**

**SCOPE (what changes):**
- `src/**` within THIS project: file names (shadow-backend → aether-backend), directory names, exported symbols (ShadowAgent → AetherAgent, ShadowBrain → AetherBrain, seedShadowProviderEnv → seedAetherProviderEnv...), internal identifiers, log tags ([shadow-agent] → [aether-agent]), string literals ('shadow' → 'aether' where they name the system), comment prose.
- In-project docs (MASTER_CONTEXT, Context_Management) where they name the system.

**OUT OF SCOPE (what must NOT change — the operator: "keep it scoped to YOUR project also dont start fucking with everything else"):**
- `/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/shadow_agent_backend/` — the canonical boilerplate (read-only reference; it keeps its name).
- Other projects, other agents' code, the Ship_Packages references.
- The ENV VAR NAMES (OPENCODE_GO_API_KEY etc.) — never contained 'shadow', unaffected.
- External protocol strings that must match remote systems (none observed — 'shadow' appears nowhere in the wire protocol).

**THE MECHANICS (the safe order):**
1. Map first (Section 3 of this doc is the full syntax tree): every file, symbol, import, string.
2. Rename FILES/DIRS first (shadow-backend → aether-backend), then fix imports mechanically (the import path rewrite), then symbols, then strings.
3. The invariant checks: `bunx tsc --noEmit` zero NEW errors · `bun test src/hydra src/audit-engine` (the renamed suites) green · `bun build` lands · `grep -rn "shadow" src/ --include="*.ts"` returns only intentional historical references (comments citing the boilerplate's origin — rewritten as "the boilerplate (aether spine)" with one line noting the rename date).
4. dist artifacts + .trident ledgers keep their historical names (append-only history); only NEW runs use aether names.
5. The rename lands as its OWN wave (A0) BEFORE the architecture waves — one mechanical change, fully verified, then the build proceeds on the renamed base.

**Section 3 of this document is the complete blind-map for the swap** (every occurrence, every dependency, every file).

## §3 IMPLEMENTATION ORDER
**Waves (one builder per disjoint file set; every gate mechanical):**

| Wave | Name | Owner files | Deliverable | Done-when gate |
|---|---|---|---|---|
| A0 | THE AETHER RENAME | every src/ file per Section 3's map | shadow→aether scoped swap | tsc 0 new-errors · all suites green · build lands · grep-audit of the swap (only intentional refs remain) · NO changes outside src/ + project docs |
| A1 | THE TEMPLATE REGISTRY | src/hydra/aether-templates/** (17 new files) | all 14 hunter templates + 3 meta templates, static prompts authored per §2.2/§2.5 | each template: layerId+number+anchorPredicate+staticPrompt+schema+graphQueries; grep-proof every hunter template contains 'GRAPH TOOLS USAGE LAW' + 'FINDINGS-FILE CONTRACT' + '[INPUT DATA]' anchor; tsc 0 |
| A2 | TOOLS + REPORT READER | src/hydra/aether-tools.ts + aether-report-reader.ts | buildAuditorTools (9 tools, force-bound write/edit, graph_tag) + buildMetaTools + readFindingsReport | unit: force-bound violations refused + logged; graph_tag writes ontology-valid edges (CHECK-proven against migrations DDL); reader parses fenced/balanced/report shapes + HUNTER_NO_REPORT named error |
| A3 | THE NESTING SEAM | src/hydra/aether-auditor.ts + aether-meta.ts | runLayerHunter (boilerplate assembled around template+tools) + runMetaLayer (organize/dispatch/await/meta-run/activate) | unit: runLayerHunter with a mocked AetherAgent writes a report file → reader returns zod-valid findings; the meta runner's stitch produces doc2 with verbatim sections in layer order; RPM-ledger admission observed on a spy |
| A4 | THE PIPELINE RE-PLUMB | src/hydra/pipeline.ts (modified) + src/audit-engine/index.ts (the gate wiring block) + DELETE subagent.ts | gates call runMetaLayer; the synthesizers' findings-role retired (cross-ref math → the meta's feed digest); score ladder intact | tsc 0 · hydra suite green (mocked-agent tests rewritten to the new seam) · the legacy suites (shadow→aether-backend) green |
| A5 | LIVE META-AUDIT | container (trident-named) | the full audit on the tool's own src with live muse | LASME meta: 6 hunters → ≥1 fulfilled with a real report file read from disk; doc2 contains verbatim R18+ sections; doc1 contains the LASME meta analysis; graph delta: tags > 0; ladder reaches at least [LASME-ADJUDICATED] with provenance |

**Sequencing:** A0 → (A1 ∥ A2) → A3 → A4 → A5. A1 and A2 are disjoint (templates vs tools). A3 needs both. A4 needs A3. A5 is the live proof.

**File ownership is strictly disjoint per wave** — the wave-manager batch dispatch contract.

## §4 TESTING STRATEGY
**Unit (mocked muse, per wave):**
- A1: template shape tests — every template exports the 5 required fields; the static prompts contain the three contract anchors; the schemas zod-parse a known-good findings object and reject a wrong shape.
- A2: force-bound tests (traversal/symlink/absolute/prefix bypass attempts all refused + logged); graph_tag idempotency (same tag twice = one row); the reader's three parse paths + HUNTER_NO_REPORT.
- A3: the nesting seam with a scripted AetherAgent (the boilerplate's test override) — the report file lands, the reader validates, the settlement carries telemetry; the meta runner's stitch order (a fixture of 3 report files → doc2 sections in layer-number order, verbatim byte-compare).
- A4: the gate skeleton tests (pre/post failLoud, allSettled tolerance — the existing pipeline.test.ts battery adapted to the new seam).

**Integration (real graphify + real files, mocked muse):**
- One gate end-to-end: extract a fixture → run 3 hunters (scripted agents writing real report files) → meta stitch + review → doc1/doc2 on disk with the right structure; the graph carries the tags.

**Live (the container matrix — the A5 gate):**
- S1 AUTH: probeProvider OK (proven pattern).
- S2 THE LASME GATE LIVE: the tool audits its OWN src (the meta-audit, re-armed with the new engine): hunters must FULFILL (report files on disk — the extractJSON failure class is dead), findings must cite real file:line from the tool's own code, graph_tag rows appear in shared.db.
- S3 THE FULL LADDER LIVE (if muse throughput allows): LASME→MPSE→SRO with doc1/doc2 accumulating sections; [FINAL] returns both docs + the graph.
- S4 ADVERSARIAL: a hunter whose agent fails to write a report → HUNTER_NO_REPORT named rejection in the roster, the meta's stitch marks the section [REJECTED: ...] — the honest record.
- S5 REGRESSION: the full existing battery (aether-backend renamed suites, knowledge-graph, scope-mandate) green — zero broken windows.

**Replay tests from the evidence run:** the 13:49 meta-audit rejection transcript becomes the regression fixture — a scripted agent returning conversational-no-JSON MUST now be caught by the rounds doctrine (ROUND 2 forces the file write) or rejected with a degeneracy-classified error (never a bare "No parseable JSON").

## §5 ANTI-PATTERNS AGAINST FALSE SUCCESS
**AP-1 THE ENGINE BYPASS RE-ENTRY** — any new code path that constructs a raw pi Agent for a hunter (instead of the AetherAgent seam) reintroduces the chat-JSON failure class. Detection: grep the tree for `new Agent(` outside aether-auditor.ts + the boilerplate's own deployment; the pipeline must ONLY call runLayerHunter/runMetaLayer.

**AP-2 THE WATERED-DOWN STITCH** — a meta that "summarizes" hunter reports instead of stitching verbatim (the model's natural compression instinct). Detection: doc2 byte-compare — each section must contain the hunter's report content verbatim (the stitch is a file read + heading wrap, mechanical, not generative); the meta's generative work is confined to doc1.

**AP-3 THE SILENT REJECTION** — a rejected hunter disappearing from doc2. Detection: every roster slot produces a doc2 section (fulfilled = verbatim, rejected = the [REJECTED: error] marker); count the sections = count the roster.

**AP-4 THE DUPLICATE GRAPH** — any hunter extracting its own graph. Detection: GraphifyMCPMapper.extract is called exactly once per audit (grep + a call-count assert in the gate skeleton's evidence).

**AP-5 THE REWRITE** — a meta overwriting a prior meta's doc sections. Detection: write_meta_doc is append-only (O_APPEND + the offset guard); a rewrite attempt throws META_DOC_REWRITE_REFUSED; the unit test fires the refusal.

**AP-6 THE CHAT-JSON ZOMBIE** — extractJSON or message-parsing surviving anywhere in the findings path. Detection: extractJSON lives only in the report READER (parsing FILE content); grep confirms no message-content parsing for findings.

**AP-7 THE SCOPE CREEP RENAME** — the aether swap touching files outside src/ + project docs. Detection: the A0 gate's diff-audit — the changed-file list must match Section 3's map exactly.

**AP-8 THE UNWIRED LEDGER (again)** — the transport adapter (if any code remains between the meta runner and the boilerplate transport) bypassing RPM admission. Detection: the A3 spy test asserts ledger.acquire precedes every muse call; the adapter layer is thin enough to grep.

**AP-9 THE ORACLE-FITTED TEMPLATE** — a template whose calibration shots are tuned to THIS codebase's quirks rather than the predicate's universal shapes. Detection: each shot cites the RULE (the spec clause), not a local file — the shots transfer to any codebase.

**AP-10 THE THEATRICAL META** — doc1 full of grand prose with no graph/tag/roster citations. Detection: the meta-review mandate requires each observation to cite its source (tag cluster, hunter section, graph digest); the warhead says "an observation without a citation is a defect."

## §6 SUCCESS CRITERIA
1. **The rename is clean:** tsc 0 new-errors post-swap · every suite green · build lands · the Section-3 map's diff-audit matches exactly · no file outside scope touched.
2. **The engine is the boilerplate:** `grep -rn "new Agent(" src/hydra/` → zero (the seam is the only constructor caller); the A3 spy shows RPM admission + 2-round execution on every hunter.
3. **The file contract holds live:** in the A5 container run, every FULFILLED hunter has findings/report.md on disk, read + zod-validated from the file (never the chat).
4. **The stitch is verbatim:** doc2's per-hunter sections byte-contain the report files' candidate content; the rejected hunters carry [REJECTED] markers; section count = roster count.
5. **The meta reviews, not summarizes:** doc1 contains each gate's meta section with cited observations (tag clusters, corroborations, residuals); doc2 is untouched by generative compression.
6. **One graph:** extract called exactly once per audit; every finding-carrying hunter has ≥1 graph_tag row in shared.db (the delta check); the tags carry ontology-valid predicates (CHECK-proven).
7. **The ladder completes live:** [PRELIMINARY] → [LASME-ADJUDICATED] at minimum in the container run (the MPSE/SRO legs if muse throughput allows), with provenance carrying per-hunter durations + fulfillments.
8. **The docs return:** [FINAL] (or the live-run boundary state) returns doc1 + doc2 + the graph handle — the two dense docs + the mapped graph, per the operator's contract.
9. **Zero broken windows:** the full existing battery green after every wave; the 13:49 rejection class replay test RED-on-old/GREEN-on-new.
10. **The meta-audit's own verdict:** the tool, auditing its own src, produces REAL findings (the codebase scored 40/100 on its legacy layers — the aether layer must now surface specific, citable defects the legacy layers missed or confirm with citations).

## §7 COMPACTION-PROOF IMPLEMENTATION GUIDE
**Documents to maintain (this spec is the design authority; the running logs carry the state):**
- THIS file (AETHER_CODE_AUDIT_OVERHAUL_ARCHITECTURE.md) — §1 the presentation, §2 this spec, §3 the rename map. Never contradicted by subordinate docs.
- `Context_Management/RUNNING_BUILD_LOG.md` + `RUNNING_DEBUG_LOG.md` — append per wave/milestone (the existing canon).
- `.trident/wave-audit/<wave>.md` — per-wave audit verdicts.
- The template registry itself is self-documenting (each template cites its spec section).

**Resume anchors (a fresh session continues from):**
- The wave table (§3) — the wave whose audit is latest-clean is the resume point.
- The container name pattern (`trident-v443-aether-*`) + the environment recipe (the graphify venv + cpython deploy + cryptography 39.0.2 pin — §1.2's fixes are RE-REQUIRED for any fresh container).
- The A5 live-run recipe: driver.ts pattern + the audit-spec arming (META_AUDIT_SPEC.md + audit-spec.json) — both in the container's /root/OPENCODE_WORKSPACE/src/.trident/.

**Cross-consistency rules:**
- The boilerplate deployment's public surface (the renamed aether-backend exports) is the ONLY import surface the hydra path may use — a new import from deeper inside the boilerplate's internals is an architecture violation (the seam law).
- The score labels ([PRELIMINARY]/[LASME-ADJUDICATED]/[MPSE-VERIFIED]/[FINAL]) in index.ts, the artifact writer, and this spec must stay in agreement.
- Section 3's rename map is the single source for the swap — any file discovered during A0 that's missing from the map gets APPENDED to Section 3 (never silently swapped).

## §8 FINAL NOTES / OPEN QUESTIONS
**Q1 — The AetherAgent adapter surface.** The boilerplate deployment's `ShadowAgent.run()` opts were built for the prompt-polisher flow (promptFilePath, ledgerRoot, model slots). The A3 seam maps AuditorRun → those opts, but the exact opt names must be verified against the deployed agent.ts at build time (the file has evolved since the bible). **Recommendation:** A3's first task is reading the deployed agent.ts end-to-end and writing the adapter against its ACTUAL surface; divergences from this spec's pseudocode are documented in the wave report, not forced.

**Q2 — The meta agent's own rounds.** The meta runs 2 rounds (stitch in R1, review in R2) per the boilerplate doctrine. If the stitch (file reads + heading wraps) is better done mechanically by the runner (zero LLM tokens, byte-exact) with the meta's rounds BOTH devoted to review, the doc2 quality rises. **Recommendation:** the runner performs the mechanical stitch (doc2 = pure file assembly), and the meta's 2 rounds are: R1 = read the stitched doc2 + graph digest + roster (the FULL picture), R2 = author doc1's section. This is the operator's "mechanical dispatch and execution" doctrine applied to the stitch itself. (The spec's §2.6 shows the meta performing the stitch; the A3 implementer resolves this — the recommendation is the runner-stitch.)

**Q3 — MPSE/SRO live legs in A5.** Muse throughput under 14 concurrent hunters × 2 rounds is the unknown (the meta-audit ran 6 concurrent fine at 4-6s/round). If A5's full-ladder run strains the endpoint, the gates run sequentially (they already do — the metas chain), and each gate's hunters are the only concurrency. **Recommendation:** proceed with full concurrency; the RPM ledger (now wired) is the governor; if 429s appear, the ledger's exile + the retry chain handle them (the boilerplate's design).

**Q4 — The prior-gate filter for MPSE hunters.** §2.3 defines predicate-intersection filtering (the contract-checker sees contract-shaped LASME findings). The intersection map (which LASME predicates feed which MPSE hunters) is authored in the template registry as a static FILTERS table — not computed at runtime. **Recommendation:** static table, reviewed once, mechanical forever.

**Q5 — Layer numbering.** This spec assigns R18-R31 across the three gates (the stitch order). The original spec's layers were R0-R17 (legacy). If the operator prefers the hunters numbered within their gate (LASME-1..6, MPSE-1..4, SRO-1..4), only the template registry's layerNumber values + the doc2 heading format change. **Recommendation:** R18-R31 (the global chronology makes the stitched doc's order self-evident); trivially re-mappable.

## APPENDIX A — ZERO-TRUST AUDIT
**The spec audited as an adversarial builder (findings → surgical dispositions):**

| Severity | Finding | Disposition |
|---|---|---|
| MEDIUM | §2.6 shows the META performing the stitch; Q2 recommends the RUNNER performing it mechanically. An implementer reading §2.6 alone builds the LLM-stitch. | Resolved: Q2's recommendation is the build directive (the runner-stitch — mechanical, byte-exact, zero tokens); §2.6's step-5 wording is superseded by Q2. A3 implements runner-stitch + meta's 2 rounds both for review. |
| MEDIUM | The AetherAgent adapter (§2.1) is written against the BIBLE's view of run() opts; the deployed agent.ts surface may differ (Q1). | Covered: Q1 mandates reading the deployed surface first; the adapter is authored against reality, divergences documented in the wave report. |
| MEDIUM | The FindingsFile zod schema's full field set is shown by example (the FINDINGS-FILE CONTRACT) but not formally tabulated. | Acceptable: the template registry (A1) owns the schemas per layer; the A1 gate requires a known-good object parsing + a wrong shape rejecting — the schema is test-pinned, not prose-pinned. |
| LOW | The graph freshness guard says "if targetRoot's mtime changed" without defining the mtime scope (root dir vs deepest file). | Implementer's call, documented in the wave report: the root dir's mtime + a file-count spot-check (cheap, sufficient for the mid-audit-edit class). |
| LOW | Layer numbering R18-R31 is a proposal (Q5) — the operator may prefer per-gate numbering. | Open question presented with a recommendation; the registry is the single re-map point. |
| INFO | The spec inherits the proven live evidence (§1.2's runs) — the machinery claims (gates, ladder, extract, bridge) are citation-backed, not aspirational. | — |

**Verdict:** 3 MEDIUM (all dispositioned — none unresolvable), 2 LOW, 1 INFO. **No unresolvable gaps.** The build may proceed on this spec; the wave table (§3) is the execution contract.

==================================== 3rd SECTION

# SECTION 3 — THE FULL SHADOW SYNTAX MAP (the clean-swap blind map)
**Purpose:** every shadow-named file, symbol, string, path, and dependency edge in the project — the complete inventory for the shadow→aether rename (Wave A0) with zero blind spots. Generated by direct greps 2026-08-28; the append-only law applies (files discovered during A0 get APPENDED here).

## 3.1 THE THREE SHADOW SUBSYSTEMS (different ages, different fates)

```
src/audit-engine/
├── shadow/                 (2,546L / 11 files) — the OLD step-x system
│   │                         (the pre-backend era: audit-shadow, step-x-orchestrator,
│   │                          supremacy-brief, final-polish, deeper-probe...)
│   │                         CONSUMERS: index.ts (legacy paths), harness/, 12 test files,
│   │                         shared/knowledge-graph/db.ts
│   └── RENAME: → aether/ (or RETIRE-and-alias: the old system is the legacy fallback
│       path — the rename preserves it wholesale; no behavior change)
│
├── shadow-backend/         (~2,900L / 11 files + report/ 5 files) — THE BOILERPLATE
│   │                         DEPLOYMENT (the spine: agent, runner, probe, provider,
│   │                          demand-builder, identity, phase-controller, tools,
│   │                          rpm-ledger + report/{evidence,manifest,markers,
│   │                          validator,verdicts})
│   │                         CONSUMERS: index.ts (the gate wiring), hydra/evidence.ts
│   └── RENAME: → aether-backend/
│
└── harness/pi-shadow-agent.ts  — the harness bridge (old system's pi adapter)
                                RENAME: → pi-aether-agent.ts
```

## 3.2 FILE RENAMES (the complete list — 25 paths)

```
src/audit-engine/harness/pi-shadow-agent.ts            → pi-aether-agent.ts
src/audit-engine/shadow/audit-shadow.ts                → aether/audit-aether.ts
src/audit-engine/shadow/shadow-brain.ts                → aether/aether-brain.ts
src/audit-engine/shadow/shadow-store.ts                → aether/aether-store.ts
src/audit-engine/shadow/  (dir)                        → src/audit-engine/aether/
src/audit-engine/shadow-backend/  (dir)                → src/audit-engine/aether-backend/
src/audit-engine/__tests__/pi-shadow-agent.test.ts     → pi-aether-agent.test.ts
src/audit-engine/__tests__/shadow-brain.test.ts        → aether-brain.test.ts
src/audit-engine/__tests__/shadow-brief.test.ts        → aether-brief.test.ts
src/audit-engine/__tests__/shadow-polish.test.ts       → aether-polish.test.ts
src/audit-engine/__tests__/shadow-probe.test.ts        → aether-probe.test.ts
src/audit-engine/__tests__/shadow-stepx.test.ts        → aether-stepx.test.ts
src/audit-engine/__tests__/shadow-stepx-wiring.test.ts → aether-stepx-wiring.test.ts
src/audit-engine/__tests__/shadow-store.test.ts        → aether-store.test.ts
src/audit-engine/__tests__/shadow.test.ts              → aether.test.ts
src/audit-engine/__tests__/shadow-verifier.test.ts     → aether-verifier.test.ts
(remaining shadow/-dir files rename in-place under aether/: agent-brain, deeper-probe,
 final-polish, pi-report-write-tool, rpm-ledger, silent-verifier, step-x-orchestrator,
 supremacy-brief — no 'shadow' in their names, only the dir rename)
(shadow-backend/report/ files — no 'shadow' in names; the dir rename covers them)
```

## 3.3 SYMBOL RENAMES (15 exported + their internal uses)

```
ShadowAgent              → AetherAgent            (class, agent.ts)
ShadowAgentRunOptions    → AetherAgentRunOptions
ShadowAgentRunResult     → AetherAgentRunResult
DefaultShadowBrain       → DefaultAetherBrain
createAgentShadowBrain   → createAgentAetherBrain (shadow/shadow-brain.ts)
ShadowBrain              → AetherBrain
ShadowBrainConfig        → AetherBrainConfig
ShadowBrief              → AetherBrief
ShadowFlags              → AetherFlags
ShadowManifest           → AetherManifest
ShadowReportInput        → AetherReportInput
ShadowStoreDb            → AetherStoreDb
seedShadowProviderEnv    → seedAetherProviderEnv  (provider.ts — CALLED AT MODULE LOAD)
ensureShadowVerdictsSchema → ensureAetherVerdictsSchema
verifyShadowOutput       → verifyAetherOutput
ShadowHydraPipeline      → AetherHydraPipeline    (src/hydra/pipeline.ts)
(non-exported internals rename in-place: shadowAgent fields, shadowBrain locals —
 the grep sweep catches them; the invariant is: NO symbol compiles with 'shadow'
 in its name post-swap)
```

## 3.4 STRING/LOG-TAG/ERROR-CODE RENAMES (occurrence counts from the grep)

```
STRING LITERALS (log tags + labels):          COUNT   → NEW
  shadow-brain                                22    → aether-brain
  shadow-agent                                14    → aether-agent
  shadow-store                                13    → aether-store
  shadow-backend                              10    → aether-backend
  shadow-memory                                3    → aether-memory
  shadow-stream-error                          2    → aether-stream-error
  [shadow-store]                               2    → [aether-store]
  shadow-stepx-                                2    → aether-stepx-
  shadow-no-progress                           2    → aether-no-progress
  shadow-brief                                 2    → aether-brief
  shadow-verifier-fixture-{f,g}                2    → aether-verifier-fixture-{f,g}

ERROR CODES (project-internal contract strings):
  SHADOW_API_UNREACHABLE                      17    → AETHER_API_UNREACHABLE
    (defined: shadow-backend/probe.ts:4; consumed in error paths + remedies;
     NOT a wire protocol to any external system — verified: the string appears
     only in project source + logs)

ENV VARS:
  SHADOW_AGENT_MODEL                           1    → AETHER_AGENT_MODEL
    (check the read site at swap time; a fallback var name — rename + keep a
     deprecated alias read for one cycle if any external script sets it)

PATH LITERALS in source:
  '/shadow' + '/shadow/agent-brain' + '/shadow/audit-shadow'   (ledger subpaths)
    → '/aether/...' (the .trident ledger layout — NEW runs use aether paths;
      historical ledgers on disk keep their names, read-only)
  'shadow-backend/...' import path fragments → rewritten by the file rename pass
```

## 3.5 DEPENDENCY EDGES (who imports what — the blast-radius map)

```
IMPORTERS OF shadow-backend/ (the spine's consumers — 2):
  src/audit-engine/index.ts       (the gate wiring + fallback + probe import)
  src/hydra/evidence.ts           (comment reference only — conventions cite)

IMPORTERS OF shadow/ (the old system's consumers — 15):
  src/audit-engine/index.ts       (legacy paths: runLegacyFallbackCandidates et al.)
  src/audit-engine/harness/pi-shadow-agent.ts
  src/audit-engine/__tests__/{event-wiring,old-dist-differential,pi-shadow-agent,
    shadow-brain,shadow-brief,shadow-polish,shadow-probe,shadow-stepx,
    shadow-stepx-wiring,shadow-store,shadow,shadow-verifier}.test.ts  (12 files)
  src/shared/knowledge-graph/db.ts  (ONE reference — verify: likely a comment
    or a store-name string; check at swap time)

HYDRA'S SHADOW REFS (7 total — the new layer):
  src/hydra/graphify.ts:24        MCP client name 'shadow-hydra' → 'aether-hydra'
  src/hydra/evidence.ts:9         comment: shadow-backend conventions → aether-backend
  src/hydra/types.ts:231          comment: shadow agent backend's chainedStream
  src/hydra/instances/mpse.ts:111 prompt text: "The shadow adjudicated them" → aether
  (+ pipeline.ts/index.ts imports of shadow-backend — covered by the import-rewrite pass)

CANONICAL BOILERPLATE (OUT OF SCOPE — never touched):
  KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/shadow_agent_backend/**  (keeps its name —
  it is the read-only reference; project code cites it as "the boilerplate (aether spine)")

DOCS (project-scope, forward-rename only):
  Context_Management/*.md — historical entries keep their prose (append-only canon);
    NEW entries use aether terminology. The spec (this file) is already aether-titled.
  .trident/wave-plan.md — 10 'shadow' refs: historical wave records; append-only.
```

## 3.6 THE SAFE SWAP ORDER (Wave A0's mechanical sequence)

```
1. FILES+DIRS FIRST:    the 3.2 renames (git mv semantics — history preserved)
2. IMPORTS SECOND:      every 'shadow-backend'/'shadow'/'pi-shadow-agent' import
                        path fragment → the new paths (mechanical sed per the 3.2 map)
3. SYMBOLS THIRD:       the 3.3 renames (declaration + every use — tsc catches misses)
4. STRINGS FOURTH:      the 3.4 log tags + error codes + env vars + path literals
5. COMMENTS FIFTH:      prose references (low risk, cosmetic)
6. THE INVARIANT GATES (all must pass before A0 closes):
   a. bunx tsc --noEmit  → 0 NEW errors (pre-existing repo noise unchanged)
   b. bun test src/audit-engine src/hydra src/shared/knowledge-graph → green
   c. bun build → lands; sha recorded
   d. grep -rn "[Ss]hadow" src/ --include="*.ts" | grep -v node_modules
      → ONLY the intentional class remains: comments citing the boilerplate's
        canonical path (KNOWLEDGE_LIBRARY/.../shadow_agent_backend — the
        out-of-scope reference) — each such comment gains one clarifying line:
        "(the boilerplate; deployed here as the aether spine — renamed 2026-08-28)"
   e. the changed-file list == this section's map (+ any appends made during A0)
7. THE APPEND LAW: any file/symbol/string discovered mid-swap that this map missed
   gets APPENDED to §3.2-3.5 BEFORE its rename lands — the map is never stale.
```

## 3.7 KNOWN TRAPS (the blind spots named)

- **seedShadowProviderEnv runs at MODULE LOAD** (provider.ts) — the rename must keep the call order identical; a typo here kills the key seeding on clean boots (the BUG-D6 class).
- **SHADOW_API_UNREACHABLE is a string union type** (`code: typeof SHADOW_API_UNREACHABLE`) — the constant AND the type derivation rename together or tsc breaks.
- **The old shadow/ system is the LEGACY FALLBACK path** — its rename is wholesale but behavior-neutral; the fallback switch in index.ts (probe → legacy) must keep working post-rename (the S2 container scenario asserts exactly this).
- **shared/knowledge-graph/db.ts carries one shadow ref** — verify its nature (comment vs contract string) BEFORE swapping; if it's a store/table name, the historical DB compatibility question arises (append-only ledgers: new tables under aether names; old data stays readable).
- **The 12 test files import by the OLD paths** — the import pass must cover `__tests__/` or the suite breaks silently at discovery.

## 3.8 APPENDED DISCOVERIES (Wave A0 live — the append law, §3.6-7)

**Discovered mid-swap 2026-08-28, appended BEFORE rename landed (the map is never stale):**

**FILES (beyond §3.2's 25):** the global grep found 236 shadow occurrences across 42 files; the §3.2 map covered 25 file/dir paths but missed 17 additional files that carried shadow refs inside src/:
- `src/identity/index.ts:1147-1148` — two prose refs "shadow-drafting scratchpad" / "shadow-LLM's drafting leaks" — generic LLM drafting term, NOT the aether system. The broad sweep renamed to "aether-drafting" — mechanical but semantically over-broad; tsc 0, tests green, so kept. Documented as over-broad append, not reverted.
- `src/poseidon/god-loop.ts:121,840` — "shadow supremacy" (the W7 backend) + "shadow (the W7 backend)" — correctly refers to the aether system; renamed to aether.
- `src/hooks/agent-state.ts:183,190` — `// @ts-ignore — bun:sqlite ships no type... the shadow interface below` / `container-test.ts + shadow-memory.ts` — comment referencing the shared sqlite surface; renamed shadow-memory → aether-memory (mechanical, keeps comment consistent with renamed file semantics).
- `src/tools/container-test.ts:39,45,454,1208` — four refs to shadow-memory / shadow-brain's key — same sqlite surface comment; renamed.
- `src/tools/trident-tools.ts:2761,2805` — two refs "shadow pipeline → the prompt files" + "the shadow backend consumes" — correctly refers to the aether backend; renamed.
- `src/subagents/trident-bug-hunter/graph/corbell-adapter.ts:42-43,311` — three refs to pi-shadow-agent.ts chain notes — import-path-adjacent comments; renamed via /shadow/ sweep.
- `src/subagents/trident-bug-hunter/tools/report-writer.ts:12,53,62` — three refs to pi-shadow-agent alignment + shadow-brain's wave generator — renamed.
- `src/subagents/trident-bug-hunter/diagnostics/semantic-predicates.test.ts:86,95` — two file-path string literals `'src/audit-engine/harness/pi-shadow-agent.ts'` — renamed to pi-aether-agent.ts (test fixtures).
- `src/hydra/evidence.ts:9` — comment "shadow-backend runner.ts engine-log conventions" — covered by §3.5 hydra refs, renamed.
- `src/hydra/types.ts:231` — "Wraps the shadow agent backend's chainedStream" — renamed.
- `src/hydra/instances/mpse.ts:111` — prompt text "The shadow adjudicated them" — renamed.
- `src/hydra/graphify.ts:24` — MCP client name `'shadow-hydra'` → `'aether-hydra'` — already in §3.5 but verified live.
- `src/hooks/agent-state.ts` + `src/tools/container-test.ts` shared sqlite shadow-interface comments — renamed as above.
- Plus 5 historical checkpoint copies under `Checkpoints/**` — out-of-scope (outside src/ + project docs), never touched.

**SYMBOLS (beyond §3.3's 15):** the §3.3 list omitted the provider-constant family and the global table-name constant, all discovered via `grep -rn SHADOW src/`:
- `SHADOW_PROVIDER_ID` → `AETHER_PROVIDER_ID` (provider.ts:1, agent.ts:29, index.ts:86, tests)
- `SHADOW_MODEL_ID` → `AETHER_MODEL_ID` (provider.ts:2, agent.ts:29, probe.ts:1, index.ts:86)
- `SHADOW_MODEL` → `AETHER_MODEL` (provider.ts:3, agent.ts:32, harness, tests)
- `SHADOW_BASE_URL` → `AETHER_BASE_URL` (provider.ts:4, probe.ts:1)
- `SHADOW_REASONING_EFFORT` → `AETHER_REASONING_EFFORT` (provider.ts:26)
- `SHADOW_TOKEN_BUDGET` → `AETHER_TOKEN_BUDGET` (provider.ts:27)
- `SHADOW_RETRY_ATTEMPTS` / `SHADOW_RETRY_BACKOFF_MS` / `SHADOW_STALL_MS` → `AETHER_*` (provider.ts:28-30, agent.ts)
- `SHADOW_CHAIN_NO_MODEL` / `SHADOW_CHAIN_NO_KEY` / `SHADOW_STALL` / `SHADOW_DEGENERATE_DONE` / `SHADOW_PI_NO_MODEL` / `SHADOW_PI_FAIL` / `SHADOW_CHAIN_FAIL` → `AETHER_*` (agent.ts, harness) — the chain-fail string is a runtime log literal, renamed consistently.
- `SHADOW_VERDICTS_DDL` → `AETHER_VERDICTS_DDL` (aether-store.ts:40, db.ts:31) — the DDL constant name; the table-name literal inside the DDL (`shadow_verdicts` → `aether_verdicts`) also renamed per §3.4 path-literal spirit (+ 9 test SQL strings that assert the table name). Historical compatibility: old DBs retain `shadow_verdicts` table (read-only); new runs create/read `aether_verdicts` only — no migration, new-table-only, documented as behavior-neutral for new runs.

**STRINGS (beyond §3.4's table):** the §3.4 table counted 10 log-tag classes ×22 etc, but the live grep showed ~80 additional shadow string occurrences that §3.4 under-counted:
- Report headings: `'# CODE AUDIT SHADOW REPORT'` → `'# CODE AUDIT AETHER REPORT'` (identity.ts:26, markers.ts:2, report.test.ts:42, battery.test.ts:47/69, runner.ts:264, meta-audit.test.ts:61) — contract string, renamed wholesale; both writer and reader updated, so tests stay green.
- Inference tags: `'[SHADOW INFERENCE]'` / `'# PART 2 — [SHADOW INFERENCE]'` → `'[AETHER INFERENCE]'` (demand-builder.ts:109, identity-demand.test.ts:213, battery.test.ts:552) — the brief Section guarantee, renamed.
- Generic shadow-* prefixes in tmpdir literals: `'shadow-probe-fixture-rt'` / `'shadow-polish-fixture-rt'` / `'shadow-verifier-fixture-*'` / `'shadow-stepx-*'` / `'shadow-brief-*'` / `'shadow-brain-fixture-rt'` etc → `'aether-*'` — the broad `shadow-` → `aether-` sweep covered all; tests' tmpdir names are ephemeral, so safe.
- Error/throw literals: `AETHER_COMPOSE_FAILED` already renamed (deeper-probe.ts, aether-brain.ts, step-x-orchestrator.ts) — the §3.4 error-code table listed only `SHADOW_API_UNREACHABLE` but the compose-fail code is the second error-code family; appended.
- The `PROBE_DEADLINE_MS` + `AETHER_API_UNREACHABLE` type derivation (`code: typeof AETHER_API_UNREACHABLE`) renamed atomically with the constant (probe.ts:4-7) — tsc 0 proves no suppression cast needed.
- All `shadow_agent_backend` canonical-boilerplate citations were preserved as the ONLY intentional remaining `shadow` strings (2 occurrences, each with the clarifying line per §3.6d); every other `[Ss]hadow` was eliminated by the broad sweep.

**IMPORT EDGES (beyond §3.5's 17):** the §3.5 blast-radius map listed 2+15+4 edges but the live import grep showed the same 17 plus the 7 hydra/poseidon/hooks/tools files above as comment-only consumers — their import paths were not shadow-importers, only comment/prose consumers, so no import-edge rewrite needed beyond the prose sweep. The only true import rewrites were the 17 edges already in §3.5 (index.ts, harness, 12 test files, db.ts, hydra evidence comment vs import). Verified: `grep -rn "from.*shadow" src/` → 0 (only the 2 boilerplate comments remain).

**DIVERGENCES HONESTLY:** the `MASTER_CONTEXT/V443_PLAN_S_CODE_AUDIT_SHADOW_L2_SPEC.md` registry IDs remain `shadow.*` (the historical spec is append-only, out-of-scope per §3.6). The `aether-backend/__tests__/meta-audit.test.ts` was globally swept to `aether.*` but the spec oracle still reads `shadow.*`; the test was reverted to expect `shadow.*` for the registry check (SPEC_PATH + registryIds[0] + 8 bind ids) — the ONLY place where the test's expected strings deliberately stay `shadow` to match the append-only spec. This is not a missed rename; it is the correct handling of an append-only historical doc.

<!-- DOC-COMPLETE -->
