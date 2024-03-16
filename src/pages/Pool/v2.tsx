import { useContext, useMemo } from 'react';
import { Plus } from 'react-feather';
import { Link } from 'react-router-dom';

import styled, { ThemeContext } from 'styled-components';
import { Pair } from '@uniswap/v2-sdk';
import JSBI from 'jsbi';

import { NomadWarningBanner } from 'components/WarningBanner/NomadWarningBanner';

import { useLPFeesInfo } from 'state/fees/hooks';

import { unwrappedToken } from 'utils/wrappedCurrency';

import ConnectWallet from '../../assets/images/connect-wallet.png';
import ELLIPSE from '../../assets/images/ellipse.svg';
import LIQUIDITY_POSITION_ICON from '../../assets/images/inbox.svg';
import { ButtonLight, ButtonPrimary } from '../../components/Button';
// import Card from '../../components/Card';
import { AutoColumn } from '../../components/Column';
import { SwapPoolTabs } from '../../components/NavigationTabs';
import { RowBetween, RowFixed } from '../../components/Row';
import { Dots } from '../../components/swap/styleds';
import { BIG_INT_ZERO } from '../../constants/misc';
import { useV2Pairs } from '../../hooks/useV2Pairs';
import { useActiveWeb3React } from '../../hooks/web3';
import { useWalletModalToggle } from '../../state/application/hooks';
import { useStakingInfo } from '../../state/stake/hooks';
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks';
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks';
import { TYPE } from '../../theme';

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

export default function Pool() {
  const theme = useContext(ThemeContext);
  const { account } = useActiveWeb3React();

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

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
  console.log(trackedTokenPairs);
  return (
    <>
      <PageWrapper>
        <SwapPoolTabs active={'pool'} />
        {false && <NomadWarningBanner style={{ marginBottom: 16 }} />}
        {/*<InfoCard
          title="Liquidity provider rewards"
          description={`Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`}
        />*/}

        <AutoColumn gap='lg' justify='center'>
          <AutoColumn gap='md' style={{ width: '100%', justifyContent: 'center' }}>
            {/* <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
              <HideSmall>
                <TYPE.mediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
                  Your liquidity
                </TYPE.mediumHeader>
              </HideSmall>
              <ButtonRow>
                <ResponsiveButtonPrimary as={Link} padding='6px 8px' to='/add/v2/BNB'>
                  Create a pair
                </ResponsiveButtonPrimary>
                <ResponsiveButtonPrimary
                  id='find-pool-button'
                  as={Link}
                  padding='6px 8px'
                  borderRadius='8px'
                  to='/pool/import'
                >
                  <Text fontWeight={500} fontSize={16}>
                    Import Pool
                  </Text>
                </ResponsiveButtonPrimary>
                <ResponsiveButtonPrimary
                  id='join-pool-button'
                  as={Link}
                  padding='6px 8px'
                  borderRadius='8px'
                  to='/add/v2/BNB'
                >
                  <Text fontWeight={500} fontSize={16}>
                    Add Liquidity
                  </Text>
                </ResponsiveButtonPrimary>
              </ButtonRow>
            </TitleRow> */}

            {!account ? (
              <div className='flex flex-col xl:w-[894px]'>
                <div className='flex flex-col bg-[#1D1C21] p-8 gap-8'>
                  <div className='flex flex-col'>
                    <TYPE.body color={theme.white} fontSize={'24px'} fontFamily={'Russo One'}>
                      Pools
                    </TYPE.body>
                    <div className='flex flex-col gap-4 justify-center items-center'>
                      <div className='flex flex-col gap-4 items-center max-w-[288px]'>
                        <img src={LIQUIDITY_POSITION_ICON} alt='' className='w-[100px] h-[100px]' />
                        <TYPE.body color={'#ffffff80'} fontSize={'16x'} fontWeight={500} textAlign={'center'}>
                          Your active liquidity position will appear here.
                        </TYPE.body>
                      </div>
                    </div>
                  </div>
                  <div className='flex w-full justify-center'>
                    <ButtonLight maxWidth={'436px'} onClick={toggleWalletModal}>
                      <img src={ConnectWallet} /> &nbsp; Connect Wallet
                    </ButtonLight>
                  </div>
                </div>
                <div className='flex flex-col justify-center items-center py-3 gap-[2px] bg-[#323038]'>
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
                </div>
              </div>
            ) : v2IsLoading ? (
              <EmptyProposals>
                <TYPE.body color={theme.primary1} textAlign='center'>
                  <Dots>Loading</Dots>
                </TYPE.body>
              </EmptyProposals>
            ) : allV2PairsWithLiquidity?.length === 0 || stakingPairs?.length === 0 ? (
              <>
                {/* 
                <ButtonSecondary>
                  <RowBetween>
                    <ExternalLink href={'https://v2.info.uniswap.org/account/' + account}>
                      Account analytics and accrued fees
                    </ExternalLink>
                    <span> ↗</span>
                  </RowBetween>
                </ButtonSecondary> */}
                {/* {v2PairsWithoutStakedAmount.map((v2Pair, index) => (
                  <FullPositionCard
                    key={v2Pair.liquidityToken.address}
                    pair={v2Pair}
                    lpFeesInfo={feesWithoutStakedAmount[index] ?? undefined}
                  />
                ))}
                {stakingPairs.map(
                  (stakingPair, i) =>
                    stakingPair[1] && ( // skip pairs that arent loaded
                      <FullPositionCard
                        key={stakingInfosWithBalance[i].stakingRewardAddress}
                        pair={stakingPair[1]}
                        stakedBalance={stakingInfosWithBalance[i].stakedAmount}
                        lpFeesInfo={feesWithStakedAmount[i] ?? undefined}
                      />
                    ),
                )} */}
                <div className='flex flex-col xl:w-[894px]'>
                  <div className='flex flex-col bg-[#1D1C21] p-8 gap-8'>
                    <RowBetween>
                      <TYPE.body color={theme.white} fontSize={'24px'} fontFamily={'Russo One'}>
                        Pools
                      </TYPE.body>
                      <Link to='/add/v2'>
                        <div className='flex w-full justify-center'>
                          <ButtonLight maxWidth={'436px'} href='/add/v2'>
                            <Plus size='16' color={theme.white} /> &nbsp; New Position
                          </ButtonLight>
                        </div>
                      </Link>
                    </RowBetween>
                    <div className='flex flex-col bg-[#323038]'>
                      <RowBetween className='!py-3 !px-6'>
                        <TYPE.body color={theme.white} fontSize={16} fontWeight={700}>
                          Your positions ({v2PairsWithoutStakedAmount?.length})
                        </TYPE.body>
                        <TYPE.body color={'#27e3ab'} fontSize={14} fontWeight={500}>
                          Hide closed positions
                        </TYPE.body>
                      </RowBetween>
                      <div className='w-full h-[1px] bg-[#4c4a4f]' />
                      {v2PairsWithoutStakedAmount.map((v2Pair, index) => (
                        <Link to={`/pool/v2/${v2Pair?.liquidityToken?.address}`} key={index}>
                          <div className='py-3 px-6 flex flex-col gap-3 cursor-pointer'>
                            <RowBetween>
                              <TYPE.body className='flex gap-2' color={theme.white} fontSize={16} fontWeight={700}>
                                {`${unwrappedToken(v2Pair?.token0)?.symbol}/${unwrappedToken(v2Pair?.token1)?.symbol}`}
                                <div className='h-6 flex justify-center items-center bg-[#314243] px-2'>
                                  <TYPE.body color={'#27e39f'} fontSize={14} fontWeight={500}>
                                    --
                                  </TYPE.body>
                                </div>
                              </TYPE.body>
                              <div className='h-6 flex justify-center items-center bg-[#314243] px-2'>
                                <TYPE.body className='flex gap-1' color={'#27e39f'} fontSize={14} fontWeight={500}>
                                  <img src={ELLIPSE} alt='' />
                                  Active
                                </TYPE.body>
                              </div>
                            </RowBetween>
                            <div className='flex gap-[59px]'>
                              <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                                Parameter: --
                              </TYPE.body>
                              <TYPE.body color={theme.white} fontSize={14} fontWeight={500}>
                                Current LP price: --
                              </TYPE.body>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className='flex flex-col justify-center items-center py-3 gap-[2px] bg-[#323038]'>
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
                  </div>
                </div>
              </>
            ) : (
              <div className='flex flex-col xl:w-[894px]'>
                <div className='flex flex-col bg-[#1D1C21] p-8 gap-8'>
                  <div className='flex flex-col'>
                    <TYPE.body color={theme.white} fontSize={'24px'} fontFamily={'Russo One'}>
                      Pools
                    </TYPE.body>
                    <div className='flex flex-col gap-4 justify-center items-center'>
                      <div className='flex flex-col gap-4 items-center max-w-[288px]'>
                        <img src={LIQUIDITY_POSITION_ICON} alt='' className='w-[100px] h-[100px]' />
                        <TYPE.body color={'#ffffff80'} fontSize={'16x'} fontWeight={500} textAlign={'center'}>
                          Your active liquidity position will appear here.
                        </TYPE.body>
                      </div>
                    </div>
                  </div>
                  <Link to='/add/v2'>
                    <div className='flex w-full justify-center'>
                      <ButtonLight maxWidth={'436px'} href='/add/v2'>
                        <Plus size='16' color={theme.white} /> &nbsp; New Position
                      </ButtonLight>
                    </div>
                  </Link>
                </div>
                <div className='flex flex-col justify-center items-center py-3 gap-[2px] bg-[#323038]'>
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
                </div>
              </div>
            )}
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  );
}
