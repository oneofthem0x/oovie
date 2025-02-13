"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-4">
        <div className="flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OoVO-7XpxeH8ohLrMSJ1Eh1LyyUH50BC3p6.png"
                  alt="OOVO"
                  width={400}
                  height={400}
                  className="h-7 w-auto"
                />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="bg-[#10F0A3] text-black font-semibold py-3 px-6 rounded-full border border-[#393939] hover:bg-[#10F0A3]/90"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-4">
                          <button
                            onClick={openChainModal}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white border border-[#393939] shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:bg-[#1f1f1f] transition-colors"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 16,
                                  height: 16,
                                  borderRadius: 999,
                                  overflow: "hidden",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}
                              >
                                {chain.iconUrl && (
                                  <Image
                                    alt={chain.name ?? "Chain icon"}
                                    src={chain.iconUrl}
                                    width={16}
                                    height={16}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </button>

                          <button
                            onClick={openAccountModal}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white border border-[#393939] shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:bg-[#1f1f1f] transition-colors"
                          >
                            {account.displayName}
                            {account.displayBalance ? ` (${account.displayBalance})` : ''}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </nav>
  );
} 