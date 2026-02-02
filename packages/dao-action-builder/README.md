# @dao-action-builder/core

Headless library for building DAO proposal actions - smart contract function calls with ABI loading, parameter validation, and calldata encoding.

## Features

- **Etherscan ABI Loading**: Automatically fetch contract ABIs from Etherscan API
- **Proxy Detection**: Automatic detection of proxy patterns (EIP-1967, implementation(), getImplementation(), logic())
- **Parameter Validation**: Comprehensive validation for all Solidity types including arrays and tuples
- **Calldata Encoding/Decoding**: Full calldata encoding and decoding using ethers.js
- **React Hooks**: Ready-to-use hooks for React applications
- **Predefined Methods**: Built-in ABI definitions for common contracts (ERC20, ERC721, etc.)

## Installation

```bash
npm install @dao-action-builder/core ethers
# or
pnpm add @dao-action-builder/core ethers
# or
yarn add @dao-action-builder/core ethers
```

## Quick Start

### Pure Functions

```typescript
import {
  loadAbi,
  encodeCalldata,
  decodeCalldata,
  validateParameterType,
  buildAction,
} from '@dao-action-builder/core';

// Configuration
const config = {
  etherscan: {
    apiKey: 'YOUR_ETHERSCAN_API_KEY',
    chainId: 1,
  },
  rpc: {
    url: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  },
};

// Load ABI from Etherscan
const abiResult = await loadAbi('0xContractAddress', config);
if (abiResult.success) {
  console.log('Proxy ABI:', abiResult.data.proxyAbi);
  console.log('Logic ABI:', abiResult.data.logicAbi);
  console.log('Is Proxy:', abiResult.data.isProxy);
}

// Validate parameters
const validation = validateParameterType(
  '0x1234567890123456789012345678901234567890',
  'address'
);
console.log(validation.isValid); // true

// Validate array parameters
const arrayValidation = validateParameterType(
  '["0x123...", "0x456..."]',
  'address[]'
);

// Encode calldata
const encodeResult = encodeCalldata({
  abi: abiResult.data.proxyAbi,
  functionSignature: 'transfer(address,uint256)',
  parameters: {
    to: '0x1234567890123456789012345678901234567890',
    amount: '1000000000000000000',
  },
});

if (encodeResult.success) {
  console.log('Calldata:', encodeResult.data.calldata);
}

// Decode calldata
const decodeResult = decodeCalldata(calldata, abi);
if (decodeResult.success) {
  console.log('Function:', decodeResult.data.functionName);
  console.log('Parameters:', decodeResult.data.parameters);
}

// Build complete action
const action = await buildAction(
  {
    contractAddress: '0xContractAddress',
    functionSignature: 'transfer(address,uint256)',
    parameters: { to: '0x...', amount: '1000' },
  },
  config
);
```

### React Hooks

```tsx
import { useActionBuilder } from '@dao-action-builder/core/hooks';

function ActionBuilderForm() {
  const {
    address,
    setAddress,
    isLoadingAbi,
    abiError,
    availableFunctions,
    selectedFunction,
    setSelectedFunction,
    parameterValues,
    setParameterValue,
    parameterStates,
    calldata,
    canBuildAction,
    buildAction,
  } = useActionBuilder({
    config: {
      etherscan: { apiKey: 'KEY', chainId: 1 },
      rpc: { url: 'https://...' },
    },
  });

  return (
    <div>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Contract Address"
      />

      {isLoadingAbi && <p>Loading ABI...</p>}
      {abiError && <p>Error: {abiError.message}</p>}

      <select
        value={selectedFunction?.name || ''}
        onChange={(e) => setSelectedFunction(e.target.value)}
      >
        {availableFunctions.map((fn) => (
          <option key={fn.name} value={`${fn.name}(${fn.inputs.map(i => i.type).join(',')})`}>
            {fn.name}
          </option>
        ))}
      </select>

      {selectedFunction?.inputs.map((input) => (
        <div key={input.name}>
          <label>{input.name} ({input.type})</label>
          <input
            value={parameterValues[input.name] || ''}
            onChange={(e) => setParameterValue(input.name, e.target.value)}
          />
          {parameterStates[input.name]?.error && (
            <span className="error">{parameterStates[input.name].error}</span>
          )}
        </div>
      ))}

      {calldata && <p>Calldata: {calldata}</p>}

      <button onClick={() => buildAction()} disabled={!canBuildAction}>
        Build Action
      </button>
    </div>
  );
}
```

### Using Predefined Methods

```typescript
import {
  predefinedMethodRegistry,
  buildActionFromPredefined,
  erc20Methods,
} from '@dao-action-builder/core';

// Get all predefined methods
const allMethods = predefinedMethodRegistry.getAll();

// Get specific method
const erc20 = predefinedMethodRegistry.get('erc20');

// Build action using predefined ABI (no Etherscan needed)
const action = buildActionFromPredefined(
  {
    contractAddress: '0xTokenAddress',
    functionSignature: 'transfer(address,uint256)',
    parameters: {
      to: '0xRecipient',
      amount: '1000000000000000000',
    },
  },
  erc20Methods.abi
);

// Register custom predefined methods
predefinedMethodRegistry.register({
  id: 'my-custom-contract',
  name: 'My Custom Contract',
  description: 'Custom contract methods',
  abi: [
    {
      type: 'function',
      name: 'customMethod',
      inputs: [{ name: 'value', type: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
  ],
});
```

## API Reference

### Core Functions

#### `loadAbi(address, config)`

Load contract ABI from Etherscan with automatic proxy detection.

```typescript
const result = await loadAbi('0x...', config);
// Returns: Result<LoadAbiResult, ActionBuilderError>
```

#### `encodeCalldata(options)`

Encode function call to calldata.

```typescript
const result = encodeCalldata({
  abi: AbiFunction[],
  functionSignature: string,
  parameters: { [name: string]: string | ParameterValue },
});
// Returns: Result<EncodeCalldataResult, ActionBuilderError>
```

#### `decodeCalldata(calldata, abi)`

Decode calldata back to function name and parameters.

```typescript
const result = decodeCalldata('0x...', abi);
// Returns: Result<DecodeCalldataResult, ActionBuilderError>
```

#### `validateParameterType(value, type, components?)`

Validate a parameter value against its Solidity type.

```typescript
const result = validateParameterType('123', 'uint256');
// Returns: ParameterValidationResult
```

### Supported Types

- **Basic**: `address`, `bool`, `string`, `bytes`, `bytes1`-`bytes32`, `uint8`-`uint256`, `int8`-`int256`
- **Arrays**: `type[]`, `type[n]`, nested arrays
- **Tuples**: `tuple` with components

### React Hooks

#### `useAbiLoader(options)`

Hook for loading contract ABIs.

#### `useParameterValidation(options)`

Hook for managing parameter input and validation.

#### `useActionBuilder(options)`

Complete hook for the action builder workflow.

## Packages

- `@dao-action-builder/core` - Core library
- `@dao-action-builder/tokamak` - Tokamak Network predefined methods

## License

MIT
