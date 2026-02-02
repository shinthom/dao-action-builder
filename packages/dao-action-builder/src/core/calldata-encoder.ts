import { Interface } from 'ethers';
import type {
  AbiFunction,
  EncodeCalldataResult,
  ParameterValue,
  Result,
} from '../types';
import { ActionBuilderError, ActionBuilderErrorCode } from '../types';
import { prepareParametersForEncoding } from '../validation/normalizers';
import { getFunctionSignature, findFunctionBySignature } from './abi-utils';

/**
 * Encode calldata for a function call
 */
export function encodeCalldata(options: {
  abi: AbiFunction[];
  functionSignature: string;
  parameters: { [key: string]: string | ParameterValue };
}): Result<EncodeCalldataResult, ActionBuilderError> {
  const { abi, functionSignature, parameters } = options;

  // Find the function
  const func = findFunctionBySignature(functionSignature, abi);

  if (!func) {
    return {
      success: false,
      error: new ActionBuilderError(
        `Function not found: ${functionSignature}`,
        ActionBuilderErrorCode.FUNCTION_NOT_FOUND
      ),
    };
  }

  try {
    // Prepare parameters for encoding
    const encodedParams = prepareParametersForEncoding(parameters, func.inputs);

    // Create interface and encode
    const iface = new Interface([func]);
    const calldata = iface.encodeFunctionData(func.name, encodedParams);

    return {
      success: true,
      data: {
        calldata,
        functionSignature: getFunctionSignature(func),
      },
    };
  } catch (e) {
    return {
      success: false,
      error: new ActionBuilderError(
        `Failed to encode calldata: ${e instanceof Error ? e.message : 'Unknown error'}`,
        ActionBuilderErrorCode.ENCODING_FAILED,
        e
      ),
    };
  }
}

/**
 * Encode calldata by function name (uses first matching overload)
 */
export function encodeCalldataByName(options: {
  abi: AbiFunction[];
  functionName: string;
  parameters: ParameterValue[];
}): Result<EncodeCalldataResult, ActionBuilderError> {
  const { abi, functionName, parameters } = options;

  // Find matching functions
  const matchingFuncs = abi.filter((fn) => fn.name === functionName);

  if (matchingFuncs.length === 0) {
    return {
      success: false,
      error: new ActionBuilderError(
        `Function not found: ${functionName}`,
        ActionBuilderErrorCode.FUNCTION_NOT_FOUND
      ),
    };
  }

  // Find the function with matching parameter count
  const func = matchingFuncs.find((fn) => fn.inputs.length === parameters.length);

  if (!func) {
    return {
      success: false,
      error: new ActionBuilderError(
        `No overload of ${functionName} matches ${parameters.length} parameters`,
        ActionBuilderErrorCode.FUNCTION_NOT_FOUND
      ),
    };
  }

  try {
    const iface = new Interface([func]);
    const calldata = iface.encodeFunctionData(func.name, parameters);

    return {
      success: true,
      data: {
        calldata,
        functionSignature: getFunctionSignature(func),
      },
    };
  } catch (e) {
    return {
      success: false,
      error: new ActionBuilderError(
        `Failed to encode calldata: ${e instanceof Error ? e.message : 'Unknown error'}`,
        ActionBuilderErrorCode.ENCODING_FAILED,
        e
      ),
    };
  }
}

/**
 * Validate that all required parameters are provided for a function
 */
export function validateFunctionParameters(
  func: AbiFunction,
  parameters: { [key: string]: string | ParameterValue }
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const input of func.inputs) {
    if (parameters[input.name] === undefined) {
      missing.push(input.name);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
