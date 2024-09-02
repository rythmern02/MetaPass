// components/Navbar.tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#d9d9d9] w-screen bg-opacity-[3%] fixed text-white shadow-lg z-20 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className=" font-itim text-[25px]">INKWORLD</h1>
            </div>
          </div>
          <div className="hidden md:flex md:items-center">
            <a
              href="#"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Stake NFTs
            </a>
            <a
              href="#"
              className="ml-4 text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Stake Tokens
            </a>
          </div>
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
