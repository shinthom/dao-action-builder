import type { PredefinedMethod, AbiFunction } from '../../types';

const abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'setCommittee',
    inputs: [{ name: '_committee', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setCreateAgendaFees',
    inputs: [{ name: '_createAgendaFees', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMinimumNoticePeriodSeconds',
    inputs: [{ name: '_minimumNoticePeriodSeconds', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setExecutingPeriodSeconds',
    inputs: [{ name: '_executingPeriodSeconds', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMinimumVotingPeriodSeconds',
    inputs: [{ name: '_minimumVotingPeriodSeconds', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'newAgenda',
    inputs: [
      { name: '_targets', type: 'address[]' },
      { name: '_noticePeriodSeconds', type: 'uint256' },
      { name: '_votingPeriodSeconds', type: 'uint256' },
      { name: '_atomicExecute', type: 'bool' },
      { name: '_functionBytecodes', type: 'bytes[]' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'castVote',
    inputs: [
      { name: '_agendaID', type: 'uint256' },
      { name: '_voter', type: 'address' },
      { name: '_vote', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setExecutedAgenda',
    inputs: [{ name: '_agendaID', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setResult',
    inputs: [
      { name: '_agendaID', type: 'uint256' },
      { name: '_result', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setStatus',
    inputs: [
      { name: '_agendaID', type: 'uint256' },
      { name: '_status', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'endAgendaVoting',
    inputs: [{ name: '_agendaID', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

export const daoAgendaManagerMethods: PredefinedMethod = {
  id: 'tokamak-dao-agenda-manager',
  name: 'Tokamak DAOAgendaManager',
  description: 'Tokamak Network DAO Agenda Manager for proposal management',
  abi,
};
