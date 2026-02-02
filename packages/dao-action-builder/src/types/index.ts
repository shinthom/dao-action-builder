/**
 * Represents a DAO proposal action
 */
export interface Action {
  contractAddress: string;
  functionSignature: string;
  functionName: string;
  calldata: string;
  abi: AbiFunction[];
  value?: bigint;
}

/**
 * ABI function definition
 */
export interface AbiFunction {
  type: 'function';
  name: string;
  inputs: AbiParameter[];
  outputs?: AbiParameter[];
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
  constant?: boolean;
  payable?: boolean;
}

/**
 * ABI parameter definition
 */
export interface AbiParameter {
  name: string;
  type: string;
  indexed?: boolean;
  components?: AbiParameter[];
  internalType?: string;
}

/**
 * Basic Solidity types
 */
export type SolidityBaseType =
  | 'address'
  | 'bool'
  | 'string'
  | 'bytes'
  | `bytes${number}`
  | `uint${number}`
  | `int${number}`
  | 'tuple';

/**
 * Supported Solidity types (including arrays)
 */
export type SolidityType = SolidityBaseType | `${SolidityBaseType}[]` | `${SolidityBaseType}[${number}]`;

/**
 * Parsed type information
 */
export interface ParsedType {
  baseType: string;
  isArray: boolean;
  arrayDimensions: (number | null)[]; // null means dynamic array
  isTuple: boolean;
  components?: AbiParameter[];
}

/**
 * Parameter value - can be primitive, array, or tuple
 */
export type ParameterValue =
  | string
  | boolean
  | bigint
  | ParameterValue[]
  | { [key: string]: ParameterValue };

/**
 * Parameter validation result
 */
export interface ParameterValidationResult {
  isValid: boolean;
  error?: string;
  normalizedValue?: ParameterValue;
}

/**
 * Result type for explicit error handling
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Calldata encoding result
 */
export interface EncodeCalldataResult {
  calldata: string;
  functionSignature: string;
}

/**
 * Calldata decoding result
 */
export interface DecodeCalldataResult {
  functionName: string;
  functionSignature: string;
  parameters: { [key: string]: ParameterValue };
  parameterTypes: string[];
}

/**
 * Build action input
 */
export interface BuildActionInput {
  contractAddress: string;
  abi: AbiFunction[];
  functionSignature: string;
  parameters: { [key: string]: string | ParameterValue };
  value?: bigint;
}

/**
 * Predefined method definition
 */
export interface PredefinedMethod {
  id: string;
  name: string;
  description?: string;
  abi: AbiFunction[];
}

/**
 * Error types for the library
 */
export class ActionBuilderError extends Error {
  constructor(
    message: string,
    public code: ActionBuilderErrorCode,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'ActionBuilderError';
  }
}

export enum ActionBuilderErrorCode {
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  ENCODING_FAILED = 'ENCODING_FAILED',
  DECODING_FAILED = 'DECODING_FAILED',
  FUNCTION_NOT_FOUND = 'FUNCTION_NOT_FOUND',
}
