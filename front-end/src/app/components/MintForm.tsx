"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConfig,
} from "wagmi";
import { parseEther } from "viem";
import { contractABI as membershipNFTAbi } from "../../../abi"; // Ensure correct path
import { marketplaceAbi } from "../../../marketplaceabi"; // Ensure correct path
import { getPublicClient } from "wagmi/actions";

// Replace with your actual contract addresses
const MEMBERSHIP_CONTRACT_ADDRESS =
  "0x21132b6e3271BCfA36C5fA650f7A4F161bFa9f95";
const MARKETPLACE_CONTRACT_ADDRESS =
  "0x712227dc4c784e5e0a1ec7afad7baa1dc01b9cb4";

export default function MintForm() {
  // State management
  const [membershipName, setMembershipName] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [tier, setTier] = useState<number | null>(null);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wagmi hooks
  const config = useConfig();
  const PublicClient: any = getPublicClient(config);
  const { address, isConnected } = useAccount();
  const { writeContract, isPending: isWritePending } = useWriteContract();
  const { isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: tokenId ? undefined : undefined,
  });

  // Mint Membership NFT
  const handleMint = async () => {
    // Validate inputs
    if (!isConnected) {
      setError("Please connect your wallet to mint a membership NFT.");
      return;
    }

    if (!membershipName || !metadataURI || tier === null) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setIsMinting(true);
      setError(null);

      // Write to contract
      const hash = await writeContract({
        abi: membershipNFTAbi,
        address: MEMBERSHIP_CONTRACT_ADDRESS,
        functionName: "mint",
        args: [address!, metadataURI, BigInt(tier!)],
      });

      // Wait for transaction and extract token ID
      const receipt = await PublicClient.waitForTransactionReceipt({ hash });
      const tokenIdFromLogs = extractTokenIdFromLogs(receipt.logs);

      if (tokenIdFromLogs !== null) {
        setTokenId(tokenIdFromLogs);
      }
    } catch (error) {
      console.error("Error during minting:", error);
      setError("Minting failed. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  // List Minted NFT on Marketplace
  const handleList = async () => {
    if (!tokenId) {
      setError("Token ID not available for listing. Please mint first.");
      return;
    }

    try {
      setIsListing(true);
      setError(null);

      // List NFT on marketplace
      await writeContract({
        abi: marketplaceAbi,
        address: MARKETPLACE_CONTRACT_ADDRESS,
        functionName: "listNFT",
        args: [
          MEMBERSHIP_CONTRACT_ADDRESS,
          tokenId,
          parseEther("0.1"), // Example listing price
        ],
      });

      alert("Token successfully listed on the marketplace!");
    } catch (error) {
      console.error("Error during listing:", error);
      setError("Listing failed. Please try again.");
    } finally {
      setIsListing(false);
    }
  };

  // Utility function to extract token ID from mint logs
  const extractTokenIdFromLogs = (logs: any[]) => {
    // Implement logic to extract token ID from transaction logs
    // This will depend on your specific contract's event structure
    // Example (pseudo-code):
    // const tokenIdLog = logs.find(log => log.eventName === 'NFTMinted');
    // return tokenIdLog ? tokenIdLog.args.tokenId : null;
    return null; // Replace with actual implementation
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-50" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            Mint Membership NFT
          </h2>

          {error && (
            <div className="mb-4 text-red-500 text-center">{error}</div>
          )}

          {!tokenId && (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Membership Name"
                  value={membershipName}
                  onChange={(e) => setMembershipName(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-purple-500 focus:border-pink-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Metadata URI (e.g., IPFS URL)"
                  value={metadataURI}
                  onChange={(e) => setMetadataURI(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-purple-500 focus:border-pink-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Membership Tier (1-3)"
                  value={tier || ""}
                  onChange={(e) => setTier(Number(e.target.value))}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-purple-500 focus:border-pink-500 focus:outline-none"
                  required
                  min={1}
                  max={3}
                />
              </div>
              <button
                onClick={handleMint}
                className="w-full bg-purple-600 hover:bg-purple-700 transition-colors duration-300 text-white py-3 rounded-lg relative overflow-hidden group"
                disabled={isMinting || isWritePending}
              >
                <span className="relative z-10">
                  {isMinting || isWritePending
                    ? "Minting..."
                    : "Mint Membership"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </>
          )}

          {tokenId && (
            <button
              onClick={handleList}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white py-3 mt-6 rounded-lg relative overflow-hidden group"
              disabled={isListing}
            >
              <span className="relative z-10">
                {isListing ? "Listing..." : "List on Marketplace"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          )}

          {tokenId && (
            <p className="mt-4 text-center text-green-400">
              Token ID: {tokenId.toString()} minted successfully! Ready for
              listing.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
