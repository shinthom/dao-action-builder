import type { PredefinedMethod, AbiFunction } from '@dao-action-builder/core';

const abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'deposit',
    inputs: [
      { name: 'layer2', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'redeposit',
    inputs: [{ name: 'layer2', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'redepositMulti',
    inputs: [
      { name: 'layer2', type: 'address' },
      { name: 'n', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setWithdrawalDelay',
    inputs: [
      { name: 'l2chain', type: 'address' },
      { name: 'withdrawalDelay_', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requestWithdrawal',
    inputs: [
      { name: 'layer2', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'processRequest',
    inputs: [
      { name: 'layer2', type: 'address' },
      { name: 'receiveTON', type: 'bool' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requestWithdrawalAll',
    inputs: [{ name: 'layer2', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'processRequests',
    inputs: [
      { name: 'layer2', type: 'address' },
      { name: 'n', type: 'uint256' },
      { name: 'receiveTON', type: 'bool' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawAndDepositL2',
    inputs: [
      { name: 'layer2', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
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
    name: 'removeAdmin',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAddresses',
    inputs: [
      { name: '_l1BridgeRegistry', type: 'address' },
      { name: '_layer2Manager', type: 'address' },
    ],
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
];

export const depositManagerMethods: PredefinedMethod = {
  id: 'tokamak-deposit-manager',
  name: 'Tokamak DepositManager',
  description: 'Tokamak Network TON staking deposit manager',
  abi,
};
