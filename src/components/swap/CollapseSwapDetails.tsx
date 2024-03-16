import { useMemo } from 'react';

import styled from 'styled-components';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';

import { computeRealizedLPFeePercent } from '../../utils/prices';

import FormattedPriceImpact from './FormattedPriceImpact';
import SwapRoute from './SwapRoute';

export interface AdvancedSwapDetailsProps {
  trade?: V2Trade<Currency, Currency, TradeType>;
  allowedSlippage: Percent;
}
const DetailWrapper = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.text1};
  border-top: 1px solid rgba(50, 49, 53, 1);
`;
const RowDetail = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  font-size : 14px;
  font-weight 500
`;

export function CollapseSwapDetails({ trade, allowedSlippage }: AdvancedSwapDetailsProps) {
  const { realizedLPFee, priceImpact } = useMemo(() => {
    if (!trade) return { realizedLPFee: undefined, priceImpact: undefined };

    const realizedLpFeePercent = computeRealizedLPFeePercent(trade);
    const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent);
    const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent);
    return { priceImpact, realizedLPFee };
  }, [trade]);

  return !trade ? null : (
    <DetailWrapper>
      <RowDetail>
        <div>Price impact</div>
        <FormattedPriceImpact priceImpact={priceImpact} />
      </RowDetail>
      <RowDetail>
        <div>Max. slippage</div>
        <div>{allowedSlippage.toFixed(2)}%</div>
      </RowDetail>
      <RowDetail>
        <div>Network cost</div>
        <div>{realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${realizedLPFee.currency.symbol}` : '-'}</div>
      </RowDetail>
      <RowDetail>
        <div>Route</div>
        <SwapRoute trade={trade} />
      </RowDetail>
    </DetailWrapper>
  );
}
