import type {
  Action,
  ActionBuilderConfig,
  AbiFunction,
  BuildActionInput,
  LoadAbiResult,
  ParameterValue,
  Result,
} from '../types';
import { ActionBuilderError, ActionBuilderErrorCode } from '../types';
import {
  loadAbi,
  getAvailableFunctions,
  findFunctionBySignature,
  getFunctionSignature,
  isValidAddress,
} from './abi-loader';
import { encodeCalldata } from './calldata-encoder';
import { validateParameterType } from '../validation/validators';

/**
 * Build a single action from the provided input
 */
export async function buildAction(
  input: BuildActionInput,
  config: ActionBuilderConfig
): Promise<Result<Action, ActionBuilderError>> {
  // Validate address
  if (!isValidAddress(input.contractAddress)) {
    return {
      success: false,
      error: new ActionBuilderError(
        'Invalid contract address',
        ActionBuilderErrorCode.INVALID_ADDRESS
      ),
    };
  }

  // Load ABI
  const abiResult = await loadAbi(input.contractAddress, config);

  if (!abiResult.success) {
    return abiResult;
  }

  // Get all available functions
  const allFunctions = getAvailableFunctions(abiResult.data);

  // Find the function
  const func = findFunctionBySignature(input.functionSignature, allFunctions);

  if (!func) {
    return {
      success: false,
      error: new ActionBuilderError(
        `Function not found: ${input.functionSignature}`,
        ActionBuilderErrorCode.FUNCTION_NOT_FOUND
      ),
    };
  }

  // Validate parameters
  for (const inputParam of func.inputs) {
    const value = input.parameters[inputParam.name];
    if (value === undefined) {
      return {
        success: false,
        error: new ActionBuilderError(
          `Missing parameter: ${inputParam.name}`,
          ActionBuilderErrorCode.INVALID_PARAMETER
        ),
      };
    }

    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    const validation = validateParameterType(valueStr, inputParam.type, inputParam.components);

    if (!validation.isValid) {
      return {
        success: false,
        error: new ActionBuilderError(
          `Invalid parameter ${inputParam.name}: ${validation.error}`,
          ActionBuilderErrorCode.INVALID_PARAMETER
        ),
      };
    }
  }

  // Encode calldata
  const encodeResult = encodeCalldata({
    abi: allFunctions,
    functionSignature: input.functionSignature,
    parameters: input.parameters,
  });

  if (!encodeResult.success) {
    return encodeResult;
  }

  // Build action
  const action: Action = {
    contractAddress: input.contractAddress.toLowerCase(),
    functionSignature: encodeResult.data.functionSignature,
    functionName: func.name,
    calldata: encodeResult.data.calldata,
    abi: [func],
    value: input.value,
  };

  return { success: true, data: action };
}

/**
 * Build an action using a predefined method ABI (without loading from Etherscan)
 */
export function buildActionFromPredefined(
  input: BuildActionInput,
  abi: AbiFunction[]
): Result<Action, ActionBuilderError> {
  // Validate address
  if (!isValidAddress(input.contractAddress)) {
    return {
      success: false,
      error: new ActionBuilderError(
        'Invalid contract address',
        ActionBuilderErrorCode.INVALID_ADDRESS
      ),
    };
  }

  // Find the function
  const func = findFunctionBySignature(input.functionSignature, abi);

  if (!func) {
    return {
      success: false,
      error: new ActionBuilderError(
        `Function not found: ${input.functionSignature}`,
        ActionBuilderErrorCode.FUNCTION_NOT_FOUND
      ),
    };
  }

  // Validate parameters
  for (const inputParam of func.inputs) {
    const value = input.parameters[inputParam.name];
    if (value === undefined) {
      return {
        success: false,
        error: new ActionBuilderError(
          `Missing parameter: ${inputParam.name}`,
          ActionBuilderErrorCode.INVALID_PARAMETER
        ),
      };
    }

    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    const validation = validateParameterType(valueStr, inputParam.type, inputParam.components);

    if (!validation.isValid) {
      return {
        success: false,
        error: new ActionBuilderError(
          `Invalid parameter ${inputParam.name}: ${validation.error}`,
          ActionBuilderErrorCode.INVALID_PARAMETER
        ),
      };
    }
  }

  // Encode calldata
  const encodeResult = encodeCalldata({
    abi,
    functionSignature: input.functionSignature,
    parameters: input.parameters,
  });

  if (!encodeResult.success) {
    return encodeResult;
  }

  return {
    success: true,
    data: {
      contractAddress: input.contractAddress.toLowerCase(),
      functionSignature: encodeResult.data.functionSignature,
      functionName: func.name,
      calldata: encodeResult.data.calldata,
      abi: [func],
      value: input.value,
    },
  };
}

/**
 * ActionBuilder class for more complex workflows
 */
export class ActionBuilder {
  private config: ActionBuilderConfig;
  private abiCache: Map<string, LoadAbiResult> = new Map();

  constructor(config: ActionBuilderConfig) {
    this.config = config;
  }

  /**
   * Load ABI for a contract address (with caching)
   */
  async loadContractAbi(address: string): Promise<Result<LoadAbiResult, ActionBuilderError>> {
    const normalizedAddress = address.toLowerCase();

    // Check cache
    if (this.abiCache.has(normalizedAddress)) {
      return { success: true, data: this.abiCache.get(normalizedAddress)! };
    }

    // Load from Etherscan
    const result = await loadAbi(address, this.config);

    if (result.success) {
      this.abiCache.set(normalizedAddress, result.data);
    }

    return result;
  }

  /**
   * Get available functions for a contract
   */
  async getContractFunctions(
    address: string
  ): Promise<Result<AbiFunction[], ActionBuilderError>> {
    const abiResult = await this.loadContractAbi(address);

    if (!abiResult.success) {
      return abiResult;
    }

    return { success: true, data: getAvailableFunctions(abiResult.data) };
  }

  /**
   * Build an action
   */
  async build(input: BuildActionInput): Promise<Result<Action, ActionBuilderError>> {
    return buildAction(input, this.config);
  }

  /**
   * Clear the ABI cache
   */
  clearCache(): void {
    this.abiCache.clear();
  }

  /**
   * Remove a specific address from the cache
   */
  removeFromCache(address: string): void {
    this.abiCache.delete(address.toLowerCase());
  }
}
