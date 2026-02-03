import type { AbiFunction } from '../types';

// Cached regex patterns for performance
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Check if an address is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ADDRESS_REGEX.test(address);
}

/**
 * Filter ABI to only include non-view/pure functions
 */
export function filterStateChangingFunctions(abi: unknown[]): AbiFunction[] {
  return abi.filter(
    (item): item is AbiFunction =>
      typeof item === 'object' &&
      item !== null &&
      (item as { type?: string }).type === 'function' &&
      (item as { stateMutability?: string }).stateMutability !== 'view' &&
      (item as { stateMutability?: string }).stateMutability !== 'pure'
  );
}

/**
 * Generate function signature from ABI function
 */
export function getFunctionSignature(fn: AbiFunction): string {
  const paramTypes = fn.inputs.map((input) => input.type).join(',');
  return `${fn.name}(${paramTypes})`;
}

/**
 * Find a function in the ABI by its signature
 */
export function findFunctionBySignature(
  signature: string,
  abi: AbiFunction[]
): AbiFunction | undefined {
  return abi.find((fn) => getFunctionSignature(fn) === signature);
}

/**
 * Find a function in the ABI by name only (for cases with overloaded functions)
 * Returns all matches if multiple overloads exist
 */
export function findFunctionsByName(name: string, abi: AbiFunction[]): AbiFunction[] {
  return abi.filter((fn) => fn.name === name);
}
