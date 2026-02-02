# DAO Action Builder

Monorepo for DAO Action Builder - a headless library for building DAO proposal actions.

## Packages

| Package | Description |
|---------|-------------|
| [@dao-action-builder/core](./packages/dao-action-builder) | Core library with ABI loading, validation, and encoding |
| [@dao-action-builder/tokamak](./packages/dao-action-builder-tokamak) | Tokamak Network predefined methods |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Features

- **Etherscan ABI Loading**: Automatically fetch contract ABIs from Etherscan V2 API
- **Proxy Detection**: Automatic detection of proxy patterns (EIP-1967, implementation(), getImplementation(), logic())
- **Parameter Validation**: Comprehensive validation for all Solidity types including arrays and tuples
- **Calldata Encoding/Decoding**: Full calldata encoding and decoding using ethers.js
- **React Hooks**: Ready-to-use hooks for React applications
- **Predefined Methods**: Built-in ABI definitions for common contracts

## Usage

### Install

```bash
pnpm add @dao-action-builder/core ethers

# For Tokamak Network methods
pnpm add @dao-action-builder/tokamak
```

### Basic Usage

```typescript
import { loadAbi, encodeCalldata, validateParameterType } from '@dao-action-builder/core';

const config = {
  etherscan: {
    apiKey: 'YOUR_API_KEY',
    chainId: 1,
  },
  rpc: {
    url: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  },
};

// Load ABI
const abi = await loadAbi('0x...', config);

// Validate parameter
validateParameterType('["0x123...", "0x456..."]', 'address[]');

// Encode calldata
const result = encodeCalldata({
  abi: abi.data.proxyAbi,
  functionSignature: 'transfer(address,uint256)',
  parameters: { to: '0x...', amount: '1000' },
});
```

### React Hooks

```tsx
import { useActionBuilder } from '@dao-action-builder/core/hooks';

function MyComponent() {
  const { setAddress, availableFunctions, setSelectedFunction, calldata } = useActionBuilder({
    config,
  });
  // ...
}
```

### Tokamak Network

```typescript
import { registerTokamakMethods, tokamakMethods } from '@dao-action-builder/tokamak';

// Register with global registry
registerTokamakMethods();

// Or use directly
import { depositManagerMethods } from '@dao-action-builder/tokamak';
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Clean build artifacts
pnpm clean
```

## License

MIT
