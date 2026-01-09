// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IGBC {
    function mint(address to, uint256 amount) external;
}

/// @title RewardManager
/// @notice Coordinates reward issuance in GBC for verified waste deposits.
/// @dev Backend oracle calls this contract after off-chain verification (including AI in the future).
contract RewardManager is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    IGBC public immutable gbc;
    mapping(bytes32 => bool) public processedDeposits;

    /// @notice Emitted when a reward is issued for a deposit.
    /// @param user The address of the rewarded user.
    /// @param amount The amount of GBC minted.
    /// @param offchainDepositId The identifier of the off-chain waste_deposits record.
    event RewardIssued(address indexed user, uint256 amount, bytes32 indexed offchainDepositId);

    constructor(address admin, address gbcAddress) {
        require(admin != address(0), "Admin address required");
        require(gbcAddress != address(0), "GBC address required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        gbc = IGBC(gbcAddress);
    }

    /// @notice Issue a reward for a verified deposit.
    /// @dev Only callable by accounts with ORACLE_ROLE.
    /// @param user The beneficiary wallet address.
    /// @param amount The amount of GBC to mint.
    /// @param offchainDepositId The ID of the corresponding off-chain deposit (hashed as bytes32).
    function rewardDeposit(address user, uint256 amount, bytes32 offchainDepositId) external onlyRole(ORACLE_ROLE) {
        require(user != address(0), "User required");
        require(amount > 0, "Amount must be > 0");
        require(!processedDeposits[offchainDepositId], "Deposit already rewarded");
        
        processedDeposits[offchainDepositId] = true;
        gbc.mint(user, amount);
        emit RewardIssued(user, amount, offchainDepositId);
    }
}
