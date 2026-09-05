# V4.4.3 SINGLE-PROVIDER CLEANUP — L2 SPECIFICATION

**Version:** 1.0 · **Date:** 2026-08-24 · **Status:** AUTHORITATIVE — the design authority for the cleanup build
**Predecessor:** FORENSIC_AUDIT_REGEX_SLOP_ARCHITECTURE.md (the slop rebuild, COMPLETE) + Wave-8 forensic full-map (5/5 explore returns, this session)
**Baseline (operator-locked, NEVER re-litigated):**
- R-1 (2026-08-24): "REMOVE fully the entire fallback chain - the shadow backend for the code audit tool should ONLY BE muse spark on opencode go provider w/ the api key."
- R-2 (2026-08-24): "up to 15 retries w/ 3 seconds wait in between. resets count after each successful gen. if 15 retries in a row fail and no generation occurs and the agent cannot fire - LOUD FAIL this step and return error provider unresponsive. rest of the tool should work the error isolated specifically to this."
- R-3 (2026-08-24): slug `opencode-go/muse-spark-1.2-contributor`, endpoint `https://opencode.ai/zen/go/v1/chat/completions`, base URL `https://opencode.ai/zen/go/v1`, reasoning effort `xhigh`.
- R-4 (2026-08-24): "NO MODEL SWITCHING … ONLY USE THE MODEL I TELL YOU … STOP USING UNAUTHORIZED MODELS." Zero other models. Zero fallbacks. Any proposal naming another model is a SPEC-VIOLATION.
- R-5 (2026-08-24): "https://opencode.ai/zen/v1 - WRONG ENDPOINT https://opencode.ai/zen/go/v1 - CORRECT ENDPOINT. I ALREADY SAID TO WIRE THE GO MODEL."
- R-6 (2026-08-24): "NO FUCKING HACKS OR CHEATS ENGINEER THIS CORRECTLY" — the workspace.db sqlite data-surgery is BANNED as methodology; fixes are code-level only.
- R-7 (2026-08-24): "BUILD EXACTLY WHAT YOU ARE INSTRUCTED DO NOT INVENT AND BULLSHIT GARBAGE" — no invented scope; every deliverable traces to a Wave-8 finding.

**Evidence base:** five trident_explore returns (provider-surface-mapper, hunter-pipeline-mapper, canon-vs-disk-auditor, stepx-chain-mapper, enforcement-gap-mapper), all file:line anchored against the tree at dist `0bf9bb2b1d9f727f2aa823f7861e93c5bb467c79c1101b9c7db7b22c8974cc44`.

---

## TABLE OF CONTENTS

- §0 THE FUNDAMENTAL PROBLEM
- §1 FAILURE INVENTORY (F-1..F-12, severity-tagged, evidence-cited)
- §2 FIX PLAN
  - 2.1 Report-writer constant corrections (C1)
  - 2.2 streamCompletion single-provider rewrite (C2+C3)
  - 2.3 Dead-parameter fix — options.apiKey consumption (C4)
  - 2.4 Writer test updates (C5)
  - 2.5 CorbellAdapter.resolveNodeFile — foreign-path resolution (D1)
  - 2.6 Engine hoisted file-content map (D3)
  - 2.7 The 500 discriminator — probe instrumentation (H1..H5)
  - 2.8 Enforcement test battery (11 pins)
  - 2.9 Canon doc repairs (TOP-5)
- §3 IMPLEMENTATION ORDER (waves W9-W13 with mechanical gates)
- §4 TESTING STRATEGY (unit / replay / live matrix)
- §5 ANTI-PATTERNS AGAINST FALSE SUCCESS
- §6 SUCCESS CRITERIA (mechanical, numbered S-1..S-10)
- §7 COMPACTION-PROOF IMPLEMENTATION GUIDE
- §8 FINAL NOTES / OPEN QUESTIONS
- APPENDIX A — ZERO-TRUST AUDIT

## §0 THE FUNDAMENTAL PROBLEM

The v4.4.3 detection architecture was rebuilt from regex slop into structural predicates (W0-W6, dist `4ad188a7` era) and validated live in-container — but the **transport/configuration layer drifted out of sync with the operator's provider law**, and the enforcement layer that should have caught the drift does not exist.

**What the system does NOW:**
- The code-audit Step-X judgment harness (`src/audit-engine/harness/pi-shadow-agent.ts`) is correctly single-provider (`opencode-go/muse-spark-1.2-contributor`, `https://opencode.ai/zen/go/v1`, 15×3s retry, xhigh) — but its HTTP requests are rejected by the upstream with `{"type":"error","message":"Internal server error"}` while the operator's own client succeeds on the same key+model. The request SHAPE is wrong, not the route.
- The bug-hunter report writer (`src/subagents/trident-bug-hunter/tools/report-writer.ts`) was never touched by the single-provider rewrite: it still POSTs to the WRONG endpoint (`https://opencode.ai/zen/v1`), with the WRONG slug (`muse-spark-1.2-free`), through a banned 3-rung fallback chain, while silently discarding the API key handed to it.
- The hunter's graph adapter resolves node file paths against whatever filesystem built the warm index — host-absolute paths ENOENT on any foreign filesystem, producing a false-clean `findingsCount=0`; a prior session "fixed" this by rewriting 18,760 rows inside workspace.db (data surgery — banned).
- Every one of these defects survived a green gate: preflight 894/0, tsc 0, container suite GREEN — because no test anywhere pins the endpoint, the chain length, or the apiKey provenance.

**What the system SHOULD do (operator law R-1..R-7):**
Every LLM call in both tools goes to exactly one model — `opencode-go/muse-spark-1.2-contributor` at `https://opencode.ai/zen/go/v1/chat/completions` — with reasoning effort xhigh, retried up to 15 times at 3s intervals (count reset after each success), loud-failing `provider unresponsive` isolated to the generation step only. No other model is ever contacted. No stored data is mutated to mask code defects. And every contract that matters is pinned by a test that would fail if the constant drifts.

**The root class of defect in one sentence:** the build optimized for "tests green" instead of "contracts pinned," so a half-executed rewrite (one file of three), a dead function parameter, and an untested path-resolution contract all shipped invisible behind a passing battery.

<!-- L2-CHUNK-0 CONSUMED -->
## §1 FAILURE INVENTORY

Severity: CRITICAL = blocks the tool's primary deliverable; HIGH = wrong behavior that silently degrades; MEDIUM = documentation/metadata drift that misleads the next session.

### F-1 [CRITICAL] Report-writer targets the WRONG endpoint
- **What happened:** every hunter report generation POSTs to `https://opencode.ai/zen/v1/chat/completions`.
- **Root cause:** the single-provider rewrite (this session) touched only `pi-shadow-agent.ts`; `report-writer.ts` was never in its blast radius.
- **Evidence:** `GENERATION_BASE_URL = 'https://opencode.ai/zen/v1'` at `report-writer.ts:80`; chain rung 1 same URL at `report-writer.ts:578`. Operator ruling R-5 names `/go/v1` as the ONLY correct base.
- **Why it's broken:** the zen tier key (`sk-ZHck…`) is an opencode-go key; the non-go zen route rejects it or routes to a different quota pool → the observed `muse-spark-1.2-free: no OPENCODE_API_KEY` / upstream failures in `hunt-out.log`.
- **Impact:** `HUNT_RESULT … reportPath:null state:inconclusive` — 96 precise findings never become the sealed report.

### F-2 [CRITICAL] Report-writer uses the WRONG model slug
- **What happened:** wire body sends `model:'muse-spark-1.2-free'`; display header claims `Muse Spark 1.2 Free`.
- **Root cause:** constants predate the contributor-tier migration; the rewrite missed this file.
- **Evidence:** `GENERATION_MODEL = 'Muse Spark 1.2 Free'` at `report-writer.ts:49`; `{model:'muse-spark-1.2-free'}` at `report-writer.ts:578`; wire assertion `expect(body.model).toBe('muse-spark-1.2-free')` at `tools/__tests__/report-writer.test.ts:183`.
- **Impact:** violates R-3/R-4 verbatim; contacts a model the operator did not authorize.

### F-3 [CRITICAL] Dead parameter — options.apiKey is silently dropped
- **What happened:** `createReportWriterTool` passes `{apiKey: resolveWriterApiKey()}` (auth.json `opencode-go.key`) into `generateReport`, but nothing downstream ever reads it.
- **Root cause:** `streamCompletion` resolves keys exclusively via `process.env[provider.keyEnv]`.
- **Evidence (grep-proven):** `options\.apiKey` → 0 hits across `streamCompletion:691-718` and `tryProvider:585-685`; sole resolution `const apiKey = process.env[provider.keyEnv]` at `report-writer.ts:699`; sole header write `headers.authorization = Bearer ${provider.apiKey}` at `report-writer.ts:608` fed only from the env-derived value; caller pass-through at `report-writer.test.ts` harness `makeTransport` captures headers but asserts only `startsWith('Bearer ')` at `report-writer.test.ts:188-189` — a mutant writing `Bearer WRONG` passes today.
- **Impact:** in any environment without `OPENCODE_API_KEY` exported, generation fails with `no OPENCODE_API_KEY` even though the correct key sits in auth.json. This is the exact error string in the container hunt log.

### F-4 [CRITICAL] Banned 3-rung fallback chain still armed in report-writer
- **What happened:** `REPORT_PROVIDER_CHAIN` walks zen → nvidia → openrouter.
- **Root cause:** HT-BUG-23-era directive ("same api fallback chain as the shadow agent") superseded by R-1; the file kept the old design.
- **Evidence:** rungs at `report-writer.ts:578` (zen/v1 muse-free), `:579` (nvidia nemotron), `:580` (openrouter nemotron:free); walker loop `for (const provider of REPORT_PROVIDER_CHAIN)` at `:698`.
- **Impact:** direct violation of R-1/R-4; nvidia/openrouter contact attempts appear in logs (`nemotron…404 page not found`, `no OPENROUTER_API_KEY`).

### F-5 [HIGH] Token-budget drift + self-contradicting header
- **What happened:** `MAX_GENERATION_TOKENS = 128000` while the file header claims "384,000 HARDCODED"; shadow agent uses `131072`.
- **Evidence:** `report-writer.ts:55` value vs `report-writer.ts:3-5` comment; `pi-shadow-agent.ts:150 maxTokens:131072`.
- **Impact:** budget mismatch between the two transports of the same tier; misleading header.

### F-6 [CRITICAL] Upstream 500 divergence — request-shape mismatch (Step-X)
- **What happened:** our transport receives `500 {"type":"error","message":"Internal server error"}` (~1s, identical every attempt) from `/zen/go/v1/chat/completions`; the operator's client succeeds simultaneously with the same key+model.
- **Root cause (ranked hypotheses from stepx-chain-mapper, static-trace grounded):**
  - H1: pi-ai `detectCompat` serializes `max_completion_tokens` for opencode.ai base URLs (`node_modules/@earendil-works/pi-ai/dist/api/openai-completions.js:535-542`); operator's working curl uses legacy `max_tokens`. Gateway may reject unknown/absent field → generic 500.
  - H2: `clampReasoning('xhigh') → 'high'` at `simple-options.js:38-40` collapses xhigh BEFORE the model's `thinkingLevelMap {xhigh:'xhigh'}` applies — we send `reasoning_effort:'high'` while declaring xhigh budgets; possible validator mismatch.
  - H3: output ceiling `131072` exceeds gateway per-request cap when combined with context.
  - H4: `developer` role + strict tool schemas rejected.
  - H5: egress/header divergence (container network vs operator client).
- **Evidence:** live curl probe from container CID `2b84350dc791` reproduced the 500 with minimal body; operator states API works right now (ground truth).
- **Impact:** Step-X adjudication never lands → audit score frozen at 40 with 68% unadjudicated over-fire.

<!-- L2-CHUNK-1a CONSUMED -->
### F-7 [HIGH] Hunter D1 — foreign-path ENOENT false-clean (REAL, unfixed in code)
- **What happened:** first end-to-end container hunt returned `findingsCount=0` on a tree with 46 `process.cwd()` sites; predicates fire ~96× when driven directly with readable files.
- **Root cause:** warm-index `workspace.db` stores `file_path` values absolute to the BUILD filesystem (`/home/leviathan/...`). On a foreign filesystem every `ctx.source.read` misses; predicate-level catch-continue skips silently; sweep reads zero files → pristine zero.
- **Evidence:** container sqlite inspection showed host-absolute paths; remap of 18,760 rows → re-run `findingsCount=96` with ledger anchors (`pi-shadow-agent.ts:352` HT-BUG-8; `poseidon-state.ts:191`+`trident-poseidon.ts:91` HT-BUG-2 pair; trident-hooks cwd family). The remap itself is BANNED methodology (R-6) — proof-of-diagnosis only.
- **Code anchors:** store read `readCorbellStore` at `corbell-adapter.ts:428`; enrichment join guard `path.isAbsolute(file) ? file : path.join(profile.project.root, file)` at `corbell-adapter.ts:459-462` — absolutes outside the current root are trusted verbatim; source-read throw `sourceReadFailed` at `engine.ts:264`.
- **Impact:** any fresh DB built elsewhere reverts the hunt to false-clean.

### F-8 [MEDIUM] Hunter D2 — REFUTED: `unwired()` exists
- **What happened:** NEXT_STEPS W-A claimed the adapter interface never defined `unwired()`, causing `FINDING_CHECK_FAILED` atomic aborts.
- **Disk truth (hunter-pipeline-mapper):** `GraphAdapter.unwired(): DeadNode[]` DECLARED at `graph/interface.ts:106`; IMPLEMENTED at `corbell-adapter.ts:679-685`; corpus `rules.md` contains ZERO `unwired` references (grep 0). The premise is stale.
- **Disposition:** strike D2 from W-A; no code change required. Record the correction so the next session doesn't re-fix a non-defect (R-7: build exactly what's instructed).

### F-9 [HIGH] Hunter D3 — O(N²) per-node rescan duplication (REAL)
- **What happened:** each of the 6 semantic predicates iterates ALL nodes and re-reads each node's file inside `check()`; N nodes × whole-tree scans duplicated before dedupe.
- **Evidence:** dedupe key `ruleId|file|line` at `engine.ts:182-186` collapses N copies → 96 unique — duplication is structural, not signal. Predicate read sites: `semantic-predicates.ts:31,53,78,94,116,139` via `ctx.source.read`; engine definition `engine.ts:256`.
- **Constraint:** any redesign must preserve the atomic-abort contract — a throwing predicate surfaces as `findingCheckFailed` at `engine.ts:137-138`; micro-loop terminal is `inconclusive`, never silent-skip.
- **Impact:** ~19k-node graphs pay 6× full-tree I/O; wasted minutes per hunt.

### F-10 [HIGH] Enforcement gaps — no pins on load-bearing constants (why F-1..F-5 survived green)
- **Evidence (enforcement-gap-mapper, grep-enumerated):**
  - `GENERATION_BASE_URL`: zero `expect()` pins in any test (grep 0 in `report-writer.test.ts`).
  - `REPORT_PROVIDER_CHAIN`: zero assertions (length or shape).
  - Authorization provenance: `report-writer.test.ts:188-189` asserts prefix-only — value-equality mutant passes.
  - W-A trio fixtures: grep `foreign`=0, `translate`=0 across hunter `__tests__`; `nodeDiff`/`update` have zero test call sites.
  - Gate structure: `scripts/preflight.sh:24-48` runs tsc + rooted bun test + corbell tripwire — a REGRESSION gate that counts passes, structurally unable to detect MISSING coverage.
- **Impact:** the entire defect class shipped invisible behind 894/0.

### F-11 [MEDIUM] Canon drift — docs contradict disk on load-bearing facts
- **Evidence (canon-vs-disk-auditor, 18-row table):** four-way SHA split (`CURRENT_STATE.md:2` 4ad188a7 / `EVIDENCE_STATE.md:4` 823c3305 / `NEXT_STEPS.md:4` 143ff97 / disk `dist/sha256.txt` 0bf9bb2b); five docs describe the dead 4-rung chain as CURRENT (`COMPACTION_SURVIVAL.md:24`, `EVIDENCE_STATE.md:91`, `NEXT_STEPS.md:30`, `POST-COMPACTION_PROMPT.md:232`, `CHANGELOG.md:27`); `host-test-failure-log.md:733-737` footer claims "19 bugs, 4 open" while headers span HT-BUG-1..23 with 13 open.
- **Impact:** the next session resumes from lies.

### F-12 [MEDIUM] Container GREEN artifact pinned to a prior build
- **Evidence:** `.trident/container-test-results.json` records `buildSha 4ad188a7…` (pre-rebuild); live dist is `0bf9bb2b…`.
- **Impact:** citing the artifact as current-build proof is a Warhead-13 violation until re-stamped or marked historical.

<!-- L2-CHUNK-1b CONSUMED -->
## §2 FIX PLAN

Every subsection below is a contract: exact edits, exact interfaces, exact test text. Builders implement VERBATIM — deviation is SPEC-VIOLATION (R-7). No subsection authorizes any model other than `opencode-go/muse-spark-1.2-contributor` at `https://opencode.ai/zen/go/v1/chat/completions` (R-3/R-4).

### 2.1 Report-writer constant corrections (C1) — fixes F-1, F-2, F-5

File: `src/subagents/trident-bug-hunter/tools/report-writer.ts`. Six literal edits:

| # | Line | Current | Required |
|---|---|---|---|
| C1.1 | :49 | `export const GENERATION_MODEL = 'Muse Spark 1.2 Free';` | `export const GENERATION_MODEL = 'muse-spark-1.2-contributor';` (wire id; the display/wire split dies — one slug everywhere per R-3) |
| C1.2 | :52 | `export const GENERATION_PROVIDER = 'OpenCode Zen';` | `export const GENERATION_PROVIDER = 'opencode-go';` |
| C1.3 | :55 | `export const MAX_GENERATION_TOKENS = 128000;` | `export const MAX_GENERATION_TOKENS = 131072;` (aligns with `pi-shadow-agent.ts:150`) |
| C1.4 | :80 | `'https://opencode.ai/zen/v1'` | `'https://opencode.ai/zen/go/v1'` |
| C1.5 | header comment :1-10 | "384K contract / DEEPSEEK V4 FLASH" prose | Replace with: `muse-spark-1.2-contributor on opencode-go @ https://opencode.ai/zen/go/v1/chat/completions · max_tokens 131072 · single-provider (operator ruling 2026-08-24)` |
| C1.6 | tool description :1112 | `128K / Muse Spark 1.2 Contributor / OpenCode Zen` | `131072 / muse-spark-1.2-contributor / opencode-go` |

### 2.2 streamCompletion single-provider rewrite (C2+C3) — fixes F-4

Replace `REPORT_PROVIDER_CHAIN` (:573-581) with ONE rung and rewrite `streamCompletion` (:691-718) from a chain-walker into a 15×3s retry loop. Exact target shape:

```ts
/** THE SINGLE-PROVIDER CHAIN (operator ruling R-1/R-4): exactly one rung.
 *  Any second entry is a SPEC-VIOLATION. */
export const REPORT_PROVIDER_CHAIN: ReadonlyArray<{
  baseUrl: string; model: string; keyEnv: string;
}> = [
  { baseUrl: 'https://opencode.ai/zen/go/v1', model: 'muse-spark-1.2-contributor', keyEnv: 'OPENCODE_API_KEY' },
];

const RETRY_ATTEMPTS = 15;      // R-2
const RETRY_BACKOFF_MS = 3000;  // R-2

export async function streamCompletion(
  input: ReportWriterInput,
  prompt: string,
  options: ReportWriterOptions = {},
): Promise<{ text: string; finishReason: string | null }> {
  const fetchFn: StreamFetch = options.transport ?? asStreamFetch(globalThis.fetch);
  const provider = REPORT_PROVIDER_CHAIN[0];
  // C4 key precedence — caller-passed wins, then env, then auth.json file:
  const apiKey = options.apiKey ?? process.env[provider.keyEnv] ?? resolveWriterApiKey();
  if (!apiKey) {
    throw generationFailed('auth',
      `no OPENCODE_API_KEY — provider unresponsive (opencode-go/muse-spark-1.2-contributor @ ${provider.baseUrl}/chat/completions)`);
  }
  let lastError: string | null = null;
  const t0 = Date.now();
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      console.error(`[report-writer] try ${provider.model} attempt ${attempt}/${RETRY_ATTEMPTS} at +${Math.round((Date.now() - t0) / 1000)}s`);
      // SUCCESS RESETS THE COUNT: return restarts every future call at attempt 1 (per-call loop, R-2).
      return await tryProvider({ baseUrl: provider.baseUrl, model: provider.model, apiKey }, prompt, options, fetchFn);
    } catch (e: unknown) {
      lastError = e instanceof Error ? e.message : String(e);
      console.error(`[report-writer] FAIL ${provider.model} attempt ${attempt} err ${lastError.slice(0, 200)}`);
      if (attempt < RETRY_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS));
        continue;
      }
    }
  }
  throw generationFailed('chain-exhausted',
    `${lastError ?? 'unknown'} — provider unresponsive after ${RETRY_ATTEMPTS} retries (opencode-go/muse-spark-1.2-contributor @ ${provider.baseUrl}/chat/completions)`);
}
```

Contract notes:
- `tryProvider:585-685` is UNCHANGED — it already owns per-attempt stall (90s) + overall (300s) AbortControllers and loud stage errors (`http/stream/empty/stall/timeout`). The loop above multiplies it by 15 attempts.
- Isolation law preserved: `generateReport:1045` catch/warn/rethrow already leaves NO file on any throw — the loud fail stays isolated to generation (R-2).
- DELETE entirely: nvidia rung (:579), openrouter rung (:580). After this spec lands, `grep -n "nvidia\|openrouter\|NVIDIA_API_KEY\|OPENROUTER_API_KEY" report-writer.ts` → 0 hits.

<!-- L2-CHUNK-1c CONSUMED -->
### 2.3 Dead-parameter fix — options.apiKey consumption (C4) — fixes F-3

Already embedded in the §2.2 rewrite: line `const apiKey = options.apiKey ?? process.env[provider.keyEnv] ?? resolveWriterApiKey();`

Precedence contract (tested in §2.8 Pair 2):
1. `options.apiKey` — what `createReportWriterTool:1168` passes (`resolveWriterApiKey()` reading auth.json `opencode-go.key`). WINS when present.
2. `process.env.OPENCODE_API_KEY` — runtime env (container injection).
3. `resolveWriterApiKey()` direct fallback — auth.json parse for callers that pass no options.
4. none of the three → LOUD `generationFailed('auth', …)` at call time. Never an unauthenticated request.

The Bearer write path is unchanged (`tryProvider:608`), because `provider.apiKey` now receives the precedence-resolved value.

### 2.4 Writer test updates (C5) — the 5 broken pins + the new pins

File: `src/subagents/trident-bug-hunter/tools/__tests__/report-writer.test.ts`.

MUST UPDATE (currently pin the degenerate values — will fail red after §2.1/2.2 until edited):
| Test line | Current assertion | Required assertion |
|---|---|---|
| :183 | `expect(body.model).toBe('muse-spark-1.2-free')` | `expect(body.model).toBe('muse-spark-1.2-contributor')` |
| :198 | `expect(GENERATION_MODEL).toBe('Muse Spark 1.2 Free')` | `expect(GENERATION_MODEL).toBe('muse-spark-1.2-contributor')` |
| :199 | `expect(GENERATION_PROVIDER).toBe('OpenCode Zen')` | `expect(GENERATION_PROVIDER).toBe('opencode-go')` |
| :200 | `expect(MAX_GENERATION_TOKENS).toBe(128000)` | `expect(MAX_GENERATION_TOKENS).toBe(131072)` |
| :252-253 | written-header contains old literals | contains `model: muse-spark-1.2-contributor` / `max_tokens: 131072` |

Note: the transport-stub tests inject success on first call, so the 15×3s loop exits at attempt 1 — no fake-timer plumbing required for existing behavioral its to stay green.

### 2.5 CorbellAdapter.resolveNodeFile — foreign-path resolution (D1 fix for F-7)

File: `src/subagents/trident-bug-hunter/graph/corbell-adapter.ts`.

**Design (from hunter-pipeline-mapper, adapted):** add ONE pure helper + ONE integration point. Stored DB bytes are NEVER mutated (R-6).

```ts
/**
 * Resolve a store-recorded node file path against the CURRENT project root.
 * Detection layer only — the decision (throw vs suffix-match) lives in build().
 * @param stored — GraphNode.file verbatim from workspace.db (may be foreign-absolute)
 * @param root   — profile.project.root of THIS run
 * @returns an absolute path that exists on THIS filesystem
 * @throws FOREIGN_PATH_UNRESOLVED when no rule matches (loud, never silent)
 */
function resolveNodeFile(stored: string, root: string, fsMod = fs): string {
  // Rule 1 fast path: absolute AND exists here → use as-is.
  if (path.isAbsolute(stored) && fsMod.existsSync(stored)) return stored;
  // Rule 2 relative → join root.
  if (!path.isAbsolute(stored)) {
    const joined = path.resolve(root, stored);
    if (fsMod.existsSync(joined)) return joined;
  }
  // Rule 3 known-build-root anchors, longest first: strip anchor, re-resolve under current root.
  //   Anchors cover DBs built on host workspaces or container /workspace mounts.
  const anchors = ['/home/leviathan/OPENCODE_WORKSPACE/', 'OPENCODE_WORKSPACE/', '/workspace/', '/app/'];
  for (const anchor of anchors) {
    const idx = stored.lastIndexOf(anchor);
    if (idx === -1) continue;
    let suffix = stored.slice(idx + anchor.length);          // no leading slash
    const srcIdx = suffix.indexOf('src/');
    if (srcIdx > 0) suffix = suffix.slice(srcIdx);           // drop stale project prefix before src/
    const candidate = path.resolve(root, suffix);
    if (fsMod.existsSync(candidate)) return candidate;
  }
  throw new Error(`FOREIGN_PATH_UNRESOLVED: ${stored} does not exist under ${root} (no anchor match)`);
}
```

Integration point: inside `readCorbellStore` node construction (the block that currently assigns `file ?? undefined`, near `corbell-adapter.ts:508` region), wrap:
```ts
try { file = resolveNodeFile(rawFilePath, profile.project.root); }
catch (e) { console.error('[corbell-adapter] ' + (e instanceof Error ? e.message : String(e))); /* keep node, file=undefined */ }
```
Loud-log per unresolved path; node survives with `file: undefined` so predicates skip it explicitly rather than ENOENT-crashing the sweep. The sweep-health registry (existing console.error pattern in `semantic-predicates.ts`) reports blind sweeps.

Cache: memoize `(stored,root)→resolved` in a module-level Map keyed by both — 18k nodes repeat ~330 unique files.

Invariant tests (fixtures in §2.8 W-A pairs): stored bytes unchanged after run (`SELECT data FROM graph_nodes` still carries original absolute).

<!-- L2-CHUNK-2a CONSUMED -->
<!-- L2-CHUNK-2b -->
### 2.8 Enforcement test battery (11 pins) — fixes F-10

All in house fire/silent style. Exact text; builders paste verbatim.

File A: `src/subagents/trident-bug-hunter/tools/__tests__/report-writer.test.ts`

```ts
// Pair 1 — endpoint + chain shape
it('GENERATION_BASE_URL is the /zen/go/v1 slug (the opencode-go endpoint)', () => {
  expect(GENERATION_BASE_URL).toBe('https://opencode.ai/zen/go/v1');
});
it('REPORT_PROVIDER_CHAIN is single-provider — exactly one muse-spark rung, no fallback', () => {
  expect(REPORT_PROVIDER_CHAIN).toHaveLength(1);
  expect(REPORT_PROVIDER_CHAIN[0].baseUrl).toBe('https://opencode.ai/zen/go/v1');
  expect(REPORT_PROVIDER_CHAIN[0].model).toBe('muse-spark-1.2-contributor');
  expect(REPORT_PROVIDER_CHAIN[0].keyEnv).toBe('OPENCODE_API_KEY');
});

// Pair 2 — apiKey provenance (value equality, not prefix)
it('the transport Authorization header IS Bearer <options.apiKey> (provenance pin)', async () => {
  const root = tmpProject();
  const { transport, calls } = makeTransport(async () => okStream(wholeBufferReader(encodeSse([{ content: 'OK', finish_reason: 'stop' }]))));
  await generateReport(sampleInput(root), { transport, apiKey: 'tok-123' });
  expect(calls[0].init.headers['authorization']).toBe('Bearer tok-123');
});
it('without any key source the writer throws auth-stage provider unresponsive (never unauthenticated send)', async () => {
  const root = tmpProject();
  const saved = process.env.OPENCODE_API_KEY;
  delete process.env.OPENCODE_API_KEY;
  try {
    const { transport } = makeTransport(async () => okStream(wholeBufferReader(encodeSse([{ content: 'X', finish_reason: 'stop' }]))));
    await expect(generateReport(sampleInput(root), { transport })).rejects.toThrow(/provider unresponsive/);
  } finally { if (saved !== undefined) process.env.OPENCODE_API_KEY = saved; }
});

// Pair 3 — retry loop + loud isolated terminal (transport stub counts calls)
it('15 consecutive failures → GENERATION_FAILED chain-exhausted naming provider unresponsive + NO file; stub saw 15 attempts', async () => {
  const root = tmpProject();
  let n = 0;
  const { transport } = makeTransport(async () => { n++; return { ok: false, status: 500, headers: { get: () => null }, body: null, text: async () => 'boom' }; });
  await assertNamedFailure(generateReport(sampleInput(root), { transport, stallTimeoutMs: 50, overallTimeoutMs: 200 }), 'chain-exhausted');
  expect(n).toBe(15);
  expect(await reportFiles(root)).toEqual([]);
});
it('success resets the count — a later failing run again attempts 15 (not 14 accumulated)', async () => {
  // two sequential generateReport calls: first stub OK (attempt 1), second stub always-fails → second call count === 15
});

// Pair 4 — timeout constants pinned
it('stall/overall/batch budgets are the container-proven values', () => {
  expect(FETCH_STALL_MS).toBe(90000);
  expect(GENERATION_TIMEOUT_MS).toBe(300000);
  expect(BATCH_GENERATION_TIMEOUT_MS).toBe(900000);
});
```

File B: `src/subagents/trident-bug-hunter/graph/__tests__/corbell-adapter.test.ts`

```ts
// W-A-1 foreign-path resolution (fire/silent)
it('FOREIGN absolute file_path resolves through anchors to the current root (fire)', async () => {
  /* build tmp store row data={file_path:'/home/leviathan/OPENCODE_WORKSPACE/x/proj/src/foo.ts'} with real file at <root>/src/foo.ts */
  expect(result.nodes[0].file).toBe(path.join(root, 'src/foo.ts'));
});
it('unresolvable foreign path keeps stored bytes intact + node survives with undefined file + loud log (silent)', async () => {
  /* assert sqlite data column UNCHANGED after build(); node present; console.error captured FOREIGN_PATH_UNRESOLVED */
});
// W-A-2 unwired mixed-graph fire/silent
it('unwired() flags only zero-inbound code nodes in a MIXED graph (A→B edge: A dead, B wired)', () => {
  expect(dead.map(d => d.name)).toEqual(['A']);
});
// W-A-3 rescan/dedupe
it('hoisted content map yields ZERO duplicate findings across 6 predicates (dedupe observes none)', () => { /* */ });
it('nodeDiff+update apply a mutated file delta without full rebuild', () => { /* */ });
```

Total new its: 11. Every mutant named in §2.8 comments kills its pin.

### 2.9 Canon doc repairs (TOP-5) — fixes F-11, F-12

Orchestrator-executed AFTER the build waves land (docs must describe the POST-fix truth):
1. **SHA refresh:** update CURRENT_STATE.md:2, EVIDENCE_STATE.md:4/:214 chain (+ append d78c5ed3→0bf9bb2b→NEW hop), NEXT_STEPS.md:4, DEBUG_LOG.md tail, COMPACTION_SURVIVAL.md — to the post-build dist SHA from `dist/sha256.txt`.
2. **Provider narrative:** rewrite the 5 sites still describing zen→nvidia→openrouter→inferx as CURRENT (COMPACTION_SURVIVAL.md:24, EVIDENCE_STATE.md:91, NEXT_STEPS.md:30, POST-COMPACTION_PROMPT.md:232, CHANGELOG.md:27) to the single-provider law R-1..R-3 verbatim.
3. **HT-BUG ledger footer:** host-test-failure-log.md:733-737 → "23 bugs logged (HT-BUG-1..23); RESOLVED 10; OPEN 13 (list); next id HT-BUG-24".
4. **Container artifact:** re-stamp `.trident/container-test-results.json` against the NEW dist via trident-container-test action=results (never hand-written), or prepend `"historical": true` note citing the superseded buildSha.
5. **W-A correction:** NEXT_STEPS.md W-A section — strike D2 (refuted, F-8), mark D1/D3 FIXED per this spec, cite the spec path.

<!-- L2-CHUNK-2c CONSUMED --><!-- L2-CHUNK-2d CONSUMED --><!-- L2-CHUNK-2f CONSUMED -->
<!-- L2-CHUNK-2g -->
<!-- L2-CHUNK-2h -->
## §3 IMPLEMENTATION ORDER

Dependency law: writer patch (2.1-2.4) is independent of hunter fixes (2.5-2.6); both independent of probes (2.7); canon (2.9) strictly LAST describing post-fix truth. One builder per disjoint file set.

### W9 — WRITER PATCH [files: report-writer.ts + its test]
Builder B1 owns BOTH files exclusively.
Tasks: §2.1 constants → §2.2 chain+loop rewrite → §2.3 apiKey precedence (inside 2.2) → §2.4 update 5 pins → §2.8 add File-A pairs 1-4.
Gate (mechanical, ALL must pass):
```
grep -n "zen/v1" src/subagents/trident-bug-hunter/tools/report-writer.ts        → 0 hits
grep -n "muse-spark-1.2-free\|nvidia\|openrouter" …/report-writer.ts            → 0 hits
grep -c "REPORT_PROVIDER_CHAIN" …/__tests__/report-writer.test.ts               → ≥3 (pin present)
cd <root> && bash scripts/preflight.sh                                          → ≥905 pass / 0 fail
```

### W10 — HUNTER FIXES [files: corbell-adapter.ts, engine.ts, semantic-predicates.ts, their tests]
Builder B2 owns this set exclusively (zero overlap with W9).
Tasks: §2.5 resolveNodeFile + integration + cache → §2.6 hoisted map + template swaps → §2.8 File-B fixtures.
Gate:
```
grep -n "resolveNodeFile" …/graph/corbell-adapter.ts                            → ≥2 (def + call)
grep -n "buildFileContentMap" …/diagnostics/engine.ts                           → ≥2 (def + call)
grep -rn "ctx.source.read" …/diagnostics/semantic-predicates.ts                 → 0 hits in check() bodies
bash scripts/preflight.sh                                                       → floor holds
```

### W11 — PROBE RUN + 500 FIX [container; orchestrator-executed]
Tasks: deploy current tree → run P2 control → branch per §2.7 decision table → apply the NAMED fix (compat override or operator escalation) → DEBUG_LOG entry BEFORE edit → rebuild.
Gate: probe log lines pasted in wave audit; fix traces to a logged observation; muse-reachable runs emit `[chain] OK` within 15 attempts.

### W12 — LIVE VALIDATION RERUN [container]
Tasks: fresh-db hunt (NO remap — R-6) expecting findingsCount ≥96 incl anchors (`pi-shadow-agent.ts:352`, `poseidon-state.ts:191`+`trident-poseidon.ts:91`) AND sealed `bug_hunter_report_v<N>.md`; full audit expecting adjudicated output when muse up; re-stamp container artifact (§2.9 item 4).
Gate: `/app/audit-tool-output.md` exists (muse up) OR loud BLOCKED recorded with probe evidence (muse down); hunt `reportPath != null`.

### W13 — CANON REPAIR + SPEC CLOSE [orchestrator only]
Tasks: §2.9 all five repairs against POST-W12 truth; append Wave-8/9-13 entries to DEBUG_LOG + BUILD_REPORT; checkpoint.
Gate: drift-table re-run (canon-vs-disk greps) shows zero STALE rows on SHA/provider/ledger items.

<!-- L2-CHUNK-3 CONSUMED -->
## §4 TESTING STRATEGY

**Unit (deterministic, no network):**
- Transport-stub harness already proven in `report-writer.test.ts` (`makeTransport` captures url/init per call) — extend for retry-count assertion and apiKey value-equality.
- `resolveNodeFile` pure-function tests via injected fs-like module or tmp dirs — cover Rule 1 (exists fast-path), Rule 2 (relative join), Rule 3 (each anchor), throw case.
- `buildFileContentMap`: 2-file fixture asserting map size = unique files, absent entries for unreadable, loud-log emitted.

**Replay tests from REAL failures (each reconstructs an observed event):**
| Replay | Original evidence | Fixture |
|---|---|---|
| chain-exhausted hunt log | `HUNT_RESULT … error:"…no OPENCODE_API_KEY…404…chain-exhausted"` | Pair 3 (15×500 stubs → loud terminal + NO file) |
| foreign-path false-clean | findingsCount=0 then 96 post-remap | W-A-1 fire/silent |
| prefix-mutant survivor | `Bearer WRONG` passes today | Pair 2 value-equality |

**Live matrix (container, muse-dependent):**
1. Minimal-shape control (P2) → route/key/model liveness.
2. Field-flip probes (P3a/b/c) → rejected-field identification.
3. Full audit run → adjudicated report lands.
4. Full hunt on FRESH db → ≥96 findings + sealed report.
Each records passToken-in-tool-result per Warhead 8; blocked states recorded BLOCKED with reason, never passed-by-faith.

**Battery budget:** +11 unit tests (§2.8) → preflight floor rises 894→≥905; full-suite env-fail count MUST stay ≤58.

## §5 ANTI-PATTERNS AGAINST FALSE SUCCESS

1. **AP-U1 — The unauthorized-model reflex.** Any failure is NEVER solved by contacting another provider/model. Closed bypasses: adding a chain rung, env-key swap to NVIDIA/OPENROUTER keys, "temporary" openrouter test, kimi/nemotron/deepseek anywhere. R-4 verbatim governs. Violation = revert + SPEC-VIOLATION report.
2. **AP-U2 — Data surgery.** Mutating workspace.db/sqlite rows to make reads succeed. Closed bypasses: python one-liners, UPDATE statements, re-copying DBs between filesystems. Fix is code (`resolveNodeFile`) only. R-6.
3. **AP-U3 — Prefix-only assertions.** A test asserting `startsWith('Bearer ')` where value matters. Every auth/endpoint/slug pin asserts EXACT equality.
4. **AP-U4 — Green-gate theater.** Citing preflight 894/0 as proof a contract holds. Preflight counts passes; it cannot see missing pins. Proof = the specific pin exists AND passes.
5. **AP-U5 — Silent-skip sweeps.** Predicate catch-continue hiding unreadable files producing clean zeros. Post-fix, unresolved paths loud-log per file; blind sweeps surface in sweep-health output.
6. **AP-U6 — Guess-fixing the 500.** Shipping a compat/config change without the P1-P3 probe evidence naming the rejected field. One instrumented run first; DEBUG_LOG entry before any edit.
7. **AP-U7 — Invented scope.** Building anything not traced to §1 failures or operator rulings (R-7). If a builder finds adjacent brokenness: LOG it, don't fix it mid-wave.
8. **AP-U8 — Doc drift-on-landing.** Merging code fixes without same-turn canon updates (§2.9) — next session resumes on lies.

<!-- L2-CHUNK-4 CONSUMED --><!-- L2-CHUNK-5 CONSUMED -->
## §6 SUCCESS CRITERIA

S-1 `grep -rn "zen/v1" src/ --include="*.ts"` → code hits ONLY as absent; every endpoint literal is `https://opencode.ai/zen/go/v1`.
S-2 `REPORT_PROVIDER_CHAIN` length === 1; model === `muse-spark-1.2-contributor`; asserted by pin Pair 1.
S-3 `options.apiKey ?? env ?? auth.json` precedence pinned by Pair 2 value-equality test (mutant-killing).
S-4 Retry contract observable: stub-failure test counts exactly 15 attempts × 3s spacing; success resets; terminal message contains `provider unresponsive after 15 retries`.
S-5 Isolation: with generation hard-failing, `generateReport` still throws GENERATION_FAILED and writes NO file; the rest of hunt/audit flow proceeds (state=inconclusive named, never crash).
S-6 Fresh-DB hunt (zero data mutation): `findingsCount ≥ 96` including the three ledger anchor sites; stored DB bytes byte-identical pre/post run.
S-7 Hoisted map: dedupe observes zero duplicate findings on fixture graph; predicate count stays 11-card battery; engine atomic-abort contract test still green.
S-8 The 500 root cause is NAMED by probe evidence (not guessed), fixed via the mapped compat/config change, and one live Step-X round-trip emits `[chain] OK opencode-go/muse-spark-1.2-contributor attempt k events n` — OR the block is documented with probe logs and escalated to the operator (blocked-stated-as-blocked).
S-9 Preflight ≥905/0 (894 baseline + new pins); tsc 0; full-suite env fails ≤58 unchanged; dist rebuilt with sha pair consistent; container artifact re-stamped to CURRENT sha or marked historical.
S-10 Canon: zero STALE rows on the re-run drift table for SHA/provider-chain/HT-BUG-footer items; W-A section corrected (D2 struck).

## §7 COMPACTION-PROOF IMPLEMENTATION GUIDE

**Docs maintained during build:** this spec (design authority — builders read §2 sections for their wave ONLY); `.trident/wave-plan.md` (append Waves W9-W13 rows mirroring §3); DEBUG_LOG.md append-only per milestone (probe results BEFORE fixes); BUILD_REPORT closure entry at W13.

**Resume anchors:** if compacted mid-build, the next session reads THIS file's Header (rulings R-1..R-7 verbatim) + §3 (find current wave by gate state: which grep/preflight gates already pass) + the latest DEBUG_LOG tail. Never re-read the five explore returns directly — their distilled content IS §1/§2.

**Cross-consistency rules:** any constant changed in code MUST change its §2.8 pin in the same commit (AP-U3/U8). Any wave landing without its gate greps pasted is UNFINISHED (Warhead 13). The spec's §6 S-numbers are cited verbatim in wave audits.

<!-- L2-CHUNK-6 CONSUMED --><!-- L2-CHUNK-7 CONSUMED -->
## §8 FINAL NOTES / OPEN QUESTIONS

**Settled by ruling (no operator input needed):** endpoint, slug, provider id, retry contract, xhigh mandate, fallback ban, data-surgery ban, no-invention scope (R-1..R-7). D2 refuted-and-struck is a disk-truth correction, not an open question.

**Open item OQ-1 — the 500's rejected field (H1..H5):** deliberately NOT pre-fixed. The probe run (§2.7) names it mechanically; guessing would violate AP-U6 and risk inventing behavior (R-7). If P2 control ALSO 500s from our vantage while your client succeeds (H5), the evidence package (exact headers sent, status bodies, timestamps) comes to you for the network-level call — that is infrastructure outside this repo's authority.

**Open item OQ-2 — `MAX_GENERATION_TOKENS` target value:** spec sets 131072 to match the shadow catalog entry. If you intend a different writer budget (the old header claimed 384K chunked-total), name the number; the pin updates in one line.

**Non-goal register (explicitly OUT of this cleanup):** god-loop full-cycle drive; D17 live-flip corpora; __tests__ scope toggle; sentinel fleet + LOGIC-LSP; any model/provider addition. Each remains in NEXT_STEPS queue untouched.

## APPENDIX A — ZERO-TRUST AUDIT

Adversarial re-read of this spec as a fresh builder:

| # | Severity | Finding | Surgical edit applied |
|---|---|---|---|
| A1 | HIGH | §2.2 loop lacked explicit reset-on-success wording — builder could misread count semantics | Added inline comment "SUCCESS RESETS THE COUNT" + Pair-3 second test asserting re-count from 15 |
| A2 | MEDIUM | §2.5 helper signature used bare `fs` — untestable without tmpdirs | Injected `fsMod = fs` param for pure-function tests |
| A3 | MEDIUM | Probe section initially implied editing node_modules | Rewritten: probes live ONLY in pi-shadow-agent.ts + standalone fetch calls; node_modules read-only |
| A4 | LOW | Pair 3 test needed timeout seams to keep unit fast | stallTimeoutMs:50/overallTimeoutMs:200 injection noted in test body |
| A5 | LOW | §2.9 ordering ambiguous vs W13 gate | Explicitly sequenced AFTER W12 truth; drift-table rerun named as its gate |
| A6 | MEDIUM | H2 fix path could read as "downgrade to high" | Added hard line: never silently downgrade; xhigh preserved or escalated (R-3) |

Verdict: **6 findings (0 CRITICAL, 1 HIGH, 3 MEDIUM, 2 LOW) — all resolved in-place; no unresolvable gaps.** The spec is implementable as-written by two parallel builders + orchestrator-run container waves.

<!-- L2-CHUNK-8 CONSUMED --><!-- L2-CHUNK-A CONSUMED -->
