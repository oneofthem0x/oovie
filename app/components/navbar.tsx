"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useChainId, useSwitchChain } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SUPPORTED_CHAINS = [mainnet, polygon, optimism, arbitrum, base];

export default function Navbar() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === chainId) || mainnet;

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
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-[#131313] text-white py-3 px-4 rounded-full border border-[#393939] hover:bg-[#1f1f1f]"
              >
                {currentChain.name}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#131313] border border-[#393939] shadow-lg">
                  <div className="py-2">
                    {SUPPORTED_CHAINS.map((chain) => (
                      <button
                        key={chain.id}
                        onClick={() => {
                          switchChain({ chainId: chain.id });
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-[#1f1f1f] transition-colors
                          ${chainId === chain.id ? 'text-[#10F0A3]' : 'text-white'}`}
                      >
                        {chain.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
                            className="bg-[#10F0A3] text-black font-semibold py-3 px-6 rounded-full border border-[#393939] hover:bg-[#10F0A3]/90"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={openAccountModal}
                          className="flex items-center gap-2 bg-black text-white py-3 px-4 rounded-full border border-[#393939] hover:bg-black/90"
                        >
                          {account.displayName}
                          {account.displayBalance ? ` (${account.displayBalance})` : ''}
                        </button>
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