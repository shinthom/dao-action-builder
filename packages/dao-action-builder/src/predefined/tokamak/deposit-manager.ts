import type { PredefinedMethod, AbiFunction } from '../../types';

const abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'setMinDepositGasLimit',
    inputs: [{ name: 'gasLimit_', type: 'uint32' }],
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
];

export const depositManagerMethods: PredefinedMethod = {
  id: 'tokamak-deposit-manager',
  name: 'Tokamak DepositManager',
  description: 'Tokamak Network DepositManager (V1.1) for TON staking deposits',
  abi,
};
