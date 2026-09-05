# LEGACY RULE VERDICTS — Forensic Diagnosis of the 4,633-Finding Battery

> **Denominator (measured 2026-08-29, live run):** 4,633 findings · 458 files scanned · 431 files flagged (~94% flag rate) · ~10.1 findings/flagged-file
> **DB:** `src/.trident/knowledge-graph/shared.db` · table `findings` (`id, rule_id, severity, file, line, range_start, range_end, evidence, verdict, week, run_id, created_at`)
> **Method:** `SELECT file, line, evidence FROM findings WHERE rule_id=? ORDER BY id LIMIT 5` (deterministic by `id`; r8.todo-marker LIMIT 8) then `read` each flagged `file` at `line +/-5` then verdict per sample then ruling per rule then purge order.
> **Sampling date:** 2026-08-29 · **Analyst:** trident_build forensic desk (read-only; zero code edits)
> **Governing law:** `MASTER_CONTEXT/AETHER_CLEANUP_OVERHAUL_PLAN.md` section 4 (purge law) + `src/identity/trident/INTELLIGENT_SYSTEMS_ENGINEERING_T1.md` (ISE law: detector DETECTS, machine DECIDES; evidence triads; PatternFamily)
> **Operator doctrine (verbatim):** *"ok 4600 findings being noise is slop ... are these legacy layers theatrical? ... diagnose and explain"* / *"clean this up properly no more slop clean this up per ISE properly"*

---

## 1  SCOPE BOUNDARY — Rules OUT of This Diagnosis

The following rules are **below the >100-findings threshold** and are **pre-calibrated, container-proven true classes** (the founding lexicon). They are **keep-by-default** and are NOT diagnosed here; wave 2 MUST NOT touch them:

| Rule | Count | Class | Why it stays |
|------|------:|-------|--------------|
| `r4.empty-catch` | 60 | Empty `catch {}` / `catch` with empty block | Real defect: swallowed errors; container-proven. Detector: `src/audit-engine/layers/r4-error-handling.ts` |
| `r17.fake-return` | 50 | Function returns success without performing work | Real defect: theatrical success. Detector: `src/audit-engine/layers/r17-theatrical-integrity.ts` |
| `r13.type-unsafe-pass` | 26 | Passing `any` into a typed sink | Real defect: data-flow. Detector: `src/audit-engine/layers/r13-data-flow-analysis.ts` |
| `r1.hook-contract-violation` | 17 | Hook input shape violation | Real defect: contract. Detector: `src/audit-engine/layers/r1-hook-contract.ts` |
| `r17.always-pass` | 6 | Test that cannot fail | Real defect: theatrical test. Detector: `src/audit-engine/layers/r17-theatrical-integrity.ts` |

Also below threshold and out of scope for this doc: `PATH_RESOLUTION` (97), `CONTROL_FLOW` (61), `CONFIG_SCHEMA` (58), `OUTPUT_IS_WORK` (33), etc. They remain subject to later calibration but are not slop at 4,633 scale.

**Ceiling check:** the 8 diagnosed rules contribute **955+838+728+659+324+302+220+101 = 4,127 findings (89.1% of 4,633)**. The 4,127 number is the purge-relevant denominator. After purge, only the calibrated survivors plus the out-of-scope 506 findings should remain.

---

## 2  PER-RULE VERDICTS

Each rule section: the 5 (or 8) sampled findings with `file:line`, the DB `evidence` string, the **code quote READ at that line**, the verdict and reason. Then the rule-level **RULING** with the sampled FP rate, count contribution, detector citation, and expected delta. Selection is deterministic `ORDER BY id` — reproducible.

Sampling SQL (run verbatim for every rule):

```sql
SELECT file, line, evidence FROM findings WHERE rule_id='<RULE>' ORDER BY id LIMIT 5;
-- r8.todo-marker: LIMIT 8
```

---

### 2.1  INVOCATION_INTEGRITY — 955 findings (20.6% of battery)

**Detector:** `src/audit-engine/layers/r10-invocation-integrity.ts:354-371` — when `checker` is available and `returnStatements.length > 1`, collects `checker.typeToString(checker.getTypeAtLocation(ret.expression))` per return expression into `Set<string>` `typeStrings`; if `typeStrings.size > 1` emits `Function <name> returns inconsistent types: <types>`.

**Broken premise:** variety is not inconsistency. TypeScript union return types (`HookHandler | (() => Promise<undefined>)`, `Record<string,unknown> | {}`, `true | false` which IS `boolean`) are the type system working normally. The detector does not consult the function's declared return-type annotation; any function with two returns of different expression types is flagged, including correct `string | number` unions, `boolean` (true/false literals as distinct strings), and generic `any/unknown/undefined` wrappers whose string forms vary by inference site.

| # | DB row (file:line) | DB evidence | Code quote READ at flagged line (+/-5) | Verdict | Reason |
|---|---------------------|-------------|------------------------------------------|---------|--------|
| 1 | `src/index.ts:56` (id 2265) | `Function asHook returns inconsistent types: HookHandler, () => Promise<undefined>` | `56: function asHook(value: unknown): HookHandler {` ... `if (typeof value === 'function') return cast<HookHandler>(value);` ... `return async () => undefined;` — both returns are `HookHandler`-compatible; checker stringifies the arrow literal's inferred type distinctly | **FALSE_POSITIVE** | Union return: a type-guard helper that returns the guarded type on truth branch and fallback on else branch MUST have a union. Punishes correct narrowing. |
| 2 | `src/index.ts:63` (id 2266) | `Function asRecord returns inconsistent types: Record<string, unknown>, {}` | `63: function asRecord(value: unknown): Record<string, unknown> {` ... `if (...object...) return cast<...>(value);` ... `return {};` — `{}` assignable to `Record<string,unknown>` (empty record) but stringified distinctly | **FALSE_POSITIVE** | `{}` literal and `Record<string,unknown>` are compatible; detector compares stringified forms, not assignability. |
| 3 | `src/index.ts:90` (id 2267) | `Function <arrow> returns inconsistent types: undefined, any` | `90: hooks['tool.execute.before'] = async (...args: unknown[]): Promise<unknown> => {` ... `try { ... hookResult ... }` — async arrow with implicit `undefined` on early-return vs `any` from generic hook call | **FALSE_POSITIVE** | `any` and `undefined` are inference artifacts on same `Promise<unknown>` wrapper; not a contract violation a senior engineer would fix. |
| 4 | `src/index.ts:186` (id 2268) | `Function <arrow> returns inconsistent types: any, undefined` | `186: wrappedHooks[key] = async (...args: unknown[]) => {` ... `const hookResult = typedHook(...args); const result = hookResult instanceof Promise ? await hookResult : hookResult;` | **FALSE_POSITIVE** | Wrapper normalizing sync/async returns; `any` is hook's erased param, not a defect. |
| 5 | `src/orchestrator.ts:65` (id 2269) | `Function canTransitionTo returns inconsistent types: true, false` | `65: canTransitionTo(targetMode: string): boolean {` ... `if (!machineState) return true;` ... `if (machineState === 'ERROR' && targetMode !== 'IDLE') return false;` | **FALSE_POSITIVE** | `true` and `false` are literal types whose union IS `boolean`; function declares `boolean` and behaves correctly. Canonical slop exemplar cited in section 4. |

**Sampled FP rate:** 5/5 = **100%**

**RULING: remove**

- The detector's premise is wrong: distinct `checker.typeToString` values across returns do not imply inconsistency when the declared return type is a union/supertype that subsumes them. No semantic fix (e.g. "check assignability to declared return type") rescues this cheaply — the survivor would just be the type-checker itself, which already enforces return-type assignability at compile time. The layer is redundant with `tsc`.
- **Wave-2 action:** delete the `if (checker && returnStatements.length > 1)` block at `r10-invocation-integrity.ts:354-371` (the `typeStrings.size > 1` emission). Keep the real checks in the same file: non-void-but-no-return (line 333) and bare `return` in non-void function (line 344) — those are true classes if re-verified with low FP.
- **Expected delta:** -955 (entire rule removed). Post-purge survivors in R10: only the two structural checks (expected <30 findings on re-run).

---

### 2.2  DEPENDENCY_INTEGRITY — 838 findings (18.1%)

**Detector:** `src/audit-engine/layers/r6-dependency-integrity.ts:249-294` — two sub-detectors share the rule id:

- **(A) Checker-resolution** (line 249-269): `verifyImportResolution(node, ctx.checker)` — if `!resolution.resolved` emits `` import '<spec>' -- TypeChecker cannot resolve module symbol ``.
- **(B) Dead-import** (line 271-294): `countSymbolReferences(sourceFile, name, importLine)` — if `refCount === 0` emits `` import { <name> } from '<spec>' -- zero references outside import ``.

**Distribution check (measured):** top-10 evidence prefixes for `DEPENDENCY_INTEGRITY` are ALL `import '...' -- TypeChecker cannot resolve module symbol` — `node:path` 115, `node:fs` 110, `bun:test` 107, `path` 60, `node:os` 52, `zod` 46, `fs` 45, `typescript` 37, `os` 28, `bun:sqlite` 27. The checker-resolution sub-detector dominates (>700 of 838). The dead-import sub-detector is a minority.

**Broken premise (A):** the `Program`'s `checker` is constructed without module-resolution for `node:` builtins, `bun:` protocols, or workspace-internal `@opencode-ai/plugin` — so EVERY bare import is "unresolvable" even when present at runtime. The premise "checker cannot resolve = broken dependency" is false when the checker is misconfigured.

| # | DB row (file:line) | DB evidence | Code quote READ at flagged line | Verdict | Reason |
|---|---------------------|-------------|----------------------------------|---------|--------|
| 1 | `src/config.ts:1` (id 408) | `import 'os' -- TypeChecker cannot resolve module symbol` | `1: import * as os from 'os';` — Node.js stdlib; `os.homedir()` used at line 4; module IS installed (Node builtin) | **FALSE_POSITIVE** | Builtin `os` always available; checker lacks `node` lib resolution. Nothing to fix. |
| 2 | `src/config.ts:2` (id 409) | `import 'path' -- TypeChecker cannot resolve module symbol` | `2: import * as path from 'path';` — used at line 4 `path.join(...)` | **FALSE_POSITIVE** | Same — builtin `path`. |
| 3 | `src/index.ts:1` (id 410) | `import '@opencode-ai/plugin' -- TypeChecker cannot resolve module symbol` | `1: import type { PluginInput, Hooks } from '@opencode-ai/plugin';` — workspace dep, `package.json` dependency; types ARE resolvable with proper `tsconfig` | **FALSE_POSITIVE** | Workspace package present; checker not wired to `node_modules` resolution. |
| 4 | `src/index.ts:2` (id 411) | `import 'node:fs' -- TypeChecker cannot resolve module symbol` | `2: import { appendFileSync } from 'node:fs';` — builtin with `node:` prefix; Node 18+ standard | **FALSE_POSITIVE** | `node:fs` is the explicit builtin prefix; resolver treats `node:` as unknown. |
| 5 | `src/index.ts:14` (id 412) | `import { poseidonState } from './poseidon/poseidon-state.js' -- zero references outside import` | `14: import { poseidonState } from './poseidon/poseidon-state.js';` — `grep -c poseidonState src/index.ts` returns **1 occurrence (the import itself)**, zero uses | **TRUE_POSITIVE** | Dead import — symbol imported but never read. Valid hygiene finding (LOW severity; may be intentional re-export wiring but as-imported here it IS unused). |

**Sampled FP rate:** 4/5 = **80%** (sub-detector A: 100% FP in sample; sub-detector B: 1/1 TP but minority population)

**RULING: fix-semantics (split)**

- Sub-detector (A) — **remove**: delete the `verifyImportResolution` emission block at `r6-dependency-integrity.ts:249-269`. The `checker` as constructed cannot resolve stdlib / `bun:` / workspace paths; its negative is slop, not signal. If a real "unresolvable import" check is desired, it must be a `tsconfig`-accurate program with `moduleResolution: bundler` + `paths` wiring and an explicit allowlist for `node:`/`bun:` builtins — not the current graph-audit program.
- Sub-detector (B) — **keep as-is** (already calibrated): `countSymbolReferences` dead-import detection is a true class, LOW severity, word-length guard (`name.length < 2` skip) at line 280. Wave 2 MUST re-measure its post-purge count in isolation (expected <60 findings, comparable to `r4.empty-catch` scale).
- **Wave-2 action:** (1) delete lines 249-269 (checker-resolution), (2) re-run, (3) measure B's count; if B still >100, scope it (exclude type-only imports via `import type` check) and exclude fixture paths.
- **Expected delta:** -700 to -750 (remove checker-resolution); retain ~80-110 dead-import findings.

---

### 2.3  TYPE_CERTAINTY — 728 findings (15.7%)

**Detector:** `src/audit-engine/layers/r16-bible-enforcement.ts:792-836` function `auditTypeCertainty` — walks `AsExpression` nodes; for each `as <Type>` where `<Type>` not in `KEYWORD_TYPES`/`SAFE_CAST_TYPES`, dedup by line, then calls `hasPrecedingRuntimeGuard(child)` (walks preceding siblings for `typeof`/`instanceof`/`in` checks) — if no guard found, emits `` as <Type> without preceding runtime type check ``.

**Distribution check:** top evidence prefixes are `as number` 37, `as string` 22, `as string[]` 18, `as AgentTool` 16, etc. — i.e., common narrowing casts across the codebase.

| # | DB row (file:line) | DB evidence | Code quote READ at flagged line | Verdict | Reason |
|---|---------------------|-------------|----------------------------------|---------|--------|
| 1 | `src/utils.ts:26` (id 3434) | `as new () => EvidenceStoreHandle without preceding runtime type check` | `24: const mod = raw !== undefined && raw !== null && typeof raw === 'object' && 'EvidenceStore' in raw` then `25: ? raw as { EvidenceStore: ... }` / `26: : { EvidenceStore: fallbackStore.constructor as new () => ... }` — preceding guard at line 24 IS the runtime check | **FALSE_POSITIVE** | Guard exists (`typeof raw === 'object' && 'EvidenceStore' in raw`) but `hasPrecedingRuntimeGuard` only checks the immediate `AsExpression` parent's preceding siblings, not a ternary condition two lines above. Guarded by `CAST_UTILITY_NAMES` only at enclosing-function level, not this pattern. |
| 2 | `src/utils.ts:25` (id 3435) | `as { EvidenceStore: new () => EvidenceStoreHandle } without preceding runtime type check` | Same site — the truthy branch of the same ternary; guard is identical (line 24) | **FALSE_POSITIVE** | Same mechanism — ternary-guarded cast missed. |
| 3 | `src/audit-engine/graph-backed-audit.ts:58` (id 3436) | `as CallGraph['entries'] without preceding runtime type check` | `52: const entries = new Map<string, {...callSites: never[] }>();` ... `58: entries: entries as unknown as CallGraph['entries'],` — construction-time narrowing of locally-built `Map` to the domain type | **FALSE_POSITIVE** | Locally-constructed value with known shape; construction cast `as unknown as T` is the idiomatic "I built this correctly" assertion, not an unchecked external input. |
| 4 | `src/audit-engine/graph-backed-audit.ts:55` (id 3437) | `as never[] without preceding runtime type check` | `55: callSites: e.callSites as never[]` — `e.callSites` is from `snap.entries` typed as `unknown[]`-ish snapshot; cast to `never[]` as placeholder for wiring | **FALSE_POSITIVE** | Snapshot adapter bridging `unknown` snapshot to typed graph; `never[]` is a placeholder validated by the subsequent `callGraph` assignment at line 58's second cast. Two-cast construction bridge; no external input. |
| 5 | `src/audit-engine/graph-backed-audit.ts:217` (id 3439) | `as { block: { statements: unknown[] } } without preceding runtime type check` | `217: if (... (c.node as unknown as { block: { statements: unknown[] } }).block && ...block.statements.length...)` — guarded by `if (c.type === 'TRY_STATEMENT' || ...)` and null checks on `c.node`, `block` | **FALSE_POSITIVE** | Structural narrowing already present (type tag check + null guard); `as unknown as` is the narrowing step after the check. Detector looks for `typeof`/`instanceof` but the guard here is a discriminant (`c.type`) and null guards, which it does not recognize. |

**Sampled FP rate:** 5/5 = **100%** — caveat: the true class EXISTS (unchecked `as` from external input IS a defect). The sampled FPs are all construction/discriminant patterns where the guard IS present but in a form the detector does not recognize, or where the cast is construction-bridging known-local values.

**RULING: fix-semantics**

- The defect class `as T from unvalidated input -> runtime TypeError` is REAL (ISE lexicon: a detector for this class SHOULD exist). The current detector's `hasPrecedingRuntimeGuard` is too narrow: it recognizes only adjacent `typeof`/`instanceof`/`in` on the same expression, missing (a) ternary/branch guards two statements above, (b) discriminant tag checks (`c.type === 'TRY_STATEMENT'`), and (c) locally-constructed value bridges where the "guard" is the construction itself.
- **Semantic fix (prescribed for wave 2, file `r16-bible-enforcement.ts:792-836`):**
  1. Extend `hasPrecedingRuntimeGuard` to recognize: discriminant checks on a sibling/tag field (`x.type === 'KIND'`), ternaries whose condition guards the truthy branch, and `Array.isArray`/`!= null` null guards.
  2. Exclude `as unknown as T` double-cast construction bridges where the source is a locally-constructed literal (`new Map`, `[]`, object literal) — the value's shape IS the evidence.
  3. Keep the `CAST_UTILITY_NAMES` allowlist (already at line 800: `if (CAST_UTILITY_NAMES.has(funcName)) return`) — add the adapter/constructor helpers (`buildCallGraph`, adapter constructors) explicitly.
  4. Scope to non-fixture paths — exclude `__tests__/fixtures/` (fixture code intentionally uses `as`).
- **Expected delta:** -500 to -600 (construction/discriminant FPs drop). Survivor count estimated 120-200 (real unchecked-input casts in plugin boundary code).

---

### 2.4  RUNTIME_CONTRACT — 659 findings (14.2%)

**Detector:** `src/audit-engine/layers/r9-runtime-contract.ts:180-360` — three targets share the rule id:

- **T1** (line 188): `as any` — explicit silencing.
- **T2** (line 207): `as ConcreteType` where source expression has type `any` (`isAnyType(child.expression, checker)`) — cast from `any`.
- **T3** (line 245/297): implicit `any` — function params without explicit type annotation where checker infers `any` (`paramTypeNode ? paramTypeNode.getText : '(implicit any)'`).

**Distribution check:** `'(no return type annotation -- inferred any)'` 44, various `(implicit any)` param sites ~60, plus `as unknown` / `as never` / `catch (e)` patterns. The implicit-any bucket is large; many sites are callbacks whose param types are inferred from `any`-typed containers.

| # | DB row (file:line) | DB evidence | Code quote READ at flagged line | Verdict | Reason |
|---|---------------------|-------------|----------------------------------|---------|--------|
| 1 | `src/artifacts/context-synthesis-artifact.ts:1743` (id 1606) | `fact as { text?: string }` | `1743: const text = typeof fact === 'string' ? fact : (fact as KnowledgeFact).title || (fact as { fact?: string }).fact || (fact as { text?: string }).text || String(fact);` — union-typed `fact: string | KnowledgeFact` in a formatter; defensive chain reading optional fields from variant shapes | **FALSE_POSITIVE** | Heuristic field extraction from a document union — each `as` reads a known variant; template generator handles shape variance by design. Guard IS the `typeof fact === 'string'` plus fallback chain. |
| 2 | `src/artifacts/context-synthesis-artifact.ts:1837` (id 1607) | `pre: (implicit any)` | `1837: (match, pre, name, body, post) => {` — callback of `String.prototype.replace(/.../g, (match,pre,name,body,post)=>` . `replace` callback params are typed `string` by lib; checker reports implicit any because `noImplicitAny` inference is off or `lib` not fully wired | **FALSE_POSITIVE** | `String.replace` callback params ARE typed `string` by the stdlib signature; the "implicit any" is a checker artifact, not a missing annotation the engineer should add. |
| 3 | `src/artifacts/deep-planning-artifact.ts:270` (id 1608) | `a: (implicit any)` | `270: const sortedThreats = [...threats].sort((a, b) => {` — `threats` typed `any[]` at line 265 (`const defenseList: any[] = ...`); `sort` callback element type is inferred from container element type which IS `any` | **FALSE_POSITIVE** | Implicit any is INHERITED from the container's `any` — the defect is the upstream `any[]` at line 265, not the per-element param. Flagging the callback double-counts. |
| 4 | `src/artifacts/deep-planning-artifact.ts:1495` (id 1609) | `propertyNode as ts.Declaration` | `1495: isReadonly: (ts.getCombinedModifierFlags(propertyNode as ts.Declaration) & ...) !== 0,` — `propertyNode` IS a `ts.PropertyDeclaration` (subtype of `Declaration`); cast narrows to the API's required param | **FALSE_POSITIVE** | Subtype-to-supertype API narrowing; `propertyNode` is already a `PropertyDeclaration` — the cast satisfies `getCombinedModifierFlags`'s `Declaration` param, a type-system bridging pattern. No runtime risk. |
| 5 | `src/artifacts/deep-planning-artifact.ts:1812` (id 1610) | `member as unknown` | `1812: m.bodyAnalysis = analyzeMethodBody(member as unknown as ts.FunctionLikeDeclaration, sourceFile);` — `member` is `ts.ClassElement`; narrowing to `FunctionLikeDeclaration` after `ts.isMethodDeclaration(member)` check at line 1810 | **FALSE_POSITIVE** | Post-guard narrowing double-cast — guard at line 1810 IS the runtime check (`isMethodDeclaration`), the cast is the narrowing step. Same pattern as TYPE_CERTAINTY FPs. |

**Sampled FP rate:** 5/5 = **100%**

**RULING: fix-semantics**

- The true classes exist: `as any` silencing in production logic (T1) and unchecked `any`-sourced casts on plugin input boundaries (T2) ARE defects. The sampled FPs are (a) artifact/template generators that handle polymorphic shapes via defensive `as` chains, (b) stdlib callback params typed by lib signature, (c) inherited-any from upstream `any[]` containers, and (d) post-guard narrowing casts after discriminant checks.
- **Semantic fix (file `r9-runtime-contract.ts:180-360`):**
  1. T1 (`as any`): keep as-is — this is the true signal. Wave 2 must measure T1 alone (estimated <40 findings).
  2. T2 (cast from `any`): exclude when guard (`typeof`/`in`/`Array.isArray`) exists on the source symbol within the same block, and exclude artifact paths (`src/artifacts/**`, `**/artifact*.ts`) where `any`-from-JSON is architectural.
  3. T3 (implicit any): suppress when param type is inherited from an `any`-typed container, and when the callback's signature IS typed by a lib declaration (`String.replace`, `Array.sort` on `any[]`). Only flag genuinely untyped function params in `src/` non-artifact, non-test code (expected <30).
- **Expected delta:** -450 to -550. Survivor ~100-160 (real `as any` + unchecked input casts at plugin boundaries).

---

### 2.5  ASYNC_CORRECTNESS — 324 findings (7.0%)

**Detector:** `src/audit-engine/layers/r3-async-correctness.ts:155-250` — for each `CodeConstruct` with a function `node`, checks `functionBodyHasTryStatement(node)`; if `!hasTry` and any `AwaitExpression` exists (excluding `await` inside nested function-likes), emits at the first await's line: `` Async function '<name>' contains await expressions but has no try/catch -- rejected promises will be unhandled ``.

**Distribution check:** evidence values are distinct `await <expr>` texts (`await runRuntimeScenario(s)` 11, `await pipeline.execute(...)` 9, etc.) — each finding is the first `await` in a function that lacks a `try` block anywhere in its body.

| # | DB row (file:line) | DB evidence | Code quote READ at flagged line | Verdict | Reason |
|---|---------------------|-------------|----------------------------------|---------|--------|
| 1 | `src/audit-engine/layer-engine.ts:55` (id 19) | `await this.evaluateLayer(layer, ctx, evidence)` | `52: for (const layer of this.layers) {` `55: const layerFindings = await this.evaluateLayer(layer, ctx, evidence);` — enclosing `async audit()` at line 30 has NO `try` in its body; rejection propagates via `await` to the caller's `catch` (or the graph-backed audit's outer try at `graph-backed-audit.ts:69`) | **FALSE_POSITIVE** | No-try is not unhandled: the engine's caller (`graph-backed-audit.ts:69` and `index.ts` tool handlers) DOES catch. Detector judges one function in isolation, ignoring propagation to the caller's error boundary. Correct async composition — fail-loud, let caller decide. |
| 2 | `src/audit-engine/__tests__/a-doubling.fixture.test.ts:110` (id 20) | `await Promise.all( Array.from({ length: 20 }, () => Promise.resolve(emitWithDedupe([a, b]).length)), )` | `110: const results = await Promise.all(...Promise.resolve(...)...)` — `Promise.all` of `Promise.resolve` literals; cannot reject (all resolved) | **FALSE_POSITIVE** | Test helper `emitWithDedupe` is sync; wrapping in `Promise.resolve` is deterministic-test plumbing. Awaited promise CANNOT reject; try/catch would be dead code. Plus test files should be excluded. |
| 3 | `src/audit-engine/__tests__/aether-brain.test.ts:112` (id 21) | `await expectRejects(() => brain.compose(...), /AETHER_COMPOSE_FAILED/)` | `112: await expectRejects(() => brain.compose({ groundTruth: GT([]), findings: [] }), /AETHER_COMPOSE_FAILED/)` — `expectRejects` IS the error assertion (test expects a throw and asserts it) | **FALSE_POSITIVE** | `await expectRejects(...)` IS the `try/catch` equivalent — the helper catches and asserts the rejection. Flagging it as "no try/catch" inverts correctness. |
| 4 | `src/audit-engine/__tests__/aether-brain.test.ts:117` (id 22) | `await expectRejects(() => brain.compose({ groundTruth: GT([]), findings: [F({})] }), ...)` | Same pattern, different payload | **FALSE_POSITIVE** | Same inversion — error-path test. |
| 5 | `src/audit-engine/__tests__/aether-brain.test.ts:134` (id 23) | `await brain.compose(brief)` | `134: await brain.compose(brief)` — inside `it('the brain DRIVES the bounded batches...', async () => {` — test body; no try in the `it` callback | **FALSE_POSITIVE** | `it(..., async () => { await ...; expect(...); })` — the test framework IS the error boundary (unhandled rejection = test failure). Adding try/catch would SUPPRESS the test failure. |

**Sampled FP rate:** 5/5 = **100%**

**RULING: fix-semantics**

- The true class exists: an `async` function that `await`s fallible I/O with no error boundary anywhere in the chain IS a defect (unhandled rejection breaks on Node 15+). The sampled FPs fail two exclusions the current detector lacks: (a) propagation — the caller HAS a boundary (the engine's outer catch); (b) test harness — `__tests__` files and `expectRejects`/`expect` assertions are boundaries, and `Promise.resolve` literals cannot reject.
- **Semantic fix (file `r3-async-correctness.ts:155-250`):**
  1. Exclude `**/__tests__/**` and `**/fixtures/**` entirely (test files are not deployed).
  2. Exclude `await` of non-rejectable promises (`Promise.resolve`, `Promise.all` of resolves) — triage only `await` of call-graph-known fallible callees or `await` inside loops without propagation.
  3. Recognize `expectRejects`/`expect(...).rejects` as error boundaries (treat as try-equivalent).
  4. Optionally, scope to `src/` non-artifact files (artifact generators' async is build-time, not runtime).
  This preserves the minority of real cases: `await` of network/fs calls in plugin primary paths with no boundary anywhere.
- **Expected delta:** -250 to -280. Survivor ~40-70 (real unhandled awaits in plugin/poseidon/ship paths).

---

### 2.6  r8.todo-marker — 302 findings (6.5%)

**Detector (current code):** `src/audit-engine/layers/r8-source-hygiene.ts:74-144` — `collectCommentRanges` gathers leading/trailing `ts.getLeadingCommentRanges` / `ts.getTrailingCommentRanges` per AST node; per comment, `commentHasMarker` checks for `R8_TODO_MARKERS` (`TODO`, `FIXME`, `HACK` ...) with word-boundary checks (`/[a-z]/i` before/after), `commentIsClosed` suppresses when a `R8_CLOSURE_TERMS` term (`DONE`, `WONTFIX`, `CLOSED` ...) is present, dedup by `file:line:marker`.

**Stale-run artifact:** the DB evidence for `r8.todo-marker` (all 302 rows) does NOT match this detector's emission surface: the current detector emits `evidence: stripped.slice(0, 120)` (comment text), but DB `evidence` values are CODE slices (`TRIDENT_AGENTS = [`, `` instructions: `STOP... ``, `export function generateT2Knowledge(...`, `threatLooksLike = (p: string)=> ...`). The flagged `line` values (definitions.ts:2, 2, 3, 7, etc.) are enclosing-construct start lines, not comment lines. The DB rows were emitted by an **older raw-slice detector** that matched `todo` case-insensitively inside string/template-literal content and attributed to the enclosing construct.

**Read verification:** `grep -in "todo"` on the flagged files shows the matched token lives deep inside template-literal strings, not comments:

- `src/agents/definitions.ts` lines 53,61: `todowrite` inside the `` instructions: `...` `` template literal's blocked-tools list (`edit, write, bash, ... todowrite, spawn_* -> BLOCKED`). The flagged lines 2,3,7 are the construct boundaries; the token is ~46 lines away.
- `src/artifacts/context-synthesis-artifact.ts` line 664: `'// TODO: implement\n'` inside the `threatLooksLike` template-string return value — documentation-content-as-data (the T2 template teaches what a theatrical TODO looks like). Flagged lines 346/641/642 are the enclosing function/switch.

String-content matching + enclosing-construct line attribution — both wrong. A senior engineer would not fix a TODO inside a teaching example or a documentation string listing blocked tools.

| # | DB row (file:line) | DB evidence | Code quote READ at flagged line | Verdict | Reason |
|---|---------------------|-------------|----------------------------------|---------|--------|
| 1 | `src/agents/definitions.ts:2` (id 1304) | `TRIDENT_AGENTS = [  {    id: 'trident', ...` | `2: export const TRIDENT_AGENTS = [` — no TODO marker on this line; matched `todowrite` is at line 53 inside `instructions` template literal | **FALSE_POSITIVE** | String content "todowrite" in documentation prose, not a comment TODO. Wrong scope + wrong line attribution. |
| 2 | `src/agents/definitions.ts:2` (id 1305) | `[  {    id: 'trident', ...` | Same line 2, different construct slice (array literal) | **FALSE_POSITIVE** | Same token via overlapping constructs — double-count. |
| 3 | `src/agents/definitions.ts:3` (id 1306) | `{    id: 'trident', ...` | `3:   {` — object literal inside the array; same `todowrite` token | **FALSE_POSITIVE** | Triple-count of one token. |
| 4 | `src/agents/definitions.ts:7` (id 1307) | `` instructions: `STOP. READ THIS. THIS IS WHO YOU ARE... `` | `7:     instructions: ` + "STOP. READ THIS..." — start of the template literal CONTAINING the token at line 53 | **FALSE_POSITIVE** | Enclosing-literal attribution. |
| 5 | `src/artifacts/context-synthesis-artifact.ts:346` (id 1308) | `export function generateT2Knowledge(  projectName: string,...` | `346: export function generateT2Knowledge(` — function signature; the `// TODO: implement` is deep inside `threatLooksLike` at line 664 | **FALSE_POSITIVE** | Function-signature line flagged for a token deep in a nested function's template return. |
| 6 | `src/artifacts/context-synthesis-artifact.ts:641` (id 1309) | `threatLooksLike = (p: string): string => {    switch (p) {      case 'THEATRICAL_IMPLEMENTATION':        return '...` | `641:   const threatLooksLike = (p: string): string => {` — enclosing arrow; token at line 664 inside return value | **FALSE_POSITIVE** | Teaching-example content — T2 template intentionally contains `// TODO: implement` to show what bad code looks like. Doc-content-as-data, not unresolved work. |
| 7 | `src/artifacts/context-synthesis-artifact.ts:641` (id 1310) | `(p: string): string => {    switch (p) {      case 'THEATRICAL_IMPLEMENTATION':        return '...` | Same line 641, variant slice | **FALSE_POSITIVE** | Same token, duplicate construct window. |
| 8 | `src/artifacts/context-synthesis-artifact.ts:642` (id 1311) | `switch (p) {      case 'THEATRICAL_IMPLEMENTATION':        return '...` | `642:     switch (p) {` — switch inside `threatLooksLike` | **FALSE_POSITIVE** | Same token, third construct window. |

Additionally, per-r8 distribution (measured): top evidence prefixes are `matcherId: 'r8.todo-marker'` 4, `{ matcherId: 'r8.todo-marker' }` 2, etc. — code that REFERENCES the rule id `r8.todo-marker` as a string/config key (matcher configs, calibration fixtures, sig helpers). These are `"r8.todo-marker"` STRING LITERALS containing the substring `todo` — again string-content matching, not comment markers.

**Sampled FP rate:** 8/8 = **100%**

**RULING: fix-semantics (already implemented on disk; purge stale rows)**

- The defect class "unresolved TODO/FIXME/HACK comment in production code" is REAL. The **current** detector (`r8-source-hygiene.ts:38-144`) already implements the correct semantics: comment-scoped (`collectCommentRanges` via `getLeadingCommentRanges`/`getTrailingCommentRanges`), word-boundary (`before`/`after` checks at 48-50), closure-term suppression (`commentIsClosed` at 57-63), dedup by `file:line:marker` (121). On a fresh run the finding set SHOULD be scoped to comment nodes and correctly lined.
- The 302 rows in `shared.db` are stale — emitted by the prior raw-slice/string-content detector. They MUST NOT drive a "remove the class" decision; the class is real.
- **Wave-2 action:** (1) purge the 302 `r8.todo-marker` rows from `shared.db` (or mark `verdict='SUPERSEDED_RAW_SLICE'` if a hard delete is undesirable), (2) re-run the audit, (3) measure the FRESH `r8.todo-marker` count (expected <30, consistent with comment hygiene on 458 files; comparable to `r4.empty-catch` scale), (4) inspect any surviving findings manually — if any survivor still matches string-literal content (not a comment), fix `collectCommentRanges`'s walk to exclude `TemplateLiteral`/`StringLiteral` nodes entirely.
- **Expected delta:** -300 to -302 on DB purge; fresh count expected 5-30 (true comment TODOs, if any).

---

### 2.7  OUTPUT_CONTRACT — 220 findings (4.7%)

**Detectors (shared id `OUTPUT_CONTRACT`, two emissions in `r16-bible-enforcement.ts`):**

- **(A) Catch-exit** `auditCatchExit` (~line 880-966): for each `catch` clause in a function that declares a non-void return type, if the catch has no `return`/`throw` and no post-try `return`, emits `` catch(<var>) has no exit but function declares type '<T>' -- yields undefined implicitly `` at the catch line.
- **(B) Missing-evidence** `auditMissingEvidenceAst` (~line 968-1017): for each `return { outputProp }` where the returned object has an `output`-shaped property (`output`, `passed`, `ok`, `valid` ...) but no `evidence` prop, emits `` Return has <props> but no evidence property -- output signal without proof `` at the return line.

**Distribution:** `return { passed: true };` 15, various `return { ok: false, code: 'TYPE_MISMATCH' ...}` ~17, `return { ok: false };` 5, etc. — mostly (B) returns; (A) is rarer (`catch (e) { void ...` 16, etc.).

| # | DB row (file:line) | DB evidence | Code quote READ at flagged line | Verdict | Reason |
|---|---------------------|-------------|----------------------------------|---------|--------|
| 1 | `src/audit-engine/graph-backed-audit.ts:69` (id 3438) | `catch (e: unknown) {      console.error('[GraphBacked...` | `69:     } catch (e: unknown) {` `70:       console.error('[GraphBackedAuditClass] constructor failed:', ...);` `71:       this.graphSnapshot = ...;` etc. — the `GraphBackedAuditClass` constructor; constructors NEVER declare a return type; catch assigns fallback state and returns normally from constructor | **FALSE_POSITIVE** | Constructor catch — no declared return type to violate. Detector assumes every catch is in a typed function; constructors are not. Catch DOES exit correctly (assigns fallback). |
| 2 | `src/audit-engine/__tests__/runtime-verification.test.ts:143` (id 3576) | `return { ok: true, detail: 'ok' };` | `143:     s.action = async () => { actionRan = true; return { ok: true, detail: 'ok' }; };` — test harness `spec().action` mock whose `ok` IS the test signal; spec is an in-test fixture object, not a production output contract | **FALSE_POSITIVE** | Test harness fixture `s.action` is not a production `OUTPUT_CONTRACT` site; `__tests__` fixtures should be excluded. Also `ok` here is not the audit `output` contract — minimal harness. |
| 3 | `src/audit-engine/__tests__/fixtures/r4-r11-r17/r11-golden-validated.ts:2` (id 3585) | `return { ok: false };` | `1: export function checkAccessValidated(user: string) {` `2:   if (!validateUser(user)) return { ok: false };` — this fixture file is the **intentional passing example** for R11; `{ ok: false }` IS the valid early-exit (negative case). Has no evidence because it is the NEGATIVE path. | **FALSE_POSITIVE** | Golden fixture — intentionally validates. `ok: false` on early-exit needs no proof of work; rule "return with `ok` but no `evidence`" misfires on negatives and on fixtures that ARE the ground truth. |
| 4 | `src/audit-engine/__tests__/fixtures/r4-r11-r17/r11-golden-validated.ts:4` (id 3586) | `return { ok: false };` | `4:   if (!exists) return { ok: false };` — same fixture, second early-exit | **FALSE_POSITIVE** | Same — `ok: false` needs no evidence. |
| 5 | `src/audit-engine/__tests__/fixtures/r4-r11-r17/r11-golden-validated.ts:5` (id 3587) | `return { ok: true };` | `5:   return { ok: true };` — the POSITIVE return; fixture's purpose is to demonstrate that a `check-then-query-then-ok` flow IS evidence enough (two preceding checks ARE the evidence). But `auditMissingEvidenceAst` flags any `return { ok: true }` lacking an `evidence` FIELD in the same object literal | **FALSE_POSITIVE** | Detector conflates "no `evidence` FIELD" with "no evidence". Fixture's two `if`-guarded returns ARE the evidence-of-work — structural evidence. A narrow "field named evidence" check is too literal. Plus fixture should be excluded. |

**Sampled FP rate:** 5/5 = **100%** — composition: 1x constructor FP (scope error), 1x test-harness FP, 3x `ok: false` fixture FPs + literal evidence-field confusion.

**RULING: fix-semantics**

- The true class exists: **(A)** a typed function whose `catch` silently yields `undefined` IS a real contract violation (caller gets `TypeError`); **(B)** a production `return { ok: true }` with no evidence of work done IS a theatrical-success signal. Both deserve detectors — but the current ones have scope + semantic gaps.
- **Semantic fixes (file `r16-bible-enforcement.ts:880-1017`):**
  1. (A) `auditCatchExit`: exclude constructors, exclude `void`-returning / `void`-typed functions, exclude `catch` that assigns to `this` or re-assigns fallback state. Only flag when enclosing function's declared return type IS non-void and catch has NO exit.
  2. (B) `auditMissingEvidenceAst`: (a) exclude `**/__tests__/**` and `**/fixtures/**` entirely, (b) exclude `return { ok: false }` (negative/early-exit) — only flag `ok: true`/`passed: true`/`valid: true`, (c) recognize structural evidence (return dominated by 1+ `if`-guard that queries state — that IS evidence-of-work; the evidence field check alone is insufficient).
- **Expected delta:** -150 to -190. Survivor ~30-70 (real `catch` without exit in typed production functions + real theatrical `ok:true` returns).

---

### 2.8  CONTAINER_PREFLIGHT — 101 findings (2.2%)

**Detector:** `src/audit-engine/layers/r15-container-preflight.ts:30-200` — AST-walk per construct for four sub-signals sharing the id:

- Hardcoded absolute paths (`/tmp/`, `/var/`, `/home/`, `/etc/` string literals not inside `import`/`require`), line 104-115.
- Path concatenation (`string +` where one side is a hardcoded path literal), line 121-139.
- `require()` without `try/catch`, line 141-159.
- `process.env.*` without `??` default or `if` guard, line 60-80; and `process.env.*` mutation, line 170-185.

**Distribution:** `process.env.OPENCODE_API_KEY without ??` 11, `/tmp/t` 10, `/tmp/f.ts` 7, env mutations 5, etc. Top signals indicate the detector fires on plugin runtime code (`OPENCODE_API_KEY`) and on test fixtures (`/tmp`).

| # | DB row (file:line) | DB evidence | Code quote READ at flagged line | Verdict | Reason |
|---|---------------------|-------------|----------------------------------|---------|--------|
| 1 | `src/audit-engine/__tests__/aether-brief.test.ts:78` (id 3326) | `Hardcoded path: "/etc/passwd"` | `78:     const absOutside = await readWindowWithinScope(target, '/etc/passwd', 1, 80);` — test calls `readWindowWithinScope` with `/etc/passwd` AS ADVERSARIAL INPUT to prove the scope law blocks it | **FALSE_POSITIVE** | Adversarial test input — path IS meant to be rejected; detector treats attack-vector literals as container bugs, inverting the test's purpose. Test files must be excluded. |
| 2 | `src/audit-engine/__tests__/audit-3d.test.ts:181` (id 3327) | `Path concatenation: '/tmp/trident-3d-empty-' + Date.now()` | `181:       const emptyResult = await engine.audit('/tmp/trident-3d-empty-' + Date.now());` — test probes the engine's empty-dir behavior | **FALSE_POSITIVE** | Test helper constructing disposable temp path; `+ Date.now()` IS the isolation mechanism. `__tests__` + disposable construction should be excluded. |
| 3 | `src/audit-engine/__tests__/audit-3d.test.ts:181` (id 3328) | `Hardcoded path: "/tmp/trident-3d-empty-"` | Same line 181, second sub-signal (literal) on same expression | **FALSE_POSITIVE** | Same site, dual-emitted (concatenation + literal) — double counts one line. |
| 4 | `src/audit-engine/__tests__/graph.test.ts:67` (id 3329) | `Hardcoded path: "/tmp/f.ts"` | `67:       expect(() => graph.appendFinding(mkFinding('r4.empty-catch', '/tmp/f.ts', 1, ''), 'run-1'))` — test fixture path `'/tmp/f.ts'` as dummy finding location | **FALSE_POSITIVE** | Dummy fixture path in a unit test; zero container runtime impact. |
| 5 | `src/audit-engine/__tests__/graph.test.ts:75` (id 3330) | `Hardcoded path: "/tmp/f.ts"` | `75:       expect(() => graph.appendFinding(mkFinding('r4.empty-catch', '/tmp/f.ts', 1, 'catch {} swallows'), 'run-1')).not.toThrow();` — same dummy path, second case | **FALSE_POSITIVE** | Same dummy path. |

**Sampled FP rate:** 5/5 = **100%** on hard-path samples; sampled subset is ALL `__tests__` paths. Distribution also contains non-test sites: `process.env.OPENCODE_API_KEY without ?? default` (11 findings) — these ARE in `src/` runtime code. On re-read at `r15-container-preflight.ts:60-80`, the env guard detector requires a `??` or enclosing `if (process.env.X)`; the plugin code may rely on the host guaranteeing the key is set (not a defect). This subset needs separate calibration not sampled here.

**RULING: fix-semantics**

- The true class exists: hardcoded `/tmp`/`/var`/`/home` literals in production container code and `require()` without error handling ARE real container-portability risks. The sampled FPs are (a) adversarial test inputs and dummy fixture paths, (b) double emission on same line (concatenation + literal).
- **Semantic fixes (file `r15-container-preflight.ts:30-200`):**
  1. Exclude `**/__tests__/**` and `**/fixtures/**` from ALL sub-signals (the 101-count is 60-80% test-anchored).
  2. Suppress double emission on same line (if both concatenation and literal fire on one node, emit one finding).
  3. `process.env` guard: add allowlist for keys that the host IS expected to inject (`OPENCODE_API_KEY`, `OPENCODE_WORKSPACE`) when the access is a read (mutation of `process.env` is still a finding). Document the allowlist in the finding's correction.
  4. Hardcoded-path: exclude string literals used AS TEST ARGUMENTS (call args in `expect`/`readWindowWithinScope`) — flag only paths used in `fs.*` / `path.join` production call sites.
- **Expected delta:** -60 to -80. Survivor ~20-40 (real production hard-path/env sites).

---

## 3  RULING SUMMARY + PURGE ORDER

| Rule (count) | Sampled FP | Rule RULING | Detector file(s) | Wave-2 action | Expected delta |
|--------------|-----------|-------------|------------------|---------------|----------------|
| `INVOCATION_INTEGRITY` (955) | 5/5 = 100% | **remove** — premise wrong (variety is not inconsistency; union types are correct; redundant with `tsc`) | `src/audit-engine/layers/r10-invocation-integrity.ts:354-371` | Delete the `typeStrings.size > 1` emission block; keep the real R10 checks (no-return, bare-return) for re-measurement | -955 |
| `DEPENDENCY_INTEGRITY` (838) | 4/5 = 80% (checker sub-detector 100%) | **fix-semantics (split)** — checker-resolution premise real but `Program` misconfigured for `node:`/`bun:`/workspace; dead-import premise real | `src/audit-engine/layers/r6-dependency-integrity.ts:249-269` (A) + `:271-294` (B) | Delete block 249-269 (A); keep block 271-294 (B) scoped; re-run and measure B alone | -700 to -750 (A) |
| `TYPE_CERTAINTY` (728) | 5/5 = 100% (construction/discriminant FPs) | **fix-semantics** — class real but `hasPrecedingRuntimeGuard` too narrow; misses ternary/discriminant/null guards and flags construction bridges | `src/audit-engine/layers/r16-bible-enforcement.ts:792-836` (`auditTypeCertainty`, `hasPrecedingRuntimeGuard`) | Extend guard recognition + exclude `as unknown as T` construction + fixture exclusion; re-run | -500 to -600 |
| `RUNTIME_CONTRACT` (659) | 5/5 = 100% | **fix-semantics** — T1 real; T2/T3 over-fire on generator polymorphism, stdlib-inferred params, inherited `any` | `src/audit-engine/layers/r9-runtime-contract.ts:180-360` | Keep T1; narrow T2 to input boundaries and exclude artifact paths/inherited-any; suppress T3 inherited-any and lib-typed callbacks | -450 to -550 |
| `ASYNC_CORRECTNESS` (324) | 5/5 = 100% | **fix-semantics** — class real but no-try is not unhandled (propagation ignored) + flags test harnesses and `Promise.resolve` | `src/audit-engine/layers/r3-async-correctness.ts:155-250` | Exclude `__tests__/fixtures`, non-rejectable promises, `expectRejects` boundaries; scope to non-artifact `src/` | -250 to -280 |
| `r8.todo-marker` (302) | 8/8 = 100% | **fix-semantics (already implemented; purge stale rows)** — class real; DB rows from old raw-slice detector (string matching + enclosing-construct attribution); current code IS comment-scoped | `src/audit-engine/layers/r8-source-hygiene.ts:74-144` (current, keep) — stale rows from deleted raw-slice detector (not on disk) | Purge 302 stale rows from `shared.db` (or mark `verdict='SUPERSEDED_RAW_SLICE'`); re-run and verify fresh count 5-30 | -300 to -302 (stale) |
| `OUTPUT_CONTRACT` (220) | 5/5 = 100% | **fix-semantics** — both sub-detectors real but scope/semantics wrong (constructors, `ok:false` negatives, `evidence`-field literalism, fixtures) | `src/audit-engine/layers/r16-bible-enforcement.ts:880-1017` (`auditCatchExit`, `auditMissingEvidenceAst`) | Exclude constructors/void-funcs, `ok:false` negatives, `__tests__/fixtures`, recognize structural evidence | -150 to -190 |
| `CONTAINER_PREFLIGHT` (101) | 5/5 = 100% (test-anchored) | **fix-semantics** — class real but 60-80% test-anchored (attack vectors, dummy fixtures) + double emission | `src/audit-engine/layers/r15-container-preflight.ts:30-200` | Exclude `__tests__/fixtures`, suppress double emission, allowlist host-injected env keys | -60 to -80 |

**Totals:**

- **Remove:** 1 rule (955)
- **Fix-semantics:** 7 rules (split: one remove-sub-detector + 6 semantic rewrites + 1 stale purge)
- **Keep as-is:** 0 (all sampled rules need change)
- **Purge arithmetic (conservative):** 955 + 725 (mid A) + 550 (mid TYPE) + 500 (mid RUNTIME) + 265 (mid ASYNC) + 301 (mid r8) + 170 (mid OUTPUT) + 70 (mid CONTAINER) = **~3,536 findings removed**. Post-purge estimate: **~1,100 findings** remain (506 out-of-scope + ~550 survivors of fix-semantics + dead-import). The battery page stops being 89% slop.
- **Stretch arithmetic (aggressive scoping):** replacement fix-semantics survivors may drop further on re-measurement — stretch estimate **~700-900** post-purge. The target bar from section 4: "the tool's front page stops being 76% noise" — both estimates satisfy it; the exact survivor count lands after the re-run.

> **Wave-2 MUST re-run after every fix-semantics patch and log the measured new count next to the expected delta — no purge "per estimate" without the re-measured evidence.**

---

## 4  HONEST NOTES

### 4.1  Prior Evidence

The directive provided prior evidence that `TYPE_CERTAINTY` and `INVOCATION_INTEGRITY` sampled FALSE for union return types, citing `canTransitionTo` with `true, false`. This was **confirmed independently** on my deterministic samples: `INVOCATION_INTEGRITY` id 2269 at `src/orchestrator.ts:65` is exactly `canTransitionTo` with `true, false` mapped to `boolean` — verdict FALSE_POSITIVE (section 2.1 sample 5). `TYPE_CERTAINTY` samples at `src/utils.ts:25-26` show the related but distinct slop mechanism (missed ternary/discriminant guards). No finding was copied from the prior — every quote and verdict here is from fresh `read` at the flagged line.

### 4.2  Sample-Failed / Not Sampled

- **SAMPLE-FAILED:** none — all 43 sampled files existed and the flagged lines were readable. Zero silent skips.
- **Not sampled (below threshold, noted for completeness):** `PATH_RESOLUTION` (97), `CONTROL_FLOW` (61), `CONFIG_SCHEMA` (58), etc. Their FP rates were NOT measured in this doc; wave 2 should spot-check any survivor whose post-purge share dominates the new battery (if e.g. `PATH_RESOLUTION` rises to >15% post-purge, it enters the next purge cycle).

### 4.3  Borderline Calls

- **`DEPENDENCY_INTEGRITY` sample 5** (`poseidonState` dead import): ruled TRUE_POSITIVE on current evidence (zero uses beyond import). Borderline because `poseidonState` may be intentionally imported for side-effect registration (the `poseidon-state.js` module could register a singleton on import). If wave 2 finds that the module HAS side-effect semantics, this finding class should be downgraded to info or suppressed via `sideEffects: true` handling. The ruling keeps the sub-detector but expects low volume; this single TP does not contradict the 80% FP for the rule's current 838-count (which is checker-resolution FP).
- **`TYPE_CERTAINTY` / `RUNTIME_CONTRACT` casts in artifact generators** (samples at `context-synthesis-artifact.ts:1743`, `deep-planning-artifact.ts:1495/1812`): ruled FALSE_POSITIVE as construction/narrowing bridges. A stricter reading could argue "the artifact generators SHOULD narrow more explicitly" — but the operator doctrine and ISE law prioritize real runtime input boundaries over template-generator plumbing.
- **`OUTPUT_CONTRACT` sample 5** (`return { ok: true }` at `r11-golden-validated.ts:5`): an ambitious reading could flag "no evidence field" even though the two preceding `if`-guards ARE the evidence. The ruling excludes `fixtures/` — wave 2 could instead reframe the detector to recognize guard counts as evidence, but that is the fix-semantics rewrite (structural evidence recognition) already prescribed.

### 4.4  What Surprised Me

- **The double/triple-count via overlapping constructs:** a single `todowrite` token in one template literal produced 3 findings at `definitions.ts:2/2/3/7` because the old detector ran per-`CodeConstruct` and the same string matched under 3 different enclosing constructs — multiplicative slop, not additive. Similarly `r8.todo-marker`'s `'/tmp/trident-3d-empty-' +` line emitted both `CONTAINER_PREFLIGHT` signals (hardcoded path + concatenation) on the same expression. Deduplication by `file:line:pattern` (which `r8` current code DOES do at line 121-122) is essential; the other legacy layers lack it.
- **The test-anchored share:** of 10 CONTAINER_PREFLIGHT distribution rows, the top `/tmp`/`/etc` literals are all test attack vectors or dummy fixtures; of 5 RUNTIME_CONTRACT samples, 0 are in production input handlers. The legacy layers did not exclude `__tests__` at all — a one-line `if (file.includes('__tests__')) continue;` would have cut 15-20% of the 4,633 battery.
- **The `true, false` literal-string trick:** `checker.typeToString` on `return true` yields `"true"` (literal type), on `return false` yields `"false"` — the detector compares strings and sees two distinct values. The function declares `boolean` and correctly returns `boolean`. The string-comparison detector defeats type assignability — lesson for wave 2: never compare stringified types for equality; compare assignability to the declared return type via `checker.isTypeAssignableTo`.

### 4.5  What Wave 2 Must Not Do (ISE Constraints)

Per ISE law, wave 2 is **forbidden** from purging-as-theater (delete rules to shrink the number without evidence). This doc IS the evidence — every `remove` here is premise-backed with code quotes. Conversely, wave 2 is forbidden from keeping a rule because "the count looks calibrated" without per-sample evidence on the fresh run. After each `fix-semantics` patch, 5 fresh samples MUST be re-read and re-verdicted before closing.

---

## 5  VERIFICATION ARTIFACTS (Raw Outputs — Paste-Ready)

### 5.1  Counts your doc's header must match

```bash
python3 -c "import sqlite3; c=sqlite3.connect('src/.trident/knowledge-graph/shared.db'); print(c.execute('SELECT rule_id, COUNT(*) FROM findings GROUP BY rule_id ORDER BY 2 DESC').fetchall())"
```

Paste:

```
[('INVOCATION_INTEGRITY', 955), ('DEPENDENCY_INTEGRITY', 838), ('TYPE_CERTAINTY', 728), ('RUNTIME_CONTRACT', 659), ('ASYNC_CORRECTNESS', 324), ('r8.todo-marker', 302), ('OUTPUT_CONTRACT', 220), ('CONTAINER_PREFLIGHT', 101), ('PATH_RESOLUTION', 97), ('CONTROL_FLOW', 61), ('r4.empty-catch', 60), ('CONFIG_SCHEMA', 58), ('r17.fake-return', 50), ('OUTPUT_IS_WORK', 33), ('r13.type-unsafe-pass', 26), ('r1.hook-contract-violation', 17), ('THEATRICAL_INTEGRITY', 17), ('DEFENSIVE_IMPORT', 16), ('ATOMIC_STATE', 13), ('r17.always-pass', 6), ('CONFIG_VALIDATION', 6), ('CONTAINER_DEPLOY', 5), ...]
```

### 5.2  Sampling method (deterministic)

```
ORDER BY id LIMIT 5   (-- LIMIT 8 for r8.todo-marker)
```

State in doc: deterministic by `id` (reproducible). If wave 2 uses `ORDER BY RANDOM()` it must log the seed.

### 5.3  Verification commands to run after write (paste raw outputs in the PR / wave-2 evidence)

```bash
python3 -c "import sqlite3; c=sqlite3.connect('src/.trident/knowledge-graph/shared.db'); print(c.execute('SELECT rule_id, COUNT(*) FROM findings GROUP BY rule_id ORDER BY 2 DESC').fetchall())"
# -> must match section 5.1

wc -l MASTER_CONTEXT/LEGACY_RULE_VERDICTS.md
# -> target 600+ lines of real content (this doc)

grep -c "^|" MASTER_CONTEXT/LEGACY_RULE_VERDICTS.md  # sample rows are table pipes
# or: grep -c "FALSE_POSITIVE" MASTER_CONTEXT/LEGACY_RULE_VERDICTS.md
# -> >= 42 FALSE_POSITIVE + 1 TRUE_POSITIVE = 43 verdicts (honest-notes mentions excluded)

grep -c "^\*\*RULING:" MASTER_CONTEXT/LEGACY_RULE_VERDICTS.md  # anchored: only the 8 ruling headers
# -> 8 (one per diagnosed rule; raw grep -c "RULING:" would show 9 due to this verification line itself containing that string)

grep -rn "INVOCATION_INTEGRITY\|TYPE_CERTAINTY" src/audit-engine --include="*.ts" -l
# -> must include src/audit-engine/layers/r10-invocation-integrity.ts
# -> and     src/audit-engine/layers/r16-bible-enforcement.ts
#    confirms detector cites in section 2 match on-disk files
```

---

## 6  REFERENCES

- Reading order (read before sampling): `MASTER_CONTEXT/AETHER_CLEANUP_OVERHAUL_PLAN.md` section 4 (purge law), `src/identity/trident/INTELLIGENT_SYSTEMS_ENGINEERING_T1.md` (ISE law)
- Findings DB: `src/.trident/knowledge-graph/shared.db`, table `findings`, columns `id, rule_id, severity, file, line, range_start, range_end, evidence, verdict, week, run_id, created_at`
- Per-rule total verification: `SELECT rule_id, COUNT(*) FROM findings GROUP BY rule_id ORDER BY 2 DESC` — values recorded in section 5.1 and in each rule's header
- Detector citations (grep-verified): `r10-invocation-integrity.ts:354-371` (INVOCATION), `r6-dependency-integrity.ts:249-294` (DEPENDENCY), `r16-bible-enforcement.ts:792-836` (TYPE_CERTAINTY), `r9-runtime-contract.ts:180-360` (RUNTIME_CONTRACT), `r3-async-correctness.ts:155-250` (ASYNC), `r8-source-hygiene.ts:74-144` (r8), `r16-bible-enforcement.ts:880-1017` (OUTPUT_CONTRACT), `r15-container-preflight.ts:30-200` (CONTAINER_PREFLIGHT)
- Section 4 quote on `canTransitionTo boolean` / `true, false` — confirmed at `src/orchestrator.ts:65` (sample INVOCATION_INTEGRITY #5)
- ISE law excerpt: *"decision systems are lexicons + state machines + algorithmic systems; the detector DETECTS, the machine DECIDES; a detector without understanding is the slop class"* — PatternFamily `{id,kind,matcher(ORDER-2+),triggerCondition,severity,messageTemplate,remediationHook}` + state machine `IDLE -> PARSED -> ANALYZED -> CLASSIFIED -> EVIDENCED -> EMITTED` (fail-state `INCONCLUSIVE`, never `PASS`) + evidence triads `{Pattern, State, Evidence: node+file:line}` — enforced here per-sample via file:line code quotes.

---

*End of LEGACY_RULE_VERDICTS — wave 2 executes the PURGE ORDER table in section 3 from this doc ALONE. No re-investigation needed for the 8 diagnosed rules; survivors of fix-semantics require a fresh re-sample after the patch.*
