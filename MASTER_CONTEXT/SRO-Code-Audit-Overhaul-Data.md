# SRO-CODE-AUDIT-OVERHAUL-DATA — THE FULL CHAT RECORD (VERBATIM)

**File:** SRO-Code-Audit-Overhaul-Data.md
**Date:** 2026-08-25
**Source:** the live session in which the SRO Graphs article (`~/Downloads/SRO Graphs.pdf`, 10 pages, processed via omni-vision page conversion) was absorbed and the full overhaul response was delivered in chat
**Status:** DESIGN-AUTHORITY INPUT — the seven sections below are the verbatim chat response (byte-for-byte) defining the SRO-grounded code-audit overhaul: the LASME→MPSE→SRO progressive-depth intelligence ladder, the shadow backend architecture, the input pipeline, and the keep/wipe audit of the existing layers
**THE ONLY EDITS MADE TO THE VERBATIM TEXT (operator ruling, 2026-08-25):** every instance of the article's example model name (the long-context model the article used — "Kimi"/"K3") has been replaced with the appropriate role term ("the agent", "long-context models", "the 1M-token context window") so future sessions NEVER hardcode that model name into this project. That model was just the model used in the article — it is not this project's provider. This project's shadow backend is single-provider muse-spark-1.2-contributor on opencode-go (ruling Q1-b). The trailing session-mechanics note ("SRO processed. I'm on muse-spark…") was removed per the operator's instruction — it was an agent note, not content. NO other edits. No summarization. No truncation.
**What was absorbed from the PDF (the session's extraction summary):** All 10 pages — 8-layer architecture, 5 prompts (extraction → resolution → query translation → grounded answer → maintenance), 3 integration modes, the Synergized mode (Mode 3), 5 retrieval methods, and the 6 troubleshooting gates. The detail that matters for everything below: **the loop closes at step 8 (Update) and starts again at step 2 (Extraction) — each pass makes both the graph and the model's next answer better.**

---

## SECTION 1 — "WE SCAN FOR STRUCTURAL SHAPES AND ADJUDICATE AGAINST THE ACTUAL SPECS" — WHAT THAT ACTUALLY MEANS

That one sentence IS the SRO graph extraction applied to a codebase.

In the SRO article the pipeline is: Ingestion (raw documents) → **Extraction** (pull entities + relationships as typed triples with evidence) → Resolution (are two names the same thing?) → Storage (typed graph) → Retrieval (path/temporal/community queries) → Agent (generate Cypher, walk the graph).

In the code audit tool the pipeline is:

**Ingestion** = the codebase (`src/`) + the specs array (the current generation of specs, the only truth of what SHOULD be).

**Extraction** = the LASME layers' mechanical candidate generation — Order-2 AST detectors pull *structural shapes* as typed triples:

```
StockPortfolio.vue  →  hasShape  →  ThresholdHelper_5_10_15_25_50_100
ThresholdHelper     →  matcher   →  bareThresholds (5 bare > 0.5 comparisons, no constant)
ThresholdHelper     →  evidence  →  every_sell_does_has_ticker_insert_is_plain_text
ThresholdHelper     →  violates  →  DOC_FLOORS
```

That's a knowledge-graph triple. Not "this file looks like it has magic numbers." A typed fact: *this specific structural shape at this file:line, typed as a threshold helper, with its evidence chain.* The same for `setup() → createsMachine → createActor().start()` (a machine-chain triple), or `class IntentEngine → hasMethod → ts.createProgram + hasField → evidenceWrite` (an engine triple).

**Resolution** = the shadow agent reading the specs and asking: does the *spec* declare this file SHOULD be a ThresholdHelper with calib: constants? Is `ThresholdHelper` in the specs the same entity as `TVDThresholds` in the code — or are they distinct? Do two adapters named `cme-adapter` and `CMEAdapter` refer to the same adapter? This is Prompt 2's job.

**Storage** = the triples land in a typed code-knowledge graph — nodes (functions, classes, machines, contracts, files, spec clauses) typed + edges (calls, imports, triggers, implements, violates). Not a bag of similarity-embedded chunks.

**Retrieval** = the audit no longer asks "what text looks like 'LASME'?" (the old R18's keyword scan). It asks "walk me the chain from this module's spec-declared contract to where that contract is actually enforced, and show me every link" — path search. And globally: "what are the recurring derailment shapes across this entire codebase?" — community search.

**The three moves in every LASME finding:**

1. **SCAN FOR STRUCTURAL SHAPES** — the AST detector emits the typed triple (what shape, where, with what evidence). This is how we handle "where these architectures DO exist but are coded WRONG" — a `PercentageCalculator` that internally branches `if (n === 40)` on a bare literal is a *shape* the detector recognizes even though the class itself was never declared as a ThresholdHelper. We don't need the code to claim the architecture. We see the shape anyway.

2. **ADJUDICATE AGAINST THE ACTUAL SPECS** — the shadow agent reads the full text of the current specs and compares: does this file's shape match what the specs declared it SHOULD be? Is it the right shape but in the wrong layer? Is the shape absent where the specs mandate it? This is how we handle "what SHOULD be coded with these architectures and IS NOT" — a module whose spec says "sl% → 9-tier legal position names (the sentinel)" but whose code has no gate chain = a missing-shape finding.

3. **TRIBLET GATE** — no {Pattern, State, Evidence} = no finding. Every finding is a typed edge in the code graph that survived graph verification.

That's the sentence. The SRO graph is how the derailment-hunter's graph construction should have worked this whole time, and how the graph-activated layers should work now.

---

## SECTION 2 — B.4 THE MPSE LAYER — REWRITTEN AND FLESHED OUT

The previous B.4 said "two roles" in 10 lines. Here is what it actually is. MPSE is the layer where numeric truth lives — and the progressive depth says: LASME asks *"does the architecture's shape exist and is it the right shape?"* — MPSE asks *"is every number, threshold, and contract in the codebase the number the specs actually declared, or is it a hallway number someone guessed?"* LASME cannot be bullshitted as easily as legacy regex layers because shapes are harder to fake than keywords. **MPSE cannot be bullshitted as easily as LASME because numbers are harder to fake than shapes** — you either wired the exact spec constant or you didn't, and the graph proves it.

**B.4.1 ROLE 1 — THE SUBSTRATE (the math the audit tool itself runs on).**

The five LASME layers, the hunter, and the graph all consume the same rebuilt substrate (`math/`: the 30-kind `MathExpr`, `MathContract`, `checkContract`, the brand gate — doctrine-30 grammar × PARAGON runtime shape, per Phase D). Without the substrate the code audit tool cannot reason about numeric truth at all — it can detect a bare `0.40` textually but cannot say *"this threshold's correct value is 0.38 per the spec's binding table, routed through evalExpr with epsilon, and the code is contradicting the oracle."* The substrate is what makes R-MPSE mechanically different from R20's regex scan for `> 0.40`: R20 saw a number; R-MPSE evaluates `|evaluated − oracle| ≤ tolerance` against the spec's declared binding and returns a BrandedVerdict.

**B.4.2 ROLE 2 — THE LAYER (R-MPSE) — the only layer whose ground truth for correctness is fully the specs' numbers, not code shape.**

Two sides, like every LASME layer, but the detector is the contract evaluator, not the AST-shape matcher alone:

| R-MPSE Side 1 — SHOULD be contractual, ISN'T | R-MPSE Side 2 — IS contractual-shaped, but WRONG |
|---|---|
| Thresholds/sl-pips/RRR bands/score floors/rate-limit constants the specs declare as `let sl = [5,5,5,2.5,0]` or `Rule 9: sl% → legal names` but the code carries as bare literals: `if (n === 40)`, `threshold = 0.83`, `limit = "200"` with no NamedConstant or `MathContract.precondition` routed through `evalExpr`/`oracle`. SHADOW infer: the specs declare the value, the code invents its own — the numbers diverged and no one noticed. | Contracts present but: `checkContract` not respecting stages (evaluates pre+post+inv on every call — D-3), oracle present but NO epsilon/tolerance (exact `===` — D-4), a MathExpr defined but its `evalExpr` path is never invoked (the contract is a declaration, not a gate), a threshold routed through a constant whose name collides but whose value drifted from the spec's binding. |

**How R-MPSE adjudicates — the contract triple:**

Every numeric decision in the codebase that the specs declare should be: the mechanical detector extracts

```
Subject: this comparison site (file:line)   →   Relation: shouldBeBound   →   Object: the spec's MathContract{id, pre=[MathExpr for the bound], tolerance}
Subject: this constant value                →   Relation: contradicts     →   Object: spec binding value
```

The shadow agent reads the spec, reads the binding, evaluates `evalExpr` against `oracle ± tolerance`, and returns: `TRUE_DEFECT` with the exact spec clause + the divergence (`spec says sl[3]=2.5, code says sl[3]=5`), or `RED_HERRING` (the literal is structural, not enforcement-domain — an array length `> 0` guard).

**Why MPSE can't be bullshitted as easily as LASME:** LASME shapes can be cosmetically satisfied (a class named `ThresholdStrategyEngine` with one `ts.createProgram` inside a trivial factory — the shape briefly matches). MPSE thresholds cannot — the spec says the value is `0.38 ± 0`; the code says `0.40`. A model can hallucinate a class name; it cannot hallucinate past `|0.40 − 0.38| = 0.02 > 0` without flagging.

**Where R-MPSE lives in the pipeline:** it reads the same `codebase + specs` input as the five LASME layers, but its candidate extraction runs the AST's literal-comparison scan *parameterized* by the substrate: `fileImportsMathOrContracts` is replaced by "`fileContainsEnforcementDomainLiteral` AND `specDeclaresBindingForThisDomain`" — the specs decide whether a literal is enforcement-domain at all.

---

## SECTION 3 — B.5 THE GRAPH + BUG-HUNTER/DERAILMENT-HUNTER LAYERS — REWRITTEN WITH THE SRO KNOWLEDGE

The previous B.5 was a 22-line sketch of "R-GRAPH, R-DH-FEED, R-PROVENANCE." That's slop. Here is the real section — the progressive intelligence ladder and the SRO graph that makes it compound.

### B.5.1 THE PROGRESSIVE DEPTH — WHY EACH FAMILY IS HARDER TO BULLSHIT THAN THE LAST

```
LEGACY LAYERS (R0–R17)      What it audits:     keywords + regex + file shape           ← EASY TO BULLSHIT
    │   The model can rename a       Hide 0.40 as threshold  →  looks clean              | (rename the word)
    │   variable, hit the threshold,                                                |   No structure checked
    │   and the regex moves on.                                                     |   No number checked
    │                                                                               |   No chain checked
    ▼                                                                               |
LASME (5 COMPONENT LAYERS)  What it audits:     STRUCTURAL SHAPES vs. the specs     ← HARD TO BULLSHIT
    │   "We scan for structural   A file that DOES have an actor   | Shape checked
    │    shapes and adjudicate     shape is forced to have the     | against specs
    │    against the actual       three-call adapter, the         |
    │    specs." Every finding    plain-class engine, the         | Must invent the
    │    is a typed triple:       start()+subscribe() pair.       | shape, not just
    │    subject → relation →     A file that SHOULD be an       | the name — and
    │    object with evidence.    adapter and isn't: the shadow  | the shadow reads
    │                             reads the specs and calls it.  | the specs to
    │                                                          |   adjudicate
    ▼                                                            |
MPSE (1 LAYER)              What it audits:     NUMERIC/CONTRACTUAL TRUTH           ← HARDER
    │   The specs declare     Threshold 0.40 that "looked          | Every value
    │   exact numbers. R-MPSE plausible" fails |evaluated−oracle|→ | checked
    │   evaluates them.       tolerance. A hallway constant     | against the
    │   |code − spec| ≤ tol  CAN be litigated;                 | spec's binding
    │   or it's a defect.     |0.40−0.38|=0.02 > 0 cannot.     | with a bound
    │                                                          |
    ▼                                                            |
SRO GRAPH (the hunter +       What it audits:     CHAINED INTELLIGENCE — the       ← CANNOT BE
      the graph tiers)        graph of every triple,              BULLSHITTED
                              its resolution, its retrieval
                              paths, its maintenance history.
                              Each audit pass writes back into
                              the graph. The NEXT pass sees
                              the prior graph. Intelligence
                              COMPOUNDS — step 8 loops to step 2.
```

The operator said it plainly: **each layer is naturally harder to bullshit than the last. LASME cannot be bullshitted as easily as legacy layers. MPSE cannot be bullshitted as easily as LASME. SRO cannot be bullshitted at all.** The table explains *why*: the evidence class gets sharper (keyword → shape → number → chain), the adjudication source gets stricter (the regex → the specs as read by the shadow agent → the spec bindings evaluated with tolerance → the full typed graph), and the history gets longer (no memory → last-N spec chain → full graph with timestamps).

### B.5.2 THE SRO GRAPH — HOW THE KNOWLEDGE GRAPH IS ACTUALLY CONSTRUCTED

The derailment-hunter's prior graph was: parse `shared.db` nodes/edges as a flat call graph, one adapter interface over it, BFS-k hops. No typing discipline, no resolution, no verification, no maintenance cycle — a dump of sqlite rows perched behind a facade. The SRO overhaul replaces that with the article's 8-layer construction, mechanically.

**L2 — EXTRACTION (typed triples, with evidence — Prompt 1).**

For every file in the codebase + the specs array, the extraction pass emits typed triples exactly like Prompt 1's JSON:

```json
{
  "entity": "IntentComputeHealth",
  "entity_type": "Engine",
  "relations": [{
    "predicate": "invokes",
    "object": "ts.createProgram",
    "evidence": "this.program = buildTsProgram(this.basePath)",
    "confidence": 0.98
  }]
}
```

Node typing discipline (the LASME ontology becomes the graph's ontology — not ad-hoc labels):

- Node types: `File`, `Class`, `Function`, `Interface`, `Module`, `Machine`, `Actor`, `Engine`, `Adapter`, `Container`, `Lexicon`, `Contract`, `Threshold`, `Gate`, `EvidenceFile`, `SpecClause`.
- Edge predicates are a **closed vocabulary** per layer — LASME predicates (`declares`, `implements`, `triggers`, `violates`, `shouldBe`, `wraps`), MPSE predicates (`evaluates_to`, `contradicts_oracle`, `grounded_through`, `unguarded_threshold`), SRO predicates (`caused`, `derived_from`, `resolved_to`, `superseded_by`, `flagged_by`).

The critical constraint from the troubleshooting section: **the evidence field is NOT optional.** Require an exact quote for every relationship. If the model can't produce one, the relationship doesn't go in. This single constraint eliminates most extraction hallucination.

**L3 — RESOLUTION (the layer everyone skips — Prompt 2).**

Are `"intent-compute-health," "IntentComputeHealth," "intentComputeHealth,"` and `intentComputeHealth.ts` the same engine? Are `"OracleRegistry" in math/oracle.ts` and `"OracleRegistry" in the hunter graph` the same contract? Are `ThresholdHelper:40` and `TVDThresholds:38` the same threshold helper whose spec value the code diverged from?

Skip this layer and every query returns partial results — the graph fragments into duplicates. **Run Prompt 2 as a batch job over new entities BEFORE insertion, not after.** Retrofitting entity resolution onto a polluted graph is significantly harder than doing it upfront. Don't skip.

(Sideband that makes it free: a 1M-token context window is the same reason the article singles out long-context models for graph engineering. The entire relevant subgraph fits in one session instead of a summary. The whole evidence chain walks intact; nothing is cut to fit. Same reason this audit tool wants its shadow agent to fully read all current specs, not a summary of them.)

**L4 — STORAGE + L5 — RETRIEVAL (5 methods, not one).**

Not a vector database that returns "what text looks like similar." The graph stores *"this specific event/class/edge caused that specific outcome."* And retrieval is five methods *in concert*:

- **Vector search** (fuzzy: "find the module that feels like a warhead") — still useful as a cheap first pass.
- **Entity lookup** (exact: `GET node:IntentComputeHealth`).
- **Path search** (the workhorse: `MATCH path: (threshold)-[violates]->(DocFloors) → walk every hop between the spec clause and the violating site; return every link`) — *this is the "what SHOULD be coded and IS NOT" query.*
- **Community search** (patterns across the whole graph: "what are the recurring incomplete-engine shapes across this entire codebase?" — a single global scan the legacy layers could never do).
- **Temporal filtering** ("was this threshold compliant at commit fc01a874, and when did it drift?").

The current hunter's graph offered one mode: `chain(symbol, 64 hops)`. That's the path-search primitive — one fifth of retrieval, hardcoded to a depth bound, with node typing absent.

**L6 — AGENT (the real use of the model on the graph).**

The agent plans the approach, generates Cypher queries, reads the returned subgraph, runs additional searches when it hits a gap, and decides what to do next. This replaces the old R23 pattern of `TEMPLATE_LIBRARY[tid].check({graph: adapter})` — a hardcoded per-family template check — with the agent-orchestrated loop: translate the question into Cypher (Prompt 3's job — schema-locked, valid Cypher, path queries preferred when the question implies causation), run the query, read the subgraph, and if the subgraph has a gap (`TRACE_GAP: no path threshold-helper → DOC_FLOORS`) generate the next Cypher to close it. The hunter's `MicroLoopMachine` (`IDLE→RECON→MAP→SCAN→TRACE→STRIKE→REPORT`) stays as the host; the L6 agent replaces its internals where the `TEMPLATE_LIBRARY` sat.

**L7 — VERIFICATION (Prompt 4's job: cite the path).**

> *Checks that conclusions are actually supported by retrieved paths, flags contradictions, evaluates confidence, verifies sources. Without this layer you've built a very sophisticated hallucination machine.*

Every audit finding's answer must — for every claim — cite the specific nodes and the relationship path that supports it, state confidence, and flag where it inferred rather than read. Rules: don't infer causation from adjacency (`mentioned_alongside` ≠ `caused_by`), don't use knowledge outside the provided paths, and when the graph doesn't contain enough to answer say *exactly* what's missing. In the audit tool's terms: every finding's `evidence` is an evaluated graph path, not a bag-of-tokens similarity hit. The verification layer is also what kills the article's warning that *"the model connected two nodes that are adjacent but not causally related and presented it as a finding"* — which is the exact failure mode of adjacency-scanning R22.

**L8 — UPDATE (Prompt 5's job — where the loop closes and the intelligence compounds).**

> *New facts go into the graph, contradictions get flagged rather than silently overwritten, superseded facts get timestamped instead of deleted.*

Every new audit run does NOT wipe the prior graph. Each new fact is classified against the current subgraph as: **new** (add it), **duplicate** (skip), **contradiction** (flag for review — both versions + evidence preserved, never silently overwritten), **update** (timestamp the old, not delete it), or **uncertain** (human review). This is how the system *"gets measurably smarter every time it answers one — because each answer adds structure that the next answer can use."* In the audit tool that means: run 2 sees run 1's graph, the prior warhead bindings, the prior false-positive resolutions, and the timestamped superseded contracts — it doesn't re-extract the same mistakes.

**The loop:** Update → back to Extraction. The graph grows. The next audit hydrates the graph as session chain (the shadow backend's L7). Each pass sees more of the truth than the last.

### B.5.3 THE FIVE PROMPTS — CONCRETELY FOR THE CODE-AUDIT TOOL

Every prompt below is the article's Prompt N verbatim in structure, re-typed for the code domain. A direct adaptation — not a reinterpretation.

**Prompt 1 — Extraction** (edge: code + specs → triples).

```
Extract all classes, functions, contracts, thresholds, machines, engines,
adapters, gates, evidence files, and spec clauses from the source below.

For each entity return:
  - canonical_name
  - type (Engine|Adapter|Machine|Contract|Threshold|Gate|File|...)
  - description
  - source_location (file:line)

For each relationship return:
  - source_entity
  - relation_type (invokes|calls|triggers|implements|violates|declaredBy|...)
  - target_entity
  - evidence (exact quote — the line or the spec clause verbatim)
  - confidence_score (0-1)

Rules:
  - Only extract relationships explicitly stated or directly implied by the text
  - Do not infer relationships from general knowledge
  - If a relationship is uncertain, lower the confidence rather than omitting it
  - Return valid JSON only
```

**Prompt 2 — Entity Resolution.**

```
Compare the following entities and determine whether they refer to:
  - the same entity        (same code element seen in two places)
  - related but distinct   (e.g., the spec's "ThresholdHelper" vs the
    code's "TVDThresholds" — related, not identical)
  - unrelated

For each pair return verdict (same/related/unrelated), canonical_name if same,
reasoning, and confidence.  Similar names are NOT sufficient evidence.
When uncertain mark as "related" rather than "same".
Flag any case where merging would be destructive.
```

**Prompt 3 — Query Translation** (edge: audit question → Cypher).

```
Translate the user question into a Cypher query for our graph.
Schema:
  Node labels: File, Class, Function, Machine, Adapter, Engine,
               Threshold, Contract, Gate, EvidenceFile, SpecClause
  Relationship types: implements, invokes, triggers, violates,
                      declaredBy, shouldBe, derived_from, contradicts

Rules:
  - Use only labels/relationship types present in the schema
  - Prefer path queries over single-node lookups when implication is causal
  - Return the query, then a plain-English explanation of what it retrieves
```

**Prompt 4 — Grounded Answer** (edge: retrieved paths → finding).

```
Answer using ONLY the graph paths provided below.

For every claim:
  - cite the specific nodes and relationship path that support it
  - state your confidence
  - flag any step where you're inferring rather than reading

Rules:
  - Do not use knowledge outside the provided paths
  - Do not infer causation from co-occurrence
  - If the graph doesn't contain enough to answer, say exactly what's missing
```

**Prompt 5 — Graph Maintenance** (edge: this audit's new triples → the stored graph).

```
Compare these new facts against the existing graph.
Classify each new fact as: new / duplicate / contradiction / update / uncertain.
For contradictions: show both versions and the evidence for each.
Never silently overwrite an existing fact.
For updates: timestamp the old one, don't delete it.
```

### B.5.4 HOW B.5 LIVES INSIDE THE CODE AUDIT TOOL

```
                       THE TARGET CODEBASE + THE SPECS ARRAY
                                   │
            ┌──────────────────────┴──────────────────────┐
            │          SRO L1 — INGESTION                   │
            │   read every file in codebase + every spec   │
            └──────────┬───────────────────┬──────────────┘
                       ▼                   ▼
         ┌────────────────────┐  ┌───────────────────────────┐
         │  LASME LAYERS      │  │  MPSE LAYER               │
         │  (R-LEXICON/       │  │  (R-MPSE)                 │
         │   R-ACTOR/         │  │  thresholds/contracts     │
         │   R-SM/R-ENGINE/   │  │  evaluated as triples:    │
         │   R-ADAPTER)       │  │  threshold violates  DOC_ │
         │  emit structural   │  │  FLOORS, contradicts spec│
         │  triples w/        │  │  binding 0.43 → 0.40      │
         │  evidence quotes   │  └───────────┬───────────────┘
         └──────────┬─────────┘              │
          structural shapes      numeric/contract triples
                   │            (oracle±tolerance checked)
                   └──────┬─────┘
                          ▼
              ┌───────────────────────────┐
              │  SRO L2 — EXTRACTION       │
              │  one extraction prompt per │
              │  file; the 1M window holds │
              │  the full engine/adapter/  │
              │  machine subgraph          │
              └──────────┬────────────────┘
                          ▼
              ┌───────────────────────────┐
              │  SRO L3 — RESOLUTION       │
              │  batch Prompt 2 BEFORE     │
              │  insertion; canonicalize   │
              │  Engine/IntentComputeHealth│
              │  vs IntentComputeHealth.ts │
              │  vs hunter/graph alias     │
              └──────────┬────────────────┘
                          ▼
              ┌───────────────────────────┐
              │  SRO L4 — STORAGE          │
              │  Neo4j / PostgreSQL graph  │
              │  extension; full evidence  │
              │  for every edge; typed     │
              │  schema (closed vocab)     │
              └──────────┬────────────────┘
                          ▼
              ┌───────────────────────────┐
              │  SRO L5 — RETRIEVAL        │
              │  five methods in concert:  │
              │  vector · entity · path ·  │
              │  community · temporal      │
              │  path-search is the new   │
              │  "what SHOULD be and isn't"│
              └──────────┬────────────────┘
                          ▼
              ┌───────────────────────────┐
              │  SRO L6 — AGENT            │
              │  the shadow audit agent    │
              │  (forked from              │
              │   shadow_agent_backend:    │
              │   PI SDK kept; §B.6)      │
              │  translates audit question │
              │  → Cypher → reads subgraph │
              │  → closes gaps iteratively │
              └──────────┬────────────────┘
                          ▼
              ┌───────────────────────────┐
              │  SRO L7 — VERIFICATION     │
              │  every finding cites the   │
              │  path; confidence flagged; │
              │  inferences marked; gaps  │
              │  named exactly             │
              └──────────┬────────────────┘
                          ▼
              ┌───────────────────────────┐
              │  SRO L8 — UPDATE           │
              │  new/duplicate/contra/     │
              │  update/uncertain; flagged │
              │  contradictions; stamped  │
              │  superseded (never deleted)│
              │  ── THE LOOP CLOSES ──    │
              │  Update → Extraction.      │
              │  Each audit sees the prior │
              │  graph as session chain.   │
              └───────────────────────────┘
```

**What changes for the graph-activated shadow layers (the old Batch B):** the hunter's flat sqlite `shared.db` (nodes + edges dumped per run to `.trident/knowledge-graph/`) stays as the **persistence backend** for the graph — it's already WAL'd and hoisted to one `runId`. On top of it:

- The extraction that landed it there is re-typed with the closed vocab (LASME predicates become the edge predicates, not the raw hunter wiring types `calls/imports/awaits/unwired` alone).
- New are resolution + five-method retrieval + the shadow-to-Cypher translation + verification + the update classifier (new/duplicate/contradiction/update/uncertain) with timestamped superseded.

---

## SECTION 4 — THE SHADOW BACKEND HERE — THE REAL ARCHITECTURE

The boilerplate's selling line — *"a headless LLM agent harness that takes a pre-built file on disk, hands it to a real agent with two tools (read + batch edit), lets the model polish across 2–3 rounds"* — is the wrong function for this tool. **We keep the harness; we rewrite everything that flows through it.**

### 4.1 WHAT WE KEEP VERBATIM (the seven kept systems — DO NOT REINVENT)

The seven subsystems you pin with `ln -s /vendor/pi`:

1. `chainedStream` (every LLM call: retry×5 @2.5s → next rung; 429 shared-exile 45s; stall guard 60s; degenerate-completion self-heal);
2. `RpmLedger` (per-provider token bucket + shared TTL exile — `ledger.admission(rung)` zero requests burned if the sibling just got 429'd);
3. the 5-key pool `ZEN_KEYS_POOL` round-robin rotation before any fallback;
4. per-provider reasoning-effort in each API's native shape;
5. event-aware stall guard (no blind timeouts);
6. Done-verifier + `validateFinalText` (degenerate completions routed to the next provider);
7. the batch-first round contract (parallel tool execution, force-bound edit).

The `Batch-first` invariant carries directly: round 1 is parallel file reads over the specs + codebase, round 2 is the verdict write, round 3 (optional) is the repair/verification pass — same 1.8× bound-vs-sequential shape.

### 4.2 WHAT WE REWRITE (everything that makes this a code-audit shadow)

**`wire-into-tool.md`'s "YOUR BACKEND / THE SHADOW AGENT (one class)" table becomes:**

```
YOUR BACKEND (the audit tool's pipeline)        THE CODE-AUDIT SHADOW AGENT (one class)
──────────────────────────────                   ──────────────────────────────────────────
pre-read the specs + codebase files  ────────▶   demand: the brief + the full spec text
into a demand (the ingest: §1)                  + the LASME+MPSE candidates + the
                                                SRO subgraph's relevant neighborhood
                                                (a bounded path query, NOT the whole
                                                graph — the 1M window carries the
                                                subgraph, the rest stays on disk).

build the demand's brief ───────────────────▶   SHARED LEDGER (one per audit run)
write it to the agent's prompt file             injected as codeAuditLedger: ledger =
                                                new RpmLedger('audit-'+runId) — Q1(a).

call new ShadowAgent(cwd, {                     Agent construction:
  ledger: codeAuditLedger                       model = the single muse-spark alias
})                                              (no multi-rung chain — Q1 locked b),
                                                tools = the AUDIT TOOLS (below),
                                                rounds = 3 (1: read+adjudicate,
                                                2: write verdicts, 3: verify,
                                                MAX_ROUNDS=3 unchanged).

  .run({promptFilePath,                         R1: LLM call → reads candidates +
     systemPrompt, demand})                       reads every spec in full
                                                (the scoped read_file on the
                                                specs + codebase files).
                                                R2: verify → writes the VERDICTS
                                                FILE (one batched write: the JSON
                                                verdicts + [THINKING] extraction
                                                + fence/scratchpad strip).
                                                R3: optional (scoped verify that
                                                every TRUE_DEFECT cites a
                                                spec clause + a file:line).

await run()  ◀────────────────────────────────── providers: single — see Q1(b):
                                                muse-spark@opencode-go only.
                                                A pre-flight live probe at tool-
                                                start pings the provider
                                                immediately — fail NOW with a
                                                clear API-unreachable error,
                                                zero minutes wasted (Q1(a) covers).

read the verdicts file back                     verdicts.json: Array<{findingIndex,
                                                adjudication: TRUE_DEFECT|
                                                RED_HERRING|UNCLEAR,
                                                file, line,
                                                specClauseCited,
                                                evidencePath,
                                                confidence}>  Validated by the
                                                SRO L7 verifier before it
                                                enters the batch (Prompt 4).

parse verdicts → findingsFromVerdicts()         Verified output → typed findings
                                                with triads. The unverified
                                                output NEVER enters the ledger.
```

**The tool surface the code-audit agent gets (the SCOPED tools bound into `makeForceBoundBatchTools`)** — differs entirely from the boilerplate's `read + batch edit` (a polish harness):

- `read_file(file, excerpt)` — READ-ONLY, capped 8000c/chunk; the agent reads the full specs and any codebase file it wants. The specs are Pre-read into the brief AND re-readable — the 1M window carries the subgraph, the capped read carries the depth.
- `grep(pattern, glob)` — over the codebase + the specs array (find the spec clause that declares `ThresholdHelper`, locate the threshold helper in `StockPortfolio.vue` by its structural shape).
- `stat(path)` — probe a file's existence/age without reading it (is the spec file stale? Does the evidence file exist?).

**No edit tool.** The code-audit shadow NEVER edits files — it adjudicates. The edit tool is stripped (replaced by the read/grep/stat triple). The `batch` law stays but with reads: round-1's N spec+code reads go in one parallel batch.

**The execution pipeline's one-place composition** (the shadow-runner's 13 steps, adapted):

```
Input: the audit-spec.json (validated in-turn via the tool.after hook)
  ├─ 1. Tether (the 3-tier sessionKey — audit-<timestamp>)
  ├─ 2. Sidecar + 3. Memory (the session chain: prior audits hydrate Prompt 4's prior subgraph)
  ├─ 4. REATTACH (wrong sessionKey → ERROR manifest; fresh-or-empty → fresh)
  ├─ 5. The pre-read (the specs + the mechanical candidates + a bounded SRO
  │       subgraph neighborhood pre-read, 8000c/file — the Agent still does the
  │       deep reads; the pre-read gives the agent a head start)
  ├─ 6. demand = buildAuditDemand(brief, chain, ingestText(specs+code))
  ├─ 7. ShadowAgent.run({ promptFilePath }) — the PI loop (rounds 1-3) with the
  │       AUDIT tools (read/grep/stat, NOT edit)
  ├─ 8. Silent verify (structure: every TRUE_DEFECT cites a spec clause +
  │       a file:line; verbatim: the spec quote word-for-word; freshness:
  │       the staged finding's evidence against the delta since read)
  └─ 9. Append the run to the audit memory (the graph's next session chain)
       + the run's verdicts into the SRO ledger — Update → Extraction (the loop).
```

**The graph closure:** the audit memory IS the SRO graph's L7 chain. Each audit's verdicts land as L8 write-back: new/duplicate/contradiction/update/uncertain classification vs the existing subgraph, timestamped superseded never deleted. The next audit's L2 extraction sees the prior graph.

---

## SECTION 5 — WHAT "FINDINGS / TRIAD / BATCH B" MEAN IN THIS NEW SHAPE

Three sentences the earlier plan left opaque. Here they are — no slop.

**FINDINGS.**

A finding is a typed SRO triple that survived the L7 verifier. It hot-wires a single sentence: *"At file:line, these specific shapes violate this specific spec clause, flagged by this detector pattern, evidenced by this code quote."* In memory and on the graph's edge: `StockPortfolio.vue:42 — ThresholdHelper — violates DOC_FLOORS 5-tier calib (spec clause 3.2, line 118) — the bare sequence 5_10_15_25_50_100 with no star-calibrated constant.*`

Legacy R0–R17 findings were regex text hits with a severity. LASME/MPSE findings are graph edges — the same shape that was extracted (L2) and resolved (L3), now flagged by a detector pattern and typed against a spec. That's why the article's warning — *bigger model + bad graph → worse results* — was our search's ceiling: the RAG leg ("what text looks like `LASME`?") can't return the chain `StockPortfolio.vue → ThresholdHelper (shape) → violates → DOC_FLOORS (spec clause)` even though that is exactly what the audit needed.

**TRIAD AT EMISSION (D-9's fix).**

Every finding carries the three-legged record *when it is created* — not added after the fact:

- **Pattern** (which detector fired: `PatternFamilyMember id/kind/matcher/triggerCondition/severity`) — the LASME detector that typed the shape.
- **State** (where the finding was in its lifecycle: `from → to`) — the state-machine transition that classified it.
- **Evidence** (where the code is: `file:line + the exact quote`).

`LayerEngine.evaluateAll`'s old `if (!f.triad) f.triad = { machineId:'layer-engine', ANALYZE→CLASSIFY }` was a post-hoc synthesizer — the layer never owned its finding's evidence. The new shape: each of the five LASME layers + MPSE + the graph-activated layers **synthesize their own triad at the `findingsFromVerdicts()` call** (the layer's `machineId = r-lexicon|r-actor|r-state-machine|r-engine|r-adapter|r-mpse|r-graph`). The L7 verifier (Prompt 4) checks that every finding coming off the shadow path carries a spec clause cite + a file:line + a path — the un-tripled is never a finding.

**BATCH B (the graph-activated second brief — what "second brief → same shadow pass → triads" means).**

Batch A (the five LASME + MPSE layers) runs graph-*agnostic*: it asks *"does the code's typed shapes, read alone, match what the specs declare?"* It needs only the codebase and the specs.

Batch B (graph-activated) runs **only when an SRO graph is present** — it asks the questions whose evidence *IS the graph*:

- **R-GRAPH** (wiring conformance): *"Is this adapter actually wired to that machine?"* — a path query across the graph's edges. `MATCH path: (adapter:Adapter)-[implements]->(machine:Machine) WHERE adapter.file =~ ...` — no graph, no question. On the flat-file leg: the old `whoCalls/symbol=64` text scan missed cross-file rewrites; on the graph it walks the live `imports→calls→tracesTo` edges and returns every hop.
- **R-DH-FEED + R-PROVENANCE**: *"Does this bug-hunter finding, already in the graph, map to a still-true LASME/MPSE predicate, or is it stale (the file it cited no longer exists), or is the contract fix proven (the wire the finding named has since landed)?"* The shadow agent reads the hunter's report — not as the truth, but as the first graph-derived candidate — and re-adjudicates with the current code + specs.

**The "second brief → same shadow pass" mechanics:**

```
Batch A brief ──the specs + the 6 mechanical candidate blocks──
   + the Batch A subgraph neighborhood + the prior audit's L7 chain
   ──▶ one ShadowAgent run (rounds 1-3) ──▶ verdicts-A file ──▶ findings-A with triads

                          (IF the SRO graph exists)
Batch B brief ──the specs + the 3 graph-layer candidate blocks
   (R-GRAPH path misses, R-DH-FEED clusters, R-PROVENANCE trace gaps)
   + the Batch B subgraph neighborhood (wires, spec→implementation traces)
   ──▶ one MORE ShadowAgent run (rounds 1-3) ──▶ verdicts-B file ──▶ findings-B with triads

Batch B reuses the same backend (same harness: the seven kept subsystems) — not "another backend."
A second brief, same shadow pass (the shadow pipeline instantiated twice with different candidates
+ different subgraph; the graph + memory hydrate the second pass with what the first already learned).
```

The operator said *"these are 2 sequential batches. first happens graph agnostic, shadow enhanced, 2nd happens w/ full findings report + graph context. also shadow enhanced."* That's what this is. Batch B is structurally the *reader* of Batch A's plus the graph's plus the hunter's truth — it audits the audit with graph precision.

---

## SECTION 6 — EXISTING LAYERS: THE FULL KEEP/WIPE AUDIT (the warheads question)

Three piles: **KEEP (build on top)**, **WIPE (delete outright)**, **WIPE BUT KEEP THE IDEA**. Your warhead-layer hunch was right — the one in that third pile.

### 6.1 KEEP (the clean legacy foundation — everything except R18–R25)

| Layer | What it actually does (file:line, not a slogan) | Verdict + why it survives |
|---|---|---|
| R0 build chain (420L) | `single-file bundle suitable for container deployment` checksum | **KEEP** — deployment hygiene, zero overlap |
| R1 hook contract (273L) | handler has zero params — cannot access input/output objects | **KEEP** — the agent-guard many projects ship without |
| R2 state machine (223L) | missing `advanceLayer` before COMPLETE via AST | **KEEP** — ours is silent when the derive rule fires; don't duplicate, keep |
| R3 async correctness (281L) | async callee without await, caller continuation bug | **KEEP** — machine/adapter "conductor" logic lives here |
| R4 error handling (224L) | empty catch, theatrical success signals | **KEEP** — contracts' REJECT/THROW ladder territory |
| R6 dependency integrity (343L) | ESM/CJS conflicts, missing deps | **KEEP** — graph construction depends on clean imports |
| R7 config schema (338L) | opencode.json + config-access safety | **KEEP** — adjacent to the audit tool's own wiring |
| R8 source hygiene (308L) | unresolved `${marker}` left in comments | **KEEP** — noise gate |
| R10 invocation integrity (444L) | enforcement function never called — dead protection | **KEEP** — machine/engine wiring ally |
| R12 cross-plugin isolation (349L) | missing agent guards, identity checks | **KEEP** — Trident isolation law (never stripped) |
| R13 data flow (991L) | `any→specific`, unvalidated→sensitive AST paths | **KEEP** — the deepest legacy layer; useful for deep passes |
| R14 CFG (412L) | dead handlers, unreachable transitions | **KEEP** — shape-detection ally |
| All the shared substrate: `triad.ts` (EvidenceTriad shape), `layer-engine.ts`, `audit-graph.ts`, the enforce/ ring — kept as the host the five LASME layers + MPSE graft onto | | |

### 6.2 WIPE (the slop — delete the source files + remove from the registry; the lessons stay in the DEBUG_LOG, not in the code)

*These four layers are the half-wired R18–R25 set you named slop. They powered yesterday's LASME mandate. They don't power the new shape — they obscure it. Delete the source files; de-register from `layer-engine.ts`'s import/registration list. Keep one `DELETED_R18_R25.md` pointer doc explaining the lineage + the original audit log so the paper trail never loses the D-1..D-15 fixes.*

| Legacy layer | Why it wipes vs the new layers | The work saved anyway |
|---|---|---|
| R18 component presence (129L) | Scored **keyword tokens** (`OracleRegistry, EvidenceTriad` by name substring) as "LASME signatures" — the opposite of *"scan for structural shapes."* The new R-LEXICON/R-STATE-MACHINE/R-ACTOR/R-ENGINE/R-ADAPTER each emit the *typed shape* triple the old R18 faked with `score<2`. Retaining R18 means we scan for the word "OracleRegistry" and the shape `Actor-has-no-createActorStart` in the same run — noise forever. | Delete the file. The shape-detection predicates are clean-slate superior. |
| R19 claims without machinery (66L) | `/Engine\|Registry\|Gate\|.../ suffix regex` as the sole detector — the ISE SIG-2 self-slop. Replaced by the typed-graph `unwired` query (R-GRAPH L5 over the code knowledge graph — `MATCH (export)-[kind:module] WHERE NOT (import)-[imports]->(export)`). The regex triggered on names; R-GRAPH triggers on *wiring edges* that actually landed in the graph's L4. | Delete. |
| R20 ungrounded thresholds (58L) | Bare thresholds checked via `WHITELIST={'0','1','-1','2'}` + `isBoundToNamedConst` heuristic (284L total, 58L in the harness). The new R-MPSE with the same harness now evaluates `\|evaluated−oracle\| ≤ tol` against the spec's binding table — exactitude vs a heuristic whose threshold `0` would still pass a hallway `0` that contradicts the spec's `0` at a different meaning. A heuristic flagged on name existence; the contract evaluates on bound value. | Delete — R-MPSE subsumes it. |
| R21 dead enforcement (59L) | `/(gate\|validator\|firewall)/i` import-string regex (the same self-slop; plus fragile `new Foo(...)` string-concat body checks). Replaced by the graph edge: does the declared GateCriteria's `GuardCondition(predicate)` actually evaluate `checkContract('pre', bindings)` at the declared hook? The graph stores the gate node + the evaluation trace; the L5 path query walks it, not the filename the code lives in. | Delete. |
| R22 spec enablement (69L) | Verb-substring "contract verbs present" detector — `contractAnchorsPresent: this spec Word X appears in this file's text ⇒ the contract is enabled.` Replaced by the spec-clause → binding graph edge (the spec's MathContract is matched to its enforcement locus via the *specs array* the audit-spec declares as mandatory — the word "ENABLE" never appears in the file, the contract does). | Delete. |

### 6.3 WIPE BUT KEEP THE IDEA — ONE LAYER HERE MATTERS (your warhead hunch)

This is the only one of the legacy R18–R25 set that **names a real enforcement mechanism the new shape has no layer for yet.** Deleting the file is right; freezing the mechanism into the layer-registry as a pattern is not.

**R16 bible-enforcement (1,517L) vs R17 theatrical-integrity (578L).**

R16 is the runtime-grade-engineering enforcement layer: warhead bindings, `no-direct-promise-all`, `graph-must-be-awaited`, container/ship-package invariants, the half of the world the LASME's "nothing ships without it" has to live inside — the part that **fails loud in the container if violated** rather than just flagging drift in the audit report. R17 is the lower-ambition theatrical scan the wave manager already *enforcement-ringed* at load.

R16's 1.5K lines are the most materially distinct work in `layers/` — warhead-aware, build-time gated, container-verified. Unlike R18–R22 it does **not** have a clean LASME/MPSE-rename home: there is no dedicated "warhead layer" in the five you named (lexicons/actors/state machines/engines/adapters). So:

**Disposition: delete the files, keep the pattern.** R16 and R17 are the source material for the *CODE-AUDIT TOOL's own SHIP-GATE CHECK* — that single, separately-running verification (not an `R*` layer — a post-container gate with the same enforcement bite as the wave-manager ring's load-time scan):

```
[ THE R16→SHIP-GATE HANDOFF ]

  R16's violation classes are the warhead contract specs:
     • the warheads MUST be bound (the ClearWarheadRegistry contract)
     • graph MUST be awaited (no bare `Promise.all` on graph construction)
     • the build MUST be single-file-bundled (no multi-chunk drift)
     • the container deployment MUST be complete

  That pattern — warhead discipline + build/ship contracts — becomes:

     the CODE-AUDIT SHIP GATE (the container-test of the audit tool itself):
        runTridentOnItsOwnSource
           └─ assert NO warhead contract violation
              AND the code-graph's L3 resolution of "same adapter"
              finds exactly the active adapter count
              AND the audit-spec's specs array achieves path coverage ≥ N
              (the SHADOW ENHANCED TOOLS BIBLE's 0-hint battery pattern,
               now against the graph, not against string similarity)

  Not an audit layer — a ship-gate verification that the L1→L5→L6 enforcement
  lexicons used as the code audit tool's own private enforcement surface.
  Run ONE-SHOT at container-test (the wave-manager ring-scan's position),
  not per-audit with the LASME layers. One code file stays: the preserved
  check-cluster repinned as `src/audit-engine/ship-gate/checks.ts`.
  Two files otherwise leave the `layers/` registry: r16-bible-enforcement.ts
  and r17-theatrical-integrity.ts, path-kept in the pointer doc above.
```

None of the five LASME layers subsumed this. Putting `warhead:-bypass-aws` inside `R-STATE-MACHINE` muddles the state-machine's detection job (structural shape) with the build system's enforcement job (registered warhead invariants). The ship-gate keeps the separation the new architecture depends on. This is the *"is there anything valuable from the current layers we should keep?"* answer: **only this — as a preserved check-cluster, not as a retained layer.**

---

## SECTION 7 — ANSWERS TO YOUR DIRECT QS + THE CLEANUP-PLAN EXPLAINER

### Q1 — single provider? Single provider — locked.
`b` — single provider only, `muse-spark-1.2-contributor`, same `enterprise_harmony` transport, loud error if the API fails. **Plus** the pre-flight live probe: at tool start (`action=run` before any candidate extraction) ping `opencode-go` — provider unreachable → fail IMMEDIATELY with `API unreachable: opencode-go/muse-spark-1.2-contributor — $status $detail` + the remedy (R2-N / wave-manager TODOs where the primary had 23s of dead generation before anyone noticed are the exact failure we refuse to repeat). No time wasted: the tool does not start scanning what it cannot adjudicate. The 5-rung chain and the zen key-pool rotation are **stripped from this tool's backend** — keep the `RpmLedger` as a dumb single-provider budget gate (1 request bucket, no exile logic), delete the fallback rungs.

### Q2 — keep vs wipe? Replace + clean legacy foundation.
Answered in §6 above — the five LASME layers + R-MPSE **REPLACE** R18–R22 outright (delete the four files + de-register; point at `DELETED_R18_R25.md` for lineage + keep the DEBUG_LOG D-1..D-15). R23's re-grounding becomes R-GRAPH, R24/R25 become R-DH-FEED + R-PROVENANCE — but sourced off the new SRO graph rather than the old flat-BFS. The legacy R0–R17 stay as-is — the clean-legacy foundation the five new layers graft onto. The one preserved cluster is R16→ship-gate (above).

### Q3 — where the spec file lives?
Same setup as the wave-manager, no change: `.trident/audit-spec.json` — one workspace-scoped JSON in the codebase, auto-created by the tool's `ensureAuditSpecFile(projectRoot)` on first run, editable in-place, `tool.after`-revalidated in-turn. Sits visible right next to `.trident/wave-spec.json` — both in `.trident/`, everything self-contained, the two files visible side by side when a newcomer opens the filebase (clean is the filebase looking like `.trident/{audit-spec,wave-spec,gates/*,knowledge-graph/shared.db,audit-ledger/*.json}` — one directory, the whole control plane legible at a glance). Template shell holds the per-field instructions · `[FLOOR 200c …]` char floors with named remedies · `allowedDomains` stays unscoped at the filebase edge (no scope confusion) · the IDE-style diagnostic throwing on violations is identical (mechanically verified via the wave-manager's `isTemplateShell` pattern).

### The cleanup plan — 30-second explainer if you'd never seen the rest.

A previous session tried to enforce LASME/MPSE on the code-audit tool by adding layers R18–R25. Those new layers scanned for token keywords (`if the file imports triad/math and mentions OracleRegistry → score it as a LASME signature; <2 → file is INCOMPLETE`). That detector was slop — regex hunting architecture-sensitive code is the exact anti-pattern the LASME lexicon warns about. The session that followed (V443, wrongly fixed to V4.4.3 via `.trident/wave-spec.json`'s own generation:lines count) proved the drift and shipped `V443_REGROUNDING_ARCHITECTURE_AUDIT_REPORT.md` — a 320-line §0→§7 honest ledger (triangulation: LASME bibles × MPSE × PARAGON_V1 × as-built source, every claim anchored) that ended with a 6-phase "doctrine-30 grammar × PARAGON runtime substrate on top of the clean legacy foundation" recovery. **This message supersedes only the recovery's §3/§4.** Its Phase 0 fix, its §2 ground truth (KB-03:239-269, etc.), its D-1..D-15 inventory, and its R23 partial-index + container-rig wins **still stand**. What changes is the shape of the recovery — the five LASME component layers (LEXICON / ACTOR / STATE MACHINE / ENGINE / ADAPTER), the MPSE contract layer, and the SRO graph pipeline described above — all now shaped by the inputs you just paid for: the SRO 8-layer × 5-prompt pattern (Prompt 3's Cypher schema-lock and Prompt 4's path-cited answers are the delta), the SHADOW ENHANCED 20-step recipe, the forked PI-SDK backend in its real 1M-window delivery, and the audit-spec input pipeline (now visible next to wave-spec).

### What happens next (no dispatch this turn — you said NO BUILD EXECUTION, I hold there)

*With your GO:* Waves A→G spin A + B in parallel (A has zero file overlap with B; A is `audit-spec.ts`, B is the `shadow-backend/` tree) — then C (five layers), D (math), E (graph/hunter re-grounding on top of the now-live SRO), F (container — path coverage + NO-self-stamp + golden zero on PARAGON_V1), G (canon). When you say build, I ship you the generated dispatch manifests — first wave: A+B — then the pipeline does the rest per the BUILD WAVES gate.

Ask anything you want to be adjusted — or say **build** and wave A+B goes up.

---

**END OF VERBATIM RECORD.**

*Operator rulings embedded above (binding for every future session):*
1. *The five dedicated LASME layers scan for STRUCTURAL SHAPES and adjudicate against the ACTUAL SPECS — never keyword tokens.*
2. *Q1-b: single provider muse-spark-1.2-contributor only, loud API-unreachable fail at tool start, no fallback rungs.*
3. *Q2: the five LASME layers + R-MPSE replace R18-R22; R0-R17 stay; R16's pattern survives as the ship-gate check-cluster.*
4. *Q3: `.trident/audit-spec.json` — same setup as wave-spec, target-workspace-scoped, self-contained.*
5. *THE MODEL-NAME BAN: the article's example model must never be hardcoded into this project — role terms only (this file's header records the replacement).*
6. *NO BUILD EXECUTION until the operator says build.*
