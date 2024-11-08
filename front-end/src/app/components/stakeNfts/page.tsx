"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// Define the NFT and collection types
type NFT = {
  tokenId: string;
  tokenURI: string;
  imageUrl: string;
};

type NFTCollection = {
  contractAddress: string;
  nfts: NFT[];
};

type SelectedNFT = {
  tokenId: string;
  contractAddress: string;
};


const NFTCollections: React.FC<any> = ({
  collections,
  setCollections,
  selectedNfts,
  setSelectedNfts,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  const connectWallet = async () => {
    try {
      if (typeof window?.ethereum !== "undefined") {
        await window?.ethereum?.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window?.ethereum);
        const signer = provider?.getSigner();
        return signer;
      } else {
        setError("Please install MetaMask!");
        alert("Wallet not detected");
        return null;
      }
    } catch (err) {
      setError("Failed to connect wallet.");
      return null;
    }
  };

  const fetchNFTCollectionsFromAlchemy = async () => {
    setLoading(true); // Start loading
    const signer = await connectWallet();
    if (!signer) {
      setLoading(false); // Stop loading if wallet connection fails
      return;
    }

    const userAddress = await signer.getAddress();

    try {
      // Fetch NFTs owned by the user from Alchemy API
      const alchemyApiKey = "Vpv0tWV1M_lyb7531yHUsR_pEbmqedvp"; // Replace with your Alchemy API key
      const url = `https://zksync-sepolia.g.alchemy.com/v2/${alchemyApiKey}/getNFTs/?owner=${userAddress}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data?.ownedNfts?.length > 0) {
        const newCollections: NFTCollection[] = [];

        data.ownedNfts.forEach((nft: any) => {
          const existingCollection = newCollections.find(
            (collection) => collection.contractAddress === nft.contract.address
          );

          const nftData: NFT = {
            tokenId: nft.id.tokenId,
            tokenURI: nft.tokenUri.raw,
            imageUrl: nft.media[0]?.gateway || "", // Use the direct image URL
          };

          if (existingCollection) {
            existingCollection.nfts.push(nftData);
          } else {
            newCollections.push({
              contractAddress: nft.contract.address,
              nfts: [nftData],
            });
          }
        });

        // Avoid duplicating collections
        setCollections((prevCollections: NFTCollection[]) => {
          const mergedCollections = [...prevCollections];

          newCollections.forEach((newCollection) => {
            const existingCollection = mergedCollections.find(
              (collection) =>
                collection.contractAddress === newCollection.contractAddress
            );

            if (!existingCollection) {
              mergedCollections.push(newCollection);
            }
          });

          return mergedCollections;
        });
      } else {
        setError("No NFTs found for this address.");
      }
    } catch (error) {
      setError("Failed to fetch NFTs from Alchemy.");
      console.error("Error fetching NFTs from Alchemy:", error);
    }

    setLoading(false); // Stop loading once fetching is complete
  };

  useEffect(() => {
    fetchNFTCollectionsFromAlchemy(); // Fetch NFTs on mount
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const handleSelectNFT = (nft: SelectedNFT) => {
    setSelectedNfts((prevSelectedNfts: SelectedNFT[]) => {
      const alreadySelected = prevSelectedNfts.find(
        (selectedNft) =>
          selectedNft.tokenId === nft.tokenId &&
          selectedNft.contractAddress === nft.contractAddress
      );

      if (alreadySelected) {
        return prevSelectedNfts.filter(
          (selectedNft) =>
            selectedNft.tokenId !== nft.tokenId ||
            selectedNft.contractAddress !== nft.contractAddress
        );
      } else {
        return [...prevSelectedNfts, nft];
      }
    });
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? ( // Check if loading is true
        <p className="text-gray-300">Loading NFTs...</p>
      ) : collections?.length > 0 ? (
        collections.map((collection: any) => (
          <div key={collection.contractAddress} className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-200">
              Collection Address: {collection.contractAddress}
            </h3>
            <div className="grid grid-cols sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {collection.nfts.map((nft: any) => (
                <button
                  key={nft?.tokenId}
                  onClick={() =>
                    handleSelectNFT({
                      tokenId: nft.tokenId,
                      contractAddress: collection.contractAddress,
                    })
                  }
                  className={`border rounded-lg p-2 transition-transform transform hover:scale-105 ${
                    selectedNfts.find(
                      (selectedNft: any) =>
                        selectedNft.tokenId === nft.tokenId &&
                        selectedNft.contractAddress ===
                          collection.contractAddress
                    )
                      ? "border-blue-500"
                      : "border-gray-700"
                  }`}
                >
                  <div className="relative rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={nft.imageUrl}
                      alt={nft.tokenURI}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-300">No NFT collections found in this wallet.</p>
      )}
    </div>
  );
};

export default NFTCollections;
