import { useState } from "react";
import { ethers } from "ethers";

export default function WalletConnect({ onWalletConnected }) {
    const [walletAddress, setWalletAddress] = useState(null);

    // Connect to MetaMask
    async function connectWallet() {
        if (!window.ethereum) {
            alert("Please install MetaMask first!");
            return;
        }

        try {
            // Create a new provider using the current ethers syntax
            const provider = new ethers.BrowserProvider(window.ethereum);
            
            // Request accounts from MetaMask
            const accounts = await provider.send("eth_requestAccounts", []);
            setWalletAddress(accounts[0]);

            // Notify parent component with wallet address
            onWalletConnected(accounts[0]);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    }

    return (
        <div style={{ padding: "10px", border: "2px solid #4caf50", borderRadius: "8px" }}>
            <button onClick={connectWallet} style={{ padding: "10px", cursor: "pointer" }}>
                {walletAddress ? `Connected: ${walletAddress}` : "Connect Wallet"}
            </button>
        </div>
    );
}

