import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative mt-[130px] backdrop-blur-[2px] z-10">
        <Image src={"/assets/frame-bg.svg"} width={1130} height={200} alt="" />
        <div className="absolute top-0 left-0 flex gap-12 justify-center items-center p-6 z-20 text-white">
          <div className="flex flex-col items-center gap-4 w-[25%]">
            <h2 className="text-2xl font-urbanist">Earned Points</h2>
            <h2 className="text-2xl font-urbanist"> 0</h2>
          </div>
          <div className="w-[1px] h-[120px] bg-white"></div>
          <div className="flex flex-col  items-center gap-4 w-[25%]">
            <h2 className="text-2xl font-urbanist">Claimed Points</h2>
            <h2 className="text-2xl font-urbanist"> 0</h2>
          </div>
          <div className="w-[1px] h-[120px] bg-white"></div>
          <div className="flex flex-col items-center gap-4 w-[25%]">
            <h2 className="text-2xl font-urbanist">Earned Rewards</h2>
            <h2 className="text-2xl font-urbanist"> 0</h2>
          </div>
          <div className="w-[1px] h-[120px] bg-white"></div>
          <div className="flex flex-col items-center gap-4 w-[300px]">
            <h2 className="text-2xl font-urbanist">Claimed Rewards</h2>
            <h2 className="text-2xl font-urbanist"> 0</h2>
          </div>
        </div>
      </div>

      <div className="absolute top-4 pt-10 left-0 w-[383px] h-[383px]">
        <Image src={"/assets/green-boy.png"} width={250} height={250} alt="" />
      </div>
      <div className="absolute top-[250px] right-0 w-[300] h-[300px]">
        <Image src={"/assets/venom-boy.png"} width={300} height={310} alt="" />
      </div>

      <div className="relative w-max h-auto mt-[130px] flex justify-center items-center z-20">
        <img
          src="/assets/rec-div.png"
          width={"763px"}
          height={"259px"}
          className="hello"
        />
        <div className="absolute inset-0 flex justify-center gap-12 p-2 pt-7 text-white">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-[24px] font-urbanist">Available To Stake</h2>
            <h2 className="text-[24px] font-urbanist">0</h2>
          </div>
          <div className="w-[1px] h-[90px] bg-white"></div>
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-[24px] font-urbanist">Available To Unstake</h2>
            <h2 className="text-[24px] font-urbanist">0</h2>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="663"
          height="2"
          viewBox="0 0 663 2"
          fill="none"
          className="absolute mt-[0px]"
        >
          <path d="M0 1H663" stroke="white" stroke-width="0.5" />
        </svg>
        <div className="absolute inset-x-0 top-[120px] flex justify-center gap-12 p-2 pt-7  text-white">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-[24px] font-urbanist">Claimed Points</h2>
            <h2 className="text-[24px] font-urbanist">0</h2>
          </div>
        </div>
      </div>

      <div className="relative mt-20">
        <img src="/assets/rec-div-2.png" alt="Image" className="w-full" />
        <h2 className="absolute top-[20px] htxt left-1/2 transform -translate-x-1/2 text-center text-white font-urbanist">
          Available To Stake
        </h2>
        <button className="absolute bottom-36 left-1/2 transform -translate-x-1/2 bg-transparent border-2 border-white rounded-full w-[150vh] py-2 text-xl font-medium text-white hover:bg-white hover:text-black transition duration-300 text-start px-[30px]">
          Select To Stake
        </button>
      </div>
    </main>
  );
}
