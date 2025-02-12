"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "ethers";
import {
  useSignTypedData,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWalletClient,
  type BaseError,
} from "wagmi";
import { Address, concat, numberToHex, size, type Hex } from "viem";
import type { PriceResponse, QuoteResponse } from "../../src/utils/types";
import {
  MAINNET_TOKENS_BY_ADDRESS,
  AFFILIATE_FEE,
  FEE_RECIPIENT,
} from "../../src/constants";
import Image from "next/image";
import qs from "qs";
import { useRouter } from "next/navigation";

export default function QuoteView({
  taker,
  price,
  quote,
  setQuote,
  chainId,
}: {
  taker: Address | undefined;
  price: PriceResponse;
  quote: QuoteResponse | undefined;
  setQuote: (price: any) => void;
  chainId: number;
}) {
  console.log("price", price);

  const sellTokenInfo = (chainId: number) => {
    if (chainId === 1) {
      return MAINNET_TOKENS_BY_ADDRESS[price.sellToken.toLowerCase()];
    }
    return MAINNET_TOKENS_BY_ADDRESS[price.sellToken.toLowerCase()];
  };

  const buyTokenInfo = (chainId: number) => {
    if (chainId === 1) {
      return MAINNET_TOKENS_BY_ADDRESS[price.buyToken.toLowerCase()];
    }
    return MAINNET_TOKENS_BY_ADDRESS[price.buyToken.toLowerCase()];
  };

  const { signTypedDataAsync } = useSignTypedData();
  const { data: walletClient } = useWalletClient();

  // Add useRouter hook at the top of the component
  const router = useRouter();
  const [error, setError] = useState<BaseError | null>(null);

  // Fetch quote data
  useEffect(() => {
    const params = {
      chainId: chainId,
      sellToken: price.sellToken,
      buyToken: price.buyToken,
      sellAmount: price.sellAmount,
      taker,
      swapFeeRecipient: FEE_RECIPIENT,
      swapFeeBps: AFFILIATE_FEE,
      swapFeeToken: price.buyToken,
      tradeSurplusRecipient: FEE_RECIPIENT,
    };

    async function main() {
      const response = await fetch(`/api/quote?${qs.stringify(params)}`);
      const data = await response.json();
      setQuote(data);
    }
    main();
  }, [
    chainId,
    price.sellToken,
    price.buyToken,
    price.sellAmount,
    taker,
    setQuote,
    FEE_RECIPIENT,
    AFFILIATE_FEE,
  ]);

  const {
    data: hash,
    isPending,
    error: transactionError,
    sendTransaction,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  if (!quote) {
    return (
      <div className="flex items-center justify-center p-8 text-white">
        Getting best quote...
      </div>
    );
  }

  console.log("quote", quote);

  // Helper function to format tax basis points to percentage
  const formatTax = (taxBps: string) => (parseFloat(taxBps) / 100).toFixed(2);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {/* You Pay Section */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">You pay</div>
          <div className="flex items-center">
            <Image
              alt={sellTokenInfo(chainId).symbol}
              className="h-8 w-8 rounded-full mr-3"
              src={sellTokenInfo(chainId || 1)?.logoURI}
              width={32}
              height={32}
            />
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-white">
                {formatUnits(quote.sellAmount, sellTokenInfo(chainId).decimals)}
              </span>
              <span className="text-gray-400">{sellTokenInfo(chainId).symbol}</span>
            </div>
          </div>
        </div>

        {/* You Receive Section */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">You receive</div>
          <div className="flex items-center">
            <Image
              alt={buyTokenInfo(chainId).symbol}
              className="h-8 w-8 rounded-full mr-3"
              src={buyTokenInfo(chainId).logoURI}
              width={32}
              height={32}
            />
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-white">
                {formatUnits(quote.buyAmount, buyTokenInfo(chainId).decimals)}
              </span>
              <span className="text-gray-400">{buyTokenInfo(chainId).symbol}</span>
            </div>
          </div>
        </div>

        {/* Fee Information */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4">
          <div className="space-y-2 text-sm">
            {quote.fees?.integratorFee?.amount && (
              <div className="flex justify-between text-gray-400">
                <span>Affiliate Fee</span>
                <span>
                  {Number(
                    formatUnits(
                      BigInt(quote.fees.integratorFee.amount),
                      buyTokenInfo(chainId).decimals
                    )
                  )}{" "}
                  {buyTokenInfo(chainId).symbol}
                </span>
              </div>
            )}
            {quote.tokenMetadata.buyToken.buyTaxBps &&
              quote.tokenMetadata.buyToken.buyTaxBps !== "0" && (
                <div className="flex justify-between text-gray-400">
                  <span>{buyTokenInfo(chainId).symbol} Buy Tax</span>
                  <span>{(parseFloat(quote.tokenMetadata.buyToken.buyTaxBps) / 100).toFixed(2)}%</span>
                </div>
            )}
            {quote.tokenMetadata.sellToken.sellTaxBps &&
              quote.tokenMetadata.sellToken.sellTaxBps !== "0" && (
                <div className="flex justify-between text-gray-400">
                  <span>{sellTokenInfo(chainId).symbol} Sell Tax</span>
                  <span>{(parseFloat(quote.tokenMetadata.sellToken.sellTaxBps) / 100).toFixed(2)}%</span>
                </div>
            )}
          </div>
        </div>

        {/* Place Order Button */}
        <button
          className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200 
            ${isPending || !quote?.transaction
              ? 'bg-[#10F0A3]/50 cursor-not-allowed'
              : 'bg-[#10F0A3] hover:bg-[#0ED08A]'
            }`}
          disabled={isPending || !quote?.transaction}
          onClick={async () => {
            try {
              console.log("submitting quote to blockchain");
              
              if (!quote?.transaction) {
                throw new Error("No transaction data available");
              }

              let finalTransactionData = quote.transaction.data;

              // Handle Permit2 signing if needed
              if (quote.permit2?.eip712) {
                try {
                  const signature = await signTypedDataAsync(quote.permit2.eip712);
                  console.log("Signed permit2 message from quote response");

                  if (!signature) {
                    throw new Error("Failed to obtain signature");
                  }

                  // Append signature to transaction data
                  const signatureLengthInHex = numberToHex(size(signature), {
                    signed: false,
                    size: 32,
                  });

                  finalTransactionData = concat([
                    quote.transaction.data as Hex,
                    signatureLengthInHex as Hex,
                    signature as Hex,
                  ]);
                } catch (error) {
                  console.error("Error signing permit2 message:", error);
                  throw new Error("Failed to sign permit2 message");
                }
              }

              if (!walletClient?.account.address) {
                throw new Error("Wallet not connected");
              }

              // Submit the transaction
              await sendTransaction({
                account: walletClient.account.address,
                gas: quote.transaction.gas ? BigInt(quote.transaction.gas) : undefined,
                to: quote.transaction.to,
                data: finalTransactionData,
                value: quote.transaction.value ? BigInt(quote.transaction.value) : undefined,
                chainId: chainId,
              });

            } catch (err) {
              console.error("Transaction error:", err);
              
              // Check if the error is a user rejection
              const errorMessage = (err as Error).message.toLowerCase();
              if (
                !errorMessage.includes('user rejected') && 
                !errorMessage.includes('user denied') &&
                !errorMessage.includes('rejected transaction')
              ) {
                // Refresh the page for any error except user rejections
                router.refresh();
              }
              
              setError(err as BaseError);
            }
          }}
        >
          {isPending ? "Confirming..." : "Place Order"}
        </button>

        {/* Status Messages */}
        <div className="mt-4 text-center">
          {isConfirming && (
            <div className="text-gray-400">Waiting for confirmation...</div>
          )}
          {isConfirmed && (
            <div className="text-[#10F0A3]">
              Transaction Confirmed!{" "}
              <a 
                href={`https://etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#10F0A3] hover:text-[#0ED08A] underline"
              >
                View on Etherscan
              </a>
            </div>
          )}
          {error && (
            <div className="text-red-500">
              Error: {error.shortMessage || error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
