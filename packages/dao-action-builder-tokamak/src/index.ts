import type { PredefinedMethod } from '@tokamak-network/dao-action-builder';
import { predefinedMethodRegistry } from '@tokamak-network/dao-action-builder';

// Import all Tokamak methods
import { tonMethods } from './methods/ton';
import { wtonMethods } from './methods/wton';
import { depositManagerMethods } from './methods/deposit-manager';
import { seigManagerMethods } from './methods/seig-manager';
import { l1BridgeRegistryMethods } from './methods/l1-bridge-registry';
import { layer2ManagerMethods } from './methods/layer2-manager';

// Export individual methods
export { tonMethods } from './methods/ton';
export { wtonMethods } from './methods/wton';
export { depositManagerMethods } from './methods/deposit-manager';
export { seigManagerMethods } from './methods/seig-manager';
export { l1BridgeRegistryMethods } from './methods/l1-bridge-registry';
export { layer2ManagerMethods } from './methods/layer2-manager';

/**
 * All Tokamak predefined methods
 */
export const tokamakMethods: PredefinedMethod[] = [
  tonMethods,
  wtonMethods,
  depositManagerMethods,
  seigManagerMethods,
  l1BridgeRegistryMethods,
  layer2ManagerMethods,
];

/**
 * Register all Tokamak methods with the global registry
 */
export function registerTokamakMethods(): void {
  predefinedMethodRegistry.registerAll(tokamakMethods);
}

/**
 * Get all Tokamak predefined methods
 */
export function getTokamakMethods(): PredefinedMethod[] {
  return tokamakMethods;
}
