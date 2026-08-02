import { AJNA_CONFIG } from '../../src/lib/ajnaConfig.js';

export interface ResolvedOriginalSupply {
  deploymentBlock: number;
  deploymentTimestamp: number;
  originalSupplyRaw: bigint;
  supplySource: 'protocol-launch-baseline';
}

export function resolveOriginalSupply(): ResolvedOriginalSupply {
  return {
    deploymentBlock: AJNA_CONFIG.deploymentBlock,
    deploymentTimestamp: AJNA_CONFIG.deploymentTimestamp,
    originalSupplyRaw: BigInt(AJNA_CONFIG.launchSupplyRaw),
    supplySource: 'protocol-launch-baseline',
  };
}

