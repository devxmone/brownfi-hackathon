import { useContext } from 'react';
import { AlertTriangle } from 'react-feather';

import styled, { ThemeContext } from 'styled-components';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';
import { Card, Text } from 'rebass';

import { useUSDCValue } from '../../hooks/useUSDCPrice';
import { TYPE } from '../../theme';
import { isAddress, shortenAddress } from '../../utils';
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact';
import { ButtonPrimary } from '../Button';
import { LightGreyCard } from '../Card';
import { AutoColumn } from '../Column';
import { FiatValue } from '../CurrencyInputPanel/FiatValue';
import CurrencyLogo from '../CurrencyLogo';
import { RowBetween, RowFixed } from '../Row';

import { AdvancedSwapDetails } from './AdvancedSwapDetails';
import { SwapShowAcceptChanges, TruncatedText } from './styleds';

export const ArrowWrapper = styled.div`
  padding: 4px;
  border-radius: 6px;
  height: 32px;
  width: 32px;
  position: relative;
  margin-top: -18px;
  margin-bottom: -18px;
  left: calc(50% - 16px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.primary1};
  border: 4px solid ${({ theme }) => theme.bg0};
  z-index: 2;
`;

const SwapCard = styled(Card)`
  color: ${({ theme }) => theme.text1};
`;

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: V2Trade<Currency, Currency, TradeType>;
  allowedSlippage: Percent;
  recipient: string | null;
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
}) {
  const theme = useContext(ThemeContext);

  const fiatValueInput = useUSDCValue(trade.inputAmount);
  const fiatValueOutput = useUSDCValue(trade.outputAmount);

  return (
    <AutoColumn gap={'4px'} style={{ marginTop: '1rem' }}>
      <LightGreyCard padding='0.75rem 1rem' style={{ marginBottom: '0.25rem' }}>
        <AutoColumn gap={'8px'}>
          <RowBetween>
            <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
              You Receive
            </TYPE.body>
          </RowBetween>
          <RowBetween align='center'>
            <RowFixed gap={'0px'}>
              <TruncatedText fontSize={32} fontWeight={600} color={theme.text1}>
                {trade.outputAmount.toSignificant(6)}
              </TruncatedText>
              &nbsp;
              <Text fontSize={32} fontWeight={600} color={theme.text1}>
                {trade.outputAmount.currency.symbol}
              </Text>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.outputAmount.currency} size={'30px'} />
            </RowFixed>
          </RowBetween>
          <TYPE.body fontSize={14} color={theme.bg0}>
            <FiatValue
              fiatValue={fiatValueOutput}
              priceImpact={computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)}
            />
          </TYPE.body>
        </AutoColumn>
      </LightGreyCard>

      <LightGreyCard padding='0.75rem 1rem'>
        <AutoColumn gap={'8px'}>
          <RowBetween>
            <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
              You Pay
            </TYPE.body>
          </RowBetween>
          <RowBetween align='center'>
            <RowFixed gap={'0px'}>
              <TruncatedText fontSize={32} fontWeight={600} color={theme.text1}>
                {trade.inputAmount.toSignificant(6)}
              </TruncatedText>
              &nbsp;
              <Text fontSize={20} fontWeight={600} color={theme.text1}>
                {trade.inputAmount.currency.symbol}
              </Text>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.inputAmount.currency} size={'30px'} />
            </RowFixed>
          </RowBetween>
          <FiatValue fiatValue={fiatValueInput} />
        </AutoColumn>
      </LightGreyCard>

      <SwapCard style={{ padding: '.75rem', marginTop: '0.5rem' }}>
        <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      </SwapCard>

      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify='flex-start' gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <TYPE.main color={theme.primary1}> Price Updated</TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}

      {/* <AutoColumn justify='flex-start' gap='sm' style={{ padding: '.75rem 1rem' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <TYPE.italic fontWeight={400} textAlign='left' style={{ width: '100%' }}>
            {`Output is estimated. You will receive at least `}
            <b>
              {trade.minimumAmountOut(allowedSlippage).toSignificant(6)} {trade.outputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.italic>
        ) : (
          <TYPE.italic fontWeight={400} textAlign='left' style={{ width: '100%' }}>
            {`Input is estimated. You will sell at most `}
            <b>
              {trade.maximumAmountIn(allowedSlippage).toSignificant(6)} {trade.inputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.italic>
        )}
      </AutoColumn> */}
      {recipient !== null ? (
        <AutoColumn justify='flex-start' gap='sm' style={{ padding: '12px 0 0 0px' }}>
          <TYPE.main>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </TYPE.main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  );
}
