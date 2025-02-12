"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";

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
                            className="bg-[#10F0A3] text-white font-semibold py-3 px-6 rounded-full border border-[#393939] hover:bg-[#10F0A3]/90"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-4">
                          <button
                            onClick={openAccountModal}
                            className="flex items-center gap-2 bg-black text-white py-3 px-4 rounded-full border border-[#393939] hover:bg-black/90"
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