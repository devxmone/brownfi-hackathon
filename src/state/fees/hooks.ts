import { useMemo } from 'react';

import { Interface } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core';
import { Pair } from '@uniswap/v2-sdk';

import SWAP_PAIR_ABI from '../../abis/pair.json';
import { useActiveWeb3React } from '../../hooks/web3';
import { wrappedCurrency } from '../../utils/wrappedCurrency';
import { useMultipleContractSingleData } from '../multicall/hooks';

export const SWAP_PAIR_INTERFACE = new Interface(SWAP_PAIR_ABI);

export interface LPFeesInfo {
  // the address of the pair
  pairAddress: string;
  // the address of the fees contract
  feesAddress: string;
  // the tokens involved in this pair
  tokens: [Token, Token];
  // the amount of token0 earned from trading fees
  claimable0: CurrencyAmount<Token>;
  // the amount of token1 earned from trading fees
  claimable1: CurrencyAmount<Token>;
}

// gets the lp fees info from the network for the active chain id
export function useLPFeesInfo(currencies: [Currency | undefined, Currency | undefined][]): (LPFeesInfo | null)[] {
  const { chainId, account } = useActiveWeb3React();

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies],
  );

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined;
      }),
    [tokens],
  );

  const feesAddresses = useMultipleContractSingleData(pairAddresses, SWAP_PAIR_INTERFACE, 'fees', undefined);
  const claimableFees = useMultipleContractSingleData(pairAddresses, SWAP_PAIR_INTERFACE, 'claimableFeesFor', [
    account ?? undefined,
  ]);

  return useMemo(() => {
    if (!account || !chainId) return Array(currencies.length).fill(null);

    return pairAddresses.reduce<(LPFeesInfo | null)[]>((memo, pairAddress, index) => {
      const feesAddress = feesAddresses[index]?.result?.[0];
      const claimableFeesResult = claimableFees[index]?.result as BigNumber[] | undefined;
      const [token0, token1] = tokens[index];

      if (!pairAddress || !feesAddress || !claimableFeesResult || !token0 || !token1) {
        memo.push(null);
        return memo;
      }

      const claimable0 = CurrencyAmount.fromRawAmount(token0, claimableFeesResult[0].toString());
      const claimable1 = CurrencyAmount.fromRawAmount(token1, claimableFeesResult[1].toString());

      if (!token0 || !token1 || !claimable0 || !claimable1) {
        memo.push(null);
        return memo;
      }

      memo.push({
        pairAddress,
        feesAddress,
        tokens: [token0, token1],
        claimable0,
        claimable1,
      });

      return memo;
    }, []);
  }, [tokens, pairAddresses, feesAddresses, claimableFees]);
}
