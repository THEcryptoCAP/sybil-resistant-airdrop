import { useState } from 'react';
import { ethers } from 'ethers';
import YapsAirdropABI from '../contracts/YapsAirdrop.json';

const ClaimAirdrop = ({ address, twitterUsername, isEligible }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const claimAirdrop = async () => {
        try {
            setIsLoading(true);
            setError('');
            setSuccess('');

            if (!window.ethereum) {
                throw new Error('Please install MetaMask to claim airdrop');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Contract address - replace with your deployed contract address
            const contractAddress = process.env.NEXT_PUBLIC_YAPS_AIRDROP_ADDRESS;
            const contract = new ethers.Contract(
                contractAddress,
                YapsAirdropABI,
                signer
            );

            // Check if already claimed
            const hasClaimed = await contract.hasUserClaimed(address);
            if (hasClaimed) {
                setError('You have already claimed your airdrop');
                return;
            }

            // Claim airdrop
            const tx = await contract.claimAirdrop(twitterUsername);
            await tx.wait();

            setSuccess('Successfully claimed airdrop!');
        } catch (err) {
            console.error('Error claiming airdrop:', err);
            setError(err.message || 'Failed to claim airdrop');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isEligible) {
        return null;
    }

    return (
        <div className="mt-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    {success}
                </div>
            )}
            <button
                onClick={claimAirdrop}
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${
                    isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {isLoading ? 'Claiming...' : 'Claim Airdrop'}
            </button>
        </div>
    );
};

export default ClaimAirdrop; 