# @tokamak-ecosystem/dao-action-builder

Headless library for building DAO proposal actions - smart contract function calls with ABI loading, parameter validation, and calldata encoding.

## Features

- **Parameter Validation**: Comprehensive validation for all Solidity types including arrays and tuples
- **Calldata Encoding/Decoding**: Full calldata encoding and decoding using ethers.js
- **React Hooks**: Ready-to-use hooks for React applications
- **Predefined Methods**: Built-in ABI definitions for common contracts (ERC20, ERC721, etc.)

## Installation

```bash
npm install @tokamak-ecosystem/dao-action-builder ethers
# or
pnpm add @tokamak-ecosystem/dao-action-builder ethers
# or
yarn add @tokamak-ecosystem/dao-action-builder ethers
```

## Quick Start

### Pure Functions

```typescript
import {
  encodeCalldata,
  decodeCalldata,
  validateParameterType,
  erc20Methods,
} from '@tokamak-ecosystem/dao-action-builder';

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
  abi: erc20Methods.abi,
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
```

### React Hooks

```tsx
import { useActionBuilder } from '@tokamak-ecosystem/dao-action-builder/hooks';
import { erc20Methods } from '@tokamak-ecosystem/dao-action-builder';

function ActionBuilderForm() {
  const {
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
    abi: erc20Methods.abi,
  });

  return (
    <div>
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
} from '@tokamak-ecosystem/dao-action-builder';

// Get all predefined methods
const allMethods = predefinedMethodRegistry.getAll();

// Get specific method
const erc20 = predefinedMethodRegistry.get('erc20');

// Build action using predefined ABI
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

## Tokamak Network Contracts

Pre-configured contract addresses for Tokamak Network. Access addresses directly from the predefined methods:

```typescript
import { tonMethods, wtonMethods, daoCommitteeMethods } from '@tokamak-ecosystem/dao-action-builder';

// Get addresses
const tonMainnet = tonMethods.addresses?.mainnet;
const tonSepolia = tonMethods.addresses?.sepolia;
```

### Contract Addresses

#### Mainnet

| Contract | Address |
|----------|---------|
| TON | `0x2be5e8c109e2197D077D13A82dAead6a9b3433C5` |
| WTON | `0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2` |
| DAOCommittee | `0xDD9f0cCc044B0781289Ee318e5971b0139602C26` |
| DAOAgendaManager | `0xcD4421d082752f363E1687544a09d5112cD4f484` |
| DAOVault | `0x2520CD65BAa2cEEe9E6Ad6EBD3F45490C42dd303` |
| SeigManager | `0x0b55a0f463b6defb81c6063973763951712d0e5f` |
| DepositManager | `0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e` |
| CandidateFactory | `0x9fc7100a16407ee24a79c834a56e6eca555a5d7c` |
| Layer2Registry | `0x7846c2248a7b4de77e9c2bae7fbb93bfc286837b` |
| Layer2Manager | `0xD6Bf6B2b7553c8064Ba763AD6989829060FdFC1D` |
| L1BridgeRegistry | `0x39d43281A4A5e922AB0DCf89825D73273D8C5BA4` |

#### Sepolia

| Contract | Address |
|----------|---------|
| TON | `0xa30fe40285B8f5c0457DbC3B7C8A280373c40044` |
| WTON | `0x79E0d92670106c85E9067b56B8F674340dCa0Bbd` |
| DAOCommittee | `0x79cfbEaCB5470bBe3B8Fe76db2A61Fc59e588C38` |
| DAOAgendaManager | `0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08` |
| DAOVault | `0xB9F6c9E75418D7E5a536ADe08f0218196BB3eBa4` |
| SeigManager | `0x11F6f1C2c0800AC1b31F04fF8A9f5D9003a85460` |
| DepositManager | `0x90ffcc7F168DceDBEF1Cb6c6eB00cA73F922956F` |
| CandidateFactory | `0x04e3C2B720FB8896A7f9Ea59DdcA85fD45189C7f` |
| Layer2Registry | `0xA0a9576b437E52114aDA8b0BC4149F2F5c604581` |
| Layer2Manager | `0x58B4C2FEf19f5CDdd944AadD8DC99cCC71bfeFDc` |
| L1BridgeRegistry | `0x2D47fa57101203855b336e9E61BC9da0A6dd0Dbc` |

## API Reference

### Core Functions

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

#### `useParameterValidation(options)`

Hook for managing parameter input and validation.

#### `useActionBuilder(options)`

Complete hook for the action builder workflow.

## License

MIT
