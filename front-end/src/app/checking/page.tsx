"use client"
import React, { useState } from "react";
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


// Define the props for the component
interface NFTCollectionsProps {
  selectedNfts: SelectedNFT[];
  setSelectedNfts: React.Dispatch<React.SetStateAction<SelectedNFT[]>>;
  potentialNftAddresses: string[];
  collections: NFTCollection[];
  setCollections: React.Dispatch<React.SetStateAction<NFTCollection[]>>;
}

const NFTCollections: React.FC<any> = ({
  collections,
  setCollections,
  potentialNftAddresses,
  selectedNfts,
  setSelectedNfts,
}) => {
  const [error, setError] = useState<any>(null);

  const nftABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
  ];

  const connectWallet = async () => {
    try {
      if (typeof window?.ethereum !== "undefined") {
        await window?.ethereum?.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window?.ethereum);
        const signer = provider?.getSigner();
        return signer;
      } else {
        setError("Please install MetaMask!");
        alert("wallet not detected");
        return null;
      }
    } catch (err) {
      setError("Failed to connect wallet.");
      return null;
    }
  };

  const fetchNFTCollections = async () => {
    const signer = await connectWallet();
    if (!signer) return;

    const userAddress = await signer.getAddress();
    const provider = signer.provider;

    const convertIpfsUrlToHttp = (url: string) => {
      if (url.startsWith("ipfs://")) {
        return url.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return url;
    };

    const newCollections: NFTCollection[] = [];

    for (let address of potentialNftAddresses) {
      try {
        const contract = new ethers.Contract(address, nftABI, provider);
        const balance = await contract.balanceOf(userAddress);

        if (balance > 0) {
          const nfts: NFT[] = [];
          for (let i = 0; i < balance; i++) {
            const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
            const tokenURI = await contract.tokenURI(tokenId);

            const metadata = await fetch(convertIpfsUrlToHttp(tokenURI)).then(
              (response) => response.json()
            );
            const imageUrl =
              convertIpfsUrlToHttp(metadata.image) ||
              convertIpfsUrlToHttp(metadata.image_url);

            nfts.push({
              tokenId: tokenId.toString(),
              tokenURI,
              imageUrl,
            });
          }

          newCollections.push({
            contractAddress: address,
            nfts,
          });
        }
      } catch (err) {
        console.error(`Error fetching NFTs from ${address}:`, err);
      }
    }

    // Avoid duplicating collections
    setCollections((prevCollections: any) => {
      const mergedCollections = [...prevCollections];

      newCollections.forEach((newCollection) => {
        const existingCollection = mergedCollections.find(
          (collection) => collection.contractAddress === newCollection.contractAddress
        );

        if (!existingCollection) {
          mergedCollections.push(newCollection);
        }
      });

      return mergedCollections;
    });
  };

  React.useEffect(() => {
    fetchNFTCollections();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const handleSelectNFT = (nft: SelectedNFT) => {
    setSelectedNfts((prevSelectedNfts: any) => {
      const alreadySelected = prevSelectedNfts.find(
        (selectedNft: any) =>
          selectedNft.tokenId === nft.tokenId &&
          selectedNft.contractAddress === nft.contractAddress
      );

      if (alreadySelected) {
        return prevSelectedNfts.filter(
          (selectedNft: any) =>
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
      {collections?.length > 0 ? (
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
                      (selectedNft : any) =>
                        selectedNft.tokenId === nft.tokenId &&
                        selectedNft.contractAddress === collection.contractAddress
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
