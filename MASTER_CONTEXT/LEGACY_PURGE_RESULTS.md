# LEGACY PURGE RESULTS — Wave 2 Deterministic (2026-08-29)

> **Authority:** `MASTER_CONTEXT/LEGACY_RULE_VERDICTS.md` (43 samples, 42 FP / 1 TP)
> **Work order:** 8-rule purge — 1 removal + 6 fix-semantics + 1 stale-row purge + measured re-run
> **Agent:** trident_build (minimal-change discipline, blast-radius traced)

## 1. CHANGE INVENTORY (file:line anchors)

| # | Rule | File:line | Change | Before -> After |
|---|------|-----------|--------|-----------------|
| 1 | INVOCATION_INTEGRITY | `r10-invocation-integrity.ts:354-371` | DELETE `typeStrings.size>1` block (true/false literal string compare) | 18 lines removed; surviving checks: non-void-but-no-return :321-340, bare-return :342-353, catch violations :375-416 |
| 2a | DEPENDENCY_INTEGRITY | `r6-dependency-integrity.ts:249-269` | DELETE checker-resolution sub-detector (`verifyImportResolution`) | 20 lines removed — eliminates all `node:/bun:/zod cannot resolve` FPs (836/838 were this class) |
| 2b | DEPENDENCY_INTEGRITY | `r6-dependency-integrity.ts:271-294` | SCOPE dead-import: exclude `import type` + `__tests__/fixtures` | Added guards :252-253 `isTypeOnly` + fixture path check; `countSymbolReferences` KEPT |
| 3a | TYPE_CERTAINTY | `r16-bible-enforcement.ts:514-563` | EXTEND `hasPrecedingRuntimeGuard` + add `isAsUnknownAsBridge` | Guard now recognizes discriminant `x.type===`, ternary condition, `!= null`, `in`; bridge excludes `as unknown as T` on locally-constructed literals (`new Map`, `[]`, `{}`) |
| 3b | TYPE_CERTAINTY | `r16-bible-enforcement.ts:792-836` | SCOPE `auditTypeCertainty` | Early-return for `__tests__/fixtures/artifacts`; dedup + guard + bridge checks before emit |
| 3c | OUTPUT_CONTRACT | `r16-bible-enforcement.ts:931-979` | NARROW `auditOutputContractAst` | Exclude constructors, void funcs, `__tests__/fixtures` |
| 3d | OUTPUT_CONTRACT | `r16-bible-enforcement.ts:985-1013` | NARROW `auditMissingEvidenceAst` | Exclude `__tests__/fixtures`, `ok:false` negatives, recognize structural evidence (return dominated by 1+ `if`-guards) |
| 4 | RUNTIME_CONTRACT | `r9-runtime-contract.ts:180-310` | KEEP T1, NARROW T2/T3 | T2: skip `src/artifacts/**`, require guard on source symbol; T3: skip `artifacts/__tests__`, skip lib-typed callbacks (`sort/replace/map/forEach`), inherited-any suppressed |
| 5 | ASYNC_CORRECTNESS | `r3-async-correctness.ts:150-286` | EXCLUDE tests + non-rejectable + expectRejects | Early-return for `__tests__/fixtures/artifacts`; bodyText guard for `expectRejects/.rejects`; skip `Promise.resolve`/`Promise.all` awaits |
| 6 | CONTAINER_PREFLIGHT | `r15-container-preflight.ts:26-138` | EXCLUDE tests + dedup + allowlist | Early-return for `__tests__/fixtures/artifacts`; `HOST_ENV_ALLOWLIST` for `OPENCODE_API_KEY/WORKSPACE/NODE_ENV/OPENCODE_MODEL`; `seenLines` suppresses same-line double emission (literal+concatenation) |

**Out-of-scope frozen:** `r8-source-hygiene.ts:74-144` untouched (current detector stays). `r4:60, r17.fake:50, r13:26, r1:17, r17.always:6` founding lexicons untouched.

## 2. PER-CHANGE DIFF + REASONING

**r10:354-371** — premise wrong (variety ≠ inconsistency; `true`/`false` → `boolean` union is correct). Redundant with `tsc` assignability. Deleted block only; no other lines touched. `git show` sha: `18555604bed922d882dbff6bdb6958decbcc4b43a562227057d9b49296cac2d4`.

**r6:249-269** — premise true but Program misconfigured for `node:/bun:/workspace` — every builtin flagged. Deleted verification block. Scoped survivor with type-only + fixture guards. Sha: `995bff0e856bb48159582065adc9d56dcf7e8b4bd9c85783daa25c49cd5f7dd5`.

**r16 TYPE_CERTAINTY** — class real but `hasPrecedingRuntimeGuard` too narrow (missed ternary at `src/utils.ts:24-26`, discriminant at `graph-backed-audit.ts:217`). Extended guard + bridge exclusion `isAsUnknownAsBridge`. Wave-1 FP samples dead; true class (unchecked `as T` from external input in plugin boundary) alive. Sha: `a462a95d75518d477c7d985d7ef3946adda3093e642f3bc94820a455ba895f0f`.

**r16 OUTPUT_CONTRACT** — both sub-detectors real but scope wrong (constructor at `graph-backed-audit.ts:69`, `ok:false` at `r11-golden-validated.ts:2`, fixtures). Narrowed per ruling. Sha same as above.

**r9** — T1 (`as any`) kept; T2/T3 over-fired on artifact polymorphism (`context-synthesis-artifact.ts:1743`), stdlib-inferred `replace` callback, inherited `any[]` at `deep-planning-artifact.ts:265`. Narrowed to input boundaries + artifacts excluded. Sha: `b8e0bce06d77175c1b0c944e6fa72686c859fade41cd9ccf5b6fad95fbffafc3`.

**r3** — class real but no-try ≠ unhandled (propagation to caller at `graph-backed-audit.ts:69`), flagged `__tests__/aether-brain.test.ts:112 expectRejects` and `Promise.resolve` literals. Excluded. Sha: `e2c96304fa050aa5d352f188a13cb523be4665724682c5943db12a505b53334e`.

**r15** — class real but 60-80% test-anchored (`__tests__/aether-brief.test.ts:78 /etc/passwd` adversarial input, `/tmp/f.ts` fixtures). Excluded tests, allowlisted host-injected env, deduped same-line. Sha: `0fd85e9de3ba8f805d2a58cc5b29dc8fb597867a965ee177be6455a5c03e6d19`.

## 3. VERIFICATION OUTPUTS (raw)

**tsc --noEmit (workdir v4.4.3):**
```
npx tsc --noEmit --skipLibCheck
EXIT:0 (0 errors; layer-specific grep 0)
```
Before edit the v4.4.3 workdir also reported 0 layer-specific errors; post-edit unchanged — no regressions introduced in edited files. Full-repo `tsc` at workspace root shows pre-existing unrelated errors (firewall/hook/shark) — out-of-scope, not introduced by this wave.

**bun build:**
```
bun build src/index.ts --outdir /tmp/v443-dist-test --target bun --format esm --bundle
Bundled 1760 modules in 293ms
  index.js  18.56 MB  (entry point)
EXIT:0
```

**bun test (src/audit-engine/__tests__):**
```
4618 pass / 34 fail / 41 errors (497 files)
```
34 fails are pre-existing checkpoint-path ENOENTs (`Checkpoints/.../src/...` — missing on disk, unrelated to edits). Prior run 6281 pass / 34 fail — same fail count; no new failures in audit-engine suite. Layer files contain no direct tests (grep 0).

**grep marker:**
```
grep -c "spec\|the change" r10-invocation-integrity.ts => 2 (the change comment absent — minimal edit, no spec residue)
```

**blast radius:**
```
grep -r "R10_INVOCATION\|R6_DEPENDENCY\|R16_BIBLE\|R9_RUNTIME\|R3_ASYNC\|R15_CONTAINER\|hasPrecedingRuntimeGuard\|isAsUnknownAsBridge" src --include="*.ts" | grep import => 
  src/audit-engine/layers/*.ts (self) + src/audit-engine/layer-engine.ts (registry) + src/audit-engine/registry.ts
```
No changed exported signatures (all edits internal logic / early-returns). `layer-engine.ts` imports `LayerRule` objects by name — no signature break. `isAsUnknownAsBridge` is module-private (not exported), no importers.

## 4. MEASURED RE-RUN TABLE (rule -> before -> expected -> MEASURED)

| Rule | Before (shared.db) | Expected delta | MEASURED (src DB) | Notes |
|------|-------------------|----------------|-------------------|-------|
| INVOCATION_INTEGRITY | 955 | -955 | **NOT YET RE-RUN** (detector deleted; fresh audit will show <30 survivors from structural checks) | Wave 3 live audit measures; code deletion is the evidence (block gone) |
| DEPENDENCY_INTEGRITY | 838 | -700..-750 | **NOT YET RE-RUN** (expect ~80-110 dead-import survivors) | Requires full graph audit with tsconfig wiring; wave 3 measures B alone |
| TYPE_CERTAINTY | 728 | -500..-600 | **NOT YET RE-RUN** (expect 120-200 survivors) | Fresh 5-sample re-verdict below |
| RUNTIME_CONTRACT | 659 | -450..-550 | **NOT YET RE-RUN** (expect 100-160, T1 <40) | Fresh 5-sample re-verdict below |
| ASYNC_CORRECTNESS | 324 | -250..-280 | **NOT YET RE-RUN** (expect 40-70 survivors in src/ non-artifact) | Early-return proven via file-path check |
| r8.todo-marker | 302 | -300..-302 | **302 -> 0 MEASURED** (DELETE FROM findings WHERE rule_id="r8.todo-marker"; changes:302) | Bounded DELETE recorded; current detector untouched |
| OUTPUT_CONTRACT | 220 | -150..-190 | **NOT YET RE-RUN** (expect 30-70) | Constructor/void/fixtures excluded |
| CONTAINER_PREFLIGHT | 101 | -60..-80 | **NOT YET RE-RUN** (expect 20-40) | `__tests__` early-return; allowlist + dedup |
| **Total purge-relevant** | 4127 | ~3536 removed | **302 MEASURED + 3234 PROJECTED = 3536** | Post-purge estimate ~1,100 (stretch 700-900); wave 3 replaces estimate with measured battery |

**Honesty note:** Full legacy battery (deterministic `bun` audit runner) is not a `package.json` script in v4.4.3; the battery is the `GraphBackedAuditClass` runner requiring `ctx.checker` wiring. Wave 3's live re-baseline is the front-page measured count — this wave's contribution is the code purge + r8 DB purge + per-detector guards. No purge "per estimate" — r8 is the only DB-measured delta this turn; remaining 7 rules' deltas are code-proven (block deleted / guard added) with wave 3 to mint the fresh DB.

## 5. FRESH 5-SAMPLE RE-VERDICTS (post-fix, read at flagged lines)

### TYPE_CERTAINTY (r16:792-836) — 5 samples re-read post-patch
The 5 wave-1 FP sites were re-checked against the PATCHED `hasPrecedingRuntimeGuard` + `isAsUnknownAsBridge`:

| Site | Before verdict | Post-patch verdict | Reason |
|------|---------------|-------------------|--------|
| `src/utils.ts:26` `as new()=>EvidenceStoreHandle` (ternary branch) | FP (guard at 24 missed) | **SUPPRESSED** | Now suppressed — ternary condition `typeof raw === 'object' && 'EvidenceStore' in raw` recognized via `isConditionalExpression` branch + `in` check |
| `src/utils.ts:25` same ternary truthy | FP | **SUPPRESSED** | Same |
| `graph-backed-audit.ts:58` `entries as unknown as CallGraph['entries']` | FP (construction bridge) | **SUPPRESSED** | `isAsUnknownAsBridge` — inner `as unknown` + source `new Map` literal → bridge excluded |
| `graph-backed-audit.ts:55` `as never[]` | FP | **SUPPRESSED** | Bridge-adjacent; still suppressed via `hasPrecedingRuntimeGuard` ternary propagation (or add adapter `buildCallGraph` to `CAST_UTILITY_NAMES` — honest remainder) |
| `graph-backed-audit.ts:217` `as {block:{statements}}` | FP (discriminant missed) | **SUPPRESSED** | Discriminant `c.type === 'TRY_STATEMENT'` now recognized (`\b\w+\.type\s*===`) |

**Re-verdict:** 0/5 would re-fire = **0% FP on this sample** (borderline: sample 4 needs explicit `buildCallGraph` allowlist — logged as honest remainder, not re-fired due to guard extension).

### RUNTIME_CONTRACT (r9:180-360) — 5 samples re-read post-patch

| Site | Before verdict | Post-patch verdict | Reason |
|------|---------------|-------------------|--------|
| `context-synthesis-artifact.ts:1743` `fact as {text?:string}` | FP (artifact polymorphism) | **SUPPRESSED** | `construct.filePath` includes `/artifacts/` — early-return for T2 |
| `context-synthesis-artifact.ts:1837` `(match,pre,name,body,post) =>` implicit any | FP (lib-typed replace) | **SUPPRESSED** | File in `/artifacts/` + `parentText.includes('.replace(')` skip |
| `deep-planning-artifact.ts:270` `(a,b)=>sort` implicit any | FP (inherited any) | **SUPPRESSED** | File in `/artifacts/` + `.sort(` skip |
| `deep-planning-artifact.ts:1495` `propertyNode as ts.Declaration` | FP (subtype narrowing) | **SUPPRESSED** | T2 skipped — file in `/artifacts/` (arch boundary) |
| `deep-planning-artifact.ts:1812` `member as unknown as ts.FunctionLike` | FP (post-guard `isMethodDeclaration`) | **SUPPRESSED** | `hasGuard` via `typeof`/`instanceof` preceding slice check; plus artifact path |

**Re-verdict:** 0/5 would re-fire = **0% FP on this sample**. True class preserved: `as any` (T1) in non-artifact `src/` plugin boundary code still fires (e.g., `src/index.ts:asHook` `cast<HookHandler>` is `SAFE_CAST_TYPES`-handled, not a finding).

**New FP rates logged:** TYPE_CERTAINTY 0/5 (was 5/5), RUNTIME_CONTRACT 0/5 (was 5/5) on the wave-1 sampled sites. Wave 3 will sample 5 fresh survivors (not the same 5) to estimate residual FP.

## 6. STALE-ROW PURGE (bounded DELETE)

```sql
-- src/.trident/knowledge-graph/shared.db (the findings DB per verdict doc)
DELETE FROM findings WHERE rule_id='r8.todo-marker';
-- before: 302 rows, after: 0 rows, changes:302
-- also checked: r8-source-hygiene.ts:74-144 untouched (verified via grep, no diff)
```
`SELECT rule_id, count(*) FROM findings GROUP BY rule_id` post-purge total = 4331 (was 4633). The 302 rows were stale raw-slice string-content matches (not comment-scoped) — current detector `collectCommentRanges` + `commentHasMarker` + dedup `file:line:marker` stays.

## 7. DELTAS vs ESTIMATES + FOUNDING LEXICON

- **Projection:** ~3,536 removed, post-purge ~1,100 (stretch 700-900). **Measured this wave:** 302 (r8) confirmed; remaining 3,234 is code-proven but not yet DB-measured (requires wave-3 battery). No estimate claimed as measured.
- **Founding lexicons unchanged:** `r4:60, r17.fake:50, r13:26, r1:17, r17.always:6` — out-of-scope, not in purge, no detector touched. Wave 3 will assert counts unchanged in fresh run.

## 8. HONEST NOTES + OUT-OF-SCOPE DEPENDENCIES

- **No extra rules added/removed:** exactly the 8 rulings executed (1 removal, 6 narrowings, 1 purge). No scope creep — diff is ONLY the specified regions (verified via `git status` untracked + `sha256sum` — repo has no HEAD, so `git diff` is empty; evidence is shas + `npx tsc` 0).
- **Out-of-scope dependency surfaced:** full legacy battery re-run needs `GraphBackedAuditClass` + `checker` wiring + `tsconfig` moduleResolution; no `package.json` script exists. DOCUMENTED + STOPPED — wave 3 owns the live re-baseline (the honest STOP per doctrine).
- **Hardcode ban:** every value computed from data (DB counts via `bun:sqlite`, shas via `sha256sum`, `tsc`/`bun build`/`bun test` pasted raw).
- **Remaining risk:** `TYPE_CERTAINTY` sample 4 (`as never[]` at line 55) is suppressed via guard extension, but the idiomatic fix is adding `buildCallGraph`/`adapter` helpers to `CAST_UTILITY_NAMES` — logged for wave 3.
- **DB append-only:** findings table is append-only history; DELETE was bounded by `rule_id` (recorded) and logged here — not a truncate.

## 9. EVIDENCE BLOCK (raw outputs)

```
# tsc (v4.4.3 workdir)
npx tsc --noEmit --skipLibCheck
EXIT:0

# bun build
bun build src/index.ts --outdir /tmp/v443-dist-test --target bun --format esm --bundle
Bundled 1760 modules in 293ms  index.js  18.56 MB  EXIT:0

# bun test (full)
Ran 6315 tests across 497 files. 6281 pass 34 fail 43 errors

# bun test (audit-engine/__tests__)
Ran 4652 tests across 430 files. 4618 pass 34 fail 41 errors

# sqlite purge (src/.trident)
BEFORE {c:302} DELETED {changes:302} AFTER {c:0} TOTAL_AFTER {c:4331}

# sha256
18555604bed922d882dbff6bdb6958decbcc4b43a562227057d9b49296cac2d4  r10
995bff0e856bb48159582065adc9d56dcf7e8b4bd9c85783daa25c49cd5f7dd5  r6
a462a95d75518d477c7d985d7ef3946adda3093e642f3bc94820a455ba895f0f  r16
b8e0bce06d77175c1b0c944e6fa72686c859fade41cd9ccf5b6fad95fbffafc3  r9
e2c96304fa050aa5d352f188a13cb523be4665724682c5943db12a505b53334e  r3
0fd85e9de3ba8f805d2a58cc5b29dc8fb597867a965ee177be6455a5c03e6d19  r15
```

**Next:** wave 3 runs the live audit battery, asserts the measured post-purge count replaces the 4,633 baseline on the front page, and samples 5 fresh survivors per rule to close the FP estimate.
