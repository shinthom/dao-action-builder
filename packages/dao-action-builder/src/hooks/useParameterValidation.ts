import { useState, useCallback, useMemo } from 'react';
import type { AbiFunction, AbiParameter, ParameterValidationResult } from '../types';
import {
  validateParameterType,
  getParameterTypeErrorMessage,
} from '../validation/validators';

export interface UseParameterValidationOptions {
  /** The function to validate parameters for */
  func: AbiFunction | null;
  /** Initial parameter values */
  initialValues?: { [key: string]: string };
  /** Validate on change */
  validateOnChange?: boolean;
}

export interface ParameterState {
  value: string;
  isValid: boolean;
  error: string | null;
  isDirty: boolean;
}

export interface UseParameterValidationReturn {
  /** Current parameter values */
  values: { [key: string]: string };
  /** Parameter states with validation info */
  parameterStates: { [key: string]: ParameterState };
  /** Set a parameter value */
  setValue: (name: string, value: string) => void;
  /** Set multiple parameter values */
  setValues: (values: { [key: string]: string }) => void;
  /** Validate all parameters */
  validateAll: () => boolean;
  /** Validate a single parameter */
  validate: (name: string) => ParameterValidationResult;
  /** Reset all parameters */
  reset: () => void;
  /** Whether all parameters are valid */
  isValid: boolean;
  /** Whether all required parameters are filled */
  isComplete: boolean;
  /** List of missing required parameters */
  missingParameters: string[];
  /** List of invalid parameters */
  invalidParameters: string[];
  /** Get error message for a parameter type */
  getErrorMessage: (type: string) => string;
}

/**
 * React hook for managing parameter validation
 */
export function useParameterValidation(
  options: UseParameterValidationOptions
): UseParameterValidationReturn {
  const { func, initialValues = {}, validateOnChange = true } = options;

  const [parameterStates, setParameterStates] = useState<{
    [key: string]: ParameterState;
  }>(() => {
    const states: { [key: string]: ParameterState } = {};
    if (func) {
      for (const input of func.inputs) {
        const initialValue = initialValues[input.name] || '';
        states[input.name] = {
          value: initialValue,
          isValid: initialValue ? validateParameterType(initialValue, input.type, input.components).isValid : true,
          error: null,
          isDirty: false,
        };
      }
    }
    return states;
  });

  const setValue = useCallback(
    (name: string, value: string) => {
      if (!func) return;

      const input = func.inputs.find((i) => i.name === name);
      if (!input) return;

      setParameterStates((prev) => {
        let isValid = true;
        let error: string | null = null;

        if (validateOnChange && value) {
          const result = validateParameterType(value, input.type, input.components);
          isValid = result.isValid;
          error = result.isValid ? null : result.error || getParameterTypeErrorMessage(input.type);
        }

        return {
          ...prev,
          [name]: {
            value,
            isValid,
            error,
            isDirty: true,
          },
        };
      });
    },
    [func, validateOnChange]
  );

  const setValues = useCallback(
    (values: { [key: string]: string }) => {
      if (!func) return;

      setParameterStates((prev) => {
        const newStates = { ...prev };

        for (const [name, value] of Object.entries(values)) {
          const input = func.inputs.find((i) => i.name === name);
          if (!input) continue;

          let isValid = true;
          let error: string | null = null;

          if (validateOnChange && value) {
            const result = validateParameterType(value, input.type, input.components);
            isValid = result.isValid;
            error = result.isValid ? null : result.error || getParameterTypeErrorMessage(input.type);
          }

          newStates[name] = {
            value,
            isValid,
            error,
            isDirty: true,
          };
        }

        return newStates;
      });
    },
    [func, validateOnChange]
  );

  const validate = useCallback(
    (name: string): ParameterValidationResult => {
      if (!func) {
        return { isValid: false, error: 'No function selected' };
      }

      const input = func.inputs.find((i) => i.name === name);
      if (!input) {
        return { isValid: false, error: 'Parameter not found' };
      }

      const state = parameterStates[name];
      if (!state) {
        return { isValid: false, error: 'Parameter state not found' };
      }

      return validateParameterType(state.value, input.type, input.components);
    },
    [func, parameterStates]
  );

  const validateAll = useCallback((): boolean => {
    if (!func) return false;

    let allValid = true;

    setParameterStates((prev) => {
      const newStates = { ...prev };

      for (const input of func.inputs) {
        const state = prev[input.name];
        if (!state) continue;

        const result = validateParameterType(state.value, input.type, input.components);
        newStates[input.name] = {
          ...state,
          isValid: result.isValid,
          error: result.isValid ? null : result.error || getParameterTypeErrorMessage(input.type),
        };

        if (!result.isValid) {
          allValid = false;
        }
      }

      return newStates;
    });

    return allValid;
  }, [func]);

  const reset = useCallback(() => {
    if (!func) {
      setParameterStates({});
      return;
    }

    const states: { [key: string]: ParameterState } = {};
    for (const input of func.inputs) {
      const initialValue = initialValues[input.name] || '';
      states[input.name] = {
        value: initialValue,
        isValid: true,
        error: null,
        isDirty: false,
      };
    }
    setParameterStates(states);
  }, [func, initialValues]);

  const values = useMemo(() => {
    const result: { [key: string]: string } = {};
    for (const [name, state] of Object.entries(parameterStates)) {
      result[name] = state.value;
    }
    return result;
  }, [parameterStates]);

  const isValid = useMemo(() => {
    if (!func) return false;
    return Object.values(parameterStates).every((state) => state.isValid);
  }, [func, parameterStates]);

  const isComplete = useMemo(() => {
    if (!func) return false;
    return func.inputs.every((input) => {
      const state = parameterStates[input.name];
      return state && state.value.trim() !== '';
    });
  }, [func, parameterStates]);

  const missingParameters = useMemo(() => {
    if (!func) return [];
    return func.inputs
      .filter((input) => {
        const state = parameterStates[input.name];
        return !state || state.value.trim() === '';
      })
      .map((input) => input.name);
  }, [func, parameterStates]);

  const invalidParameters = useMemo(() => {
    return Object.entries(parameterStates)
      .filter(([, state]) => !state.isValid)
      .map(([name]) => name);
  }, [parameterStates]);

  const getErrorMessage = useCallback((type: string) => {
    return getParameterTypeErrorMessage(type);
  }, []);

  return {
    values,
    parameterStates,
    setValue,
    setValues,
    validateAll,
    validate,
    reset,
    isValid,
    isComplete,
    missingParameters,
    invalidParameters,
    getErrorMessage,
  };
}
