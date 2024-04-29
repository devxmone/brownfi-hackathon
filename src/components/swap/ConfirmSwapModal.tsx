import { useCallback, useMemo } from 'react';

import { Currency, currencyEquals, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';

import ArrowIcon from '../../assets/images/arrow-icon.svg';
import ETH from '../../assets/images/ethereum-logo.png';
import {
  ConfirmationModalContent,
  TransactionConfirmationSwapModal,
  TransactionErrorSwapContent,
} from '../TransactionConfirmationModal';

import SwapModalFooter from './SwapModalFooter';
import SwapModalHeader from './SwapModalHeader';

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param args either a pair of V2 trades or a pair of V3 trades
 */
function tradeMeaningfullyDiffers(
  ...args: [V2Trade<Currency, Currency, TradeType>, V2Trade<Currency, Currency, TradeType>]
): boolean {
  const [tradeA, tradeB] = args;
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  );
}

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
}: {
  isOpen: boolean;
  trade: any;
  originalTrade: V2Trade<Currency, Currency, TradeType> | undefined;
  attemptingTxn: boolean;
  txHash: string | undefined;
  recipient: string | null;
  allowedSlippage: Percent;
  onAcceptChanges: () => void;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  onDismiss: () => void;
}) {
  const showAcceptChanges = useMemo(
    () =>
      Boolean(
        trade instanceof V2Trade && originalTrade instanceof V2Trade && tradeMeaningfullyDiffers(trade, originalTrade),
      ),
    [originalTrade, trade],
  );

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null;
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade]);

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
      />
    ) : null;
  }, [onConfirm, showAcceptChanges, swapErrorMessage, trade]);

  console.log(trade?.inputAmount?.currency?.tokenInfo);
  // text to show while loading
  const pendingText = (
    <div style={{ display: 'flex', gap: '10px' }}>
      <img
        style={{ width: '20px', height: '20px' }}
        src={trade?.inputAmount?.currency?.tokenInfo?.logoURI ?? ETH}
      ></img>
      {trade?.inputAmount?.toSignificant(6)} {trade?.inputAmount?.currency?.symbol}
      <img style={{ width: '20px', height: '20px' }} src={ArrowIcon}></img>
      <img
        style={{ width: '20px', height: '20px' }}
        src={trade?.outputAmount?.currency?.tokenInfo?.logoURI ?? ETH}
      ></img>
      {trade?.outputAmount?.toSignificant(6)} {trade?.outputAmount?.currency?.symbol}
    </div>
  );

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorSwapContent onDismiss={onDismiss} message={swapErrorMessage} pendingText={pendingText} />
      ) : (
        <ConfirmationModalContent
          title='Review Swap'
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage],
  );

  return (
    <TransactionConfirmationSwapModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      currencyToAdd={trade?.outputAmount.currency}
    />
  );
}
