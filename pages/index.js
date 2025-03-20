// pages/index.js
import { useState } from "react";
import WalletConnect from "../components/WalletConnect";
import axios from "axios";
import ClaimAirdrop from '../components/ClaimAirdrop';

export default function Home() {
    const [connectedWallet, setConnectedWallet] = useState(null);
    const [username, setUsername] = useState("");
    const [yapsScore, setYapsScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [verificationResult, setVerificationResult] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState("");
    const [verificationUsername, setVerificationUsername] = useState("");
    const [showVerificationInput, setShowVerificationInput] = useState(false);

    // Wallet connection handler
    const handleWalletConnected = (address) => {
        console.log("Wallet Connected:", address);
        setConnectedWallet(address);
        setShowVerificationInput(false);
        setVerificationUsername("");
        setVerificationResult(null);
    };

    // Fetch Yaps score handler
    const fetchYapsScore = async () => {
        if (!username.trim()) {
            setError("Please enter a username");
            return;
        }

        setLoading(true);
        setError("");
        setYapsScore(null);

        try {
            const response = await axios.get(`/api/getYapsScore?username=${encodeURIComponent(username.trim())}`);
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            setYapsScore(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch Yaps score";
            setError(errorMessage);
            console.error("Error fetching Yaps score:", err);
        } finally {
            setLoading(false);
        }
    };

    // Start verification process
    const startVerification = () => {
        setShowVerificationInput(true);
        setVerificationError("");
        setVerificationResult(null);
    };

    // Verify for airdrop handler
    const verifyForAirdrop = async () => {
        if (!connectedWallet) {
            setVerificationError("Please connect your wallet first");
            return;
        }

        if (!verificationUsername.trim()) {
            setVerificationError("Please enter your Twitter username");
            return;
        }

        setVerifying(true);
        setVerificationError("");
        setVerificationResult(null);

        try {
            // First get the Yaps score for the verification username
            const yapsResponse = await axios.get(`/api/getYapsScore?username=${encodeURIComponent(verificationUsername.trim())}`);
            
            // Check if we got a valid Yaps score
            if (!yapsResponse.data || typeof yapsResponse.data.yaps_all !== 'number') {
                throw new Error('Invalid Yaps score response');
            }

            const userYapsScore = yapsResponse.data.yaps_all || 0;

            // Then verify the wallet
            const walletResponse = await axios.get(`/api/verifyOnchain?walletAddress=${connectedWallet}`);
            
            if (!walletResponse.data || typeof walletResponse.data.isVerified !== 'boolean') {
                throw new Error('Invalid wallet verification response');
            }

            const isEligible = walletResponse.data.isVerified && (userYapsScore > 5);
            
            setVerificationResult({
                ...walletResponse.data,
                isEligible,
                yapsScore: userYapsScore,
                twitterUsername: verificationUsername,
                requirements: {
                    walletVerified: walletResponse.data.isVerified,
                    sufficientYapsScore: userYapsScore > 5
                }
            });
        } catch (err) {
            console.error('Verification error:', err);
            let errorMessage = 'Failed to verify eligibility. ';
            
            if (err.response?.status === 400) {
                errorMessage += 'Invalid input parameters. ';
            } else if (err.response?.status === 404) {
                errorMessage += 'Twitter username not found. ';
            } else if (err.response?.status === 401) {
                errorMessage += 'API authentication failed. ';
            }

            errorMessage += err.response?.data?.message || err.message || 'Please try again.';
            setVerificationError(errorMessage);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Sybil-Resistant Airdrop</h1>
            
            <div style={{ marginBottom: "30px" }}>
                <WalletConnect onWalletConnected={handleWalletConnected} />
            </div>

            {/* Yaps Score Section */}
            <div style={{ 
                margin: "20px 0",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9"
            }}>
                <h2>Check Yaps Score</h2>
                <div style={{ margin: "20px 0" }}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter 𝕏 Username"
                        style={{ 
                            padding: "10px",
                            width: "100%",
                            maxWidth: "300px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            marginRight: "10px"
                        }}
                    />
                    <button 
                        onClick={fetchYapsScore} 
                        style={{ 
                            padding: "10px 20px",
                            marginTop: "10px",
                            backgroundColor: "#1da1f2",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Fetch Yaps Score"}
                    </button>
                </div>

                {error && <p style={{ color: "red" }}>{error}</p>}
                {yapsScore && (
                    <div style={{ marginTop: "20px" }}>
                        <h3>Yaps Score for @{username}:</h3>
                        <p>All Time: {yapsScore.yaps_all}</p>
                        <p>Last 24 Hours: {yapsScore.yaps_l24h}</p>
                        <p>Last 7 Days: {yapsScore.yaps_l7d}</p>
                        <p>Last 30 Days: {yapsScore.yaps_l30d}</p>
                    </div>
                )}
            </div>

            {/* Verification Section */}
            {connectedWallet && (
                <div style={{ 
                    margin: "20px 0",
                    padding: "20px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9"
                }}>
                    <h2>Verify for Airdrop</h2>
                    <p style={{ 
                        marginBottom: "15px",
                        padding: "10px",
                        backgroundColor: "#e8e8e8",
                        borderRadius: "4px",
                        wordBreak: "break-all"
                    }}>
                        Connected Wallet: {connectedWallet}
                    </p>

                    {!showVerificationInput ? (
                        <button
                            onClick={startVerification}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Start Verification
                        </button>
                    ) : (
                        <div style={{ marginTop: "15px" }}>
                            <input
                                type="text"
                                value={verificationUsername}
                                onChange={(e) => setVerificationUsername(e.target.value)}
                                placeholder="Enter your Twitter username"
                                style={{ 
                                    padding: "10px",
                                    width: "100%",
                                    maxWidth: "300px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    marginRight: "10px"
                                }}
                            />
                            <button
                                onClick={verifyForAirdrop}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: verifying ? "not-allowed" : "pointer",
                                    marginTop: "10px"
                                }}
                                disabled={verifying}
                            >
                                {verifying ? "Verifying..." : "Verify Eligibility"}
                            </button>
                        </div>
                    )}

                    {verificationError && (
                        <p style={{ color: "red", marginTop: "10px" }}>{verificationError}</p>
                    )}

                    {verificationResult && (
                        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Verification Results</h2>
                            <div className="space-y-2">
                                <p><span className="font-semibold">Twitter Username:</span> {verificationUsername}</p>
                                <p><span className="font-semibold">Connected Wallet:</span> {connectedWallet}</p>
                                <p><span className="font-semibold">ENS Name:</span> {verificationResult.ensName || 'None'}</p>
                                <p><span className="font-semibold">Transaction Count:</span> {verificationResult.transactionCount}</p>
                                <p><span className="font-semibold">NFT Count:</span> {verificationResult.nftCount}</p>
                                <p><span className="font-semibold">Yaps Score:</span> {verificationResult.yapsScore}</p>
                                <p className={`font-bold ${verificationResult.isEligible ? 'text-green-600' : 'text-red-600'}`}>
                                    Status: {verificationResult.isEligible ? 'Eligible for Airdrop' : 'Not Eligible'}
                                </p>
                            </div>
                            
                            {verificationResult.isEligible && (
                                <ClaimAirdrop 
                                    address={connectedWallet}
                                    twitterUsername={verificationUsername}
                                    isEligible={verificationResult.isEligible}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
