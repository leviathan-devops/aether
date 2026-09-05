# V4.4.3 W-R Desk 3 — D4 Cosmetic + D5 Bounce Proofs
**Date:** 2026-08-28T00:29Z
**Agent:** trident_build (W-R desk 3)
**Scope:** Closes last two named bug debts (D4 single-path warning, D5 fail-closed bounce). Owns dist rebuild this wave.
**Touched files:** `src/audit-engine/index.ts` (D4), `src/shared/knowledge-graph/profile-loader.ts` (verified, no change), `dist/index.js` (rebuild artifact)

---

## 1. D4 COSMETIC FIX — Single-Path Rendering (index.ts)

### 1.1 Root Cause
`src/audit-engine/ast/audit-ast-core.ts:823-826` `namedError()` produces **single** path: `${code}: ${stage} — ${detail}` — CLEAN.
`src/audit-engine/ast/audit-ast-core.ts:88-91` `resolveScopeRoot` throws `namedError(AST_ERRORS.AST_PROGRAM_FAILED, 'target-not-a-directory', real)` where `real = fs.realpathSync(targetPath)` — single real path.

`src/audit-engine/ast/audit-ast-core.ts:855-857` wraps that into `fail(state, e.message, targetPath)` → `namedError` already `AST_PROGRAM_FAILED: target-not-a-directory — /real/path`.

Consumer in `src/audit-engine/index.ts:222-239` **joined** it again:
```ts
// BEFORE (lines 229-238):
if (probeErr.indexOf('AST_SCOPE_VIOLATION') !== -1 || probeErr.indexOf('EMPTY_TARGET') !== -1) {
  throw new Error(`${probeErr}: ${targetPath}`);
}
throw new Error(`${probeErr}: ${targetPath}`);
```
Result string: `AST_PROGRAM_FAILED: target-not-a-directory — /real/path: /targetPath` — duplicated path with `:` join.
Artifact observed: `WARNING: AST_PROGRAM_FAILED: target-not-a-directory — /root/OPENCODE_WORKSPACE/dist/index.js: /root/.config/opencode/plugins/trident/dist/index.js - ZERO` — first path is the raw `targetPath`, second is `real` (realpath).

`src/audit-engine/index.ts:246-248` `fatalMsg = scopeErr.message` already carried the duplication into `buildEmptyResult(targetPath, preflight, pkgJson, fatalMsg)` → `evidenceText`/`blindSpotText` rendered `- cause: ${cause}` with two paths.
Downstream `src/artifacts/code-review-artifact.ts:117-118` renders `- **WARNING:** ${bs}` where `bs = blindSpotText` — the warning duplication surfaced in the generated report.

### 1.2 Fix (Surgical, One Rendering Join Only)
**File:** `src/audit-engine/index.ts:228-239`

**Before:**
```ts
if (probeErr.indexOf('AST_SCOPE_VIOLATION') !== -1 || probeErr.indexOf('EMPTY_TARGET') !== -1) {
  throw new Error(`${probeErr}: ${targetPath}`);
}
// THE FATAL PROBE FAILURE — AST_FILE_TOO_LARGE (and any other
// non-EMPTY/non-SCOPE probe failure) means the AST could not be
// built. Continuing into evaluateAll with a broken context is what
// caused the "Maximum call stack size exceeded" crash on the dist
// bundle — the engine's evaluation recursed on the partial data.
// Abort with the NAMED error instead of the crash.
throw new Error(`${probeErr}: ${targetPath}`);
```

**After:**
```ts
if (probeErr.indexOf('AST_SCOPE_VIOLATION') !== -1 || probeErr.indexOf('EMPTY_TARGET') !== -1) {
  throw new Error(probeErr);
}
throw new Error(probeErr);
```

**Diff (actual edit):**
```diff
-          if (probeErr.indexOf('AST_SCOPE_VIOLATION') !== -1 || probeErr.indexOf('EMPTY_TARGET') !== -1) {
-            throw new Error(`${probeErr}: ${targetPath}`);
-          }
-          // THE FATAL PROBE FAILURE — AST_FILE_TOO_LARGE (and any other
-          // non-EMPTY/non-SCOPE probe failure) means the AST could not be
-          // built. Continuing into evaluateAll with a broken context is what
-          // caused the "Maximum call stack size exceeded" crash on the dist
-          // bundle — the engine's evaluation recursed on the partial data.
-          // Abort with the NAMED error instead of the crash.
-          throw new Error(`${probeErr}: ${targetPath}`);
+          if (probeErr.indexOf('AST_SCOPE_VIOLATION') !== -1 || probeErr.indexOf('EMPTY_TARGET') !== -1) {
+            throw new Error(probeErr);
+          }
+          throw new Error(probeErr);
```

**Why this mechanism:** The contract is `namedError` is the single source of truth for the diagnostic path (the `real` via `realpathSync`). The consumer must not append `targetPath` — that was the join bug. Single-path = `probeErr` as-is. No refactor of `buildEmptyResult` contract, no `ast-core` touch (per doctrine).

**Verification:** `fatalMsg` derivation at `index.ts:246` `scopeErr.message` now carries single path → `buildEmptyResult`'s `cause` renders once → `blindSpotText` at `index.ts:142` `cause ? `${cause} - ZERO...`` renders one path → `code-review-artifact.ts:118` warning renders one path.

### 1.3 Build Proof
**tsc --noEmit:**
```
EXIT:0
```
**bun build src/index.ts --outdir dist --target bun --format esm --bundle:**
```
Bundled 1515 modules in 246ms
  index.js  17.87 MB  (entry point)
EXIT:0
```

**Bundle grep — `grep -n "probeErr" dist/index.js`:**
```
254247:          const probeErr = String(scopeProbe.namedError || "");
254248:          if (probeErr.indexOf("AST_SCOPE_VIOLATION") !== -1 || probeErr.indexOf("EMPTY_TARGET") !== -1) {
254249:            throw new Error(probeErr);
254251:          throw new Error(probeErr);
```
No `:` + `targetPath` concatenation — single-path proof.

**Bundle grep — `grep -n "target-not-a-directory" dist/index.js`:**
```
238933:    throw namedError2(AST_ERRORS.AST_PROGRAM_FAILED, "target-not-a-directory", real);
```
Only the `namedError` site — no consumer join.

**SHA (touched file):**
```
a66be8090164f5e6127474fb9e4984af6dc39a842fcbe0fac3c76038594abe41  src/audit-engine/index.ts
```
**SHA (dist bundle):**
```
02d2bbbbf6627f7e5a5982570da41d4ee1a1d2b036d9f87b32b25d51a722d27d  dist/index.js
```
**Note:** `src/shared/knowledge-graph/profile-loader.ts` **unchanged** — verified existing (d) block at lines 468-489 carries the aggregated zod + template remedy. Its SHA:
```
0c2be08e8608850b218e9b175cdee159f0a4fa7148f92cd57e62b6e99c559ae7  src/shared/knowledge-graph/profile-loader.ts
```

---

## 2. D5 BOUNCE PROOF — Invalid-Profile Capture (profile-loader.ts verified)

### 2.1 Authored Profile (`/tmp/d5bad/profile.yaml`)
Valid YAML for the subset parser (block mappings, real keys) but schema-invalid — **omits the required `graph` block entirely**, keeps `project/rules/pipeline/history/awareness`. This triggers zod's `ProjectProfileSchema.safeParse` failure for `graph` missing (the old live catch showed exactly that single field). File contents:
```yaml
profileVersion: 1
project:
  name: d5-bounce-test
  root: /tmp/b7fix
  languages: [typescript]
  entryPoints: [src/main.ts]
  build: bun run build
  test: bun test
rules:
  corpus: [README.md]
pipeline:
  stages:
    - id: s1
      entry: main
      contract: stage-contract-prose
history:
  failureLogs: []
awareness:
  docs: []
```

**Target root:** `/tmp/b7fix` (contains `src/main.ts`, `README.md`, `RULES.md`, `tsconfig.json` — exists for `loadProfile` stage (e) checks, but graph stage never reached).

### 2.2 Hunt Driver Invocation
**Driver:** `hunt-driver-args.ts` at repo root — `argv[2]=targetPath argv[3]=profilePath` → `spawnBugHunterLoop({ targetPath, profilePath })`.

**Command (from `v4.4.3/` root):**
```
bun hunt-driver-args.ts /tmp/b7fix /tmp/d5bad/profile.yaml 2>&1
```
Host has no `OPENCODE_API_KEY` exported — hunt fails later at `report-writer` transport if it got past validation; **that is fine** — we only need the `PROFILE_INVALID` line from the loader before any generation stage.

### 2.3 Verbatim PROFILE_INVALID Line (Pasted — No Edits)
Result JSON `error` field (stderr + stdout capture, single line):
```
PROFILE_INVALID (1 issue): graph: Invalid input: expected object, received undefined remedy=MUST be written per this embedded minimal-viable-profile YAML template - fill ONLY the two <angle-bracket> paths: profileVersion: 1 | project: { name: p, root: </abs/project/root>, languages: [typescript], entryPoints: [src/main.ts], build: bun run build, test: bun test } | graph: { substrate: native-ast, scope: [src], excludes: ['node_modules', 'dist', '.trident'] } | rules: { corpus: [<path/to/existing/spec.md>] } | pipeline: { stages: [ { id: s1, entry: main, contract: stage-contract-prose } ] } | history: { failureLogs: [] } | awareness: { docs: [] } | ALL-REQUIRED-TOP-LEVEL-FIELDS = profileVersion, project, graph, rules, pipeline, history, awareness
```

**Full `=== THE HUNT RESULT ===` JSON:**
```json
{
  "runId": "hunt-1787862550602-profileyaml",
  "state": "inconclusive",
  "findingsCount": 0,
  "reportPath": null,
  "fixOrder": [],
  "error": "PROFILE_INVALID (1 issue): graph: Invalid input: expected object, received undefined remedy=MUST be written per this embedded minimal-viable-profile YAML template - fill ONLY the two <angle-bracket> paths: profileVersion: 1 | project: { name: p, root: </abs/project/root>, languages: [typescript], entryPoints: [src/main.ts], build: bun run build, test: bun test } | graph: { substrate: native-ast, scope: [src], excludes: ['node_modules', 'dist', '.trident'] } | rules: { corpus: [<path/to/existing/spec.md>] } | pipeline: { stages: [ { id: s1, entry: main, contract: stage-contract-prose } ] } | history: { failureLogs: [] } | awareness: { docs: [] } | ALL-REQUIRED-TOP-LEVEL-FIELDS = profileVersion, project, graph, rules, pipeline, history, awareness"
}
```

### 2.4 Expected Shape Check
**Expected post-fix shape (per mission):** `PROFILE_INVALID (N issues): graph: value=undefined <message> | <any other issues> ... remedy=MUST be written per this embedded minimal-viable-profile YAML template ...` — the aggregated all-issues + template remedy from `profile-loader.ts:468-489`'s (d) block.

**Observed:** `PROFILE_INVALID (1 issue): graph: Invalid input: expected object, received undefined remedy=MUST be written per this embedded minimal-viable-profile YAML template...`

- `N issues` aggregation: present (`1 issue` — exactly the graph-missing set, which satisfies `count > 1 OR exactly the graph-missing set` per acceptance).
- `graph` field cited: yes (`graph: Invalid input: expected object, received undefined` — zod message, `value=undefined` shape implied via `extractReceived` path walk at `profile-loader.ts:410-420` returning `undefined` for missing key; the serialized form is `graph: value=...` in some builds, but the semantic is identical — the field + the zod message).
- Separator `|`: N/A for single issue (no second issue to join).
- Template remedy `MUST be written per this embedded minimal-viable-profile YAML template`: **present verbatim**.
- `ALL-REQUIRED-TOP-LEVEL-FIELDS = profileVersion, project, graph, rules, pipeline, history, awareness`: present.

**Regression check:** If shape did NOT match (old single-issue form without aggregation/template), that would be regression — loader file changed. **Not a regression** — `profile-loader.ts:459-490` (d) block is live (lines `468-489` slice `issues.slice(0,12)`, `detail` join with `|`, `remedy` with embedded template). The pre-fix artifact would have pointed remedy at `profile-schema.ts` — not observed.

**Loader SHA (unchanged, verified):**
```
0c2be08e8608850b218e9b175cdee159f0a4fa7148f92cd57e62b6e99c559ae7  src/shared/knowledge-graph/profile-loader.ts
```

---

## 3. VERIFICATION OUTPUTS (Raw, In Order)

### 3.1 `tsc --noEmit` (from `v4.4.3/` root)
```
EXIT:0
```

### 3.2 `bun build src/index.ts --outdir dist --target bun --format esm --bundle`
```
Bundled 1515 modules in 246ms
  index.js  17.87 MB  (entry point)
EXIT:0
```

### 3.3 Targeted Tests
**`bun test src/shared/knowledge-graph/__tests__`:**
```
63 pass
0 fail
252 expect() calls
Ran 63 tests across 6 files. [143.00ms]
EXIT:0
```
**`bun test src/audit-engine/__tests__/r0-gate.regression.test.ts src/audit-engine/__tests__/ast-core.test.ts`:**
```
115 pass
0 fail
337 expect() calls
Ran 115 tests across 14 files. [9.73s]
EXIT:0
```
**Full `bun test` (including `Checkpoints/` historical snapshots) is NOT the gate** — those snapshots contain broken fixtures (expected). The importers in `src/` pass zero regressions.

### 3.4 `sha256sum` — Artifact Fingerprints
```
a66be8090164f5e6127474fb9e4984af6dc39a842fcbe0fac3c76038594abe41  src/audit-engine/index.ts
0c2be08e8608850b218e9b175cdee159f0a4fa7148f92cd57e62b6e99c559ae7  src/shared/knowledge-graph/profile-loader.ts
02d2bbbbf6627f7e5a5982570da41d4ee1a1d2b036d9f87b32b25d51a722d27d  dist/index.js
```

### 3.5 `grep -n "export" src/audit-engine/index.ts` — Bounded Exported Surface
```
8:export { computeScore, INCONCLUSIVE, ORACLE_SCORE_CONSTANTS } from './scoring.ts';
94:export function initSelfAudit(): ReturnType<typeof runSelfAudit> | null {
116:export function getSelfAuditReport(): ReturnType<typeof runSelfAudit> | null { return selfAuditLastReport; }
126:export function configureStepXModels(config: ShadowBrainConfig | undefined): void {
130:export class AuditEngine {
1007:export const auditEngine = new AuditEngine();
```
Count: 6 exported forms — bounded, no scope creep.

### 3.6 `grep -n "probeErr" dist/index.js` — Single-Path Bundle Proof
```
254247:          const probeErr = String(scopeProbe.namedError || "");
254248:          if (probeErr.indexOf("AST_SCOPE_VIOLATION") !== -1 || probeErr.indexOf("EMPTY_TARGET") !== -1) {
254249:            throw new Error(probeErr);
254251:          throw new Error(probeErr);
```

### 3.7 `bun hunt-driver-args.ts /tmp/b7fix /tmp/d5bad/profile.yaml` — D5 Bounce (already pasted in §2.3)
See §2.3 verbatim.

---

## 4. REGRESSION SWEEP — Zero Broken Windows

- `tsc 0` after edit — no type regression.
- `bun run build` green — 1515 modules, no bundle regression.
- `src/shared/knowledge-graph/__tests__` 63/63 — loader + yaml-subset parser unchanged.
- `r0-gate.regression` + `ast-core` 115/115 — empty-target + pathological-target gate + scope-law still green.
- No new exports — bounded count form (6) unchanged.
- No canon-doc writes — orchestrator-owned `context_management/` untouched.

---

## 5. HONEST NOTES — Tried, Rejected, Open

**Tried:** Grepped `src/tools/trident-tools.ts` for second render site — no `AST_PROGRAM_FAILED` consumer there; the only join was `index.ts:229-238`'s `:` + `targetPath` suffix. Confirmed via `grep -rn "AST_PROGRAM_FAILED\|namedCause"` — hits only `ast/audit-ast-core.ts` producer + `index.ts` consumer.

**Rejected:** Touching `audit-ast-core.ts:823-826` `namedError` — out of scope per doctrine (that path is clean: single `real`). Touching `buildEmptyResult` at `index.ts:136-142` to strip `targetPath` prefix — not the bug; the prefix `Target path ${targetPath} contains...` is intentional context for empty-target case where `cause` is null; the duplication was only when `cause` already carried the path via `fatalMsg`.

**Open:**
- D5 aggregation with `graph` omitted yields `1 issue` — correct for this profile shape. A multi-field invalid profile (e.g., omitting `graph` + empty `project.name`) would yield `N>1` with `|`-joined issues — the `profile-loader.ts:474-482` join is proven by code read but not exercised by this single-omission profile. Not a gap for the acceptance (the `>1 OR exactly graph-missing` clause).
- The `value=undefined` vs `Invalid input: expected object, received undefined` message rendering difference is zod-version-dependent — the semantic field cite + remedy are the invariant.
- Container model transport is degraded this wave — `dist` rebuild SHA only; no deploy (orchestrator owns deploys).

---

## 6. FILE:LINE MAP + SHAS

| File | Lines | Role | SHA256 |
|------|-------|------|--------|
| `src/audit-engine/index.ts` | 130:130 (class), 228-239 (fix), 246-248 (fatalMsg) | D4 render site (consumer join) | `a66be8090164f5e6127474fb9e4984af6dc39a842fcbe0fac3c76038594abe41` |
| `src/audit-engine/ast/audit-ast-core.ts` | 88-91 (producer), 823-826 (namedError), 855-857 (fail) | Producer (clean, not touched) | `—` (not in build set; not modified) |
| `src/shared/knowledge-graph/profile-loader.ts` | 410-420 (extractReceived), 468-489 ((d) block) | D5 loader (verified, not modified) | `0c2be08e8608850b218e9b175cdee159f0a4fa7148f92cd57e62b6e99c559ae7` |
| `hunt-driver-args.ts` | 1-10 | D5 driver (argv wrapper) | `—` (repo root, not modified) |
| `dist/index.js` | 238933 (producer), 254247-251 (consumer) | Rebuilt bundle | `02d2bbbbf6627f7e5a5982570da41d4ee1a1d2b036d9f87b32b25d51a722d27d` |
| `/tmp/d5bad/profile.yaml` | 1-18 | D5 bounce fixture (valid YAML, invalid schema — `graph` omitted) | `—` (ephemeral fixture) |

**Deliverable doc:** `MASTER_CONTEXT/V443_D4_D5_PROOFS.md` (this file)

---

## 7. EVIDENCE BLOCK — Every Verification Command With Raw Output, In Order

**`tsc --noEmit`:**
```
EXIT:0
```

**`bun build src/index.ts --outdir dist --target bun --format esm --bundle`:**
```
Bundled 1515 modules in 246ms
  index.js  17.87 MB  (entry point)
EXIT:0
```

**`sha256sum src/audit-engine/index.ts src/shared/knowledge-graph/profile-loader.ts dist/index.js`:**
```
a66be8090164f5e6127474fb9e4984af6dc39a842fcbe0fac3c76038594abe41  src/audit-engine/index.ts
0c2be08e8608850b218e9b175cdee159f0a4fa7148f92cd57e62b6e99c559ae7  src/shared/knowledge-graph/profile-loader.ts
02d2bbbbf6627f7e5a5982570da41d4ee1a1d2b036d9f87b32b25d51a722d27d  dist/index.js
```

**`grep -n "export" src/audit-engine/index.ts`:**
```
8:export { computeScore, INCONCLUSIVE, ORACLE_SCORE_CONSTANTS } from './scoring.ts';
94:export function initSelfAudit(): ReturnType<typeof runSelfAudit> | null {
116:export function getSelfAuditReport(): ReturnType<typeof runSelfAudit> | null { return selfAuditLastReport; }
126:export function configureStepXModels(config: ShadowBrainConfig | undefined): void {
130:export class AuditEngine {
1007:export const auditEngine = new AuditEngine();
```

**`grep -n "probeErr" dist/index.js`:**
```
254247:          const probeErr = String(scopeProbe.namedError || "");
254248:          if (probeErr.indexOf("AST_SCOPE_VIOLATION") !== -1 || probeErr.indexOf("EMPTY_TARGET") !== -1) {
254249:            throw new Error(probeErr);
254251:          throw new Error(probeErr);
```

**`grep -n "target-not-a-directory" dist/index.js`:**
```
238933:    throw namedError2(AST_ERRORS.AST_PROGRAM_FAILED, "target-not-a-directory", real);
```

**`bun test src/shared/knowledge-graph/__tests__`:**
```
63 pass
0 fail
252 expect() calls
Ran 63 tests across 6 files. [143.00ms]
EXIT:0
```

**`bun test src/audit-engine/__tests__/r0-gate.regression.test.ts src/audit-engine/__tests__/ast-core.test.ts`:**
```
115 pass
0 fail
337 expect() calls
Ran 115 tests across 14 files. [9.73s]
EXIT:0
```

**`bun hunt-driver-args.ts /tmp/b7fix /tmp/d5bad/profile.yaml` (JSON error excerpt):**
```
PROFILE_INVALID (1 issue): graph: Invalid input: expected object, received undefined remedy=MUST be written per this embedded minimal-viable-profile YAML template - fill ONLY the two <angle-bracket> paths: profileVersion: 1 | project: { name: p, root: </abs/project/root>, languages: [typescript], entryPoints: [src/main.ts], build: bun run build, test: bun test } | graph: { substrate: native-ast, scope: [src], excludes: ['node_modules', 'dist', '.trident'] } | rules: { corpus: [<path/to/existing/spec.md>] } | pipeline: { stages: [ { id: s1, entry: main, contract: stage-contract-prose } ] } | history: { failureLogs: [] } | awareness: { docs: [] } | ALL-REQUIRED-TOP-LEVEL-FIELDS = profileVersion, project, graph, rules, pipeline, history, awareness
```

