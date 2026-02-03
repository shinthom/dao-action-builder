import type { PredefinedMethod, AbiFunction } from '../../types';

const abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'setAddresses',
    inputs: [
      { name: '_layer2Manager', type: 'address' },
      { name: '_seigManager', type: 'address' },
      { name: '_ton', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setSeigniorageCommittee',
    inputs: [{ name: '_seigniorageCommittee', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'rejectCandidateAddOn',
    inputs: [{ name: 'rollupConfig', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'restoreCandidateAddOn',
    inputs: [
      { name: 'rollupConfig', type: 'address' },
      { name: 'rejectedL2Deposit', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

export const l1BridgeRegistryMethods: PredefinedMethod = {
  id: 'tokamak-l1-bridge-registry',
  name: 'Tokamak L1BridgeRegistry',
  description: 'Tokamak Network L1BridgeRegistry (V1.1) for managing L1 bridges',
  abi,
};
