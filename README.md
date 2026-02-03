# DAO Action Builder

A TypeScript library for building DAO governance proposal actions for Tokamak Network.

This library provides predefined ABI definitions and calldata encoding/decoding utilities for contracts that can be controlled by **DAOCommitteeProxy** through DAO governance proposals on Ethereum Mainnet.

## Supported Contracts

### DAOCommittee

Self-governance functions for the DAO Committee.

| Address | `0xDD9f0cCc044B0781289Ee318e5971b0139602C26` |
|---------|---------------------------------------------|

| Function | Description |
|----------|-------------|
| `removeFromBlacklist(address _candidate)` | Remove a candidate from the blacklist |
| `createCandidateOwner(string _memo, address _operatorAddress)` | Create a candidate by owner |
| `registerLayer2CandidateByOwner(address _operator, address _layer2, string _memo)` | Register Layer2 candidate by owner |
| `setAgendaStatus(uint256 _agendaID, uint256 _status, uint256 _result)` | Manually set agenda status and result |

---

### DAOAgendaManager

Manages DAO proposals and voting.

| Address | `0xcD4421d082752f363E1687544a09d5112cD4f484` |
|---------|---------------------------------------------|

| Function | Description |
|----------|-------------|
| `setCommittee(address _committee)` | Set the committee contract address |
| `setCreateAgendaFees(uint256 _createAgendaFees)` | Set the fee required to create an agenda |
| `setMinimumNoticePeriodSeconds(uint256 _minimumNoticePeriodSeconds)` | Set minimum notice period |
| `setMinimumVotingPeriodSeconds(uint256 _minimumVotingPeriodSeconds)` | Set minimum voting period |
| `setExecutingPeriodSeconds(uint256 _executingPeriodSeconds)` | Set execution period |
| `newAgenda(address[] _targets, uint256 _noticePeriodSeconds, uint256 _votingPeriodSeconds, bool _atomicExecute, bytes[] _functionBytecodes)` | Create a new agenda |
| `castVote(uint256 _agendaID, address _voter, uint256 _vote)` | Cast a vote on behalf of a voter |
| `setExecutedAgenda(uint256 _agendaID)` | Mark an agenda as executed |
| `setResult(uint256 _agendaID, uint256 _result)` | Set the result of an agenda |
| `setStatus(uint256 _agendaID, uint256 _status)` | Set the status of an agenda |
| `endAgendaVoting(uint256 _agendaID)` | End voting for an agenda |

---

### DAOVault

Manages the DAO treasury.

| Address | `0x2520CD65BAa2cEEe9E6Ad6EBD3F45490C42dd303` |
|---------|---------------------------------------------|

| Function | Description |
|----------|-------------|
| `setTON(address _ton)` | Set the TON token address |
| `setWTON(address _wton)` | Set the WTON token address |
| `approveTON(address _to, uint256 _amount)` | Approve TON spending |
| `approveWTON(address _to, uint256 _amount)` | Approve WTON spending |
| `approveERC20(address _token, address _to, uint256 _amount)` | Approve any ERC20 token spending |
| `claimTON(address _to, uint256 _amount)` | Transfer TON from vault |
| `claimWTON(address _to, uint256 _amount)` | Transfer WTON from vault |
| `claimERC20(address _token, address _to, uint256 _amount)` | Transfer any ERC20 token from vault |

---

### DepositManager

Manages staking deposits.

| Address | `0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e` |
|---------|---------------------------------------------|

| Function | Description |
|----------|-------------|
| `setMinDepositGasLimit(uint32 gasLimit_)` | Set minimum gas limit for deposits |
| `setAddresses(address _l1BridgeRegistry, address _layer2Manager)` | Set contract addresses |

---

### L1BridgeRegistry

Manages L1 bridges and candidate add-ons.

| Address | `0x39d43281A4A5e922AB0DCf89825D73273D8C5BA4` |
|---------|---------------------------------------------|

| Function | Access | Description |
|----------|--------|-------------|
| `setAddresses(address _layer2Manager, address _seigManager, address _ton)` | onlyOwner | Set contract addresses |
| `setSeigniorageCommittee(address _seigniorageCommittee)` | onlyOwner | Set seigniorage committee address |
| `rejectCandidateAddOn(address rollupConfig)` | onlySeigniorageCommittee | Reject a candidate add-on |
| `restoreCandidateAddOn(address rollupConfig, bool rejectedL2Deposit)` | onlySeigniorageCommittee | Restore a rejected candidate add-on |

---

### Layer2Manager

Manages Layer 2 networks.

| Address | `0xD6Bf6B2b7553c8064Ba763AD6989829060FdFC1D` |
|---------|---------------------------------------------|

| Function | Description |
|----------|-------------|
| `setAddresses(address _l1BridgeRegistry, address _operatorManagerFactory, address _ton, address _wton, address _dao, address _depositManager, address _seigManager, address _swapProxy)` | Set all contract addresses |
| `setOperatorManagerFactory(address _operatorManagerFactory)` | Set operator manager factory |
| `setMinimumInitialDepositAmount(uint256 _minimumInitialDepositAmount)` | Set minimum initial deposit amount |

---

### Layer2Registry

Manages Layer 2 registration.

| Address | `0x7846c2248a7b4de77e9c2bae7fbb93bfc286837b` |
|---------|---------------------------------------------|

| Function | Description |
|----------|-------------|
| `unregister(address layer2)` | Unregister a Layer 2 network |

---

## Contracts NOT Controllable by DAO

| Contract | Reason |
|----------|--------|
| SeigManagerProxy | DAOCommitteeProxy has DEFAULT_ADMIN_ROLE but not PAUSER_ROLE |
| Candidate contracts | Each Candidate is owned by its operator |
| TON / WTON | Token contracts with separate ownership |

## Installation

```bash
npm install @tokamak-ecosystem/dao-action-builder ethers
# or
pnpm add @tokamak-ecosystem/dao-action-builder ethers
# or
yarn add @tokamak-ecosystem/dao-action-builder ethers
```

## Reference

- [Mainnet Deployed Addresses](https://github.com/tokamak-network/ton-staking-v2/blob/ton-staking-v2/docs/deployed-addresses-mainnet.md)
- [ton-staking-v2 Repository](https://github.com/tokamak-network/ton-staking-v2)
- [tokamak-dao-contracts Repository](https://github.com/tokamak-network/tokamak-dao-contracts)

## License

MIT
