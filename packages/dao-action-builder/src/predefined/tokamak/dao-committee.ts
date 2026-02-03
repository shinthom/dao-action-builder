import type { PredefinedMethod, AbiFunction } from '../../types';

const abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'removeFromBlacklist',
    inputs: [{ name: '_candidate', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createCandidateOwner',
    inputs: [
      { name: '_memo', type: 'string' },
      { name: '_operatorAddress', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerLayer2CandidateByOwner',
    inputs: [
      { name: '_operator', type: 'address' },
      { name: '_layer2', type: 'address' },
      { name: '_memo', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAgendaStatus',
    inputs: [
      { name: '_agendaID', type: 'uint256' },
      { name: '_status', type: 'uint256' },
      { name: '_result', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

export const daoCommitteeMethods: PredefinedMethod = {
  id: 'tokamak-dao-committee',
  name: 'Tokamak DAOCommittee',
  description: 'Tokamak Network DAO Committee for governance management',
  abi,
};
