// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title UniqToken
 * @dev Core utility token for the PromptVault ecosystem.
 * Purpose: Governance, staking, and payments.
 * Total Supply: 1,000,000,000 UNIQ
 * Decimals: 18
 */
contract UniqToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;

    constructor(address initialOwner) 
        ERC20("UNIQ", "UNIQ") 
        Ownable(initialOwner) 
    {
        _mint(initialOwner, TOTAL_SUPPLY);
    }

    /**
     * @dev Admin function to mint promotional airdrops if needed (optional, currently capped by constructor)
     * Note: In a production environment, minting would be disabled after initial allocation.
     */
    function promotionalAirdrop(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
