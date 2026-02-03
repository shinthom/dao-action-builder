// Types
export type {
  Action,
  AbiFunction,
  AbiParameter,
  SolidityType,
  SolidityBaseType,
  ParsedType,
  ParameterValue,
  ParameterValidationResult,
  Result,
  EncodeCalldataResult,
  DecodeCalldataResult,
  BuildActionInput,
  PredefinedMethod,
  NetworkType,
  ContractAddresses,
} from './types';

export { ActionBuilderError, ActionBuilderErrorCode } from './types';

// Core - ABI Utilities
export {
  isValidAddress,
  filterStateChangingFunctions,
  getFunctionSignature,
  findFunctionBySignature,
  findFunctionsByName,
} from './core/abi-utils';

// Core - Calldata Encoder
export {
  encodeCalldata,
  encodeCalldataByName,
  validateFunctionParameters,
} from './core/calldata-encoder';

// Core - Calldata Decoder
export {
  decodeCalldata,
  decodeCalldataBySignature,
  tryDecodeCalldata,
  formatDecodedParameters,
} from './core/calldata-decoder';

// Core - Action Builder
export { buildAction } from './core/action-builder';

// Validation
export {
  validateParameterType,
  validateAddress,
  validateUint,
  validateInt,
  validateBool,
  validateBytes,
  validateString,
  validateArray,
  validateTuple,
  parseType,
  getParameterTypeErrorMessage,
} from './validation/validators';

export {
  normalizeParameterValue,
  denormalizeParameterValue,
  prepareParametersForEncoding,
} from './validation/normalizers';

// Predefined Methods
export {
  PredefinedMethodRegistry,
  predefinedMethodRegistry,
  erc20Methods,
  erc721Methods,
  erc1155Methods,
  ownableMethods,
  accessControlMethods,
  pausableMethods,
  governorMethods,
  uupsMethods,
  // Tokamak Network
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
  seigManagerMethods,
  candidateFactoryMethods,
} from './predefined';

// React Hooks
export {
  useParameterValidation,
  useActionBuilder,
} from './hooks';

export type {
  UseParameterValidationOptions,
  UseParameterValidationReturn,
  ParameterState,
  UseActionBuilderOptions,
  UseActionBuilderReturn,
} from './hooks';
