import { useEffect, useState } from 'react';
import { Token, fetchTokenList, MAINNET_TOKENS } from '../constants';

export function useTokenList() {
  const [tokens, setTokens] = useState<Token[]>(MAINNET_TOKENS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTokens() {
      try {
        const tokenList = await fetchTokenList();
        setTokens(tokenList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load tokens'));
      } finally {
        setLoading(false);
      }
    }

    loadTokens();
  }, []);

  return {
    tokens,
    loading,
    error,
    tokensBySymbol: Object.fromEntries(tokens.map(token => [token.symbol.toLowerCase(), token])),
    tokensByAddress: Object.fromEntries(tokens.map(token => [token.address.toLowerCase(), token])),
  };
} 