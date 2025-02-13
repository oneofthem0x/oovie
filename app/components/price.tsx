"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "ethers";
import {
  useReadContract,
  useBalance,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
} from "wagmi";
import { erc20Abi, Address } from "viem";
import {
  MAINNET_TOKENS,
  MAINNET_TOKENS_BY_SYMBOL,
  MAX_ALLOWANCE,
} from "../../src/constants";
import { permit2Abi } from "../../src/utils/permit2abi";
import ZeroExLogo from "../../src/images/white-0x-logo.png";
import Image from "next/image";
import qs from "qs";
import TokenSelector from "./token-selector";
import { ArrowDown, ArrowUpDown } from "lucide-react";
import type { PriceResponse } from "../../src/utils/types";

interface ErrorType {
  reason: string;
}

export const DEFAULT_BUY_TOKEN = (chainId: number) => {
  if (chainId === 1) {
    return "weth";
  }
};

export default function PriceView({
  price,
  taker,
  setPrice,
  setFinalize,
  chainId,
}: {
  price: PriceResponse | undefined;
  taker: Address | undefined;
  setPrice: (price: PriceResponse | undefined) => void;
  setFinalize: (finalize: boolean) => void;
  chainId: number;
}) {
  const [sellToken, setSellToken] = useState<string>("WETH");
  const [buyToken, setBuyToken] = useState<string>("USDC");
  const [sellAmount, setSellAmount] = useState<string>("");
  const [buyAmount, setBuyAmount] = useState("");
  const [tradeDirection, setTradeDirection] = useState<"sell" | "buy">("sell");
  const [error, setError] = useState<ErrorType[]>([]);
  const [showSellTokenSelector, setShowSellTokenSelector] = useState(false);
  const [showBuyTokenSelector, setShowBuyTokenSelector] = useState(false);
  const [buyTokenTax, setBuyTokenTax] = useState({
    buyTaxBps: "0",
    sellTaxBps: "0",
  });
  const [sellTokenTax, setSellTokenTax] = useState({
    buyTaxBps: "0",
    sellTaxBps: "0",
  });

  const handleSellTokenChange = (token: any) => {
    setSellToken(token.symbol.toLowerCase());
    setShowSellTokenSelector(false);
  };

  const handleBuyTokenChange = (token: any) => {
    setBuyToken(token.symbol.toLowerCase());
    setShowBuyTokenSelector(false);
  };

  const tokensByChain = (chainId: number) => {
    if (chainId === 1) {
      return MAINNET_TOKENS_BY_SYMBOL;
    }
    return MAINNET_TOKENS_BY_SYMBOL;
  };

  const sellTokenObject = tokensByChain(chainId)[sellToken] || MAINNET_TOKENS_BY_SYMBOL["weth"];
  const buyTokenObject = tokensByChain(chainId)[buyToken] || MAINNET_TOKENS_BY_SYMBOL["usdc"];

  const sellTokenDecimals = sellTokenObject?.decimals || 18;
  const buyTokenDecimals = buyTokenObject?.decimals || 18;
  const sellTokenAddress = sellTokenObject?.address;

  // Helper function to format number to specific decimals
  const formatToDecimals = (value: string, decimals: number) => {
    if (!value) return value;
    const parts = value.split('.');
    if (parts.length === 2) {
      return `${parts[0]}.${parts[1].slice(0, decimals)}`;
    }
    return value;
  };

  const parsedSellAmount =
    sellAmount && tradeDirection === "sell"
      ? parseUnits(
          formatToDecimals(sellAmount.replace(/[^0-9.]/g, ''), sellTokenDecimals),
          sellTokenDecimals
        ).toString()
      : undefined;

  const parsedBuyAmount =
    buyAmount && tradeDirection === "buy"
      ? parseUnits(
          formatToDecimals(buyAmount, buyTokenDecimals),
          buyTokenDecimals
        ).toString()
      : undefined;

  // Add error handling for missing tokens
  useEffect(() => {
    if (!sellTokenObject || !buyTokenObject) {
      setError([{ reason: "Invalid token selection" }]);
    }
  }, [sellTokenObject, buyTokenObject]);

  // Fetch price data and set the buyAmount whenever the sellAmount changes
  useEffect(() => {
    if (!sellAmount || isNaN(Number(sellAmount))) return;

    const params = {
      chainId: chainId,
      sellToken: tradeDirection === "sell" ? sellTokenObject.address : buyTokenObject.address,
      buyToken: tradeDirection === "sell" ? buyTokenObject.address : sellTokenObject.address,
      sellAmount: tradeDirection === "sell" 
        ? parseUnits(formatToDecimals(sellAmount, sellTokenDecimals), sellTokenDecimals).toString()
        : parseUnits(formatToDecimals(sellAmount, buyTokenDecimals), buyTokenDecimals).toString(),
      taker,
    };

    async function main() {
      try {
        const response = await fetch(`/api/price?${qs.stringify(params)}`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Price API error:", errorData);
          setError([{ reason: errorData.reason || "Failed to fetch price" }]);
          setPrice(undefined);
          return;
        }

        const data = await response.json();
        console.log('Price response:', data);

        if (data?.validationErrors?.length > 0) {
          setError(data.validationErrors);
          setPrice(undefined);
        } else {
          setError([]);
          if (data.buyAmount) {
            const formattedAmount = formatUnits(
              data.buyAmount,
              tradeDirection === "sell" ? buyTokenDecimals : sellTokenDecimals
            );
            setBuyAmount(formattedAmount);
            setPrice({
              ...data,
              sellToken: params.sellToken,
              buyToken: params.buyToken,
              sellAmount: params.sellAmount,
              buyAmount: data.buyAmount,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching price:', err);
        setError([{ reason: 'Failed to fetch price' }]);
        setPrice(undefined);
      }
    }

    main();
  }, [
    sellTokenObject.address,
    buyTokenObject.address,
    sellAmount,
    chainId,
    taker,
    tradeDirection,
    sellTokenDecimals,
    buyTokenDecimals,
    setPrice,
  ]);

  // Hook for fetching balance information for specified token for a specific taker address
  const { data, isError, isLoading } = useBalance({
    address: taker as Address,
    token: sellTokenObject.address as Address,
  });

  console.log("taker sellToken balance: ", data);

  const inSufficientBalance =
    data && sellAmount
      ? parseUnits(sellAmount, sellTokenDecimals) > data.value
      : true;

  // Helper function to format tax basis points to percentage
  const formatTax = (taxBps: string) => (parseFloat(taxBps) / 100).toFixed(2);

  // Add button click handler
  const handleReviewTrade = () => {
    console.log('Current price state:', price);
    console.log('Current sell amount:', sellAmount);
    console.log('Current parsed sell amount:', parsedSellAmount);
    if (!price?.sellAmount) {
      console.error('Missing sellAmount in price data');
      return;
    }
    if (price && sellAmount && taker && !error.length) {
      setFinalize(true);
    }
  };

  const handleSwapDirection = () => {
    // Swap token positions
    const tempToken = sellToken;
    setSellToken(buyToken);
    setBuyToken(tempToken);
    
    // Swap amounts
    const tempAmount = sellAmount;
    setSellAmount(buyAmount);
    setBuyAmount(tempAmount);
    
    // Toggle trade direction
    setTradeDirection(prev => prev === "sell" ? "buy" : "sell");
    
    // Reset price data since we're changing direction
    setPrice(undefined);
    
    // Clear any existing errors
    setError([]);
  };

  // Update useEffect to handle both sell and buy directions
  useEffect(() => {
    if (!sellAmount || isNaN(Number(sellAmount))) return;

    const params = {
      chainId: chainId,
      sellToken: tradeDirection === "sell" ? sellTokenObject.address : buyTokenObject.address,
      buyToken: tradeDirection === "sell" ? buyTokenObject.address : sellTokenObject.address,
      sellAmount: parsedSellAmount,
      taker,
    };

    // ... rest of the useEffect
  }, [
    sellTokenObject.address,
    buyTokenObject.address,
    parsedSellAmount,
    chainId,
    sellAmount,
    setPrice,
    buyTokenDecimals,
    taker,
    tradeDirection,
  ]);

  return (
    <div className="bg-[#191919] rounded-[20px] p-5">
      <div className="flex flex-col gap-3">
        {/* First Token Section */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col rounded-[20px] border border-[rgba(255,255,255,0.12)] bg-[#131313] overflow-hidden">
            <div className="p-4">
              <span className="text-[14px] text-[#5E5E5E] font-medium block">
                {tradeDirection === "sell" ? "Sell" : "Buy"}
              </span>
              <div className="flex justify-between items-center min-h-[59px] pt-2 pb-2">
                <div className="flex flex-col flex-grow mr-2">
                  <input
                    type="text"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-[36px] leading-[43px] outline-none text-white font-medium w-full h-[36px] placeholder-[#5E5E5E]"
                  />
                </div>
                <button
                  onClick={() => setShowSellTokenSelector(true)}
                  className="flex items-center gap-2 bg-[#131313] hover:bg-[#131313]/90 text-white h-[48px] px-4 rounded-full border border-[#393939]"
                >
                  <Image
                    src={tradeDirection === "sell" ? sellTokenObject.logoURI : buyTokenObject.logoURI}
                    alt={tradeDirection === "sell" ? sellTokenObject.symbol : buyTokenObject.symbol}
                    width={22}
                    height={22}
                    className="rounded-full"
                  />
                  <span className="text-[16px] font-medium">
                    {tradeDirection === "sell" ? sellTokenObject.symbol : buyTokenObject.symbol}
                  </span>
                  <ArrowDown className="w-4 h-4 text-[#9B9B9B]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <button
          onClick={handleSwapDirection}
          className="flex justify-center w-full -mt-2 -mb-2 z-10 relative"
        >
          <div className="bg-[#191919] p-2 rounded-full border border-[#393939] hover:bg-[#252525] transition-colors">
            <ArrowUpDown className="w-4 h-4 text-[#10F0A3]" />
          </div>
        </button>

        {/* Second Token Section */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col rounded-[20px] border border-[rgba(255,255,255,0.12)] bg-[#131313] overflow-hidden">
            <div className="p-4">
              <span className="text-[14px] text-[#5E5E5E] font-medium block">
                {tradeDirection === "sell" ? "Buy" : "Sell"}
              </span>
              <div className="flex justify-between items-center min-h-[59px] pt-2 pb-2">
                <div className="flex flex-col flex-grow mr-2">
                  <input
                    type="text"
                    value={buyAmount}
                    placeholder="0"
                    className="bg-transparent text-[36px] leading-[43px] outline-none text-white font-medium w-full h-[36px] placeholder-[#5E5E5E]"
                    readOnly
                  />
                </div>
                <button
                  onClick={() => setShowBuyTokenSelector(true)}
                  className="flex items-center gap-2 bg-[#131313] hover:bg-[#131313]/90 text-white h-[48px] px-4 rounded-full border border-[#393939]"
                >
                  <Image
                    src={tradeDirection === "sell" ? buyTokenObject.logoURI : sellTokenObject.logoURI}
                    alt={tradeDirection === "sell" ? buyTokenObject.symbol : sellTokenObject.symbol}
                    width={22}
                    height={22}
                    className="rounded-full"
                  />
                  <span className="text-[16px] font-medium">
                    {tradeDirection === "sell" ? buyTokenObject.symbol : sellTokenObject.symbol}
                  </span>
                  <ArrowDown className="w-4 h-4 text-[#9B9B9B]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Token Selectors */}
        <TokenSelector
          isOpen={showSellTokenSelector}
          onClose={() => setShowSellTokenSelector(false)}
          onSelectToken={handleSellTokenChange}
        />
        <TokenSelector
          isOpen={showBuyTokenSelector}
          onClose={() => setShowBuyTokenSelector(false)}
          onSelectToken={handleBuyTokenChange}
        />

        {/* Affiliate Fee Display */}
        <div className="text-slate-400">
          {price?.fees?.integratorFee?.amount && MAINNET_TOKENS_BY_SYMBOL[buyToken] && (
            <span>
              Affiliate Fee: {Number(
                formatUnits(
                  BigInt(price.fees.integratorFee.amount),
                  MAINNET_TOKENS_BY_SYMBOL[buyToken]?.decimals || 18
                )
              )} {MAINNET_TOKENS_BY_SYMBOL[buyToken]?.symbol}
            </span>
          )}
        </div>

        {/* Tax Information Display */}
        <div className="text-slate-400">
          {buyTokenTax?.buyTaxBps !== "0" && (
            <p>
              {MAINNET_TOKENS_BY_SYMBOL[buyToken].symbol +
                ` Buy Tax: ${formatTax(buyTokenTax.buyTaxBps)}%`}
            </p>
          )}
          {sellTokenTax?.sellTaxBps !== "0" && (
            <p>
              {MAINNET_TOKENS_BY_SYMBOL[sellToken].symbol +
                ` Sell Tax: ${formatTax(sellTokenTax.sellTaxBps)}%`}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          className="w-full bg-[#10F0A3] hover:bg-[#10F0A3]/90 text-black font-semibold h-[56px] rounded-2xl mt-2"
          onClick={handleReviewTrade}
          disabled={!price || !taker || error.length > 0 || !sellAmount || sellAmount === "0"}
        >
          {!taker 
            ? "Connect Wallet"
            : error.length > 0 
              ? error[0].reason 
              : !sellAmount || sellAmount === "0"
                ? "Enter an amount"
                : `Review ${tradeDirection === "sell" ? "Sell" : "Buy"}`}
        </button>
      </div>
    </div>
  );
}
