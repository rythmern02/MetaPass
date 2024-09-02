import React from "react";
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
interface UnstakeNftCollectionsProps {
  selectedUnStakeNfts: SelectedNFT[];
  setSelectedUnStakeNfts: React.Dispatch<React.SetStateAction<SelectedNFT[]>>;
  nftData: {
    [key: number]: {
      contractAddress: string;
      tokenIds: number[];
    };
  };
}

const UnstakeNftCollections: React.FC<UnstakeNftCollectionsProps> = ({
  nftData,
  selectedUnStakeNfts,
  setSelectedUnStakeNfts,
}) => {
  const [collections, setCollections] = React.useState<NFTCollection[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const nftABI = ["function tokenURI(uint256 tokenId) view returns (string)"];

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = provider.getSigner();
        return signer;
      } else {
        setError("Please install MetaMask!");
        return null;
      }
    } catch (err) {
      setError("Failed to connect wallet.");
      return null;
    }
  };

  const fetchUnstakeNftCollections = async () => {
    const signer = await connectWallet();
    if (!signer) return;

    const provider = signer.provider;

    const convertIpfsUrlToHttp = (url: string) => {
      if (url.startsWith("ipfs://")) {
        return url.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return url;
    };

    const newCollections: NFTCollection[] = [];

    for (const key in nftData) {
      if (nftData.hasOwnProperty(key)) {
        const { contractAddress, tokenIds } = nftData[key];

        try {
          const contract = new ethers.Contract(contractAddress, nftABI, provider);
          const nfts: NFT[] = [];

          for (const tokenId of tokenIds) {
            const tokenURI = await contract.tokenURI(tokenId);
            const metadata = await fetch(convertIpfsUrlToHttp(tokenURI)).then(
              (response) => response.json()
            );
            console.log("this is the nft metadata: ", metadata)
            const imageUrl =
              convertIpfsUrlToHttp(metadata.image) ||
              convertIpfsUrlToHttp(metadata.image_url);

              console.log("this is the imageURI: ", imageUrl);
            nfts.push({
              tokenId: tokenId.toString(),
              tokenURI,
              imageUrl,
            });
          }

          newCollections.push({
            contractAddress,
            nfts,
          });
        } catch (err) {
          console.error(`Error fetching NFTs from ${contractAddress}:`, err);
        }
      }
    }

    // Avoid duplicating collections
    setCollections((prevCollections) => {
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
  };

  React.useEffect(() => {
    fetchUnstakeNftCollections();
  }, [nftData]); // Depend on nftData to refetch when it changes

  const handleSelectNFT = (nft: SelectedNFT) => {
    setSelectedUnStakeNfts((prevSelectedNfts) => {
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
      {collections.length > 0 ? (
        collections.map((collection) => (
          <div key={collection.contractAddress} className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-200">
              Collection Address: {collection.contractAddress}
            </h3>
            <div className="grid grid-cols sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {collection.nfts.map((nft) => (
                <button
                  key={nft.tokenId}
                  onClick={() =>
                    handleSelectNFT({
                      tokenId: nft.tokenId,
                      contractAddress: collection.contractAddress,
                    })
                  }
                  className={`border rounded-lg p-2 transition-transform transform hover:scale-105 ${
                    selectedUnStakeNfts.find(
                      (selectedNft) =>
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
        <p className="text-gray-300">
          No NFT collections found in this wallet.
        </p>
      )}
    </div>
  );
};

export default UnstakeNftCollections;
