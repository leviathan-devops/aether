# V443 ENGINE-LOG FORENSICS — INFRASTRUCTURE FINDINGS (W-R desk 6, 2026-08-28)

## VERDICT: MEDIUM confidence — dual-logger + tee-version-skew hypothesis; old-rig root cause PROPOSED pending O1/O2

## 1. THE WRITER TOPOLOGY

```
                    ┌─────────────────────────────┐
     tridentLog() ──►│ src/utils.ts:69-88          │──appendFileSync(TRIDENT_LOG_PATH)──► /tmp/trident-engine.log (durable, sync)
  audit-engine       │ TRIDENT_LOG_PATH L105 =     │                    ▲
  internals          │  $TRIDENT_LOG_PATH ||       │                    │
                     │  os.tmpdir()/trident-engine │                    │
                     └─────────────────────────────┘                    │
                                                          ┌─────────────┴──────────┐
  console.error('[chain] …') ──► console.error patch ──► tridentLog('ERROR','console',…) ─┘
  agent.ts / report-writer.ts      src/index.ts:22-33
  (shadow-backend)                  (plugin entry, runs at import)
                                                          ~/.local/share/opencode/log/*.log
                                                          ── opencode runtime, NOT tridentLog
                                                          ── plugin-load diagnostics only

  EvidenceStore (src/evidence/evidence-store.ts:12) ── memory-only ── no durable file
  TRIDENT_FALLBACK_LOG = os.tmpdir()/trident-error.log (utils.ts:106) ── never written in current code
```

## 2. THE MECHANISM — explains BOTH observations

### The console tee (src/index.ts:22-43)

The plugin entry saves `_origConsoleError/Log/Warn` then replaces:
- `console.error = (...args) => { tridentLog('ERROR','console',msg.slice(0,500)); }` (L26)
- `console.log = (...args) => { tridentLog('INFO','console',msg); }` (L35)
- `console.warn = (...args) => { tridentLog('WARN','console',msg); }` (L40)

ANY `console.error('[chain] …')` from agent.ts / report-writer.ts lands in `/tmp/trident-engine.log` IFF this index.ts has executed. Without it, `[chain]` lives only on stderr (container TUI stream / opencode log), never in the engine log.

### Old-rig silence (last stamp 01:20Z, post-restart zero lines despite audit artifacts)

The old rig ran audits → `console.error('[chain]')` fired (stderr visible, artifacts exist) but the file stayed silent. Either:
1. The old deployed dist lacked the `src/index.ts:26` tee (so console bypassed the file) AND no `tridentLog` events fired post-restart (WARNs absent), OR
2. `TRIDENT_LOG_PATH` env redirected writes elsewhere (L105 override), OR
3. An append failure (permission/rotation) was swallowed by the catch at L79.

File silence does NOT imply no audits ran.

### Recreated-rig presence (02:50Z `[chain]` grep hit)

The recreated rig deployed the CURRENT dist which contains the tee → `console.error('[chain]')` now tee'd through `tridentLog('ERROR','console',…)` at `src/index.ts:32` → `appendFileSync` at `src/utils.ts:77` → lines appear. Same image, different deploy/boot state.

### Container /tmp note

`/tmp` is per-container, not per-process — silent file cannot be explained by per-process isolation; must be logger-path divergence.

## 3. THE VERIFIED SUBSET (file:line, read this session)

1. Sole durable writer to `/tmp/trident-engine.log`: `appendFileSync(TRIDENT_LOG_PATH)` at `src/utils.ts:77-78` (path at `src/utils.ts:105`: `process.env.TRIDENT_LOG_PATH || path.join(os.tmpdir(),'trident-engine.log')`).
2. `[chain]` emitters use `console.error` (agent.ts, report-writer.ts — ABSENT from reading order, flagged ABSENT; but `src/index.ts:26-33` proves the capture path: `console.error→tridentLog→same file`).
3. `src/index.ts:18-43` tee is present in CURRENT src; presence in the OLD deployed dist is UNPROVEN (needs O1 below).

## 4. CONFIDENCE

- Topology + tee existence: **MEDIUM** (proven by read)
- Old-rig root cause: **LOW / PROPOSED** (tee-absence vs env-override vs append-failure — all plausible, none proven)

## 5. OPEN ITEMS (the follow-ups that close the hypothesis)

| # | Check | Closes |
|---|---|---|
| O1 | `grep -c "CONSOLE SPILLOVER PREVENTION" <old-rig dist>` — does the old deployed dist contain the tee block? | tee-version hypothesis |
| O2 | `echo $TRIDENT_LOG_PATH` on old vs new container | env-divergence hypothesis |
| O3 | `ls -l /tmp/trident-engine.log` post-restart old-rig — permission/rotation? | append-failure hypothesis |
| O4 | Locate agent.ts + report-writer.ts real paths; verify `console.error('[chain]'` emitters | ABSENT verdicts |
| O5 | If tee-absence confirmed: NO code change needed — the current dist IS the fix; redeploy if mismatch. If env-divergence: pin `TRIDENT_LOG_PATH` in container entrypoint. If append-failure: add `fs.mkdirSync` before append. | the fix |

## 6. KEY FILES READ (anchors verified)

| File | Lines | Role |
|---|---|---|
| src/utils.ts | 171 | tridentLog writer (L69-88), TRIDENT_LOG_PATH (L105), EvidenceStore memory-only |
| src/audit-engine/shadow-backend/provider.ts | 46 | provider seed, NO log write path (isolated — zero imports of utils.ts) |
| src/index.ts | 256 | console tee at L22-43 (the CONSOLE SPILLOVER PREVENTION block — the mechanism) |

## 7. ABSENT FILES (flagged, never fabricated)

`src/audit-engine/shadow-backend/agent.ts` and `src/subagents/trident-bug-hunter/tools/report-writer.ts` — cited in the mission as console.error('[chain]') emitters; not found under the expected paths during this investigation. Their `[chain]` role is inferred from the tee capture at `src/index.ts:26`, not read directly. The orchestrator should confirm their actual paths (likely under a different directory structure in the deployed plugin).

## 8. PROVENANCE

Forensic desk wr6 (trident_explore, session ses_fbb183bd3ffe4X2N7lZkUR6aLq), wave wave-1787862224053. The full brief was returned in the agent's task_result (this document is the orchestrator's write of that brief — explore agents have no write tool).
