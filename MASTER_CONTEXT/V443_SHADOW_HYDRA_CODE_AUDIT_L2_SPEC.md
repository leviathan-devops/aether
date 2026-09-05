# V443 SHADOW HYDRA CODE AUDIT OVERHAUL — L2 SPECIFICATION

**Version:** 1.0.0 · **Date:** 2026-08-28 · **Status:** DESIGN AUTHORITY
**Purpose:** Rebuild the code audit tool as a 4-phase Shadow Hydra pipeline with concurrent LLM subagents per layer, Graphify-powered micro-graphs, Corbell macro-graph, shared cross-gate memory, and ~24 verification gates.
**Predecessor:** V443_PLAN_S/A/B specs (the 16-wave build); V443_PLAN_{S,A,B}_GAP_ANALYSIS.md
**Baseline checkpoint:** `Checkpoints/v443_wr_wave_complete_20260828/` (dist 1646f554, all floors green)
**Boilerplate spec:** `SHADOW_HYDRA_BOILERPLATE_L2_SPEC.md` (the universal framework this tool instantiates)
**Shadow Agent Bible:** `KNOWLEDGE_LIBRARY/Bibles/SHADOW_AGENT_ENGINEERING_BIBLE.md`
**Hydra Integration Bible:** `KNOWLEDGE_LIBRARY/Bibles/SHADOW_HYDRA_INTEGRATION_BIBLE.md`

---

## §0 THE FUNDAMENTAL PROBLEM

**One sentence:** the code audit tool's six LASME "layers" are synchronous AST predicate functions that share one pre-built AST and complete in microseconds — NOT the independent LLM-powered subagents the architecture demands — making the tool a pattern-matcher pretending to be a code intelligence instrument.

**The root defect class:** THEATRICAL IMPLEMENTATION — the letter of "6 LASME layers" was satisfied (six files exist, each exports `candidates()`), but the spirit (independent intelligent agents each scanning the codebase through their own analytical lens) was not. This is the exact class of gap the code audit tool itself should catch: "this component claims to be an intelligent detector but is actually a regex/AST predicate with no LLM involvement."

**Operator's ruling (2026-08-28, verbatim):**
> "i have no tolerance for this. this exact garbage needs to be ripped out by the code audit tool. especially at the graph layers. its getting annoying"

**What the tool IS now vs what it MUST BE:**

| Aspect | Current (theatrical) | Target (the real instrument) |
|---|---|---|
| LASME layers | 6 synchronous AST predicate functions sharing one `ctx` object | 6 concurrent LLM subagents each scanning the FULL codebase through their own lens with their own system prompt |
| Execution | sequential for-loop concatenation (~1ms each) | `Promise.allSettled` concurrent dispatch (~30-60s each, all in parallel) |
| Intelligence | regex/AST pattern matching (fires on shape, not intent) | muse-powered semantic reasoning (understands WHAT the code does, not just WHAT it contains) |
| Cross-referencing | none — each layer is isolated | synthesizer correlates findings across all layers (lexicon+mpse both flag → boosted confidence) |
| Graph | one shared typed_nodes/typed_edges SQLite table | Graphify micro-graphs per subagent (tree-sitter AST, EXTRACTED/INFERRED tags) merged into a macro-graph, bridged to corbell |
| Memory | each run starts from zero | shared cross-gate memory: LASME stores findings → MPSE reads them → SRO reads both |
| Score | all-or-nothing (wait 10 min or get legacy-only in seconds) | [PRELIMINARY] score returned immediately, updated as each gate completes |
| Phases | single pipeline (legacy → mandate → batch-B) | 4 sequential phases, each a fully gated Shadow Hydra instance |
| Verification | ~8 gates (probe, validator, markers, etc.) | ~24 gates across 4 phases (council of auditors) |

---

## §1 FAILURE INVENTORY

Every failure below is grounded in evidence from this session or the prior 16-wave build. Severity-tagged.

### §1.1 THE THEATRICAL LASME GAP [CRITICAL]

**What happened:** Four rounds of "did you build what the spec says?" = yes, followed by the revelation that the "6 LASME layers" are pure AST predicate functions.

**Root cause:** The spec (SPEC-A §2.5) defines the layers as structural *detectors* — pattern matchers that find shapes. It doesn't explicitly say "each one is an LLM subagent." The implementation satisfied the letter (six files, each exports `candidates(ctx, specBindings): LayerCandidate[]`) but not the spirit (independent intelligent analysis).

**Evidence:**
- `src/audit-engine/index.ts:305-321` — the six layers are called in a sequential try/catch block:
```typescript
try { LAYER_MAP['r-lexicon'] = rLexiconCandidates(ctx, specBindings); } catch { LAYER_MAP['r-lexicon'] = []; }
try { LAYER_MAP['r-actor'] = rActorCandidates(ctx, specBindings); } catch { LAYER_MAP['r-actor'] = []; }
// ... identical for all 6
```
- No LLM call anywhere in the layer files (`grep -rn "muse\|llm\|transport\|agent" src/audit-engine/layers/r-*.ts` = 0 hits)
- Each layer completes in ~1ms (measured: the entire mandate block takes <5ms when candidates exist)
- The layers share the same pre-built `ctx` object — they never independently scan the codebase

**Impact:** The tool can catch `createMachine({…})` syntactically but cannot reason about whether that machine's state topology matches the spec's intent. It's a pattern matcher, not a code intelligence instrument.

### §1.2 THE SEQUENTIAL BOTTLENECK [HIGH]

**What happened:** The six layers run sequentially in a for-loop, then ONE shadow agent adjudicates all candidates.

**Root cause:** The architecture was built as "6 function calls → concat → 1 shadow run" instead of "6 concurrent agents → synthesis → adjudication."

**Evidence:** `index.ts:305-321` — sequential calls. `index.ts:322-331` — single `runAuditPipeline()` for all candidates.

**Impact:** Even if the layers were LLM-powered, running them sequentially means 6×30s = 3 minutes instead of ~30s (parallel).

### §1.3 THE SCORE TIMING PROBLEM [HIGH]

**What happened:** The tool returns in seconds (legacy-only score) when the mandate is skipped, or blocks for 5-10 minutes when it fires.

**Root cause:** The score is computed from ALL layers (legacy + shadow), but the legacy layers complete in ~5 seconds while the shadow adjudication takes 5-10 minutes. There's no intermediate return.

**Evidence:** On `/tmp/rich` (0 candidates from six layers): audit returned in ~5 seconds with legacy-only findings. On `/tmp/s2fix` (23 candidates): audit blocked for ~10 minutes.

**Impact:** The caller either gets a shallow score fast or a deep score slowly — never both.

### §1.4 THE MISSING CROSS-PHASE INTELLIGENCE [HIGH]

**What happened:** LASME, MPSE, and SRO Graph operate in complete isolation. Each phase starts from zero context about what previous phases found.

**Root cause:** No shared memory store. The mandate block passes candidates to the shadow runner; the Batch-B block separately queries the graph. Neither knows about the other's findings.

**Evidence:** The Batch-B block (`index.ts:404-513`) queries `isBatchBActive(targetPath)` and opens its own graph — it never reads the mandate's verdicts. The mandate never reads Batch-B's findings.

**Impact:** No cross-referencing. A finding flagged by BOTH the lexicon detector AND the graph path hunter should be a TRIPLE-CONFIRMED defect with boosted confidence — but the current architecture cannot detect this overlap.

### §1.5 THE GRAPH ISOLATION PROBLEM [MEDIUM]

**What happened:** The typed graph (typed_nodes/typed_edges in shared.db) is populated by ONE mechanical extraction pass. No per-layer graph views. No micro-graphs from different analytical perspectives.

**Root cause:** `mechanical.ts` runs once, extracts all Class/Function/Interface/File nodes, inserts them, done. There's no graph slicing per analytical dimension.

**Evidence:** `sqlite3 /tmp/b7fix/.trident/knowledge-graph/shared.db "select kind, count(*) from typed_nodes group by kind"` → Class:3, File:6, Function:6, Interface:3. One flat extraction. No layer-specific annotations.

**Impact:** The graph knows WHAT exists but not HOW it relates to each analytical lens.

### §1.6 THE R0-PREFLIGHT WALK BUG [MEDIUM]

**What happened:** The homeland reaudit produced 23,257 findings ALL from R0-PREFLIGHT — INCREASED from the 21,434 pre-fix baseline.

**Root cause:** The `DEFAULT_EXCLUDE` fix (`ast-core.ts:79`) governs the AST walk, but R0-PREFLIGHT has its own file-discovery walk that doesn't consume the exclude list.

**Evidence:** `MASTER_CONTEXT/V443_HOMELAND_REAUDIT_20260828.md` — finding paths include root-level `.ts` files and `Checkpoints/*/src/` copies.

**Impact:** The R0-PREFLIGHT noise floor makes the homeland self-audit unusable.

---

## §2.1 THE SHADOW HYDRA ARCHITECTURE (OPERATOR DIRECTIVE VERBATIM)

**The operator's architecture directive (2026-08-28, preserved verbatim):**

> "yeah this is exactly what needs to be built. dedicated architecture for this. that will then be refined for the MPSE and Graph phases so this shadow hydra code audit structure is properly engineered for multi layer use - each meta layer has its own fine tuned shadow hydra for the meta code audit"

> "DEEP FORENSIC 0 TRUST PRECISION GRADE CODE AUDIT in this tool. By the time this tool completes it has gone through 3 different shadow hydra gates - the final report will be DENSE AND THOROUGHLY AUDITED nearly 2 dozen times over by the tim the tool execution completes"

> "really we need to make a universally applicable boilerplate for this and then each meta layer LASME/MPSE/SRO Graph will have a dedicated wired version of this so there are 3 sequential meta layer shadow agents in the code audit pipeline built from this structure and its not just 1 orchestrator doing 3 phases, but rather 3 fully gated shadow orchestrator level event pipeline for each phase. Taking a 'council of auditors' approach over just a 'single auditor running an audit pipeline' style"

> "phase 1 - legacy layers / phase 2 - LASME shadow gate / phase 3 - MPSE shadow gate / phase 4 - SRO Graph shadow gate"

> "Each shadow gate is a fully fleshed event instance of [the Shadow Hydra boilerplate] this boilerplate architecture fine tunes for their specific layers. The individual layers within a meta gate all run async while the meta gates LASME --> MPSE --> SRO Graph are sequential"

### THE COUNCIL-OF-AUDITORS PATTERN

The key architectural insight: it's NOT one orchestrator doing 3 phases. It's THREE fully gated Shadow Hydra pipelines, each with its own subagent roster, system prompts, synthesizer, gates, graph queries, and evidence collectors. The three gates are **sequential** (LASME → MPSE → SRO). Within each gate, the subagents are **concurrent** (async, Promise.allSettled). The shared memory store carries findings forward between gates.

### THE PI SDK FOUNDATION

The entire architecture builds on TOP OF:
`/home/leviathan/OPENCODE_WORKSPACE/Shared Workspace Context/KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/shadow_agent_backend`

This means:
- **Transport:** pi SDK `createModels()` + `opencodeGoProvider()` + native transport (proven: muse on /responses, retry 5×2.5s, stall 60s, done-verifier)
- **Agent harness:** `Agent` from `@earendil-works/pi-agent-core` with `NodeExecutionEnv`
- **Tools:** pi SDK native tools + CUSTOM graphify tools (see §2.10)
- **Key seeding:** module-scope `seedShadowProviderEnv()` (BUG-D6 fix, live)
- **API family:** openai-responses (NOT completions — BUG-D1/D2/D3 root cause, live)

Each Shadow Hydra subagent is a pi SDK `Agent` instance with:
1. Its own system prompt (layer-specific directive + graphify warheads)
2. The graphify tool set (query, path, explain, subgraph — ported as pi SDK tools)
3. The read/grep tool set (for direct code inspection)
4. A structured output contract (validated by zod)

---

## §2.2 THE 4-PHASE PIPELINE

**Operator's ruling (verbatim):**
> "phase 1 - legacy layers / phase 2 - LASME shadow gate / phase 3 - MPSE shadow gate / phase 4 - SRO Graph shadow gate"

The meta gates are SEQUENTIAL. The layers WITHIN each gate are CONCURRENT (async).

```
audit(targetPath) called
  │
  ├── PHASE 1: LEGACY SWEEP (existing R0-R17, fast, ~5-15s)
  │     Returns [PRELIMINARY] score + legacy findings immediately
  │     Artifact saved with [PRELIMINARY] marking
  │
  ├── PHASE 2: LASME SHADOW GATE (~30-60s, 6 concurrent subagents)
  │     graphify extract → graph.json
  │     6 subagents query the graph concurrently
  │     synthesizer merges + cross-references
  │     shadow adjudication (TD/RH/UNCLEAR)
  │     → verdicts.json + report.md + manifest.json
  │     → score updated: [PRELIMINARY] → [LASME-ADJUDICATED]
  │
  ├── PHASE 3: MPSE SHADOW GATE (~30-60s, 4 concurrent subagents)
  │     reads LASME's findings from shared memory
  │     4 contract-checker subagents verify against spec contracts
  │     → conformance matrix + epsilon violations + TRACE_GAPs
  │     → score updated: [LASME-ADJUDICATED] → [MPSE-VERIFIED]
  │
  ├── PHASE 4: SRO GRAPH SHADOW GATE (~30s, 4 concurrent subagents)
  │     reads LASME + MPSE findings from shared memory
  │     queries the merged macro-graph for impact paths
  │     → blast-radius matrix + dead-code + cycles
  │     → cross-phase correlations (TRIPLE-CONFIRMED defects)
  │     → score updated: [MPSE-VERIFIED] → [FINAL]
  │
  └── FINAL SYNTHESIS
        ALL phase findings merged and cross-referenced
        ~24 verification gates passed
        Dense, thoroughly audited report with full provenance
```

### THE SCORE LADDER

The score evolves through the pipeline, each phase marking its confidence level:

| Phase | Score Label | What's Included |
|---|---|---|
| Phase 1 complete | `[PRELIMINARY]` | Legacy R0-R17 findings only |
| Phase 2 complete | `[LASME-ADJUDICATED]` | + 6 concurrent layer subagent findings, shadow-adjudicated |
| Phase 3 complete | `[MPSE-VERIFIED]` | + contract conformance matrix, epsilon violations, TRACE_GAPs |
| Phase 4 complete | `[FINAL]` | + blast-radius matrix, dead-code, cycles, cross-phase correlations |

**Operator's ruling on the score (verbatim):**
> "sure this works just make sure the pre-shadow score is clearly marked [PRELIMINARY]"

---

## §2.3 THE LASME SHADOW GATE

The first Shadow Hydra instance. 6 concurrent LLM subagents, each scanning the codebase through its own analytical lens.

### Subagent Roster

| # | Agent ID | System Prompt Focus | Graphify Query | Output Schema |
|---|---|---|---|---|
| 1 | `r-lexicon` | PatternFamily interfaces, ISE lexicons, decision ladders ≥3, threshold literals without calibration | "find all interfaces with >5 members" + "show if/else chains deeper than 3" + "find numeric literals not in named constants" | LayerCandidate[] |
| 2 | `r-actor` | Actor topology, createActor/createMachine/send/subscribe calls, missing subscriptions, message flow integrity | "show all createMachine and createActor call sites" + "trace send() to subscribe() paths" + "find actors without subscription handlers" | LayerCandidate[] |
| 3 | `r-state-machine` | XState machine configs, scattered boolean flags, state machine integrity, missing terminal states | "find machines with scattered boolean flags alongside them" + "show state machines with their state count" | LayerCandidate[] |
| 4 | `r-engine` | writeFileSync/degrade paths, engine-level side effects without guards, container deploy surface | "find all writeFileSync and file I/O calls" + "trace degrade/fallback branches" + "find container config references" | LayerCandidate[] |
| 5 | `r-adapter` | Delegation patterns, snapshot merges, adapter↔engine parity violations | "find delegation function patterns" + "show spread operator and Object.assign merge sites" + "trace adapter to engine call chains" | LayerCandidate[] |
| 6 | `r-mpse` | Numeric threshold comparisons, contract call sites, epsilon oracle patterns, unguarded numeric decisions | "find numeric comparisons in contract-checking functions" + "show Math.abs and comparison operators near contract calls" | LayerCandidate[] |

### Per-Subagent Architecture

Each subagent is a pi SDK `Agent` instance:

```typescript
interface LASMESubagentSpec {
  id: string;                    // "r-lexicon" | "r-actor" | ...
  systemPrompt: string;          // the layer's OWN directive (see §2.10)
  graphQueries: string[];        // graphify queries this agent runs first
  focusAreas: string[];          // what THIS agent looks for in the code
  outputSchema: z.ZodSchema<LayerCandidate[]>;
  maxTokens: number;             // per-agent LLM budget (default 64000)
  maxRounds: number;             // investigation rounds (default 2)
  timeout: number;               // wall clock (default 60_000ms)
  tools: string[];               // ["read", "grep", "graphify:query", "graphify:path", "graphify:explain"]
}
```

### The LASME Synthesizer

After all 6 subagents return (via `Promise.allSettled`), the synthesizer:

1. **Merge:** concat all candidate arrays from fulfilled agents
2. **Dedupe:** remove candidates with identical `(file, line, predicate, object)` keys
3. **Cross-reference:** if candidate X appears in BOTH r-lexicon's output AND r-mpse's output (same file+line, different predicates), boost confidence by 0.1 and tag `crossReferenced: true`
4. **Rank:** sort by severity × confidence
5. **Collect graph slices:** each subagent's graph slice (the subgraph it was viewing) is merged via `graphify merge-graphs`
6. **Emit:** the synthesized candidate set + the merged graph slice → passed to the shadow adjudicator

### The Shadow Adjudicator (unchanged from current architecture)

The synthesized candidates go through the existing `runAuditPipeline()`:
- step-0 probe (≤5s, /responses route)
- steps 1-4 phase controller
- steps 5-6 demand + brief (now includes the graph slice context)
- step 7 phase loop (muse adjudicates each candidate: TD/RH/UNCLEAR)
- step 8 validator (V0-V8)
- step 9 silent verify (8/8 markers)
- steps 10-13 evidence + manifest

### LASME Gate Conditions

**Pre-gates (before any subagent fires):**
- `audit-spec.json` exists and parses
- `parseSpecBindings()` produces ≥1 declaration
- graphify extraction succeeds (graph.json is valid)

**Post-gates (after synthesis + adjudication):**
- Every candidate has `layer` + `file` + `line` + `evidence`
- `machineId` is always the layer name (never "layer-engine")
- Manifest `counts.candidatesIn === TD + RH + UNCLEAR`
- Report has 8/8 markers

---

## §2.4 THE MPSE SHADOW GATE

The second Shadow Hydra instance. 4 concurrent contract-checker subagents. READS LASME's findings from shared memory.

### Subagent Roster

| # | Agent ID | Focus | Graphify Query |
|---|---|---|---|
| 1 | `contract-checker` | Verify each declared contract against the code. Find the implementation and check conformance. | "trace contract.checkContract() call chains" + "find function implementations matching spec declarations" |
| 2 | `oracle-checker` | For each numeric threshold, verify the epsilon bound is enforced in code. | "find Math.abs and comparison operators near threshold constants" + "trace epsilon oracle patterns" |
| 3 | `stage-checker` | For each stage gate (pre/post/inv), verify the stage is respected in the call chain. | "show function call chains with their pre/post conditions" + "find stage gate violations" |
| 4 | `provenance-checker` | For each spec clause, trace to the code that implements it. Missing trace = TRACE_GAP finding. | "path spec clause reference to code implementation" + "find unreachable spec declarations" |

### Cross-Gate Intelligence

The MPSE subagents receive LASME's output as context:

```typescript
const lasmeOutput = memory.getGate('LASME');
// lasmeOutput = { candidates: LayerCandidate[], verdicts: Verdict[],
//                 graphSlice: object, telemetry: object }

// Each MPSE subagent's system prompt includes:
// "The LASME gate found these structural shapes at these sites:
//  {JSON.stringify(lasmeOutput.candidates)}
//  The shadow adjudicated them as:
//  {JSON.stringify(lasmeOutput.verdicts)}
//  Check each against the spec contracts."
```

### MPSE Gate Conditions

**Pre-gates:**
- LASME gate completed (evidence: manifest exists in shared memory)
- Spec contracts parse (declarations exist)

**Post-gates:**
- Every declared contract has a conformance verdict
- Every epsilon bound is either verified or flagged as VIOLATION
- Every TRACE_GAP has a file:line for the missing implementation

---

## §2.5 THE SRO GRAPH SHADOW GATE

The third Shadow Hydra instance. 4 concurrent graph-hunting subagents. READS LASME + MPSE from shared memory. Queries the MERGED macro-graph.

### Subagent Roster

| # | Agent ID | Focus | Graphify Query |
|---|---|---|---|
| 1 | `graph-builder` | Populate the corbell typed graph from the merged micro-graph slices. Transform graphify nodes into corbell's 16-type ontology. | "show all nodes and edges from the merged graph" |
| 2 | `path-hunter` | For each finding from LASME + MPSE, query the graph for impact paths — what does this finding affect downstream? | "path from {finding.file}:{finding.line} to all callers within 5 hops" |
| 3 | `dead-code-hunter` | Find exports with no importers, functions with no callers, modules with no consumers. | "find nodes with in-degree 0 that are exported" + "show functions not in any call chain" |
| 4 | `cycle-hunter` | Find circular dependency chains in the import/dependency graph. | "find cycles in the import graph" + "show circular dependency chains" |

### The Corbell Bridge

The SRO gate bridges graphify's micro-graph to corbell's typed ontology:

```
graphify graph.json                corbell shared.db
(extracted by tree-sitter)         (typed with CHECK constraints)

  GraphifyNode                     TypedNode
  {id, label, type, file,          {id, kind (16 types),
   data}                            label, file, data (JSON)}

  GraphifyEdge                     TypedEdge
  {src, dst, relation,            {src_canonical, dst_canonical,
   confidence}                      predicate (20 types),
                                    evidence_quote (NOT NULL)}

  TRANSFORMATION:
  graphify "class" → corbell "Class"
  graphify "function" → corbell "Function"
  graphify "interface" → corbell "Interface"
  graphify "file" → corbell "File"
  graphify "imports" → corbell "imports"
  graphify "calls" → corbell "calls"
  graphify edge confidence → corbell evidence_quote
    (EXTRACTED → verbatim quote)
    (INFERRED → "inferred: {reason}")
```

### Cross-Phase Correlation (the TRIPLE-CONFIRMED class)

The SRO synthesizer produces the blast-radius matrix:

```typescript
interface CrossPhaseCorrelation {
  findingId: string;
  flaggedBy: {
    lasme: boolean;    // was this file:line flagged by a LASME subagent?
    mpse: boolean;     // was this contract checked by an MPSE subagent?
    sro: boolean;      // does the graph show impact paths from this site?
  };
  impactPaths: Array<{
    from: string;      // the finding site
    to: string;        // the downstream affected node
    hops: number;      // path length
    edgeTypes: string[]; // what kinds of connections
  }>;
  tripleConfirmed: boolean;  // flaggedBy all three = highest confidence
  recommendedSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}
```

**The TRIPLE-CONFIRMED rule:** if a finding is flagged by LASME (structural shape) AND MPSE (contract violation) AND SRO (graph impact ≥2 downstream callers), it's a TRIPLE-CONFIRMED defect with `recommendedSeverity: 'CRITICAL'` and `confidence: 1.0`.

### SRO Gate Conditions

**Pre-gates:**
- LASME gate completed
- MPSE gate completed
- Merged macro-graph is valid (≥1 node, ≥1 edge)

**Post-gates:**
- Every finding from LASME + MPSE has a blast-radius entry
- Dead-code list is non-empty or explicitly empty (measured, not assumed)
- Cycle detection completed (cycles found or confirmed absent)

---

## §2.6 THE GRAPHIFY INTEGRATION (MICRO-GRAPHS)

**Operator's ruling (verbatim):**
> "MCP is probably best. all the shadow agents are in the pi sdk"
> "port graphify into the pi agent harness and give it to the shadow agents tools. the shadow agent system prompt will need to be updated w/ extra graphify warheads so that it operates correctly"

> "Corbell = macro project graph for user facing/receiving macro context and then graphify = micro level codebase graphs for agent to understand and map logic chains or architecture that are far removed from top-of-codebase immediate visibility"

> "we dont want a million isolated graphs we want multiple heads enhancing the precision of 1 master graph for a specific target"

### The Architecture: One Graph, Many Perspectives

**Extract ONCE, query N times.** The graphify extraction runs once per audit (not once per subagent). All subagents query the SAME graph.json through their own analytical lens. The micro-graphs are QUERY RESULTS (subgraphs), not separate extractions.

```
targetRoot
     │
     ▼
graphify extract --code-only     ← tree-sitter, no LLM, fully local
     │
     ▼
graph.json (the ONE master graph for this target)
     │
     ├── r-lexicon queries: "find interfaces with >5 members"
     │   → LEXICON PERSPECTIVE (a view, not a separate graph)
     │
     ├── r-actor queries: "trace actor.send() call chains"
     │   → ACTOR PERSPECTIVE
     │
     ├── r-mpse queries: "find contract call sites"
     │   → MPSE PERSPECTIVE
     │
     └── ... (each subagent queries the SAME graph)
     │
     ▼
graphify merge-graphs [all perspective annotations]
     │
     ▼
ENHANCED MASTER GRAPH (one graph, enriched by 12+ perspectives)
```

### The Graphify MCP Server Integration

Graphify is deployed as an MCP server: `python -m graphify.serve graphify-out/graph.json`

The shadow subagents access it through custom pi SDK tools:

```typescript
// The graphify tool set, registered as pi SDK AgentTools
const graphifyTools: AgentTool[] = [
  {
    name: 'graphify:query',
    description: 'Query the codebase knowledge graph. Ask a natural-language question about the code structure.',
    parameters: z.object({
      question: z.string().describe('The question to ask the graph'),
    }),
    execute: async (id, params) => {
      // MCP call to graphify serve → query_graph tool
      const result = await mcpClient.callTool('query_graph', { question: params.question });
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  },
  {
    name: 'graphify:path',
    description: 'Trace the shortest path between two concepts in the code graph.',
    parameters: z.object({
      from: z.string().describe('Starting concept name'),
      to: z.string().describe('Target concept name'),
    }),
    execute: async (id, params) => {
      const result = await mcpClient.callTool('shortest_path', { from: params.from, to: params.to });
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  },
  {
    name: 'graphify:explain',
    description: 'Get detailed information about a specific concept including its connections and community.',
    parameters: z.object({
      concept: z.string().describe('The concept to explain'),
    }),
    execute: async (id, params) => {
      const result = await mcpClient.callTool('get_node', { name: params.concept });
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  },
  {
    name: 'graphify:subgraph',
    description: 'Extract a scoped subgraph around a concept (for blast-radius analysis).',
    parameters: z.object({
      center: z.string().describe('The center concept'),
      depth: z.number().default(3).describe('Max hops from center'),
    }),
    execute: async (id, params) => {
      const result = await mcpClient.callTool('get_neighbors', {
        node: params.center, depth: params.depth,
      });
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  },
];
```

### Graphify Edge Confidence Tags

Every edge in the graphify output carries a confidence tag:
- `EXTRACTED` — the relationship is explicit in the source code (an import statement, a function call)
- `INFERRED` — the relationship was derived by graphify's resolution (a type reference, a pattern match)

The shadow subagents' system prompts must teach them to distinguish:
> "EXTRACTED edges are facts read directly from the source. INFERRED edges are graphify's best guess based on resolution. When citing evidence, prefer EXTRACTED edges and flag INFERRED edges with `[INFERRED]` in your evidence field."

### The Graphify MCP Client

The MCP client connects to the graphify server:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class GraphifyMCPClient {
  private client: Client;

  async connect(graphPath: string): Promise<void> {
    const transport = new StdioClientTransport({
      command: 'python',
      args: ['-m', 'graphify.serve', graphPath],
    });
    this.client = new Client({ name: 'shadow-hydra', version: '1.0.0' }, {});
    await this.client.connect(transport);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const result = await this.client.callTool({ name, arguments: args });
    return result.content;
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}
```

This client is injected into each shadow subagent's tool context, wrapping the MCP calls as pi SDK `AgentTool` instances that the muse agent can call naturally.

---

## §2.7 THE CORBELL BRIDGE (MACRO-GRAPH)

**Operator's ruling (verbatim):**
> "Corbell = macro project graph for user facing/receiving macro context and then graphify = micro level codebase graphs for agent to understand and map logic chains or architecture that are far removed from top-of-codebase immediate visibility"

### The Division of Labor

| Layer | Graphify (micro) | Corbell (macro) |
|---|---|---|
| Audience | Shadow subagents (agent-facing) | The tool caller (user-facing) |
| Scope | Codebase structure (symbols, calls, imports, types) | Project-level context (findings, verdicts, impact paths, spec conformance) |
| Storage | graph.json (ephemeral, per-audit-run) | shared.db (persistent, cross-run) |
| Schema | Graphify's schema (nodes, edges, confidence tags, communities) | Corbell's 16-type ontology with CHECK constraints |
| Extraction | tree-sitter AST (deterministic, no LLM) | Mechanical + semantic (typed predicates with evidence quotes) |
| Enrichment | Layer-specific annotations from subagent perspectives | Audit verdicts, blast-radius paths, cross-phase correlations |
| Output | Subgraph views per analytical lens | The SRO macro-graph with typed impact paths |

### The Bridge Transformation

The SRO gate's `graph-builder` subagent transforms graphify output into corbell's typed schema:

```typescript
interface CorbellBridge {
  // graphify node → corbell typed_node
  transformNode(gfy: GraphifyNode): TypedNodeInsert;
  // graphify edge → corbell typed_edge
  transformEdge(gfy: GraphifyEdge): TypedEdgeInsert;
  // the mapping table
  nodeTypeMap: Record<string, string>;  // graphify type → corbell kind
  edgePredicateMap: Record<string, string>;  // graphify relation → corbell predicate
}

// The mapping:
const NODE_TYPE_MAP = {
  'class': 'Class',
  'function': 'Function',
  'interface': 'Interface',
  'file': 'File',
  'module': 'Module',
  'method': 'Function',
  'property': 'Evidence',  // properties become evidence nodes
  'import': 'Module',      // import references become module links
};

const EDGE_PREDICATE_MAP = {
  'imports': 'imports',
  'calls': 'calls',
  'inherits': 'implements',
  'uses': 'wraps',
  'references': 'declares',
  'returns': 'shouldBe',   // return-type relationships map to spec obligations
};
```

### Evidence Quote Preservation

Corbell requires `evidence_quote NOT NULL CHECK(length > 0)` on every typed_edge. The bridge transforms graphify's confidence tags:

- `EXTRACTED` edge → `evidence_quote = "explicit: {the actual source line}"`
- `INFERRED` edge → `evidence_quote = "inferred: {graphify's resolution reason}"`

This preserves the EXTRACTED/INFERRED distinction inside corbell's schema while satisfying the CHECK constraint.

---

## §2.8 THE SHARED MEMORY STORE

**Operator's ruling (verbatim):**
> "and the shared graph/db between them should be [a shared memory layer]"

### The Interface

```typescript
interface SharedMemoryStore {
  // === WITHIN A SINGLE PIPELINE RUN ===
  // Each gate stores its output; the next gate reads it
  setGateOutput(gateId: string, data: GateOutput): void;
  getGateOutput<T extends GateOutput>(gateId: string): T | null;

  // === ACROSS PIPELINE RUNS (the compounding effect) ===
  // Run N's findings inform run N+1
  persistRun(runId: string, data: RunSummary): void;
  getPriorRun(runId: string): RunSummary | null;
  getChangedFiles(sinceRunId: string): string[];

  // === GRAPH ACCESS ===
  // The macro-graph shared across all gates
  getGraph(): CorbellGraph | null;
  mergeGraphSlice(slice: GraphSlice): void;
  queryGraph(query: string): Promise<Subgraph>;

  // === BACKEND ABSTRACTION ===
  // SQLite now, TencentDB-Agent-Memory later
  readonly backend: 'sqlite' | 'tencentdb';
}

interface GateOutput {
  gateName: string;           // 'LASME' | 'MPSE' | 'SRO'
  candidates: LayerCandidate[];
  verdicts: AdjudicationVerdict[];
  graphSlice: object;         // this gate's perspective on the graph
  telemetry: {
    durationMs: number;
    subagentCount: number;
    fulfilledCount: number;
    rejectedCount: number;
    totalTokensIn: number;
    totalTokensOut: number;
  };
  manifest: RunManifest;      // the shadow runner's manifest
}
```

### The Compounding Effect

```
Run 1: LASME → MPSE → SRO → findings persisted to shared memory
Run 2: reads Run 1's findings → only audits CHANGED files
       (getChangedFiles('run-1') returns the delta)
       → faster, more precise (already knows what didn't change)
Run 3: reads Run 1+2 → cumulative knowledge graph
       → each run makes the next run smarter
```

### Phase 1 Implementation: SQLite

The initial backend is the existing `shared.db`:
- `gate_outputs` table (new): `gate_name TEXT, run_id TEXT, data JSON, created_at`
- `run_history` table (new): `run_id TEXT, summary JSON, created_at`
- Existing `typed_nodes` + `typed_edges` tables serve the graph

### Phase 2 Upgrade Path: TencentDB-Agent-Memory

The `SharedMemoryStore` interface is designed to swap backends:
- TencentDB's **Chat Memory** → the cross-run persistence (`persistRun`/`getPriorRun`)
- TencentDB's **CodeGraph** → the graph access (`getGraph`/`mergeGraphSlice`/`queryGraph`)
- TencentDB's **Skill library** → accumulating audit expertise per project type
- TencentDB's **Wiki** → structured spec pages (replacing flat SPEC.md files)

No code changes needed in the gates — the interface abstraction handles it.

---

## §2.9 THE PRELIMINARY SCORE

**Operator's ruling (verbatim):**
> "sure this works just make sure the pre-shadow score is clearly marked [PRELIMINARY]"

### Implementation

The tool returns immediately after Phase 1 (legacy sweep) with:

```
Score: 84/100 [PRELIMINARY — LASME/MPSE/SRO gates running]
```

The artifact on disk is updated in place as each gate completes:
- After LASME: score recalculated, label changes to `[LASME-ADJUDICATED]`
- After MPSE: score recalculated, label changes to `[MPSE-VERIFIED]`
- After SRO: score recalculated, label changes to `[FINAL]`

The tool caller can:
- Read the artifact file at any point during the run
- Use the [PRELIMINARY] score for immediate triage
- Wait for [FINAL] for the complete assessment

### Score Calculation Per Phase

| Phase | Score Formula | Confidence Basis |
|---|---|---|
| Phase 1 | Legacy findings weighted by R-layer severity × confidence | AST predicate confidence (0.90 default for preflight) |
| Phase 2 | Phase 1 + LASME findings (shadow-adjudicated TD boosts, RH suppresses) | Muse adjudication confidence (0.55-1.0) |
| Phase 3 | Phase 2 + MPSE violations (contract conformance failures) | Contract verification confidence |
| Phase 4 | Phase 3 + cross-phase correlations (TRIPLE-CONFIRMED → CRITICAL) | Graph impact analysis confidence |

---

## §2.10 THE SYSTEM PROMPTS (GRAPHIFY WARHEADS)

**Operator's ruling (verbatim):**
> "the shadow agent system prompt will need to be updated w/ extra graphify warheads so that it operates correctly"

Each subagent's system prompt carries THREE sections:
1. The **layer directive** (what this agent looks for — specific to each subagent)
2. The **graphify warhead** (how to use the graph tools — identical across all subagents)
3. The **output contract** (the structured JSON schema the agent must return)

### The Graphify Warhead (shared across all subagents)

```
GRAPH TOOLS USAGE LAW:

You have access to graphify tools: graphify:query, graphify:path,
graphify:explain, graphify:subgraph. These query a knowledge graph
of the codebase built by tree-sitter AST parsing.

RULES:
1. ALWAYS query the graph BEFORE reading files directly. The graph
   gives you the structural overview; file reads give you the details.
2. Every edge in the graph carries a confidence tag:
   - EXTRACTED = the relationship is explicit in the source code
   - INFERRED = graphify derived it from resolution
   When citing evidence, prefer EXTRACTED edges. Flag INFERRED edges
   with [INFERRED] in your evidence field.
3. Use graphify:path to trace connections between concepts you find.
   This reveals impact chains that file reading alone cannot show.
4. Use graphify:subgraph with depth=3 around any finding to understand
   its blast radius (what it affects downstream).
5. The graph shows the FOREST. File reads show the TREES. Use both.
6. NEVER fabricate a graph node or edge. If the graph doesn't show a
   connection, report "no graph connection found" — never invent one.
7. Community labels in the graph show detected subsystems. Use these
   to understand architectural boundaries.
8. God nodes (highest degree) are potential single points of failure.
   Flag findings that involve god nodes with severity +1.
```

### Per-Layer Directive Examples

**r-lexicon system prompt:**
```
You are the LEXICON detector — a specialized code intelligence agent.

YOUR MISSION: Find every instance of a PatternFamily interface, ISE
detection lexicon, decision ladder deeper than 3 branches, and
threshold literal without a named calibration constant.

START WITH THE GRAPH:
- graphify:query "find all interfaces with more than 5 members"
- graphify:query "show if/else chains deeper than 3"
- graphify:query "find numeric literals not in named constants"

THEN VERIFY WITH FILE READS:
- Read the actual interface definitions to confirm member counts
- Read the if/else chains to measure their depth
- Check whether threshold values have calib: comments

FOR EACH FINDING, RETURN:
{
  "layer": "r-lexicon",
  "predicate": "lexicon.table" | "lexicon.ladder" | "lexicon.threshold",
  "subject": "<the interface/function name>",
  "object": "<the structural shape found>",
  "file": "<absolute path>",
  "line": <line number>,
  "evidence": "<verbatim quote from the source, or [INFERRED] + graph evidence>",
  "implicatedSpecClause": "<spec clause reference if applicable>"
}

DO NOT return findings for:
- Interfaces with ≤4 members (not a PatternFamily shape)
- If/else chains of depth ≤2 (normal control flow)
- Thresholds with a calib: comment (ISE named-threshold exemption)
- Test fixtures or generated code
```

**r-actor system prompt:**
```
You are the ACTOR detector — a specialized code intelligence agent.

YOUR MISSION: Find every actor creation site, message send/subscribe
pattern, and missing subscription that the spec requires.

START WITH THE GRAPH:
- graphify:query "show all createMachine and createActor call sites"
- graphify:query "trace send() to subscribe() paths"
- graphify:query "find actors without subscription handlers"
- graphify:path "<actor-creation-site>" "<subscription-handler>"

THEN VERIFY:
- Read the actor creation to confirm the machine config
- Trace message flow: does every send() have a matching subscribe()?
- Check the spec: which actors MUST have which subscriptions?

FOR EACH FINDING, RETURN:
{ "layer": "r-actor", "predicate": "actor.unsubscribed" | ... }
```

### The Output Contract (zod schema, shared)

```typescript
import { z } from 'zod';

const LayerCandidateSchema = z.object({
  layer: z.string(),
  predicate: z.string(),
  subject: z.string(),
  object: z.string(),
  file: z.string(),
  line: z.number().int().positive(),
  evidence: z.string().min(1),
  implicatedSpecClause: z.string().optional(),
  graphContext: z.object({
    communityId: z.number().optional(),
    degree: z.number().optional(),
    inferredPaths: z.array(z.string()).optional(),
  }).optional(),
});

export const SubagentOutputSchema = z.object({
  candidates: z.array(LayerCandidateSchema),
  graphSlice: z.object({
    queriedConcepts: z.array(z.string()),
    relevantSubgraph: z.string(),  // serialized subgraph JSON
  }),
  summary: z.string(),
});
```

---

## §2.11 THE FINAL SYNTHESIS

After all 4 phases complete, the final synthesis merges everything:

```typescript
interface FinalSynthesis {
  // Phase 1: legacy findings
  legacyFindings: AuditFinding[];
  legacyScore: number;

  // Phase 2: LASME adjudicated findings
  lasmeCandidates: LayerCandidate[];
  lasmeVerdicts: AdjudicationVerdict[];
  lasmeScore: number;

  // Phase 3: MPSE conformance results
  mpseConformance: ConformanceMatrix;
  mpseViolations: ContractViolation[];
  mpseScore: number;

  // Phase 4: SRO graph intelligence
  sroBlastRadius: BlastRadiusMatrix;
  sroDeadCode: DeadCodeReport;
  sroCycles: CycleReport[];
  sroScore: number;

  // Cross-phase correlations
  correlations: CrossPhaseCorrelation[];
  tripleConfirmedDefects: CrossPhaseCorrelation[];  // subset with all 3 gates

  // Final scoring
  finalScore: number;
  confidenceLabel: '[FINAL]';

  // Full provenance chain
  provenance: {
    gates: GateOutput[];
    totalVerificationGates: number;  // ~24
    wallClockMs: number;
    totalSubagentCalls: number;
    totalLLMTokens: { input: number; output: number };
  };
}
```

### The Final Report Structure

The report is generated with the following sections (dense, thoroughly audited):

```
# TRIDENT CODE AUDIT — {target} [FINAL]
## Score: {finalScore}/100 — {grade}
## Phase Summary
  | Phase | Duration | Subagents | Findings | Score Contribution |
## Cross-Phase Correlations
  (the TRIPLE-CONFIRMED defects — highest confidence)
## LASME Adjudicated Findings
  (each finding: which layer flagged it, the shadow's verdict,
   the evidence chain, the graph impact)
## MPSE Conformance Matrix
  (each contract: conformance verdict, epsilon status, stage gates)
## SRO Graph Intelligence
  (blast-radius per finding, dead-code list, circular dependencies)
## Legacy Findings (R0-R17)
  (the fast-layer findings, marked as [PRELIMINARY] contributions)
## Fix Order (consequence-ranked)
## Provenance Chain
  (~24 gates, wall clock, token usage, subagent telemetry)
```

---

## §3 IMPLEMENTATION ORDER

| Wave | Name | Scope | Files | Done-When |
|---|---|---|---|---|
| SH-0 | Universal boilerplate | `ShadowHydraPipeline`, `SubagentSpec`, `GraphMapper`, `SharedMemoryStore`, `GateCheck`, `EvidenceCollector` | `src/hydra/types.ts`, `src/hydra/pipeline.ts`, `src/hydra/subagent.ts`, `src/hydra/memory.ts`, `src/hydra/graph-mapper.ts` | boilerplate compiles + unit tests green |
| SH-1 | Graphify integration | Wrap graphify as pi SDK tools via MCP client | `src/hydra/graphify.ts` | graphify:query/path/explain/subgraph tools work in a pi Agent |
| SH-2 | LASME instance | 6 subagent specs + synthesizer + wire into pipeline | `src/hydra/instances/lasme.ts` | 6 concurrent muse calls produce LayerCandidate[] |
| SH-3 | MPSE instance | 4 subagent specs + synthesizer + reads LASME from memory | `src/hydra/instances/mpse.ts` | contract verification against LASME's shapes |
| SH-4 | SRO instance | 4 graph subagent specs + synthesizer + corbell bridge | `src/hydra/instances/sro.ts` | blast-radius matrix + dead-code + cycles |
| SH-5 | 4-phase orchestrator | PRELIMINARY score + async updates + the full pipeline | `src/audit-engine/index.ts` rewrite | full 4-phase pipeline completes end-to-end |
| SH-6 | Integration testing | Each gate independently + full pipeline + cross-phase | test files | all tests green + container-proven |

### File Ownership (disjoint sets, no merge conflicts)

| Wave | New Files | Modified Files |
|---|---|---|
| SH-0 | src/hydra/types.ts, pipeline.ts, subagent.ts, memory.ts, graph-mapper.ts | none |
| SH-1 | src/hydra/graphify.ts | none |
| SH-2 | src/hydra/instances/lasme.ts | none |
| SH-3 | src/hydra/instances/mpse.ts | none |
| SH-4 | src/hydra/instances/sro.ts, src/hydra/corbell-bridge.ts | none |
| SH-5 | none | src/audit-engine/index.ts (rewrite of mandate+batch-B blocks) |
| SH-6 | src/hydra/__tests__/*.test.ts | none |

---

## §4 TESTING STRATEGY

### Unit Tests (per-wave)
- SH-0: ShadowHydraPipeline dispatches N subagents concurrently (mocked transport)
- SH-1: GraphifyMCPClient connects, queries, disconnects (mocked MCP server)
- SH-2: Each LASME subagent returns valid LayerCandidate[] (mocked muse)
- SH-3: MPSE subagents read LASME output from mocked shared memory
- SH-4: SRO subagents produce blast-radius matrix from mocked graph
- SH-5: Pipeline returns PRELIMINARY immediately, updates as gates complete

### Integration Tests (SH-6)
- Full pipeline on /tmp/s2fix: 4 phases complete, ~24 gates pass
- Full pipeline on /tmp/rich: 6 r-layer subagent names appear in output
- Full pipeline on /tmp/gzfix (clean): 0 findings from LASME/MPSE/SRO
- Score evolution: PRELIMINARY → LASME-ADJUDICATED → MPSE-VERIFIED → FINAL
- Cross-phase correlation: same finding flagged by multiple gates → TRIPLE-CONFIRMED

### Container Tests
- Deploy the full pipeline to the container
- Run on a real target with muse live
- Verify: [PRELIMINARY] appears immediately, [FINAL] appears after completion
- Verify: graph.json exists, graphify MCP server starts, subagents can query it
- Verify: shared memory store persists across gates within a run

---

## §5 ANTI-PATTERNS AGAINST FALSE SUCCESS

| # | The Trap | The Failure Mode | Detection |
|---|---|---|---|
| AP-1 | SEQUENTIAL DISGUISED AS CONCURRENT | dispatching subagents in a for-loop instead of Promise.allSettled | measure wall clock: 6 subagents should take ~max(individual) not sum(individual) |
| AP-2 | MOCK SUBAGENT | a subagent that returns hardcoded findings without querying the graph or reading files | remove the graphify tools → subagent must fail loudly, not return cached results |
| AP-3 | GRAPH THEATER | claiming graphify integration but the subagents only grep, never query the graph | the subagent's evidence field must cite graph paths (graphify:path output) |
| AP-4 | ISOLATED GATES | LASME/MPSE/SRO each working but not reading each other's output | MPSE's system prompt must include LASME's findings; SRO must include both |
| AP-5 | THE PRELIMINARY LIE | returning [PRELIMINARY] but blocking until all phases complete anyway | the PRELIMINARY score must be available within 15s of tool invocation |
| AP-6 | THE FLAT MERGE | synthesizer just concatenates without cross-referencing | a finding flagged by both r-lexicon AND r-mpse must have crossReferenced: true |
| AP-7 | THE CORBELL BYPASS | writing directly to shared.db without going through the GraphMapper interface | all graph writes must go through the bridge transformation |
| AP-8 | CONTEXT OVERFLOW | stuffing the entire codebase into a single subagent's context | each subagent gets the graph + targeted file reads, not the full tree |
| AP-9 | THE SILENT TIMEOUT | a subagent times out but the pipeline continues without logging it | every rejected promise in allSettled must be logged with the error |
| AP-10 | SCORE THEATER | the final score doesn't actually include findings from all 4 phases | the score formula must be verifiable: legacy + LASME + MPSE + SRO findings |

---

## §6 SUCCESS CRITERIA

1. **6 concurrent subagents fire in parallel** — wall clock for LASME gate ≈ max(individual subagent time), not sum
2. **Each subagent queries the graph** — evidence field cites graph paths, not just file reads
3. **MPSE reads LASME's findings** — the MPSE system prompt includes LASME's candidates
4. **SRO reads both LASME and MPSE** — the SRO system prompt includes both gates' output
5. **Cross-phase correlations exist** — at least one TRIPLE-CONFIRMED defect on a suitable target
6. **[PRELIMINARY] score appears within 15s** — measured from tool invocation
7. **[FINAL] score appears after all 4 phases** — measured, with provenance
8. **~24 verification gates recorded** — the provenance chain lists each gate by name
9. **Graphify MCP server starts and subagents query it** — tool result evidence
10. **Corbell typed_nodes populated via the bridge** — CHECK constraints satisfied
11. **Shared memory persists across gates** — LASME output readable by MPSE and SRO
12. **The final report carries full provenance** — every finding traceable to its originating gate
13. **tsc 0 after all waves** — no type errors
14. **All existing suites still green** — shadow-backend, KG, hunter, report-writer

---

## §7 COMPACTION-PROOF IMPLEMENTATION GUIDE

### Documents to Maintain
- This spec (the design authority — never contradicted)
- `SHADOW_HYDRA_BOILERPLATE_L2_SPEC.md` (the framework spec)
- `KNOWLEDGE_LIBRARY/Bibles/SHADOW_AGENT_ENGINEERING_BIBLE.md` (the pi SDK bible)
- `KNOWLEDGE_LIBRARY/Bibles/SHADOW_HYDRA_INTEGRATION_BIBLE.md` (the integration guide)
- `Context_Management/RUNNING_DEBUG_LOG.md` (append per wave)
- `Context_Management/RUNNING_BUILD_LOG.md` (append per milestone)
- `.trident/wave-audit/<wave>.md` (per-wave audit)

### Resume Anchors
- Checkpoint: `Checkpoints/v443_wr_wave_complete_20260828/` (the pre-SH baseline)
- Canon docs: POST-COMPACTION_PROMPT.md (current SHA + resume pointer)
- Wave plan: `.trident/wave-plan.md` (SH wave budgets)

### Cross-Consistency Rules
- The dist SHA in POST-COMPACTION_PROMPT, BUILD_STATE, and EVIDENCE_STATE must agree
- The wave plan's WAVES count must match the SH wave table in §3
- The boilerplate spec's interfaces must match the code audit spec's usage

---

## §8 OPEN QUESTIONS

| # | Question | Recommendation |
|---|---|---|
| 1 | Graphify Python dependency: the container needs Python 3.10+ and graphifyy installed. Add to the container image? | Yes — add to the master image build; graphify is local-first, no API keys needed for --code-only |
| 2 | Muse rate limits under concurrent load: 6 LASME + 4 MPSE + 4 SRO = 14 concurrent muse calls per audit. Does the opencode-go endpoint handle this? | The retry chain (5×2.5s) handles transient 429s. Monitor and adjust if needed. |
| 3 | The R0-PREFLIGHT walk bug: fix before or during the SH build? | Before — it's a 1-line fix (apply DEFAULT_EXCLUDE to the preflight walk). |
| 4 | Corbell bridge direction: one-way (graphify → corbell) or bidirectional? | One-way for Phase 1. The SRO gate writes to corbell; nothing reads back. Bidirectional (corbell → graphify annotations) is a Phase 2 enhancement. |
| 5 | Should the existing sequential r-*.ts files be deleted or kept as fallback? | Keep as fallback (the `ShadowHydraPipeline` can degrade to sequential if muse is unreachable). The concurrent path is the primary. |

---

## APPENDIX A — ZERO-TRUST AUDIT

| Severity | Finding | Surgical Edit |
|---|---|---|
| LOW | Graphify requires Python in the container | Documented in §8 Q1 |
| LOW | Concurrent muse load untested at 14 agents | Documented in §8 Q2 |
| INFO | The boilerplate spec (SHADOW_HYDRA_BOILERPLATE_L2_SPEC.md) carries the TypeScript interfaces; this spec references them | Intentional separation of concerns |
| INFO | The bibles carry the pi SDK engineering lessons | Intentional — project-agnostic knowledge |

**Verdict:** 0 CRITICAL, 0 HIGH, 2 LOW (documented), 2 INFO — no unresolvable gaps.

<!-- DOC-COMPLETE -->

---

## §2.12 THE SUBAGENT DISPATCH ALGORITHM (Complete Implementation)

### 2.12.0 The dispatchSubagent Function

```
ALGORITHM: dispatchSubagent(spec, input, graph, tools, transport, memory)
INPUT: SubagentSpec, PipelineInput, GraphifyGraph, AgentTool[], LLMTransport, SharedMemoryStore
OUTPUT: Promise<TSubResult> (validated against spec.outputSchema)

BEGIN
  1. BUILD SYSTEM PROMPT
     prompt ← spec.buildSystemPrompt(input, graph, memory)
     // The prompt includes:
     //   - The layer directive (what this agent looks for)
     //   - The GRAPH TOOLS USAGE LAW (the graphify warhead)
     //   - The output contract (the JSON schema the agent must return)
     //   - Prior gate findings (from memory, if this is not the first gate)

  2. BUILD USER PROMPT
     userPrompt ← spec.buildUserPrompt(input)
     // The task instruction: "Scan {targetRoot} and return findings as JSON"

  3. CONSTRUCT THE PI SDK AGENT
     agent ← new Agent({
       initialState: {
         systemPrompt: prompt,
         model: transport.getModel(),
         tools: [...graphifyTools, ...spec.additionalTools],
         thinkingLevel: spec.thinkingLevel ?? 'xhigh',
       },
       streamFn: transport.chainedStream,
       toolExecution: 'parallel',
       maxTokens: spec.maxTokens,
       shouldStopAfterTurn: (ctx) => {
         // Cap at 12 LLM calls per subagent (the turn cap)
         const llmCalls = ctx.newMessages?.filter(m => m.role === 'assistant').length ?? 0
         return llmCalls >= 12
       },
     })

  4. RUN WITH TIMEOUT
     timeoutPromise ← Promise.race([
       agent.prompt(userPrompt),
       new Promise((_, reject) =>
         setTimeout(() => reject(new Error('SUBAGENT_TIMEOUT')), spec.timeout)
       )
     ])
     result ← await timeoutPromise
     await agent.waitForIdle()

  5. EXTRACT AND VALIDATE OUTPUT
     finalMessage ← agent.state.messages[agent.state.messages.length - 1]
     jsonText ← extractJSON(finalMessage.content)
     parsed ← spec.outputSchema.safeParse(jsonText)
     IF NOT parsed.success:
       THROW Error("Subagent ${spec.id} schema validation failed: ${parsed.error.message}")

  6. EXTRACT GRAPH SLICE
     // The agent's graphify tool calls reveal what subgraph it was viewing
     graphSlice ← extractGraphSliceFromToolCalls(agent.state.messages)

  7. RETURN
     RETURN { ...parsed.data, graphSlice, telemetry: extractTelemetry(agent) }
END
```

### 2.12.1 The Concurrent Dispatch (Promise.allSettled)

```
ALGORITHM: dispatchAllSubagents(config, input, graph, transport, memory)
INPUT: PipelineConfig, PipelineInput, GraphifyGraph, LLMTransport, SharedMemoryStore
OUTPUT: SubagentSettlement<TSubResult>[]

BEGIN
  1. CREATE THE MCP SERVER (once, shared by all subagents)
     mcpClient ← new GraphifyMCPClient()
     await mcpClient.connect(graphPath)
     graphifyTools ← createGraphifyTools(mcpClient)

  2. DISPATCH ALL SUBAGENTS CONCURRENTLY
     dispatchPromises ← config.subagents.map(spec =>
       dispatchSubagent(spec, input, graph, graphifyTools, transport, memory)
     )

  3. AWAIT ALL (one rejection does NOT kill the batch)
     settled ← await Promise.allSettled(dispatchPromises)

  4. MAP TO SETTLEMENTS
     results ← settled.map((outcome, i) → ({
       subagentId: config.subagents[i].id,
       status: outcome.status,  // 'fulfilled' | 'rejected'
       value: outcome.status === 'fulfilled' ? outcome.value : undefined,
       reason: outcome.status === 'rejected' ? outcome.reason : undefined,
     }))

  5. LOG REJECTED SUBAGENTS (loud, never silent)
     FOR EACH result WHERE status === 'rejected':
       evidence.log('SUBAGENT_REJECTED', {
         subagentId: result.subagentId,
         error: String(result.reason),
         timestamp: Date.now(),
       })

  6. DISCONNECT MCP SERVER
     await mcpClient.disconnect()

  RETURN results
END
```

### 2.12.2 Timing Analysis

```
CONCURRENT (target architecture):
  6 subagents, each ~30s (muse composition + graph queries)
  Wall clock = max(30s, 30s, 30s, 30s, 30s, 30s) = ~30s

SEQUENTIAL (current architecture):
  6 function calls, each ~1ms (AST predicates)
  Wall clock = 6 × 1ms = ~6ms (but zero intelligence)

WITH SHADOW ADJUDICATION (after synthesis):
  LASME gate: ~30s (concurrent) + ~60s (shadow) = ~90s total
  MPSE gate: ~30s (concurrent) = ~30s (no shadow — contracts verified directly)
  SRO gate: ~20s (concurrent graph queries) = ~20s
  TOTAL: ~140s (vs. current 5-10 minutes for a single shadow run)
```

---

## §2.13 THE SYNTHESIZER ALGORITHMS

### 2.13.0 The LASME Synthesizer

```
ALGORITHM: lasmeSynthesize(results, graph, memory)
INPUT: SubagentSettlement<LayerCandidate[]>[], GraphifyGraph, SharedMemoryStore
OUTPUT: { candidates: SynthesizedCandidate[], graphSlice: MergedGraphSlice }

BEGIN
  1. MERGE FULFILLED RESULTS
     allCandidates ← []
     FOR EACH result IN results WHERE status === 'fulfilled':
       allCandidates ← allCandidates + result.value.candidates

  2. DEDUPLICATE
     // Remove candidates with identical (file, line, predicate, object)
     seenKeys ← new Set<string>()
     deduped ← []
     FOR EACH candidate IN allCandidates:
       key ← `${candidate.file}:${candidate.line}:${candidate.predicate}:${candidate.object}`
       IF key NOT IN seenKeys:
         seenKeys.add(key)
         deduped.push(candidate)

  3. CROSS-REFERENCE BOOST
     // Group by (file, line) — multiple layers flagging the same site
     bySite ← Map<string, LayerCandidate[]>()
     FOR EACH candidate IN deduped:
       siteKey ← `${candidate.file}:${candidate.line}`
       bySite.get(siteKey).push(candidate)

     FOR EACH candidate IN deduped:
       sameSite ← bySite.get(`${candidate.file}:${candidate.line}`)
       IF sameSite.length > 1:
         candidate.crossReferenced ← true
         candidate.confidence ← min(candidate.confidence + 0.1, 1.0)
         candidate.crossReferencedBy ← sameSite.map(c → c.layer).filter(l → l !== candidate.layer)

  4. RANK BY SEVERITY × CONFIDENCE
     sorted ← deduped.sort((a, b) →
       severityWeight(b) * b.confidence - severityWeight(a) * a.confidence)

  5. MERGE GRAPH SLICES
     graphSlices ← results.filter(fulfilled).map(r → r.value.graphSlice)
     mergedGraph ← await graphMapper.merge(graphSlices)

  RETURN { candidates: sorted, graphSlice: mergedGraph }
END
```

### 2.13.1 The MPSE Synthesizer

```
ALGORITHM: mpseSynthesize(results, graph, memory)
INPUT: SubagentSettlement<ConformanceResult[]>[], GraphifyGraph, SharedMemoryStore
OUTPUT: { conformanceMatrix, violations, traceGaps }

BEGIN
  1. READ LASME OUTPUT FROM SHARED MEMORY
     lasmeOutput ← memory.getGateOutput('LASME')
     lasmeCandidates ← lasmeOutput?.synthesis?.candidates ?? []

  2. BUILD THE CONFORMANCE MATRIX
     // For each declared contract, find its implementation status
     matrix ← []
     FOR EACH result IN results WHERE status === 'fulfilled':
       FOR EACH conformance IN result.value.conformances:
         matrix.push({
           contractId: conformance.contractId,
           specPath: conformance.specPath,
           specLine: conformance.specLine,
           implementationStatus: conformance.status,  // 'conformant' | 'violated' | 'unimplemented'
           verificationAgent: result.subagentId,
           lasmeShapeFound: lasmeCandidates.some(c →
             c.file === conformance.file && c.line === conformance.line),
         })

  3. EXTRACT VIOLATIONS
     violations ← matrix.filter(m → m.implementationStatus === 'violated')

  4. EXTRACT TRACE GAPS
     traceGaps ← matrix.filter(m → m.implementationStatus === 'unimplemented')
     // Each trace gap = a spec clause with no code implementation found

  RETURN { conformanceMatrix: matrix, violations, traceGaps }
END
```

### 2.13.2 The SRO Synthesizer

```
ALGORITHM: sroSynthesize(results, graph, memory)
INPUT: SubagentSettlement<GraphIntelligenceResult[]>[], GraphifyGraph, SharedMemoryStore
OUTPUT: { blastRadius, deadCode, cycles, correlations }

BEGIN
  1. READ LASME + MPSE FROM SHARED MEMORY
     lasmeOutput ← memory.getGateOutput('LASME')
     mpseOutput ← memory.getGateOutput('MPSE')
     allFindings ← [
       ...(lasmeOutput?.synthesis?.candidates ?? []),
       ...(mpseOutput?.synthesis?.violations ?? []),
     ]

  2. BUILD BLAST-RADIUS MATRIX
     blastRadius ← []
     FOR EACH finding IN allFindings:
       paths ← await graphify.path(graph, finding.subject, '*')  // all downstream paths
       blastRadius.push({
         findingId: finding.id,
         impactPaths: paths.map(p → ({
           from: finding.file + ':' + finding.line,
           to: p.destination,
           hops: p.length,
           edgeTypes: p.edges.map(e → e.relation),
         })),
         downstreamCount: paths.length,
       })

  3. BUILD CROSS-PHASE CORRELATIONS
     correlations ← []
     FOR EACH finding IN allFindings:
       flaggedByLasme ← lasmeOutput?.synthesis?.candidates?.some(c →
         c.file === finding.file && c.line === finding.line) ?? false
       flaggedByMpse ← mpseOutput?.synthesis?.violations?.some(v →
         v.file === finding.file && v.line === finding.line) ?? false
       hasGraphImpact ← blastRadius.find(b →
         b.findingId === finding.id)?.downstreamCount > 0 ?? false

       correlations.push({
         findingId: finding.id,
         flaggedBy: { lasme: flaggedByLasme, mpse: flaggedByMpse, sro: hasGraphImpact },
         tripleConfirmed: flaggedByLasme && flaggedByMpse && hasGraphImpact,
         recommendedSeverity: (flaggedByLasme && flaggedByMpse && hasGraphImpact)
           ? 'CRITICAL'  // TRIPLE-CONFIRMED
           : (flaggedByLasme || flaggedByMpse) ? 'HIGH' : 'MEDIUM',
       })

  4. COLLECT DEAD CODE AND CYCLES
     deadCode ← results.find(r → r.subagentId === 'dead-code-hunter')?.value ?? []
     cycles ← results.find(r → r.subagentId === 'cycle-hunter')?.value ?? []

  RETURN { blastRadius, deadCode, cycles, correlations }
END
```

---

## §2.14 THE PIPELINE ORCHESTRATOR (How the 4 Phases Coordinate)

### 2.14.0 The Orchestrator Function

```typescript
async function audit(targetPath: string): Promise<AuditResult> {
  const memory = new SQLiteMemoryStore(
    path.join(targetPath, '.trident', 'knowledge-graph', 'shared.db')
  );
  const graphMapper = new GraphifyMCPMapper();
  const transport = createMuseTransport();

  // ═══ PHASE 1: LEGACY SWEEP (fast, ~5-15s) ═══
  const legacyResult = await runLegacyLayers(targetPath);
  // R0-R17 layers fire, produce findings
  // Score computed from legacy findings only
  // [PRELIMINARY] artifact saved immediately

  updateArtifact(targetPath, legacyResult, '[PRELIMINARY]');
  // ← The tool RETURNS here with the preliminary score
  // The caller can read the artifact for the preliminary results

  // ═══ PHASE 2: LASME SHADOW GATE (~60-90s) ═══
  try {
    const lasmeGate = new ShadowHydraPipeline({
      name: 'LASME',
      subagents: [lexiconSpec, actorSpec, stateMachineSpec,
                  engineSpec, adapterSpec, mpseSpec],
      synthesizer: lasmeSynthesize,
      gates: { pre: [auditSpecExists, bindingsParse], post: [candidatesHaveTriads] },
      transport, memory, graphMapper,
    });
    const lasmeResult = await lasmeGate.execute({ targetPath, specs: specPaths });

    updateArtifact(targetPath, legacyResult + lasmeResult, '[LASME-ADJUDICATED]');

    // ═══ PHASE 3: MPSE SHADOW GATE (~30s) ═══
    const mpseGate = new ShadowHydraPipeline({
      name: 'MPSE',
      subagents: [contractCheckerSpec, oracleCheckerSpec,
                  stageCheckerSpec, provenanceCheckerSpec],
      synthesizer: mpseSynthesize,
      gates: { pre: [lasmeComplete], post: [contractsVerified] },
      transport, memory, graphMapper,
    });
    const mpseResult = await mpseGate.execute({ targetPath, specs: specPaths });

    updateArtifact(targetPath, legacyResult + lasmeResult + mpseResult, '[MPSE-VERIFIED]');

    // ═══ PHASE 4: SRO GRAPH SHADOW GATE (~20s) ═══
    const sroGate = new ShadowHydraPipeline({
      name: 'SRO',
      subagents: [graphBuilderSpec, pathHunterSpec,
                  deadCodeHunterSpec, cycleHunterSpec],
      synthesizer: sroSynthesize,
      gates: { pre: [lasmeComplete, mpseComplete], post: [findingsHavePaths] },
      transport, memory, graphMapper,
    });
    const sroResult = await sroGate.execute({ targetPath });

    // ═══ FINAL SYNTHESIS ═══
    const finalResult = mergeAllPhases(legacyResult, lasmeResult, mpseResult, sroResult);
    updateArtifact(targetPath, finalResult, '[FINAL]');

    return finalResult;
  } catch (gateError) {
    // A gate failure is a LOUD error — the pipeline does NOT continue
    // with degraded results silently
    tridentLog('ERROR', 'audit-engine', `Shadow gate failed: ${gateError.message}`);
    // The [PRELIMINARY] artifact remains — the caller has the legacy results
    return legacyResult;
  }
}
```

---

## §3.1 FILE MANIFEST

| File | Estimated Lines | Responsibility | Wave |
|---|---|---|---|
| `src/hydra/types.ts` | ~200 | All TypeScript interfaces (ShadowHydraPipeline, SubagentSpec, GraphMapper, SharedMemoryStore, GateCheck, EvidenceCollector, LLMTransport) | SH-0 |
| `src/hydra/pipeline.ts` | ~350 | The ShadowHydraPipeline class (execute, dispatchSubagent, failLoud) | SH-0 |
| `src/hydra/subagent.ts` | ~250 | The subagent dispatch logic (build prompt, create Agent, run, validate) | SH-0 |
| `src/hydra/memory.ts` | ~200 | SQLite SharedMemoryStore implementation | SH-0 |
| `src/hydra/graph-mapper.ts` | ~150 | GraphMapper interface + stub implementation | SH-0 |
| `src/hydra/graphify.ts` | ~300 | GraphifyMCPClient + AgentTool wrappers | SH-1 |
| `src/hydra/instances/lasme.ts` | ~250 | LASME gate config (6 subagent specs + synthesizer) | SH-2 |
| `src/hydra/instances/mpse.ts` | ~200 | MPSE gate config (4 subagent specs + synthesizer) | SH-3 |
| `src/hydra/instances/sro.ts` | ~250 | SRO gate config (4 subagent specs + synthesizer) + corbell bridge | SH-4 |
| `src/audit-engine/index.ts` | modified | The 4-phase pipeline orchestrator (replaces mandate + batch-B blocks) | SH-5 |
| `src/hydra/__tests__/` | ~600 | Unit + integration tests per component | SH-6 |
| **TOTAL** | **~2,750** | | |

---

## §3.2 BIBLE COMPLIANCE MATRIX

| Bible Lesson | Applies To | Component | How It's Enforced |
|---|---|---|---|
| API Family Law | every LLM call | LLMTransport | uses /responses route exclusively |
| Key Seeding Lifecycle | pipeline start | memory.ts | module-scope seed in provider.ts |
| Marker Teaching | report generation | shadow runner | byte-exact 8-heading skeleton in system prompt |
| Thinking Budget Injection | chainedStream | transport.ts | explicit reasoningEffort + thinkingBudgets |
| Write-Scope Law | tool execution | tools.ts | resolveForWrite on every write |
| Done-Verifier | stream consumption | chainedStream | content must be array before accepting done |
| Stall Guard | every stream | chainedStream | 60s event-aware timeout |
| Loud Fail | every failure path | pipeline.ts | failLoud with named error + remedy |
| Budget Formula | phase controller | phase-controller.ts | max(3, 4+ceil(c/8)) |
| Tool Budget Capping | tool execution | tools.ts | READ_FILE_MAX_LINES=320, GREP_MAX=120 |

---

## §4.1 PER-COMPONENT TEST SPECIFICATIONS

### Pipeline Tests
| Test | Input | Expected | Type |
|---|---|---|---|
| Concurrent dispatch | 3 mocked subagents, each returning in 100ms | Wall clock ≈ 100ms (not 300ms) | unit |
| Rejection tolerance | 2 fulfill + 1 reject | Pipeline completes, rejection logged | unit |
| Pre-gate failure | invalid input | Pipeline returns loud error | unit |
| Post-gate failure | invalid synthesis | Pipeline returns loud error | unit |
| Memory round-trip | Gate 1 stores, Gate 2 reads | Gate 2 sees Gate 1's output | unit |
| Graphify integration | real graph.json + MCP server | graphify:query returns subgraph | integration |
| Full pipeline | real target + muse transport | 4 phases complete, [FINAL] score | integration |

### LASME Gate Tests
| Test | Input | Expected | Type |
|---|---|---|---|
| 6 concurrent subagents | /tmp/rich fixture | all 6 layer names in output | integration |
| Cross-reference boost | same site flagged by 2 agents | confidence boosted +0.1 | unit |
| Graph slice merge | 6 graph slices | merged graph contains all perspectives | unit |
| Shadow adjudication | synthesized candidates | verdicts.json + report.md + manifest.json | integration |

### MPSE Gate Tests
| Test | Input | Expected | Type |
|---|---|---|---|
| Reads LASME output | LASME gate completed first | MPSE prompt includes LASME candidates | unit |
| Contract verification | spec with 3 contracts | conformance matrix has 3 entries | integration |
| Epsilon violation | threshold without bound | violation flagged | integration |
| TRACE_GAP detection | spec clause with no implementation | TRACE_GAP finding emitted | integration |

### SRO Gate Tests
| Test | Input | Expected | Type |
|---|---|---|---|
| Blast radius | finding with 3 downstream callers | impact paths traced | integration |
| Dead code detection | unused export | dead-code finding | integration |
| Cycle detection | circular import chain | cycle finding | integration |
| TRIPLE-CONFIRMED | finding flagged by all 3 gates | severity CRITICAL + confidence 1.0 | integration |
| Corbell bridge | graphify nodes | typed_nodes with CHECK constraints | integration |

---

## §9 MIGRATION STRATEGY

### Phase A: Build the Framework (SH-0 + SH-1)
No existing code changes. The `src/hydra/` directory is entirely new. The existing mandate block and batch-B block continue to work alongside the new framework.

### Phase B: Wire the LASME Gate (SH-2)
The LASME gate replaces the sequential 6-layer concat in `index.ts:305-321`. The old `rLexiconCandidates()` etc. function calls remain in the codebase as FALLBACK (used when muse is unreachable). The new concurrent dispatch is the PRIMARY path.

**The switch:** `if (museAvailable) use LASME gate else use sequential fallback`

### Phase C: Wire the MPSE Gate (SH-3)
The MPSE gate is entirely NEW functionality — there is no existing MPSE meta-layer. It adds contract verification that didn't exist before.

### Phase D: Wire the SRO Gate (SH-4)
The SRO gate replaces the Batch-B block (`index.ts:404-513`). The old `r-graph/r-dh-feed/r-provenance` layers remain as fallback. The new SRO gate provides the same graph intelligence PLUS blast-radius, dead-code, cycle detection, and cross-phase correlation.

### Phase E: The PRELIMINARY Score (SH-5)
The `audit()` function in `index.ts` is restructured to:
1. Return the legacy score immediately as `[PRELIMINARY]`
2. Continue running the gates in the background
3. Update the artifact on disk as each gate completes
4. The tool surface (trident-code-audit) returns the preliminary result, and the artifact file reflects the evolving state

### Phase F: Integration Testing (SH-6)
Full pipeline tested on fixtures + real targets + container.

---

## §10 THE ~24 VERIFICATION GATES (Full List)

| # | Phase | Gate | What It Checks |
|---|---|---|---|
| 1 | Legacy | preflight | tsc, build, dist exist |
| 2 | Legacy | scope probe | AST builds, no pathological files |
| 3 | Legacy | source count | ≥1 .ts file in scope |
| 4 | LASME | audit-spec exists | .trident/audit-spec.json present |
| 5 | LASME | bindings parse | ≥1 declaration from spec |
| 6 | LASME | graphify extract | graph.json valid, ≥1 node |
| 7 | LASME | subagent schema | each output validates against zod |
| 8 | LASME | candidates have triads | layer + file + line + evidence |
| 9 | LASME | machineId domain | never "layer-engine" |
| 10 | LASME | shadow probe | muse reachable, ≤5s |
| 11 | LASME | validator V0-V8 | 9 validation rules on verdicts |
| 12 | LASME | marker check | 8/8 headings byte-exact |
| 13 | LASME | counts reconcile | TD+RH+UNC === candidatesIn |
| 14 | MPSE | LASME complete | gate output exists in memory |
| 15 | MPSE | contracts parse | ≥1 contract declaration |
| 16 | MPSE | conformance complete | every contract has a verdict |
| 17 | MPSE | epsilon verified | every bound enforced or flagged |
| 18 | MPSE | TRACE_GAP named | every gap has file:line for missing impl |
| 19 | SRO | LASME+MPSE complete | both gate outputs in memory |
| 20 | SRO | graph populated | ≥1 node, ≥1 edge in merged graph |
| 21 | SRO | blast radius computed | every finding has impact paths |
| 22 | SRO | dead code measured | list present or confirmed empty |
| 23 | SRO | cycles detected | found or confirmed absent |
| 24 | Final | score evolution | PRELIMINARY → LASME → MPSE → FINAL |

<!-- DOC-COMPLETE -->
