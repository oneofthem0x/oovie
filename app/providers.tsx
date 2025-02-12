"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { argentWallet, trustWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base, zora } from "wagmi/chains";
import { http, createConfig as createWagmiConfig } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "a35a787688946b325afaa874271348d9";

// ✅ Use the new `publicProvider()` method
const config = createWagmiConfig({
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [zora.id]: http(),
  },
  chains: [mainnet, polygon, optimism, arbitrum, base, zora],
  connectors: getDefaultWallets({
    appName: "Oovo",
    projectId,
  }).connectors,
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

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        appInfo={demoAppInfo}
        theme={customTheme}
        modalSize="compact"
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
