import type { PredefinedMethod, AbiFunction } from '../../types';

const abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'unregister',
    inputs: [{ name: 'layer2', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

export const layer2RegistryMethods: PredefinedMethod = {
  id: 'tokamak-layer2-registry',
  name: 'Tokamak Layer2Registry',
  description: 'Tokamak Network Layer2 Registry for unregistering Layer2 networks',
  abi,
};
