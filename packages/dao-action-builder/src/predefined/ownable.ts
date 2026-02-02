import type { PredefinedMethod, AbiFunction } from '../types';

const abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [{ name: 'newOwner', type: 'address' }],
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
];

export const ownableMethods: PredefinedMethod = {
  id: 'ownable',
  name: 'Ownable',
  description: 'OpenZeppelin Ownable contract for basic access control',
  abi,
};
