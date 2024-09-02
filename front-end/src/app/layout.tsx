import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Providers } from "./components/providers";
import { ethers } from "ethers";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "InkWorld",
  description: "inkworld the nft collection",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  
  // const client =  createPublicClient({
  //   chain: zksyncSepoliaTestnet,
  //   transport: http("https://zksync-sepolia.g.alchemy.com/v2/Vpv0tWV1M_lyb7531yHUsR_pEbmqedvp"),
  // });
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers >
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
