import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import Image from "next/image";
import { MAINNET_TOKENS, POPULAR_TOKENS } from "../../src/constants";

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: any) => void;
}

export default function TokenSelector({ isOpen, onClose, onSelectToken }: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = MAINNET_TOKENS.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#191919] text-white border border-gray-800 w-full max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Select a Token</DialogTitle>
        </DialogHeader>

        <Input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-4 bg-[#131313] border border-[#393939] text-white rounded-[15px]"
        />

        {/* Popular Tokens Section */}
        {searchQuery.length === 0 && (
          <div className="mt-4">
            <h3 className="text-sm text-gray-400 mb-2">Popular tokens</h3>
            <div className="grid grid-cols-4 gap-2">
              {POPULAR_TOKENS.map((token) => (
                <button
                  key={token.address}
                  className="flex flex-col items-center p-2 hover:bg-[#252525] rounded-[15px] transition-colors"
                  onClick={() => onSelectToken(token)}
                >
                  <Image
                    src={token.logoURI}
                    alt={token.symbol}
                    width={32}
                    height={32}
                    className="rounded-full mb-1"
                  />
                  <span className="text-sm font-medium">{token.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {searchQuery.length === 0 && (
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-[#393939]"></div>
            <span className="mx-4 text-sm text-gray-500">All tokens</span>
            <div className="flex-grow border-t border-[#393939]"></div>
          </div>
        )}

        {/* All Tokens Section */}
        <div className="mt-4 max-h-60 overflow-y-auto">
          {searchQuery.length > 0 ? (
            filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <button
                  key={token.address}
                  className="w-full flex items-center p-3 hover:bg-[#252525] rounded-[15px]"
                  onClick={() => onSelectToken(token)}
                >
                  <Image
                    src={token.logoURI}
                    alt={token.symbol}
                    width={32}
                    height={32}
                    className="rounded-full mr-3"
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-sm text-gray-400">{token.name}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">No tokens found</div>
            )
          ) : (
            // Show remaining tokens when not searching
            filteredTokens
              .filter(token => !POPULAR_TOKENS.find(p => p.address === token.address))
              .map((token) => (
                <button
                  key={token.address}
                  className="w-full flex items-center p-3 hover:bg-[#252525] rounded-[15px]"
                  onClick={() => onSelectToken(token)}
                >
                  <Image
                    src={token.logoURI}
                    alt={token.symbol}
                    width={32}
                    height={32}
                    className="rounded-full mr-3"
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-sm text-gray-400">{token.name}</span>
                  </div>
                </button>
              ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 