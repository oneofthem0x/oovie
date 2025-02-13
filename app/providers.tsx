"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RainbowKitProvider,
  getDefaultWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { argentWallet, trustWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, WagmiConfig } from 'wagmi';
import { 
  mainnet, 
  polygon, 
  optimism, 
  arbitrum, 
  base,
  avalanche,
  bsc,
  zkSync,
  mantle,
  celo,
  gnosis,
  sepolia,
  goerli,
  polygonMumbai,
  arbitrumGoerli,
  baseGoerli
} from 'wagmi/chains';
import { http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "a35a787688946b325afaa874271348d9";

const chains = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  avalanche,
  bsc,
  zkSync,
  mantle,
  celo,
  gnosis,
  sepolia,
  goerli,
  polygonMumbai,
  arbitrumGoerli,
  baseGoerli
] as const;

const { connectors } = getDefaultWallets({
  appName: 'Oovo',
  projectId,
});

const config = createConfig({
  connectors,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
    [bsc.id]: http(),
    [zkSync.id]: http(),
    [mantle.id]: http(),
    [celo.id]: http(),
    [gnosis.id]: http(),
    [sepolia.id]: http(),
    [goerli.id]: http(),
    [polygonMumbai.id]: http(),
    [arbitrumGoerli.id]: http(),
    [baseGoerli.id]: http()
  },
  chains
});

const demoAppInfo = {
  appName: "Oovo",
};

const customTheme = darkTheme({
  accentColor: "#10F0A3",
  accentColorForeground: "black",
  borderRadius: "large",
  fontStack: "system",
  overlayBlur: "small",
});

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider
          appInfo={demoAppInfo}
          theme={customTheme}
          modalSize="compact"
        >
          {mounted && children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
