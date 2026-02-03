# DAO Action Builder

A TypeScript library for building DAO governance proposal actions for Tokamak Network.

This library provides predefined ABI definitions and calldata encoding/decoding utilities for contracts that can be controlled by **DAOCommitteeProxy** through DAO governance proposals on Ethereum Mainnet and Sepolia Testnet.

## Supported Contracts

### DAOCommittee

Self-governance functions for the DAO Committee.

| Network | Address |
|---------|---------|
| Mainnet | [`0xDD9f0cCc044B0781289Ee318e5971b0139602C26`](https://etherscan.io/address/0xDD9f0cCc044B0781289Ee318e5971b0139602C26) |
| Sepolia | [`0x79cfbEaCB5470bBe3B8Fe76db2A61Fc59e588C38`](https://sepolia.etherscan.io/address/0x79cfbEaCB5470bBe3B8Fe76db2A61Fc59e588C38) |

| Function | Description |
|----------|-------------|
| `removeFromBlacklist(address _candidate)` | Remove a candidate from the blacklist |
| `createCandidateOwner(string _memo, address _operatorAddress)` | Create a candidate by owner |
| `registerLayer2CandidateByOwner(address _operator, address _layer2, string _memo)` | Register Layer2 candidate by owner |
| `setAgendaStatus(uint256 _agendaID, uint256 _status, uint256 _result)` | Manually set agenda status and result |
| `setSeigManager(address _seigManager)` | Set the SeigManager contract address |
| `setCandidatesSeigManager(address[] _candidateContracts, address _seigManager)` | Set SeigManager for multiple candidates |
| `setCandidatesCommittee(address[] _candidateContracts, address _committee)` | Set committee for multiple candidates |
| `setDaoVault(address _daoVault)` | Set the DAO Vault address |
| `setLayer2Registry(address _layer2Registry)` | Set the Layer2 Registry address |
| `setAgendaManager(address _agendaManager)` | Set the Agenda Manager address |
| `setCandidateFactory(address _candidateFactory)` | Set the Candidate Factory address |
| `setTon(address _ton)` | Set the TON token address |
| `setActivityRewardPerSecond(uint256 _value)` | Set activity reward rate per second |
| `increaseMaxMember(uint256 _newMaxMember, uint256 _quorum)` | Increase maximum member count |
| `decreaseMaxMember(uint256 _reducingMemberIndex, uint256 _quorum)` | Decrease maximum member count |
| `setQuorum(uint256 _quorum)` | Set voting quorum |
| `setCreateAgendaFees(uint256 _fees)` | Set agenda creation fees |
| `setMinimumNoticePeriodSeconds(uint256 _minimumNoticePeriod)` | Set minimum notice period |
| `setMinimumVotingPeriodSeconds(uint256 _minimumVotingPeriod)` | Set minimum voting period |
| `setExecutingPeriodSeconds(uint256 _executingPeriodSeconds)` | Set execution period |

---

### DAOAgendaManager

Manages DAO proposals and voting.

| Network | Address |
|---------|---------|
| Mainnet | [`0xcD4421d082752f363E1687544a09d5112cD4f484`](https://etherscan.io/address/0xcD4421d082752f363E1687544a09d5112cD4f484) |
| Sepolia | [`0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08`](https://sepolia.etherscan.io/address/0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08) |

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

| Network | Address |
|---------|---------|
| Mainnet | [`0x2520CD65BAa2cEEe9E6Ad6EBD3F45490C42dd303`](https://etherscan.io/address/0x2520CD65BAa2cEEe9E6Ad6EBD3F45490C42dd303) |
| Sepolia | [`0xB9F6c9E75418D7E5a536ADe08f0218196BB3eBa4`](https://sepolia.etherscan.io/address/0xB9F6c9E75418D7E5a536ADe08f0218196BB3eBa4) |

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

### TON

Tokamak Network native token.

| Network | Address |
|---------|---------|
| Mainnet | [`0x2be5e8c109e2197D077D13A82dAead6a9b3433C5`](https://etherscan.io/address/0x2be5e8c109e2197D077D13A82dAead6a9b3433C5) |
| Sepolia | [`0xa30fe40285B8f5c0457DbC3B7C8A280373c40044`](https://sepolia.etherscan.io/address/0xa30fe40285B8f5c0457DbC3B7C8A280373c40044) |

| Function | Description |
|----------|-------------|
| `approve(address spender, uint256 amount)` | Approve token spending |
| `approveAndCall(address spender, uint256 amount, bytes data)` | Approve and call in single transaction |
| `transfer(address to, uint256 amount)` | Transfer tokens |
| `transferFrom(address from, address to, uint256 amount)` | Transfer tokens on behalf of another address |

---

### WTON

Wrapped TON token with swap functionality.

| Network | Address |
|---------|---------|
| Mainnet | [`0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2`](https://etherscan.io/address/0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2) |
| Sepolia | [`0x79E0d92670106c85E9067b56B8F674340dCa0Bbd`](https://sepolia.etherscan.io/address/0x79E0d92670106c85E9067b56B8F674340dCa0Bbd) |

| Function | Description |
|----------|-------------|
| `swapToTON(uint256 wtonAmount)` | Swap WTON to TON |
| `swapFromTON(uint256 tonAmount)` | Swap TON to WTON |
| `swapToTONAndTransfer(address to, uint256 wtonAmount)` | Swap WTON to TON and transfer |
| `swapFromTONAndTransfer(address to, uint256 tonAmount)` | Swap TON to WTON and transfer |
| `approve(address spender, uint256 amount)` | Approve token spending |
| `approveAndCall(address spender, uint256 amount, bytes data)` | Approve and call in single transaction |
| `transfer(address to, uint256 amount)` | Transfer tokens |
| `transferFrom(address from, address to, uint256 amount)` | Transfer tokens on behalf of another address |
| `addMinter(address account)` | Add minter role |
| `decreaseAllowance(address spender, uint256 subtractedValue)` | Decrease spending allowance |
| `increaseAllowance(address spender, uint256 addedValue)` | Increase spending allowance |
| `transferOwnership(address target, address newOwner)` | Transfer ownership of target contract |

---

### SeigManager

Manages seigniorage distribution for staking.

| Network | Address |
|---------|---------|
| Mainnet | [`0x0b55a0f463b6defb81c6063973763951712d0e5f`](https://etherscan.io/address/0x0b55a0f463b6defb81c6063973763951712d0e5f) |
| Sepolia | [`0x11F6f1C2c0800AC1b31F04fF8A9f5D9003a85460`](https://sepolia.etherscan.io/address/0x11F6f1C2c0800AC1b31F04fF8A9f5D9003a85460) |

**Configuration Functions:**

| Function | Description |
|----------|-------------|
| `setData(address powerton_, address daoAddress, uint256 powerTONSeigRate_, uint256 daoSeigRate_, uint256 relativeSeigRate_, uint256 adjustDelay_, uint256 minimumAmount_)` | Set all seigniorage parameters |
| `setPowerTON(address powerton_)` | Set PowerTON address |
| `setDao(address daoAddress)` | Set DAO address |
| `setPowerTONSeigRate(uint256 powerTONSeigRate_)` | Set PowerTON seigniorage rate |
| `setDaoSeigRate(uint256 daoSeigRate_)` | Set DAO seigniorage rate |
| `setPseigRate(uint256 pseigRate_)` | Set relative seigniorage rate |
| `setCoinageFactory(address factory_)` | Set coinage factory address |
| `setAdjustDelay(uint256 adjustDelay_)` | Set adjustment delay |
| `setMinimumAmount(uint256 minimumAmount_)` | Set minimum amount |
| `setSeigStartBlock(uint256 _seigStartBlock)` | Set seigniorage start block |
| `setInitialTotalSupply(uint256 _initialTotalSupply)` | Set initial total supply |
| `setBurntAmountAtDAO(uint256 _burntAmountAtDAO)` | Set burnt amount at DAO |

**Ownership Functions:**

| Function | Description |
|----------|-------------|
| `transferCoinageOwnership(address newSeigManager, address[] coinages_)` | Transfer coinage ownership to new SeigManager |
| `renounceWTONMinter()` | Renounce WTON minter role |
| `renounceMinter(address target)` | Renounce minter role on target contract |
| `renouncePauser(address target)` | Renounce pauser role on target contract |
| `renounceOwnership(address target)` | Renounce ownership of target contract |
| `transferOwnership(address target, address newOwner)` | Transfer ownership of target contract |

**Access Control Functions:**

| Function | Description |
|----------|-------------|
| `addAdmin(address account)` | Add admin role |
| `removeAdmin(address account)` | Remove admin role |
| `transferAdmin(address newAdmin)` | Transfer admin role |
| `addMinter(address account)` | Add minter role |
| `removeMinter(address account)` | Remove minter role |
| `addOperator(address account)` | Add operator role |
| `removeOperator(address account)` | Remove operator role |
| `addChallenger(address account)` | Add challenger role |
| `removeChallenger(address account)` | Remove challenger role |

---

### DepositManager

Manages staking deposits.

| Network | Address |
|---------|---------|
| Mainnet | [`0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e`](https://etherscan.io/address/0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e) |
| Sepolia | [`0x90ffcc7F168DceDBEF1Cb6c6eB00cA73F922956F`](https://sepolia.etherscan.io/address/0x90ffcc7F168DceDBEF1Cb6c6eB00cA73F922956F) |

| Function | Description |
|----------|-------------|
| `setMinDepositGasLimit(uint32 gasLimit_)` | Set minimum gas limit for deposits |
| `setAddresses(address _l1BridgeRegistry, address _layer2Manager)` | Set contract addresses |
| `addAdmin(address account)` | Add admin role |
| `removeAdmin(address account)` | Remove admin role |
| `transferAdmin(address newAdmin)` | Transfer admin role |

---

### L1BridgeRegistry

Manages L1 bridges and candidate add-ons.

| Network | Address |
|---------|---------|
| Mainnet | [`0x39d43281A4A5e922AB0DCf89825D73273D8C5BA4`](https://etherscan.io/address/0x39d43281A4A5e922AB0DCf89825D73273D8C5BA4) |
| Sepolia | [`0x2D47fa57101203855b336e9E61BC9da0A6dd0Dbc`](https://sepolia.etherscan.io/address/0x2D47fa57101203855b336e9E61BC9da0A6dd0Dbc) |

**Configuration Functions:**

| Function | Description |
|----------|-------------|
| `setAddresses(address _layer2Manager, address _seigManager, address _ton)` | Set contract addresses |
| `setSeigniorageCommittee(address _seigniorageCommittee)` | Set seigniorage committee address |
| `rejectCandidateAddOn(address rollupConfig)` | Reject a candidate add-on |
| `restoreCandidateAddOn(address rollupConfig, bool rejectedL2Deposit)` | Restore a rejected candidate add-on |

**Access Control Functions:**

| Function | Description |
|----------|-------------|
| `addAdmin(address account)` | Add admin role |
| `removeAdmin(address account)` | Remove admin role |
| `transferAdmin(address newAdmin)` | Transfer admin role |
| `addManager(address account)` | Add manager role |
| `removeManager(address account)` | Remove manager role |
| `revokeManager(address account)` | Revoke manager role |
| `revokeRegistrant(address account)` | Revoke registrant role |

---

### Layer2Manager

Manages Layer 2 networks.

| Network | Address |
|---------|---------|
| Mainnet | [`0xD6Bf6B2b7553c8064Ba763AD6989829060FdFC1D`](https://etherscan.io/address/0xD6Bf6B2b7553c8064Ba763AD6989829060FdFC1D) |
| Sepolia | [`0x58B4C2FEf19f5CDdd944AadD8DC99cCC71bfeFDc`](https://sepolia.etherscan.io/address/0x58B4C2FEf19f5CDdd944AadD8DC99cCC71bfeFDc) |

| Function | Description |
|----------|-------------|
| `setAddresses(address _l1BridgeRegistry, address _operatorManagerFactory, address _ton, address _wton, address _dao, address _depositManager, address _seigManager, address _swapProxy)` | Set all contract addresses |
| `setOperatorManagerFactory(address _operatorManagerFactory)` | Set operator manager factory |
| `setMinimumInitialDepositAmount(uint256 _minimumInitialDepositAmount)` | Set minimum initial deposit amount |
| `addAdmin(address account)` | Add admin role |
| `removeAdmin(address account)` | Remove admin role |
| `transferAdmin(address newAdmin)` | Transfer admin role |

---

### Layer2Registry

Manages Layer 2 registration.

| Network | Address |
|---------|---------|
| Mainnet | [`0x7846c2248a7b4de77e9c2bae7fbb93bfc286837b`](https://etherscan.io/address/0x7846c2248a7b4de77e9c2bae7fbb93bfc286837b) |
| Sepolia | [`0xA0a9576b437E52114aDA8b0BC4149F2F5c604581`](https://sepolia.etherscan.io/address/0xA0a9576b437E52114aDA8b0BC4149F2F5c604581) |

| Function | Description |
|----------|-------------|
| `unregister(address layer2)` | Unregister a Layer 2 network |
| `addAdmin(address account)` | Add admin role |
| `removeAdmin(address account)` | Remove admin role |
| `transferAdmin(address newAdmin)` | Transfer admin role |
| `addMinter(address account)` | Add minter role |
| `removeMinter(address account)` | Remove minter role |
| `addOperator(address account)` | Add operator role |
| `removeOperator(address account)` | Remove operator role |

---

### CandidateFactory

Factory contract for deploying candidate contracts.

| Network | Address |
|---------|---------|
| Mainnet | [`0x9fc7100a16407ee24a79c834a56e6eca555a5d7c`](https://etherscan.io/address/0x9fc7100a16407ee24a79c834a56e6eca555a5d7c) |
| Sepolia | [`0x04e3C2B720FB8896A7f9Ea59DdcA85fD45189C7f`](https://sepolia.etherscan.io/address/0x04e3C2B720FB8896A7f9Ea59DdcA85fD45189C7f) |

| Function | Description |
|----------|-------------|
| `setAddress(address _depositManager, address _daoCommittee, address _candidateImp, address _ton, address _wton)` | Set all contract addresses |
| `addAdmin(address account)` | Add admin role |
| `removeAdmin(address account)` | Remove admin role |
| `transferAdmin(address newAdmin)` | Transfer admin role |

---


## License

MIT
