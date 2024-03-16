import { useContext, useMemo, useState } from 'react';

import styled, { ThemeContext } from 'styled-components';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';

import { TYPE } from 'theme';

import CollaseIconDown from '../../assets/images/collapse-swap-down.svg';
import CollaseIconUp from '../../assets/images/collapse-swap-up.svg';
import { computeRealizedLPFeePercent } from '../../utils/prices';
import { AutoColumn } from '../Column';
import { RowBetween, RowFixed } from '../Row';

import FormattedPriceImpact from './FormattedPriceImpact';
import TradePrice from './TradePrice';
const DividerWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Divider = styled.div`
  width: 30%;
  border-top: 1px solid rgba(50, 49, 53, 1);
`;

const Details = styled.div`
  transition: 0.3s ease-out;
  &.true {
    height: auto;
  }
  &.false {
    height: 0;
    overflow: hidden;
  }
`;
export interface AdvancedSwapDetailsProps {
  trade?: V2Trade<Currency, Currency, TradeType>;
  allowedSlippage: Percent;
}

export function AdvancedSwapDetails({ trade, allowedSlippage }: AdvancedSwapDetailsProps) {
  const theme = useContext(ThemeContext);
  const [showInverted, setShowInverted] = useState<boolean>(false);
  const [openDetailSwap, setOpenDetailSwap] = useState<boolean>(false);

  const { realizedLPFee, priceImpact } = useMemo(() => {
    if (!trade) return { realizedLPFee: undefined, priceImpact: undefined };
    const realizedLpFeePercent = computeRealizedLPFeePercent(trade);
    const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent);
    const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent);
    return { priceImpact, realizedLPFee };
  }, [trade]);

  return !trade ? null : (
    <AutoColumn gap='8px' style={{ fontSize: '14px' }}>
      <DividerWrapper>
        <Divider />
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setOpenDetailSwap(!openDetailSwap)}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: theme.text2 }}>Show more</div>
          &nbsp;
          <img src={!openDetailSwap ? CollaseIconDown : CollaseIconUp} />
        </div>
        <Divider />
      </DividerWrapper>
      <RowBetween style={{ marginTop: '0.25rem' }}>
        <TYPE.body color={theme.text1} fontWeight={500} fontSize={14}>
          {'Rate'}
        </TYPE.body>
        <TradePrice price={trade.executionPrice} showInverted={false} setShowInverted={setShowInverted} />
      </RowBetween>
      <RowBetween>
        <RowFixed>Fee</RowFixed>
        {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${realizedLPFee.currency.symbol}` : '-'}
      </RowBetween>

      <RowBetween>
        <RowFixed>Network cost</RowFixed>
        {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${realizedLPFee.currency.symbol}` : '-'}
      </RowBetween>

      <Details className={openDetailSwap.toString()}>
        {/* <RowBetween>
          <RowFixed>Route</RowFixed>
          <SwapRoute trade={trade} />
        </RowBetween> */}
        <AutoColumn gap='8px' style={{ fontSize: '14px' }}>
          <RowBetween>
            <RowFixed>Price Impact</RowFixed>
            <FormattedPriceImpact priceImpact={priceImpact} />
          </RowBetween>
          <RowBetween>
            <RowFixed>{trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sent'}</RowFixed>
            {trade.tradeType === TradeType.EXACT_INPUT
              ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
              : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`}
          </RowBetween>
          <RowBetween>
            <RowFixed>Max. slippage</RowFixed>
            {allowedSlippage.toFixed(2)}%
          </RowBetween>
        </AutoColumn>
      </Details>
    </AutoColumn>
  );
}
