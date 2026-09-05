# THE AETHER GRAPH EXECUTION REWIRING L2 SPEC — V1.0

**Version:** 1.0 | **Date:** 2026-08-31 | **Status:** THE DESIGN AUTHORITY — supersedes all prior wave notes on this surface
**Purpose:** Fix the six severed seams in the aether execution path, restore the two-graph architecture (corbell macro / graphify micro), wire the full tool surface into the pi agents, and land the intelligent findings-delivery + tool-usage lexicons.
**Predecessor:** DERAILMENT_REARCHITECTURE_L2_SPEC.md (the W/T/M waves — shipped; this spec covers what those waves left severed)
**Baseline (operator-locked, this session, verbatim):**
- "corbell is literally the default" — the macro graph substrate is corbell; loud fail, no silent fallback in the audit path
- "2 graphs of the same codebase: macro = corbell, primary agent project graph; micro = graphify, subagents shared graph for live build work, read only access to the corbell graph as well" — the AD-7 firewall, restated as the design
- "are you fucking dumb i literally said to fucking add this as new tools for the pi agents" — the graphify tools + graph_tag + write_meta_doc are MANDATORY pi-agent tools
- "NO STUPID FALLBACKS!!! EVERYTHING IS REQUIRED TO FUCKING WORK THE WAY I SPECD IT. LOUD FAIL TO HIGHLIGHT BUGS" — the ISE warhead, applied to this surface
- "dont just code some dumb static bullshit. make sure this is properly event/intent/context aware" — the tool-usage gate is a lexicon + state machine (L16), never a static count check
- "this silent contextless toast is garbage" — the findings delivery is the L15 lexicon (map + rolodex + directives)

## TABLE OF CONTENTS

- §0 THE FUNDAMENTAL PROBLEM
- §1 FAILURE INVENTORY (F-IDs)
- §2 FIX PLAN
  - §2.1 The Pi-Agent Tool Injection Contract (F1-F3)
  - §2.2 The Fallback Deletion + Loud Meta Fail (F4)
  - §2.3 The Graph Layer: Corbell Default + Graphify Pre-Gates (F5-F6)
  - §2.4 The Tag Path: Graphify Destination + Vocab Fixes (F7-F8)
  - §2.5 The Tool-Usage Lexicon L16 (F9)
  - §2.6 The Self-Defect Gate (F10)
  - §2.7 The Findings Delivery Lexicon L15
  - §2.8 The Graph Firewall Enforcement
- §3 IMPLEMENTATION ORDER (the waves)
- §4 TESTING STRATEGY
- §5 ANTI-PATTERNS AGAINST FALSE SUCCESS
- §6 SUCCESS CRITERIA
- §7 COMPACTION-PROOF IMPLEMENTATION GUIDE
- §8 FINAL NOTES / OPEN QUESTIONS
- APPENDIX A — ZERO-TRUST AUDIT

<!-- L2-CHUNK-0 -->

## §0 THE FUNDAMENTAL PROBLEM

**The aether audit pipeline's hunters run BLIND.** The execution path assembles a complete intelligence tool surface — the graphify micro-graph queries, the graph_tag write-back, the meta-doc writers — and then DISCARDS it at six seams, handing each pi agent only 3 tools (read/grep/report-write). The machine's own audit caught this (R22's TRUE_DEFECTs, this run's artifacts), and the detection worked perfectly — but nothing in the pipeline consumes self-findings, the operator-facing toast is a bare count, and the run reported "17/17 fulfilled" while its graph layer was non-functional theater.

**The root class:** assembled-but-discarded seams — tool surfaces built, tested standalone, and never injected into the agents that need them, with runner-side fallbacks papering over the resulting gaps. This is the AD-2 wiring-gap class (unmigrated capability) manifesting INSIDE the shipped pipeline, plus the banned-fallback class (the ISE warhead's law) masking it.

**What the system SHOULD do (the operator's design, this session):** two graphs of the same codebase — corbell (macro, primary-agent, the default substrate with loud-fail) and graphify (micro, the subagents' shared live-work graph, populated mandatorily pre-gates) — with every hunter holding the full tool surface (graphify:query/path/explain + graph_tag + the spine), every meta agent writing doc1 itself via write_meta_doc, tool usage verified by an intent-aware lexicon (not a static count), and the run's findings delivered to the primary agent as a ranked map + rolodex + directives instead of a contextless toast.

## §1 FAILURE INVENTORY

Every item grounded in this session's evidence (the run audit-1788174665340, the source reads, the clean-room probes). Severity per the canon.

### F-01 — THE HUNTER TOOLS DISCARDED (CRITICAL)
- **What:** `buildAuditorTools()` assembles the 9-tool hunter surface (graphify:query/path/explain + graph_tag + capped read/grep + write_findings + edit) and its return value is thrown away.
- **Evidence:** src/hydra/aether-auditor.ts:94 — `buildAuditorTools(resolvedLedger, graph, targetRoot);` (no assignment). The comment at :204 documents the divergence. The AetherAgent's own buildTools (pi-aether-agent.ts:327-334) returns exactly [read, grep, report_write].
- **Impact:** all 17 hunters ran with zero graph access; every "graph operation" in their reports was brief-quotation prose, not tool calls. The R28 report's 15 graph references describe tools the agent never had.
- **The audit's own record:** R22 TRUE_DEFECT 0.88 in doc2 line 499.

### F-02 — THE META TOOLS DISCARDED (CRITICAL)
- **What:** `buildMetaTools(doc1Path, doc2Path, graph)` wrapped in `try { ... } catch (e) { void e.message }` — assembled, swallowed, discarded.
- **Evidence:** src/hydra/aether-meta.ts:380.
- **Impact:** the meta agents could not write doc1; the deep adjudications (36 candidates, 23 TRUE in _meta-lasme/report.md) never reached the operator-facing doc.

### F-03 — THE DOC1 RUNNER FALLBACK (CRITICAL — the banned-fallback class)
- **What:** when the meta agent (toolless per F-02) writes no doc1 section, the runner appends its own mechanical text: "Meta review for LASME: 7 hunters fulfilled... Patterns: pending meta LLM analysis."
- **Evidence:** src/hydra/aether-meta.ts:387. doc1 this run carries exactly this boilerplate for all 3 gates.
- **Impact:** the operator-facing summary is theater; the ISE warhead's law (LOUD FAIL, never a paper-over) is violated at the pipeline's presentation layer.

### F-04 — THE GRAPHIFY EXTRACT NEVER RUNS (CRITICAL)
- **What:** `GraphifyMCPMapper.extract()` (the only producer of graphify-out/graph.json) is called from exactly one place: the DEAD pipeline (hydra/pipeline.ts:43, which throws AETHER_MIGRATION at :146).
- **Evidence:** grep — no extract call in index.ts or aether-meta.ts. graphify-out/ absent under the target this run.
- **Impact:** the micro-graph never existed; even injected tools would have queried an empty store.

### F-05 — THE MCP CONNECT NEVER RUNS (CRITICAL)
- **What:** `GraphifyMCPClient.connect(graphPath)` exists only in the dead pipeline (:57).
- **Impact:** same as F-04 — the query surface had no server.

### F-06 — THE DEAD DISPATCH SEAM (HIGH)
- **What:** pipeline.ts:144 `void tools; throw AETHER_MIGRATION` — the old seam, dead but imported by index.ts:78.
- **Evidence:** R22 TRUE_DEFECT 0.92.

### F-07 — THE CORBELL BYPASS (CRITICAL)
- **What:** graph-logic-phase.ts:65 hardcodes `substrate: 'native-ast'`; the CorbellAdapter (the W10-proven primary, all four machine fixes present at corbell-adapter.ts:299/377/384/399) is never constructed.
- **Evidence:** the profile line; the BUG_HUNTER_ARCHITECTURE_BIBLE:2190 (`substrate: corbell` — the default); my clean-room probe (a 2-method TS fixture → Methods: 2 — corbell works; the v4.4.3 workspace run → Methods: 0 — the repo-layout/scan issue); the Plutus manifest (1,847 nodes/1,775 methods/332 findings — container-proven).
- **Impact:** the macro graph is a tsc fallback product; the operator's primary engine is bypassed.

### F-08 — THE TAG DESTINATION VIOLATION (HIGH)
- **What:** makeGraphTagTool resolves its write target via `__testDb ?? .db ?? exec-handle` fallback chains landing in shared.db — the MACRO store — instead of the graphify mini-graph.
- **Evidence:** aether-tools.ts:268-275.
- **Impact:** the two-graph separation (AD-7) is violated at the write path; the stitch reads tags from the wrong store.

### F-09 — THE TAG VOCABULARY FAILURES (MEDIUM)
- **What:** 13 tag failures this run — kindForLayer maps R28→'Graph'/R29→'Path' (illegal under the 16-type CHECK) + 2 predicates (lexicon.drift, state-machine.unreachable-state) missing from the 61-entry PREDICATE_MAP.
- **Evidence:** tag-failures.log entries 1788175-1788176*; kind-for-layer.ts:3-4.
- **Impact:** CORRELATIONS=0 (OR-3 miss); graph_facts=0.

### F-10 — THE NATIVE-AST BLIND SPOTS (MEDIUM — the fallback's own debt)
- **What:** identifier-only callee resolution (member calls invisible) + bare-name id merges (286 this run) produce false "unwired" (EventLedger/PlaneRegistry wired via property access showed 0 inbound edges).
- **Evidence:** the V4 audit this session; the cross-check table (graph said unwired; grep found the callers).

### F-11 — THE SELF-DEFECT CONSUMPTION GAP (HIGH)
- **What:** the run's own findings (4+ TRUE_DEFECTs against its execution path) land in doc2/verdicts and NOTHING blocks the next run or surfaces them to the operator.
- **Evidence:** this session — the findings were at doc2:499+ while I read counts and oracles.

### F-12 — THE CONTEXTLESS TOAST (MEDIUM)
- **What:** the operator-facing gate notifications are bare counts ("707 candidates, 0 fulfilled").
- **Evidence:** every toast this run.

### F-13 — THE POSEIDON ENFORCER OBSTRUCTION (HIGH — adjacent, queued here for the enforcement wave)
- **What:** PB-1/2/3 — the zombie `default` session enforces on everyone; abort never writes a terminal phase; the liveness gate is self-fulfilling. Disabled this session (42+3 sessions deactivated, god-loop state terminalized).
- **Evidence:** the diagnosis in DEBUG_LOG EN-18..20; the runtime DB reads.

### F-14 — THE MERKLE CHAIN ORPHANED (MEDIUM)
- **What:** evidence/merkle-chain.ts — the tamper-evident evidence ledger (core since 4.3) — imported by 3 files, zero method invocations.
- **Evidence:** the graph's unwired query + the grep cross-check (0 call sites).

### F-15 — THE UNWINDED INVENTORY NOISE (MEDIUM)
- **What:** 2,846 raw "unwired" symbols — mostly the F-10 blind spot (injected-object property calls), not real dead code.
- **Evidence:** the denoise pass (grep ground truth vs graph claims).

## §2 FIX PLAN

The complete design, per component: the responsibility, the interface contract, the pseudocode where non-obvious, the data flows, the error rules. Every operator directive from the session appears verbatim or near-verbatim with its consequence.

**The design's shape:** 8 fix components (F1-F10 consolidated) + 2 new lexicons (L15 the findings delivery, L16 the tool usage) + the firewall enforcement. The components compose: the injection (2.1) makes the tools real; the graph layer (2.3) gives them a populated substrate; the tag path (2.4) completes the write-back loop; the lexicons (2.5-2.7) make usage verified and delivery intelligent; the firewall (2.8) keeps the two stores pure.

<!-- L2-CHUNK-4-CONSUMED -->
## §2.1 The Pi-Agent Tool Injection Contract (F1-F3)

**The responsibility:** every pi agent (hunter + meta) runs with its FULL mission tool surface, injected by the caller. The spine is always present; the mission tools ride alongside.

**The interface contract:**

```ts
// pi-aether-agent.ts — the ONE structural change:
export interface AetherAgentRunOptions {
  // ... existing fields unchanged ...
  /** THE MISSION TOOLS (2026-08-31, the operator's directive: the graphify
   * tools + graph_tag + write_meta_doc are MANDATORY pi-agent tools). The
   * spine (read/grep/report-write) is ALWAYS present; these ride alongside.
   * NEVER discarded — the caller's contract. */
  tools?: AgentTool[];
}

// Agent initialState (run(), ~:354):
tools: [
  ...this.buildTools(opts.targetRoot, opts.judgmentPath),  // the spine
  ...(opts.tools ?? []),                                    // the mission surface
],
```

**The call-site fixes (the discards removed):**

```ts
// aether-auditor.ts:94 — BEFORE:
buildAuditorTools(resolvedLedger, graph, targetRoot);  // discarded!
// AFTER:
const missionTools = buildAuditorTools(resolvedLedger, graph, targetRoot);
// :128 — pass into the run:
runResult = await agent.run({ promptFilePath, systemPrompt, targetRoot,
  ledgerRoot, specsRoots, maxRounds: 2, tools: missionTools });

// aether-meta.ts:380 — BEFORE:
try { buildMetaTools(doc1Path, doc2Path, graph); } catch (e) { void e.message }
// AFTER (the void-catch is DELETED — assembly failure is a loud fail):
const metaTools = buildMetaTools(doc1Path, doc2Path, graph);
// :383 — pass into the meta agent's run:
const metaResult = await metaAgent.run({ ..., tools: metaTools });
```

**The error rules:** buildAuditorTools/buildMetaTools THROW on invalid inputs (they already do — the guards at aether-tools.ts:322-326/:337-340). No catch swallows them. A tool assembly failure = the hunter/meta settlement is REJECTED loudly (the existing rejection paths carry it).

**The data flow:** caller assembles (ledger-scoped, graph-client-bound) → run(opts.tools) → the pi Agent's initialState → the model calls them like any tool → the existing round loop/telemetry sees them (the toolCall counting at :399-408 already scans content parts for toolCall types — the NAME extraction lands in §2.5).

<!-- L2-CHUNK-5-CONSUMED -->
## §2.2 The Fallback Deletion + Loud Meta Fail (F4)

**The responsibility:** the doc1 "Patterns: pending" runner fallback is DELETED. The meta layer either produces its doc1 section (via the now-injected write_meta_doc) or the run LOUD FAILS.

**The contract:**

```ts
// aether-meta.ts — the :387 fallback block DELETED. Replaced:
// AFTER the meta agent's run, if doc1 lacks the gate's section:
const hasMetaSection = cur.includes(`## ${gateName} META`);
if (!hasMetaSection) {
  // THE LOUD FAIL — no runner-authored section, ever.
  throw new Error(
    `META_DOC_SECTION_MISSING: gate ${gateName} — the meta agent produced ` +
    `no doc1 section (write_meta_doc unused, failed, or the agent errored). ` +
    `The meta judgment may exist in ${metaLedger}/report.md — read it, fix ` +
    `the cause, re-run. NO FALLBACK SECTION WAS WRITTEN.`
  );
}
```

**The throw's consumer:** runMetaLayer's caller (index.ts) catches per-gate (the existing allSettled isolation), the gate's roster entry is marked rejected with META_DOC_SECTION_MISSING, the run-status toast names it, and [FINAL] carries the honest rejected count. The run NEVER reports a clean [FINAL] with a missing meta section.

**The adjacent deletions (the same class):** the `void e.message` at :380 (covered in §2.1) and any remaining `void tools` patterns in the hydra path — the gate (§5, AP-3) greps for them.

<!-- L2-CHUNK-6-CONSUMED -->
## §2.3 The Graph Layer: Corbell Default + Graphify Pre-Gates (F5-F6)

**The responsibility:** the two-graph architecture, populated mandatorily before the gates, both loud-fail.

### F6 — THE MACRO GRAPH: corbell is the default

**The change:** graph-logic-phase.ts:65 `substrate: 'native-ast'` → `substrate: 'corbell'`, plus the excludes that make the scan sane on this repo layout.

```ts
// graph-logic-phase.ts — the profile construction:
graph: {
  substrate: 'corbell',   // THE DEFAULT (BUG_HUNTER_ARCHITECTURE_BIBLE:2190 —
                          // the operator: "corbell is literally the default")
  scope: ['src'],
  excludes: [
    'Checkpoints',        // 6,000+ snapshot copies — corbell's SKIP_DIRS
                          // doesn't know it; the scan must never touch it
    'node_modules', 'corbell-data', '.trident', 'dist', 'docs',
    'MASTER_CONTEXT', 'Context_Management',
  ],
},
```

**The loud-fail contract:** selectAdapter('corbell') → CorbellAdapter → `corbell graph build --methods`. Any failure (binary absent, build error, GRAPH_EMPTY on the code-node check) → the audit ABORTS with ADAPTER_FAILED + the CORBELL_NOT_FOUND hint. **No native-ast fallback in the audit path** (the fallback exists for the standalone bug-hunter per the bible §5.4; the AUDIT pipeline dies loudly — the operator: "loud fail if not so we can make sure theres no issue with it").

**The verification hook (the repo-layout fix):** the adapter's profile-driven config (the W10 fix, present at :299) writes workspace.yaml with repo/scope; the desk VERIFIES the --methods build on THIS repo (the Checkpoints exclude is the load-bearing addition — my probe showed Methods:0 on the whole-workspace scan and Methods:2 on a clean fixture; the exclude + scope:src is the difference). If the tree-sitter scan still yields 0 code nodes on src/ alone, the desk reports the exact corbell output — that's a loud finding, not a silent flip back to native-ast.

### F5 — THE MICRO GRAPH: graphify populated pre-gates

**The change:** the aether pipeline (index.ts, after the graph-logic phase, before GATES_RUNNING) calls the extract + connect:

```ts
// index.ts — after graph-logic passes, before the gate dispatch:
try {
  const microGraph = await graphMapper.extract(targetPath, {
    codeOnly: true,
    scope: ['src'],
    exclude: ['Checkpoints', 'node_modules', 'corbell-data', '.trident'],
  });
  tridentLog('INFO', 'audit-engine',
    `graphify micro-graph ready: ${microGraph.nodes.length} nodes / ` +
    `${microGraph.edges.length} edges`);
  await mcpClient.connect(path.join(targetPath, 'graphify-out', 'graph.json'));
  tridentLog('INFO', 'audit-engine', 'graphify MCP connected');
} catch (e) {
  // THE LOUD FAIL — no empty-graph theater:
  const msg = `GRAPHIFY_MICRO_FAILED: ${e instanceof Error ? e.message : String(e)} — the mini-graph is MANDATORY; the gates do not run without it.`;
  tridentLog('ERROR', 'audit-engine', msg);
  throw new Error(msg);
}
```

**The graph-mapper fix (the voided opts):** graph-mapper.ts:74 `void opts?.scope; void opts?.exclude;` → the extract passes them to the graphify CLI (the desk verifies the exact flags via `graphify extract --help`).

**The telemetry:** run-status.json gains a graphState block: `{ macro: {substrate, nodes, edges}, micro: {nodes, edges, graphJson} }` — the visibility surface for both stores, per run.

<!-- L2-CHUNK-7-CONSUMED -->
## §2.4 The Tag Path: Graphify Destination + Vocab Fixes (F7-F8)

**The responsibility:** graph_tag writes to the GRAPHIFY MINI-GRAPH (the subagents' layer); the tag vocabulary never violates the ontology CHECK.

### F7 — the destination

```ts
// aether-tools.ts makeGraphTagTool — the write target becomes the
// GraphifyMCPClient EXCLUSIVELY. The __testDb/.db/exec-handle fallback
// chain (lines ~268-275) is DELETED — one write surface, no side doors.
execute: async (_id, params) => {
  // ... validation unchanged (predicate, kind, evidence) ...
  // THE WRITE — through the MCP client's tag verb:
  await graph.callTool('add_tag', {
    subject, file, line, predicate, evidence, severity,
    layer: layerId,
  });
  return { content: [{ type: 'text', text: JSON.stringify({ tagged: true,
    store: 'graphify', subject, predicate }) }], details: null };
}
```

**Why MCP, not a direct db handle:** the graphify python server owns graph.json's write path (atomicity, idempotency). The client is already connected (F5). shared.db is NEVER opened by a hunter-facing tool (the firewall, §2.8).

### F8 — the vocabulary

```ts
// kind-for-layer.ts — the two illegal kinds fixed:
if (low.includes('r28')) return 'Gate';     // was 'Graph' — not in the 16-type CHECK
if (low.includes('r29')) return 'File';     // was 'Path'  — not in the CHECK

// aether-meta.ts PREDICATE_MAP — the two missing entries:
'lexicon.drift': 'violates',
'state-machine.unreachable-state': 'violates',
```

**The gate:** the 13-failure class (this run's tag-failures.log) becomes 0; the desk's test asserts both the kind legality (isNodeType passes) and the predicate translation.

<!-- L2-CHUNK-8-CONSUMED -->
## §2.5 The Tool-Usage Lexicon L16 (F9)

**The responsibility:** verify tool usage per hunter — INTENT-AWARE (the operator: "dont just code some dumb static bullshit. make sure this is properly event/intent/context aware"). Per the Lexicon Bible: the detection is mechanical, the decision is the state machine, every verdict carries the evidence triplet.

**The detection layer (the mechanical reads — already in the data):**
- The agent's message stream: agent.state.messages' content parts carry the toolCall NAME (the roundToolCalls loop at pi-aether-agent.ts:399-408 already scans them — collect `toolCallNames: string[]`, not just the count).
- The hunter's BRIEF: graphQueries present? GRAPH_TOOLS_LAW block? (the mandate's strength).
- The roster's gate class: SRO = graph-native; LASME/MPSE = spec-first; meta = synthesis.
- The run's graph state: micro-graph populated? MCP connected? (the F5 telemetry).

**The PatternFamily members (typed, tested):**

| id | kind | matcher (Order-2) | triggerCondition | severity | remediationHook |
|---|---|---|---|---|---|
| MANDATE_GRAPH_FIRST | tool-usage-evidence | brief.graphQueries.length > 0 AND gateClass === 'SRO' | toolCallNames ∩ graphifyTools === ∅ | HIGH | flag TOOL_USAGE_UNDERUSE |
| MANDATE_GRAPH_ASSIST | tool-usage-evidence | brief.graphQueries.length > 0 AND gateClass !== 'SRO' | toolCallNames ∩ graphifyTools === ∅ AND report lacks graph-evidence citations | MEDIUM | flag TOOL_USAGE_UNDERUSE |
| SPEC_ONLY | tool-usage-evidence | brief.graphQueries.length === 0 | (always true when matched) | INFO | none — the gate SILENT (never a false positive) |
| GRAPH_UNAVAILABLE | infra-evidence | runGraphState.microPopulated === false | (always true when matched) | HIGH | the INFRA loud-fail (F5) — NOT a hunter violation |
| TAG_MANDATED | tool-usage-evidence | findingsCount > 0 AND brief mandates tagging | toolCallNames excludes 'graph_tag' | MEDIUM | flag TAG_SKIPPED |
| THEATER_PATTERN | tool-usage-evidence | report text cites graphify: ops AND toolCallNames ∩ graphifyTools === ∅ | (always true when matched) | CRITICAL | REJECT the settlement — the report quoted tools it never ran |

**The decision layer (the state machine):**
```
CLEAN        → the settlement passes; toolCallNames ride the roster telemetry
UNDERUSE     → the settlement stands (findings may be fine); the FLAG rides
               the roster + the findings-map (the brief-vs-capability audit's
               evidence; 3 consecutive UNDERUSE on a template = the adaptive
               signal — the brief's mandate or the tool ergonomics need work)
THEATER      → the settlement REJECTED loudly (TOOL_USAGE_THEATER: <layerId>)
```

**The interface:**
```ts
interface ToolUsageVerdict {
  pattern: string;                    // the matched pattern id
  state: 'CLEAN' | 'UNDERUSE' | 'THEATER' | 'SILENT';
  evidence: {
    toolCallNames: string[];          // the actual calls
    briefMandate: 'graph-first' | 'graph-assist' | 'spec-only';
    graphAvailable: boolean;
    reportCitesGraph: boolean;        // the text scan (detector only)
  };
}
// Consumed by: the roster entry (per hunter) + the findings-map + the
// run-status telemetry block.
```

<!-- L2-CHUNK-9-CONSUMED -->
## §2.6 The Self-Defect Gate (F10)

**The responsibility:** the audit's own findings against its execution path BLOCK the next run until dispositioned. The consumption loop closes.

**The detection:** a SELF_DEFECT classifier at [FINAL] — any finding whose `file` field ∈ the tool's own execution paths (src/hydra/**, src/audit-engine/harness/**, src/audit-engine/aether-backend/**, src/audit-engine/graph-logic-phase.ts, src/audit-engine/index.ts) with severity ≥ HIGH.

**The mechanism:**
```ts
// index.ts — at [FINAL], before the artifact write:
const selfDefects = allFindings.filter(f =>
  SELF_DEFECT_PATHS.some(p => f.file?.startsWith(p)) &&
  ['CRITICAL', 'HIGH'].includes(f.severity));
if (selfDefects.length > 0) {
  // THE BLOCK MARKER — the next run reads it at startup:
  fs.writeFileSync(path.join(ledgerRoot, 'SELF_DEFECT_BLOCK.json'),
    JSON.stringify({ runId, defects: selfDefects.map(f => ({
      file: f.file, line: f.line, description: f.description?.slice(0, 200),
      severity: f.severity, hunter: f.layer })),
      dispositionedAt: null,
      directive: 'Fix these before the next audit run. Delete this file to '
       + 'acknowledge disposition (the fix or the explicit operator waive).'
    }, null, 2));
  tridentLog('ERROR', 'audit-engine',
    `SELF_DEFECT_BLOCK: ${selfDefects.length} HIGH+ findings against the ` +
    `tool's own execution path — the next run REFUSES until dispositioned.`);
}
// The next run's startup (index.ts, the validation phase):
if (fs.existsSync(SELF_DEFECT_BLOCK)) → the audit REFUSES loudly:
  `AUDIT_BLOCKED_SELF_DEFECT: the prior run flagged <N> self-defects —
   read SELF_DEFECT_BLOCK.json, fix, delete the file to acknowledge.`
```

**The loop:** detection (the audit's own hunters — already proven working) → the block file (mechanical) → the refusal (loud) → the fix (the operator/orchestrator) → the delete (the acknowledgment) → the next run proceeds. No finding against the machinery evaporates again.

<!-- L2-CHUNK-10-CONSUMED -->
## §2.7 The Findings Delivery Lexicon L15

**The responsibility:** replace the contextless toast with a ranked findings map + relevance rolodex + directives, delivered to the primary agent at [FINAL]. Per the Lexicon Bible: detection (mechanical scoring) → classification (weighted) → decision (the delivery artifact) → evidence (the triplets).

**The detection layer (D1-D6, mechanical reads):**
```
D1 SELF_DEFECT    — finding.file ∈ the tool's execution paths
D2 SEVERITY_CLASS — CRITICAL > HIGH > MEDIUM (the canon)
D3 CONFIDENCE     — ≥0.85 high-trust / 0.70-0.85 verify / <0.70 low
D4 CORRELATION    — same file:line flagged by ≥2 hunters (reads both graphs)
D5 BLAST_RADIUS   — the finding's file's in-degree from the macro graph
D6 RECENCY        — files touched in the last N days (git or mtime)
```

**The classification (the weighted score — L3's model, not first-match):**
```
SCORE = severityWeight(C=10,H=5,M=2)
      × confidence
      × (correlationCount ≥ 2 ? 1.5 : 1.0)
      × (selfDefect ? 2.0 : 1.0)
      × (1 + min(blastRadiusInDegree, 50) / 100)
```

**The decision layer — THE OPERATOR BRIEF (the artifact that replaces the toast):**
```
[AUDIT COMPLETE] <runId> · <wall>min · <N> candidates · <H>/<H> hunters
  graph: macro <nodes>/<edges> · micro <nodes>/<edges> · tags <written>

⚠ SELF-DEFECTS (the tool flagged its OWN machinery) — <N> HIGH+:
  1. <file>:<line> — <description excerpt> (<hunter>, <conf>,
     ×<corr>-hunter correlation) → <the one-line consequence>
  ...
  → DIRECTIVE: <the fix contract reference — this spec's §x.y>
  → BLOCK: the next run refuses until dispositioned (F10)

TOP PROJECT FINDINGS (ranked):
  1-N. [<sev>] <file>:<line> — <excerpt> (<hunter> ×<corr>, conf <c>)
     blast-radius: <in-degree> callers affected

CORRELATION CLUSTERS (TRIPLE_CONFIRMED where ≥3 hunters agree):
  <the same-site clusters, the hunters list, the combined reading>

FULL REPORTS:
  doc2: <path> (<N> findings) · _meta-*/report.md (the DEEP adjudications
  — READ THESE for the per-hunter reasoning) · verdicts.json ×<N>

RELEVANCE ROLODEX: <ledgerRoot>/findings-map.json
  (by-file → by-layer → by-severity → by-correlation → by-subsystem)
```

**The rolodex artifact (findings-map.json):** the machine-readable index — every finding's triplet (id, file:line, hunter, severity, confidence, correlation cluster id, blast radius) queryable by file/layer/severity/cluster. The primary agent's first-read order: the brief → the rolodex → the _meta ledgers → doc2 on demand.

**The toast upgrade:** the run-status toast at [FINAL] carries the brief's headline (the self-defect count + the top-3 findings) — no more bare counts.

<!-- L2-CHUNK-11-CONSUMED -->
## §2.8 The Graph Firewall Enforcement

**The responsibility:** the two stores never write each other. AD-7 as mechanical teeth.

```
MACRO (corbell → shared.db):
  WRITE: the graph-logic phase ONLY (the corbell mirror + the typed insert).
  READ:  the primary agent + the meta stitch + the L15 blast-radius query.
  GUARD: no hunter-facing tool opens shared.db for write. The F7 fix removes
         the last side door (the db-handle fallback chain). The audit gate
         gains the pattern member: CROSS_STORE_WRITE — any code path where
         a tool in aether-tools.ts or graphify.ts opens shared.db = CRITICAL.

MICRO (graphify → graphify-out/graph.json):
  WRITE: graph_tag (the hunters) + the extract (once per run).
  READ:  the hunters' queries + the meta stitch + the primary agent.
  GUARD: the graphify server owns the write path (atomicity); no direct
         file writes to graph.json outside the server.

THE BRIDGE (structured, never a merge):
  The stitch (aether-meta) reads BOTH stores, computes the same-site
  multi-predicate clusters, writes CORRELATIONS + the findings-map.
  The stores exchange NOTHING directly — the bridge is read-only over both.
```

<!-- L2-CHUNK-12-CONSUMED -->
## §3 IMPLEMENTATION ORDER

Five waves, parallelizable where disjoint. One builder per disjoint file set (the law).

### WAVE W-TOOLS (the injection trio — the ROOT fixes; files: pi-aether-agent.ts, aether-auditor.ts, aether-meta.ts)
| Fix | File | Done-when |
|---|---|---|
| F1 | pi-aether-agent.ts | opts.tools merged into initialState; the battery proves a mission tool is callable in a scripted run |
| F2 | aether-auditor.ts:94,128 | missionTools assigned + passed; grep shows zero unassigned buildAuditorTools calls |
| F3 | aether-meta.ts:380,383 | the void-catch deleted; metaTools passed; grep shows zero void-e.message on tool assembly |
| F4 | aether-meta.ts:387 | the fallback append DELETED; the META_DOC_SECTION_MISSING throw present; the test proves a toolless meta agent → the loud fail |
| F9a | pi-aether-agent.ts:399-408 | toolCallNames collected per round (the names, not just the count) in the run result |

### WAVE W-GRAPH (the substrate; files: graph-logic-phase.ts, index.ts, graph-mapper.ts, run-status.ts)
| Fix | File | Done-when |
|---|---|---|
| F6 | graph-logic-phase.ts:65 | substrate='corbell' + excludes; the corbell build verified on this repo (the bounded probe); loud-fail on adapter failure (no native-ast fallback) |
| F5 | index.ts, graph-mapper.ts | extract+connect pre-gates; scope/exclude consumed (the :74 voids gone); the GRAPHIFY_MICRO_FAILED loud fail; run-status carries graphState |

### WAVE W-TAG (the write-back; files: aether-tools.ts, kind-for-layer.ts, aether-meta.ts PREDICATE_MAP)
| Fix | File | Done-when |
|---|---|---|
| F7 | aether-tools.ts | graph_tag → the MCP client exclusively; the db-handle chain deleted; the CROSS_STORE_WRITE guard |
| F8 | kind-for-layer.ts, aether-meta.ts | R28→'Gate', R29→'File'; the 2 predicates added; the tag test: 0 CHECK failures on the fixture |

### WAVE W-GATES (the lexicons; files: NEW tool-usage-lexicon.ts, NEW findings-map.ts, index.ts, aether-meta.ts)
| Fix | File | Done-when |
|---|---|---|
| F9b | tool-usage-lexicon.ts (NEW) | the L16 PatternFamily table; the verdict rides the roster; the THEATER rejection test |
| F10 | index.ts | the SELF_DEFECT_BLOCK write + the startup refusal; the test proves block→refuse→delete→proceed |
| L15 | findings-map.ts (NEW) + aether-meta.ts + run-status.ts | the map builder + the operator brief + the rolodex; the toast carries the headline |

### WAVE W-VERIFY (the graph-verify skill + the host round)
| Item | Done-when |
|---|---|
| The graph-verify skill | .opencode/skills/graph-verify/SKILL.md — the V1-V6 protocol (schema, lineage, adversarial queries, blind spots, cross-verify, two-graph state) |
| The host re-fire | RT-1 on the new dist: the oracles incl. OR-3 ≥ 50 (the tags land), the tool-usage telemetry, the operator brief delivered, the self-defect gate exercised |

**Dependency order:** W-TOOLS + W-GRAPH parallel (disjoint files) → W-TAG (depends on the MCP connect from W-GRAPH) → W-GATES (consumes the telemetry from W-TOOLS) → W-VERIFY (the full round on the rebuilt dist).

**Excluded from this spec (queued separately):** PB-1..3 (the poseidon enforcer — the enforcement wave), the MerkleChain wiring decision (the operator's call), the native-ast member-call resolution (the fallback's own debt — only relevant if corbell path needs the fallback), the 11 __tests__ hygiene fails, the v6 merge (gated on this spec's completion).

<!-- L2-CHUNK-13-CONSUMED -->
## §4 TESTING STRATEGY

**Unit (per component):**
- F1: a scripted pi run (streamFn seam) with opts.tools carrying a probe tool — the agent calls it; the toolCallNames include it.
- F2/F3: the settlement path — buildAuditorTools' output reaches the agent (a spy on run()'s opts); the void-catch absence (grep + the throw test).
- F4: a toolless meta agent → META_DOC_SECTION_MISSING (the loud fail); a tooled one → the section lands.
- F5: the extract mock → graphState populated; the extract failure → GRAPHIFY_MICRO_FAILED (the abort).
- F6: the corbell probe on this repo (bounded, the excludes verified); the ADAPTER_FAILED loud path.
- F7: graph_tag through a mock MCP client — the write hits the tag verb, NEVER a db open.
- F8: the kind legality (isNodeType) + the predicate map lookups.
- F9: the L16 matcher table — each pattern's fire + silent cases (SPEC_ONLY never flags; GRAPH_UNAVAILABLE routes to the infra fail).
- F10: block→refuse→delete→proceed (the lifecycle test).
- L15: the map builder on a fixture run — the scores, the clusters, the brief's shape.

**Integration (the re-fire):**
- The full audit on this src with the graphify binary LIVE: the micro-graph populated, the hunters' toolCallNames carrying graphify:*, the tags landing in graph.json (NOT shared.db), the correlations ≥ 50, the operator brief delivered, the self-defect block exercised on the R22-class findings (which this spec FIXES — so the block tests use seeded fixtures).

**Replay tests (from the real evidence):**
- The R28 theater replay: a hunter report citing graphify ops with zero tool calls → THEATER_PATTERN rejects (the exact class this run exposed).
- The doc1 fallback replay: the meta agent fails → no runner section → the loud fail (the exact "Patterns: pending" class).

<!-- L2-CHUNK-14-CONSUMED -->
## §5 ANTI-PATTERNS AGAINST FALSE SUCCESS

**AP-1 THE RE-DISCARD:** the injection lands (F1) but a refactor re-introduces an unassigned build*Tools call. THE GATE: grep -rn "buildAuditorTools\|buildMetaTools" src | grep -v "const\|=\s*build\|return" → 0 hits; the CI grep runs per build.

**AP-2 THE QUIET FALLBACK RESURRECTION:** someone re-adds a runner-authored doc1 section "for robustness." THE GATE: grep -c "Patterns: pending" src → 0; the F4 throw is the only no-section path.

**AP-3 THE VOID-PATTERN:** any `void tools`, `void e.message` on a tool assembly, or a discarded mission surface anywhere in the hydra path. THE GATE: the grep ban list in the wave's done-when.

**AP-4 THE SILENT NATIVE-AST FLIP:** the corbell path fails on some edge → someone "temporarily" falls back. THE GATE: the audit path has NO fallback code — the ADAPTER_FAILED throw is the only failure branch; grep confirms no try/catch around selectAdapter that swaps substrates.

**AP-5 THE CROSS-STORE LEAK:** a "convenience" fix writes tags to shared.db "because it's right there." THE GATE: the CROSS_STORE_WRITE pattern (§2.8) + the F7 single-write-surface.

**AP-6 THE STATIC TOOL-CHECK:** someone replaces the L16 lexicon with `if (toolCallNames.includes('graphify:query')) pass;` — the dumb static check the operator explicitly banned. THE GATE: the L16 file carries the PatternFamily table with the 6 members + the state machine; the SPEC_ONLY and GRAPH_UNAVAILABLE silent paths are TESTED (the false-positive killers).

**AP-7 THE THEATER SURVIVOR:** a hunter's report cites graph tools it never called and passes because "the findings look good." THE GATE: the THEATER_PATTERN rejection (report-cites-graph AND zero-calls = REJECTED, regardless of finding quality — the R28 class).

**AP-8 THE UNREAD BLOCK:** the self-defect block file exists, the next run refuses, and someone deletes the file without fixing (the acknowledgment theater). THE GATE: the delete requires the disposition note (the fix commit sha or the operator waive) written INTO the file before deletion — the file's own schema enforces it.

<!-- L2-CHUNK-15-CONSUMED -->
## §6 SUCCESS CRITERIA

Mechanical, numbered, operator-verifiable:

1. **SC-1 THE TOOLS LIVE:** a live audit run's roster telemetry shows graphify:* toolCallNames > 0 for the SRO hunters (the L16 verdicts CLEAN or UNDERUSE — never THEATER, never all-SILENT).
2. **SC-2 THE MICRO-GRAPH EXISTS:** graphify-out/graph.json present under the target post-run; run-status.graphState.micro populated with nonzero counts.
3. **SC-3 THE MACRO IS CORBELL:** run-status.graphState.macro.substrate === 'corbell'; the adapter's build logged; the shared.db counts from the corbell mirror.
4. **SC-4 THE TAGS LAND:** graph_facts > 0 in the micro-graph store; the 13-failure class = 0; CORRELATIONS ≥ 50 on the repo-scale re-fire (OR-3 PASS).
5. **SC-5 THE META WRITES ITSELF:** doc1's three META sections authored by the meta agents (the write_meta_doc calls in the telemetry); zero "Patterns: pending" anywhere.
6. **SC-6 THE SELF-DEFECT LOOP:** the R22-class findings (or the seeded fixtures) trigger the block; the next run refuses; the delete-with-disposition proceeds. The full lifecycle test.
7. **SC-7 THE OPERATOR BRIEF:** [FINAL] delivers the brief (the headline + self-defects + top findings + the rolodex path) — not a bare count.
8. **SC-8 THE FIREWALL:** the CROSS_STORE_WRITE guard + the single-write-surface greps pass; no hunter tool opens shared.db.
9. **SC-9 THE BATTERY:** the full preflight green (hydra + aether-backend + the new lexicon tests); tsc 0 new in touched files.
10. **SC-10 THE WALL:** OR-1 re-measured on the fixed dist (the corbell + graphify adds may shift the wall — the number recorded, the 20-min bar adjudicated).

<!-- L2-CHUNK-16-CONSUMED -->
## §7 COMPACTION-PROOF IMPLEMENTATION GUIDE

**The docs to maintain:**
- THIS SPEC is the design authority — every deviation is a SPEC-VIOLATION.
- DEBUG_LOG: every bug found during the waves (EN-N entries, append-only).
- The wave audits (.trident/wave-audit/*.md) — per-hunk verdicts.
- EVIDENCE_STATE: the SC-1..SC-10 proofs as they land.

**The resume anchors (a fresh session reads in order):**
1. This spec (the whole thing — §0 for the problem, §3 for the wave state).
2. .trident/wave-spec.json (the current wave's roster).
3. The last wave audit (the verdicts + what's covered).
4. DEBUG_LOG's latest EN entries (the session's bugs).

**Cross-consistency rules:**
- The spec's F-IDs are the canonical defect names — DEBUG_LOG EN-ids cross-reference them.
- The wave-plan's done-when items cite the SC numbers they satisfy.
- The self-defect block file (F10) is the live state of the consumption loop — its presence/absence is the gate's state.

<!-- L2-CHUNK-17-CONSUMED -->
## §8 FINAL NOTES / OPEN QUESTIONS

**Q1 — the corbell scan on this repo layout (F6):** my probe showed Methods:0 on the whole-workspace scan and Methods:2 on a clean fixture. The scope:src + Checkpoints excludes are the expected fix, but the W-GRAPH desk must VERIFY with the bounded probe before declaring the substrate switch done. If corbell still yields 0 code nodes on src/ alone, that's a loud finding (the corbell issue tracker / the workspace.yaml shape) — NOT a reason to flip back.

**Q2 — the graphify tag verb surface:** F7 assumes the graphify MCP server exposes an add_tag (or equivalent) tool. The W-TAG desk verifies via listTools() on the connected client; if the server lacks the verb, the desk adds the tag write to the graphify python server (it's our tool — /home/leviathan/.local/share/uv/tools/graphifyy) or writes graph.json directly through the mapper's own write path (documented in the wave audit).

**Q3 — the MerkleChain wiring:** queued as the operator's decision (wire it into the evidence pipeline or cut it). This spec does not decide it.

**Q4 — the PB-1..3 poseidon fixes:** the enforcement wave, AFTER this spec ships (the audit tool must work first — then the enforcement machinery gets fixed with the audit's own findings as the test fixtures).

**Q5 — the v6 merge:** gated on this spec's SC-1..SC-10 (the merge-readiness gate in the host suite §10).

<!-- L2-CHUNK-18-CONSUMED -->
## APPENDIX A — ZERO-TRUST AUDIT

| # | Severity | Finding | The surgical fix |
|---|---|---|---|
| 1 | MEDIUM | Q2: the graphify MCP tag verb is assumed, not verified | The W-TAG desk's first task is listTools() — the assumption is named as the desk's verification step, not left implicit |
| 2 | LOW | The L15 blast-radius query reads the macro graph — its in-degree data depends on the corbell mirror (F6) landing first | The wave order already sequences W-GRAPH before W-GATES; the dependency is documented |
| 3 | LOW | The self-defect path list (F10) is hardcoded — new execution files would need the list updated | Named as an accepted trade (the list is small + stable); the L15 lexicon can auto-derive it from the import graph later |
| 4 | INFO | The spec references the Lexicon Bible's patterns (L15/L16 numbering continues the bible's L1-L14 inventory) — a reader without the bible lacks the pattern-form context | The bible is a workspace-wide canon doc; the spec defines the PatternFamily shape inline at §2.5 |

**Verdict:** 4 findings (0 CRITICAL, 1 MEDIUM, 2 LOW, 1 INFO) — **no unresolvable gaps.** The MEDIUM is a named verification step in the wave plan, not an open risk.
