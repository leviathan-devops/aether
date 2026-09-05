// Aether_Build agent identity detection
var BUILD_AGENT_NAMES = new Set(['aether_build', 'aether-build']);

export function isAetherBuildAgent(agentName: string | undefined): boolean {
  if (!agentName) return false;
  return BUILD_AGENT_NAMES.has(agentName.toLowerCase());
}

export function getBuildAgentDisplayName(): string {
  return 'Aether_Build';
}
