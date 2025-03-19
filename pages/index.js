// pages/index.js
import { useState, useEffect } from "react";
import WalletConnect from "../components/WalletConnect";
import axios from "axios";

export default function Home() {
    const [connectedWallet, setConnectedWallet] = useState(null);
    const [username, setUsername] = useState("");
    const [yapsScore, setYapsScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    // New state variables for on-chain verification
    const [onchainData, setOnchainData] = useState(null);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationError, setVerificationError] = useState("");

    // Wallet connection handler
    const handleWalletConnected = (address) => {
        console.log("Wallet Connected:", address);
        setConnectedWallet(address);
        // Trigger on-chain verification when wallet is connected
        verifyOnchain(address);
    };

    // On-chain verification handler
    const verifyOnchain = async (address) => {
        setVerificationLoading(true);
        setVerificationError("");
        setOnchainData(null);

        try {
            const response = await axios.get(`/api/verifyOnchain?walletAddress=${address}`);
            setOnchainData(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to verify on-chain data";
            setVerificationError(errorMessage);
            console.error("Error verifying on-chain data:", err);
        } finally {
            setVerificationLoading(false);
        }
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

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>Sybil-Resistant Airdrop</h1>
            <WalletConnect onWalletConnected={handleWalletConnected} />

            {connectedWallet && (
                <>
                    {/* On-chain Verification Section */}
                    <div style={{ margin: "20px 0", padding: "15px", border: "1px solid #333", borderRadius: "8px" }}>
                        <h3>On-Chain Verification</h3>
                        {verificationLoading ? (
                            <p>Verifying on-chain data...</p>
                        ) : verificationError ? (
                            <p style={{ color: "red" }}>{verificationError}</p>
                        ) : onchainData ? (
                            <>
                                <p style={{ color: onchainData.isVerified ? "green" : "red" }}>
                                    {onchainData.isVerified ? "✅ Verified Wallet" : "❌ Unverified Wallet"}
                                </p>
                                {onchainData.ensName && (
                                    <p>ENS Name: {onchainData.ensName}</p>
                                )}
                                <p>Transaction Count: {onchainData.transactionCount}</p>
                                <p>NFT Holdings: {onchainData.nftCount}</p>
                            </>
                        ) : null}
                    </div>

                    {/* Yaps Score Section */}
                    <div style={{ margin: "20px 0" }}>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter 𝕏 Username"
                            style={{ padding: "8px", marginRight: "10px" }}
                        />
                        <button 
                            onClick={fetchYapsScore} 
                            style={{ padding: "8px" }}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Fetch Yaps Score"}
                        </button>
                    </div>

                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {yapsScore && (
                        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #4caf50", borderRadius: "8px" }}>
                            <h3>Yaps Score for @{username}:</h3>
                            <p>All Time: {yapsScore.yaps_all}</p>
                            <p>Last 24 Hours: {yapsScore.yaps_l24h}</p>
                            <p>Last 7 Days: {yapsScore.yaps_l7d}</p>
                            <p>Last 30 Days: {yapsScore.yaps_l30d}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
