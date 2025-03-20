// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./AirDropEligibility.sol";

contract YapsAirdrop is Ownable, ReentrancyGuard {
    IERC20 public token;
    AirDropEligibility public eligibilityContract;
    
    // Mapping to track claimed airdrops
    mapping(address => bool) public hasClaimed;
    
    // Event for airdrop claims
    event AirDropClaimed(address indexed user, uint256 amount);
    
    constructor(address _token, address _eligibilityContract) {
        token = IERC20(_token);
        eligibilityContract = AirDropEligibility(_eligibilityContract);
    }
    
    /**
     * @dev Claim airdrop tokens based on Yaps score
     * @param twitterUsername Twitter username for verification
     */
    function claimAirdrop(string memory twitterUsername) external nonReentrant {
        require(!hasClaimed[msg.sender], "Already claimed airdrop");
        require(eligibilityContract.isEligible(msg.sender, twitterUsername), "Not eligible for airdrop");
        
        // Get Yaps score from eligibility contract
        uint256 yapsScore = eligibilityContract.getYapsScore(twitterUsername);
        
        // Calculate airdrop amount (Yaps score * 10^18)
        uint256 airdropAmount = yapsScore * 10**18;
        
        // Ensure contract has enough tokens
        require(token.balanceOf(address(this)) >= airdropAmount, "Insufficient tokens in contract");
        
        // Mark as claimed
        hasClaimed[msg.sender] = true;
        
        // Transfer tokens
        require(token.transfer(msg.sender, airdropAmount), "Transfer failed");
        
        emit AirDropClaimed(msg.sender, airdropAmount);
    }
    
    /**
     * @dev Deposit tokens into the contract
     * @param amount Amount of tokens to deposit
     */
    function depositTokens(uint256 amount) external onlyOwner {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
    
    /**
     * @dev Withdraw tokens from the contract
     * @param amount Amount of tokens to withdraw
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(token.transfer(owner(), amount), "Transfer failed");
    }
    
    /**
     * @dev Check if an address has claimed their airdrop
     * @param user Address to check
     * @return bool Whether the address has claimed
     */
    function hasUserClaimed(address user) external view returns (bool) {
        return hasClaimed[user];
    }
    
    /**
     * @dev Get contract's token balance
     * @return uint256 Balance of tokens in the contract
     */
    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
