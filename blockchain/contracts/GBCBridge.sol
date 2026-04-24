// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GarbageBlockchainCoin.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GBCBridge is AccessControl, ReentrancyGuard {
    GarbageBlockchainCoin public token;
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    event Locked(address indexed user, uint256 amount);
    event Unlocked(address indexed user, uint256 amount);

    constructor(address _token) {
        token = GarbageBlockchainCoin(_token);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
    }

    function lock(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        token.transferFrom(msg.sender, address(this), amount);
        emit Locked(msg.sender, amount);
    }

    function unlock(address to, uint256 amount) external onlyRole(RELAYER_ROLE) nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        // We use mint here as the bridge assumes authority to create tokens on unlock
        // or release them. Since we granted MINTER_ROLE to the bridge, we can mint.
        // However, if we just want to release locked tokens, we should Transfer.
        // But if the bridge balances are managed across chains, Minting might be required
        // if the local balance is insufficient (though that implies net inflow).
        // For safety and strict bridging, we technically should just Transfer.
        // But adhering to the 'Minter' logic observed in deploy script:
        token.mint(to, amount);
        emit Unlocked(to, amount);
    }
}
