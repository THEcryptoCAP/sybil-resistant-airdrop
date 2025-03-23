# Sybil-Resistant Airdrop System

A decentralized airdrop system that implements multiple layers of verification to prevent Sybil attacks and ensure fair token distribution.This system uses kaito yaps- Proof of attention (yaps score) and alchemy api to fetch ens name, past transactions and nft holdings to make sure the airdrop goes in right hands(the concept i named as Proof-Of-Activity). :-)

## Understanding Sybil Attacks in Airdrops

### What are Sybil Attacks?
Sybil attacks occur when a single entity creates multiple fake identities to gain unfair advantages in a system. In the context of airdrops, attackers create multiple wallet addresses to claim more tokens than they should, undermining the fair distribution mechanism.

### Impact on Airdrop Systems
- **Token Dilution**: Legitimate users receive fewer tokens due to unfair distribution
- **Loss of Value**: Token value may decrease due to concentrated holdings
- **Community Distrust**: Users lose faith in the project's fairness
- **Resource Waste**: Project resources are allocated to non-genuine participants

## How This Project Prevents Sybil Attacks

Our system implements multiple verification layers:

1. **On-Chain Verification**
   - ENS name resolution
   - Transaction history analysis
   - NFT holdings verification
   - Smart contract interactions

2. **Social Verification**
   - Twitter account verification through Yaps score
   - Historical social activity analysis
   - Account age and engagement metrics

3. **Multi-Factor Authentication**
   - Wallet connection verification
   - Social media account linking
   - On-chain activity validation

## Technical Architecture

### Smart Contracts

#### 1. ChainlinkYapsFetcher.sol
- **Purpose**: Fetches and verifies Twitter user data using Chainlink oracles
- **Key Features**:
  - Chainlink integration for off-chain data
  - Yaps score verification
  - Eligibility checking
  - Airdrop distribution logic

#### 2. AlchemyAPI.sol
- **Purpose**: Interfaces with Alchemy API for on-chain data
- **Key Features**:
  - ENS resolution
  - Transaction history analysis
  - NFT holdings verification
  - Gas optimization

### Frontend Components

#### 1. WalletConnect.js
- **Purpose**: Handles wallet connection and authentication
- **Libraries Used**:
  - ethers.js: Ethereum interaction
  - MetaMask: Wallet connection

#### 2. ClaimAirdrop.js
- **Purpose**: Manages airdrop claiming process
- **Features**:
  - User input validation
  - Transaction handling
  - Error management
  - Loading states

#### 3. AirDropEligibility.js
- **Purpose**: Verifies user eligibility
- **Features**:
  - Multi-factor verification
  - Score calculation
  - Status tracking

## Technical Stack

### Smart Contracts
- Solidity ^0.8.19
- OpenZeppelin Contracts
- Chainlink Contracts
- Hardhat Development Environment

### Frontend
- Next.js
- React
- ethers.js
- TailwindCSS
- Axios

### APIs
- Alchemy API
- Chainlink Oracle
- Kaito Yaps API

## Workflow

1. **User Connection**
   ```mermaid
   graph LR
   A[User] --> B[Connect Wallet]
   B --> C[Enter Twitter Username]
   C --> D[Start Verification]
   ```

2. **Verification Process**
   ```mermaid
   graph TD
   A[Start Verification] --> B[Check ENS]
   B --> C[Verify Transactions]
   C --> D[Check NFT Holdings]
   D --> E[Get Yaps Score]
   E --> F[Calculate Eligibility]
   ```

3. **Airdrop Claim**
   ```mermaid
   graph LR
   A[Eligible User] --> B[Enter Details]
   B --> C[Submit Claim]
   C --> D[Process Transaction]
   D --> E[Receive Tokens]
   ```

## Setup and Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sybil-resistant-airdrop.git
   cd sybil-resistant-airdrop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Deploy contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Environment Variables

```env
# Network Configuration
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_wallet_private_key

# API Keys
ALCHEMY_API_KEY=your_alchemy_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Chainlink Configuration
CHAINLINK_ORACLE_ADDRESS=your_chainlink_oracle_address
CHAINLINK_JOB_ID=your_chainlink_job_id

# Token Configuration
TOKEN_ADDRESS=your_erc20_token_address
```

## Security Considerations

1. **Smart Contract Security**
   - Reentrancy protection
   - Access control
   - Input validation
   - Gas optimization

2. **Frontend Security**
   - Input sanitization
   - Transaction signing
   - Error handling
   - Rate limiting

3. **API Security**
   - Key management
   - Request validation
   - Response verification
   - Error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenZeppelin for smart contract libraries
- Chainlink for oracle services
- Alchemy for blockchain API
- Kaito for Yaps score data
