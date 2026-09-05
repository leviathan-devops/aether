# RULE CORPUS — trident-v443 self-hunt (machine-actionable edition)
# Every rule is a verbatim-quotable PatternFamily card anchored to a real file:line.
# The lexicon compiler (compileBattery via extractRuleCards → selectTemplate → compileTemplate)
# parses each card's quote + anchor + classification + severity into a CompiledPredicate.
# Template library (templates.ts:36-40): WIRING | CONTRACT | PROVENANCE | DOMAIN | PROCESS
# Classification to template mapping (compiler.ts:95-103): ARCH maps to contract_must_implement,
# LOGIC maps to provenance_traces_to_source, PROCESS maps to process_gates_measure_outputs_not_logic,
# DOMAIN maps to domain_numeric_threshold. Cards carry D13 verbatim quotes (quoted_not_synthesized).

## CARD-01 shared-mutable-state — HT-BUG-1/5 (process.cwd JSON store contamination)

- anchor: src/poseidon/poseidon-state.ts:31
  quote: "Session state MUST be per-session rows keyed by the real session id in SQLite WAL storage — one global JSON file or one shared mutable key across sessions is contamination by construction. HT-BUG-1 HT-BUG-5"
  classification: ARCH
  severity: CRIT
  example POS: src/poseidon/poseidon-state.ts:125 saveToDisk resolves .trident/poseidon-state/state.json against process.cwd — BECAUSE server cwd wanders per project and test pollution leaks into production
  example NEG: src/poseidon/poseidon-state.ts:31 SQLite sessions.db keyed by session id with WAL — BECAUSE per-session isolation prevents cross-project contamination

## CARD-02 side-channel-lifecycle-write — HT-BUG-2 (abort writes wrong store)

- anchor: src/tools/trident-poseidon.ts:90
  quote: "Abort MUST write the terminal phase into the same store the enforcer reads — an abort that only flips an in-memory flag leaves enforcement enforcing a corpse. HT-BUG-2"
  classification: LOGIC
  severity: CRIT
  example POS: src/tools/trident-poseidon.ts:90 poseidonState.setAbortFlag only writes in-memory flag without touching .trident/god-loop/state.json — BECAUSE enforcer reads god-loop phase file, so abort is invisible
  example NEG: src/tools/trident-poseidon.ts:117 markAborted writes phase FAILED via writeStateAtomic — BECAUSE same store enforcer reads makes abort observable

## CARD-03 bare-verb-proximity-deactivation — HT-BUG-3 (OFF lexicon without proximity gating)

- anchor: src/warheads/nlp-pipeline/poseidon-detector.ts:33
  quote: "Deactivation MUST be proximity-gated to within 60 chars of poseidon — bare OFF verbs like abort or block in diagnostic prose MUST NEVER deactivate the mode. HT-BUG-3"
  classification: PROCESS
  severity: CRIT
  example POS: src/warheads/nlp-pipeline/poseidon-detector.ts:33 OFF lexicon matches abort block kill stop without proximity check — BECAUSE diagnostic narration containing abort blocked near unrelated text triggers phantom deactivation
  example NEG: src/warheads/nlp-pipeline/poseidon-detector.ts:80 proximity-gated OFF signal requiring poseidon within 60 chars — BECAUSE explicit deactivate poseidon carries verb adjacent to name and correctly flips mode

## CARD-04 enforcement-source-writable — HT-BUG-4 (guardian state inside guarded area)

- anchor: src/hooks/poseidon-enforcer-hook.ts:220
  quote: "Enforcement state files MUST be integrity-firewalled — writes to .trident/god-loop/state.json or .trident/poseidon-state via the agent tool surface MUST be blocked unless caller is the god loop itself. HT-BUG-4"
  classification: ARCH
  severity: CRIT
  example POS: .trident/god-loop/state.json edited via edit tool with Edit applied successfully and zero gates fired — BECAUSE state file was inside guarded area without firewall
  example NEG: src/hooks/trident-hooks.ts state-integrity firewall gating .trident/god-loop/state.json writes via tool.before — BECAUSE only god loop fs writes bypass the tool surface

## CARD-05 cwd-anchored-state — HT-BUG-3b/15 (process.cwd persistence in multi-project runtime)

- anchor: src/poseidon/poseidon-state.ts:125
  quote: "State persistence MUST anchor to the project path not process.cwd — a server carrying 6 concurrent TUI sessions MUST NEVER resolve state against the wandering cwd. HT-BUG-3b HT-BUG-15"
  classification: ARCH
  severity: CRIT
  example POS: src/poseidon/poseidon-state.ts:125 saveToDisk loadFromDisk resolve against process.cwd — BECAUSE opencode host process cwd drifts between Shared Workspace Context paths and test runs pollute production
  example NEG: src/poseidon/poseidon-state.ts with injected baseDir anchored to targetPath — BECAUSE project-anchored resolution stays stable across restarts and concurrent sessions

## CARD-06 degenerate-success-shape — HT-BUG-8 (contentless done crossing error-only guard)

- anchor: src/audit-engine/harness/pi-shadow-agent.ts:260
  quote: "Chained streams that exhaust all rungs MUST throw SHADOW_CHAIN_EXHAUSTED with per-rung denial reasons — a degenerate contentless done that crosses an error-only guard MUST NEVER crash as undefined content filter. HT-BUG-8"
  classification: LOGIC
  severity: CRIT
  example POS: src/audit-engine/harness/pi-shadow-agent.ts chain SKIP all rungs admission-denied falls through to degenerate stream then message.content.filter crashes — BECAUSE guard only checked stopReason error or aborted so empty success shape slipped through
  example NEG: pi-shadow-agent DONE VERIFIER detecting done without content array and throwing SHADOW_DEGENERATE_DONE to next rung — BECAUSE chain-exhausted is handled as named loud fail with stopReason error and content empty array

## CARD-07 coverage-blind-done — HT-BUG-16 (done+0 with zero compiled cards)

- anchor: src/subagents/trident-bug-hunter/harness/micro-loop-machine.ts:310
  quote: "A hunt that compiled zero rule cards or scanned zero methods is INCONCLUSIVE — it MUST NEVER emit done with zero findings on a non-trivial target. HT-BUG-16"
  classification: PROCESS
  severity: CRIT
  example POS: MASTER_CONTEXT/bug_hunter_report_v1.md state done with zero findings on 330 files 17500 methods and corpus compiled zero cards — BECAUSE empty battery produced zero findings by construction and machine accepted it as clean
  example NEG: src/subagents/trident-bug-hunter/harness/micro-loop-machine.ts:310 HUNT_NO_COVERAGE loud fail when rulesCompiled equals zero — BECAUSE coverage gate extends hunting-substance check to battery layer

## CARD-08 thinking-leak-seal — HT-BUG-19 (deliberation inside artifacts)

- anchor: src/subagents/trident-bug-hunter/harness/report.ts:1
  quote: "A generated report MUST NOT contain the writer meta-commentary or deliberation stream — the artifact MUST open with the report title and carry only grounded content. HT-BUG-19"
  classification: PROCESS
  severity: HIGH
  example POS: MASTER_CONTEXT/bug_hunter_report_v1.md contains verbatim The user is asking me to produce and Hmm deliberation prose sealed as official report — BECAUSE report-writer prompt lacked strip-thinking postprocess that parseProbeResult had
  example NEG: src/subagents/trident-bug-hunter/harness/report.ts strip before seal removing think blocks and meta-preamble up to first mandated section header — BECAUSE artifact starts with report title and holds only grounded sections

## CARD-09 unbounded-directory-scan — HT-BUG-20 (walkers missing excludes)

- anchor: src/poseidon/god-loop.ts:120
  quote: "Directory walkers MUST exclude Checkpoints and .trident and corbell-data and Context_Management — scanning 7287 files including every checkpoint snapshot MUST NEVER happen. HT-BUG-20"
  classification: PROCESS
  severity: CRIT
  example POS: src/poseidon/god-loop.ts:120 scanTsFiles excludes only node_modules .git dist and walks 7287 files across 20 checkpoints — BECAUSE EXCLUDED_DIRS set was missing as single scope truth for INIT and AUDIT scans
  example NEG: src/poseidon/god-loop.ts with EXCLUDED_DIRS covering Checkpoints .trident GENERATED_ARTIFACTS and scope limited to src — BECAUSE INIT validates about 330 files as expected

## CARD-10 diagnostics-jailing-enforcement — HT-BUG-21 (phase allowlists without diagnostic exemptions)

- anchor: src/hooks/poseidon-enforcer-hook.ts:85
  quote: "Phase allowlists MUST exempt diagnostic reads and the loop own audit machinery — enforcement that blocks read grep glob during AUDIT is anti-debugging. HT-BUG-21"
  classification: PROCESS
  severity: CRIT
  example POS: src/hooks/poseidon-enforcer-hook.ts:85 PHASE_REQUIRED_TOOLS allowlist for AUDIT contains only trident-poseidon so read grep diagnostics are blocked — BECAUSE driver cannot read source to fix anything while corpse-phase remains bound
  example NEG: src/hooks/poseidon-enforcer-hook.ts DIAGNOSTIC_TOOLS exemption letting read grep glob ride free in every phase before off-track verdict — BECAUSE writes edits bash remain phase-gated while reads stay consistently available

## CARD-11 firewall-demands-blocked-writes — HT-BUG-22 (gates gating files enforcer demands)

- anchor: src/hooks/trident-hooks.ts:2584
  quote: "Model-boundary artifacts MUST ride free through the state firewall — the firewall MUST NEVER gate .trident/god-loop/problem-solve or decide or plan or wave artifacts the enforcer itself demands. HT-BUG-22"
  classification: PROCESS
  severity: CRIT
  example POS: src/hooks/trident-hooks.ts:2584 state firewall regex gating all of .trident/god-loop prevents writing problem-solve-0.md that enforcer demanded — BECAUSE directory match blocked model boundary artifact and created deadlock
  example NEG: src/hooks/trident-hooks.ts narrowed firewall to .trident/god-loop/state.json dollar anchor plus poseidon-state — BECAUSE model-boundary artifacts write successfully while state.json remains integrity-locked
