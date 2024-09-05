"use client";
import "@rainbow-me/rainbowkit/styles.css";
import * as React from "react";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  zksyncSepoliaTestnet,
} from "wagmi/chains";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieStorage, http, WagmiProvider } from "wagmi";

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
  appName: "InkWorld",
  projectId: "b7d49caf844acc91edc89c8252e52828",
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: [
    zksyncSepoliaTestnet
  ],
  ssr: true,
  transports: {
    [zksyncSepoliaTestnet.id]: http(),
  },
});


const queryClient = new QueryClient();


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config} >
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#00FF0A",
            accentColorForeground: "black",
            borderRadius: "large",
            fontStack: "rounded",
            overlayBlur: "large",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
