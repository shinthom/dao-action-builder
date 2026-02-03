import type { AbiFunction, PredefinedMethod } from '../types';
import { erc20Methods } from './erc20';
import { erc721Methods } from './erc721';
import { erc1155Methods } from './erc1155';
import { ownableMethods } from './ownable';
import { accessControlMethods } from './access-control';
import { pausableMethods } from './pausable';
import { governorMethods } from './governor';
import { uupsMethods } from './uups';
import { tokamakMethods } from './tokamak';

/**
 * Registry for predefined contract methods
 */
export class PredefinedMethodRegistry {
  private methods: Map<string, PredefinedMethod> = new Map();

  constructor() {
    // Register built-in methods
    this.registerBuiltIn();
  }

  private registerBuiltIn(): void {
    const builtInMethods: PredefinedMethod[] = [
      erc20Methods,
      erc721Methods,
      erc1155Methods,
      ownableMethods,
      accessControlMethods,
      pausableMethods,
      governorMethods,
      uupsMethods,
      ...tokamakMethods,
    ];

    for (const method of builtInMethods) {
      this.register(method);
    }
  }

  /**
   * Register a predefined method
   */
  register(method: PredefinedMethod): void {
    this.methods.set(method.id, method);
  }

  /**
   * Register multiple predefined methods
   */
  registerAll(methods: PredefinedMethod[]): void {
    for (const method of methods) {
      this.register(method);
    }
  }

  /**
   * Get a predefined method by ID
   */
  get(id: string): PredefinedMethod | undefined {
    return this.methods.get(id);
  }

  /**
   * Get all registered predefined methods
   */
  getAll(): PredefinedMethod[] {
    return Array.from(this.methods.values());
  }

  /**
   * Get ABI functions from a predefined method
   */
  getAbi(id: string): AbiFunction[] {
    const method = this.methods.get(id);
    return method?.abi ?? [];
  }

  /**
   * Check if a method is registered
   */
  has(id: string): boolean {
    return this.methods.has(id);
  }

  /**
   * Remove a predefined method
   */
  remove(id: string): boolean {
    return this.methods.delete(id);
  }

  /**
   * Clear all registered methods
   */
  clear(): void {
    this.methods.clear();
  }

  /**
   * Reset to built-in methods only
   */
  reset(): void {
    this.clear();
    this.registerBuiltIn();
  }
}

// Default registry instance
export const predefinedMethodRegistry = new PredefinedMethodRegistry();

// Re-export individual method collections
export { erc20Methods } from './erc20';
export { erc721Methods } from './erc721';
export { erc1155Methods } from './erc1155';
export { ownableMethods } from './ownable';
export { accessControlMethods } from './access-control';
export { pausableMethods } from './pausable';
export { governorMethods } from './governor';
export { uupsMethods } from './uups';

// Tokamak Network methods
export {
  tokamakMethods,
  tonMethods,
  wtonMethods,
  depositManagerMethods,
  l1BridgeRegistryMethods,
  layer2ManagerMethods,
  daoCommitteeMethods,
  daoAgendaManagerMethods,
  daoVaultMethods,
  layer2RegistryMethods,
} from './tokamak';
