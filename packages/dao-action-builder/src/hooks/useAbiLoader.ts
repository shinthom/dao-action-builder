import { useState, useCallback, useRef, useEffect } from 'react';
import type { ActionBuilderConfig, AbiFunction, LoadAbiResult } from '../types';
import { ActionBuilderError } from '../types';
import { loadAbi, getAvailableFunctions, isValidAddress } from '../core/abi-loader';

export interface UseAbiLoaderOptions {
  config: ActionBuilderConfig;
  autoLoad?: boolean;
  debounceMs?: number;
}

export interface UseAbiLoaderReturn {
  /** Current contract address */
  address: string;
  /** Set the contract address */
  setAddress: (address: string) => void;
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: ActionBuilderError | null;
  /** Loaded ABI result */
  abiResult: LoadAbiResult | null;
  /** Available functions from the ABI */
  availableFunctions: AbiFunction[];
  /** Whether the contract is a proxy */
  isProxy: boolean;
  /** Implementation address if proxy */
  implementationAddress: string | undefined;
  /** Manually trigger ABI loading */
  load: () => Promise<void>;
  /** Reset state */
  reset: () => void;
  /** Whether the address is valid */
  isValidAddress: boolean;
}

/**
 * React hook for loading contract ABIs
 */
export function useAbiLoader(options: UseAbiLoaderOptions): UseAbiLoaderReturn {
  const { config, autoLoad = true, debounceMs = 500 } = options;

  const [address, setAddressState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ActionBuilderError | null>(null);
  const [abiResult, setAbiResult] = useState<LoadAbiResult | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (!address || !isValidAddress(address)) {
      setError(null);
      setAbiResult(null);
      return;
    }

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const result = await loadAbi(address, config);

      // Check if aborted
      if (abortRef.current?.signal.aborted) {
        return;
      }

      if (result.success) {
        setAbiResult(result.data);
        setError(null);
      } else {
        setError(result.error);
        setAbiResult(null);
      }
    } catch (e) {
      if (abortRef.current?.signal.aborted) {
        return;
      }
      setError(
        new ActionBuilderError(
          e instanceof Error ? e.message : 'Unknown error',
          'NETWORK_ERROR' as any,
          e
        )
      );
      setAbiResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, config]);

  const setAddress = useCallback(
    (newAddress: string) => {
      setAddressState(newAddress);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!autoLoad) {
        return;
      }

      if (!newAddress || !isValidAddress(newAddress)) {
        setAbiResult(null);
        setError(null);
        return;
      }

      debounceRef.current = setTimeout(() => {
        load();
      }, debounceMs);
    },
    [autoLoad, debounceMs, load]
  );

  const reset = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setAddressState('');
    setIsLoading(false);
    setError(null);
    setAbiResult(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const availableFunctions = abiResult ? getAvailableFunctions(abiResult) : [];

  return {
    address,
    setAddress,
    isLoading,
    error,
    abiResult,
    availableFunctions,
    isProxy: abiResult?.isProxy ?? false,
    implementationAddress: abiResult?.implementationAddress,
    load,
    reset,
    isValidAddress: isValidAddress(address),
  };
}
