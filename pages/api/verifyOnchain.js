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
                message: 'Server configuration error: Alchemy API key is missing'
            });
        }

        const alchemy = new Alchemy({
            apiKey: alchemyApiKey,
            network: Network.ETH_MAINNET,
        });

        // Fetch wallet verification data
        const [ensName, transactionCount, nfts] = await Promise.all([
            alchemy.core.lookupAddress(walletAddress),
            alchemy.core.getTransactionCount(walletAddress),
            alchemy.nft.getNftsForOwner(walletAddress)
        ]);

        // Wallet is verified if it has either:
        // - An ENS name
        // - Past transactions
        // - NFT holdings
        const isVerified = Boolean(
            ensName || 
            transactionCount > 0 || 
            nfts.ownedNfts.length > 0
        );

        return res.status(200).json({
            isVerified,
            ensName,
            transactionCount,
            nftCount: nfts.ownedNfts.length
        });
    } catch (error) {
        console.error('Error during wallet verification:', error);
        return res.status(500).json({
            message: 'Failed to verify wallet',
            error: error.message
        });
    }
}
