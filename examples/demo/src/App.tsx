import { useState, useEffect, useMemo } from 'react';
import {
  encodeCalldata,
  decodeCalldata,
  validateParameterType,
  getParameterTypeErrorMessage,
  getFunctionSignature,
  daoCommitteeMethods,
  daoAgendaManagerMethods,
  daoVaultMethods,
  depositManagerMethods,
  l1BridgeRegistryMethods,
  layer2ManagerMethods,
  layer2RegistryMethods,
  type AbiFunction,
  type PredefinedMethod,
  type NetworkType,
} from '@tokamak-ecosystem/dao-action-builder';

// Contracts controllable by DAOCommitteeProxy
const DAO_CONTRACTS: PredefinedMethod[] = [
  daoCommitteeMethods,
  daoAgendaManagerMethods,
  daoVaultMethods,
  depositManagerMethods,
  l1BridgeRegistryMethods,
  layer2ManagerMethods,
  layer2RegistryMethods,
];

// Theme toggle hook
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  return { isDark, toggleTheme };
}

// Icon components
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

function App() {
  // Theme
  const { isDark, toggleTheme } = useTheme();

  // Network selection
  const [network, setNetwork] = useState<NetworkType>('mainnet');

  // Contract address
  const [contractAddress, setContractAddress] = useState('');

  // Predefined methods
  const [selectedPredefined, setSelectedPredefined] = useState<PredefinedMethod | null>(null);

  // Function selection
  const [selectedFunction, setSelectedFunction] = useState<AbiFunction | null>(null);
  const [selectedFunctionSig, setSelectedFunctionSig] = useState('');

  // Parameters
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [paramErrors, setParamErrors] = useState<Record<string, string>>({});

  // Results
  const [calldata, setCalldata] = useState('');
  const [calldataError, setCalldataError] = useState<string | null>(null);
  const [decodedResult, setDecodedResult] = useState<Record<string, string> | null>(null);

  // Available functions based on selected predefined method
  const availableFunctions = useMemo(() => {
    if (selectedPredefined) {
      return selectedPredefined.abi;
    }
    return [];
  }, [selectedPredefined]);

  // Get address for current network
  const getContractAddress = (contract: PredefinedMethod): string => {
    return contract.addresses?.[network] || '';
  };

  // Handle contract selection - auto-fill address
  const handleContractSelect = (contract: PredefinedMethod | null) => {
    setSelectedPredefined(contract);
    if (contract) {
      setContractAddress(getContractAddress(contract));
    } else {
      setContractAddress('');
    }
  };

  // Update address when network changes
  useEffect(() => {
    if (selectedPredefined) {
      setContractAddress(getContractAddress(selectedPredefined));
    }
  }, [network, selectedPredefined]);

  // Handle function selection
  const handleFunctionSelect = (signature: string) => {
    setSelectedFunctionSig(signature);
    const func = availableFunctions.find((f) => getFunctionSignature(f) === signature);
    setSelectedFunction(func || null);
    setParamValues({});
    setParamErrors({});
    setCalldata('');
    setCalldataError(null);
    setDecodedResult(null);
  };

  // Handle parameter change
  const handleParamChange = (name: string, value: string, type: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));

    if (value) {
      const validation = validateParameterType(value, type);
      if (!validation.isValid) {
        setParamErrors((prev) => ({
          ...prev,
          [name]: validation.error || getParameterTypeErrorMessage(type),
        }));
      } else {
        setParamErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    } else {
      setParamErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Generate calldata
  useEffect(() => {
    if (!selectedFunction) {
      setCalldata('');
      setCalldataError(null);
      return;
    }

    // Check if all params are filled and valid
    const allFilled = selectedFunction.inputs.every(
      (input) => paramValues[input.name]?.trim()
    );
    const hasErrors = Object.keys(paramErrors).length > 0;

    if (!allFilled || hasErrors) {
      setCalldata('');
      setCalldataError(null);
      return;
    }

    const result = encodeCalldata({
      abi: availableFunctions,
      functionSignature: selectedFunctionSig,
      parameters: paramValues,
    });

    if (result.success) {
      setCalldata(result.data.calldata);
      setCalldataError(null);

      // Also decode to verify
      const decoded = decodeCalldata(result.data.calldata, availableFunctions);
      if (decoded.success) {
        const params: Record<string, string> = {};
        for (const [key, value] of Object.entries(decoded.data.parameters)) {
          params[key] = String(value);
        }
        setDecodedResult(params);
      }
    } else {
      setCalldata('');
      setCalldataError(result.error.message);
      setDecodedResult(null);
    }
  }, [selectedFunction, selectedFunctionSig, paramValues, paramErrors, availableFunctions]);

  // Reset when selecting new predefined method
  useEffect(() => {
    setSelectedFunction(null);
    setSelectedFunctionSig('');
    setParamValues({});
    setParamErrors({});
    setCalldata('');
    setCalldataError(null);
    setDecodedResult(null);
  }, [selectedPredefined]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>DAO Action Builder</h1>
          <p className="subtitle">
            Build governance proposal actions for Tokamak Network DAOCommitteeProxy
          </p>
        </div>
        <div className="header-right">
          <div className="network-selector">
            <label>Network:</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as NetworkType)}
            >
              <option value="mainnet">Mainnet</option>
              <option value="sepolia">Sepolia</option>
            </select>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <div className="main-layout">
        {/* Left Sidebar - Contract List */}
        <aside className="sidebar">
          <h2>Contracts</h2>
          <p className="sidebar-desc">Controllable by DAOCommitteeProxy</p>
          <div className="contract-list">
            {DAO_CONTRACTS.map((contract) => {
              const address = getContractAddress(contract);
              return (
                <div
                  key={contract.id}
                  className={`contract-item ${selectedPredefined?.id === contract.id ? 'selected' : ''}`}
                  onClick={() => handleContractSelect(contract)}
                >
                  <div className="contract-name">{contract.name.replace('Tokamak ', '')}</div>
                  <div className="contract-address">
                    {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'No address'}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Content - Action Builder */}
        <main className="content">
          {!selectedPredefined ? (
            <div className="empty-state">
              <div className="empty-icon">&#x1F4DD;</div>
              <h3>Select a Contract</h3>
              <p>Choose a contract from the list on the left to start building a governance action.</p>
            </div>
          ) : (
            <>
              {/* Contract Address Input */}
              <div className="card">
                <h2>{selectedPredefined.name.replace('Tokamak ', '')}</h2>
                <p className="card-description">{selectedPredefined.description}</p>
                <div className="form-group">
                  <label>Contract Address ({network === 'mainnet' ? 'Mainnet' : 'Sepolia'})</label>
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
              </div>

              {/* Function Selection */}
              {availableFunctions.length > 0 && (
                <div className="card">
                  <h2>Select Function</h2>
                  <div className="form-group">
                    <label>Function ({availableFunctions.length} available)</label>
                    <select
                      value={selectedFunctionSig}
                      onChange={(e) => handleFunctionSelect(e.target.value)}
                    >
                      <option value="">-- Select a function --</option>
                      {availableFunctions.map((func) => {
                        const sig = getFunctionSignature(func);
                        return (
                          <option key={sig} value={sig}>
                            {sig}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}

              {/* Parameters */}
              {selectedFunction && selectedFunction.inputs.length > 0 && (
                <div className="card">
                  <h2>Parameters</h2>
                  <table className="params-table">
                    <thead>
                      <tr>
                        <th style={{ width: '30%' }}>Parameter</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFunction.inputs.map((input) => (
                        <tr key={input.name}>
                          <td>
                            <span className="param-name">{input.name}</span>
                            <br />
                            <span className="param-type">{input.type}</span>
                          </td>
                          <td>
                            <input
                              type="text"
                              className={paramErrors[input.name] ? 'error' : ''}
                              value={paramValues[input.name] || ''}
                              onChange={(e) => handleParamChange(input.name, e.target.value, input.type)}
                              placeholder={getPlaceholder(input.type)}
                            />
                            {paramErrors[input.name] && (
                              <div className="error-text">{paramErrors[input.name]}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* No parameters message */}
              {selectedFunction && selectedFunction.inputs.length === 0 && (
                <div className="card">
                  <h2>Parameters</h2>
                  <p className="help-text">This function has no parameters.</p>
                </div>
              )}

              {/* Results */}
              {(calldata || calldataError) && (
                <div className="card result-card">
                  <h2>Result</h2>

                  {calldataError && <div className="error-text mb-4">{calldataError}</div>}

                  {calldata && (
                    <>
                      <div className="result-box">
                        <h3>Encoded Calldata</h3>
                        <code>{calldata}</code>
                      </div>

                      {decodedResult && (
                        <div className="result-box">
                          <h3>Decoded Parameters (verification)</h3>
                          <code>
                            {Object.entries(decodedResult).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {value}
                              </div>
                            ))}
                          </code>
                        </div>
                      )}

                      <div className="action-result">
                        <h3>Action Object</h3>
                        <div className="field">
                          <div className="field-label">Contract Address</div>
                          <div className="field-value">{contractAddress || '(not set)'}</div>
                        </div>
                        <div className="field">
                          <div className="field-label">Function</div>
                          <div className="field-value">{selectedFunctionSig}</div>
                        </div>
                        <div className="field">
                          <div className="field-label">Calldata</div>
                          <div className="field-value">{calldata}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function getPlaceholder(type: string): string {
  if (type === 'address') return '0x...';
  if (type.startsWith('uint') || type.startsWith('int')) return '0';
  if (type === 'bool') return 'true or false';
  if (type === 'bytes' || type.startsWith('bytes')) return '0x...';
  if (type === 'string') return 'Enter text...';
  if (type.includes('[]')) return 'JSON array: ["value1", "value2"]';
  if (type === 'tuple') return 'JSON object: {"field": "value"}';
  return '';
}

export default App;
