// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title Garbage Blockchain Coin (GBC)
/// @notice ERC-20 token used to reward sustainable actions in the Kadham ecosystem.
contract GarbageBlockchainCoin is ERC20, AccessControl, Pausable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address admin) ERC20("Garbage Blockchain Coin", "GBC") {
        require(admin != address(0), "Admin address required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    /// @notice Mint new GBC tokens to an address.
    /// @dev Only accounts with MINTER_ROLE can call this.
    function mint(address to, uint256 amount) external whenNotPaused onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /// @notice Pause token transfers and minting in case of emergency.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Unpause token transfers and minting.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
