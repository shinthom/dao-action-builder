import { Interface } from 'ethers';
import type { AbiFunction, DecodeCalldataResult, ParameterValue, Result } from '../types';
import { ActionBuilderError, ActionBuilderErrorCode } from '../types';
import { denormalizeParameterValue } from '../validation/normalizers';
import { getFunctionSignature } from './abi-loader';

/**
 * Decode calldata using a known ABI
 */
export function decodeCalldata(
  calldata: string,
  abi: AbiFunction[]
): Result<DecodeCalldataResult, ActionBuilderError> {
  try {
    const iface = new Interface(abi);
    const decoded = iface.parseTransaction({ data: calldata });

    if (!decoded) {
      return {
        success: false,
        error: new ActionBuilderError(
          'Failed to decode calldata - no matching function found',
          ActionBuilderErrorCode.DECODING_FAILED
        ),
      };
    }

    // Find the matching function in the ABI
    const func = abi.find((fn) => fn.name === decoded.name);

    if (!func) {
      return {
        success: false,
        error: new ActionBuilderError(
          `Function ${decoded.name} not found in ABI`,
          ActionBuilderErrorCode.FUNCTION_NOT_FOUND
        ),
      };
    }

    // Build parameters object
    const parameters: { [key: string]: ParameterValue } = {};
    const parameterTypes: string[] = [];

    for (let i = 0; i < func.inputs.length; i++) {
      const input = func.inputs[i];
      const paramName = input.name || `param${i}`;
      const value = decoded.args[i];

      parameters[paramName] = denormalizeParameterValue(
        value,
        input.type,
        input.components
      );
      parameterTypes.push(input.type);
    }

    return {
      success: true,
      data: {
        functionName: decoded.name,
        functionSignature: getFunctionSignature(func),
        parameters,
        parameterTypes,
      },
    };
  } catch (e) {
    return {
      success: false,
      error: new ActionBuilderError(
        `Failed to decode calldata: ${e instanceof Error ? e.message : 'Unknown error'}`,
        ActionBuilderErrorCode.DECODING_FAILED,
        e
      ),
    };
  }
}

/**
 * Decode calldata using a function signature (without full ABI)
 * Useful when you only know the function signature but not the full ABI
 */
export function decodeCalldataBySignature(
  calldata: string,
  functionSignature: string
): Result<DecodeCalldataResult, ActionBuilderError> {
  try {
    // Parse function signature
    const match = functionSignature.match(/^(.+)\((.*)\)$/);
    if (!match) {
      return {
        success: false,
        error: new ActionBuilderError(
          `Invalid function signature: ${functionSignature}`,
          ActionBuilderErrorCode.DECODING_FAILED
        ),
      };
    }

    const [, funcName, paramTypesStr] = match;
    const paramTypes = paramTypesStr ? paramTypesStr.split(',').map((t) => t.trim()) : [];

    // Create minimal ABI
    const minimalAbi: AbiFunction[] = [
      {
        type: 'function',
        name: funcName,
        inputs: paramTypes.map((type, index) => ({
          name: `param${index}`,
          type,
        })),
        stateMutability: 'nonpayable',
      },
    ];

    const iface = new Interface(minimalAbi);
    const decoded = iface.parseTransaction({ data: calldata });

    if (!decoded) {
      return {
        success: false,
        error: new ActionBuilderError(
          'Failed to decode calldata',
          ActionBuilderErrorCode.DECODING_FAILED
        ),
      };
    }

    const parameters: { [key: string]: ParameterValue } = {};

    for (let i = 0; i < paramTypes.length; i++) {
      const paramName = `param${i}`;
      const value = decoded.args[i];
      parameters[paramName] = denormalizeParameterValue(value, paramTypes[i]);
    }

    return {
      success: true,
      data: {
        functionName: funcName,
        functionSignature,
        parameters,
        parameterTypes: paramTypes,
      },
    };
  } catch (e) {
    return {
      success: false,
      error: new ActionBuilderError(
        `Failed to decode calldata: ${e instanceof Error ? e.message : 'Unknown error'}`,
        ActionBuilderErrorCode.DECODING_FAILED,
        e
      ),
    };
  }
}

/**
 * Try to decode calldata by matching against multiple ABIs
 */
export function tryDecodeCalldata(
  calldata: string,
  abis: AbiFunction[][]
): Result<DecodeCalldataResult, ActionBuilderError> {
  // Combine all ABIs
  const combinedAbi: AbiFunction[] = [];
  const seenSignatures = new Set<string>();

  for (const abi of abis) {
    for (const func of abi) {
      const sig = getFunctionSignature(func);
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        combinedAbi.push(func);
      }
    }
  }

  return decodeCalldata(calldata, combinedAbi);
}

/**
 * Format decoded parameters for display
 */
export function formatDecodedParameters(
  decoded: DecodeCalldataResult
): string {
  const formatted = Object.entries(decoded.parameters)
    .map(([name, value], index) => {
      const type = decoded.parameterTypes[index] || 'unknown';
      return `${type}: ${value}`;
    })
    .join(', ');

  return formatted;
}
