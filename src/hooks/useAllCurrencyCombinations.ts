import { useMemo } from 'react';

import { Currency, Token } from '@uniswap/sdk-core';
import flatMap from 'lodash.flatmap';

import { ChainIdValue } from 'constants/chains';

import { ADDITIONAL_BASES, BASES_TO_CHECK_TRADES_AGAINST, CUSTOM_BASES } from '../constants/routing';
import { wrappedCurrency } from '../utils/wrappedCurrency';

import { useActiveWeb3React } from './web3';

export function useAllCurrencyCombinations(currencyA?: Currency, currencyB?: Currency): [Token, Token][] {
  const { chainId } = useActiveWeb3React();

  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined];

  const bases: Token[] = useMemo(() => {
    if (!chainId) return [];

    const common = BASES_TO_CHECK_TRADES_AGAINST[chainId as ChainIdValue] ?? [];
    const additionalA = tokenA ? ADDITIONAL_BASES[chainId as ChainIdValue]?.[tokenA.address] ?? [] : [];
    const additionalB = tokenB ? ADDITIONAL_BASES[chainId as ChainIdValue]?.[tokenB.address] ?? [] : [];

    return [...common, ...additionalA, ...additionalB];
  }, [chainId, tokenA, tokenB]);

  const basePairs: [Token, Token][] = useMemo(
    () => flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])),
    [bases],
  );

  return useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
              if (!chainId) return true;
              const customBases = CUSTOM_BASES[chainId as ChainIdValue];

              const customBasesA: Token[] | undefined = customBases?.[tokenA.address];
              const customBasesB: Token[] | undefined = customBases?.[tokenB.address];

              if (!customBasesA && !customBasesB) return true;

              if (customBasesA && !customBasesA.find((base) => tokenB.equals(base))) return false;
              if (customBasesB && !customBasesB.find((base) => tokenA.equals(base))) return false;

              return true;
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId],
  );
}
