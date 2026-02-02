import type { PredefinedMethod, AbiFunction } from '@dao-action-builder/core';

const abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'addAdmin',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'grantRole',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'onApprove',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'pauseCandidateAddOn',
    inputs: [{ name: 'rollupConfig', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerCandidateAddOn',
    inputs: [
      { name: 'rollupConfig', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'flagTon', type: 'bool' },
      { name: 'memo', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeAdmin',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceRole',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeRole',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAddresses',
    inputs: [
      { name: '_l1BridgeRegistry', type: 'address' },
      { name: '_operatorManagerFactory', type: 'address' },
      { name: '_ton', type: 'address' },
      { name: '_wton', type: 'address' },
      { name: '_dao', type: 'address' },
      { name: '_depositManager', type: 'address' },
      { name: '_seigManager', type: 'address' },
      { name: '_swapProxy', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMinimumInitialDepositAmount',
    inputs: [{ name: '_minimumInitialDepositAmount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setOperatorManagerFactory',
    inputs: [{ name: '_operatorManagerFactory', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferAdmin',
    inputs: [{ name: 'newAdmin', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferL2Seigniorage',
    inputs: [
      { name: 'layer2', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [{ name: 'newAdmin', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpauseCandidateAddOn',
    inputs: [{ name: 'rollupConfig', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

export const layer2ManagerMethods: PredefinedMethod = {
  id: 'tokamak-layer2-manager',
  name: 'Tokamak Layer2Manager',
  description: 'Tokamak Network Layer2 Manager for managing Layer2 networks',
  abi,
};
