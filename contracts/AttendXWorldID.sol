// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./lib/Security.sol";

interface IWorldIDRouter {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

contract AttendXWorldID is Ownable, Pausable {
    IWorldIDRouter public worldId;
    uint256 public groupId;
    string public appId;
    string public action;
    mapping(uint256 => bool) public usedNullifiers;
    mapping(address => uint256) public walletNullifier;

    event IdentityVerified(address indexed account, uint256 indexed nullifierHash);

    constructor(address router, uint256 group, string memory app, string memory act, address owner) Ownable(owner) {
        require(router != address(0), "bad router");
        require(bytes(app).length != 0, "bad app");
        require(bytes(act).length != 0, "bad action");
        worldId = IWorldIDRouter(router);
        groupId = group;
        appId = app;
        action = act;
    }

    function externalNullifierHash() public view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(appId, action))) >> 8;
    }

    function verifyAndRegister(
        address account,
        string calldata signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external whenNotPaused {
        require(account != address(0), "bad account");
        require(bytes(signal).length != 0, "bad signal");
        require(!usedNullifiers[nullifierHash], "identity used");
        require(walletNullifier[account] == 0, "wallet verified");

        worldId.verifyProof(
            root,
            groupId,
            uint256(keccak256(abi.encodePacked(signal))) >> 8,
            nullifierHash,
            externalNullifierHash(),
            proof
        );

        usedNullifiers[nullifierHash] = true;
        walletNullifier[account] = nullifierHash;
        emit IdentityVerified(account, nullifierHash);
    }

    function isVerified(address account) public view returns (bool) {
        return walletNullifier[account] != 0;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
