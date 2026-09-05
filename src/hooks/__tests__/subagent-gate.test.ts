// src/hooks/__tests__/subagent-gate.test.ts
// THE SUBAGENT-TYPE GATE BATTERY (2026-08-13 — the operator's directive: "ensure
// only auditor is poseidon gated and bug worker is still available when poseidon
// is off — same scope as explore/build subagent gating between aether-worker/auditor").
//
// THE CONTRACT: the machine's execution surface maps onto the EXISTING two-class
// gate — aether_aether_worker = the READ-ONLY research class (always allowed, like
// aether_explore — the BASH_LOCKDOWN + REPORT_SCOPE enforce read-only by
// mechanism); aether_auditor = the FIX-SCOPED execution class (Poseidon-gated,
// like aether_build — the FIX_SCOPE locks its writes). The battery extracts the
// gate's type-classification from the source so the classification is TESTED, not
// assumed (the source is the ground truth for the gate's wiring).

import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const hooksPath = path.resolve(__dirname, '..', 'aether-hooks.ts');
const hooksSrc = fs.readFileSync(hooksPath, 'utf8');

/** THE GATE'S CLASSIFICATION — the two branches of the type check. */
const ALWAYS_ALLOWED = ['aether_explore', 'aether_aether_worker'];
const POSEIDON_GATED = ['aether_build', 'aether_auditor'];

describe('THE SUBAGENT-TYPE GATE (the operator\'s explore/build parity for the machine surface)', () => {
  it('the source classifies the worker with explore — the always-allowed branch', () => {
    for (const t of ALWAYS_ALLOWED) {
      expect(hooksSrc).toContain(`subagentType === '${t}'`);
    }
    // the always-allowed branch has NO poseidonState reference inside it
    const alwaysBranch = hooksSrc.slice(hooksSrc.indexOf('if (subagentType === \'aether_explore\''), hooksSrc.indexOf('} else if (subagentType === \'aether_build\''));
    expect(alwaysBranch).toContain('aether_aether_worker');
    expect(alwaysBranch).not.toContain('poseidonState');
  });

  it('the source classifies the auditor with build — the POSEIDON-GATED branch', () => {
    for (const t of POSEIDON_GATED) {
      expect(hooksSrc).toContain(`subagentType === '${t}'`);
    }
    const gatedBranch = hooksSrc.slice(hooksSrc.indexOf('} else if (subagentType === \'aether_build\''), hooksSrc.indexOf('// TASK SUBAGENT GATE'));
    expect(gatedBranch).toContain('aether_auditor');
    expect(gatedBranch).toContain('poseidonState.isActive');
  });

  it('the gate throws the POSEIDON GATE for the gated class when Poseidon is off (the code path)', () => {
    expect(hooksSrc).toContain('[AETHER POSEIDON GATE]');
    // the auditor + the build share the SAME gate message (the operator's parity)
    expect(hooksSrc).toContain('aether_build/aether_auditor requires Poseidon Mode to be active');
  });

  it('the worker is NOT in the Poseidon-gated branch — available when Poseidon is off (the operator\'s directive)', () => {
    const gatedBranch = hooksSrc.slice(hooksSrc.indexOf('} else if (subagentType === \'aether_build\''), hooksSrc.indexOf('// TASK SUBAGENT GATE'));
    expect(gatedBranch).not.toContain('aether_aether_worker');
    // the always branch carries the worker with NO gate
    const alwaysBranch = hooksSrc.slice(hooksSrc.indexOf('if (subagentType === \'aether_explore\''), hooksSrc.indexOf('} else if (subagentType === \'aether_build\''));
    expect(alwaysBranch).toContain('aether_aether_worker');
    expect(alwaysBranch).not.toContain('poseidonState');
  });
});
