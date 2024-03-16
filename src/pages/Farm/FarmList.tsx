import { useMemo, useState } from 'react';

import styled from 'styled-components';
// import { CurrencyAmount, Token } from 'sdk-core/entities'
// import { DoubleCurrencyLogo } from 'components/DoubleLogo/DoubleCurrencyLogo.stories'
// import { Link } from 'react-router-dom'
// import StakingModal from 'components/farm/StakingModal'
// import UnstakingModal from 'components/farm/UnstakingModal'
// import { isTruthy } from 'utils/isTruthy'
import JSBI from 'jsbi';

// import CurrencyLogo from 'components/CurrencyLogo'
import { FarmTableRow } from 'components/farm/FarmTable';
import { NomadWarningBanner } from 'components/WarningBanner/NomadWarningBanner';
import { ComingSoon } from 'pages/Stake/StakingPage';

import { useTotalSupply } from 'hooks/useTotalSupply';
import { useUSDCValue } from 'hooks/useUSDCPrice';
import {
  MinichefRawPoolInfo,
  useCalculateAPR,
  useFarmTVL,
  useOwnWeeklyEmission,
  usePairTokens,
  usePools,
  useRewardInfos,
} from 'state/farm/farm-hooks';

import { CurrencyAmount } from 'sdk-core/entities';

const FarmListContainer = styled.div`
  max-width: 1080px;
  width: 100%;
`;

export function FarmListPage() {
  const { pools, pageCount, setPage, page } = usePaginatedPools();

  return (
    <FarmListContainer>
      {false && <NomadWarningBanner />}
      {/* <HeadingWithPotion heading="Farm" description="Earn fees and rewards by depositing and staking your LP tokens." />

      <FarmTable>
        {pools.map((pool) => (
          <PoolRow {...pool} key={pool.poolId} />
        ))}
      </FarmTable> */}

      <ComingSoon>Coming Soon</ComingSoon>
    </FarmListContainer>
  );
}

const PAGE_LENGTH = 100;

function usePaginatedPools() {
  const [page, setPage] = useState(0);
  const { pools, poolLength } = usePools(page, PAGE_LENGTH);
  const pageCount = useMemo(() => Math.ceil(poolLength / PAGE_LENGTH), [poolLength]);

  return {
    pools,
    page,
    pageCount,
    setPage,
  };
}

export type PoolProps = MinichefRawPoolInfo;

export function PoolRow({
  lpTokenAddress,
  poolId,
  // pendingAmount,
  rewarderAddress,
  stakedRawAmount,
  poolEmissionAmount,
}: PoolProps) {
  const { totalPoolStaked, pair, lpToken } = usePairTokens(lpTokenAddress);
  const { rewardPerSecondAmount } = useRewardInfos(poolId, rewarderAddress);

  const tvl = useFarmTVL(pair ?? undefined, totalPoolStaked);
  const primaryAPR = useCalculateAPR(poolEmissionAmount, tvl);
  const secondaryAPR = useCalculateAPR(rewardPerSecondAmount, tvl);
  const totalAPR = JSBI.add(primaryAPR || JSBI.BigInt(0), secondaryAPR || JSBI.BigInt(0));

  const stakedAmount = lpToken ? CurrencyAmount.fromRawAmount(lpToken, stakedRawAmount || 0) : undefined;
  const totalPoolTokens = useTotalSupply(lpToken ?? undefined);

  const [token0Deposited, token1Deposited] = useMemo(
    () =>
      !!pair &&
      !!totalPoolTokens &&
      !!stakedAmount &&
      // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
      JSBI.greaterThanOrEqual(totalPoolTokens.quotient, stakedAmount.quotient)
        ? [
            pair.getLiquidityValue(pair.token0, totalPoolTokens, stakedAmount, false),
            pair.getLiquidityValue(pair.token1, totalPoolTokens, stakedAmount, false),
          ]
        : [undefined, undefined],
    [pair, totalPoolTokens, stakedAmount],
  );

  const token0Value = useUSDCValue(token0Deposited);
  const token1Value = useUSDCValue(token1Deposited);

  const positionValue = useMemo(() => token0Value?.multiply(2) || token1Value?.multiply(2), [token0Value, token1Value]);
  const ownPrimaryWeeklyEmission = useOwnWeeklyEmission(poolEmissionAmount, stakedAmount, totalPoolStaked);
  const ownSecondaryWeeklyEmission = useOwnWeeklyEmission(rewardPerSecondAmount, stakedAmount, totalPoolStaked);

  const isActive =
    positionValue?.greaterThan(0) || poolEmissionAmount?.greaterThan(0) || rewardPerSecondAmount?.greaterThan(0);

  if (!isActive) {
    return null;
  }

  return (
    <>
      <FarmTableRow
        pair={pair ?? undefined}
        poolId={poolId}
        tvl={tvl}
        totalLPStaked={totalPoolStaked}
        primaryEmissionPerSecond={poolEmissionAmount}
        secondaryEmissionPerSecond={rewardPerSecondAmount}
        ownPrimaryWeeklyEmission={ownPrimaryWeeklyEmission}
        ownSecondaryWeeklyEmission={ownSecondaryWeeklyEmission}
        totalAPR={totalAPR}
        positionValue={positionValue}
      />
    </>
  );
}
