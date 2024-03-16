import { useMemo, useState } from 'react';

import styled, { DefaultTheme } from 'styled-components';
import { Currency, Token } from '@uniswap/sdk-core';
import { Pair } from '@uniswap/v2-sdk';
import JSBI from 'jsbi';

import LiquidityAssetsTable from 'components/assets/liquidity/LiquidityAssetsTable';
import TokensAssetsTable from 'components/assets/tokens/TokensAssetsTable';
import { TotalAssets } from 'components/assets/TotalAssets';
import { HeadingWithPotion } from 'components/Heading/HeadingWithPotion';
import { useTokenComparator } from 'components/SearchModal/sorting';
import { useEarnedDiff } from 'components/stake/stake-hooks';

import AssetContextProvider from 'contexts/assets/AssetContext';
import { useAllTokens } from 'hooks/Tokens';
import { useUSDCValue } from 'hooks/useUSDCPrice';
import { useV2Pairs } from 'hooks/useV2Pairs';
import { useActiveWeb3React } from 'hooks/web3';
import { useStakingInfo } from 'state/stake/hooks';
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks';
import { useCurrencyBalance, useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks';

import { ChainId, ChainIdValue } from 'constants/chains';
import { BIG_INT_ZERO } from 'constants/misc';
import { Eth, XAPPTOKEN } from 'constants/tokens';
import { isTruthy } from 'utils/isTruthy';

const AssetsListContainer = styled.div`
  max-width: 1080px;
  width: 100%;
`;

const TableHeadingText = styled.h2`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.primary1};
  font-size: 2.25rem;
  margin-top: 0;
`;

export const AssetsListPage = () => {
  const { account, chainId } = useActiveWeb3React();

  // Token Assets
  const allTokens = useAllTokens();
  const [invertSearchOrder] = useState<boolean>(false);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const sortedTokens: Token[] = useMemo(() => {
    return Object.values(allTokens).sort(tokenComparator);
  }, [allTokens, tokenComparator]);

  const [tokenBalances, balancesLoading] = useTokenBalancesWithLoadingIndicator(account ?? undefined, sortedTokens);
  const ethBalance = useCurrencyBalance(account ?? undefined, Eth.onChain(chainId || ChainId.MAINNET) as Currency);
  const sumOfTokenBalances = [ethBalance, ...Object.values(tokenBalances)].reduce((acc, curr) => {
    if (curr?.greaterThan(0)) {
      return parseFloat(curr?.toSignificant()) + acc;
    } else {
      return acc + 0;
    }
  }, 0);

  const xToken = chainId ? XAPPTOKEN[chainId as ChainIdValue] : undefined;
  const [xdiffBalance, xdiffBalanceLoading] = useTokenBalancesWithLoadingIndicator(account ?? undefined, [xToken]);
  const earnedDiff = useEarnedDiff(Object.values(xdiffBalance)[0]);
  const xdiffValue = useUSDCValue(earnedDiff);

  // Liquidity Assets
  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs();
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs],
  );
  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  );
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens,
  );

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  );

  const v2Pairs = useV2Pairs(liquidityTokensWithBalances.map(({ tokens }) => tokens));

  const v2IsLoading =
    fetchingV2PairBalances ||
    v2Pairs?.length < liquidityTokensWithBalances.length ||
    v2Pairs?.some((V2Pair) => !V2Pair);

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair));

  // show liquidity even if its deposited in rewards contract
  const stakingInfo = useStakingInfo();
  const stakingInfosWithBalance = stakingInfo?.filter((pool) =>
    JSBI.greaterThan(pool.stakedAmount.quotient, BIG_INT_ZERO),
  );
  const stakingPairs = useV2Pairs(stakingInfosWithBalance?.map((stakingInfo) => stakingInfo.tokens));

  // remove any pairs that also are included in pairs with stake in mining pool
  const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter((v2Pair) => {
    return (
      stakingPairs
        ?.map((stakingPair) => stakingPair[1])
        .filter((stakingPair) => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
    );
  });
  // const allLiquidityTokens = [...stakingPairs.map((pair) => pair[1]), ...v2PairsWithoutStakedAmount]
  //   .map((pair) => pair?.liquidityToken)
  //   .filter((pair) => !!pair)
  // const [liquidityBalances, liquidityBalancesLoading] = useTokenBalancesWithLoadingIndicator(
  //   account ?? undefined,
  //   allLiquidityTokens
  // )
  // const sumOfLiquidityBalances = Object.values(liquidityBalances).reduce((acc, curr) => {
  //   if (curr?.greaterThan(0)) {
  //     return parseFloat(curr?.toSignificant(4)) + acc
  //   } else {
  //     return acc + 0
  //   }
  // }, 0)

  const tokensWithBalance = useMemo(() => {
    return [ethBalance, ...Object.values(tokenBalances)]
      .filter(isTruthy)
      .filter((a) => a && a.greaterThan(0))
      .filter((a) => {
        if (!chainId) {
          return true;
        }
        const xDiff = XAPPTOKEN[chainId as ChainIdValue];
        if (!xDiff) {
          return true;
        }
        return xDiff.address !== a?.currency.wrapped.address;
      })
      .filter(isTruthy);
  }, [chainId, tokenBalances, ethBalance]);

  return (
    <AssetContextProvider>
      <AssetsListContainer>
        <HeadingWithPotion
          heading='My Assets'
          description='Overview of your tokens, liquidity, positions on BrownFi.'
        />
        <TotalAssets
          stakedBalance={parseFloat(xdiffValue?.toSignificant(4) ?? '0')}
          isBalanceLoading={fetchingV2PairBalances || balancesLoading || xdiffBalanceLoading || v2IsLoading}
        />
        <TableHeadingText>Token</TableHeadingText>
        <TokensAssetsTable
          currencyAmountsWithBalance={tokensWithBalance}
          sumOfBalances={sumOfTokenBalances}
          isBalancesLoading={balancesLoading}
        />
        <TableHeadingText>Liquidity</TableHeadingText>
        <LiquidityAssetsTable
          v2IsLoading={v2IsLoading}
          allV2PairsWithLiquidity={allV2PairsWithLiquidity}
          v2PairsWithoutStakedAmount={v2PairsWithoutStakedAmount}
          stakingPairs={stakingPairs}
          stakingInfosWithBalance={stakingInfosWithBalance}
        />
        {/* <TableHeadingText>Farms</TableHeadingText>
        <FarmAssetsTable />
        <TableHeadingText>Staked</TableHeadingText>
        <StakedAssetsTable /> */}
      </AssetsListContainer>
    </AssetContextProvider>
  );
};
