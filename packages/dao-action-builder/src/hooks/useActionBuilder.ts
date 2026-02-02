import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  ActionBuilderConfig,
  AbiFunction,
  Action,
  LoadAbiResult,
} from '../types';
import { ActionBuilderError } from '../types';
import { useAbiLoader } from './useAbiLoader';
import { useParameterValidation } from './useParameterValidation';
import { encodeCalldata } from '../core/calldata-encoder';
import { decodeCalldata } from '../core/calldata-decoder';
import { getFunctionSignature, findFunctionBySignature, getAvailableFunctions } from '../core/abi-loader';

export interface UseActionBuilderOptions {
  config: ActionBuilderConfig;
  /** Debounce time for address input */
  debounceMs?: number;
  /** Initial contract address */
  initialAddress?: string;
  /** Initial function signature */
  initialFunction?: string;
  /** Initial parameter values */
  initialParameters?: { [key: string]: string };
}

export interface UseActionBuilderReturn {
  // Address handling
  address: string;
  setAddress: (address: string) => void;
  isValidAddress: boolean;
  isLoadingAbi: boolean;
  abiError: ActionBuilderError | null;

  // ABI info
  abiResult: LoadAbiResult | null;
  availableFunctions: AbiFunction[];
  isProxy: boolean;
  implementationAddress: string | undefined;

  // Function selection
  selectedFunction: AbiFunction | null;
  selectedFunctionSignature: string;
  setSelectedFunction: (signature: string) => void;

  // Parameter handling
  parameterValues: { [key: string]: string };
  parameterStates: {
    [key: string]: {
      value: string;
      isValid: boolean;
      error: string | null;
      isDirty: boolean;
    };
  };
  setParameterValue: (name: string, value: string) => void;
  setParameterValues: (values: { [key: string]: string }) => void;
  isParametersValid: boolean;
  isParametersComplete: boolean;
  missingParameters: string[];
  invalidParameters: string[];

  // Calldata
  calldata: string;
  calldataError: ActionBuilderError | null;

  // Action building
  buildAction: () => Action | null;
  canBuildAction: boolean;

  // Utilities
  reset: () => void;
  resetParameters: () => void;
}

/**
 * React hook for the complete action builder workflow
 */
export function useActionBuilder(options: UseActionBuilderOptions): UseActionBuilderReturn {
  const {
    config,
    debounceMs = 500,
    initialAddress = '',
    initialFunction = '',
    initialParameters = {},
  } = options;

  // ABI loading
  const abiLoader = useAbiLoader({
    config,
    autoLoad: true,
    debounceMs,
  });

  // Function selection
  const [selectedFunctionSignature, setSelectedFunctionSignature] = useState(initialFunction);

  // Find selected function
  const selectedFunction = useMemo(() => {
    if (!abiLoader.abiResult || !selectedFunctionSignature) return null;
    const allFunctions = getAvailableFunctions(abiLoader.abiResult);
    return findFunctionBySignature(selectedFunctionSignature, allFunctions) || null;
  }, [abiLoader.abiResult, selectedFunctionSignature]);

  // Parameter validation
  const paramValidation = useParameterValidation({
    func: selectedFunction,
    initialValues: initialParameters,
    validateOnChange: true,
  });

  // Calldata generation
  const [calldata, setCalldata] = useState('');
  const [calldataError, setCalldataError] = useState<ActionBuilderError | null>(null);

  // Set initial address
  useEffect(() => {
    if (initialAddress) {
      abiLoader.setAddress(initialAddress);
    }
  }, []);

  // Generate calldata when parameters change
  useEffect(() => {
    if (!selectedFunction || !paramValidation.isComplete || !paramValidation.isValid) {
      setCalldata('');
      setCalldataError(null);
      return;
    }

    const allFunctions = abiLoader.abiResult
      ? getAvailableFunctions(abiLoader.abiResult)
      : [];

    const result = encodeCalldata({
      abi: allFunctions,
      functionSignature: selectedFunctionSignature,
      parameters: paramValidation.values,
    });

    if (result.success) {
      setCalldata(result.data.calldata);
      setCalldataError(null);
    } else {
      setCalldata('');
      setCalldataError(result.error);
    }
  }, [
    selectedFunction,
    selectedFunctionSignature,
    paramValidation.values,
    paramValidation.isComplete,
    paramValidation.isValid,
    abiLoader.abiResult,
  ]);

  // Reset parameters when function changes
  useEffect(() => {
    paramValidation.reset();
  }, [selectedFunctionSignature]);

  const setSelectedFunction = useCallback((signature: string) => {
    setSelectedFunctionSignature(signature);
  }, []);

  const buildAction = useCallback((): Action | null => {
    if (
      !abiLoader.address ||
      !abiLoader.isValidAddress ||
      !selectedFunction ||
      !calldata ||
      !paramValidation.isValid ||
      !paramValidation.isComplete
    ) {
      return null;
    }

    return {
      contractAddress: abiLoader.address.toLowerCase(),
      functionSignature: selectedFunctionSignature,
      functionName: selectedFunction.name,
      calldata,
      abi: [selectedFunction],
    };
  }, [
    abiLoader.address,
    abiLoader.isValidAddress,
    selectedFunction,
    selectedFunctionSignature,
    calldata,
    paramValidation.isValid,
    paramValidation.isComplete,
  ]);

  const canBuildAction = useMemo(() => {
    return (
      abiLoader.isValidAddress &&
      !!selectedFunction &&
      !!calldata &&
      paramValidation.isValid &&
      paramValidation.isComplete &&
      !calldataError
    );
  }, [
    abiLoader.isValidAddress,
    selectedFunction,
    calldata,
    paramValidation.isValid,
    paramValidation.isComplete,
    calldataError,
  ]);

  const reset = useCallback(() => {
    abiLoader.reset();
    setSelectedFunctionSignature('');
    setCalldata('');
    setCalldataError(null);
    paramValidation.reset();
  }, [abiLoader, paramValidation]);

  const resetParameters = useCallback(() => {
    paramValidation.reset();
    setCalldata('');
    setCalldataError(null);
  }, [paramValidation]);

  return {
    // Address handling
    address: abiLoader.address,
    setAddress: abiLoader.setAddress,
    isValidAddress: abiLoader.isValidAddress,
    isLoadingAbi: abiLoader.isLoading,
    abiError: abiLoader.error,

    // ABI info
    abiResult: abiLoader.abiResult,
    availableFunctions: abiLoader.availableFunctions,
    isProxy: abiLoader.isProxy,
    implementationAddress: abiLoader.implementationAddress,

    // Function selection
    selectedFunction,
    selectedFunctionSignature,
    setSelectedFunction,

    // Parameter handling
    parameterValues: paramValidation.values,
    parameterStates: paramValidation.parameterStates,
    setParameterValue: paramValidation.setValue,
    setParameterValues: paramValidation.setValues,
    isParametersValid: paramValidation.isValid,
    isParametersComplete: paramValidation.isComplete,
    missingParameters: paramValidation.missingParameters,
    invalidParameters: paramValidation.invalidParameters,

    // Calldata
    calldata,
    calldataError,

    // Action building
    buildAction,
    canBuildAction,

    // Utilities
    reset,
    resetParameters,
  };
}
