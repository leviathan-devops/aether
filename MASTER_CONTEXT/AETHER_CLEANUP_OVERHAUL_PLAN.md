# AETHER CLEANUP OVERHAUL — THE PLAN (post-live-baseline, operator-directed 2026-08-29)

**Trigger:** the live host baseline (30.5min run, dist 890bc97d) exposed four defects:
the JSON-only findings contract destroyed real markdown work (R23's 7 findings),
the spine/template contract collision produced 3 rejections (R25, SRO-meta — the latter
also drifted cross-project to KRAKEN), the graph enrichment write path never fired
(74 candidates → 0 typed_edges), and the legacy battery's front page is 76% noise
(3,504 of 4,633 findings from ~5 structurally-broken detectors).

**Operator directives (verbatim, governing):**
1. "wire markdown primary properly"
2. "clean" (the tagging gap)
3. "clean this up properly no more slop clean this up per ISE properly" (the legacy purge)
4. "write the plan to properly clean and overhaul this"
5. "write the wave plan for this with the above taken into account"

---

## §1 THE MARKDOWN-PRIMARY FINDINGS CONTRACT (B1)

**The diagnosis:** the JSON-only requirement was an over-correction to the 13:49 class
(formless chat, nothing parseable). R23 proved the model writes excellent STRUCTURED
MARKDOWN natively — verdict, findings, file:line anchors, evidence quotes, spec clauses,
self-suppressed red herrings. The JSON gate destroyed real work. The tool hunted
format-gate slop and committed it.

**The new contract — STRUCTURED MARKDOWN with a REQUIRED GRAMMAR:**

Every hunter writes `findings/report.md` as markdown whose FINDINGS section carries one
block per finding in this grammar (the exact field set the current zod schema validates):

    ## FINDING: <subject>
    - predicate: <layer predicate, e.g. lexicon.threshold>
    - file: <path>:<line>
    - evidence: "<verbatim code quote>"
    - spec: <the implicated clause>
    - severity: HIGH|MEDIUM|LOW|CRITICAL        (optional per layer)
    - confidence: 0.55–1.0                       (optional per layer)

Plus a `## SUMMARY` section (the hunter's verdict prose). The grammar is REQUIRED —
machine-readability survives; free-form prose still rejects. What changes is the
SERIALIZATION: markdown (the model's native output) instead of a JSON blob.

**The reader (aether-report-reader.ts) gains three parse paths, tried in order:**
1. MARKDOWN GRAMMAR (primary): parse the `## FINDING:` blocks → zod-validate the fields
2. JSON (dialect, back-compat): the existing fenced/direct/balanced-brace paths
3. FAILURE: a NAMED error — GRAMMAR_VIOLATION names the FIRST missing/malformed field
   (not "no parseable JSON" — the error teaches the fix)

**The negative law holds:** conversational noise with no grammar still REJECTS (the
13:49 class stays dead). Tests: R23's REAL report from the live run parses ≥7 findings
(the recovery fixture); a prose-noise fixture rejects with GRAMMAR_VIOLATION; the old
JSON fixtures still parse.

**The template updates:** the FINDINGS-FILE CONTRACT section in all 14 hunter templates
teaches the markdown grammar with a complete example; the JSON-block language is
removed. The spine's marker-report doctrine is NOT the hunters' contract — the
templates say so in one line (the format, not an identity warhead).

## §2 THE REPAIR ROUND (B2)

On a parse failure, `runLayerHunter` re-prompts the hunter EXACTLY ONCE: "your
findings/report.md did not parse: <the named GRAMMAR_VIOLATION>. Rewrite it in the
finding grammar." The boilerplate's repair-loop pattern (validator-reject → one repair)
applied at the runner seam. Recovered reports flow the normal path; a second failure
stays REJECTED with both attempts' errors in the roster. Unit-proven with a scripted
agent: bad-format → repair prompt observed → good report → FULFILLED.

## §3 THE RUNNER-SIDE TAGGING + THE GRAPH WRITE FIX (B3)

**The diagnosis:** graph_tag is a tool the model may choose to call — it chose not to
(74 candidates → 0 typed_edges). The pi SDK round contract verifies DONE-conditions
(report exists), never CALL-conditions (a required tool invocation) — that is the exact
gap. Additionally mpse-meta found the tag tool itself defective: inserts without the
brand check (aether-tools.ts:245).

**The fix — deterministic, removes model discretion:**
- After `readFindingsReport` zod-validates the candidates, THE RUNNER calls the tag
  function itself (through the corbell bridge, DELETE-before-INSERT idempotent):
  one typed_edge per candidate, predicate from the finding, canonical_id
  layerId:file:line. 74 candidates → 74 typed_edges. Guaranteed.
- Fix the brand check at aether-tools.ts:245 (the mpse-meta finding).
- The SRO CORRELATIONS section then computes from real tags — same-site
  multi-predicate hits become TRIPLE-CONFIRMED rows (dispatchSubagent was flagged by
  R19+R22+R27 independently — the first correlation is already known).
- Future enrichment (model-driven graph exploration via required-call round wiring)
  is a separate, later design — NOT in this overhaul.

## §4 THE LEGACY PURGE PER ISE (B5) — the slop removal

**The diagnosis (measured, shared.db, this run):** 4,633 findings; 3,504 (76%) from
~5 rules; 431 of 458 files flagged. The top rules are STRUCTURALLY BROKEN detectors:

- TYPE_CERTAINTY (728): flags union return types as "inconsistent types" — the live
  sample: "Function canTransitionTo returns inconsistent types: true, false" — a
  BOOLEAN. It detects TypeScript's type system working normally and calls it defects.
- INVOCATION_INTEGRITY (955): same family — "asHook returns inconsistent types:
  HookHandler, () => Promise<undefined>" — a legitimate union return.
- DEPENDENCY_INTEGRITY (838) / RUNTIME_CONTRACT (659) / ASYNC_CORRECTNESS (324):
  sampled verdicts PENDING — the purge wave diagnoses before removing (ISE: no
  removal without the evidence triplets).

**The ISE law applied:** a detector that returns verdicts from pattern shape without
understanding the construct is the regex-slop class — regardless of its finding count.
The founding lexicons (r4 empty-catch 60, r17 fake-return 50, r13 26, r1 17) are
calibrated and REAL — they stay.

**The procedure (two ordered steps):**
1. DIAGNOSE: every rule >100 findings gets 5 sampled findings READ AT THE FLAGGED
   LINES; each sample verdicted TRUE-POSITIVE / FALSE-POSITIVE with the code quote; a
   rule verdict table (keep / fix-semantics / remove) lands as the gate artifact.
   Rules with >50% sampled-FP are slop by definition.
2. PURGE+CALIBRATE: execute the verdicts — REMOVE the union-return family outright
   (a detector that flags booleans is beyond fixing); REWRITE any keep-but-broken
   semantics to Order-2 AST correctness; D17-calibrate the survivors (the
   calibration gate flags over-firing matchers pre-battery). The measured post-purge
   count replaces the 4,598 baseline.

**The bar:** the tool's front page stops being 76% noise. Every surviving rule carries
sampled evidence it fires true.

## §5 THE ASYNC SEAM (B4) — the 15s return + the visibility channel

**The proven fact:** the audit already runs detached (the live run survived the
tool-call abort and completed [FINAL] 30 minutes later). Missing: the visibility seam.

**The design (from the two references: Hydra_Wave_Manager wave-scope.ts's 50ms
early-return + wave-manager v3's completion-gate/toast pattern):**
- `trident-code-audit` returns after [PRELIMINARY] fires (<20s): {runId, statusPath,
  artifactPath, ladder: "PRELIMINARY"} — the gates continue detached.
- `<targetRoot>/.trident/aether-ledger/run-status.json` written at EVERY transition:
  {runId, gate, phase, huntersFulfilled, huntersRejected, candidatesSoFar,
  artifactLabel, updatedAt}.
- NEW tool action `action=status` (runId optional): reads run-status.json + the
  artifact headers — the poll channel.
- Per-gate completion fires the plugin's toast/notification (the v3 wave-completion
  pattern): "LASME gate complete — 26 candidates — doc2 growing".
- The agent (or operator) reads doc2's LASME sections and ACTS while MPSE hunts.

**The guard:** the ladder logic, the gates, the boilerplate — UNTOUCHED. The seam is
additive: a status file + a tool action + a notification. No re-architecture.

## §6 THE SCOPE PINNING (B6)

SRO-meta audited KRAKEN — a different project — because its input data did not pin the
target. Fixes: (a) every template's [INPUT DATA] carries `targetRoot: <the pinned
absolute path>` + the one-target law line; (b) HARDENING: the hunters' read/grep tools
gain root confinement — read_file/grep REFUSE paths outside targetRoot (the writes are
already force-bound; the reads were only capped). The Kraken wander becomes
mechanically impossible.

---

## §7 THE VERIFICATION BAR (every wave)

Zero broken windows: hydra + aether-backend + knowledge-graph + scope-mandate green +
tsc 0 at every gate. The boilerplate spine untouched (the rounds wiring and the 4
surfaces remain the only sanctioned adaptation points). The live re-baseline at the
end: markdown findings parsed, typed_edges > 0, correlations populated, the purged
legacy count measured, the async seam observed transitioning gates while polled.
