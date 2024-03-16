import { useContext, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import styled, { ThemeContext } from 'styled-components';
import { Pair } from '@uniswap/v2-sdk';
import JSBI from 'jsbi';
import { Text } from 'rebass';

import { NomadWarningBanner } from 'components/WarningBanner/NomadWarningBanner';

import { useTotalSupply } from 'hooks/useTotalSupply';
import { useLPFeesInfo } from 'state/fees/hooks';

import { currencyId } from 'utils/currencyId';
import { unwrappedToken } from 'utils/wrappedCurrency';

import ARROW_BACK from '../../assets/images/arrow-back.svg';
import ELLIPSE from '../../assets/images/ellipse.svg';
import { ButtonPrimary } from '../../components/Button';
// import Card from '../../components/Card';
import { AutoColumn } from '../../components/Column';
import CurrencyLogo from '../../components/CurrencyLogo';
import { RowBetween, RowFixed } from '../../components/Row';
import { BIG_INT_ZERO } from '../../constants/misc';
import { useV2Pairs } from '../../hooks/useV2Pairs';
import { useActiveWeb3React } from '../../hooks/web3';
import { useStakingInfo } from '../../state/stake/hooks';
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks';
import { useTokenBalance, useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks';
import { TYPE } from '../../theme';

import { ClickableText, Dots } from './styleds';

const PageWrapper = styled(AutoColumn)`
  width: 100%;
`;

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`;

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`;

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`;

export const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.primary1};
  padding: 16px 12px;
  border-radius: 23px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default function PoolDetails() {
  const theme = useContext(ThemeContext);
  const { account } = useActiveWeb3React();
  const params: any = useParams();
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

  const lpFeesInfo = useLPFeesInfo(liquidityTokensWithBalances.map(({ tokens }) => tokens));
  const v2IsLoading =
    fetchingV2PairBalances ||
    v2Pairs?.length < liquidityTokensWithBalances.length ||
    v2Pairs?.some((V2Pair) => !V2Pair) ||
    lpFeesInfo?.length < liquidityTokensWithBalances.length;

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair));

  const poolDetail: any = allV2PairsWithLiquidity?.find((data: any) => {
    return data?.liquidityToken?.address === params?.address;
  });

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

  const feesWithoutStakedAmount = v2PairsWithoutStakedAmount.map((pair) => {
    return lpFeesInfo.find((fee) => fee?.pairAddress === pair.liquidityToken.address) ?? undefined;
  });
  const feesWithStakedAmount = stakingPairs.map((pair) => {
    return lpFeesInfo.find((fee) => fee?.pairAddress === pair[1]?.liquidityToken.address) ?? undefined;
  });

  const currency0 = unwrappedToken(poolDetail?.token0);
  const currency1 = unwrappedToken(poolDetail?.token1);
  const totalPoolTokens = useTotalSupply(poolDetail?.liquidityToken);
  const stakedBalance = '';

  const userDefaultPoolBalance = useTokenBalance(account ?? undefined, poolDetail?.liquidityToken);
  const userPoolBalance = stakedBalance ? userDefaultPoolBalance?.add(stakedBalance) : userDefaultPoolBalance;
  const [token0Deposited, token1Deposited] =
    !!poolDetail &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? [
          poolDetail.getLiquidityValue(poolDetail.token0, totalPoolTokens, userPoolBalance, false),
          poolDetail.getLiquidityValue(poolDetail.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined];
  return (
    <>
      <PageWrapper>
        {/* <SwapPoolTabs active={'pool'} /> */}
        {false && <NomadWarningBanner style={{ marginBottom: 16 }} />}

        <AutoColumn gap='lg' justify='center'>
          <AutoColumn gap='md' style={{ width: '100%', justifyContent: 'center' }}>
            <div className='flex flex-col xl:w-[894px]' style={{ marginTop: '20px' }}>
              <div className='flex flex-col bg-[#1D1C21] p-8 gap-8'>
                <RowBetween>
                  <div className='flex items-center gap-3'>
                    <Link to={'/pool/v2'}>
                      <img src={ARROW_BACK} alt='' />
                      {/* <ArrowLeft stroke={theme.white} /> */}
                    </Link>
                    <TYPE.mediumHeader fontWeight={500} color={theme.white} fontFamily={'Russo One'} fontSize={24}>
                      Back to Pools
                    </TYPE.mediumHeader>
                  </div>
                </RowBetween>
                {v2IsLoading ? (
                  <EmptyProposals>
                    <TYPE.body color={theme.primary1} textAlign='center'>
                      <Dots>Loading</Dots>
                    </TYPE.body>
                  </EmptyProposals>
                ) : (
                  <>
                    <div className='flex flex-col gap-4'>
                      <RowBetween>
                        <TYPE.body className='flex gap-2' color={theme.white} fontSize={16} fontWeight={700}>
                          {`${unwrappedToken(poolDetail?.token0)?.symbol}/${
                            unwrappedToken(poolDetail?.token1)?.symbol
                          }`}
                          <div className='h-6 flex justify-center items-center bg-[#314243] px-2'>
                            <TYPE.body className='flex gap-1' color={'#27e39f'} fontSize={14} fontWeight={500}>
                              <img src={ELLIPSE} alt='' />
                              Active
                            </TYPE.body>
                          </div>
                        </TYPE.body>
                        <Link to={`/remove/v2/${currencyId(currency0)}/${currencyId(currency1)}`}>
                          <div className='h-6 flex justify-center items-center bg-[#773030] px-2 cursor-pointer'>
                            <TYPE.body color={theme.white} fontSize={12} fontWeight={700}>
                              Remove
                            </TYPE.body>
                          </div>
                        </Link>
                      </RowBetween>
                      <div className='flex gap-3'>
                        <div className='flex flex-col gap-[6px]'>
                          <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                            Parameter:
                          </TYPE.body>
                          <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                            Current LP price:
                          </TYPE.body>
                        </div>
                        <div className='flex flex-col gap-[6px]'>
                          <div className='flex items-center justify-center px-2 bg-[#131215]'>
                            <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                              --
                            </TYPE.body>
                          </div>
                          <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                            --
                          </TYPE.body>
                        </div>
                      </div>
                    </div>
                    <AutoColumn gap='sm'>
                      <div className='flex flex-col bg-[#323038]'>
                        <RowBetween className='!py-3 !px-6'>
                          <TYPE.body color={theme.white} fontSize={16} fontWeight={500}>
                            Liquidity
                          </TYPE.body>
                          <ClickableText
                            fontWeight={700}
                            fontSize={12}
                            color={theme.white}
                            backgroundColor={'rgba(30, 30, 30, 1)'}
                            padding={'3px 19px'}
                            height={'24px'}
                          >
                            Increase liquidity
                          </ClickableText>
                        </RowBetween>
                        <AutoColumn gap='sm' className='px-6 pb-3'>
                          <TYPE.body fontSize={32} fontWeight={600} color={theme.white}>
                            $ --
                          </TYPE.body>
                          <RowBetween>
                            <TYPE.body
                              color={theme.white}
                              fontSize={14}
                              fontWeight={500}
                              style={{ display: ' flex', gap: '5px' }}
                            >
                              <CurrencyLogo size='20px' style={{ marginLeft: '8px' }} currency={currency0} />
                              {currency0?.symbol}
                            </TYPE.body>
                            <div className='flex gap-6'>
                              <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                                {token0Deposited ? (
                                  <RowFixed>
                                    <Text fontSize={14} fontWeight={500} marginLeft={'6px'}>
                                      {token0Deposited?.toSignificant(6)}
                                    </Text>
                                  </RowFixed>
                                ) : (
                                  '-'
                                )}
                              </TYPE.body>
                              <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                                -- %
                              </TYPE.body>
                            </div>
                          </RowBetween>
                          <RowBetween>
                            <TYPE.body
                              color={theme.white}
                              fontSize={14}
                              fontWeight={500}
                              style={{ display: ' flex', gap: '5px' }}
                            >
                              <CurrencyLogo size='20px' style={{ marginLeft: '8px' }} currency={currency0} />
                              {currency1?.symbol}
                            </TYPE.body>
                            <div className='flex gap-6'>
                              {token1Deposited ? (
                                <RowFixed>
                                  <Text fontSize={14} fontWeight={500} marginLeft={'6px'} color={theme.text1}>
                                    {token1Deposited?.toSignificant(6)}
                                  </Text>
                                </RowFixed>
                              ) : (
                                '-'
                              )}
                              <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                                -- %
                              </TYPE.body>
                            </div>
                          </RowBetween>
                        </AutoColumn>
                      </div>
                      <div className='flex flex-col bg-[#323038]'>
                        <div className='py-3 px-6 flex flex-col gap-3'>
                          <RowBetween>
                            <TYPE.body className='flex gap-2' color={theme.white} fontSize={16} fontWeight={500}>
                              Accrued fee
                              <div className='h-6 flex justify-center items-center bg-[#314243] px-2'>
                                <TYPE.body color={'#27e39f'} fontSize={14} fontWeight={500}>
                                  0.30%
                                </TYPE.body>
                              </div>
                            </TYPE.body>
                          </RowBetween>
                          <AutoColumn gap='sm'>
                            <TYPE.body fontSize={32} fontWeight={600} color={theme.white}>
                              $--
                            </TYPE.body>
                            <RowBetween>
                              <TYPE.body
                                color={theme.white}
                                fontSize={14}
                                fontWeight={500}
                                style={{ display: ' flex', gap: '5px' }}
                              >
                                <CurrencyLogo size='20px' style={{ marginLeft: '8px' }} currency={currency0} />
                                {currency0?.symbol}
                              </TYPE.body>
                              <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                                {'--'}
                              </TYPE.body>
                            </RowBetween>
                            <RowBetween>
                              <TYPE.body
                                color={theme.white}
                                fontSize={14}
                                fontWeight={500}
                                style={{ display: ' flex', gap: '5px' }}
                              >
                                <CurrencyLogo size='20px' style={{ marginLeft: '8px' }} currency={currency0} />
                                {currency1?.symbol}
                              </TYPE.body>
                              <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                                {'--'}
                              </TYPE.body>
                            </RowBetween>
                          </AutoColumn>
                        </div>
                      </div>
                    </AutoColumn>
                  </>
                )}
              </div>
              {/* <div className='flex flex-col justify-center items-center py-3 gap-[2px] bg-[#323038]'>
                <div className='flex gap-1'>
                  <TYPE.body color={theme.white} fontSize={'14px'}>
                    Learn about providing liquidity
                  </TYPE.body>
                </div>
                <TYPE.body
                  color={'#ffffff80'}
                  fontSize={'12px'}
                  fontWeight={500}
                  textAlign={'center'}
                  lineHeight={'18px'}
                >
                  Check out BrownFi parameter concept
                </TYPE.body>
              </div> */}
            </div>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  );
}
