// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title UniqSubscriptionNFT
 * @dev NFT representing an active subscription to PromptVault.
 * Types: 1 = Weekly, 2 = Monthly
 */
contract UniqSubscriptionNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => uint256) public expiry;
    mapping(uint256 => uint8) public subType;

    constructor(address initialOwner) ERC721("PromptVault Subscription", "PVSUB") Ownable(initialOwner) {}

    function mintSubscription(address to, uint8 _subType, uint256 duration) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
        
        expiry[newItemId] = block.timestamp + duration;
        subType[newItemId] = _subType;
        
        return newItemId;
    }

    function isSubscriptionActive(uint256 tokenId) public view returns (bool) {
        return block.timestamp < expiry[tokenId];
    }
}
