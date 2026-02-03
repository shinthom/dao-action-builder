import type {
  Action,
  AbiFunction,
  BuildActionInput,
  Result,
} from '../types';
import { ActionBuilderError, ActionBuilderErrorCode } from '../types';
import {
  isValidAddress,
  findFunctionBySignature,
} from './abi-utils';
import { encodeCalldata } from './calldata-encoder';
import { validateParameterType } from '../validation/validators';

/**
 * Build an action from the provided input
 */
export function buildAction(
  input: BuildActionInput
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
  const func = findFunctionBySignature(input.functionSignature, input.abi);

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
    abi: input.abi,
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
