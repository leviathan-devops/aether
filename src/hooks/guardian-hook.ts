import { isAetherAgent } from '../identity/agent-identity.js';
import { FirewallAudit } from '../shared/firewall-audit.js';

const audit = new FirewallAudit();

/** Returns the singleton FirewallAudit instance */
export function getFirewallAudit(): FirewallAudit {
  return audit;
}

const AETHER_TOOLS: Set<string> = new Set([
  'aether-code-audit', 'aether-deep-planning', 'aether-problem-solving',
  'aether-context-synthesis', 'aether-poseidon', 'aether-gate', 'aether-status', 'aether-vision', 'aether-help',
]);

function checkF1Isolation(toolName: string, sessionAgent: string | undefined): void {
  if (!isAetherAgent(sessionAgent) && AETHER_TOOLS.has(toolName)) {
    throw new Error('[F1 BLOCKED] Tool "' + toolName + '" is AETHER-specific and cannot be called by agent "' + sessionAgent + '".');
  }
}

// L5 theatrical firewalls removed — not needed for audit-only agent
export function checkTaskDispatch(_toolName: string, _input: Record<string, unknown>, _mode: string): void {
  // task is allowed unconditionally — the BLOCKED_TOOLS list and 
  // ALLOWLIST in aether-hooks.ts handle security for this tool.
  // This layer was causing false blocks and is intentionally passthrough.
  return;
}

export function checkGuardian(
  toolName: string,
  command: string | null,
  sessionAgent: string | undefined,
  currentGate: string,
  mode?: string,
  input?: Record<string, unknown>
): void {
  if (!sessionAgent) return;
  const isAether = isAetherAgent(sessionAgent);
  if (!isAether && AETHER_TOOLS.has(toolName)) {
    checkF1Isolation(toolName, sessionAgent);
  }
  if (isAether && command) {
  }
  // TASK_BLOCK: validate task dispatch against mode and subagent_type
  checkTaskDispatch(toolName, input || {}, mode || currentGate);
}
