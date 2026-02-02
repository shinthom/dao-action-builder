import { ethers, JsonRpcProvider } from 'ethers';
import type {
  ActionBuilderConfig,
  AbiFunction,
  EtherscanResponse,
  LoadAbiResult,
  Result,
} from '../types';
import { ActionBuilderError, ActionBuilderErrorCode } from '../types';

const EIP1967_IMPLEMENTATION_SLOT =
  '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Check if an address is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
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
 * Fetch ABI from Etherscan API
 */
async function fetchAbiFromEtherscan(
  address: string,
  config: ActionBuilderConfig
): Promise<Result<unknown[], ActionBuilderError>> {
  const { apiKey, apiUrl, chainId } = config.etherscan;
  const baseUrl = apiUrl || 'https://api.etherscan.io/api';

  const url = `${baseUrl}?chainid=${chainId}&module=contract&action=getabi&address=${address}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: new ActionBuilderError(
          `HTTP error: ${response.status}`,
          ActionBuilderErrorCode.NETWORK_ERROR
        ),
      };
    }

    const data: EtherscanResponse = await response.json();

    if (data.message?.includes('Invalid API Key')) {
      return {
        success: false,
        error: new ActionBuilderError(
          'Invalid Etherscan API key',
          ActionBuilderErrorCode.INVALID_API_KEY
        ),
      };
    }

    if (data.status === '1' || data.status === 1) {
      try {
        const abi = JSON.parse(data.result);
        return { success: true, data: abi };
      } catch {
        return {
          success: false,
          error: new ActionBuilderError(
            'Failed to parse ABI JSON',
            ActionBuilderErrorCode.ABI_FETCH_FAILED
          ),
        };
      }
    }

    // Handle deprecated API message
    let errorMessage = data.message || 'Failed to fetch contract ABI';
    if (errorMessage.includes('deprecated') || errorMessage.includes('V1 endpoint')) {
      errorMessage = 'Etherscan API V1 is deprecated. Please use the V2 API.';
    }

    return {
      success: false,
      error: new ActionBuilderError(
        `${errorMessage}: ${data.result || ''}`,
        ActionBuilderErrorCode.CONTRACT_NOT_FOUND
      ),
    };
  } catch (e) {
    return {
      success: false,
      error: new ActionBuilderError(
        `Network error: ${e instanceof Error ? e.message : 'Unknown error'}`,
        ActionBuilderErrorCode.NETWORK_ERROR,
        e
      ),
    };
  }
}

/**
 * Detect proxy implementation address using various methods
 */
async function detectProxyImplementation(
  proxyAddress: string,
  abi: unknown[],
  config: ActionBuilderConfig
): Promise<string | null> {
  if (!config.rpc?.url) {
    return null;
  }

  try {
    const provider = new JsonRpcProvider(config.rpc.url);
    const contract = new ethers.Contract(proxyAddress, abi as ethers.InterfaceAbi, provider);

    // Check for implementation() function
    const implementationFn = abi.find(
      (item): item is { name: string; inputs: unknown[] } =>
        typeof item === 'object' &&
        item !== null &&
        (item as { type?: string }).type === 'function' &&
        (item as { name?: string }).name === 'implementation' &&
        Array.isArray((item as { inputs?: unknown[] }).inputs) &&
        (item as { inputs: unknown[] }).inputs.length === 0
    );

    if (implementationFn) {
      const impl = await contract.implementation();
      if (impl && impl !== ZERO_ADDRESS) {
        return impl;
      }
    }

    // Check for getImplementation() function
    const getImplementationFn = abi.find(
      (item): item is { name: string; inputs: unknown[] } =>
        typeof item === 'object' &&
        item !== null &&
        (item as { type?: string }).type === 'function' &&
        (item as { name?: string }).name === 'getImplementation' &&
        Array.isArray((item as { inputs?: unknown[] }).inputs) &&
        (item as { inputs: unknown[] }).inputs.length === 0
    );

    if (getImplementationFn) {
      const impl = await contract.getImplementation();
      if (impl && impl !== ZERO_ADDRESS) {
        return impl;
      }
    }

    // Check for logic() function
    const logicFn = abi.find(
      (item): item is { name: string; inputs: unknown[] } =>
        typeof item === 'object' &&
        item !== null &&
        (item as { type?: string }).type === 'function' &&
        (item as { name?: string }).name === 'logic' &&
        Array.isArray((item as { inputs?: unknown[] }).inputs) &&
        (item as { inputs: unknown[] }).inputs.length === 0
    );

    if (logicFn) {
      const impl = await contract.logic();
      if (impl && impl !== ZERO_ADDRESS) {
        return impl;
      }
    }

    // Try EIP-1967 storage slot
    const storageValue = await provider.getStorage(proxyAddress, EIP1967_IMPLEMENTATION_SLOT);
    if (
      storageValue &&
      storageValue !== '0x0000000000000000000000000000000000000000000000000000000000000000'
    ) {
      const impl = '0x' + storageValue.slice(-40);
      if (impl !== ZERO_ADDRESS) {
        return impl;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Load ABI for a contract address, automatically detecting proxy patterns
 */
export async function loadAbi(
  address: string,
  config: ActionBuilderConfig
): Promise<Result<LoadAbiResult, ActionBuilderError>> {
  // Validate address
  if (!isValidAddress(address)) {
    return {
      success: false,
      error: new ActionBuilderError(
        'Invalid Ethereum address',
        ActionBuilderErrorCode.INVALID_ADDRESS
      ),
    };
  }

  // Fetch proxy/main contract ABI
  const proxyResult = await fetchAbiFromEtherscan(address, config);

  if (!proxyResult.success) {
    return proxyResult;
  }

  const proxyAbi = filterStateChangingFunctions(proxyResult.data);

  // Try to detect implementation address
  const implementationAddress = await detectProxyImplementation(
    address,
    proxyResult.data,
    config
  );

  if (!implementationAddress) {
    return {
      success: true,
      data: {
        proxyAbi,
        logicAbi: [],
        isProxy: false,
      },
    };
  }

  // Fetch implementation ABI
  const logicResult = await fetchAbiFromEtherscan(implementationAddress, config);

  if (!logicResult.success) {
    // Return proxy ABI even if we can't fetch implementation
    return {
      success: true,
      data: {
        proxyAbi,
        logicAbi: [],
        implementationAddress,
        isProxy: true,
      },
    };
  }

  const logicAbi = filterStateChangingFunctions(logicResult.data);

  return {
    success: true,
    data: {
      proxyAbi,
      logicAbi,
      implementationAddress,
      isProxy: true,
    },
  };
}

/**
 * Get all available functions from loaded ABIs
 */
export function getAvailableFunctions(abiResult: LoadAbiResult): AbiFunction[] {
  const functions = new Map<string, AbiFunction>();

  // Add logic ABI functions first (if proxy)
  for (const fn of abiResult.logicAbi) {
    const signature = getFunctionSignature(fn);
    functions.set(signature, fn);
  }

  // Add proxy ABI functions (may override logic functions)
  for (const fn of abiResult.proxyAbi) {
    const signature = getFunctionSignature(fn);
    functions.set(signature, fn);
  }

  return Array.from(functions.values());
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
