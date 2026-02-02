import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  AbiFunction,
  Action,
} from '../types';
import { ActionBuilderError } from '../types';
import { useParameterValidation } from './useParameterValidation';
import { encodeCalldata } from '../core/calldata-encoder';
import { getFunctionSignature, findFunctionBySignature, isValidAddress } from '../core/abi-utils';

export interface UseActionBuilderOptions {
  /** Contract ABI (required) */
  abi: AbiFunction[];
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

  // ABI info
  availableFunctions: AbiFunction[];

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
    abi,
    initialAddress = '',
    initialFunction = '',
    initialParameters = {},
  } = options;

  // Address state
  const [address, setAddress] = useState(initialAddress);

  // Function selection
  const [selectedFunctionSignature, setSelectedFunctionSignature] = useState(initialFunction);

  // Find selected function
  const selectedFunction = useMemo(() => {
    if (!selectedFunctionSignature) return null;
    return findFunctionBySignature(selectedFunctionSignature, abi) || null;
  }, [abi, selectedFunctionSignature]);

  // Parameter validation
  const paramValidation = useParameterValidation({
    func: selectedFunction,
    initialValues: initialParameters,
    validateOnChange: true,
  });

  // Calldata generation
  const [calldata, setCalldata] = useState('');
  const [calldataError, setCalldataError] = useState<ActionBuilderError | null>(null);

  // Generate calldata when parameters change
  useEffect(() => {
    if (!selectedFunction || !paramValidation.isComplete || !paramValidation.isValid) {
      setCalldata('');
      setCalldataError(null);
      return;
    }

    const result = encodeCalldata({
      abi,
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
    abi,
  ]);

  // Reset parameters when function changes
  useEffect(() => {
    paramValidation.reset();
  }, [selectedFunctionSignature]);

  const setSelectedFunction = useCallback((signature: string) => {
    setSelectedFunctionSignature(signature);
  }, []);

  const addressIsValid = useMemo(() => isValidAddress(address), [address]);

  const buildAction = useCallback((): Action | null => {
    if (
      !address ||
      !addressIsValid ||
      !selectedFunction ||
      !calldata ||
      !paramValidation.isValid ||
      !paramValidation.isComplete
    ) {
      return null;
    }

    return {
      contractAddress: address.toLowerCase(),
      functionSignature: selectedFunctionSignature,
      functionName: selectedFunction.name,
      calldata,
      abi: [selectedFunction],
    };
  }, [
    address,
    addressIsValid,
    selectedFunction,
    selectedFunctionSignature,
    calldata,
    paramValidation.isValid,
    paramValidation.isComplete,
  ]);

  const canBuildAction = useMemo(() => {
    return (
      addressIsValid &&
      !!selectedFunction &&
      !!calldata &&
      paramValidation.isValid &&
      paramValidation.isComplete &&
      !calldataError
    );
  }, [
    addressIsValid,
    selectedFunction,
    calldata,
    paramValidation.isValid,
    paramValidation.isComplete,
    calldataError,
  ]);

  const reset = useCallback(() => {
    setAddress('');
    setSelectedFunctionSignature('');
    setCalldata('');
    setCalldataError(null);
    paramValidation.reset();
  }, [paramValidation]);

  const resetParameters = useCallback(() => {
    paramValidation.reset();
    setCalldata('');
    setCalldataError(null);
  }, [paramValidation]);

  return {
    // Address handling
    address,
    setAddress,
    isValidAddress: addressIsValid,

    // ABI info
    availableFunctions: abi,

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
