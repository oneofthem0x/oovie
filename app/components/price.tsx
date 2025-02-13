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
import { ArrowDown } from "lucide-react";
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
  const [tradeDirection, setTradeDirection] = useState("sell");
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

  const parsedSellAmount =
    sellAmount && tradeDirection === "sell"
      ? parseUnits(
          sellAmount.replace(/[^0-9.]/g, ''),
          sellTokenDecimals
        ).toString()
      : undefined;

  const parsedBuyAmount =
    buyAmount && tradeDirection === "buy"
      ? parseUnits(buyAmount, buyTokenDecimals).toString()
      : undefined;

  // Add error handling for missing tokens
  useEffect(() => {
    if (!sellTokenObject || !buyTokenObject) {
      setError([{ reason: "Invalid token selection" }]);
    }
  }, [sellTokenObject, buyTokenObject]);

  // Fetch price data and set the buyAmount whenever the sellAmount changes
  useEffect(() => {
    if (!sellAmount || !sellTokenObject || !buyTokenObject) return;

    const params = {
      chainId: chainId,
      sellToken: sellTokenObject.address,
      buyToken: buyTokenObject.address,
      sellAmount: parsedSellAmount || "0",
      takerAddress: taker as string,
      skipValidation: false,
      slippagePercentage: "0.01",
      enableSlippageProtection: true,
      buyTokenPercentageFee: "0",
      feeRecipient: "0x0000000000000000000000000000000000000000"
    };

    console.log('Fetching price with params:', params);

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
          if (data.buyAmount && parsedSellAmount) {
            setBuyAmount(formatUnits(data.buyAmount, buyTokenDecimals));
            const priceData = {
              ...data,
              sellToken: sellTokenObject.address,
              buyToken: buyTokenObject.address,
              sellAmount: parsedSellAmount,
              buyAmount: data.buyAmount,
              price: data.price,
              guaranteedPrice: data.guaranteedPrice,
              to: data.to,
              data: data.data,
              value: data.value,
            };
            console.log('Setting price data:', priceData);
            setPrice(priceData);
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
    parsedSellAmount,
    chainId,
    sellAmount,
    setPrice,
    buyTokenDecimals,
    taker,
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

  return (
    <div className="bg-[#191919] rounded-[20px] p-5">
      <div className="flex flex-col gap-3">
        {/* Sell Section */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col rounded-[20px] border border-[rgba(255,255,255,0.12)] bg-[#131313] overflow-hidden">
            <div className="p-4">
              <span className="text-[14px] text-[#5E5E5E] font-medium block">Sell</span>
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
                    src={sellTokenObject.logoURI}
                    alt={sellTokenObject.symbol}
                    width={22}
                    height={22}
                    className="rounded-full"
                  />
                  <span className="text-[16px] font-medium">{sellTokenObject.symbol}</span>
                  <ArrowDown className="w-4 h-4 text-[#9B9B9B]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-1">
          <button
            className="flex items-center justify-center bg-[#131313] hover:bg-[#131313]/90 text-white h-[40px] w-[40px] rounded-xl border border-[#10F0A3]"
            onClick={() => {
              const tempToken = sellToken;
              setSellToken(buyToken);
              setBuyToken(tempToken);
            }}
          >
            <ArrowDown className="w-5 h-5 text-[#10F0A3]" />
          </button>
        </div>

        {/* Buy Section */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col rounded-[20px] border border-[rgba(255,255,255,0.12)] bg-[#131313] overflow-hidden">
            <div className="p-4">
              <span className="text-[14px] text-[#5E5E5E] font-medium block">Buy</span>
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
                    src={buyTokenObject.logoURI}
                    alt={buyTokenObject.symbol}
                    width={22}
                    height={22}
                    className="rounded-full"
                  />
                  <span className="text-[16px] font-medium">{buyTokenObject.symbol}</span>
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
                : "Review Trade"}
        </button>
      </div>
    </div>
  );
}
