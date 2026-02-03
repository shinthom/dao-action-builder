import type { PredefinedMethod } from '../../types';
import { predefinedMethodRegistry } from '../index';

// Import all Tokamak methods
import { tonMethods } from './ton';
import { wtonMethods } from './wton';
import { depositManagerMethods } from './deposit-manager';
import { l1BridgeRegistryMethods } from './l1-bridge-registry';
import { layer2ManagerMethods } from './layer2-manager';
import { daoCommitteeMethods } from './dao-committee';
import { daoAgendaManagerMethods } from './dao-agenda-manager';
import { daoVaultMethods } from './dao-vault';
import { layer2RegistryMethods } from './layer2-registry';

// Export individual methods
export { tonMethods } from './ton';
export { wtonMethods } from './wton';
export { depositManagerMethods } from './deposit-manager';
export { l1BridgeRegistryMethods } from './l1-bridge-registry';
export { layer2ManagerMethods } from './layer2-manager';
export { daoCommitteeMethods } from './dao-committee';
export { daoAgendaManagerMethods } from './dao-agenda-manager';
export { daoVaultMethods } from './dao-vault';
export { layer2RegistryMethods } from './layer2-registry';

/**
 * All Tokamak predefined methods
 */
export const tokamakMethods: PredefinedMethod[] = [
  tonMethods,
  wtonMethods,
  depositManagerMethods,
  l1BridgeRegistryMethods,
  layer2ManagerMethods,
  daoCommitteeMethods,
  daoAgendaManagerMethods,
  daoVaultMethods,
  layer2RegistryMethods,
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
