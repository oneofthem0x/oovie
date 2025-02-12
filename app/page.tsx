"use client";

import PriceView from "./components/price";
import QuoteView from "./components/quote";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import type { PriceResponse, Address } from "../src/utils/types";
import ConnectWithUs from "./components/connect-with-us";

function Page() {
  const { address } = useAccount();
  const chainId = useChainId() || 1;
  const [finalize, setFinalize] = useState(false);
  const [price, setPrice] = useState<PriceResponse | undefined>();
  const [quote, setQuote] = useState();

  return (
    <main className="min-h-screen bg-black/10 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh] relative z-10 pt-24">
        <div className="flex flex-col items-center max-w-[920px] text-center mb-6">
          <h1 className="text-[36px] md:text-[52px] lg:text-[64px] leading-[1.2] font-bold mb-6">
            <span>Swap</span> <span>lightning</span> <br className="hidden sm:block" />
            <span>quick, anywhere</span>
          </h1>
        </div>
        
        <div className="w-[480px] max-w-[85vw]">
          {finalize && price ? (
            <QuoteView
              taker={address}
              price={price}
              quote={quote}
              setQuote={setQuote}
              chainId={chainId}
            />
          ) : (
            <PriceView
              taker={address as Address}
              price={price}
              setPrice={setPrice}
              setFinalize={setFinalize}
              chainId={chainId}
            />
          )}
        </div>

        <p className="text-[#5E5E5E] text-lg font-bold text-center max-w-[430px] mt-6">
          Buy & Sell crypto with ease at crazy speeds. Multichain, fast like lightning.
        </p>
      </div>
      <ConnectWithUs />
    </main>
  );
}

export default Page;
