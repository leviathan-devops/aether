# TRIDENT_V443 HUNTER + SRO GRAPH OVERHAUL — L2 SPEC (PLAN B)

**Version:** 1.0 · **Date:** 2026-08-25 · **Status:** AUTHORITATIVE — the design authority for the derailment-hunter overhaul + the SRO knowledge-graph build
**Project:** .../Active_Projects/v4.4.3 · **Predecessors:** SRO-Code-Audit-Overhaul-Data.md (§3 — the SRO absorption; the five prompts; the L1-L8 loop) · V443_REGROUNDING_ARCHITECTURE_AUDIT_REPORT.md (the hunter's A− grade + the flat-graph diagnosis)
**Consumes:** PLAN S (the shadow harness — the L6 graph agent + the semantic extraction pass run on it) · PLAN A A3 (the math substrate — the graph's Contract/Threshold payloads)
**The design authority for the graph:** ~/Downloads/"SRO Graphs.pdf" (10 pages, processed 2026-08-25) — the 8-layer architecture, the 5 prompts, the 5 retrieval methods, the 6 troubleshooting gates. THE LOOP LAW (the article's core): step 8 (Update) closes to step 2 (Extraction) — each pass makes both the graph and the next answer better.
**Baseline (operator-locked):** "we scan for structural shapes and adjudicate against the actual specs" — the graph IS the structural-shape substrate · sqlite+recursive-CTE+Cypher-subset (FORK 1, my call ratified by silence) — no new graph-DB infra · the MiniLM vector leg kept (FORK 2) · the hunter's machine skeleton + INCONCLUSIVE law + report-writer + the 44 committed tests UNCHANGED

## §0 THE FUNDAMENTAL PROBLEM

The hunter's graph today is a FLAT CALL GRAPH: `shared.db`'s graph_nodes/graph_edges dumped per run, one adapter interface (whoCalls/chain/imports/awaits/unwired), BFS-64 hardcoded. No typing discipline (nodes are name strings with a `kind` free-text field), no resolution (the same entity fragments across casing/file/alias), one retrieval mode of the five the SRO article prescribes, no verification layer ("a very sophisticated hallucination machine" — the article's warning, embodied), no maintenance cycle (each run re-extracts; nothing compounds). The operator's directive: rebuild the graph construction + the hunter on the SRO concept, wired into the code-audit tool's graph-activated layers, forming the progressive depth ladder — LASME (shapes) → MPSE (numbers) → SRO (chains) — "each layer is naturally harder to bullshit than the last. SRO cannot be bullshitted at all."

## §1 FAILURE INVENTORY

| # | Sev | The failure | Evidence | Killed by |
|---|---|---|---|---|
| F-B1 | HIGH | The flat graph: kind as free text, no closed vocabulary | graph/sqlite-store.ts + the audit report's R23 analysis | §2.1 |
| F-B2 | HIGH | No resolution layer — IntentComputeHealth fragments across casing/file/alias; every query returns partials | the SRO article's resolution chapter; the hunter's own duplicated-node output | §2.3 |
| F-B3 | HIGH | One retrieval mode (BFS-64) of five | interface.ts's chain() | §2.4 |
| F-B4 | HIGH | No verification — adjacent nodes presented as causal findings (the R22 adjacency class) | the audit report D-12; the article's L7 warning | §2.5 |
| F-B5 | CRIT | No maintenance — each run wipes/re-extracts; nothing compounds | the per-run dump in the audit graph append | §2.6 |
| F-B6 | MED | TEMPLATE_LIBRARY hardcode in TRACE — 7 families as fixed template checks, not queries | harness/trace.ts + lexicon/templates.ts:509 | §2.7 |
| F-B7 | MED | The evidence-less edge: edges land without quotes (the extraction-hallucination vector) | the article's "evidence field is NOT optional" gate | §2.1 (schema NOT NULL) |
| F-B8 | MED | R23's per-call DB opens (the D-10 partial fix) | r23.ts:57-63,84,116,125 | §2.9 (one handle) |
| F-B9 | LOW | likec4 Layer-6 dead code (never wired) | the hunter bible's W2B splice note | OUT OF SCOPE (v1.1; not touched) |

## §2 THE FIX PLAN

### §2.1 THE TYPED ONTOLOGY + THE STORAGE LAYER (B1)

**The single type authority** — `src/shared/knowledge-graph/ontology.ts`, imported by BOTH tools (the audit layers' candidates and the graph's nodes speak the same types):

```typescript
export const NODE_TYPES = ['File','Class','Function','Interface','Module','Machine',
  'Actor','Engine','Adapter','Container','Lexicon','Contract','Threshold','Gate',
  'EvidenceFile','SpecClause'] as const;
export type NodeType = typeof NODE_TYPES[number];
export const PREDICATES = {
  lasme: ['declares','implements','triggers','violates','shouldBe','wraps'],
  mpse:  ['evaluates_to','contradicts_oracle','grounded_through','unguarded_threshold'],
  sro:   ['caused','derived_from','resolved_to','superseded_by','flagged_by'],
  wiring:['calls','imports','awaits','exports','unwired'],       // the legacy verbs, kept
} as const;
export type Predicate = (typeof PREDICATES)[keyof typeof PREDICATES][number];
```

**The additive storage migration** (legacy flat tables STAY — compat; the typed tables are new):

```sql
CREATE TABLE typed_nodes (
  id INTEGER PRIMARY KEY, canonical_id TEXT NOT NULL,           -- the resolved identity
  kind TEXT NOT NULL CHECK (kind IN (…16 values…)),              -- CLOSED vocab at the schema
  label TEXT NOT NULL, file TEXT, line INTEGER,
  created_run TEXT NOT NULL, superseded_run TEXT                 -- L8 history (NULL = live)
);
CREATE TABLE typed_edges (
  id INTEGER PRIMARY KEY, src_canonical TEXT NOT NULL, dst_canonical TEXT NOT NULL,
  predicate TEXT NOT NULL CHECK (predicate IN (…closed list…)),  -- CLOSED vocab at the schema
  evidence_quote TEXT NOT NULL,                                  -- NOT NULL = the evidence law
  confidence REAL NOT NULL DEFAULT 1.0,
  created_run TEXT NOT NULL, superseded_run TEXT
);
CREATE TABLE resolutions (alias TEXT PRIMARY KEY, canonical_id TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('same','related','unrelated')),
  reasoning TEXT NOT NULL, created_run TEXT NOT NULL);
CREATE TABLE graph_facts (id INTEGER PRIMARY KEY, subject TEXT NOT NULL, predicate TEXT NOT NULL,
  object TEXT NOT NULL, evidence TEXT NOT NULL, confidence REAL NOT NULL,
  created_at INTEGER NOT NULL, superseded_at INTEGER);           -- the L8 fact ledger
CREATE INDEX idx_te_src ON typed_edges(src_canonical);
CREATE INDEX idx_te_dst ON typed_edges(dst_canonical);
CREATE INDEX idx_te_pred ON typed_edges(predicate);
```

**The schema IS the first enforcement layer:** an unknown predicate INSERT is refused by CHECK; an evidence-less edge is refused by NOT NULL (F-B7 dead at the storage boundary). WAL on; the run-keyed created_run/superseded_run columns carry the temporal dimension.

### §2.2 THE HYBRID EXTRACTION (B2 — SRO Mode 3, Synergized)

Two passes, merged: the MECHANICAL (deterministic, free, exact) + the SEMANTIC (the shadow harness, Prompt 1):

```
PASS A · MECHANICAL (the native-ast adapter repurposed):
  ts.createProgram over the target → File/Class/Function/Interface/Module nodes;
  callgraph edges (calls/imports/awaits/exports) with file:line exactness,
  confidence=1.0, evidence_quote=the import/call line verbatim. ZERO cost, ZERO hallucination.

PASS B · SEMANTIC (the S-harness, Prompt 1 verbatim-adapted):
  per file-batch: the agent types ROLES (this class is an Engine by role — the
  C1-C15 contract shapes from PLAN A §2.3's detector tables, now as extraction
  prompts), binds spec clauses (SpecClause nodes + declares/implements edges),
  and emits relationship triples with evidence quotes + confidence.
  Output: JSON triples (the article's Prompt-1 shape: entity/entity_type/
  relations[{predicate,object,evidence,confidence}]).

MERGE: Pass A's exactness anchors Pass B's semantics — a Pass-B triple whose
subject/object resolves to a Pass-A node inherits its file:line; a Pass-B-only
node is created with its cited evidence. CONFLICT (A says X, B says ¬X) → both
kept + the contradiction FLAGGED (the L8 contradiction class — never silently
resolved at extraction time).
```

### §2.3 THE RESOLUTION LAYER (B2b — Prompt 2, batch, PRE-INSERTION)

The layer everyone skips — not us: **the resolver runs as a batch job over NEW entities BEFORE insertion** (the article's law: retrofitting resolution onto a polluted graph is significantly harder than doing it upfront). The S-harness, Prompt 2: pairs of {new entity, existing canonical candidates} → verdict same/related/unrelated + canonical_name + reasoning + the destructive-merge flag. `IntentComputeHealth` / `intentComputeHealth.ts` / the audit-layer alias → SAME (one canonical); `ThresholdHelper:40` vs `TVDThresholds:38` → RELATED (distinct, linked). The resolutions table is the alias map — every subsequent query path canonicalizes through it (the fragmentation death: F-B2).

### §2.4 THE FIVE-METHOD RETRIEVAL + THE CYPHER-SUBSET (B3)

**`query-engine.ts`** — five methods over the typed tables, one shared connection:

| Method | Mechanism | The audit question it answers |
|---|---|---|
| entity lookup | indexed canonical_id | "what is node X?" |
| **path search** | recursive CTE over typed_edges (bounded depth, default 16, max 64) | "walk every hop from this spec clause to its enforcement site" — the SHOULD-BE query |
| community | connected components over typed edges (label-propagation, k=depth 2) | "the recurring derailment shapes across the codebase" |
| temporal | created_run/superseded_run filters | "was this threshold compliant at run N? when did it drift?" |
| vector | the MiniLM embeddings sidecar (corbell-embeddings, kept) | the fuzzy first pass |

**`cypher-subset.ts`** — the schema-locked translator (Prompt 3's contract): labels/relationship types validated against ontology.ts (out-of-schema → REJECTED with the schema), path queries preferred when the question implies causation, output = the SQL/CTE plan + its plain-English meaning. The subset grammar: `MATCH (a:Label)-[r:REL*1..16]->(b:Label) WHERE … RETURN …` — compiled to the recursive CTE.

### §2.5 THE L6 GRAPH AGENT (B3b — the loop that replaces TEMPLATE_LIBRARY)

The S-harness bound with a `query` tool: plan → emit the Cypher-subset → read the returned subgraph → hit a gap (TRACE_GAP: the path query returned empty for a declared relation) → emit the NEXT query → converge. Rounds-capped (the PhaseController's budget: 2 + ceil(targets/6) + 2). **This replaces trace.ts's TEMPLATE_LIBRARY execution**: the 7 template families re-expressed as typed queries — wiring.no-dead-module → the unwired-exports path; contract.must-implement → the SpecClause→implementation path; provenance.traces-to-source → the temporal/path; domain.numeric-threshold → the MPSE predicate family; process.gates → the Gate-node paths; the 2 wiring cousins likewise. The hunter's MicroLoopMachine states are UNTOUCHED (RECON→MAP→SCAN→TRACE→STRIKE→REPORT→DONE|INCONCLUSIVE) — only TRACE's internals swap to the L6 loop.

### §2.6 THE VERIFICATION + THE UPDATE LOOP (B4 — L7 + L8, the compounding)

**L7 verify.ts (Prompt 4):** every claim cites the specific nodes + the relationship path; confidence stated; inference-flagged; **adjacency ≠ causation** (`calls` is not `caused` — the predicate families carry the distinction); when the graph can't answer, the missing structure is NAMED (the TRACE_GAP artifact). A claim without a path = REFUSED (not downgraded — refused).

**L8 update.ts (Prompt 5):** each new fact classified new/duplicate/contradiction/update/uncertain against the current subgraph. Contradictions FLAGGED (both versions + evidence preserved). Updates TIMESTAMP (superseded_run set; the row NEVER deleted). **The loop closes:** the next extraction reads the prior graph (the resolutions table + the fact ledger hydrate Pass B's chain) — run 2 does not re-extract run 1's resolved entities (the compounding proof, the article's "gets measurably smarter every time it answers").

### §2.7 THE HUNTER REWIRE (B5)

MAP = build + extract (hybrid) + resolve + store; SCAN = the compiled predicates as typed queries; TRACE = the L6 loop; STRIKE/REPORT unchanged except every finding carries the L7 stamp (the path citation in the finding's evidence). The 44 committed hunter tests STAY GREEN (the zero-broken-windows law); the machine's INCONCLUSIVE fail-state law untouched.

### §2.8 THE BATCH-B LAYERS (B6 — the audit tool's graph legs)

r-graph (the wiring-conformance layer: the path queries via B3, ONE shared DB handle — F-B8 dead), r-dh-feed (the hunter's findings as candidates re-adjudicated by the second shadow pass), r-provenance (the spec→code trace verification, BFS ≤64 over typed edges — every clause the first pass cited). Per PLAN A §2.7: silent without the graph, triads at emission, the L8 write-back closes the loop.

### §2.9 THE MPSE WIRING (the meta-audit anchors)

| ID | Contract | The expr (condensed) | Oracle |
|---|---|---|---|
| **MC-B-01** | `graph.vocab.closed` | inv: `∀e ∈ typed_edges: e.predicate ∈ ONTOLOGY` (schema CHECK) | 0 violations |
| **MC-B-02** | `graph.evidence.mandatory` | inv: `∀e ∈ typed_edges: len(e.evidence_quote) ≥ 1` (NOT NULL) | 0 empty |
| **MC-B-03** | `graph.resolution.preInsert` | post: `∀n ∈ insertedNew: resolved(n) < insert(n)` (the batch ran BEFORE) | 0 unresolved-new |
| **MC-B-04** | `graph.update.noDelete` | inv: `∀f: superseded(f) → row(f) ∃ ∧ f.superseded_run ≠ NULL` (timestamped, never deleted) | 0 hard-deletes |
| **MC-B-05** | `graph.compound.dedupe` | post: run2's re-extraction of run1's resolved set = 0 new duplicates | 0 |
| **MC-B-06** | `graph.path.bounded` | post: `∀q ∈ pathQueries: depth(q) ≤ 64` | 0 overruns |
| **MC-B-07** | `l6.rounds.budget` | post: `roundsUsed ≤ 4 + ceil(targets/6)` (the worked pins: t=6→5, t=24→8) | the pins |
| **MC-B-08** | `l7.claim.pathCited` | post: `∀c ∈ acceptedClaims: len(c.pathNodes) ≥ 1 ∧ path validates against the tables` | 0 pathless |
| **MC-B-09** | `hunter.legacy.green` | post: `bun test trident-bug-hunter = 44/44` | 44, tol=0 |
| **MC-B-10** | `graph.single.handle` | post: `count(distinct dbConnections per layer run) = 1` (F-B8's death) | 1, tol=0 |

D1-D9 map: D1 (two readings of a relation — the closed vocab + evidence quote); D2/D3 (extraction cardinality — the merge law: Pass A anchors, Pass B never drops A's nodes); D4 (extraction "improving" the codebase — the harness is read-only + query-only); D5 (an edge without provenance — NOT NULL); D6 (skipped files — the Pass A coverage = the AST program's file set, asserted); D7 (kind/predicate typos — the CHECK constraints); D8 (empty graph / 1-node graph / 50K-node graph — the CTE bounds + the vector fallback); D9 (L8 before L7 — the update only accepts VERIFIED facts).

## §3 IMPLEMENTATION ORDER (waves B1..B7)

| Wave | WHAT | Files owned | Gate |
|---|---|---|---|
| **B1** | ontology.ts + the storage migration + the retrieval substrate (CTE path engine, community, temporal, vector) | `src/shared/knowledge-graph/{ontology,migrations,query-engine}.ts` | schema round-trip; the CHECK-refusal tests (unknown predicate + empty evidence both REFUSED); tsc 0 |
| **B2** | the hybrid extractor (Pass A repurpose + Pass B via S) + the resolver (Prompt 2) | `bug-hunter/graph/extraction/*.ts` | the fixture codebase's known triples extracted; the casing-merge + the destructive-refusal; pre-insertion resolution proven |
| **B3** | cypher-subset.ts + the L6 loop | `bug-hunter/graph/{cypher-subset,l6-agent}.ts` | the 5 methods' fixture answers; the schema-lock rejection; the TRACE_GAP-close + termination fixtures |
| **B4** | verify.ts + update.ts | `bug-hunter/graph/{verify,update}.ts` | the pathless-claim refusal; the contradiction-flag fixture; the no-delete invariant; the run-2 dedupe (MC-B-05) |
| **B5** | the hunter rewire (MAP/TRACE internals) | `bug-hunter/harness/{map,trace}.ts` internals | the hunt run produces path-cited findings; **the 44 legacy tests green** (MC-B-09); INCONCLUSIVE intact |
| **B6** | the Batch-B layers | `src/audit-engine/layers/r-{graph,dh-feed,provenance}.ts` | silent-without-graph; active-with-graph triads; the second-pass brief wiring (with A5) |
| **B7** | the joint container test | the rig | hunt→graph→audit→Batch-B→L8→run-2-sees-run-1 (the compounding, in-container); the ship-gate one-shot |

Dependencies: B1 first (the types + the schema everything writes into); B2 after B1+S4; B3 after B1+S4; B4 after B3; B5 after B3+B4; B6 after B5+A5; B7 last (A6 + S6 live).

## §4 TESTING STRATEGY

Unit: the schema-refusal battery · the extractor's fixture triples · the resolver's same/related/destructive matrix · the 5 retrieval methods' known answers · the Cypher-subset's schema-lock + compilation · L7's pathless-refusal · L8's five-way classifier. Replay: the fragmentation case (the same engine under 3 names → ONE canonical after resolution); the adjacency-as-causation case (a calls-edge presented as caused → REFUSED). Container (B7): the joint run — the SRO loop end-to-end with the compounding assertion (run 2's extraction introduces 0 duplicates of run 1's resolved entities — MC-B-05's in-container proof) + the hunter's 44/44 inside the container.

## §5 ANTI-PATTERNS AGAINST FALSE SUCCESS

| # | The trap | The detector |
|---|---|---|
| AP-B-1 | The evidence-optional edge (F-B7 reborn) | the NOT NULL + the zero-empty-quotes fixture |
| AP-B-2 | The post-hoc resolution (retrofit on a polluted graph) | MC-B-03's pre-insertion assertion |
| AP-B-3 | The silent overwrite (L8 "update" that deletes) | MC-B-04 + the row-still-exists fixture |
| AP-B-4 | The adjacency-as-causation finding | L7's predicate-family check + the replay fixture |
| AP-B-5 | The unbounded path query (the O(N²) cousin) | MC-B-06's depth bound + the 50K-node stress fixture |
| AP-B-6 | The hunter regressing (a "rewire" that breaks the 44) | MC-B-09 — the zero-broken-windows law |
| AP-B-7 | The vector-only graph (a similarity index wearing the graph's name) | the typed-tables' row counts asserted per run (the structure exists) |
| AP-B-8 | The compounding fake (run 2 re-extracts everything, calls it "fresh") | MC-B-05's duplicate count |

## §6 SUCCESS CRITERIA

- **B-1** The schema refuses unknown predicates + evidence-less edges (the two CHECK/NOT NULL fixtures)
- **B-2** The fixture codebase extracts to the known typed triples (the mechanical pass exact; the semantic pass's roles adjudicated with quotes)
- **B-3** The 3-alias engine resolves to ONE canonical; the destructive merge REFUSED
- **B-4** The five retrieval methods return the fixture graph's known answers
- **B-5** The L6 loop closes a planted TRACE_GAP and terminates within budget (the MC-B-07 pins)
- **B-6** The L8 classifier's five ways proven; superseded rows EXIST with timestamps (MC-B-04)
- **B-7** The compounding: run 2's duplicate-extraction = 0 for run 1's resolved set (MC-B-05, in-container at B7)
- **B-8** The hunter's 44/44 green through the rewire (MC-B-09)
- **B-9** The Batch-B layers: silent without the graph; triad-carrying + path-citing findings with it
- **B-10** THE META-AUDIT: the tool audits the graph modules against §2.9's registry → 0 TRUE_DEFECTs; tsc 0; preflight ≥951

## §7 COMPACTION-PROOF GUIDE + §8 OPEN QUESTIONS

Resume anchors: THIS spec + the SRO-Code-Audit-Overhaul-Data.md §3 (the prompts verbatim) + the newest graph run's manifest + the wave-plan section in flight. Cross-consistency: every graph module names its spec section; every predicate cites its family; the ontology is the ONE import (no local re-declarations — the shape-drift ban).
Open: (1) Neo4j migration path — the Cypher-subset compiles to CTE SQL now; a future real-Cypher backend swaps the compiler only (the grammar is the stable interface). (2) The vector index's refresh cadence — v1 rebuilds per MAP phase; incremental embedding is a v1.1 item. (3) likec4 (F-B9) stays dead — untouched, out of scope.

## APPENDIX A — ZERO-TRUST AUDIT

| # | Sev | Finding | Resolution |
|---|---|---|---|
| Z-B1 | HIGH | The L6 agent could emit Cypher outside the subset (prompt-drift) | The translator VALIDATES before compiling — out-of-schema = REJECTED at cypher-subset.ts, not trusted from the model |
| Z-B2 | MEDIUM | Pass B (semantic) could contradict Pass A silently | The merge law: conflicts are FLAGGED as contradictions (L8's class), never resolved at extraction |
| Z-B3 | MEDIUM | The 44 legacy tests could pin the OLD TEMPLATE_LIBRARY path | B5's rewire is internal to map/trace; the tests assert STATES + findings, not the template mechanism (verified: harness/__tests__ assert machine.context + report rows) |
| Z-B4 | LOW | The temporal columns' granularity (run-keyed, not wall-clock) | Deliberate: runs are the audit's event horizon; wall-clock derivable via the run manifests |
| Z-B5 | LOW | The vector leg's model drift (MiniLM versioning) | The sidecar pins its model id in the index metadata; a mismatch = rebuild, never silent |

**Verdict:** 5 findings (0 CRITICAL, 1 HIGH, 2 MEDIUM, 2 LOW) — resolved at authoring. No unresolvable gaps.

## APPENDIX B — THE MPSE CONTRACT REGISTRY (`spec-b.mpse.v1`)

The 10 contracts of §2.9, same JSON encoding as SPEC-S App B (30-kind grammar; bound functions resolved/pathValidates/count). The meta-audit invocation: the tool audits `<repo>/src/shared/knowledge-graph/` + `bug-hunter/graph/` against this registry — 0 TRUE_DEFECTs = the B-10 closure. Key entries: `graph.vocab.closed` (inv: ∀e predicate∈ONTOLOGY), `graph.evidence.mandatory` (inv: ∀e quote≥1), `graph.resolution.preInsert` (post: resolved-before-inserted), `graph.update.noDelete` (inv: superseded→row-exists), `graph.compound.dedupe` (post: run2-dupes(run1-resolved)=0), `l6.rounds.budget` (post: ≤4+ceil(t/6)), `l7.claim.pathCited` (post: ∀c path≥1-node), `hunter.legacy.green` (oracle: 44).

**END OF SPEC — PLAN B. Contracts: 10. Waves: 7. The loop law: L8→L2. The compounding is the product.**
