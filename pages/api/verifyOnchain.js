import { Alchemy, Network } from "alchemy-sdk";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { walletAddress } = req.query;

    if (!walletAddress) {
        return res.status(400).json({ message: 'Wallet address is required' });
    }

    try {
        const alchemyApiKey = process.env.ALCHEMY_API_KEY;
        if (!alchemyApiKey) {
            console.error('Alchemy API key is missing');
            return res.status(500).json({
                message: 'Server configuration error: Alchemy API key is missing',
                error: 'ALCHEMY_API_KEY environment variable is not set'
            });
        }

        console.log('Initializing Alchemy with API key:', alchemyApiKey.substring(0, 5) + '...');
        
        const alchemy = new Alchemy({
            apiKey: alchemyApiKey,
            network: Network.ETH_MAINNET,
        });

        console.log('Fetching ENS name for address:', walletAddress);
        const ensName = await alchemy.core.lookupAddress(walletAddress);

        console.log('Fetching transaction count for address:', walletAddress);
        const transactionCount = await alchemy.core.getTransactionCount(walletAddress);

        console.log('Fetching NFT holdings for address:', walletAddress);
        const nfts = await alchemy.nft.getNftsForOwner(walletAddress);

        // Verification Logic
        const isVerified = ensName || transactionCount > 0 || nfts.ownedNfts.length > 0;

        return res.status(200).json({
            isVerified,
            ensName,
            transactionCount,
            nftCount: nfts.ownedNfts.length,
            nfts: nfts.ownedNfts
        });
    } catch (error) {
        console.error('Detailed error during on-chain verification:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        
        return res.status(500).json({
            message: 'Failed to verify on-chain data',
            error: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
}
