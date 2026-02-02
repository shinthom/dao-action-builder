import type { PredefinedMethod, AbiFunction } from '../types';

const abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

export const pausableMethods: PredefinedMethod = {
  id: 'pausable',
  name: 'Pausable',
  description: 'OpenZeppelin Pausable for emergency stops',
  abi,
};
