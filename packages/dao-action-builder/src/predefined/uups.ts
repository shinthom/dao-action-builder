import type { PredefinedMethod, AbiFunction } from '../types';

const abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'upgradeTo',
    inputs: [{ name: 'newImplementation', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'upgradeToAndCall',
    inputs: [
      { name: 'newImplementation', type: 'address' },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
];

export const uupsMethods: PredefinedMethod = {
  id: 'uups',
  name: 'UUPS Upgradeable',
  description: 'OpenZeppelin UUPS upgradeability pattern',
  abi,
};
