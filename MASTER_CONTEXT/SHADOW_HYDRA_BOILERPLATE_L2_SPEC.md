# SHADOW HYDRA BOILERPLATE — L2 SPECIFICATION

**Version:** 1.0.0 · **Date:** 2026-08-28 · **Status:** DESIGN AUTHORITY
**Purpose:** The universal multi-layer async subagent pipeline framework — carries ALL the infrastructure and gets instantiated for any use case.
**Reference integration:** V443_SHADOW_HYDRA_CODE_AUDIT_L2_SPEC.md
**Foundation:** KNOWLEDGE_LIBRARY/agent_plugin_boilerplates/shadow_agent_backend
**Bibles:** KNOWLEDGE_LIBRARY/Bibles/SHADOW_AGENT_ENGINEERING_BIBLE.md, SHADOW_HYDRA_INTEGRATION_BIBLE.md

---

## §0 THE FUNDAMENTAL PROBLEM

There is no universal framework for "N concurrent LLM subagents scan a target from different angles, then a synthesizer merges their findings." Every project that needs this pattern (code audit, security review, architecture review, documentation audit) rebuilds the same infrastructure from scratch: transport, dispatch, memory, gates, evidence, synthesis.

**Operator's ruling (verbatim):**
> "really we need to make a universally applicable boilerplate for this and then each meta layer LASME/MPSE/SRO Graph will have a dedicated wired version of this"

The boilerplate carries ALL the structure/infra of the Shadow Hydra architecture. The target instance only provides: subagent specs, a synthesizer, and gate conditions.

---

## §1 DESIGN REQUIREMENTS

1. **Universal:** not coupled to code audit — usable for any multi-agent pipeline
2. **Variable topology:** N subagents per pipeline (N ≥ 1), M sequential pipelines (M ≥ 1)
3. **Concurrent within, sequential between:** subagents fire async (Promise.allSettled); pipelines run in sequence
4. **Fail-closed:** every gate validates; a failed gate stops the pipeline loudly
5. **Evidence-first:** every subagent action is logged (reads, graph queries, LLM calls)
6. **Graph-native:** every subagent has graph tools (graphify MCP integration)
7. **Memory-shared:** cross-pipeline and cross-run memory (SQLite now, TencentDB later)
8. **Pi SDK native:** built on the shadow agent backend boilerplate (Agent, createModels, providers, chainedStream)

---

## §2.1 ShadowHydraPipeline (THE CORE CLASS)

```typescript
export class ShadowHydraPipeline<
  TInput extends PipelineInput,
  TSubResult extends SubagentResult,
  TSynthesis,
  TOutput extends PipelineOutput,
> {
  readonly config: PipelineConfig<TInput, TSubResult, TSynthesis, TOutput>;
  readonly memory: SharedMemoryStore;
  readonly graphMapper: GraphMapper;
  readonly evidence: EvidenceCollector;

  async execute(input: TInput): Promise<TOutput> {
    // 1. PRE-GATES
    for (const gate of this.config.gates.pre) {
      const result = await gate.check(input);
      if (!result.passed) {
        return this.failLoud(gate, result.reason, input);
      }
    }

    // 2. GRAPH EXTRACTION (once, shared by all subagents)
    const graph = await this.graphMapper.extract(input.targetRoot, {
      codeOnly: true,
      scope: this.config.graphScope,
      exclude: this.config.graphExclude,
    });

    // 3. CONCURRENT SUBAGENT DISPATCH
    const dispatchPromises = this.config.subagents.map(spec =>
      this.dispatchSubagent(spec, input, graph)
    );
    const settled = await Promise.allSettled(dispatchPromises);

    // 4. COLLECT (one rejection does NOT kill the batch)
    const results: SubagentSettlement<TSubResult>[] = settled.map((outcome, i) => ({
      subagentId: this.config.subagents[i].id,
      status: outcome.status,
      value: outcome.status === 'fulfilled' ? outcome.value : undefined,
      reason: outcome.status === 'rejected' ? outcome.reason : undefined,
    }));

    // Log rejected agents (loud, never silent)
    for (const r of results) {
      if (r.status === 'rejected') {
        this.evidence.log('SUBAGENT_REJECTED', {
          subagentId: r.subagentId,
          error: String(r.reason),
        });
      }
    }

    // 5. SYNTHESIZE
    const synthesis = await this.config.synthesizer(results, graph, this.memory);

    // 6. POST-GATES
    for (const gate of this.config.gates.post) {
      const result = await gate.check(synthesis);
      if (!result.passed) {
        return this.failLoud(gate, result.reason, synthesis);
      }
    }

    // 7. PERSIST
    this.memory.setGateOutput(this.config.name, {
      gateName: this.config.name,
      synthesis,
      results,
      telemetry: this.evidence.getTelemetry(),
    });

    // 8. RETURN
    return this.config.buildOutput(synthesis, results, this.evidence);
  }

  private async dispatchSubagent(
    spec: SubagentSpec<TInput, TSubResult>,
    input: TInput,
    graph: GraphifyGraph,
  ): Promise<TSubResult> {
    // Build the layer-specific system prompt
    const systemPrompt = spec.buildSystemPrompt(input, graph, this.memory);

    // Create a pi SDK Agent with the graphify tools + read/grep tools
    const agent = new Agent({
      initialState: {
        systemPrompt,
        model: this.getModel(),
        tools: [
          ...this.graphMapper.asAgentTools(graph),
          ...spec.additionalTools ?? [],
        ],
        thinkingLevel: spec.thinkingLevel ?? 'xhigh',
      },
      streamFn: this.getTransport().chainedStream.bind(this.getTransport()),
      toolExecution: 'parallel',
      maxTokens: spec.maxTokens,
    });

    // Run the agent
    const result = await agent.prompt(spec.buildUserPrompt(input));
    await agent.waitForIdle();

    // Validate output against the schema
    const parsed = spec.outputSchema.safeParse(JSON.parse(result.text));
    if (!parsed.success) {
      throw new Error(`Subagent ${spec.id} output failed schema validation: ${parsed.error.message}`);
    }

    return parsed.data;
  }
}
```

---

## §2.2 SubagentSpec + LayerSubagent

```typescript
export interface SubagentSpec<TInput, TSubResult> {
  /** Unique identifier within the pipeline */
  id: string;

  /** Build the system prompt for this subagent (includes graphify warheads) */
  buildSystemPrompt(input: TInput, graph: GraphifyGraph, memory: SharedMemoryStore): string;

  /** Build the user prompt (the task instruction) */
  buildUserPrompt(input: TInput): string;

  /** Zod schema for validating the subagent's output */
  outputSchema: z.ZodSchema<TSubResult>;

  /** Graphify queries this subagent should run first (optional warm-up) */
  graphQueries?: string[];

  /** Additional pi SDK tools beyond the graphify set */
  additionalTools?: AgentTool[];

  /** LLM budget per subagent */
  maxTokens: number;

  /** Investigation rounds */
  maxRounds: number;

  /** Wall-clock timeout per subagent */
  timeout: number;

  /** Thinking level for the LLM */
  thinkingLevel?: 'medium' | 'high' | 'xhigh' | 'max';
}

export interface SubagentSettlement<T> {
  subagentId: string;
  status: 'fulfilled' | 'rejected';
  value?: T;
  reason?: Error;
}
```

---

## §2.3 GraphMapper Interface (the Graphify integration)

```typescript
export interface GraphMapper {
  /** Extract the codebase into a knowledge graph (tree-sitter, no LLM) */
  extract(targetRoot: string, opts?: {
    codeOnly?: boolean;
    scope?: string[];
    exclude?: string[];
  }): Promise<GraphifyGraph>;

  /** Query the graph with a natural-language question */
  query(graph: GraphifyGraph, question: string): Promise<Subgraph>;

  /** Trace the shortest path between two concepts */
  path(graph: GraphifyGraph, from: string, to: string): Promise<Path>;

  /** Explain a concept (its connections, community, degree) */
  explain(graph: GraphifyGraph, concept: string): Promise<NodeDetail>;

  /** Merge multiple graph slices into one */
  merge(slices: object[]): Promise<GraphifyGraph>;

  /** Convert graphify tools to pi SDK AgentTools */
  asAgentTools(graph: GraphifyGraph): AgentTool[];
}

export interface GraphifyGraph {
  nodes: GraphifyNode[];
  edges: GraphifyEdge[];
  communities: Community[];
  godNodes: string[];
}

export interface GraphifyNode {
  id: string;
  label: string;
  type: string;  // 'class' | 'function' | 'interface' | 'file' | ...
  file: string;
  data?: Record<string, unknown>;
}

export interface GraphifyEdge {
  src: string;
  dst: string;
  relation: string;      // 'calls' | 'imports' | 'inherits' | ...
  confidence: 'EXTRACTED' | 'INFERRED';
}
```

---

## §2.4 SharedMemoryStore Interface

```typescript
export interface SharedMemoryStore {
  /** Within a pipeline run: gates share findings */
  setGateOutput(gateId: string, data: GateOutput): void;
  getGateOutput<T extends GateOutput>(gateId: string): T | null;

  /** Across runs: the compounding effect */
  persistRun(runId: string, data: RunSummary): void;
  getPriorRun(runId: string): RunSummary | null;
  getChangedFiles(sinceRunId: string): string[];

  /** Graph access */
  getGraph(): unknown | null;
  mergeGraphSlice(slice: object): void;
  queryGraph(query: string): Promise<unknown>;

  /** Backend abstraction */
  readonly backend: 'sqlite' | 'tencentdb';
}
```

---

## §2.5 GateCheck Interface

```typescript
export interface GateCheck<T> {
  name: string;
  description: string;
  check(target: T): Promise<GateResult>;
}

export interface GateResult {
  passed: boolean;
  reason?: string;
  evidence?: Record<string, unknown>;
}
```

---

## §2.6 EvidenceCollector

```typescript
export interface EvidenceCollector {
  log(event: string, data: Record<string, unknown>): void;
  getTelemetry(): PipelineTelemetry;
  getEvidenceLog(): EvidenceEntry[];
}

export interface PipelineTelemetry {
  totalDurationMs: number;
  subagentCount: number;
  fulfilledCount: number;
  rejectedCount: number;
  totalTokensIn: number;
  totalTokensOut: number;
  gatesPassed: number;
  gatesFailed: number;
}
```

---

## §2.7 LLMTransport (the pi SDK integration)

The transport is the existing shadow agent backend's chainedStream, wrapped:

```typescript
export interface LLMTransport {
  /** The pi SDK model used by all subagents */
  getModel(): pi.Model;

  /** The chainedStream with retry + stall + done-verifier */
  chainedStream(model: unknown, context: unknown, options: unknown): unknown;

  /** Provider info for telemetry */
  readonly providerId: string;
  readonly modelId: string;
}
```

This wraps the existing `ShadowAgent` class's transport (already proven: muse on /responses, retry 5×2.5s, stall 60s, done-verifier).

---

## §2.8 The Pipeline Lifecycle

```
INPUT → preGates → graphify extract → dispatch N concurrent subagents
  → collect (allSettled, log rejections) → synthesize → postGates
  → persist to shared memory → RETURN output
```

**Key invariants:**
1. One subagent rejection does NOT kill the batch (allSettled)
2. Every gate failure returns a LOUD error (never a silent pass)
3. Every subagent's evidence is logged (reads, graph queries, LLM tokens)
4. The synthesizer receives ALL results (including rejections, which it can factor in)
5. The graph is extracted ONCE and shared by ALL subagents

---

## §3 REFERENCE INTEGRATION (the code audit tool)

The code audit tool instantiates `ShadowHydraPipeline` three times:

```typescript
// LASME gate (6 concurrent layer subagents)
const lasmeGate = new ShadowHydraPipeline({
  name: 'LASME',
  subagents: [lexiconSpec, actorSpec, stateMachineSpec, engineSpec, adapterSpec, mpseSpec],
  synthesizer: lasmeSynthesis,
  gates: { pre: [specExists, bindingsParse], post: [candidatesHaveTriads] },
  transport: museTransport,
  memory: sharedDb,
  graphMapper: graphifyMCP,
});

// MPSE gate (4 concurrent contract checkers, reads LASME)
const mpseGate = new ShadowHydraPipeline({
  name: 'MPSE',
  subagents: [contractCheckerSpec, oracleCheckerSpec, stageCheckerSpec, provenanceCheckerSpec],
  synthesizer: mpseSynthesis,
  gates: { pre: [lasmeComplete], post: [contractsVerified] },
  transport: museTransport,
  memory: sharedDb,
  graphMapper: graphifyMCP,
});

// SRO gate (4 concurrent graph hunters, reads LASME + MPSE)
const sroGate = new ShadowHydraPipeline({
  name: 'SRO',
  subagents: [graphBuilderSpec, pathHunterSpec, deadCodeHunterSpec, cycleHunterSpec],
  synthesizer: sroSynthesis,
  gates: { pre: [lasmeComplete, mpseComplete], post: [findingsHavePaths] },
  transport: museTransport,
  memory: sharedDb,
  graphMapper: graphifyMCP,
});

// The 4-phase pipeline (sequential gates)
const result = await audit(targetPath);
// Phase 1: legacy (fast, returns PRELIMINARY)
// Phase 2: await lasmeGate.execute(input)
// Phase 3: await mpseGate.execute(lasmeOutput)
// Phase 4: await sroGate.execute({lasme: lasmeOutput, mpse: mpseOutput})
```

---

## §4 OTHER USE CASES

| Use Case | Subagents | Synthesizer |
|---|---|---|
| Security review | injection-detector, auth-checker, crypto-scanner, dependency-auditor | risk matrix |
| Architecture review | coupling-analyzer, layer-violation-detector, pattern-consistency-checker | architecture-debt report |
| Documentation audit | completeness-checker, accuracy-verifier, freshness-scanner | docs-debt report |
| Performance audit | hot-path-finder, allocation-tracker, N+1-query-detector, bundle-analyzer | perf-debt report |
| Any N-agent pipeline | define SubagentSpec[] + a synthesizer | your domain logic |

---

## §5 IMPLEMENTATION ORDER

| Wave | Scope | Files |
|---|---|---|
| SH-0a | types.ts (all interfaces) | src/hydra/types.ts |
| SH-0b | pipeline.ts (ShadowHydraPipeline class) | src/hydra/pipeline.ts |
| SH-0c | subagent.ts (subagent dispatch logic) | src/hydra/subagent.ts |
| SH-0d | memory.ts (SQLite SharedMemoryStore) | src/hydra/memory.ts |
| SH-0e | graph-mapper.ts (GraphMapper interface + stub) | src/hydra/graph-mapper.ts |
| SH-1 | graphify.ts (Graphify MCP integration) | src/hydra/graphify.ts |

---

## §6 TESTING

- Unit: dispatch N mocked subagents, verify allSettled semantics
- Unit: gate failure produces loud error
- Unit: memory set/get round-trip
- Integration: full pipeline with mocked transport
- Reference: the code audit tool's integration tests (SH-6)

---

## §7 SUCCESS CRITERIA

1. The framework compiles and all unit tests pass
2. A pipeline with 2+ mocked subagents completes with synthesized output
3. A rejected subagent does NOT prevent other subagents from completing
4. Gate failures produce loud, named errors
5. The memory store persists across gate calls within a run
6. The graphify MCP client connects and queries a real graph
7. The reference integration (code audit tool) builds and runs on top of the framework
8. The framework has NO code-audit-specific logic (it's truly universal)

<!-- DOC-COMPLETE -->

---

## §2.9 THE COMPLETE ShadowHydraPipeline IMPLEMENTATION

### 2.9.0 The Pipeline Class (Full TypeScript)

```typescript
// src/hydra/pipeline.ts
import { Agent, type AgentTool } from '@earendil-works/pi-agent-core';
import { createModels, createProvider, envApiKeyAuth,
         createAssistantMessageEventStream,
         openAIResponsesApi } from '@earendil-works/pi-ai';
import type { SharedMemoryStore, GraphMapper, GateCheck,
              EvidenceCollector, LLMTransport } from './types.js';
import type { SubagentSpec, SubagentSettlement } from './types.js';
import { GraphifyMCPClient, createGraphifyTools } from './graphify.js';

export interface PipelineConfig<TInput, TSubResult, TSynthesis, TOutput> {
  name: string;
  subagents: SubagentSpec<TInput, TSubResult>[];
  synthesizer: (
    results: SubagentSettlement<TSubResult>[],
    graph: unknown,
    memory: SharedMemoryStore
  ) => Promise<TSynthesis>;
  gates: {
    pre: GateCheck<TInput>[];
    post: GateCheck<TSynthesis>[];
  };
  transport: LLMTransport;
  memory: SharedMemoryStore;
  graphMapper: GraphMapper;
  buildOutput: (
    synthesis: TSynthesis,
    results: SubagentSettlement<TSubResult>[],
    evidence: EvidenceCollector
  ) => TOutput;
  graphScope?: string[];
  graphExclude?: string[];
}

export class ShadowHydraPipeline<TInput, TSubResult, TSynthesis, TOutput> {
  readonly config: PipelineConfig<TInput, TSubResult, TSynthesis, TOutput>;
  readonly evidence: EvidenceCollector;

  constructor(config: PipelineConfig<TInput, TSubResult, TSynthesis, TOutput>) {
    this.config = config;
    this.evidence = new PipelineEvidenceCollector(config.name);
  }

  async execute(input: TInput): Promise<TOutput> {
    const t0 = Date.now();
    this.evidence.log('PIPELINE_START', { name: this.config.name, at: t0 });

    // ═══ 1. PRE-GATES ═══
    for (const gate of this.config.gates.pre) {
      this.evidence.log('GATE_CHECK', { gate: gate.name, phase: 'pre' });
      const result = await gate.check(input);
      if (!result.passed) {
        return this.failLoud(gate, result.reason, input);
      }
    }

    // ═══ 2. GRAPH EXTRACTION (once, shared) ═══
    this.evidence.log('GRAPH_EXTRACT_START', {});
    const graph = await this.config.graphMapper.extract(
      (input as { targetRoot: string }).targetRoot,
      { codeOnly: true, scope: this.config.graphScope, exclude: this.config.graphExclude }
    );
    this.evidence.log('GRAPH_EXTRACT_DONE', {
      nodeCount: graph.nodes?.length ?? 0,
      edgeCount: graph.edges?.length ?? 0,
      durationMs: Date.now() - t0,
    });

    // ═══ 3. START MCP SERVER ═══
    const mcpClient = new GraphifyMCPClient();
    const graphPath = (input as { targetRoot: string }).targetRoot + '/graphify-out/graph.json';
    await mcpClient.connect(graphPath);
    const graphifyTools = createGraphifyTools(mcpClient);

    // ═══ 4. CONCURRENT SUBAGENT DISPATCH ═══
    this.evidence.log('DISPATCH_START', {
      subagentCount: this.config.subagents.length,
      subagentIds: this.config.subagents.map(s => s.id),
    });

    const dispatchT0 = Date.now();
    const dispatchPromises = this.config.subagents.map(spec =>
      this.dispatchSubagent(spec, input, graph, graphifyTools)
    );
    const settled = await Promise.allSettled(dispatchPromises);
    const dispatchDuration = Date.now() - dispatchT0;

    // ═══ 5. COLLECT RESULTS ═══
    const results: SubagentSettlement<TSubResult>[] = settled.map((outcome, i) => ({
      subagentId: this.config.subagents[i].id,
      status: outcome.status,
      value: outcome.status === 'fulfilled' ? outcome.value : undefined,
      reason: outcome.status === 'rejected' ? outcome.reason : undefined,
    }));

    // Log rejections (loud, never silent)
    for (const r of results) {
      if (r.status === 'rejected') {
        this.evidence.log('SUBAGENT_REJECTED', {
          subagentId: r.subagentId,
          error: String(r.reason),
        });
      } else {
        this.evidence.log('SUBAGENT_FULFILLED', {
          subagentId: r.subagentId,
        });
      }
    }

    this.evidence.log('DISPATCH_DONE', {
      durationMs: dispatchDuration,
      fulfilled: results.filter(r => r.status === 'fulfilled').length,
      rejected: results.filter(r => r.status === 'rejected').length,
    });

    // ═══ 6. DISCONNECT MCP ═══
    await mcpClient.disconnect();

    // ═══ 7. SYNTHESIZE ═══
    this.evidence.log('SYNTHESIZE_START', {});
    const synthesis = await this.config.synthesizer(results, graph, this.config.memory);
    this.evidence.log('SYNTHESIZE_DONE', {});

    // ═══ 8. POST-GATES ═══
    for (const gate of this.config.gates.post) {
      this.evidence.log('GATE_CHECK', { gate: gate.name, phase: 'post' });
      const result = await gate.check(synthesis);
      if (!result.passed) {
        return this.failLoud(gate, result.reason, synthesis);
      }
    }

    // ═══ 9. PERSIST TO SHARED MEMORY ═══
    this.config.memory.setGateOutput(this.config.name, {
      gateName: this.config.name,
      synthesis,
      results,
      telemetry: this.evidence.getTelemetry(),
    });

    // ═══ 10. RETURN ═══
    const output = this.config.buildOutput(synthesis, results, this.evidence);
    this.evidence.log('PIPELINE_DONE', {
      name: this.config.name,
      totalDurationMs: Date.now() - t0,
    });
    return output;
  }

  // ═══ PRIVATE: dispatchSubagent ═══
  private async dispatchSubagent(
    spec: SubagentSpec<TInput, TSubResult>,
    input: TInput,
    graph: unknown,
    graphifyTools: AgentTool[],
  ): Promise<TSubResult> {
    const subagentT0 = Date.now();

    // Build prompts
    const systemPrompt = spec.buildSystemPrompt(input, graph, this.config.memory);
    const userPrompt = spec.buildUserPrompt(input);

    // Construct the pi SDK Agent
    const agent = new Agent({
      initialState: {
        systemPrompt,
        model: this.config.transport.getModel(),
        tools: [...graphifyTools, ...(spec.additionalTools ?? [])],
        thinkingLevel: spec.thinkingLevel ?? 'xhigh',
      },
      streamFn: this.config.transport.chainedStream as never,
      toolExecution: 'parallel' as never,
      maxTokens: spec.maxTokens,
      shouldStopAfterTurn: (ctx: { newMessages?: Array<{ role?: string }> }) => {
        const llmCalls = ctx.newMessages?.filter(m => m.role === 'assistant').length ?? 0;
        return llmCalls >= 12;
      },
    });

    // Run with timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`SUBAGENT_TIMEOUT: ${spec.id} exceeded ${spec.timeout}ms`)), spec.timeout)
    );
    await Promise.race([agent.prompt(userPrompt), timeoutPromise]);
    await agent.waitForIdle();

    // Extract and validate output
    const finalMessage = agent.state.messages[agent.state.messages.length - 1];
    const jsonText = this.extractJSON(finalMessage);
    const parsed = spec.outputSchema.safeParse(jsonText);
    if (!parsed.success) {
      throw new Error(`Subagent ${spec.id} schema validation failed: ${parsed.error.message}`);
    }

    this.evidence.log('SUBAGENT_COMPLETE', {
      subagentId: spec.id,
      durationMs: Date.now() - subagentT0,
    });

    return parsed.data;
  }

  // ═══ PRIVATE: failLoud ═══
  private failLoud<T>(gate: GateCheck<T>, reason: string, target: T): never {
    this.evidence.log('GATE_FAILED', {
      gate: gate.name,
      reason,
      target: JSON.stringify(target).slice(0, 500),
    });
    throw new Error(`[${this.config.name}] GATE FAILED: ${gate.name} — ${reason}`);
  }

  // ═══ PRIVATE: extractJSON ═══
  private extractJSON(message: { content?: Array<{ type?: string; text?: string }> }): unknown {
    for (const block of message.content ?? []) {
      if (block.type === 'text' && block.text) {
        try { return JSON.parse(block.text); }
        catch { /* try next block or fenced JSON */ }
        // Try fenced JSON (```json ... ```)
        const fenced = block.text.match(/```json\n([\s\S]*?)\n```/);
        if (fenced) { try { return JSON.parse(fenced[1]); } catch { /* continue */ } }
      }
    }
    throw new Error('No parseable JSON found in subagent output');
  }
}
```

---

## §2.10 THE EVIDENCE COLLECTOR IMPLEMENTATION

```typescript
// src/hydra/evidence.ts
export interface EvidenceEntry {
  timestamp: number;
  event: string;
  data: Record<string, unknown>;
}

export interface PipelineTelemetry {
  totalDurationMs: number;
  subagentCount: number;
  fulfilledCount: number;
  rejectedCount: number;
  totalTokensIn: number;
  totalTokensOut: number;
  gatesPassed: number;
  gatesFailed: number;
}

export class PipelineEvidenceCollector implements EvidenceCollector {
  private entries: EvidenceEntry[] = [];
  private startTime: number;

  constructor(pipelineName: string) {
    this.startTime = Date.now();
    this.entries = [];
  }

  log(event: string, data: Record<string, unknown>): void {
    this.entries.push({ timestamp: Date.now(), event, data });
    // Also log to the engine log for durable evidence
    console.error(`[hydra:${event}]`, JSON.stringify(data));
  }

  getTelemetry(): PipelineTelemetry {
    const rejected = this.entries.filter(e => e.event === 'SUBAGENT_REJECTED').length;
    const fulfilled = this.entries.filter(e => e.event === 'SUBAGENT_FULFILLED').length;
    const gatesFailed = this.entries.filter(e => e.event === 'GATE_FAILED').length;
    const gatesPassed = this.entries.filter(e => e.event === 'GATE_CHECK').length - gatesFailed;
    return {
      totalDurationMs: Date.now() - this.startTime,
      subagentCount: fulfilled + rejected,
      fulfilledCount: fulfilled,
      rejectedCount: rejected,
      totalTokensIn: 0,  // populated by the transport
      totalTokensOut: 0, // populated by the transport
      gatesPassed,
      gatesFailed,
    };
  }

  getEvidenceLog(): EvidenceEntry[] {
    return [...this.entries];
  }
}
```

---

## §2.11 THE SQLITE SHARED MEMORY STORE IMPLEMENTATION

```typescript
// src/hydra/memory.ts
import { Database } from 'bun:sqlite';

export class SQLiteMemoryStore implements SharedMemoryStore {
  readonly backend = 'sqlite' as const;
  private db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath, { create: true });
    this.db.run(`
      CREATE TABLE IF NOT EXISTS gate_outputs (
        gate_name TEXT NOT NULL,
        run_id TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (gate_name, run_id)
      );
      CREATE TABLE IF NOT EXISTS run_history (
        run_id TEXT PRIMARY KEY,
        summary TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS file_changes (
        run_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        changed_at INTEGER NOT NULL,
        PRIMARY KEY (run_id, file_path)
      );
    `);
  }

  setGateOutput(gateId: string, data: GateOutput): void {
    this.db.run(
      `INSERT OR REPLACE INTO gate_outputs (gate_name, run_id, data, created_at)
       VALUES (?, ?, ?, ?)`,
      [gateId, data.gateName ?? 'current', JSON.stringify(data), Date.now()]
    );
  }

  getGateOutput<T extends GateOutput>(gateId: string): T | null {
    const row = this.db.query(
      `SELECT data FROM gate_outputs WHERE gate_name = ? ORDER BY created_at DESC LIMIT 1`
    ).get(gateId);
    if (!row) return null;
    return JSON.parse((row as { data: string }).data);
  }

  persistRun(runId: string, data: RunSummary): void {
    this.db.run(
      `INSERT OR REPLACE INTO run_history (run_id, summary, created_at) VALUES (?, ?, ?)`,
      [runId, JSON.stringify(data), Date.now()]
    );
  }

  getPriorRun(runId: string): RunSummary | null {
    const row = this.db.query(
      `SELECT summary FROM run_history WHERE run_id = ?`
    ).get(runId);
    if (!row) return null;
    return JSON.parse((row as { summary: string }).summary);
  }

  getChangedFiles(sinceRunId: string): string[] {
    const rows = this.db.query(
      `SELECT file_path FROM file_changes WHERE run_id = ?`
    ).all(sinceRunId);
    return rows.map(r => (r as { file_path: string }).file_path);
  }

  getGraph(): unknown | null {
    // Phase 1: return null (the graph is managed by graphify, not SQLite)
    // Phase 2: return the corbell graph from typed_nodes/typed_edges
    return null;
  }

  mergeGraphSlice(slice: object): void {
    // Phase 1: no-op (graph slices are merged by graphify)
    // Phase 2: transform + insert into typed_nodes/typed_edges
  }

  async queryGraph(query: string): Promise<unknown> {
    // Phase 1: no-op
    // Phase 2: query the corbell graph
    return null;
  }
}
```

---

## §3 REFERENCE INTEGRATION (Complete Walkthrough)

## §3.1 Building a Security Review Tool

```typescript
// Example: a security review tool using the Shadow Hydra boilerplate

// Step 1: Define the output schema
const SecurityFindingSchema = z.object({
  id: z.string(),
  category: z.enum(['injection', 'auth', 'crypto', 'dependency', 'config']),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  file: z.string(),
  line: z.number(),
  evidence: z.string(),
  description: z.string(),
  remediation: z.string(),
});

// Step 2: Define the subagent specs
const injectionDetector: SubagentSpec<SecInput, SecurityFinding[]> = {
  id: 'injection-detector',
  buildSystemPrompt: (input, graph, memory) => `
    You are an INJECTION DETECTOR agent.
    Scan ${input.targetRoot} for SQL injection, command injection,
    and path traversal vulnerabilities.

    GRAPH TOOLS USAGE LAW:
    1. ALWAYS query the graph BEFORE reading files
    2. Use graphify:query "find string concatenation in SQL contexts"
    3. Use graphify:query "find exec/spawn calls with user input"
    4. Flag EXTRACTED edges; mark INFERRED with [INFERRED]

    Return JSON: { findings: [...] }
  `,
  buildUserPrompt: (input) =>
    `Scan ${input.targetRoot} for injection vulnerabilities.`,
  outputSchema: z.object({ findings: z.array(SecurityFindingSchema) }),
  maxTokens: 64000, maxRounds: 2, timeout: 60_000,
};

const authChecker: SubagentSpec<SecInput, SecurityFinding[]> = {
  id: 'auth-checker',
  buildSystemPrompt: (input, graph, memory) => `
    You are an AUTHENTICATION CHECKER agent.
    Scan ${input.targetRoot} for missing auth checks, privilege escalation,
    and session management flaws.

    GRAPH TOOLS USAGE LAW:
    1. Use graphify:query "find route handlers without auth middleware"
    2. Use graphify:path to trace auth middleware to route handlers
    3. Flag routes accessible without authentication

    Return JSON: { findings: [...] }
  `,
  buildUserPrompt: (input) =>
    `Scan ${input.targetRoot} for authentication vulnerabilities.`,
  outputSchema: z.object({ findings: z.array(SecurityFindingSchema) }),
  maxTokens: 64000, maxRounds: 2, timeout: 60_000,
};

// ... define cryptoScanner, dependencyAuditor similarly ...

// Step 3: Write the synthesizer
const securitySynthesizer = async (results, graph, memory) => {
  const all = results.flatMap(r => r.value?.findings ?? []);
  const seen = new Set<string>();
  const deduped = all.filter(f => {
    const key = `${f.file}:${f.line}:${f.category}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  return {
    findings: deduped.sort((a, b) =>
      severityWeight(b) - severityWeight(a)),
    totalAgents: results.length,
    categoriesCovered: [...new Set(deduped.map(f => f.category))],
  };
};

// Step 4: Define gates
const targetExists = {
  name: 'target-exists',
  check: async (input) => ({
    passed: fs.existsSync(input.targetRoot),
  }),
};
const findingsHaveRemediation = {
  name: 'findings-have-remediation',
  check: async (synthesis) => ({
    passed: synthesis.findings.every(f => f.remediation.length > 0),
  }),
};

// Step 5: Instantiate and run
const securityPipeline = new ShadowHydraPipeline({
  name: 'Security Review',
  subagents: [injectionDetector, authChecker, cryptoScanner, dependencyAuditor],
  synthesizer: securitySynthesizer,
  gates: { pre: [targetExists], post: [findingsHaveRemediation] },
  transport: museTransport,
  memory: new SQLiteMemoryStore(dbPath),
  graphMapper: new GraphifyMCPMapper(),
  buildOutput: (synthesis, results, evidence) => ({
    ...synthesis,
    telemetry: evidence.getTelemetry(),
  }),
});

const result = await securityPipeline.execute({ targetRoot: '/path/to/app' });
```

---

## §5 FILE MANIFEST

| File | Lines | Responsibility | Wave |
|---|---|---|---|
| `src/hydra/types.ts` | ~200 | All interfaces (PipelineConfig, SubagentSpec, GateCheck, SharedMemoryStore, GraphMapper, EvidenceCollector, LLMTransport, SubagentSettlement, GateOutput) | SH-0 |
| `src/hydra/pipeline.ts` | ~350 | ShadowHydraPipeline class (execute, dispatchSubagent, failLoud, extractJSON) | SH-0 |
| `src/hydra/subagent.ts` | ~150 | Subagent dispatch helper (build prompt, create Agent, validate) | SH-0 |
| `src/hydra/memory.ts` | ~200 | SQLiteMemoryStore (gate outputs, run history, file changes, graph) | SH-0 |
| `src/hydra/evidence.ts` | ~100 | PipelineEvidenceCollector (log, telemetry) | SH-0 |
| `src/hydra/graph-mapper.ts` | ~150 | GraphMapper interface + GraphifyMCPMapper adapter | SH-0/1 |
| `src/hydra/graphify.ts` | ~300 | GraphifyMCPClient + createGraphifyTools (4 pi SDK tools) | SH-1 |
| `src/hydra/__tests__/pipeline.test.ts` | ~200 | Unit tests (concurrent, rejection, gates, memory) | SH-0 |
| `src/hydra/__tests__/memory.test.ts` | ~100 | Memory store round-trip tests | SH-0 |
| `src/hydra/__tests__/graphify.test.ts` | ~150 | Graphify MCP integration tests | SH-1 |
| **TOTAL** | **~1,800** | | |

---

## §6 PER-COMPONENT TEST SPECIFICATIONS

### Pipeline Tests
| Test | Arrange | Act | Assert |
|---|---|---|---|
| Concurrent dispatch | 3 specs, each resolving in 100ms | execute() | wall clock < 200ms (not 300ms) |
| Rejection tolerance | 2 fulfilling + 1 rejecting specs | execute() | pipeline completes, rejection logged |
| Pre-gate failure | spec with failing pre-gate | execute() | throws with gate name and reason |
| Post-gate failure | spec with failing post-gate | execute() | throws with gate name and reason |
| Memory round-trip | gate stores output, reads back | getGateOutput() | output matches what was stored |
| Empty subagents | config with 0 subagents | execute() | throws (must have ≥1) |
| Timeout enforcement | spec with 100ms timeout, agent takes 200ms | execute() | rejects with SUBAGENT_TIMEOUT |

### Memory Store Tests
| Test | Arrange | Act | Assert |
|---|---|---|---|
| Gate output round-trip | store then retrieve | getGateOutput() | data matches |
| Run persistence | persistRun then getPriorRun | getPriorRun() | summary matches |
| Changed files | track file changes | getChangedFiles() | correct file list |
| Concurrent access | two gates writing simultaneously | both writes succeed | no SQLite lock errors |

### Graphify Integration Tests
| Test | Arrange | Act | Assert |
|---|---|---|---|
| MCP connect | valid graph.json | connect() | tools list returned |
| Query | "find all classes" | graphify:query | subgraph with class nodes |
| Path trace | two known concepts | graphify:path | path with hops |
| Explain | a known concept | graphify:explain | node detail with connections |
| Subgraph | concept with known neighbors | graphify:subgraph | scoped subgraph |
| Disconnect | after use | disconnect() | clean shutdown |

---

## §7 DEPLOYMENT GUIDE

### Container Prerequisites
```dockerfile
# Add to the master image:
RUN apt-get update && apt-get install -y python3.12 python3-pip
RUN pip install graphifyy
# Verify: graphify --version
```

### Host Prerequisites
```bash
# Install graphify locally:
uv tool install graphifyy

# Verify:
graphify --version

# Test extraction:
cd /tmp/test-project && graphify extract . --code-only
# Should produce graphify-out/graph.json
```

### Environment Variables
```bash
# Required for muse transport:
export OPENCODE_GO_API_KEY="sk-..."

# Optional (overrides the base64 seed):
export OPENCODE_API_KEY="sk-..."

# Optional (for graphify HTTP mode):
export GRAPHIFY_API_KEY="..."
```

<!-- DOC-COMPLETE -->
