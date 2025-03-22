// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAlchemyAPI {
    function getWalletData(address user) external view returns (bool, string memory, uint256, uint256);
}

contract ChainlinkYapsFetcher is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    IERC20 public token;
    IAlchemyAPI public alchemyAPI;

    mapping(address => uint256) public yapsScores;
    mapping(address => bool) public eligibilityStatus;
    
    event YapsScoreUpdated(address indexed user, uint256 score);
    event AirdropClaimed(address indexed user, uint256 amount);

    constructor(address _oracle, bytes32 _jobId, address _token, address _alchemyAPI) {
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        fee = 0.1 * 10**18; // 0.1 LINK
        token = IERC20(_token);
        alchemyAPI = IAlchemyAPI(_alchemyAPI);
    }

    function requestYapsScore(string memory twitterUsername) public {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        req.add("get", string(abi.encodePacked("https://api.kaito.ai/api/v1/yaps?username=", twitterUsername)));
        req.add("path", "yaps_all");
        sendChainlinkRequest(req, fee);
    }

    function fulfill(bytes32 _requestId, uint256 yapsScore) public recordChainlinkFulfillment(_requestId) {
        yapsScores[msg.sender] = yapsScore;
        emit YapsScoreUpdated(msg.sender, yapsScore);
    }

    function checkEligibility(address user) public {
        (bool isVerified, , uint256 transactionCount, uint256 nftCount) = alchemyAPI.getWalletData(user);
        eligibilityStatus[user] = isVerified && transactionCount > 0 && nftCount > 0 && yapsScores[user] > 5;
    }

    function claimAirdrop() external {
        require(eligibilityStatus[msg.sender], "Not eligible for airdrop");
        uint256 airdropAmount = yapsScores[msg.sender] * 10**18;
        require(token.balanceOf(address(this)) >= airdropAmount, "Not enough tokens");

        eligibilityStatus[msg.sender] = false;
        token.transfer(msg.sender, airdropAmount);
        emit AirdropClaimed(msg.sender, airdropAmount);
    }
}
