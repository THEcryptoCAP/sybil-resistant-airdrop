import { useState } from 'react';
import { ethers } from 'ethers';
import ChainlinkFetcherABI from '../contracts/ChainlinkFetcher.json';

const ClaimAirdrop = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [twitterUsername, setTwitterUsername] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [showInputs, setShowInputs] = useState(false);

    const handleClaim = async () => {
        try {
            setIsLoading(true);
            setError('');
            setSuccess('');

            if (!window.ethereum) {
                throw new Error('Please install MetaMask to claim airdrop');
            }

            if (!twitterUsername.trim() || !walletAddress.trim()) {
                throw new Error('Please enter both Twitter username and wallet address');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Contract address - replace with your deployed contract address
            const contractAddress = process.env.NEXT_PUBLIC_CHAINLINK_FETCHER_ADDRESS;
            const contract = new ethers.Contract(
                contractAddress,
                ChainlinkFetcherABI.abi,
                signer
            );

            // Call claimAirdrop function
            const tx = await contract.claimAirdrop(twitterUsername, walletAddress);
            await tx.wait();

            setSuccess('Successfully claimed airdrop!');
            setShowInputs(false);
            setTwitterUsername('');
            setWalletAddress('');
        } catch (err) {
            console.error('Error claiming airdrop:', err);
            setError(err.message || 'Failed to claim airdrop');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4">
            {!showInputs ? (
                <button
                    onClick={() => setShowInputs(true)}
                    className="w-full py-2 px-4 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700"
                >
                    Claim Airdrop
                </button>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Twitter Username</label>
                        <input
                            type="text"
                            value={twitterUsername}
                            onChange={(e) => setTwitterUsername(e.target.value)}
                            placeholder="Enter your Twitter username"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
                        <input
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            placeholder="Enter your wallet address"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {success}
                        </div>
                    )}
                    <div className="flex space-x-4">
                        <button
                            onClick={handleClaim}
                            disabled={isLoading}
                            className={`flex-1 py-2 px-4 rounded-lg text-white font-semibold ${
                                isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isLoading ? 'Claiming...' : 'Confirm Claim'}
                        </button>
                        <button
                            onClick={() => {
                                setShowInputs(false);
                                setTwitterUsername('');
                                setWalletAddress('');
                                setError('');
                                setSuccess('');
                            }}
                            className="flex-1 py-2 px-4 rounded-lg text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimAirdrop; 