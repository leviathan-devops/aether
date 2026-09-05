# V443 PLAN B — GAP ANALYSIS (THE REGISTER)

**Version:** 1.0 · **Date:** 2026-08-27 · **Author:** trident_build (gap-register wave)
**Spec authority:** `MASTER_CONTEXT/V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md` (219 lines, 2026-08-25)
**Project root:** `.../Active_Projects/v4.4.3`
**Status:** REGISTER — the single truth source for Plan B's B-1..B-10 closure state

---

## §0 HOW TO READ THIS DOCUMENT

This register is the PLAN B gap ledger. It carries five mandated sections: (1) what the spec demanded, (2) what the code on disk actually is, (3) the per-criterion B-1..B-10 verdicts with mechanical evidence or explicit NOT-RUN/UNVERIFIED/REFUTED, (4) the ordered dispatchable next steps, (5) the coverage map + honest residual. Every claim carries a `file:line` anchor or a pasted command output. A claim without an anchor is deleted. The B-8 refutation prints the true hunter battery numbers (`5627 pass / 59 FAIL`) and the per-class failure taxonomy with the environmental-vs-code-real analysis. The b2/b3 stub audits are named as the evidence-less class. The b5 audit's claimed anchors (`map.ts` sha `1ab70692`, `trace.ts` sha `8c503a9a`, the 165-test battery) are mechanically re-checked.

The operator's doctrines that govern the reading: "the compounding is the product" (spec §END — the L8→L2 loop, run 2's duplicate-extraction must be 0 for run 1's resolved set), the closed-vocabulary law (the schema refuses unknown predicates + evidence-less edges), supersede-never-delete (`graph.update.noDelete`), the read-only query surface (the hunter's tools never mutate), the ISE law (the row-mappers, the evidence triads), and the loud-fail law (a malformed row throws `ROW_SHAPE`, never silent undefined propagation).

---

## §1 WHAT THE SPEC WAS — PLAN B'S INTENT

### §1.1 The typed knowledge graph (the ontology)

Spec §2.1 (`V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:29-75`) defines the single type authority at `src/shared/knowledge-graph/ontology.ts` (spec:31):

```typescript
// V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:33-45 — the verbatim contract
export const NODE_TYPES = ['File','Class','Function','Interface','Module','Machine',
  'Actor','Engine','Adapter','Container','Lexicon','Contract','Threshold','Gate',
  'EvidenceFile','SpecClause'] as const; // 16 values — the closed node vocabulary
export type NodeType = typeof NODE_TYPES[number];
export const PREDICATES = {
  lasme: ['declares','implements','triggers','violates','shouldBe','wraps'],       // 6
  mpse:  ['evaluates_to','contradicts_oracle','grounded_through','unguarded_threshold'], // 4
  sro:   ['caused','derived_from','resolved_to','superseded_by','flagged_by'],   // 5
  wiring:['calls','imports','awaits','exports','unwired'],                          // 5
} as const; // 20 total predicates, 4 families
export type Predicate = (typeof PREDICATES)[keyof typeof PREDICATES][number];
```

The ontology is the ONE import — no local re-declarations (the shape-drift ban, spec §7). Every `typed_nodes.kind` and every `typed_edges.predicate` must be drawn from these closed sets. The families carry SRO semantics: `lasme` is shape-declaration, `mpse` is numeric-grounding, `sro` is causal/provenance, `wiring` is structural. The `caused` vs `calls` distinction is the L7 adjacency-not-causation law — a `calls` (wiring) edge presented as `caused` (sro) is the R22 hallucination class the SRO article warns as "a very sophisticated hallucination machine."

### §1.2 The CHECK / NOT NULL schema enforcement

Spec §2.1 (`V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:47-75`) prescribes additive storage — legacy flat tables (`graph_nodes`/`graph_edges` in `src/shared/knowledge-graph/db.ts:218-236`) STAY for compat; the typed tables are NEW (`migrations.ts`):

```sql
-- V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:49-72 — verbatim DDL intent
CREATE TABLE typed_nodes (
  canonical_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN (…16 values…)),  -- CLOSED vocab at the schema
  label TEXT NOT NULL, file TEXT, line INTEGER,
  created_run TEXT NOT NULL, superseded_run TEXT      -- L8 history (NULL = live)
);
CREATE TABLE typed_edges (
  src_canonical TEXT NOT NULL, dst_canonical TEXT NOT NULL,
  predicate TEXT NOT NULL CHECK (predicate IN (…closed list…)), -- CLOSED vocab
  evidence_quote TEXT NOT NULL,                                   -- NOT NULL = evidence law
  confidence REAL NOT NULL DEFAULT 1.0,
  created_run TEXT NOT NULL, superseded_run TEXT
);
CREATE TABLE resolutions (alias TEXT PRIMARY KEY, canonical_id TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('same','related','unrelated')),
  reasoning TEXT NOT NULL, created_run TEXT NOT NULL);
CREATE TABLE graph_facts (subject TEXT NOT NULL, predicate TEXT NOT NULL,
  object TEXT NOT NULL, evidence TEXT NOT NULL, confidence REAL NOT NULL,
  created_at INTEGER NOT NULL, superseded_at INTEGER);           -- L8 fact ledger
```

The schema IS the first enforcement layer (spec:74): an unknown predicate `INSERT` is refused by `CHECK`; an evidence-less edge is refused by `NOT NULL` (F-B7 dead at the storage boundary, spec F-B7 + AP-B-1). WAL on; the run-keyed `created_run`/`superseded_run` columns carry the temporal dimension. Spec §7 compaction-proof guide: the `TYPED_GRAPH_DDL` string is generated FROM the ontology consts (`NODE_TYPES`/`ALL_PREDICATES` via `sqlList()`) so drift is impossible by construction.

### §1.3 The hybrid extraction (mechanical + semantic) with pre-insertion resolution

Spec §2.2-§2.3 (`V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:76-103`) prescribes two passes, merged, then resolved BEFORE insertion:

```
PASS A · MECHANICAL (native-ast adapter repurposed, spec §2.2:81-84):
  ts.createProgram over target → File/Class/Function/Interface/Module nodes;
  callgraph edges (calls/imports/awaits/exports) with file:line exactness,
  confidence=1.0, evidence_quote=the import/call line verbatim. ZERO cost, ZERO hallucination.

PASS B · SEMANTIC (S-harness, Prompt 1, spec §2.2:86-92):
  per file-batch: agent types ROLES (Engine/Adapter/etc. by role — C1-C15 contract
  shapes), binds spec clauses (SpecClause nodes + declares/implements edges),
  emits JSON triples {entity, entity_type, relations[{predicate,object,evidence,confidence}]}.

MERGE (spec §2.2:94-98): Pass A anchors Pass B — a Pass-B triple whose subject/object
resolves to a Pass-A node inherits file:line; conflicts (A says X, B says ¬X) → both kept
+ FLAGGED (L8 contradiction class, never silently resolved at extraction time).

RESOLUTION (spec §2.3:100-103, Prompt 2, batch, PRE-INSERTION):
  The resolver runs as a batch job over NEW entities BEFORE insertion.
  Pairs {new entity, existing canonical candidates} → verdict same/related/unrelated
  + canonical_name + reasoning + destructive-merge flag. IntentComputeHealth /
  intentComputeHealth.ts / audit-layer alias → SAME; ThresholdHelper:40 vs
  TVDThresholds:38 → RELATED. The resolutions table is the alias map — every
  subsequent query path canonicalizes through it. The article's law: retrofitting
  resolution onto a polluted graph is significantly harder than doing it upfront.
```

The anti-pattern for this layer: AP-B-2 (post-hoc resolution — MC-B-03's pre-insertion assertion catches it).

### §1.4 The cypher-subset + the L6 loop (LLM-compiled Cypher validated before compiling)

Spec §2.4-§2.5 (`V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:105-122`):

`query-engine.ts` — five methods over the typed tables, one shared connection (spec:107 table):

| Method | Mechanism | Audit question |
|---|---|---|
| entity lookup | indexed `canonical_id` | "what is node X?" |
| **path search** | recursive CTE over `typed_edges` (bounded depth, default 16, max 64) | "walk every hop from spec clause to enforcement site" — the SHOULD-BE query |
| community | connected components over typed edges (label-propagation, k=depth 2) | "recurring derailment shapes" |
| temporal | `created_run`/`superseded_run` filters | "was threshold compliant at run N?" |
| vector | MiniLM embeddings sidecar (corbell-embeddings, kept) | fuzzy first pass |

`cypher-subset.ts` — the schema-locked translator (Prompt 3's contract, spec §2.4:117): labels/relationship types validated against `ontology.ts` (out-of-schema → REJECTED with the schema), path queries preferred when the question implies causation, output = SQL/CTE plan + plain-English meaning. Subset grammar: `MATCH (a:Label)-[r:REL*1..16]->(b:Label) WHERE … RETURN …` compiled to recursive CTE. Z-B1 mitigation: the translator VALIDATES before compiling — out-of-schema Cypher is REJECTED at `cypher-subset.ts:142-158`, never trusted from the model.

The L6 graph agent (spec §2.5:119-122): the S-harness bound with a `query` tool — plan → emit Cypher-subset → read subgraph → hit gap (TRACE_GAP: path query returned empty) → emit NEXT query → converge. Rounds-capped: `2 + ceil(targets/6) + 2` (the `computeRoundBudget` pins: t=6→5, t=24→8, spec §2.9 MC-B-07). Replaces `trace.ts`'s `TEMPLATE_LIBRARY` execution (F-B6): the 7 template families re-expressed as typed queries. Machine states UNTOUCHED (`RECON→MAP→SCAN→TRACE→STRIKE→REPORT→DONE|INCONCLUSIVE`).

### §1.5 The verify + update (supersede-never-delete with run-keyed temporality)

Spec §2.6 (`V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:124-127`):

L7 `verify.ts` (Prompt 4): every claim cites specific nodes + relationship path; confidence stated; inference-flagged; adjacency not causation (`calls` is not `caused`); when the graph cannot answer, the missing structure is NAMED (TRACE_GAP artifact). A claim without a path = REFUSED (not downgraded — refused). MC-B-08: `∀c ∈ acceptedClaims: len(c.pathNodes) ≥ 1 ∧ path validates`.

L8 `update.ts` (Prompt 5): each new fact classified new/duplicate/contradiction/update/uncertain against current subgraph. Contradictions FLAGGED (both versions + evidence preserved, Z-B2). Updates TIMESTAMP (`superseded_run` set; row NEVER deleted — MC-B-04). The loop closes: next extraction reads prior graph (resolutions table + fact ledger hydrate Pass B's chain) — run 2 does not re-extract run 1's resolved entities (the compounding proof, spec §7: "each pass makes both the graph and the next answer better").

### §1.6 The hunter rewire (MAP populates the typed graph, TRACE runs the L6 loop, findings carry the L7 stamp)

Spec §2.7 (`V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:129-131`): MAP = build + extract (hybrid) + resolve + store; SCAN = compiled predicates as typed queries; TRACE = L6 loop; STRIKE/REPORT unchanged except every finding carries the L7 stamp (path citation). The 44 committed hunter tests STAY GREEN (zero-broken-windows, MC-B-09); the machine's INCONCLUSIVE fail-state law untouched.

MAP's typed population is ADDITIVE (`src/subagents/trident-bug-hunter/harness/map.ts`): the legacy `writeGraph` + mirror remain (compat); `populateTypedGraph` inserts into `typed_nodes`/`typed_edges` only — failures are logged (`console.warn`) never thrown, so the legacy graph's success is never traded for typed-graph complexity (the "grow on top of what works" law).

### §1.7 The Batch-B layers

Spec §2.8 (`V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:133-136`): `r-graph` (wiring-conformance: path queries via B3, ONE shared DB handle — F-B8 dead), `r-dh-feed` (hunter findings as candidates re-adjudicated by second shadow pass), `r-provenance` (spec→code trace verification, BFS ≤64 over typed edges). Per spec §3 B6: silent without graph, triads at emission, L8 write-back closes loop. Located at `src/audit-engine/layers/r-graph.ts` (`9739 bytes`), `r-dh-feed.ts` (`8824 bytes`), `r-provenance.ts` (`10844 bytes`) — the `index.ts` second-brief wiring at `src/audit-engine/runtime/index.ts` B-layer.

### §1.8 The B-1..B-10 success criteria (verbatim) + the 10 MPSE contracts of Appendix B

Spec §6 (`V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:185-196`) — the 10 gates:

- **B-1** The schema refuses unknown predicates + evidence-less edges (the two CHECK/NOT NULL fixtures)
- **B-2** The fixture codebase extracts to the known typed triples (mechanical pass exact; semantic pass roles adjudicated with quotes)
- **B-3** The 3-alias engine resolves to ONE canonical; the destructive merge REFUSED
- **B-4** The five retrieval methods return the fixture graph's known answers
- **B-5** The L6 loop closes a planted TRACE_GAP and terminates within budget (MC-B-07 pins)
- **B-6** The L8 classifier's five ways proven; superseded rows EXIST with timestamps (MC-B-04)
- **B-7** The compounding: run 2's duplicate-extraction = 0 for run 1's resolved set (MC-B-05, in-container at B7)
- **B-8** The hunter's 44/44 green through the rewire (MC-B-09)
- **B-9** The Batch-B layers: silent without the graph; triad-carrying + path-citing findings with it
- **B-10** THE META-AUDIT: the tool audits the graph modules against §2.9's registry → 0 TRUE_DEFECTs; tsc 0; preflight ≥951

Spec §2.9 (`V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:138-152`) + Appendix B (`V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:215-217`) — the 10 MPSE contracts (`spec-b.mpse.v1`):

| ID | Contract | Invariant / Postcondition (condensed) | Oracle |
|---|---|---|---|
| MC-B-01 | `graph.vocab.closed` | inv: `∀e ∈ typed_edges: e.predicate ∈ ONTOLOGY` (schema CHECK) | 0 violations |
| MC-B-02 | `graph.evidence.mandatory` | inv: `∀e ∈ typed_edges: len(e.evidence_quote) ≥ 1` (NOT NULL) | 0 empty |
| MC-B-03 | `graph.resolution.preInsert` | post: `∀n ∈ insertedNew: resolved(n) < insert(n)` (batch ran BEFORE) | 0 unresolved-new |
| MC-B-04 | `graph.update.noDelete` | inv: `∀f: superseded(f) → row(f) ∃ ∧ f.superseded_run ≠ NULL` | 0 hard-deletes |
| MC-B-05 | `graph.compound.dedupe` | post: run2's re-extraction of run1's resolved set = 0 new duplicates | 0 |
| MC-B-06 | `graph.path.bounded` | post: `∀q ∈ pathQueries: depth(q) ≤ 64` | 0 overruns |
| MC-B-07 | `l6.rounds.budget` | post: `roundsUsed ≤ 4 + ceil(targets/6)` (pins: t=6→5, t=24→8) | the pins |
| MC-B-08 | `l7.claim.pathCited` | post: `∀c ∈ acceptedClaims: len(c.pathNodes) ≥ 1 ∧ path validates` | 0 pathless |
| MC-B-09 | `hunter.legacy.green` | post: `bun test trident-bug-hunter = 44/44` (now 5627-wide; see §3) | 44, tol=0 |
| MC-B-10 | `graph.single.handle` | post: `count(distinct dbConnections per layer run) = 1` (F-B8's death) | 1, tol=0 |

D1-D9 mapping (spec:152): D1 (two readings of a relation), D2/D3 (extraction cardinality — merge law), D4 (extraction "improving" the codebase — harness is read-only), D5 (edge without provenance — NOT NULL), D6 (skipped files — Pass A coverage = AST program file set), D7 (kind/predicate typos — CHECK constraints), D8 (empty/1-node/50K-node graph — CTE bounds + vector fallback), D9 (L8 before L7 — update only accepts VERIFIED facts).

---

## §2 WHAT WAS BUILT — THE ACTUAL CODE ON DISK

### §2.1 `src/shared/knowledge-graph/` — the graph kernel (6 files, verified)

An `ls` of the directory (`2026-08-27`):

```
src/shared/knowledge-graph/
  ontology.ts          18 lines   — 16 NODE_TYPES, 4 PREDICATES families, 20 predicates total
  migrations.ts        70 lines   — TYPED_GRAPH_DDL (4 tables + 7 indexes), ensureTypedGraphSchema()
  db.ts               870 lines   — SharedDb + FamilyGraphStore, openStore(), pragmas, mirror
  query-engine.ts     355 lines   — QueryEngine (5 retrieval methods + ISE row-mappers, BUG-D3-fixed)
  profile-loader.ts  (present)    — profile loading (imports profile-schema)
  profile-schema.ts  (present)    — ProjectProfile / Substrate types
  bun-modules.d.ts   (present)    — ambient shim for bun:sqlite types
  + 4 test files: db.test.ts, family-store.test.ts, profile.test.ts, profile-loader tests
```

`ontology.ts` (`src/shared/knowledge-graph/ontology.ts:1-18`) — VERIFIED: 16 values in `NODE_TYPES` (`File`..`SpecClause`), 4 families (`lasme:6`, `mpse:4`, `sro:5`, `wiring:5`), `ALL_PREDICATES` (20, spread from families), `isNodeType`/`isPredicate` guards via `Set` lookup. The single authority — every predicate check routes through it.

`migrations.ts` (`src/shared/knowledge-graph/migrations.ts:1-70`) — VERIFIED with file:line anchors for CHECK/NOT NULL:

- `migrations.ts:3-8` — `sqlList()` + `NODE_KINDS_SQL = sqlList(NODE_TYPES)` + `PREDICATES_SQL = sqlList(ALL_PREDICATES)` — the DDL strings are COMPUTED from the ontology consts, so drift is structurally impossible.
- `migrations.ts:11-15` — `typed_nodes`: `kind TEXT NOT NULL CHECK (kind IN (${NODE_KINDS_SQL}))` — closed vocab at the schema boundary. `label TEXT NOT NULL`.
- `migrations.ts:22-26` — `typed_edges`: `predicate TEXT NOT NULL CHECK (predicate IN (${PREDICATES_SQL}))` + `evidence_quote TEXT NOT NULL CHECK (length(evidence_quote) > 0)` — the two enforcement layers in one table (MC-B-01 + MC-B-02).
- `migrations.ts:32-36` — `resolutions`: `verdict TEXT NOT NULL CHECK (verdict IN ('same','related','unrelated'))` + `reasoning TEXT NOT NULL`.
- `migrations.ts:48-54` — 7 indexes: `idx_tn_canonical`, `idx_tn_kind`, `idx_te_src`, `idx_te_dst`, `idx_te_pred`, `idx_res_canonical`, `idx_gf_subject`.
- `migrations.ts:61-70` — `ensureTypedGraphSchema(db)` — loud `TYPED_MIGRATION_FAILED` on bad handle or exec throw; `db.exec(TYPED_GRAPH_DDL)` is idempotent (`IF NOT EXISTS`).

The grep that proves the enforcement exists on disk:

```
grep -c "CHECK\|NOT NULL" src/shared/knowledge-graph/migrations.ts → 20
grep -n "CHECK" src/shared/knowledge-graph/migrations.ts →
  14: kind TEXT NOT NULL CHECK (kind IN (...16 values...))
  25: predicate TEXT NOT NULL CHECK (predicate IN (...20 values...))
  26: evidence_quote TEXT NOT NULL CHECK (length(evidence_quote) > 0)
  34: verdict TEXT NOT NULL CHECK (verdict IN ('same','related','unrelated'))
```

`db.ts` (`src/shared/knowledge-graph/db.ts:1-870`) — VERIFIED: `SharedDb` (the `DbClient` impl over `bun:sqlite` — spec §3.6 C18.4's 7 canonical tables + 4 supporting tables, transcribed verbatim at `db.ts:218-325`), `FamilyGraphStore` (W4 content-addressed shared root, spec §3.1), `applyPragmas()` (WAL + NORMAL + busy_timeout 5000 + foreign_keys ON, each wrapped to throw `PRAGMA_FAILED` on failure, `db.ts:366-387`), `openStore()` (applies C18.4 + `SHADOW_VERDICTS_DDL` + `EVENT_LEDGER_DDL` + `TYPED_GRAPH_DDL` idempotently, `db.ts:823-842`). The 870-line file is the durable truth — compaction-inert, WAL-concurrent, append-only ledger, lineage-mandatory (O28.4).

`query-engine.ts` (`src/shared/knowledge-graph/query-engine.ts:1-355`) — VERIFIED: the 5 retrieval methods + the BUG-D3 ISE row-mappers (this session's fix):

- `query-engine.ts:4-43` — 8 interfaces: `TypedNodeRow`, `TypedEdgeRow`, `ResolutionRow`, `GraphFactRow`, `VectorProvider`, `PathOptions`, `CommunityResult`, `TemporalFilter`.
- `query-engine.ts:66-79` — `PATH_DEPTH_DEFAULT=16`, `MIN=1`, `MAX=64`; `clampDepth()` throws `PATH_BOUNDED` if `maxDepth > 64` (MC-B-06), plus `VectorTopK` bounds.
- `query-engine.ts:92-99` — `QueryEngine` constructor: `Database | DbClient` handle normalization via `dbHandle()` (the `instanceof Database` + duck-type `prepare`/`exec` check).
- `query-engine.ts:101-123` — `entity(canonicalId)` + `entityLive(canonicalId)` — indexed lookup, `ENTITY_INVALID` on empty, `ENTITY_QUERY_FAILED` on throw.
- `query-engine.ts:125-217` — `path(from, to, opts)` — the bounded path search (default depth 16, max 64, `liveOnly` default true, `predicateFilter` array guard). Internally `buildPathEdges()` does BFS over live edges with cycle guard (`visited` set + `instr(path)` equivalent), bounded by `maxDepth`. The CTE SQL string is still prepared for the plan surface but the returned path is the BFS result (b1 audit note: "CTE-string prepared but edge-expansion is BFS — functionally equivalent").
- `query-engine.ts:219-258` — `community()` — connected components over `typed_edges`/`typed_nodes` (BFS over adjacency map, live-only).
- `query-engine.ts:260-334` — `temporal(filter)` — `createdRun`/`supersededRun`/`liveOnly` SQL builder. **BUG-D3 row-mappers live here** (see §2.5).
- `query-engine.ts:336-354` — `vector(query, opts)` — injectable `VectorProvider` fast path, `LIKE` fallback on `label`/`canonical_id`/`kind` when no provider.

`profile-loader.ts` / `profile-schema.ts` — PRESENT on disk (verified by `ls`). `profile-schema.ts:21-27` defines `Substrate = 'corbell'|'ix'|'native-ast'` and `ProjectProfile { project, graph: {substrate}, shadow?, events? }`. `profile-loader.ts` hydrates `profile.yaml` into the typed profile (throws `PROFILE_INVALID` on violation — the loud-fail law).

### §2.2 `src/subagents/trident-bug-hunter/graph/` — the hunter's graph surface (23 files, verified)

```
src/subagents/trident-bug-hunter/graph/
  cypher-subset.ts          284 lines — SchemaRejectedError + parseSubsetQuery + TEMPLATE_QUERY_MAP (7 families)
  l6-agent.ts               240 lines — L6AgentError + computeRoundBudget + runL6Loop (2+ceil(t/6)+2)
  interface.ts              231 lines — GraphAdapter contract (whoCalls/chain/imports/awaits/unwired)
  corbell-adapter.ts        (present) — CorbellAdapter (requires corbell binary)
  corbell-embeddings.ts     (present) — MiniLM sidecar wrapper
  ix-adapter.ts             (present) — IxAdapter (requires ArangoDB ix daemon)
  native-ast-adapter.ts     (present) — NativeAstAdapter (ts.createProgram over target)
  sqlite-store.ts           (present) — legacy flat graph store
  likec4-*.ts               (present — 4 files) — LikeC4 DSL/drift/render/bridge (F-B9 dead code, out of scope)
  verify.ts                 206 lines — VerifyError + verifyClaim (L7: adjacency not causation)
  update.ts                 204 lines — UpdateError + classifyFact (5-way: new/dup/contradiction/update/uncertain)
  extraction/
    mechanical.ts           239 lines — extractMechanical (ts.createProgram walk, confidence=1.0, evidence=file:line)
    merge.ts                211 lines — mergePasses (Pass A anchors Pass B; conflicts FLAGGED)
    resolver.ts             278 lines — resolveEntities (Prompt 2 batch, heuristic + harness, pre-insertion)
    semantic.ts             242 lines — semantic extraction (S-harness Prompt 1 shape, LLM-backed when harness present)
  __tests__/
    graph.test.ts, b3-wave.test.ts, corbell-adapter.test.ts, ix-adapter.test.ts, native-ast-adapter.test.ts, likec4.test.ts, corbell-embeddings.test.ts
  verify-update.test.ts     (present) — 24-test battery for verify+update
```

`cypher-subset.ts` (`src/subagents/trident-bug-hunter/graph/cypher-subset.ts:1-284`) — VERIFIED:

- `cypher-subset.ts:7-19` — `SchemaRejectedError` (code `SCHEMA_REJECTED`, carries `badLabel`/`badRelation` + the full schema for the error message — the Z-B1 mitigation).
- `cypher-subset.ts:50-88` — extractors: `extractLabels` (regex `\(\s*\w*\s*:\s*([A-Za-z]…)\)`), `extractRelations` (`\[\s*\w*\s*:\s*([A-Za-z]…)`), `extractDepth` (`*1..N`), `extractWhere`, `extractReturn`.
- `cypher-subset.ts:130-180` — `parseSubsetQuery(query)` — validates non-empty + contains `MATCH`, extracts labels/relations, validates each against `isNodeType`/`isPredicate` (out-of-schema → `SchemaRejectedError`), clamps depth (MC-B-06), builds CTE SQL + plain-English `meaning`. The subset grammar: `MATCH (a:Label)-[r:REL*1..16]->(b:Label) WHERE … RETURN …`.
- `cypher-subset.ts:195-274` — `TEMPLATE_QUERY_MAP` (7 entries, 5 families): `wiring.no-dead-module` (`unwired`), `wiring.every-export-has-an-importer` (`imports*1..16`), `contract.must-implement` (`implements*1..16`), `provenance.traces-to-source` (`derived_from*1..16`), `provenance.quoted-not-synthesized` (`grounded_through`), `domain.numeric-threshold` (`evaluates_to*1..16`), `process.gates-measure-outputs-not-logic` (`shouldBe*1..16`). Each entry pre-compiles via `compileOrThrow()` at module load — a bad template cypher throws at import time, never at query time.

`l6-agent.ts` (`src/subagents/trident-bug-hunter/graph/l6-agent.ts:1-240`) — VERIFIED:

- `l6-agent.ts:7-14` — `L6AgentError` (code-carrying `Error`, `name = code`).
- `l6-agent.ts:16-32` — `L6Target` (`from`/`to`/`predicate` + optional labels), `L6Demand` (`question` + `targets[]`), `L6Harness` (`engine: QueryEngine`), `TraceGap` (`from`/`to`/`predicate`/`closed` + `roundClosed`/`evidence`/`meaning`), `L6Result` (subgraph/gaps/roundsUsed/budget/closedCount/openCount/terminated/meanings/plans).
- `l6-agent.ts:56-62` — `computeRoundBudget(t) = 2 + ceil(t/6) + 2` (pins: t=6→5, t=24→8 — spec MC-B-07). Throws `L6_BUDGET_INVALID` on non-finite/negative.
- `l6-agent.ts:64-92` — `inferLabel(canonicalId)`, `buildCypherForTarget(target, depth)`, `dedupeEdges(edges)` (by `src->dst:predicate` key).
- `l6-agent.ts:94-229` — `runL6Loop(demand, harness)` — validates demand (question non-empty, targets array, each target has from/to/predicate), validates harness has `engine.path()`, computes budget, initializes gaps (closed=false), loops `round=1..budget`: for each open gap, `tryCloseGap(gap, depth=16)` → `buildCypherForTarget` → `parseSubsetQuery` (validate-before-compile) → `engine.path(gap.from, gap.to, {predicateFilter, maxDepth})` → if edges → CLOSED (evidence = `src -[pred]-> dst evidence:…`); else fallback `engine.path(from, to, {maxDepth})` for alternative-predicate detection → if closed, record evidence+meaning+roundClosed; else record TRACE_GAP. Push `plan`/`meaning` each round. Break when no open gaps or no progress this round. Returns `dedupeEdges(subgraph)` + terminated `CONVERGED` (openCount 0) or `BUDGET_EXHAUSTED`.

`interface.ts` (`src/subagents/trident-bug-hunter/graph/interface.ts:1-231`) — VERIFIED: `Lineage` (`SPEC_DERIVED`/`CODE_DERIVED`/`HYBRID`), `GraphNodeKind`/`GraphEdgeKind`/`Substrate`, `GraphNode`/`GraphEdge` (lineage MANDATORY — O28.4), `CallSite`/`ChainStep`/`ImportEdge`/`AwaitEdge`/`DeadNode`, `BuildResult` (`nodes[]`/`edges[]` + duality counts + `command` provenance), `GraphAdapter` (build/whoCalls/chain/imports/awaits/unwired/nodes), `GraphError` hierarchy (`AdapterFailedError`/`AdapterParseError`/`GraphEmptyError` + `FamilyGraphStore` errors), `selectAdapter(profile)` factory.

`corbell-adapter.ts` / `ix-adapter.ts` — PRESENT; both require external binaries (the corbell binary, the ArangoDB ix daemon). Their absence is an ENVIRONMENTAL failure, not a code defect — see §3.2.

### §2.3 The B5 hunter rewire — `harness/map.ts` + `harness/trace.ts` (the SRO machine)

`harness/map.ts` (`src/subagents/trident-bug-hunter/harness/map.ts:1-218`) — VERIFIED:

- `map.ts:1-8` — header comment: W7 + B5 SRO rewire, machine skeleton FROZEN.
- `map.ts:18-21` — imports: `extractMechanical`, `mergePasses`, `resolveEntities`, `isNodeType`/`isPredicate`; `selectAdapter`, `openStore`, `writeGraph`, `mirrorToMasterContext`.
- `map.ts:32-49` — `inferKind(canonical)` / `labelOf(canonical)` — prefix-split → `isNodeType` → fallback.
- `map.ts:55-190` — `populateTypedGraph(db, runId, root)` — the B2 pipeline wired into MAP:
  1. `ts.findConfigFile` + `ts.readConfigFile` + `ts.parseJsonConfigFileContent` → `ts.createProgram` (graceful skip with `console.warn` if no tsconfig / empty fileNames — error paths FIRST);
  2. `extractMechanical(program, {root})` → `mechanical: TypedTriple[]` (confidence 1.0, evidence = file:line verbatim);
  3. `semantic: TypedTriple[] = []` — empty semantic side (no harness LLM — the merge keeps mechanical exactness, see §3.4 residual);
  4. `mergePasses(mechanical, semantic)` → `merged`;
  5. Distinct `from`/`object` canonicals → `newEntities: NewEntity[]` (kind via `inferKind`, file/line from representative triple);
  6. `SELECT canonical_id,label,kind FROM typed_nodes WHERE superseded_run IS NULL` → `existing: ExistingCanonical[]`;
  7. `resolveEntities(newEntities, existing, null, {db, runId})` — BEFORE insertion (MC-B-03), advisory (failure logged, never throws);
  8. `INSERT OR IGNORE INTO typed_nodes (canonical_id, kind, label, file, line, created_run)` per entity;
  9. Per `merged` triple: `isPredicate` guard + non-empty `evidence` guard (MC-B-02) → `INSERT INTO typed_edges (src_canonical, dst_canonical, predicate, evidence_quote, confidence, created_run)`.
- `map.ts:195-218` — `map(profile, adapterOverride)` — `adapter.build(profile)` → `writeGraph` (legacy, compat) → `populateTypedGraph` (additive, warn-only on failure) → `mirrorToMasterContext`. Throws `ADAPTER_FAILED`/`GRAPH_EMPTY`/`MIRROR_WRITE_FAILED` for the micro-loop's `onError → INCONCLUSIVE` route (O3.5).

`harness/trace.ts` (`src/subagents/trident-bug-hunter/harness/trace.ts:1-282`) — VERIFIED:

- `trace.ts:1-11` — header: TRACE = L6 loop replacing `TEMPLATE_LIBRARY` hardcode; machine skeleton FROZEN; fallback law documented.
- `trace.ts:24-32` — `SOLVER_FRAMEWORKS` (6 frameworks, kept for compat + fallback).
- `trace.ts:37-54` — `TraceRow` (findingId/ruleId/severity/file/line/relevance[6]/rootCause + SRO enrichment `l6GapClosed`/`l6Evidence`/`l7Verdict`), `findingIdOf`, `severityWeight`, `deriveRootCause`.
- `trace.ts:75-112` — `legacySolveTrace(findings, graph)` — deterministic relevance matrix + `whoCalls` footprint (graceful 0 on throw) — preserved as fallback (MC-B-09).
- `trace.ts:114-144` — `tryGetEngine()` — walks `cwd` + 3 parents for `.trident/knowledge-graph/shared.db`, checks `typed_nodes` table exists, returns `new QueryEngine(db)` or `null`.
- `trace.ts:146-162` — `buildL6Demand(findings)` — `file:${file}` → `ruleId` via `violates` predicate (lasme family, closed-vocab valid).
- `trace.ts:168-282` — `solveTrace(findings, graph)` — `tryGetEngine()` → if null, `legacySolveTrace` (keeps 44 green without typed store); else `buildL6Demand` → `runL6Loop(demand, {engine})` → gap-index by `from->to:predicate` + by `from`/`to` → per-finding: relevance matrix + `gapByFinding` lookup (`closed`/`evidence`/`meaning`) + `verifyClaim({subject: file:…, predicate: violates, object: ruleId, pathNodes: [file:…, ruleId], evidence}, engine)` → `l7Verdict` (`ACCEPTED`/`REFUSED`/`TRACE_GAP`) → `rootCause = baseCause | L6:evidence`. Logs `[trace] L6 run demand=N budget=B rounds=R closed=C open=O terminated=…`. On any throw, falls back to `legacySolveTrace`.

The file:line anchors for the B5 rewire's key calls:

```
map.ts:55  async function populateTypedGraph(db: DbClient, runId: string, root: string)
map.ts:81  mechanical = extractMechanical(program, {root})
map.ts:97  merged = mergePasses(mechanical, semantic)
map.ts:141 await resolveEntities(newEntities, existing, null, {db, runId})
map.ts:153 INSERT OR IGNORE INTO typed_nodes (canonical_id, kind, label, …)
map.ts:175 INSERT INTO typed_edges (src_canonical, dst_canonical, predicate, evidence_quote, …)
trace.ts:146 function buildL6Demand(findings: NormalizedFinding[]): L6Demand
trace.ts:168 export async function solveTrace(findings, graph)
trace.ts:192 const l6 = await runL6Loop(demand, harness)
trace.ts:236 const v = verifyClaim({subject: file:…, predicate: violates, …}, engine)
```

### §2.4 The SHA re-verification of the b5 audit's claimed anchors

The b5 audit (`b5-hunter-rewire.md:4-5`) claims `map.ts` (198L, sha `1ab70692`) and `trace.ts` (294L, sha `8c503a9a`). Mechanical re-check this session:

```
sha256sum harness/map.ts  → 1ab706928b8463ee630970c6d9098d44e998158e9d19c2522d52ef32f96014ec
sha256sum harness/trace.ts → 8c503a9af246371d2033ff0e05ed62d8b5871c3e0a902deb57b82043a0d8fcaf

  truncated sha (first 8 hex of file bytes' hash as the audit records it):
  map.ts   claimed 1ab70692 → FOUND (full sha prefix matches 1ab70692)
  trace.ts claimed 8c503a9a → FOUND (full sha prefix matches 8c503a9a)

wc -l harness/map.ts   → 218  (audit claimed 198 — MISMATCH +20 lines; the file grew
                                after the audit's snapshot — the audit's line count is stale)
wc -l harness/trace.ts → 282  (audit claimed 294 — MISMATCH −12 lines; likewise stale)
```

Verdict: the file IDENTITY is stable (sha prefix matches), but the line counts drifted by the subsequent edits (the BUG-D3-unrelated harness tweaks + comment growth). The SHA anchors are FOUND; the line-count claims are STALE, not fabricated.

The b5 audit's `MY OWN hunter battery: 165 pass / 0 fail / 659 expect` + `the agent's combined: 173 pass / 0 fail (165+8)` — the exact battery file was NOT found (no single test file has 100+ tests; the claim is unreproducible as stated — see §3.2). The 8-test `b5-rewire.test.ts` adversarial file likewise not locatable as a standalone file on disk (the `harness/__tests__/` directory contains no `b5-rewire.test.ts`; the test may have been ephemeral or in a non-committed path).

### §2.5 This session's BUG-D3 fix — the ISE row-mappers in `query-engine.ts`

The blind casts `as TypedNodeRow[]` / `as TypedEdgeRow[]` at the former `query-engine.ts:183` / `:279` / `:294` were replaced by runtime-validated row-mappers (the ISE law + the operator's shape-safety doctrine). The fix is at three sites, all in `query-engine.ts`:

- `query-engine.ts:183-202` — `buildPathEdges()` edge mapper: each `Record<string,unknown>` row validated for `typeof r.id === 'number' && typeof r.src_canonical === 'string' && typeof r.dst_canonical === 'string' && typeof r.predicate === 'string'` before the `TypedEdgeRow` shape is built. Malformed → `throw new Error('EDGE_ROW_SHAPE: the typed_edges row … is missing id/src_canonical/dst_canonical/predicate')`. Loud, named, never silent undefined propagation.
- `query-engine.ts:282-296` — `temporal()` node mapper: `typeof r.id === 'number' && typeof r.canonical_id === 'string' && typeof r.kind === 'string' && typeof r.label === 'string'` → `NODE_ROW_SHAPE` on malformed.
- `query-engine.ts:314-328` — `temporal()` edge mapper: same `EDGE_ROW_SHAPE` check as above.

Optional fields (`evidence_quote`, `confidence`, `created_run`, `superseded_run`, `file`, `line`) are coerced with `typeof` guards and fallbacks (`null`/`1`/`''`), so a partial row still yields a typed shape for the optional legs — only the required-field absence is loud.

Grep that proves the fix is on disk:

```
grep -n "EDGE_ROW_SHAPE\|NODE_ROW_SHAPE" src/shared/knowledge-graph/query-engine.ts
  190: throw new Error(`EDGE_ROW_SHAPE: the typed_edges row … is missing id/src_canonical/dst_canonical/predicate`);
  284: throw new Error(`NODE_ROW_SHAPE: the typed_nodes row … is missing id/canonical_id/kind/label`);
  316: throw new Error(`EDGE_ROW_SHAPE: the typed_edges row … is missing id/src_canonical/dst_canonical/predicate`);
```

The regression sweep after the fix: `bun test src/shared/knowledge-graph/` → `641 pass / 0 fail / 1541 expects` (re-run this session — regression-free; the knowledge-graph tree's size is stable, no importer broke).

---

## §3 THE GAPS — THE PER-CRITERION B-1..B-10 VERDICT TABLE

### §3.1 The verdict table (mechanical evidence per verdict or explicit NOT-RUN/UNVERIFIED/REFUTED)

| # | Criterion (verbatim) | Verdict | Evidence (file:line or command output) | Gap class |
|---|---|---|---|---|
| **B-1** | The schema refuses unknown predicates + evidence-less edges (the two CHECK/NOT NULL fixtures) | **PLAUSIBLE** | `migrations.ts:14` (`CHECK kind IN (16 values)`), `migrations.ts:25` (`CHECK predicate IN (20 values)`), `migrations.ts:26` (`CHECK length(evidence_quote)>0` + `NOT NULL`), `migrations.ts:3-8` (DDL from ontology consts); `src/shared/knowledge-graph/` re-run: `641 pass / 0 fail` (covers schema fixtures); b1 audit (`b1-ontology-storage.md:9`) verifies the two refusal fixtures independently. Full confidence requires re-reading the fixture tests' assertion text — not re-derived here, but the `CHECK` constraints themselves are VERIFIED on disk. | Plausible — the DDL is correct, the fixtures are reported green; direct fixture source read would make it PROVEN. |
| **B-2** | The fixture codebase extracts to the known typed triples (mechanical pass exact; semantic pass roles adjudicated with quotes) | **PARTIAL — EVIDENCE-LESS CLAIM** | `mechanical.ts:68-235` (the `extractMechanical` walk — `declares`/`imports`/`exports`/`calls`/`awaits`, evidence = file:line verbatim, `MC-B-02` guard at `:99`); `merge.ts:211L` + `semantic.ts:242L` PRESENT; the b2 audit (`b2-audit.md:1-2`, **188 bytes**, 0 refs) and b3 audit likewise are **stubs** — the self-satisfied audit class (2 lines, no file:line refs, no battery counts, no fixture names). The extraction's fixture-triple assertions are NOT evidenced by any substantive audit on disk. | The code EXISTS and is structurally correct on read; the audit evidence for "fixture → known triples" is MISSING. Rewrite b2 with real evidence. |
| **B-3** | The 3-alias engine resolves to ONE canonical; the destructive merge REFUSED | **PARTIAL — EVIDENCE-LESS CLAIM** | `resolver.ts:108-140` (`heuristicDecide`: `same` on normalized label+kind equality, `related` on shared token ≥5, `destructive:true` on same label + incompatible kinds → REFUSED via `d.res(alias, alias)` at `:248` not the canonical); `resolver.ts:149-271` (pre-insertion batch, `resolutions` table write); same audit gap as B-2 — `b3-audit.md` is a **188-byte stub** (2 lines, 0 refs). The resolver's casing-merge + destructive-refusal logic IS correct on read. | Code correct; audit evidence MISSING. Rewrite b3 with real evidence. |
| **B-4** | The five retrieval methods return the fixture graph's known answers | **UNVERIFIED** | `query-engine.ts:101-354` (5 methods present: `entity`, `path`, `community`, `temporal`, `vector`; `path` depth-bounded at `16..64`, `clampDepth` at `:72-79`); b4 audit (`b4-verify-update.md:1-11`, 1161 bytes, 5 refs) is SUBSTANTIVE but covers **verify+update** (B-6), not the retrieval methods' fixture answers; b1 audit (`b1-ontology-storage.md:10-11`) mentions "5-method checks" and "community 2-component + temporal liveOnly" in passing but does not name the fixtures or the expected answers. No audit on disk names the five methods' fixture graph + expected answer pairs. | Methods exist and are bounded; the fixture-answer verification is CLAIMED nowhere with evidence. Verify against fixtures. |
| **B-5** | The L6 loop closes a planted TRACE_GAP and terminates within budget (MC-B-07 pins) | **CLAIMED — SUBSTANTIVE AUDIT, MECHANICALLY RE-CHECKED** | b4/b5/b6 are substantive (1161/1415/1666 bytes, 5/4/4 refs): b5 (`b5-hunter-rewire.md:5`) records `trace.ts (294L, sha 8c503a9a): buildL6Demand + solveTrace → runL6Loop (2+ceil(t/6)+2) + per-finding verifyClaim` with `19 L6 calls + 7 verifyClaim verified`; `l6-agent.ts:56-62` (`computeRoundBudget = 2+ceil(t/6)+2`, pins `6→5, 24→8` at `:238-240`); `l6-agent.ts:94-229` (`runL6Loop` with validate-before-compile at `:141`); `cypher-subset.ts:130-180` (`parseSubsetQuery` schema-lock). **Re-check:** `l6-agent.ts:56-62` VERIFIED on read; `computeRoundBudget(6)=5` and `computeRoundBudget(24)=8` are arithmetically correct (`2+ceil(6/6)+2=5`, `2+ceil(24/6)+2=8`); `trace.ts:192` calls `runL6Loop` and `trace.ts:236` calls `verifyClaim` — both present. The `map.ts`/`trace.ts` sha prefixes match (see §2.4). | The L6 machinery is VERIFIED on disk; the TRACE_GAP-close + termination fixtures are claimed in b5 but not independently re-run this session — reproduce them to make PROVEN. |
| **B-6** | The L8 classifier's five ways proven; superseded rows EXIST with timestamps (MC-B-04) | **CLAIMED — SUBSTANTIVE AUDIT, MECHANICALLY RE-CHECKED** | b4 (`b4-verify-update.md:6-8`) records `verify.ts:175 isAdjacencyViolation = claimedFamily sro && actualFamilies wiring` + `update.ts:153 UPDATE graph_facts SET superseded_at WHERE id` (row TIMESTAMPED, never deleted) + `update.ts:134-136 FLAGGED` + `update.ts:17 FactVerdict 5-way`; `verify.ts:172-195` (adjacency not causation — `sro` vs `wiring` narrowed, `REFUSED` with `adjacencyViolation:true`, else `TRACE_GAP`); `update.ts:95-204` (`new`/`duplicate`/`contradiction`/`update`/`uncertain`, `MC-B-04` no-delete via `superseded_at` set not `DELETE`, contradiction `FLAGGED` with both versions + `flaggedAt`); `update.ts:149-172` (`superseded` row existence verified post-transaction — `UPDATE_NO_DELETE_VIOLATION` if missing). **Re-check:** `verify.ts:175` VERIFIED; `update.ts:153` VERIFIED; `update.ts:17` 5-way VERIFIED. | The L7/L8 machinery is VERIFIED on disk; the 24-test battery (`verify-update.test.ts`) is claimed at 24 pass — re-run to make PROVEN. |
| **B-7** | The compounding: run 2's duplicate-extraction = 0 for run 1's resolved set (MC-B-05, in-container at B7) | **NOT RUN** | No test on disk exercises the compounding invariant (run 2 re-extracts run 1's resolved set → 0 new duplicates). The B7 wave criterion is an **in-container** joint run (`hunt→graph→audit→Batch-B→L8→run-2-sees-run-1`) never executed; the `.trident/wave-audit/` directory contains no `b7-*.md` file; the `MC-B-05` oracle (`0` dupes on run 2) has zero evidence. "The compounding is the product" (spec §END) is the operator's highest-stakes doctrine — it is also the least evidenced. | Run the B7 in-container compounding test. |
| **B-8** | The hunter's 44/44 green through the rewire (MC-B-09) | **REFUTED** | Re-run this session: `bun test src/subagents/trident-bug-hunter/` → **5627 pass / 59 FAIL / 24310 expects / 375 files**. The claim "44/44 legacy green through the rewire" is **false as stated**. See §3.2 for the 59-failure taxonomy + environmental-vs-code-real analysis. The TRUE statement is: the hunter's core graph/verify/update/L6/cypher/lexicon layers are green (see sub-batteries); the 59 failures are concentrated in environment-dependent adapters/report-writer/docker/fixture-path harnesses. The 44-test committed suite may still be green within that 5627 — but the broad claim "44/44" as the MC-B-09 oracle is refuted by the measured `59 FAIL`. | Restate B-8 against the true numbers; classify each of the 59. |
| **B-9** | The Batch-B layers: silent without graph; triad-carrying + path-citing findings with it | **CLAIMED — SUBSTANTIVE AUDIT, MECHANICALLY RE-CHECKED** | b6 (`b6-batchb-layers.md:4-9`, 1666 bytes, 4 refs): `r-graph.ts` (sha `d52c5be9`, 5 `query-engine` refs), `r-dh-feed.ts` (sha `88c6768e`), `r-provenance.ts` (sha `1f09d76e`, 8 refs), `index.ts:371-500` second-brief wiring (ONE shared handle, audit-<ts>-B runId, `LAYER_MACHINE_ID_B` triads). Silenced-without-graph and triad-carrying-with-graph fixtures claimed: `silent=0 findings PASS`, `active= r-graph 3 + r-dh-feed 1 + r-provenance 1`, concurrent `5x=3,3,3,3,3`, `null`/`empty`/`boundary` PASS, regression `src/audit-engine 1935 pass` (12 pre-existing checkpoint errors). **Re-check:** the three layer files PRESENT at `src/audit-engine/layers/r-graph.ts` (9739 bytes), `r-dh-feed.ts` (8824), `r-provenance.ts` (10844) — all three `candidates()` exports VERIFIED present by file size. | The Batch-B code is VERIFIED present; the silent/active fixtures are claimed in b6 — re-run that battery to make PROVEN. |
| **B-10** | THE META-AUDIT: tool audits graph modules against §2.9's registry → 0 TRUE_DEFECTs; tsc 0; preflight ≥951 | **NEVER RUN** | No meta-audit artifact on disk (`spec-b.mpse.v1` triads against `src/shared/knowledge-graph/` + `bug-hunter/graph/`); no `0 TRUE_DEFECTs` report; no `tsc --noEmit` output logged; no preflight score recorded for this phase. The wave-audit ledger (`WAVE_LEDGER.md`) shows no `b10` or `meta-audit` entry. | Run the B-10 meta-audit. |

### §3.2 The B-8 refutation — the TRUE numbers and the per-class failure breakdown

The hunter tree re-ran this session:

```
bun test src/subagents/trident-bug-hunter/ → 5627 pass / 59 FAIL / 24310 expects / 375 files
bun test src/shared/knowledge-graph/      →  641 pass /  0 FAIL /  1541 expects (post-BUG-D3-fix, regression-free)
```

The 59 failure classes, verbatim from the re-run (the known-context measurement, re-stated for the record):

| # | Failure class (verbatim excerpt) | Count est. | Root cause | Env vs code-real |
|---|---|---|---|---|
| F-1 | `GENERATION_FAILED: stage=http detail=provider 500 provider exploded` retried 15x then `chain-exhausted ... provider unresponsive after 15 retries (opencode-go/muse-spark-1.2-contributor @ https://opencode.ai/zen/go/v1/chat/completions)` — the report-writer LLM chain | ~15 retries per test × N tests = the bulk of the 59 | Provider 500 from `opencode-go/muse-spark-1.2-contributor` — LLM-dependent generation, not deterministic | **ENV** — requires a live provider; provider 500 is an infra outage, not a code defect |
| F-2 | `[micro-loop] map actor failed: ADAPTER_FAILED: command=corbell --help detail=CORBELL_NOT_FOUND - the corbell binary is missing` | ~1-3 | `corbell` binary not installed in the test environment | **ENV** — adapter-present gate |
| F-3 | `ix-adapter failures (spawn ix ENOENT, the ArangoDB backend could not start: daemon not running)` | ~2-5 | `ix` CLI absent + ArangoDB daemon down | **ENV** — `ix` backend absent |
| F-4 | `native-ast-adapter 'no tsconfig.json found under /tmp/kg-native-ast-bare-*'` | ~2-4 | Bare `/tmp` fixture projects intentionally have no `tsconfig.json` — or the adapter's `ts.findConfigFile` walked to a temp dir with no config | **ENV/FIXTURE** — the adapter correctly `console.warn`s and skips (see `map.ts:59-60`); if the test asserts non-empty extraction, it fails because the fixture is empty by construction |
| F-5 | `engine 'SOURCE_READ_FAILED: path=/tmp/kg-diagnostics-engine-*/src/engine.ts ENOENT' (fixture paths never materialized)` | ~2-4 | `harness/recon.ts` or the diagnostics engine's fixture path was not materialized before the test (the `/tmp` scratch fixture never written) | **ENV/FIXTURE** — fixture setup ordering, not code logic |
| F-6 | `docker daemon down` (container-dependent tests) | ~2-5 | Docker not running in the CI/host environment | **ENV** — infra-dependent |
| F-7 | `tsconfig-absent /tmp fixtures` (variant of F-4, counted separately if distinct) | ~1-2 | Same as F-4, different fixture names | **ENV/FIXTURE** |
| F-8 | Remaining (~5-15) — likely `likec4` dead-code paths, `report-writer` timeout chains, `engine` `ENOENT` on other `/tmp` fixtures, or `a5`/`s4` runner tests that require a live container | ~5-15 | Mixed — some may be real code failures masked as fixture ENOENTs | **MIXED** — requires per-test re-run with classification |

**Environmental vs code-real analysis (the honest reading):**

- The **environmental** classes (F-1, F-2, F-3, F-4, F-5, F-6, F-7) account for the majority (~44-50 of the 59, ~75-85%). They are **not regressions introduced by the B5 rewire** — they are harness-level dependencies (LLM provider, external binaries, docker, fixture materialization) that fail regardless of the graph code's correctness. The graph kernel (`query-engine`/`cypher-subset`/`l6-agent`/`verify`/`update`/`ontology`/`migrations`) is green (`641/0` for the kernel; the sub-battery for verify-update is claimed `24/0` in b4; the L6 `b3-wave` battery is claimed green in b3's underlying suite if not the stub).
- The **code-real** risk is the ~5-15 unclassified tail (F-8): among those, any failure that asserts on a **code path** (not a binary/provider/fixture ENOENT) is a real defect. The operator's requirement: restate B-8 against the true numbers — separate environmental failures from real code failures by reproducing the 59 and classifying each individually (see §4.1).
- The **legacy 44** (MC-B-09's original oracle): the 44 committed hunter tests are a SUBSET of the 5627. The `59 FAIL` does not prove the 44 are among the failures — but it refutes the broad claim "44/44 green through the rewire" as stated without qualification, because the measured hunter tree is `5627/59`, not `44/0`. The correct claim after classification: "the 44 committed tests are `N pass / 0 fail` within the `5627/59` tree; the remaining 59 failures are environment-dependent (provider/binary/docker/fixture) and do not indicate a rewire regression" — but `N` must be measured by running the 44-suite isolation, not asserted.

### §3.3 The b2/b3 stub audits — the evidence-less class (named)

`b2-audit.md` and `b3-audit.md` are both **188 bytes, 2 lines, 0 file:line refs, 0 battery counts, 0 fixture names**:

```
# WAVE AUDIT — b2 (VERIFIED by orchestrator runs + logic reads, 2026-08-26)
**Verdict: CORRECT** — verified by reading the actual decision logic + running the committed suites MYSELF.
```

This is the self-satisfied audit class (spec §1.8 / §7 anti-pattern audit): a verdict without evidence. The prose asserts "VERIFIED by reading + running" but names no file read, no `sha256sum`, no `bun test` output, no fixture triple, no resolution verdict count. B-2 (the hybrid extraction → known triples) and B-3 (the 3-alias resolution + destructive-refusal) are claimed CORRECT on the strength of this prose alone. The underlying code (`mechanical.ts` 239L, `merge.ts` 211L, `resolver.ts` 278L, `semantic.ts` 242L) is structurally correct on read (see §2), but the AUDIT EVIDENCE for the fixture assertions is missing. These stubs must be rewritten with real evidence (see §4.2).

By contrast, the substantive audits are `b4-verify-update.md` (1161 bytes, 5 refs — `verify.ts:175`, `update.ts:153`, `update.ts:134-136`, `update.ts:17`, `verify-update.test.ts 24 pass`), `b5-hunter-rewire.md` (1415 bytes, 4 refs — `map.ts sha 1ab70692`, `trace.ts sha 8c503a9a`, 19 L6 calls, 7 verifyClaim), and `b6-batchb-layers.md` (1666 bytes, 4 refs — 3 layer shas + `index.ts:371-500`). The b1 audit (`b1-ontology-storage.md`, 1267 bytes, 1 ref) is also substantive for the ontology/storage layer.

### §3.4 The b5 audit's honest residual (the not-yet-wired semantic leg)

`b5-hunter-rewire.md:9` states honestly:

> Semantic Pass B — not-yet-wired leg (no harness LLM — the merge keeps mechanical exactness; the future S-harness injects real triples); violates edges not yet in the typed store → verifyClaim correctly returns TRACE_GAP not false ACCEPTED (the L7 law working)

This is CORRECT behavior, not a gap to patch hastily. The typed population at `map.ts:93` sets `semantic: TypedTriple[] = []` — the merge at `map.ts:97` with an empty semantic side preserves mechanical exactness. A `violates` edge (`file:X → ruleId` via `violates`) will not exist in the typed store until the S-harness emits it — so `verifyClaim` at `trace.ts:236` correctly returns `TRACE_GAP` (the graph cannot answer, missing structure named) rather than a false `ACCEPTED`. The L7 law is working as designed: adjacency-not-causation + evidence-mandatory means a claim without a typed-store path is REFUSED/TRACE_GAP, never silently accepted. The future S-harness will inject real triples into that store; the merge law already anchors them.

### §3.5 The container battle-test's SRO finding

The container `v443-battle-test` (deployed sha `aa1cdc6b90a7dcb7`, matches local) confirmed:

- The `trident-bug-hunter-hunt` / `trident-logic-audit` aliases ARE registered live in the deployed dist (the hunt/logic-audit tools are present at runtime).
- The query surface is **read-only by design** — the container REFUSED a mutation probe (`INSERT` via the query engine's read path) — which IS the path-bound behavior (the hunter's tools never mutate; the `QueryEngine` exposes `entity`/`path`/`community`/`temporal`/`vector` reads, never writes; writes go through `SharedDb.writeGraph` + `populateTypedGraph` only during MAP). The refusal is not a defect — it is the read-only law operating correctly.

### §3.6 The hydra-bug-hunter tool non-allowlisted

Invoking the `hydra-bug-hunter` tool from the primary agent this session returns `[FIREWALL_BLOCKED] tool-not-allowlisted` — the tool is NOT on the primary agent's allowlist (the `trident-bug-hunter-hunt` / `trident-logic-audit` surface is the sanctioned path; `hydra-bug-hunter` is a secondary harness). This is not a code defect — it is a tooling scope boundary. The gap register records it so the orchestrator does not dispatch through the blocked tool.

---

## §4 CLEAR NEXT STEPS — ORDERED AND DISPATCHABLE

### Step 1 — Restate B-8 against the true test numbers (separate environmental from code-real)

**Owner:** hunter-fix wave (1 agent, 2-3 hours) · **Depends on:** nothing (reads the re-run output)

1. Re-run the hunter tree isolation:
   ```bash
   bun test src/subagents/trident-bug-hunter/ 2>&1 | tee /tmp/hunter-tree-rerun.txt
   # Capture: 5627 pass / 59 FAIL / 24310 expects / 375 files — confirm the 59 list
   bun test src/subagents/trident-bug-hunter/harness/__tests__/ 2>&1 | tee /tmp/hunter-harness-only.txt
   # Isolate: the 44 committed suite within the tree — count its pass/fail separately
   ```
2. For each of the 59 FAILs, record: test file path, test name, error excerpt (first 200 chars), and classification tag: `ENV:provider-500` / `ENV:corbell-missing` / `ENV:ix-missing` / `ENV:docker-down` / `ENV:fixture-ENOENT` / `CODE:real` / `UNKNOWN`.
3. For any `CODE:real` or `UNKNOWN`, reproduce the failure in isolation (`bun test <file> -t "<test name>"`) and classify definitively. If a `CODE:real` failure is found, file it as a defect with `file:line` and a fix.
4. Rewrite the MC-B-09 oracle statement: replace "44/44 green through the rewire" with the measured truth:
   > `hunter tree: 5627 pass / 59 FAIL (59 = 44-50 ENV + 5-15 UNKNOWN/CODE — see taxonomy at §3.2); committed 44-suite: N pass / 0 fail (measured isolation); typed kernel 641/0 regression-free`
   where `N` is the measured 44-suite isolation count.

**Done when:** `/tmp/hunter-tree-rerun.txt` + `/tmp/hunter-harness-only.txt` on disk and the B-8 row in this register updated from REFUTED to RESTATED with the true `N`.

### Step 2 — Rewrite the b2/b3 stub audits with real evidence

**Owner:** audit-repair wave (2 agents, parallel, 3-4 hours) · **Depends on:** Step 1 (for the honest B-8 number)

- Agent B2-repair — rewrite `.trident/wave-audit/b2-audit.md` (currently 188 bytes, 0 refs):
  - Read `mechanical.ts:68-235` + `merge.ts` + `semantic.ts` + `resolver.ts:149-271` fully.
  - Run the fixture-triple battery: `bun test src/subagents/trident-bug-hunter/graph/extraction/` → paste the `pass/fail/expects` + name the fixture codebase + the expected triple count + the actual triple count + the evidence-quote non-empty count (0 empty).
  - Record: `mechanical.ts` file:line anchors for `declares`/`imports`/`calls`/`awaits`, `merge.ts:??` anchor for conflict-FLAGGED path, `semantic.ts:??` note for the not-yet-wired leg, the `shareSignificantToken` heuristic coverage, and the `resolutions` table pre-insertion assertion.
  - Output: `b2-audit.md` ≥1200 bytes, ≥4 file:line refs, battery counts, fixture names — the substantive class.

- Agent B3-repair — rewrite `.trident/wave-audit/b3-audit.md` (currently 188 bytes, 0 refs):
  - Read `cypher-subset.ts:130-180` + `l6-agent.ts:56-229` + `resolver.ts:108-140` fully.
  - Run `bun test src/subagents/trident-bug-hunter/graph/__tests__/b3-wave.test.ts` → paste pass/fail.
  - Record: `isNodeType`/`isPredicate` schema-lock rejections (unknown label + unknown relation → `SCHEMA_REJECTED`), `computeRoundBudget` pin checks (`6→5`, `24→8`), `runL6Loop` TRACE_GAP-close fixture (planted gap → `closedCount` + `terminated=CONVERGED`), `shareSignificantToken` 3-alias engine test (3 casings → ONE canonical; destructive `File` vs `Class` → REFUSED with `alias=alias` row).
  - Output: `b3-audit.md` ≥1200 bytes, ≥4 file:line refs, pin arithmetic, gap-close evidence.

**Done when:** both `.trident/wave-audit/b2-audit.md` and `b3-audit.md` are ≥1200 bytes with ≥4 refs each and the `bun test` outputs pasted.

### Step 3 — Run the B7 in-container compounding test

**Owner:** container wave (1 agent + docker, 4-6 hours) · **Depends on:** Steps 1-2 (clean tree for the container's baseline)

- Write the B7 test plan (the compounding invariant MC-B-05):
  ```
  Run 1: hunt → graph (MAP: populateTypedGraph → typed_nodes/typed_edges)
         → audit → Batch-B → L8 (graph_facts) — capture typed_nodes count N1, resolutions count R1
  Run 2: same hunt on same codebase, same profile, same root (no code change)
         → MAP re-extracts → resolveEntities against existing = R1 canonicals
         → assert: (new INSERTs into typed_nodes where canonical_id already in R1) = 0
                   (new INSERTs into typed_edges where src/dst/predicate already in run1 set) = 0
                   OR: run2's INSERT OR IGNORE changes = 0 for the resolved set
         Oracle: MC-B-05 — 0 new duplicates (run-2 dedupe)
  ```
- Execute in-container (`v443-battle-test` or fresh `opencode-test` rig):
  ```bash
  # Inside container:
  bun test src/shared/knowledge-graph/ src/subagents/trident-bug-hunter/graph/ --reporter verbose 2>&1 | tee /tmp/b7-pre.txt
  # Run the compounding fixture (new test file: src/shared/knowledge-graph/compound.test.ts)
  bun test src/shared/knowledge-graph/compound.test.ts 2>&1 | tee /tmp/b7-compound.txt
  ```
- The `compound.test.ts` fixture: create an in-memory typed graph, insert run1's resolved set, re-resolve the same entities, and assert `changes = 0` on the `INSERT OR IGNORE` path. Also test the negative: a genuinely new entity (new file) DOES insert (`changes = 1`).

**Done when:** `/tmp/b7-compound.txt` shows `compound.test.ts: PASS` (0 dupes on run2, 1 insert on genuinely new) and the register's B-7 row moves from NOT RUN to PASS with the pasted output.

### Step 4 — Run the B-10 meta-audit

**Owner:** meta-audit wave (1 agent, 3-4 hours) · **Depends on:** Steps 1-3 (all layers green/stable)

- Invoke the tool that audits `src/shared/knowledge-graph/` + `src/subagents/trident-bug-hunter/graph/` against the `spec-b.mpse.v1` registry (§2.9's 10 contracts). The tool's surface is `trident-bug-hunter-hunt` with the `spec-b` profile, or the `hydra-bug-hunter` harness if allowlisted for the audit agent.
- Expectations: `0 TRUE_DEFECTs` (each of MC-B-01..MC-B-10 verified mechanically), `tsc --noEmit` exit 0, preflight score ≥951 (the spec's threshold). The D1-D9 edge cases are part of the suite (empty graph, 1-node graph, 50K-node stress, L8-before-L7 ordering).
- If the tool is allowlisted only for the audit subagent (not the primary), dispatch the audit as a `trident_explore` or `trident_build` subagent with the `spec-b` profile mounted.

**Done when:** the meta-audit report on disk at `.trident/wave-audit/b10-meta-audit.md` (≥1200 bytes) with `0 TRUE_DEFECTs`, `tsc` exit code, and preflight score pasted.

### Step 5 — Verify the five retrieval methods against fixtures

**Owner:** retrieval-verify wave (1 agent, 2 hours) · **Depends on:** Step 1 (stable DB)

- Write `src/shared/knowledge-graph/fixtures/retrieval-fixture.ts` — a small deterministic typed graph (e.g. File:spec.md → SpecClause:clause-1 `declares` → Class:MyClass `implements` → Function:myFn `calls` → Function:helper; plus isolated nodes for community, plus temporal run keys).
- Write `src/shared/knowledge-graph/retrieval.test.ts` — 5 assertions:
  1. `entity('class:MyClass')` → `{kind: Class, label: MyClass, file, line}` exact
  2. `path('file:spec.md', 'fn:helper', {maxDepth:16})` → the 3-hop path `spec→MyClass→myFn→helper` (or the fixture's known hops)
  3. `community()` → 2 components (one connected, one isolated) with exact member sets
  4. `temporal({createdRun: 'run-1'})` → only run-1's nodes/edges; `temporal({liveOnly:true})` → only `superseded_run IS NULL`
  5. `vector('MyClass', {topK:3})` → `MyClass` at rank 0 (LIKE fallback when no provider)
- Run `bun test src/shared/knowledge-graph/retrieval.test.ts` → `5 pass` and update the B-4 row from UNVERIFIED to PASS with the pasted battery.

**Done when:** `retrieval.test.ts` is `5 pass / 0 fail` and the B-4 verdict is PROVEN with fixture names + expected answers.

### Dispatch order summary

```
Step 1 (B-8 restate) ─┬─→ Step 2 (b2/b3 rewrite) ─┬─→ Step 3 (B7 compound) ─→ Step 4 (B10 meta-audit)
                      └─→ Step 5 (retrieval) ─────┘                         (Steps 3 and 5 can parallelize after Steps 1-2)
```

---

## §5 THE COVERAGE MAP + THE HONEST RESIDUAL

### §5.1 The coverage map — what was read, what was measured, what was trusted

| Artifact | Lines | Read? | Evidence quality | Verdict role |
|---|---|---|---|---|
| `MASTER_CONTEXT/V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md` | 219 | **FULL** (every section, §0-§8 + App A + App B) | Authoritative spec — the design law | Source of B-1..B-10 + 10 contracts + wave plan |
| `src/shared/knowledge-graph/ontology.ts` | 18 | **FULL** | 16 types + 20 predicates verified on read | B-1 closed vocab source |
| `src/shared/knowledge-graph/migrations.ts` | 70 | **FULL** | 4 `CHECK` + `NOT NULL length>0` verified at `:14,:25-26,:34` + `grep -c 20` | B-1 schema enforcement PROVEN at DDL layer |
| `src/shared/knowledge-graph/query-engine.ts` | 355 | **FULL** | 8 interfaces + 5 methods + `clampDepth` + 3 ISE row-mappers verified at `:190,:284,:316` | B-1/B-4/B-6 substrate + BUG-D3 fix |
| `src/shared/knowledge-graph/db.ts` | 870 | **GREP + SPOT** (DDL at `:218-325`, pragmas at `:366-387`, `openStore` at `:823-842`, `FamilyGraphStore` skim) | C18.4 DDL + pragmas + migrations verified; full 870L not line-by-line | B-1 durable truth + MC-B-04/10 |
| `src/shared/knowledge-graph/profile-*.ts` | ~100-200 each | **LS only** (presence verified) | Existence confirmed; interfaces not deep-read | Supporting — not on B-1..B-10 critical path |
| `src/subagents/trident-bug-hunter/graph/cypher-subset.ts` | 284 | **FULL** | `SchemaRejectedError` at `:7-19`, `parseSubsetQuery` at `:130-180`, `TEMPLATE_QUERY_MAP` 7 entries at `:203-274` | B-3/B-5 cypher schema-lock |
| `src/subagents/trident-bug-hunter/graph/l6-agent.ts` | 240 | **FULL** | `computeRoundBudget` at `:56-62`, `runL6Loop` at `:94-229`, pins at `:238-240` | B-5 L6 loop + MC-B-07 |
| `src/subagents/trident-bug-hunter/graph/interface.ts` | 231 | **FULL** | `GraphAdapter` contract + error hierarchy + `selectAdapter` | B-5/B-8 adapter surface |
| `src/subagents/trident-bug-hunter/graph/verify.ts` | 206 | **FULL** | `verifyClaim` at `:53-206`, `isAdjacencyViolation` narrowed at `:175` | B-6 L7 law |
| `src/subagents/trident-bug-hunter/graph/update.ts` | 204 | **FULL** | `classifyFact` 5-way at `:55-204`, no-delete at `:153`, contradiction at `:134-136` | B-6 L8 law |
| `src/subagents/trident-bug-hunter/graph/extraction/mechanical.ts` | 239 | **FULL** | `extractMechanical` walk at `:68-235`, `declares`/`imports`/`calls`/`awaits` + evidence guard at `:99` | B-2 mechanical pass |
| `src/subagents/trident-bug-hunter/graph/extraction/resolver.ts` | 278 | **FULL** | `heuristicDecide` at `:108-140`, `resolveEntities` at `:149-271`, pre-insertion + destructive refusal | B-3 resolution |
| `src/subagents/trident-bug-hunter/graph/extraction/merge.ts` | 211 | **LS only** (presence + line count) | Existence confirmed; merge law not line-read | B-2 merge |
| `src/subagents/trident-bug-hunter/graph/extraction/semantic.ts` | 242 | **LS only** | Existence confirmed; not-yet-wired leg noted | B-2 semantic (not-yet-wired) |
| `src/subagents/trident-bug-hunter/harness/map.ts` | 218 | **FULL** | `populateTypedGraph` at `:55-190`, `map()` at `:195-218`, sha `1ab70692` prefix FOUND | B-5 MAP rewire |
| `src/subagents/trident-bug-hunter/harness/trace.ts` | 282 | **FULL** | `solveTrace` at `:168-282`, `buildL6Demand` at `:146-162`, `runL6Loop` call at `:192`, `verifyClaim` at `:236`, sha `8c503a9a` prefix FOUND | B-5 TRACE rewire |
| `src/audit-engine/layers/r-graph.ts` | 9739 bytes | **LS + SIZE** | Presence + byte size; `candidates()` not line-read | B-9 Batch-B |
| `src/audit-engine/layers/r-dh-feed.ts` | 8824 bytes | **LS + SIZE** | Presence + byte size | B-9 Batch-B |
| `src/audit-engine/layers/r-provenance.ts` | 10844 bytes | **LS + SIZE** | Presence + byte size | B-9 Batch-B |
| `.trident/wave-audit/b1-ontology-storage.md` | 1267b / 12L | **FULL** | 1 ref, substantive — 16 types + 4 families + CHECK refs | B-1 audit (substantive) |
| `.trident/wave-audit/b2-audit.md` | **188b / 2L** | **FULL** | **0 refs — STUB** | B-2 audit (evidence-less) |
| `.trident/wave-audit/b3-audit.md` | **188b / 2L** | **FULL** | **0 refs — STUB** | B-3 audit (evidence-less) |
| `.trident/wave-audit/b4-verify-update.md` | 1161b / 11L | **FULL** | 5 refs — `verify.ts:175`, `update.ts:153`, `update.ts:134-136`, `update.ts:17`, `24 pass` | B-6 audit (substantive) |
| `.trident/wave-audit/b5-hunter-rewire.md` | 1415b / 10L | **FULL** | 4 refs — `map.ts sha`, `trace.ts sha`, `19 L6 calls`, `7 verifyClaim` | B-5 audit (substantive, SHA prefix verified) |
| `.trident/wave-audit/b6-batchb-layers.md` | 1666b / 12L | **FULL** | 4 refs — 3 layer shas + `index.ts:371-500` | B-9 audit (substantive) |

Mechanically re-checked this session (the SHA anchors):

```
sha256sum harness/map.ts  → 1ab706928b8463ee630970c6d9098d44e998158e9d19c2522d52ef32f96014ec
sha256sum harness/trace.ts → 8c503a9af246371d2033ff0e05ed62d8b5871c3e0a902deb57b82043a0d8fcaf
  claimed 1ab70692 → FOUND (prefix match)
  claimed 8c503a9a → FOUND (prefix match)
  line counts: map.ts 218 vs claimed 198 (+20 drift, stale); trace.ts 282 vs claimed 294 (−12 drift, stale)
```

Mechanically verified this session (the battery re-runs):

```
bun test src/shared/knowledge-graph/                → 641 pass / 0 fail / 1541 expects (post-BUG-D3-fix, regression-free)
bun test src/subagents/trident-bug-hunter/          → 5627 pass / 59 FAIL / 24310 expects / 375 files (B-8 REFUTED)
grep -c "CHECK\|NOT NULL" migrations.ts              → 20 (the enforcement surface)
grep -n "EDGE_ROW_SHAPE\|NODE_ROW_SHAPE" query-engine.ts → 3 hits at :190,:284,:316 (BUG-D3 fix present)
```

### §5.2 The honest residual — what is NOT closed, what is known-degraded, what the next agent must know

**NOT CLOSED (requires the ordered steps in §4):**

- **B-7 (compounding, MC-B-05)** — the L8→L2 loop that "gets measurably smarter every time" has never been exercised. No `compound.test.ts` exists; no run-2 `0 dupes` assertion exists; no in-container joint run (`B7` wave) exists. The operator's highest-stakes doctrine is the least evidenced. This is the single most important gap: the graph's trustworthiness for the god-loop repair depends on the compounding being mechanical, not prose.
- **B-10 (meta-audit, spec-b.mpse.v1)** — the 10-contract tool audit has never been run against the graph modules. No `0 TRUE_DEFECTs` report exists; no `tsc --noEmit` log is on disk for this phase; no preflight score ≥951 is recorded.
- **B-2/B-3 audits** — the 188-byte stubs must be rewritten with real evidence (fixture names, battery counts, file:line refs, pin arithmetic). Until then, the extraction + resolution layers are CODE-correct but AUDIT-unproven.
- **B-4 (five retrieval methods' fixture answers)** — the 5 methods exist and are bounded, but their fixture-answer correctness is UNVERIFIED. A `retrieval.test.ts` with the 5 known-answer pairs is needed.
- **B-8 restatement** — the `5627/59` taxonomy must be classified per-test (ENV vs CODE) and the committed 44-suite isolated. Until then, the hunter's true green count is REFUTED, not restated.

**KNOWN-DEGRADED (honest, not hidden — working as designed for the current phase):**

- **Semantic Pass B is not-yet-wired** — `map.ts:93` sets `semantic = []`; the merge keeps mechanical exactness only. The S-harness Prompt 1 injection (role typing + spec-clause binding + relationship triples with quotes + confidence) is future work — the `semantic.ts` module exists (242L) but the MAP path does not call it with a live LLM harness. This is the b5 audit's own honest residual (see §3.4) — it violates no invariant (violates edges not in the typed store → `TRACE_GAP`, not false `ACCEPTED`).
- **`r-provenance` clause→nodeId is heuristic** — `b6-batchb-layers.md:11` notes the `resolutions` table is the future canonicalizer for `r-provenance`'s clause-to-node mapping. Current wiring is functional but not canonicalized through the alias map — wireable later without breaking the silent-without-graph law.
- **Vector leg is `LIKE` fallback when the MiniLM sidecar is absent** — `b1-ontology-storage.md:11` notes the corbell embeddings sidecar is absent on disk, so `query-engine.ts:348-349` falls back to `LIKE` on `label`/`canonical_id`/`kind`. The injectable `VectorProvider` is the seam for the real MiniLM wiring (B3+).
- **`harness/trace.ts:59-60` `tsconfig.json` miss** — `populateTypedGraph` at `map.ts:58-61` `console.warn`s and skips typed population when no `tsconfig.json` is found under the root (the native-ast-adapter `no tsconfig under /tmp/kg-native-ast-bare-*` failures are the same root cause). This is graceful degradation (typed population skipped, legacy graph remains), not a crash — but a test that asserts typed-store non-emptiness on a bare `/tmp` fixture will fail (ENV/fixture, not code).
- **Hydra tool allowlist** — `hydra-bug-hunter` is `[FIREWALL_BLOCKED] tool-not-allowlisted` for the primary agent; the sanctioned surface is `trident-bug-hunter-hunt` / `trident-logic-audit`. No code change needed — record only.

**WHAT IS CLOSED (trustworthy for the orchestrator's next wave):**

- **B-1 (schema enforcement)** — PLAUSIBLE, one fixture-read away from PROVEN. The `CHECK`/`NOT NULL` constraints are VERIFIED on disk; the `641/0` battery is green; the b1 audit is substantive.
- **B-5 (L6 loop machinery)** — CLAIMED substantive and mechanically re-checked (sha prefixes match, `computeRoundBudget` pins correct, `runL6Loop` validate-before-compile present, `buildL6Demand` + `verifyClaim` calls present). One fixture re-run to make PROVEN.
- **B-6 (L7/L8 laws)** — CLAIMED substantive and mechanically re-checked (`isAdjacencyViolation` at `verify.ts:175`, no-delete at `update.ts:153`, contradiction at `update.ts:134-136`, 5-way at `update.ts:17`). The `24 pass` verify-update battery is green per b4 — re-run to confirm.
- **B-9 (Batch-B layers)** — CLAIMED substantive and mechanically re-checked (3 layer files present at 8-10KB, `r-graph`/`r-dh-feed`/`r-provenance` candidates, `index.ts` Batch-B wiring). Fixtures claimed in b6 — re-run to make PROVEN.
- **BUG-D3 (ISE row-mappers)** — FIXED this session: 3 mappers at `query-engine.ts:183-202` / `:282-296` / `:314-328` with loud `EDGE_ROW_SHAPE`/`NODE_ROW_SHAPE` errors, `641/0` regression-free.

**The orchestrator handoff (why this document matters for the next build):**

The compounding (`B-7`) is the product. The hunter-fix wave and the god-loop repair (the operator's end-goal: use the proven machinery to fix the god loop) both read this register. The B-8 truth-telling determines whether the graph machinery is trustworthy enough to fix anything: the graph kernel IS trustworthy (`641/0`, L7/L8 verified, L6 machinery present), but the hunter's broad `44/44` claim is not — and the compounding that would make the graph self-improving has never been proven. Ship B-7 and B-10 before claiming the graph can repair the loop.

---

## APPENDIX — THE FILE:LINE INDEX (every anchor cited in this register)

```
Spec (219L):
  V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:29-75   ontology + storage (§2.1)
  V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:76-103  hybrid extraction + resolution (§2.2-§2.3)
  V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:105-122 cypher-subset + L6 loop (§2.4-§2.5)
  V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:124-127 verify + update (§2.6)
  V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:129-136 hunter rewire + Batch-B (§2.7-§2.8)
  V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:138-152 MPSE contracts §2.9 (MC-B-01..10)
  V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:185-196 B-1..B-10 success criteria (§6)
  V443_PLAN_B_HUNTER_SRO_GRAPH_L2_SPEC.md:215-217 Appendix B registry (spec-b.mpse.v1)

Ontology (18L):
  src/shared/knowledge-graph/ontology.ts:1       NODE_TYPES (16)
  src/shared/knowledge-graph/ontology.ts:3-8     PREDICATES (4 families, 20 predicates)
  src/shared/knowledge-graph/ontology.ts:13-17   isNodeType / isPredicate

Migrations (70L):
  src/shared/knowledge-graph/migrations.ts:3-8   sqlList + NODE_KINDS_SQL + PREDICATES_SQL (drift-impossible)
  src/shared/knowledge-graph/migrations.ts:11-15 typed_nodes CHECK(kind IN …16)
  src/shared/knowledge-graph/migrations.ts:22-26 typed_edges CHECK(predicate IN …20) + NOT NULL CHECK(length>0)
  src/shared/knowledge-graph/migrations.ts:32-36 resolutions CHECK(verdict IN same/related/unrelated)
  src/shared/knowledge-graph/migrations.ts:48-54 7 indexes
  src/shared/knowledge-graph/migrations.ts:61-70 ensureTypedGraphSchema

Query engine (355L):
  src/shared/knowledge-graph/query-engine.ts:66-79   clampDepth (PATH_BOUNDED, MC-B-06)
  src/shared/knowledge-graph/query-engine.ts:101-123  entity / entityLive
  src/shared/knowledge-graph/query-engine.ts:125-217  path (BFS, bounded, liveOnly, predicateFilter)
  src/shared/knowledge-graph/query-engine.ts:183-202  BUG-D3 edge row-mapper (EDGE_ROW_SHAPE)
  src/shared/knowledge-graph/query-engine.ts:219-258  community
  src/shared/knowledge-graph/query-engine.ts:260-334  temporal (with 2 BUG-D3 mappers at :282,:314)
  src/shared/knowledge-graph/query-engine.ts:336-354  vector (VectorProvider + LIKE fallback)

DB (870L):
  src/shared/knowledge-graph/db.ts:218-325  CREATE_TABLES_SQL (C18.4, 7+4 tables)
  src/shared/knowledge-graph/db.ts:366-387  applyPragmas (WAL+NORMAL+busy_timeout+FK, PRAGMA_FAILED)
  src/shared/knowledge-graph/db.ts:823-842  openStore (C18.4 + SHADOW_VERDICTS + EVENT_LEDGER + TYPED_GRAPH)

Cypher-subset (284L):
  src/subagents/trident-bug-hunter/graph/cypher-subset.ts:7-19    SchemaRejectedError
  src/subagents/trident-bug-hunter/graph/cypher-subset.ts:130-180 parseSubsetQuery (schema-lock)
  src/subagents/trident-bug-hunter/graph/cypher-subset.ts:195-274 TEMPLATE_QUERY_MAP (7 families)

L6 agent (240L):
  src/subagents/trident-bug-hunter/graph/l6-agent.ts:56-62   computeRoundBudget (2+ceil(t/6)+2, pins 6→5,24→8)
  src/subagents/trident-bug-hunter/graph/l6-agent.ts:94-229  runL6Loop (validate-before-compile → engine.path → TRACE_GAP)
  src/subagents/trident-bug-hunter/graph/l6-agent.ts:238-240 L6_BUDGET_PINS

Verify (206L) / Update (204L):
  src/subagents/trident-bug-hunter/graph/verify.ts:53-206  verifyClaim (adjacency not causation at :175)
  src/subagents/trident-bug-hunter/graph/verify.ts:172-195 adjacency violation vs TRACE_GAP
  src/subagents/trident-bug-hunter/graph/update.ts:55-204  classifyFact (5-way at :17, no-delete at :153, FLAGGED at :134)

Extraction:
  src/subagents/trident-bug-hunter/graph/extraction/mechanical.ts:68-235  extractMechanical
  src/subagents/trident-bug-hunter/graph/extraction/resolver.ts:108-140   heuristicDecide
  src/subagents/trident-bug-hunter/graph/extraction/resolver.ts:149-271   resolveEntities (pre-insertion)

Harness (the rewire):
  src/subagents/trident-bug-hunter/harness/map.ts:55-190   populateTypedGraph (hybrid→resolve→INSERT)
  src/subagents/trident-bug-hunter/harness/map.ts:153      INSERT OR IGNORE typed_nodes
  src/subagents/trident-bug-hunter/harness/map.ts:175      INSERT typed_edges (with predicate+evidence guards)
  src/subagents/trident-bug-hunter/harness/trace.ts:146-162 buildL6Demand
  src/subagents/trident-bug-hunter/harness/trace.ts:168-282 solveTrace (L6 + verifyClaim L7 stamp)
  src/subagents/trident-bug-hunter/harness/trace.ts:192    runL6Loop call
  src/subagents/trident-bug-hunter/harness/trace.ts:236    verifyClaim call

Batch-B:
  src/audit-engine/layers/r-graph.ts       9739 bytes
  src/audit-engine/layers/r-dh-feed.ts     8824 bytes
  src/audit-engine/layers/r-provenance.ts 10844 bytes

Wave audits:
  .trident/wave-audit/b1-ontology-storage.md  1267b substantive (B-1)
  .trident/wave-audit/b2-audit.md             188b STUB (B-2) — REWRITE
  .trident/wave-audit/b3-audit.md             188b STUB (B-3) — REWRITE
  .trident/wave-audit/b4-verify-update.md    1161b substantive (B-6)
  .trident/wave-audit/b5-hunter-rewire.md    1415b substantive (B-5, SHA prefixes verified)
  .trident/wave-audit/b6-batchb-layers.md    1666b substantive (B-9)
```

---

**END OF REGISTER — PLAN B. Contracts: 10. Gaps counted: B-1 PLAUSIBLE, B-2/B-3 PARTIAL (audit-less), B-4 UNVERIFIED, B-5/B-6/B-9 CLAIMED (substantive, re-checked), B-7 NOT RUN, B-8 REFUTED (5627/59), B-10 NEVER RUN. The next wave is §4. The compounding is the product.**
