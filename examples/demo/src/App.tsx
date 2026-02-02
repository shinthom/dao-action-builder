import { useState, useEffect, useMemo } from 'react';
import {
  encodeCalldata,
  decodeCalldata,
  validateParameterType,
  getParameterTypeErrorMessage,
  predefinedMethodRegistry,
  getFunctionSignature,
  type AbiFunction,
  type PredefinedMethod,
} from '@dao-action-builder/core';
import { registerTokamakMethods } from '@dao-action-builder/tokamak';

// Register Tokamak methods
registerTokamakMethods();

function App() {
  // Contract address
  const [contractAddress, setContractAddress] = useState('');

  // Predefined methods
  const [selectedPredefined, setSelectedPredefined] = useState<PredefinedMethod | null>(null);
  const predefinedMethods = useMemo(() => predefinedMethodRegistry.getAll(), []);

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
    <div className="container">
      <h1>DAO Action Builder Demo</h1>
      <p className="subtitle">
        Test the @dao-action-builder/core library - validate parameters and encode calldata
      </p>

      {/* Predefined Methods Selection */}
      <div className="card">
        <h2>Select Predefined Method</h2>
        <div className="predefined-grid">
          {predefinedMethods.map((method) => (
            <div
              key={method.id}
              className={`predefined-item ${selectedPredefined?.id === method.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedPredefined(method);
              }}
            >
              <div className="name">{method.name}</div>
              <div className="desc">{method.description}</div>
            </div>
          ))}
        </div>

        {selectedPredefined && (
          <>
            <div className="divider" />
            <div className="form-group">
              <label>Contract Address (for the action)</label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>
          </>
        )}
      </div>

      {/* Function Selection */}
      {availableFunctions.length > 0 && (
        <div className="card">
          <h2>Select Function</h2>
          <div className="form-group">
            <label>Function</label>
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

      {/* Results */}
      {(calldata || calldataError) && (
        <div className="card">
          <h2>Result</h2>

          {calldataError && <div className="error-text mb-4">{calldataError}</div>}

          {calldata && (
            <>
              <div className="result-box">
                <h3>Encoded Calldata</h3>
                <code>{calldata}</code>
              </div>

              {decodedResult && (
                <div className="result-box" style={{ marginTop: 12 }}>
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

              <div className="action-result mt-4">
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

      {/* No function selected hint */}
      {selectedFunction && selectedFunction.inputs.length === 0 && (
        <div className="card">
          <h2>Result</h2>
          <p className="help-text">This function has no parameters.</p>
          {calldata && (
            <div className="result-box mt-4">
              <h3>Encoded Calldata</h3>
              <code>{calldata}</code>
            </div>
          )}
        </div>
      )}
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
