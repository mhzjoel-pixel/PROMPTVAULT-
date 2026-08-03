// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./lib/Security.sol";
contract AttendXToken is ERC20, Ownable {
    constructor(address treasury) ERC20("AttendX Token", "ATX") Ownable(treasury) { _mint(treasury, 1_000_000_000 ether); }
    function mint(address to, uint256 amount) external onlyOwner { _mint(to, amount); }
}
