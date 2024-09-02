"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
} from "viem";
import { baseSepolia } from "viem/chains";
import { useAccount, useWriteContract } from "wagmi";

import { contractABI } from "../../abi";
import NFTCollections from "./checking/page";
import UnstakeNftCollections from "./unstake/page";
import { ethers } from "ethers";

interface Nfts {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}
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

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const [claimedPoints, setClaimedPoints] = useState<number | null>(null);
  const [earnedRewards, setEarnedRewards] = useState<number | null>(null);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [nftCollectionAddresses, setNftCollectionAddresses] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState<SelectedNFT[]>([]);
  const [selectedUnStakeNFTs, setSelectedUnStakeNFTs] = useState<any>([]);
  const [toUnStakeNfts, setToUnstakeNfts] = useState<any>([]);
  const [nftAddress, setNftAddress] = useState("");
  const [redeemNftAddress, setRedeemNftAddress] = useState("");
  const [rewardTokenAddress, setRewardTokenAddress] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(
      process.env.NEXT_PUBLIC_ALCHEMY_TRANSPORT_URL
    ),
  });

  const [walletClient, setWalletClient] = useState<any>(null);

  useEffect(() => {
    const client = createWalletClient({
      chain: baseSepolia,
      transport: custom(window.ethereum!),
    });
    setWalletClient(client);
    initializeContract();
    getnftCollectionAddresses();
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    console.log(collections);
  };

  const toggleModal2 = () => {
    setIsModalOpen2(!isModalOpen2);
  };

  const toggleModal3 = () => {
    setIsModalOpen3(!isModalOpen3);
  };

  const { address: accountAddress }: any = useAccount();
  const StakingContractAddress: any = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const { writeContract } = useWriteContract();

  async function initializeContract() {
    console.log("here is the contract address: ", StakingContractAddress);
    const contract = getContract({
      address: StakingContractAddress,
      abi: contractABI,
      client: {
        public: client,
        wallet: walletClient,
      },
    });
    setContract(contract);
    try {
      const result = await contract.read.pointsPerDay([]);
      console.log("Points per day:", result);
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  }

  useEffect(() => {
    if (accountAddress) {
      viewUserInfo();
    }
  }, [accountAddress]);

  const getPointsAndRewards = async () => {};

  const amountInWei: bigint = BigInt(100000000000000);

  const stakeNFTs = async () => {
    try {
      console.log("hello this is rn debuggin before the abi");
      // Group token IDs by collection address
      const collections = selectedNFTs.reduce((acc, nft) => {
        if (!acc[nft.contractAddress]) {
          acc[nft.contractAddress] = [];
        }
        acc[nft.contractAddress].push(nft.tokenId);
        return acc;
      }, {} as Record<string, string[]>);

      // ERC-721 ABI for setApprovalForAll
      const erc721ABI = [
        "function setApprovalForAll(address operator, bool approved)",
        "function isApprovedForAll(address owner, address operator) view returns (bool)",
      ];
      console.log("hello this is rn debuggin after the abi");
      const Pprovider = await new ethers.BrowserProvider(window.ethereum);
      const signer = await Pprovider.getSigner();
      // Iterate over each collection address
      for (const [collectionAddress, tokenIds] of Object.entries(collections)) {
        console.log(`Processing collection: ${collectionAddress}`);

        // Initialize the ERC-721 contract
        const nftContract = new ethers.Contract(
          collectionAddress,
          erc721ABI,
          signer
        );
        console.log("this is the initialized contract: ", await nftContract);
        // Check if the staking contract is already approved
        const isApproved = await nftContract.isApprovedForAll(
          accountAddress,
          StakingContractAddress
        );
        console.log("hello this is rn  after the result: ", await isApproved);

        if (!isApproved) {
          // Approve all tokens in the collection for the staking contract
          const approvalRequest = await nftContract.setApprovalForAll(
            StakingContractAddress,
            true
          );
          console.log("Approval transaction sent:", approvalRequest.hash);

          // Await the approval request to be confirmed
          await approvalRequest.wait();
          console.log("Approval confirmed:", approvalRequest.hash);
        } else {
          console.log("Staking contract is already approved.");
        }

        // Stake the tokens after approval is done
        const stakeRequest = await walletClient.writeContract({
          address: StakingContractAddress,
          abi: contractABI,
          functionName: "stake",
          args: [
            collectionAddress, // Single collection address
            tokenIds, // Array of token IDs
          ],
          account: accountAddress,
        });

        // Await the staking request to be sent
        console.log("Stake request sent");
        await stakeRequest;
      }

      // Redirect after staking
      window.location.href = "/";
    } catch (error) {
      console.error("Error in staking NFTs:", error);
      alert(`Transaction failed due to this error: ${error}`);
    }
  };

  const addCollection = async () => {
    try {
      const { request } = await walletClient.writeContract({
        address: StakingContractAddress,
        abi: contractABI,
        functionName: "addCollection",
        args: [nftAddress, rewardTokenAddress],
        account: accountAddress,
        value: amountInWei,
      });
      return await request;
    } catch (error) {
      alert(`Transaction failed due to this error: ${error}`);
    }
  };

  const claimPoints = async () => {
    try {
      const { request } = await walletClient.writeContract({
        address: StakingContractAddress,
        abi: contractABI,
        functionName: "claimPoints",
        args: [],
        account: accountAddress,
      });
      return await request;
    } catch (error) {
      alert(`Transaction failed due to this error: ${error}`);
    }
  };

  const withdraw = async () => {
    try {
      // Create an object to group token IDs by contract address
      const groupedTokens: any = {};

      // Group token IDs by contract address
      for (const key in selectedUnStakeNFTs) {
        if (selectedUnStakeNFTs.hasOwnProperty(key)) {
          const { contractAddress, tokenId } = selectedUnStakeNFTs[key];
          if (!groupedTokens[contractAddress]) {
            groupedTokens[contractAddress] = [];
          }
          groupedTokens[contractAddress].push(tokenId);
        }
      }

      // Iterate over each contract address and withdraw all tokens in a single transaction
      for (const contractAddress in groupedTokens) {
        if (groupedTokens.hasOwnProperty(contractAddress)) {
          const tokenIds = groupedTokens[contractAddress];

          console.log(
            `Withdrawing from collection: ${StakingContractAddress} with the tokenIds: ${tokenIds}`
          );

          const { request } = await walletClient.writeContract({
            address: StakingContractAddress, // Use the staking contract's address here if different
            abi: contractABI,
            functionName: "withdraw",
            args: [contractAddress, tokenIds], // Pass the collection address and array of token IDs
            account: accountAddress,
          });

          // Await the withdrawal request to be sent
          console.log("Withdraw request sent");
          await request;

          // Check if the transaction was successful
          if (request.status === "SUCCESS") {
            alert("Unstaking successful!");

            // Redirect to the desired URL after successful transaction
            window.location.href = "/";
          } else {
            alert("Transaction failed.");
          }
        }
      }
    } catch (error) {
      console.error("Error in unstaking NFTs:", error);
      alert(`Transaction failed due to this error: ${error}`);
    }
  };

  const startHarvest = async () => {
    try {
      const { request } = await walletClient.writeContract({
        address: StakingContractAddress,
        abi: contractABI,
        functionName: "harvest",
        args: [redeemNftAddress],
        account: accountAddress,
      });
      return await request;
    } catch (error) {
      alert(`Transaction failed due to this error: ${error}`);
    }
  };

  const getnftCollectionAddresses = async () => {
    try {
      const nftCollectionAddresses: any = await client.readContract({
        address: StakingContractAddress,
        abi: contractABI,
        functionName: "getAllCollectionAddresses",
        args: [],
      });
      console.log("The nftCollectionAddresses are: ", nftCollectionAddresses);
      setNftCollectionAddresses(nftCollectionAddresses);
      return nftCollectionAddresses;
    } catch (error) {
      console.error("Error fetching NFT collection addresses:", error);
    }
  };

  const getAvailableToUnstakeNfts = async () => {
    try {
      const AvailableToUnstakeNfts: any = await client.readContract({
        address: StakingContractAddress,
        abi: contractABI,
        functionName: "getAvailableToUnstake",
        args: [accountAddress],
      });
      setToUnstakeNfts(AvailableToUnstakeNfts);
      return getAvailableToUnstakeNfts;
    } catch (error) {
      console.error("Error fetching NFT collection addresses:", error);
    }
  };

  const viewUserInfo = async () => {
    try {
      const userInfo: any = await client.readContract({
        address: StakingContractAddress,
        abi: contractABI,
        functionName: "viewUserInfo",
        args: [accountAddress],
      });
      console.log("the user info is : ", userInfo);
      setUserInfo(userInfo);
      return userInfo;
    } catch (error) {
      console.error("Error fetching NFT collection addresses:", error);
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-between p-6 md:p-12 lg:p-24 min-h-screen">
      {/* stake Nfts or Stake Tokens */}
      <div className="relative grid grid-cols-2  mt-[80px] md:mt-[100px] lg:mt-[130px] z-10 font-urbanist  md:hidden">
        <div className="text-2xl">Stake NFTs</div>
        <div className="text-2xl">Stake Tokens</div>
      </div>
      {/* the very first flex box containing all the points */}
      <div className="relative backdrop-blur-[2px] z-10 mt-10">
        <Image
          src={"/assets/frame-bg.svg"}
          width={1130}
          height={300}
          alt=""
          className="w-screen max-w-[1130px] h-auto hidden md:block"
        />
        <Image
          src={"/assets/bg-box.svg"}
          width={300}
          height={200}
          alt=""
          className="w-screen max-w-[1130px] h-[50vh] md:hidden"
        />
        <div className="absolute inset-0 flex flex-col md:flex-row  md:mt-0 gap-1 md:gap-8 lg:gap-12 justify-center items-center sm:py-10 md:p-6  z-20 text-white">
          <div className="flex flex-col items-center gap-4 md:gap-4 w-full md:w-[25%]">
            <h2 className="text-center text-[22px] mt-2 sm:text-[15px] lg:text-[18px]  font-urbanist">
              Earned Points
            </h2>
            <h2 className="text-center relative bottom-[6px] text-[22px] sm:text-[15px] lg:text-[18px] font-urbanist">
              {userInfo ? Number(userInfo[0]) : "Loading..."}
            </h2>
          </div>
          <div className="text-center  hidden md:block  w-[1px] h-[90px]  bg-white"></div>
          <div className="flex flex-col items-center gap-2 md:gap-4 w-full md:w-[25%]">
            <h2 className="text-center text-[22px] sm:text-[15px] lg:text-[18px] font-urbanist">
              Claimed Point
            </h2>
            <h2 className="text-center  text-[22px] sm:text-[15px] lg:text-xl font-urbanist">
              {userInfo ? Number(userInfo[1]) : "Loading..."}
            </h2>
          </div>
          <div className="hidden md:block w-[1px] h-[90px]  bg-white"></div>
          <div className="flex flex-col items-center gap-2 md:gap-4 w-full md:w-[25%]">
            <h2 className="text-center text-[22px] sm:text-[15px] lg:text-[18px] font-urbanist">
              Earned Reward
            </h2>
            <h2 className="text-center text-[22px] sm:text-[15px] lg:text-[18px] font-urbanist">
              {userInfo ? Number(userInfo[3]) : "Loading..."}
            </h2>
          </div>
          <div className="hidden md:block w-[1px] h-[90px]  bg-white"></div>
          <div className="flex flex-col items-center gap-2 md:gap-4 w-full md:w-[25%]">
            <h2 className="text-center text-[22px] sm:text-[15px] lg:text-[18px] font-urbanist">
              Redeemed
            </h2>
            <h2 className="text-center text-[22px] sm:text-[15px] lg:text-[18px] font-urbanist">
              {userInfo ? Number(userInfo[4]) : "Loading..."}
            </h2>
          </div>
        </div>
      </div>

      {/* nft images as bg*/}
      <div className="absolute top-28 md:top-16 left-2 md:left-0 w-[150px] md:w-[250px] h-auto">
        <Image src={"/assets/green-boy.png"} width={250} height={250} alt="" />
      </div>
      <div className="absolute top-[500px] md:top-[250px] right-2 md:right-0 w-[150px] md:w-[300px] h-auto z-20 md:z-0">
        <Image src={"/assets/venom-boy.png"} width={300} height={310} alt="" />
      </div>

      {/* the next smaller box contining info  */}
      <div className="relative w-full md:w-max h-auto mt-32 md:mt-[130px] flex justify-center items-center bg-black bg-opacity-5 backdrop-blur-[2px] m-11">
        <img
          src="/assets/rec-div.png"
          width={"740px"}
          height={"259px"}
          className="w-full h-[200px]  md:h-auto md:w-auto backdrop-blur"
        />
        <div className="absolute inset-0 flex  flex-row justify-center gap-4 md:gap-14 p-2 pt-7 text-white">
          <div className="flex flex-col items-center gap-2 md:gap-4">
            <h2 className="text-[16px] text-center md:text-[20px] font-urbanist">
              Available To Stake
            </h2>
            <h2 className="text-[18px] md:text-[20px] font-urbanist">
              {collections ? collections[0]?.nfts?.length : 0}
            </h2>
          </div>
          <div className="block w-[1px] h-[60px] md:h-[90px] bg-white"></div>
          <div className="flex flex-col items-center gap-2 md:gap-4">
            <h2 className="text-[18px] md:text-[20px] text-center font-urbanist">
              Available To Unstake
            </h2>
            <h2
              className="text-[18px] md:text-[20px] font-urbanist"
              onClick={() =>
                console.log("the tounstakengfts are: ", toUnStakeNfts)
              }
            >
              {toUnStakeNfts ? toUnStakeNfts[0]?.tokenIds?.length : 0}
            </h2>
          </div>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="663"
          height="2"
          viewBox="0 0 663 2"
          fill="none"
          className=" absolute mt-[35px] md:mt-[0px] block "
          style={{ width: "80vw" }}
        >
          <path d="M0 1H663" stroke="white" strokeWidth="0.5" />
        </svg>

        <button
          className="absolute md:bottom-[20%] bottom-[10%]  left-1/2 transform -translate-x-1/2 bg-transparent border-2 border-white rounded-full w-[75%] xl:w-[80vh] py-2 text-xl font-urbanist font-medium text-white hover:bg-white hover:text-black md:items-center md:justify-center transition duration-300 text-center px-4 md:px-[30px]"
          onClick={() => {
            claimPoints();
          }}
        >
          Claim Your Points
        </button>
      </div>

      {/* the last box  */}

      <div className="relative mt-10 md:mt-20 w-full ">
        <img
          src="/assets/rec-div-2.png"
          alt="Image"
          className="w-full max-w-[1130px] mx-auto h-[275px]"
        />
        <h2 className="absolute top-[20px] htxt left-1/2 transform -translate-x-1/2 text-center text-white font-urbanist">
          Available To Stake
        </h2>
        <button
          className="absolute bottom-[33%]  left-1/2 transform -translate-x-1/2 bg-transparent border-2 border-white rounded-full w-[75%] xl:w-[120vh] py-2 text-xl font-medium text-white hover:bg-white hover:text-black md:items-center md:justify-center transition duration-300 text-start px-4 md:px-[30px]"
          onClick={toggleModal}
        >
          Select To Stake
        </button>
      </div>
      {isModalOpen && (
        <div className="w-full h-full m-[100px]">
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20 p-9">
            <div className="bg-[#181818] text-white p-6 font-urbanist rounded-lg shadow-lg max-h-screen overflow-y-auto">
              <h2 className="text-[32px] font-medium mb-4 text-center">
                Select NFTs To Stake
              </h2>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="">
                  <NFTCollections
                    collections={collections}
                    setCollections={setCollections}
                    potentialNftAddresses={nftCollectionAddresses}
                    selectedNfts={selectedNFTs}
                    setSelectedNfts={setSelectedNFTs}
                  />
                </div>
              </div>
              <button
                className="bg-gray-200 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mt-4 block mx-auto text-xl"
                onClick={toggleModal}
              >
                Close
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mt-4 block mx-auto text-2xl"
                onClick={async () => stakeNFTs()}
              >
                Stake
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative mt-10 md:mt-20 w-full ">
        <img
          src="/assets/rec-div-2.png"
          alt="Image"
          className="w-full max-w-[1130px] mx-auto h-[275px]"
        />
        <h2 className="absolute top-[20px] htxt left-1/2 transform -translate-x-1/2 text-center text-white font-urbanist">
          Available to UnStake
        </h2>
        <button
          className="absolute bottom-[33%]  left-1/2 transform -translate-x-1/2 bg-transparent border-2 border-white rounded-full w-[75%] xl:w-[120vh] py-2 text-xl font-medium text-white hover:bg-white hover:text-black md:items-center md:justify-center transition duration-300 text-start px-4 md:px-[30px]"
          onClick={() => {
            toggleModal2();
            getAvailableToUnstakeNfts();
          }}
        >
          Unstake
        </button>
        {isModalOpen2 && (
          <div className="w-full h-full m-[100px]">
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20 p-9">
              <div className="bg-[#181818] text-white p-6 font-urbanist rounded-lg shadow-lg max-h-screen overflow-y-auto">
                <h2 className="text-[32px] font-medium mb-4 text-center">
                  Select NFTs To Unstake
                </h2>
                <UnstakeNftCollections
                  nftData={toUnStakeNfts}
                  selectedUnStakeNfts={selectedUnStakeNFTs}
                  setSelectedUnStakeNfts={setSelectedUnStakeNFTs}
                />
                <button
                  className="bg-gray-200 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mt-4 block mx-auto text-xl"
                  onClick={toggleModal2}
                >
                  Close
                </button>
                <button
                  className="bg-gray-200 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mt-4 block mx-auto text-2xl"
                  onClick={async () => withdraw()}
                >
                  Unstake
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Component to ADD YOUR OWN NFT COLLECTION */}

      <div className="relative mt-10 md:mt-20 w-full">
        <img
          src="/assets/rec-div-2.png"
          alt="Image"
          className="w-full max-w-[1130px] mx-auto h-[275px]"
        />
        <h2 className="absolute top-[30px] left-1/2 transform -translate-x-1/2 text-center text-white font-urbanist text-[36px] leading-tight">
          ADD Your Own NFT Collection
        </h2>
        <button
          className="absolute bottom-[10%] md:bottom-[30%] left-1/2 transform -translate-x-1/2 bg-transparent border-2 border-white rounded-full w-[75%] xl:w-[120vh] py-2 text-xl font-medium text-white hover:bg-white hover:text-black md:items-center md:justify-center transition duration-300 text-start px-4 md:px-[30px]"
          onClick={toggleModal3}
        >
          Bring your NFTs Collection in INKWORLD....
        </button>

        {isModalOpen3 && (
          <div className="w-full h-full m-[100px]">
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20 p-9">
              <div className="bg-[#181818] text-white p-6 font-urbanist rounded-lg shadow-lg max-h-screen overflow-y-auto">
                <h2 className="text-[32px] font-medium mb-4 text-center">
                  ADD Your Own NFT Collection
                </h2>
                <form className="bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl overflow-hidden">
                  <div className="px-8 py-10 md:px-10">
                    <div className="mt-10">
                      <div className="relative">
                        <label
                          className="block mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-200"
                          htmlFor="nftad"
                        >
                          Nft Collection Address
                        </label>
                        <input
                          placeholder="YourNftCollection Address"
                          className="block w-full px-4 py-3 mt-2 text-zinc-800 bg-white border-2 rounded-lg dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-opacity-50 focus:outline-none focus:ring focus:ring-blue-400"
                          name="nftad"
                          onChange={(e) => {
                            setNftAddress(e.target.value);
                          }}
                          value={nftAddress}
                        />
                      </div>
                      <div className="mt-6">
                        <label
                          className="block mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-200"
                          htmlFor="rewardToken"
                        >
                          Your Reward Token Address
                        </label>
                        <input
                          placeholder=""
                          className="block w-full px-4 py-3 mt-2 text-zinc-800 bg-white border-2 rounded-lg dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-opacity-50 focus:outline-none focus:ring focus:ring-blue-400"
                          name="rewardToken"
                          id="rewardToken"
                          onChange={(e) => {
                            setRewardTokenAddress(e.target.value);
                          }}
                          value={rewardTokenAddress}
                        />
                      </div>
                    </div>
                  </div>
                </form>
                <div className="flex ">
                  <button
                    className="bg-gray-200 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mt-4 block mx-auto text-2xl"
                    onClick={async () => addCollection()}
                  >
                    ADD Collection
                  </button>
                  <button
                    className="bg-gray-200 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mt-4 block mx-auto text-xl"
                    onClick={toggleModal3}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Component to REDEEM YOUR REWARDS for staking NFTs */}

      <input
        className="mt-10 bg-black px-4 py-3 outline-none w-[280px] text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040] "
        name="text"
        placeholder="Enter Nft Collection Address"
        type="text"
        onChange={(e) => {
          setRedeemNftAddress(e.target.value);
        }}
        value={redeemNftAddress}
      />
      <button
        className="cursor-pointer group relative flex gap-1.5 px-8 py-4 bg-black bg-opacity-80 text-[#f1f1f1] rounded-3xl hover:bg-opacity-70 transition font-semibold shadow-md mt-3 w-[75vw] text-center "
        onClick={() => startHarvest()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          height="24px"
          width="24px"
        >
          <g strokeWidth="0" id="SVGRepo_bgCarrier"></g>
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            id="SVGRepo_tracerCarrier"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <g id="Interface / Download">
              <path
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                stroke="#f1f1f1"
                d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12"
                id="Vector"
              ></path>
            </g>
          </g>
        </svg>
        Redeem Rewards
      </button>
    </main>
  );
}
