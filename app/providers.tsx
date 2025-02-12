"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  trustWallet,
  ledgerWallet,
  phantomWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID environment variable. Please set it in .env.local"
  );
}

coinbaseWallet.preference = "smartWalletOnly";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended Wallet",
      wallets: [coinbaseWallet],
    },
    {
      groupName: "Other",
      wallets: [
        phantomWallet,
        metaMaskWallet,
        trustWallet,
        ledgerWallet,
      ],
    },
  ],
  {
    appName: "Oovo",
    projectId,
  }
);

const config = createConfig({
  chains: [mainnet],
  // turn off injected provider discovery
  multiInjectedProviderDiscovery: false,
  connectors,
  ssr: true,
  transports: { [mainnet.id]: http() },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider 
            theme={darkTheme({
              accentColor: '#10F0A3',
              accentColorForeground: 'white',
              borderRadius: 'large',
              fontStack: 'system',
              overlayBlur: 'small',
              colors: {
                modalBackground: '#000000',
                modalText: '#FFFFFF',
                modalTextSecondary: '#FFFFFF',
                modalBackdrop: 'rgba(0, 0, 0, 0.8)',
                actionButtonBorder: '#333333',
                actionButtonBorderMobile: '#333333',
                actionButtonSecondaryBackground: '#111111',
                closeButton: '#FFFFFF',
                closeButtonBackground: '#333333',
                connectButtonBackground: '#000000',
                connectButtonBackgroundError: '#FF494A',
                connectButtonInnerBackground: '#111111',
                connectButtonText: '#FFFFFF',
                connectButtonTextError: '#FFFFFF',
                connectionIndicator: '#30E000',
                error: '#FF494A',
                generalBorder: '#333333',
                generalBorderDim: '#222222',
                menuItemBackground: '#111111',
                profileAction: '#333333',
                profileActionHover: '#444444',
                profileForeground: '#111111',
                selectedOptionBorder: '#444444',
                standby: '#FFD641'
              }
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}
