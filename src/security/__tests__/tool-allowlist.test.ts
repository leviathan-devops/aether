// src/security/__tests__/tool-allowlist.test.ts
// THE TOOL-ALLOWLIST BATTERY (2026-08-13 — the S6 runtime gap regression): the
// machine's auditor write surface ('fix-apply' + 'build-done') is REGISTERED as
// bare-name tools (aether-tools.ts:2773/2774) — the 'aether-' prefix rule does
// NOT cover them, and without explicit admission the platform DENIED the
// auditor's own fix path at runtime (the S6 loop's fix half could not land).
// This battery locks the admission + the full machine surface.

import { describe, it, expect } from 'bun:test';
import {isToolAllowed, ALLOWED_TOOLS} from '../tool-allowlist.ts';

describe('THE TOOL ALLOWLIST — the machine surface (the S6 regression)', () => {
  it('admits the auditor write tools (fix-apply + build-done) — the 2026-08-13 S6 runtime gap', () => {
    // the REGISTERED prefixed names (aether-tools.ts:2777/2787 — the 2026-08-18
    // W1 prefix rename, spec §3.9) must be admitted explicitly — the bare-name
    // forms are GONE (the 'aether-' prefix rule does NOT cover the auditor's
    // write tools' specific admission unit)
    expect(isToolAllowed('aether-auditor-fix-apply')).toBe(true);
    expect(isToolAllowed('aether-auditor-build-done')).toBe(true);
    expect(ALLOWED_TOOLS.has('aether-auditor-fix-apply')).toBe(true);
    expect(ALLOWED_TOOLS.has('aether-auditor-build-done')).toBe(true);
    // the OLD bare names are DEAD after the W1 prefix rename — they must NOT
    // resolve (the closed-set denial proves the rename actually landed)
    expect(isToolAllowed('fix-apply')).toBe(false);
    expect(isToolAllowed('build-done')).toBe(false);
  });

  it('admits the full aether-worker machine surface (the W7 registration unit)', () => {
    expect(isToolAllowed('aether-worker-harness-hunt')).toBe(true);
    expect(isToolAllowed('aether-worker-harness-query')).toBe(true);
    expect(isToolAllowed('aether-auditor-audit')).toBe(true);
    // the old bare name is DEAD after the W1 prefix rename
    expect(isToolAllowed('bug-hunt')).toBe(false);
  });

  it('admits aether-graph-logic as the primary Graph Logic tool (Wave T — D-20260830-11); the old alias simply does not exist', () => {
    expect(isToolAllowed('aether-graph-logic')).toBe(true);
    expect(isToolAllowed('aether-worker-harness-hunt')).toBe(true);
    // first-class equality: aether-graph-logic and aether-worker-harness-hunt share the same handler (createBugHuntTool)
    expect(isToolAllowed('aether-graph-logic')).toBe(isToolAllowed('aether-worker-harness-hunt'));
    expect(ALLOWED_TOOLS.has('aether-graph-logic')).toBe(true);
    expect(ALLOWED_TOOLS.has('aether-worker-harness-hunt')).toBe(true);
    // the removed alias has NO machinery — not registered (aether-tools.ts), not special-cased here.
    // The allowlist is an admission gate for EXISTING tools; a nonexistent name fails at
    // registry resolution (unknown-tool), which is the operator's "remove them so they don't exist".
    expect(ALLOWED_TOOLS.has('aether-logic-audit')).toBe(false);
  });

  it('admits the platform + the external read surface', () => {
    expect(isToolAllowed('aether-status')).toBe(true);
    expect(isToolAllowed('aether-container-test')).toBe(true);
    expect(isToolAllowed('read')).toBe(true);
    expect(isToolAllowed('glob')).toBe(true);
    expect(isToolAllowed('grep')).toBe(true);
    expect(isToolAllowed('task')).toBe(true);
  });

  it('still denies the unknown tools (the allowlist is a closed set)', () => {
    expect(isToolAllowed('totally-unknown-tool')).toBe(false);
    expect(isToolAllowed('')).toBe(false);
  });
});
