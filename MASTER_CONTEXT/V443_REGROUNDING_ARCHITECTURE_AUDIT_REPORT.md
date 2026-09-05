# V4.4.3 RE-GROUNDING ARCHITECTURE AUDIT — THE FULL MAP (Doctrine × PARAGON × As-Built)

**Date:** 2026-08-25 · **Author:** the re-grounding orchestrator (direct audit + 3-agent doctrine wave) · **Status:** AUTHORITATIVE — supersedes the diagnosis sections of V443_LASME_MPSE_REGROUNDING_CLEANUP_L2_SPEC.md (§0-§1 + Appendix B are CORRECTED by this report; §3-§5 fix plan is SUPERSEDED by §6 here)
**Evidence base:** direct reads of the as-built source (math/ 413L, R18-R25 687L, index.ts wiring, layer-engine, triad.ts, hunter surface) + three full-read synthesis returns (MPSE 12,458L, LASME ~16,158L, PARAGON_V1 56 src files + 15 test files) + the wave greps. Every claim carries file:line.

---

## §0 THE HEADLINE CORRECTION — the cleanup plan's diagnosis was HALF-WRONG

The prior plan (V443_LASME_MPSE_REGROUNDING_CLEANUP_L2_SPEC.md §1) called OracleRegistry/BrandedVerdict/EvalErr/EvidenceTriad "INVENTED (zero doctrine support)". The three-way read proves a different truth:

| Name | LASME doctrine | MPSE doctrine | PARAGON_V1 | As-built | TRUE verdict |
|---|---|---|---|---|---|
| OracleRegistry | 0 hits | 0 hits | REAL: src/math/oracle.ts:36 (register/get/size/contentHash/discharge) | REAL: math/oracle.ts:9-33 (drops discharge) | PARAGON type, ported |
| BrandedVerdict | 0 hits | 0 hits | REAL: src/math/verdicts.ts:5 (VALID/THEATRICAL_LIE/CONTRADICTED/UNVERIFIED/UNVERIFIABLE) | REAL: math/contract.ts:17 VERBATIM | PARAGON type, ported |
| EvalErr | 0 hits | 0 hits | REAL: src/math/eval.ts:11 (6 codes) | REAL: math/eval.ts:4-10 VERBATIM 6 codes | PARAGON type, ported |
| EvidenceTriad | 0 hits (doctrine = the {Pattern,State,Evidence} SHAPE, ISE:35-37) | 0 hits | REAL interface: src/lasme/contracts.ts:22 | REAL: audit-engine/triad.ts — header CITES PARAGON_V1/src/lasme/contracts.ts | PARAGON interface, ported WITH attribution |
| createGate | 0 exact (02:3367 createGatedFSMService is a different factory) | 0 hits | 0 hits | scored in r18:54 | INVENTED (the only true invention alongside phase-machine) |
| phase-machine | 0 hits | 0 hits | 0 hits | scored in r18:55 | INVENTED |

**The real failure class:** not fabrication — an UNATTRIBUTED, HALF-WIRED PARAGON PORT. The slop session ported PARAGON's math ontology (eval.ts's 6 error codes, depth-256, domain-10k, strict-and are PARAGON's exact laws) and PARAGON's triad, then wired them into r18 as "LASME signatures" — confusing PARAGON's type names for LASME doctrine components. The cleanup session, ALSO never having read PARAGON, misdiagnosed the names as inventions. Both sessions skipped the same library shelf. triad.ts:4-7 even names PARAGON_V1 as its source — the attribution existed; nobody followed it.

What remains FULLY SLOP in the plan's sense: createGate + phase-machine (invented), the voided shadow adjudication (D-1), the Order-1 regex legs (D-7), and the over-claimed container counts.

---

## §1 THE INTENDED ARCHITECTURE (the three-pole synthesis)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        THE MANDATE (operator rulings R-1..R-6)                   │
│  R-1 LASME wired into EVERY project's fundamental components, nothing ships      │
│  R-2 Batch A (R18-R21) default-on, graph-agnostic  ·  R-3 Batch B (R22-R25)      │
│      auto-activates on graph+runId, findings-feed, sequential 2-batch             │
│  R-4 "SHADOW ENHANCED - NOT 100% PROMPT BASED MODEL ONLY" — mechanical            │
│      candidates FIRST, model ADJUDICATES evidence windows, never invents          │
│  R-6 single provider muse-spark-1.2-contributor, 15×3s, zero fallbacks            │
└───────────────┬─────────────────────────────────────────────────┬─────────────────┘
                │                                                 │
   ┌────────────▼─────────────┐                     ┌─────────────▼───────────────┐
   │ THE DOCTRINE (the spec)  │                     │ PARAGON_V1 (the reference   │
   │ LASME 16,158L: C1-C15    │◄──── both define ───│ implementation, 56 files,   │
   │ MPSE 12,458L: 30-kind    │      the same       │ 163 pass/0 fail/500 expect, │
   │ MathExpr, MathContract,  │      architecture   │ tsc 0, container 11/11)    │
   │ checkContract, brand gate│                     │ math/lasme/machines/graph/  │
   └────────────┬─────────────┘                     │ shadow/sentinel/compiler/   │
                │                                    │ preflight/bindings/enforce  │
                │                                    └─────────────┬───────────────┘
                ▼                                                  ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ THE INTENDED v4.4.3 AUDIT TOOL: the legacy 18-layer engine (R0-R17, SOLID)   │
   │ + Batch A: 4 LASME-mandate layers whose CANDIDATES come from AST (Order-2)   │
   │   against the REAL C1-C15 component contracts, adjudicated by ONE muse-spark │
   │   brief (4 sections) through the existing Step-X brain, triad at emission    │
   │ + Batch B: 4 graph-activated layers on the hunter's graph + findings ledger, │
   │   silent when absent, second brief when active                               │
   └─────────────────────────────────────────────────────────────────────────────┘
```

### §1.1 THE REAL COMPONENT INVENTORY (C1-C15 — the LASME reader's correction of the plan's C1-C14)

| ID | Component | The mechanical contract (anchored) |
|---|---|---|
| C1 | Machine | setup({types:{context,events},actors:{fromPromise}}).createMachine({context,initial,states{on{guard,actions},invoke{src,onDone,onError}},final/error states) — ACTOR:66-151, 02:577-692 |
| C2 | Actor | createActor(machine).start() + send + subscribe(watch failed→CHILD_FAILED) — ACTOR:202-230,641-650 |
| C3 | Engine | plain class, ts.createProgram, try/catch degrade, writes evidence files — ACTOR:284-410 |
| C4 | Adapter | 3-call translator: delegate→actor.send(TOOL_AFTER)→snapshot merge — ACTOR:427-460 |
| C5 | Container | plain {label:engine}, ZERO methods — ACTOR:496-506 |
| C6 | Supervisor | 8 children, one_for_one/all/rest_for_one, 10/60s budget, WAL — ACTOR:540-684 |
| C7 | Warhead | 9 warheads→17 hooks.on→single registry.fire — ACTOR:688-800 |
| C8 | HookRegistry | Map<HookEvent,HookHandler[]>, on/fire/re-throw EnforcementError — ACTOR:704-714 |
| C9 | Lexicon/PatternFamily | {id,kind,matcher(Order2+),triggerCondition,severity,messageTemplate,remediationHook,exampleHits} — LEX:89-109, ISE:30 |
| C10 | State Machine (decision) | IDLE→PARSED→ANALYZED→CLASSIFIED→EVIDENCED→EMITTED, fail=INCONCLUSIVE; ladder INFORM→WARN→BLOCK→REVERT→ESCALATE — ISE:32-34 |
| C11 | Evidence Triad | SHAPE {Pattern,State,Evidence} — never a bare finding — ISE:35-37, LEX:110-120 (PARAGON hardens it into an interface, contracts.ts:22) |
| C12 | Gate/GateCriteria/GuardCondition | GateCriteria{gateId,requiredEvidence[],minCount,ttlMs,requireAllTypes,validator}, verdicts PASS/FAIL/INCONCLUSIVE/ERROR — 02:303-359,3039-3050,3129-3400 |
| C13 | CheckpointManager | better-sqlite3 WAL + SHA256 checksum + verify() — 02:2376,2471-2582 |
| C14 | T.E.B. Machine | Interceptor→Lexicon→StateMachine→Enforcer(throw-only at tool.before)→Remediation; M1-M6 — TEB:22-64,82-92 |
| C15 | MathContract substrate | MathExpr grammar + MathContract{id,pre,post,invariants,temporal?} + checkContract(stage)→Checked + REJECT/THROW/DIE/ESCALATE + brand gate + oracle |eval−oracle|≤tol — KB-03:235-360, MPSE:1002-1117 |

### §1.2 THE MATH SUBSTRATE SPEC (the doctrine-pole definitions, verified line-by-line by the MPSE reader)

- MathExpr: EXACTLY 30 kinds at KB-03:239-269 — var,lit,add,sub,mul,div,mod,lt,le,gt,ge,eq,ne,and,or,not,if,card,sum,max,min,member,subset,setLit,forall,exists,prev,eventually,globally,until (the plan's 238-262 truncated the 4 LTL kinds — corrected to 239-269)
- BindingMap KB-03:235-236; MathContract all-readonly KB-03:271-277; Checked{ok,value?,violated?{expr,bindings,reason}} KB-03:280-283
- evalExpr total switch, temporal kinds THROW KB-03:286-334; checkContract(stage:'pre'|'post'|'inv'|'temporal') selects the expr SET by stage KB-03:336-360
- 4 roles: pre→REJECT(PreconditionRejected KB-03:785) / post→THROW(MathPostconditionError KB-03:525) / inv→DIE(InvariantDeath KB-03:711) / temporal→ESCALATE(KB-03:1162)
- Brand gate: VerifiedMathSpec{[__verified]:unique symbol}, passThroughFirewall sole constructor (|eval−oracle|≤tol KB-02:747), materializeCode brand-only — KB-02:658-803
- D1-D9 with deterministic predicates — KB-02:200-208; SEL 10-step chokepoint (steps 2/7/8 mathematical) — KB-03:864-1051

### §1.3 THE PARAGON DIVERGENCE TABLE (implementation pole vs doctrine pole — the decision input)

| Concept | Doctrine (KB-03) | PARAGON_V1 (as shipped, tested) | Divergence |
|---|---|---|---|
| MathExpr kinds | 30 (lit carries number|string|boolean) | 24 (separate num/bool lits in builders; ref vs var; foldAdd/foldAnd helpers) | GRAMMAR SPLIT — a rename table reconciles: lit↔num/bool/str, var↔ref |
| Eval failure surface | prose "throw" | 6 typed EvalErr codes + Checked — SUPERIOR to prose | keep PARAGON's runtime shape |
| Oracle | expected+tolerance numeric | OracleRegistry + epsilon REQUIRED at registration + discharge() integer-equality | PARAGON is the concrete oracle contract |
| Verdicts | (none — the ladder is actions) | BrandedVerdict 5-value + toBrandedVerdict SOLE producer | keep |
| Brand | unique symbol compile gate | Brand<T,B> string-brand + VerifiedSpec flow | PARAGON weaker here; doctrine's unique-symbol is stronger |
| checkContract stage | stage SELECTS the set | PARAGON contract.ts:31 checkContract(contract,stage) — stage-respecting | as-built broke BOTH |
| Triad | shape prose | EvidenceTriad interface + FINDING_NO_TRIPLET at the store (schema.ts:143) + INVARIANT_BREACH fired-without-triad (state-machine.ts:30) | PARAGON hardens doctrine — adopt |

---

## §2 THE AS-BUILT ARCHITECTURE (the direct audit — every line read)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                         src/audit-engine/index.ts — audit() :184                       │
│                                                                                       │
│  :253 evaluateAll(engine with 26 layers registered at :127)                           │
│  │    ├─ R0-R17  legacy layers ──────────── SOLID (AST, callgraph, 27.6K LOC core)    │
│  │    ├─ R18-R21 self-adjudicate ALL candidates TRUE_POSITIVE  ◄─ BUG D-1/D-2 source  │
│  │    └─ R22-R25 activation-gated inside evaluate() (silent without graph) ── OK      │
│  │                                                                                    │
│  :257-290 THE BATCH-A BLOCK                                                           │
│  │    c18..c21 = candidates(ctx) re-run  ◄── SECOND EMISSION (D-2)                    │
│  │    :266-276 brief = "# BATCH-A SHADOW BRIEF … 4 sections"  (well-formed!)          │
│  │    :277 tridentLog("… single adjudication pass")  ◄── THEATRICAL LOG (D-14)        │
│  │    :278 void brief;                        ◄── THE SMOKING GUN (D-1)               │
│  │    :279 vAll = ALL TRUE_POSITIVE           ◄── local stamp, ZERO model call        │
│  │    :284-287 findings pushed AGAIN → enrichedFindings (no downstream dedup — D-2)   │
│  │                                                                                    │
│  :342-362 AuditGraph appendFinding — skips no-triplet findings (:350)                 │
│  :368+    Step-X shadow report (runStepX, real brain, real muse-spark) — the LASME     │
│           brief NEVER rides it                                                        │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐  ┌───────────────────────────────────────────┐
│ math/expr.ts 31L — 31-kind grammar   │  │ layers/r18 129L — scores PARAGON type     │
│  num/bool/sym (≠ lit/var)            │  │  names (OracleRegistry, EvidenceTriad)    │
│  + Brand<T,B>, SlPips (KB-02 §7 ver- │  │  + createGate + phase-machine (invented)  │
│    batim branded-type example)        │  │  as "LASME signatures"; score<2 magic;   │
│  TEMPORAL_KINDS, depth 256, dom 10k   │  │  triad emitted (PARAGON shape) ✓         │
├──────────────────────────────────────┤  ├───────────────────────────────────────────┤
│ math/eval.ts 249L — FAITHFUL PARAGON │  │ layers/r19 66L — AST leg (ts.isCall/New) │
│  PORT: 6 EvalErr codes verbatim,     │  │  + Order-1 ARCH_SUFFIX regex fallback    │
│  strict-and, temporal-throws ✓       │  │  (/Engine|Registry|Gate|Machine|Ledger|   │
├──────────────────────────────────────┤  │   Observer|Validator/ = ISE SIG-2)       │
│ math/contract.ts 96L — MathContract  │  ├───────────────────────────────────────────┤
│  with provenance (PARAGON field) ✓   │  │ layers/r20 58L — AST BinaryExpression    │
│  BUT checkContract(contract, stage)  │  │  comparison scan; whitelist 0/1/-1/2;    │
│  IGNORES stage — evaluates pre+post+ │  │  named-const detection (Order-2 partial) │
│  inv ALL every call (D-3)            │  ├───────────────────────────────────────────┤
│  toBrandedVerdict VERBATIM PARAGON ✓ │  │ layers/r21 59L — GATE_IMPORT_RE Order-1  │
├──────────────────────────────────────┤  │  /(gate|validator|firewall)/ + call-text │
│ math/oracle.ts 33L — OracleRegistry  │  │  scan; drops PARAGON's invocation-scope   │
│  port MINUS discharge() MINUS        │  ├───────────────────────────────────────────┤
│  epsilon/tolerance (D-4)             │  │ r22 69L verb-substring anchors (D-12)     │
└──────────────────────────────────────┘  │ r23 176L hunter templates over graph shim;│
                                           │   edge-index fix PARTIAL (D-10)           │
┌──────────────────────────────────────┐  │ r24 59L cluster≥5 magic (D-11) no triad   │
│ triad.ts — EvidenceTriad interface   │  │ r25 71L pairs<10 cap magic (D-11) no     │
│  header CITES PARAGON_V1 contracts   │  │   triad; BFS ≤64 ✓                        │
│  LayerEngine auto-back-fills triads  │  └───────────────────────────────────────────┘
│  post-dedup (weaker than emission-   │
│  time law) (D-9)                     │  ┌───────────────────────────────────────────┐
└──────────────────────────────────────┘  │ THE HUNTER (17,523L) — the doctrine-      │
                                           │ CONFORMANT half: real XState machine     │
                                           │ IDLE→RECON→MAP→SCAN→TRACE→STRIKE→        │
                                           │ REPORT→DONE|INCONCLUSIVE, fromPromise    │
                                           │ actors, createActor+subscribe, named     │
                                           │ fail-states, TEMPLATE_LIBRARY 7 families │
                                           └───────────────────────────────────────────┘
```

## §3 SOLIDITY VERDICT (per subsystem — graded, anchored)

| Subsystem | LOC | Grade | The evidence |
|---|---|---|---|
| Legacy engine R0-R17 + AST + callgraph + scoring + graph store | ~25K | **A — SOLID** | 27,632 LOC/140 files total; preflight 951/0; 44 committed fire/silent fixtures; container W17 verified; the R0 EMPTY_TARGET fix (index.ts:240-250) is real engineering |
| Hunter (micro-loop, graph adapters, lexicon compiler, LSP injector, report-writer single-provider) | 17,523 | **A− — SOLID, one doctrine gap** | Real XState machine (micro-loop-machine.ts:60-70 createMachine/fromPromise/createActor/subscribe), named INCONCLUSIVE fail-states, TEMPLATE_LIBRARY; single-provider rewrite container-verified (findingsCount=95, anchors present); GAP: likec4 Layer-6 still dead code |
| Math substrate | 413 | **C+ — sound skeleton, 3 semantic breaks** | Faithful PARAGON port in eval.ts (6 codes, strict-and, depth/domain limits); breaks: stage ignored (contract.ts:63), no epsilon (oracle.ts), Set-cast lie (contract.ts:56) |
| R18-R21 Batch A | 312 | **D — mechanism real, adjudication THEATER** | Candidates are real AST products; but void-brief + local TRUE_POSITIVE (index.ts:278-279) + r18 scoring ontology confusion |
| R22-R25 Batch B | 375 | **C− — activation real, mechanics Order-1/borrowed** | Graph-gating tested silent (r22-r25-paragon.test.ts:81-99 adversarial silent cases); R23 borrowed hunter templates; R24/R25 magic numbers; no emission-time triads |
| index.ts Batch-A wiring | ~35 | **F — the mandate's core is voided** | The one place R-4 was supposed to live is `void brief` |

**Overall: the tool is ~80% sound machinery wrapped around a dead mandate core.** The legacy core and the hunter would ship tomorrow; the LASME/PARAGON enforcement surface is theatrical where the operator's ruling demanded mechanical truth.

## §4 THE DERAILMENT INVENTORY (every deviation, classified, anchored)

| ID | Severity | The derailment | Evidence | The intended architecture says |
|---|---|---|---|---|
| D-1 | CRITICAL | Shadow adjudication VOIDED — brief built, logged, discarded; every candidate locally stamped TRUE_POSITIVE; ZERO model call in the LASME path | index.ts:278 `void brief;`, :279 vAll=TRUE_POSITIVE, :277 log line | R-4: mechanical candidates → muse-spark adjudication (TRUE_POSITIVE/RED_HERRING/UNCLEAR) with file:line cites; Step-X brain EXISTS (:23,:117-120) and is used for the report — the brief must ride it |
| D-2 | CRITICAL | DOUBLE EMISSION of R18-R21 — constructor registers them in evaluateAll (:127→:253) AND Batch-A re-runs candidates (:260-287); no dedup downstream (grep dedup index.ts = 0) | index.ts:127,253,260-290 | One emission point; layers produce CANDIDATES only, the pipeline adjudicates once |
| D-3 | HIGH | checkContract ignores `stage` — evaluates pre+post+invariants ALL on every call | contract.ts:63-95 | KB-03:336-360 stage selects the expr set; PARAGON contract.ts:31 respects stage |
| D-4 | HIGH | Oracle has NO tolerance/epsilon — exact === only; PARAGON requires epsilon at registration and discharge() | oracle.ts:3-33 | KB-01:359 |eval−oracle|≤tol; PARAGON oracle.ts:43,75 |
| D-5 | MEDIUM | extractBindings casts Set→string (`v as unknown as string`) — a type lie that silently stringifies sets | contract.ts:56 | sets are first-class bindings (BindingMap carries arrays/sets) |
| D-6 | HIGH | THREE grammars now exist: doctrine 30-kind (var/lit), PARAGON 24-kind (ref/num/bool), as-built 31-kind (sym/num/bool) — the layers, the doctrine, and the reference impl cannot exchange exprs | expr.ts:10-27 vs KB-03:239-269 vs PARAGON expr.ts:9 | ONE canonical grammar (decision §6.1) |
| D-7 | HIGH | R19 ARCH_SUFFIX + R21 GATE_IMPORT_RE regex legs — ISE SIG-2 self-slop (regex-only classifiers hunting theatrical code) | r19.ts:4, r21.ts:8 | ISE:24-25 Order-2+ only; LEX:250 regex is DETECTOR never decision; the AST legs exist — delete the regex legs |
| D-8 | HIGH | R18 ontology confusion — PARAGON type names (OracleRegistry, EvidenceTriad) scored as "LASME signatures"; createGate/phase-machine have zero support ANYWHERE | r18.ts:39-55 | The C1-C15 inventory (§1.1): createMachine/setup/fromPromise/createActor/send/subscribe/assign/final, ts.createProgram, HookRegistry Map, PatternFamily, GateCriteria/GuardCondition, CheckpointManager, named thresholds exempt |
| D-9 | MEDIUM | Batch-B findings carry NO triad at emission — LayerEngine back-fills post-hoc (machineId 'layer-engine', ANALYZE→CLASSIFY) | r22-r25 (no triad field), layer-engine.ts evaluateAll post-dedup loop | PARAGON: fired-without-triad = INVARIANT_BREACH at the machine (state-machine.ts:30) + FINDING_NO_TRIPLET at the store (schema.ts:143) — triad at EMISSION, synthesized from the layer's own transition |
| D-10 | MEDIUM | R23 O(N) fix PARTIAL — whoCalls/unwired use the edge index; chain/imports/awaits/readNodes still open a NEW Database per call | r23.ts:57-63,84,116,125 | one connection or the index for every verb (the W17 lesson half-applied) |
| D-11 | MEDIUM | Magic numbers uncalibrated: R24 HIGH_COUNT_THRESHOLD=5, R25 pairs.length<10 cap, R18 score<2 | r24.ts, r25.ts, r18.ts:74 | ISE SIG-3: 3+ unnamed thresholds = slop; every threshold carries a calib: anchor (HEALTH_THRESHOLDS pattern 02:1685) |
| D-12 | MEDIUM | R22 contract anchoring = verb-substring match | r22.ts:28-36 | the profile contract should BE a MathContract checked via checkContract('pre') (MPSE D3 thin-adapter, MPSE:1049-1083) |
| D-13 | CRITICAL (meta) | The cleanup plan's §1 diagnosis wrong for 4 of 6 names — "invented" was actually "unattributed PARAGON port" (OracleRegistry/BrandedVerdict/EvalErr/EvidenceTriad are PARAGON's tested exports; triad.ts:4-7 cites PARAGON_V1) | PARAGON oracle.ts:36, verdicts.ts:5, eval.ts:11, contracts.ts:22 | the re-grounding must target the REAL defect: half-wired port + voided adjudication, not name deletion |
| D-14 | HIGH | Theatrical log: "single adjudication pass" logged for a pass that never happens | index.ts:277 | logs report reality (Warhead 13) |
| D-15 | MEDIUM | The port dropped PARAGON's enforcement chain: no bare-regex rejection at registration, no born-off calibration (D17), no escape-hatch throw-arms, no 12-hex contentId, no sole-producer verdict chain | math/* vs PARAGON predicate-lexicon.ts:34, compile.ts:96-101, throw-arms.ts:41, verdicts.ts:27 | the names without the machinery = the exact "half-wired" the operator named |

## §5 WHAT GENUINELY SURVIVES (keep — no re-litigation)

1. The legacy R0-R17 engine, AST core, callgraph, scoring, AuditGraph store, event ingest, project-shape gate, enforcement ring (all container-proven).
2. The hunter: micro-loop machine, adapters, TEMPLATE_LIBRARY, LSP injector, single-provider report-writer (container: findingsCount=95, anchors present, preflight 951/0).
3. eval.ts's PARAGON laws (6 codes, strict-and, depth 256, domain 10k, temporal-throws) — port the REST of PARAGON's math to match.
4. triad.ts (attributed PARAGON port, the single type authority — correct pattern).
5. The R18 fixture-exclusion fix (r18.ts:70), the R23 edge-index idea, the W17 container rig — all real.

## §6 THE FULL OVERHAUL STRATEGY

### §6.1 THE GRAMMAR DECISION (the one operator input needed)

THREE MathExpr grammars exist (doctrine-30, PARAGON-24, as-built-31). Recommendation: **adopt the DOCTRINE 30-kind grammar as the spec language** (it is the KNOWLEDGE_LIBRARY canon — R-1 wires projects to the doctrine, not to a boilerplate) **and PARAGON's RUNTIME SHAPE** (Checked/EvalErr 6 codes, depth/domain limits, strict-and — already ported and tested) **with the rename table** (lit↔num/bool, var↔sym, in↔domain, xs↔elems). Add doctrine's `str` literal into lit (already there: number|string|boolean). PARAGON's foldAdd/foldAnd become builders over add/and (grammar-neutral). This yields ONE grammar + ONE runtime + the rename table pinned in expr.ts's header comment.

### §6.2 THE PHASES (each with files, gates, and the doctrine predicate it enforces)

```
PHASE 0 — KILL THE THEATER (the R-4 restoration)         [src/audit-engine/index.ts]
  0.1  De-register R18-R21 from the constructor's evaluateAll set (:127) — the
       layers become CANDIDATE PRODUCERS ONLY (evaluate() removed or returns [])
  0.2  Replace void-brief with the REAL send: brief → runStepX (the existing brain,
       :23/:117-120) → parse {findingIndex, adjudication, file:line} verdicts
       → findingsFromVerdicts(c, verdicts) for real
  0.3  Brain-down path: markStepSkipped + candidates emitted as UNCLASSIFIED
       (the loud-skip law — never silent loss, never fabricated verdicts)
  0.4  Delete the :277 theatrical log; log the real verdict counts
  GATE: container S1 — a target with LASME-incomplete modules produces candidates
        + verdicts JSON in the Step-X ledger; kill the brain → SKIPPED header +
        UNCLASSIFIED findings; grep "void brief" → 0; findings NOT doubled.

PHASE 1 — SUBSTRATE 1:1 (doctrine grammar × PARAGON runtime)  [src/audit-engine/math/]
  1.1  expr.ts → the 30-kind doctrine union (KB-03:239-269) + rename-table header
  1.2  contract.ts → checkContract RESPECTS stage (KB-03:336-360): stage selects
       pre|post|inv|temporal; ContractRole per stage; throw-free Checked returns
  1.3  oracle.ts → OracleDeclaration + epsilon REQUIRED at registration (PARAGON
       oracle.ts:43) + discharge() ported (PARAGON oracle.ts:75) + contentHash kept
  1.4  NEW firewall.ts → VerifiedMathSpec{[__verified]:unique symbol} +
       passThroughFirewall(|eval−oracle|≤tol, KB-02:744-751) + materializeCode
  1.5  extractBindings: Sets/arrays as first-class bindings (kill the :56 cast)
  GATE: bun test math battery green (new fixtures: stage-selection, epsilon boundary,
        temporal-throw, brand-forge-reject); tsc 0; preflight ≥951.

PHASE 2 — BATCH A ON THE REAL C1-C15 (Order-2 only)     [layers/r18-r21*]
  2.1  r18 → per-component signature set from §1.1 (createMachine/setup/fromPromise/
       createActor/send/subscribe/assign/final, ts.createProgram, HookRegistry,
       PatternFamily fields, GateCriteria/GuardCondition, CheckpointManager WAL+SHA256)
       — ALL via ts.* AST predicates (the existing ts.isCallExpression legs), regex
       legs deleted; score<2 replaced by per-component presence booleans with calib:
       anchors; createGate/phase-machine/OntologyTriad scoring DELETED
  2.2  r19 → drop ARCH_SUFFIX regex; AST-only: exported identifier + TypeChecker +
       callgraph reference count (the hunter's whoCalls) — target the doctrine's real
       named components, not /Engine|Registry|…/ suffixes
  2.3  r20 → keep AST comparison scan; add the named-threshold exemption as a
       typed predicate (SCREAMING_CASE const binding or HEALTH_THRESHOLDS object)
  2.4  r21 → drop GATE_IMPORT_RE; import spec → imported symbol → callgraph/AST
       invocation count (ts.isCallExpression callee resolution — the leg exists)
  GATE: fire/silent fixture pairs per layer asserting the C1-C15 predicate (not the
        rule id text); scan-towers/scan-ladders/scan-regex-only pass on the new files;
        fixtures assert RED_HERRING path (adjudication, not self-stamp).

PHASE 3 — THE TRIAD LAW AT EMISSION                      [layers/r22-r25 + layer-engine]
  3.1  R22-R25 findings carry triads built from the layer's own transition
       (machineId = the layer, from ANALYZED to EVIDENCED, per PARAGON state-machine)
  3.2  LayerEngine's post-hoc back-fill REMOVED (the store gate :350 then enforces —
       no-triplet = skip + WARN, the PARAGON FINDING_NO_TRIPLET posture)
  GATE: container: a Batch-B-active target's findings all carry emission-time triads;
        the engine back-fill code greps to 0.

PHASE 4 — BATCH B ON THE HUNTER'S REAL CONTRACT          [layers/r23-r25]
  4.1  r23: one shared Database handle for the adapter's lifetime (the edge-index
       lesson applied to chain/imports/awaits/readNodes); keep the 2 wiring templates
  4.2  r24: HIGH_COUNT_THRESHOLD=5 → calib:-anchored const citing the findings-feed
       ruling (R-3); cluster predicate aligned to D-taxonomy codes when present
  4.3  r25: pairs.length<10 cap DELETED (all provenance pairs checked); BFS ≤64 kept
  4.4  r22: profile contract → MathContract pre-conditions evaluated by checkContract
       (the D3 thin-adapter pattern) — verb-substring deleted
  GATE: adversarial silent fixtures still green; Batch-B-active fixtures produce
        triad-carrying, calib-anchored findings; no per-call DB opens in the adapter.

PHASE 5 — THE W17-PROTOCOL CONTAINER RE-RUN              [orchestrator]
  Same rig (fresh container, 8GB, plan-first, auth probe, Phase-E breaker, results
  artifact). NEW PASS TOKENS — doctrine predicates, not rule-id text:
    S1: brief SENT (Step-X ledger row exists for run) + verdicts parsed + doubling=0
    S2: each R18 finding cites a C1-C15 component id in evidence
    S3: brain-down → UNCLASSIFIED emitted, count unchanged, no fabricated verdicts
    S4: stage-selection unit proof inside the container (checkContract('post') does
        NOT evaluate preconditions)
    S5: epsilon boundary (|eval−oracle| = tol+1e-12 → FirewallError)
    S6: Batch-B silent without graph / active with graph, triads at emission
    S7: adversarial: PARAGON_V1 itself as the audit TARGET — a doctrine-conformant
        codebase scores ZERO R18-R21 findings (the golden zero)
  GATE: all S1-S7 PASS with artifacts; .trident/container-test-results.json written.

PHASE 6 — CANON + SHIP                                   [Context_Management, MASTER_CONTEXT]
  DEBUG_LOG: D-1..D-15 each closed with mechanism; this report + the corrected
  re-grounding spec; BUILD_REPORT closure; canon doc refresh (CURRENT_STATE,
  EVIDENCE_STATE, NEXT_STEPS); dist rebuild + SHA chain recorded.
```

### §6.3 WHY THIS ORDER

Phase 0 first because every later phase's value is unmeasurable while the adjudication is voided — a rebuilt substrate feeding a dead brief is still theater. Phase 1 before 2 because the layers consume the substrate's types. Phase 3 before 4 so Batch-B's re-grounding lands on the enforced triad law. Phase 5's S7 (audit PARAGON itself, expect the golden zero) is the ultimate conformance proof: the tool must recognize the reference implementation as fully LASME-wired — today it would flag PARAGON's own modules as LASME_INCOMPLETE (it scores names PARAGON doesn't couple the way r18 expects).

### §6.4 EFFORT MAP

| Phase | Files touched | New tests | Risk |
|---|---|---|---|
| 0 | index.ts (+ shadow/step-x seam) | 3 container scenarios | LOW — brain + brief already exist |
| 1 | math/* (5 files) + new firewall.ts | ~20 unit | MED — grammar rename touches R20's evalExpr refs |
| 2 | r18-r21 (4 files) + fixtures | ~16 | MED — new predicates need golden fixtures |
| 3 | r22-r25 + layer-engine.ts | ~6 | LOW |
| 4 | r23-r25 (3 files) | ~8 | LOW-MED |
| 5 | container rig | 7 scenarios | — |
| 6 | canon docs | — | — |

## §7 EVIDENCE APPENDIX (the commands that produced this report)

- Direct reads: math/expr.ts (31L), math/eval.ts (249L), math/contract.ts (96L), math/oracle.ts (33L), r18 (129L), r19 (66L), r20 (58L), r21 (59L), r22 (69L), r23 (176L), r24 (59L), r25 (71L), activation.ts, index.ts:240-370 + wiring greps, triad.ts head, layer-engine.ts evaluateAll, micro-loop-machine.ts head
- Tree maps: audit-engine = 140 files / 27,632 LOC; hunter = 17,523 LOC (report-writer 1166L top)
- Wave returns: mpse-doctrine-full-read (12,458L covered; 13 anchors verified: 8 CONFIRMED / 5 CORRECTED-drift; invented-name grep table all 0); lasme-doctrine-full-read (6 files; 30+ anchors verified; C1-C15 correction; createGate exact=0 / substring createGatedFSMService 02:3367); paragon-v1-full-read (56 src + 15 test files; module map; crosswalk; divergences: 24-vs-30 grammar, D9 non-strict foldAnd, bindings import carve-out)
- The decisive greps: `grep -n "void brief" index.ts` → :278; `grep -n "dedup" index.ts` → 0 hits; `grep dedup layer-engine.ts` → evaluateAll-only (pre-merge); wave greps: OracleRegistry/BrandedVerdict/EvalErr/EvidenceTriad/phase-machine = 0 in BOTH doctrine dirs; createGate = 0 exact

**END — the map is complete, every derailment anchored, the overhaul is phased with gates. Next action: Phase 0.**
