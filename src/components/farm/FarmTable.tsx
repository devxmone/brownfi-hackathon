import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import styled from 'styled-components';
import { DefaultTheme } from 'styled-components/macro';
import JSBI from 'jsbi';

import { CurrencyLogoFromList } from 'components/CurrencyLogo/CurrencyLogoFromList';
import DoubleCurrencyLogo from 'components/DoubleLogo';

import useMediaQuery from 'hooks/useMediaQuery';

import { BIG_INT_SECONDS_IN_WEEK } from 'constants/misc';
import { unwrappedToken } from 'utils/wrappedCurrency';

import { CurrencyAmount, Token } from 'sdk-core/entities';
import { Pair } from 'v2-sdk/entities';

import 'styled-components/macro';

import Column, { AutoColumn } from '../Column';
import { HRDark } from '../HR/HR';
import { AutoRow } from '../Row';

const FarmContainer = styled(Column)`
  max-width: 1080px;
  width: 100%;
  border-radius: 10px;
  padding: 24px;
  flex: 1 1;
  position: relative;
  border: ${({ theme }) => `1px solid ${theme.primary1}`};
  border-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 12px 24px;
  `};
`;

export function FarmTable({ children }: { children?: ReactNode }) {
  return (
    <>
      <FarmContainer>
        {/*<div*/}
        {/*  css={`*/}
        {/*    display: grid;*/}
        {/*    gap: 8px;*/}
        {/*    grid-template-columns: repeat(4, minmax(0, 1fr));*/}
        {/*  `}*/}
        {/*>*/}
        <FarmTableHeader />
        {/*<RowBetween>*/}
        {/*  <HR />*/}
        {/*</RowBetween>*/}
        {children}
        {/*</div>*/}
      </FarmContainer>
    </>
  );
}

// const FarmTableHeaderRow = styled(RowBetween)`
//
// `

const FarmTableHeaderText = styled(AutoColumn)`
  font-size: 1rem;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.primary1};
  text-align: right;
  width: 15%;
`;

const FarmTableHeaderContainer = styled(AutoRow)`
  padding: 10px 30px 0;
  margin-bottom: 2%;
  align-items: flex-start;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none
  `};
`;

export function FarmTableHeader() {
  return (
    <FarmTableHeaderContainer justify={'space-between'}>
      <FarmTableHeaderText style={{ width: '20%', paddingRight: '24px', textAlign: 'center' }}>
        Pool
      </FarmTableHeaderText>
      <FarmTableHeaderText style={{ width: '20%', paddingRight: '24px' }}>TVL</FarmTableHeaderText>
      <FarmTableHeaderText>
        Rewards<div style={{ fontSize: '12px' }}>(per week)</div>
      </FarmTableHeaderText>
      <FarmTableHeaderText>APR</FarmTableHeaderText>
      <FarmTableHeaderText>Your Deposit</FarmTableHeaderText>
      <FarmTableHeaderText>
        Your Rewards<div style={{ fontSize: '12px' }}>(per week)</div>
      </FarmTableHeaderText>
    </FarmTableHeaderContainer>
  );
}

type TableRowProps = {
  poolId: number;
  pair?: Pair;
  tvl?: CurrencyAmount<Token>;
  totalLPStaked?: CurrencyAmount<Token>;
  primaryEmissionPerSecond?: CurrencyAmount<Token>;
  secondaryEmissionPerSecond?: CurrencyAmount<Token>;
  ownPrimaryWeeklyEmission?: CurrencyAmount<Token>;
  ownSecondaryWeeklyEmission?: CurrencyAmount<Token>;
  totalAPR?: JSBI;
  positionValue?: CurrencyAmount<Token>;
};

export const PoolPair = styled(AutoColumn)`
  display: flex;
  justify-content: start;
  align-items: center;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.primary1};
  width: 20%;
`;

const TVL = styled(AutoColumn)`
  justify-content: end;
  text-align: right;
  text-decoration: none;
  padding-right: 24px;
  width: 20%;
`;

const MobilePoolName = styled.span`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.primary1};
  font-size: 20px;
`;
const MobilePoolHeading = styled(AutoRow)`
  padding-left: 3%;
`;

const MobilePoolAttributes = styled(AutoRow)`
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 5px;
`;

const MobilePoolAttribute = styled(AutoColumn)`
  justify-content: flex-start;
`;

const MobileAttributeName = styled.span`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.primary1};
  font-size: 12px;
`;

const MobileAttributeValue = styled.span`
  padding-top: 8px;
  font-size: 16px;
  text-align: right;
`;

export const PoolRow = styled(Link)`
  text-decoration: none;
  border-radius: 10px;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.primary1};
  font-size: 1.1rem;

  :hover,
  :focus {
    color: ${({ theme }) => theme.primary1};
  }
  margin: 10px 0;
  padding: 0 30px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0;
  `};
`;

export const Emission = styled(AutoColumn)`
  display: flex;
  justify-content: end;
  align-items: center;
  :nth-of-type(2) {
    padding-top: 8px;
  }
`;

export const EmissionText = styled.span`
  padding-right: 10px;
`;

const EstReward = styled(AutoRow)`
  :nth-of-type(2) {
    padding-top: 8px;
  }
`;

const EstRewardText = styled.div`
  padding-right: 10px;
`;

export const RowColumn = styled.div`
  width: 15%;
  text-align: right;
  justify-content: flex-end;
`;

const HRDarkLine = styled(HRDark)`
  margin: 0;
`;

export function FarmTableRow({
  pair,
  poolId,
  tvl,
  totalLPStaked,
  primaryEmissionPerSecond,
  secondaryEmissionPerSecond,
  ownPrimaryWeeklyEmission,
  ownSecondaryWeeklyEmission,
  totalAPR,
  positionValue,
}: TableRowProps) {
  const isMobile = useMediaQuery('(max-width: 720px)');
  const currency0 = pair?.token0 ? unwrappedToken(pair.token0) : undefined;
  const currency1 = pair?.token1 ? unwrappedToken(pair.token1) : undefined;
  const totalDepositsText = tvl
    ? `$${tvl.toFixed(0, { groupSeparator: ',' })}`
    : `${totalLPStaked?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} BrownFi-LP`;
  const yourDepositText = positionValue?.greaterThan(0) ? `$${positionValue.toFixed(0, { groupSeparator: ',' })}` : '-';
  const totalAPRText = totalAPR && JSBI.GT(totalAPR, JSBI.BigInt(0)) ? `${totalAPR.toString()}%` : '-';
  const PoolName = currency0 && currency1 ? `${currency0?.symbol}/${currency1?.symbol}` : '-';

  return (
    <PoolRow to={`/farm/${poolId}`}>
      {isMobile ? (
        <>
          <HRDarkLine />
          <AutoColumn style={{ padding: '20px' }}>
            <MobilePoolHeading gap={'2%'} justify={'flex-start'}>
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
              <MobilePoolName>{PoolName}</MobilePoolName>
            </MobilePoolHeading>
            <MobilePoolAttributes gap='3%'>
              <MobilePoolAttribute>
                <MobileAttributeName>Total Deposits</MobileAttributeName>
                <MobileAttributeValue>{totalDepositsText}</MobileAttributeValue>
              </MobilePoolAttribute>
              <MobilePoolAttribute>
                <MobileAttributeName>Your Deposit</MobileAttributeName>
                <MobileAttributeValue>{yourDepositText}</MobileAttributeValue>
              </MobilePoolAttribute>
              <MobilePoolAttribute>
                <MobileAttributeName>APR</MobileAttributeName>
                <MobileAttributeValue>{totalAPRText}</MobileAttributeValue>
              </MobilePoolAttribute>
            </MobilePoolAttributes>
          </AutoColumn>
          <HRDarkLine />
        </>
      ) : (
        <>
          <HRDarkLine />
          <AutoRow gap='0%' justify={'space-between'} style={{ padding: '20px 0' }}>
            <PoolPair>
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={36} />
              <span style={{ marginLeft: '10px' }}>{PoolName}</span>
            </PoolPair>
            <TVL>{totalDepositsText}</TVL>
            <RowColumn>
              <Emission>
                <EmissionText>
                  {primaryEmissionPerSecond?.multiply(BIG_INT_SECONDS_IN_WEEK)?.toFixed(0, { groupSeparator: ',' }) ??
                    '-'}
                </EmissionText>
                <CurrencyLogoFromList
                  currency={primaryEmissionPerSecond?.currency}
                  title={primaryEmissionPerSecond?.currency.symbol}
                />
              </Emission>
              {secondaryEmissionPerSecond && secondaryEmissionPerSecond.greaterThan(0) && (
                <Emission>
                  <EmissionText>
                    {secondaryEmissionPerSecond
                      ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                      ?.toFixed(0, { groupSeparator: ',' }) ?? '-'}
                  </EmissionText>
                  <CurrencyLogoFromList
                    currency={secondaryEmissionPerSecond?.currency}
                    title={secondaryEmissionPerSecond?.currency.symbol}
                  />
                </Emission>
              )}
            </RowColumn>
            <RowColumn>{totalAPRText}</RowColumn>
            <RowColumn>{yourDepositText}</RowColumn>
            <RowColumn>
              {positionValue?.greaterThan(0) ? (
                <>
                  <EstReward justify={'flex-end'}>
                    <span role='img' aria-label='wizard-icon' style={{ marginRight: '8px ' }}>
                      ⚡
                    </span>
                    <EstRewardText>
                      {ownPrimaryWeeklyEmission?.toFixed(0, { groupSeparator: ',' }) ?? '-'}
                    </EstRewardText>
                    <CurrencyLogoFromList
                      currency={primaryEmissionPerSecond?.currency}
                      title={primaryEmissionPerSecond?.currency.symbol}
                    />
                  </EstReward>
                  <EstReward justify={'flex-end'}>
                    <span role='img' aria-label='wizard-icon' style={{ marginRight: '8px ' }}>
                      ⚡
                    </span>
                    <EstRewardText>
                      {ownSecondaryWeeklyEmission?.toFixed(0, { groupSeparator: ',' }) ?? '-'}
                    </EstRewardText>
                    <CurrencyLogoFromList
                      currency={secondaryEmissionPerSecond?.currency}
                      title={secondaryEmissionPerSecond?.currency.symbol}
                    />
                  </EstReward>
                </>
              ) : (
                '-'
              )}
            </RowColumn>
          </AutoRow>
          <HRDarkLine />
        </>
      )}
    </PoolRow>
  );
}
