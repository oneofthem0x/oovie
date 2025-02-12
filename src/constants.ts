import { Address } from "viem";

export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export const MAGIC_CALLDATA_STRING = "f".repeat(130); // used when signing the eip712 message

export const AFFILIATE_FEE = 100; // 1% affiliate fee. Denoted in Bps.
export const FEE_RECIPIENT = "0xD13985a914d23fcf7eB4d221E805d08B066f713E"; // The ETH address that should receive affiliate fees

export const MAINNET_EXCHANGE_PROXY =
  "0xdef1c0ded9bec7f1a1670819833240f027b25eff";

export const MAX_ALLOWANCE =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n;

// Token interface matching Coingecko's format
export interface Token {
  name: string;
  address: Address;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
}

// Popular tokens (Top 8 by market cap)
export const POPULAR_TOKENS: Token[] = [
  {
    chainId: 1,
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    logoURI: "https://assets.coingecko.com/coins/images/2518/large/weth.png?1628852295",
  },
  {
    chainId: 1,
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    logoURI: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
  },
  {
    chainId: 1,
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    logoURI: "https://assets.coingecko.com/coins/images/325/large/Tether.png?1668148663",
  },
  {
    chainId: 1,
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
    address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
    logoURI: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850",
  },
  {
    chainId: 1,
    name: "Wrapped BTC",
    symbol: "WBTC",
    decimals: 8,
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    logoURI: "https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1548822744",
  },
  {
    chainId: 1,
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    logoURI: "https://assets.coingecko.com/coins/images/9956/large/4943.png?1636636734",
  },
  {
    chainId: 1,
    name: "Chainlink Token",
    symbol: "LINK",
    decimals: 18,
    address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    logoURI: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1547034700",
  },
  {
    chainId: 1,
    name: "Uniswap",
    symbol: "UNI",
    decimals: 18,
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    logoURI: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1600306604",
  },
];

// Default tokens to show while loading the full list
export const MAINNET_TOKENS: Token[] = [...POPULAR_TOKENS];

// Create lookup objects for quick access with initial popular tokens
export const MAINNET_TOKENS_BY_SYMBOL: Record<string, Token> = Object.fromEntries(
  POPULAR_TOKENS.map(token => [token.symbol.toLowerCase(), token])
);

export const MAINNET_TOKENS_BY_ADDRESS: Record<string, Token> = Object.fromEntries(
  POPULAR_TOKENS.map(token => [token.address.toLowerCase(), token])
);

// Coingecko token list URL
export const COINGECKO_TOKEN_LIST_URL = "https://tokens.coingecko.com/uniswap/all.json";

// Function to fetch and update token lists
export async function fetchTokenList(): Promise<Token[]> {
  try {
    const response = await fetch(COINGECKO_TOKEN_LIST_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Filter for Ethereum mainnet tokens and format them
    const mainnetTokens = data.tokens
      .filter((token: { chainId: number }) => token.chainId === 1)
      .map((token: { 
        name: string;
        symbol: string;
        decimals: number;
        address: string;
        logoURI?: string;
      }) => {
        // Handle missing or invalid logoURI
        let logoURI = token.logoURI || '';
        if (logoURI && logoURI.includes('/thumb/')) {
          logoURI = logoURI.replace('/thumb/', '/large/');
        }

        return {
          chainId: 1,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          address: token.address as Address,
          logoURI: logoURI || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', // Fallback image
        };
      });

    // Create a Set of popular token addresses for quick lookup
    const popularTokenAddresses = new Set(
      POPULAR_TOKENS.map(token => token.address.toLowerCase())
    );

    // Filter out tokens that are already in popular tokens
    const nonPopularTokens = mainnetTokens.filter(
      (token: Token) => !popularTokenAddresses.has(token.address.toLowerCase())
    );

    // Update lookup objects with non-popular tokens
    nonPopularTokens.forEach((token: Token) => {
      MAINNET_TOKENS_BY_SYMBOL[token.symbol.toLowerCase()] = token;
      MAINNET_TOKENS_BY_ADDRESS[token.address.toLowerCase()] = token;
    });

    // Clear and repopulate MAINNET_TOKENS with both popular and other tokens
    MAINNET_TOKENS.length = 0;
    MAINNET_TOKENS.push(...POPULAR_TOKENS, ...nonPopularTokens);

    return MAINNET_TOKENS;
  } catch (error) {
    console.error("Error fetching token list:", error);
    return MAINNET_TOKENS;
  }
}

// Initialize token lists
fetchTokenList().catch(console.error);
