import { useState, useEffect } from 'react';
import axios from 'axios';

const AirDropEligibility = ({ walletAddress, twitterUsername }) => {
    const [eligibilityStatus, setEligibilityStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkEligibility = async () => {
        if (!walletAddress || !twitterUsername) {
            setError('Both wallet address and Twitter username are required');
            return;
        }

        setLoading(true);
        setError(null);
        setEligibilityStatus(null);

        try {
            // Fetch on-chain verification
            const onchainResponse = await axios.get(`/api/verifyOnchain?walletAddress=${walletAddress}`);
            const isWalletVerified = onchainResponse.data.isVerified;

            // Fetch Yaps score
            const yapsResponse = await axios.get(`/api/getYapsScore?username=${encodeURIComponent(twitterUsername.trim())}`);
            const yapsScore = yapsResponse.data.yaps_all || 0;

            // Determine eligibility
            const isEligible = isWalletVerified && yapsScore > 5;

            setEligibilityStatus({
                eligible: isEligible,
                reason: isEligible 
                    ? "Congrats! Eligible for the airdrop."
                    : `Not eligible. ${!isWalletVerified ? 'Wallet not verified. ' : ''}${yapsScore <= 5 ? 'Yaps score too low. ' : ''}`,
                details: {
                    walletVerified: isWalletVerified,
                    yapsScore: yapsScore,
                    onchainData: onchainResponse.data,
                    yapsData: yapsResponse.data
                }
            });
        } catch (err) {
            console.error('Error checking eligibility:', err);
            setError(err.response?.data?.message || err.message || 'Failed to check eligibility');
        } finally {
            setLoading(false);
        }
    };

    // Check eligibility whenever wallet address or twitter username changes
    useEffect(() => {
        if (walletAddress && twitterUsername) {
            checkEligibility();
        }
    }, [walletAddress, twitterUsername]);

    return (
        <div style={{ 
            padding: '20px',
            margin: '20px 0',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <h2>Airdrop Eligibility Check</h2>
            
            {loading && (
                <div style={{ color: '#666' }}>
                    Checking eligibility...
                </div>
            )}

            {error && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                    Error: {error}
                </div>
            )}

            {eligibilityStatus && !loading && !error && (
                <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: eligibilityStatus.eligible ? '#e7f7e7' : '#fff0f0',
                    border: `1px solid ${eligibilityStatus.eligible ? '#4caf50' : '#ff6b6b'}`,
                    borderRadius: '6px'
                }}>
                    <h3 style={{ 
                        color: eligibilityStatus.eligible ? '#2e7d32' : '#d32f2f',
                        margin: '0 0 10px 0'
                    }}>
                        {eligibilityStatus.eligible ? '🎉 ' : '❌ '}
                        {eligibilityStatus.reason}
                    </h3>
                    
                    <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
                        <p>Wallet Status: {eligibilityStatus.details.walletVerified ? '✅ Verified' : '❌ Not Verified'}</p>
                        <p>Yaps Score: {eligibilityStatus.details.yapsScore}</p>
                        
                        {eligibilityStatus.details.onchainData.ensName && (
                            <p>ENS Name: {eligibilityStatus.details.onchainData.ensName}</p>
                        )}
                        <p>Transaction Count: {eligibilityStatus.details.onchainData.transactionCount}</p>
                        <p>NFT Holdings: {eligibilityStatus.details.onchainData.nftCount}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AirDropEligibility;
