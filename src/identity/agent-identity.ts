const VANILLA_AGENTS = new Set(['plan', 'build', 'general', 'explore']);
const AETHER_AGENTS = new Set(['aether']);
const AETHER_PREFIX = 'aether_';
const AETHER_HYBRID_PREFIX = 'aether-';

export function isAetherAgent(agentName: string | undefined): boolean {
  if (!agentName) return false;
  if (AETHER_AGENTS.has(agentName)) return true;
  if (agentName.startsWith(AETHER_PREFIX)) return true;
  if (agentName.startsWith(AETHER_HYBRID_PREFIX)) return true;
  return false;
}

export function isAetherBuildAgent(agentName: string | undefined): boolean {
  if (!agentName) return false;
  var lower = agentName.toLowerCase();
  return lower === 'aether_build' || lower === 'aether-build';
}

export function isVanillaAgent(agentName: string | undefined): boolean {
  return VANILLA_AGENTS.has(agentName ?? '');
}

export function isOtherPluginAgent(agentName: string | undefined): boolean {
  if (!agentName) return false;
  return !VANILLA_AGENTS.has(agentName) && !isAetherAgent(agentName);
}
