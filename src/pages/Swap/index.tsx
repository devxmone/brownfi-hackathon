import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArrowDown, CheckCircle, HelpCircle } from 'react-feather';
import ReactGA from 'react-ga';
import { RouteComponentProps } from 'react-router-dom';

import styled, { ThemeContext } from 'styled-components';
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';
import JSBI from 'jsbi';
import { Text } from 'rebass';

import { LightCard } from 'components/Card';
import { CollapseSwapDetails } from 'components/swap/CollapseSwapDetails';
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter';
import { MouseoverTooltip } from 'components/Tooltip';
import { NomadWarningBanner } from 'components/WarningBanner/NomadWarningBanner';

import { V2_ROUTER_ADDRESS } from 'constants/addresses';
import { ChainId, ChainIdValue } from 'constants/chains';

import CollaseIconDown from '../../assets/images/collapse-icon-down.svg';
import CollaseIconUp from '../../assets/images/collapse-icon-up.svg';
import ConnectWallet from '../../assets/images/connect-wallet.png';
import Gas from '../../assets/images/gas-icon.svg';
import SwitchSwap from '../../assets/images/switch-swap.svg';
import AddressInputPanel from '../../components/AddressInputPanel';
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button';
import { AutoColumn } from '../../components/Column';
import CurrencyInputPanel, { ShortcutAmount } from '../../components/CurrencyInputPanel';
import CurrencyLogo from '../../components/CurrencyLogo';
import Loader from '../../components/Loader';
import Row, { AutoRow, RowFixed } from '../../components/Row';
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee';
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal';
import { ArrowWrapper, BottomGrouping, Dots, SwapCallbackError, Wrapper } from '../../components/swap/styleds';
import SwapHeader from '../../components/swap/SwapHeader';
import TradePrice from '../../components/swap/TradePrice';
import TokenWarningModal from '../../components/TokenWarningModal';
import { useAllTokens, useCurrency } from '../../hooks/Tokens';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import useENSAddress from '../../hooks/useENSAddress';
import { useERC20PermitFromTrade, UseERC20PermitState } from '../../hooks/useERC20Permit';
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported';
import { useSwapCallback } from '../../hooks/useSwapCallback';
import { useUSDCValue } from '../../hooks/useUSDCPrice';
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback';
import { useActiveWeb3React } from '../../hooks/web3';
import { useWalletModalToggle } from '../../state/application/hooks';
import { Field } from '../../state/swap/actions';
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks';
import { useExpertModeManager, useUserSingleHopOnly } from '../../state/user/hooks';
import { LinkStyledButton, TYPE } from '../../theme';
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact';
import { getTradeVersion } from '../../utils/getTradeVersion';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import { computeRealizedLPFeePercent, warningSeverity } from '../../utils/prices';
import AppBody from '../AppBody';

const Details = styled.div`
  transition: 0.3s ease-out;
  &.true {
    height: auto;
    padding: 10px 20px;
    background: ${({ theme }) => theme.primary1};
  }
  &.false {
    height: 0;
    overflow: hidden;
  }
`;

const Fee = styled.div`
  display: flex;
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
`;

export default function Swap({ history }: RouteComponentProps) {
  const loadedUrlParams = useDefaultsFromURLSearch();

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ];

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false);
  const [openDetailSwap, setOpenDetailSwap] = useState<boolean>(false);

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  );

  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens();
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens?.filter((token: Token) => {
      return !(token.address in defaultTokens);
    });

  const { account, chainId } = useActiveWeb3React();
  const theme = useContext(ThemeContext);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  // for expert mode
  const [isExpertMode] = useExpertModeManager();

  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const {
    toggledTrade: trade,
    allowedSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo();

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const { address: recipientAddress } = useENSAddress(recipient);

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
          },
    [independentField, parsedAmount, showWrap, trade],
  );

  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT]);
  const fiatValueOutput = useUSDCValue(parsedAmounts[Field.OUTPUT]);
  const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput);

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers();
  const isValid = !swapInputError;
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput],
  );

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
    history.push('/swap/');
  }, [history]);

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean;
    tradeToConfirm: V2Trade<Currency, Currency, TradeType> | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  });

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  );
  const routeNotFound = !trade?.route;
  const isLoadingRoute = false;

  // check whether the user has approved the router on the input token
  // const [approvalState, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)
  const [approvalState, approveCallback] = useApproveCallback(
    parsedAmounts[Field.INPUT],
    V2_ROUTER_ADDRESS[(chainId ?? ChainId.MAINNET) as ChainIdValue],
  );
  const { state: signatureState, gatherPermitSignature } = useERC20PermitFromTrade(trade, allowedSlippage);

  const handleApprove = useCallback(async () => {
    if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
      try {
        await gatherPermitSignature();
      } catch (error: any) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (error?.code !== 4001) {
          await approveCallback();
        }
      }
    } else {
      await approveCallback();
    }
  }, [approveCallback, gatherPermitSignature, signatureState]);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approvalState, approvalSubmitted]);

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);
  const halfInputAmount: CurrencyAmount<Currency> | undefined = maxInputAmount?.divide(2);
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0)); //  && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount)

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient);

  const [singleHopOnly] = useUserSingleHopOnly();

  const handleSwap = useCallback(() => {
    if (!swapCallback) {
      return;
    }
    if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
      return;
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined });
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash });

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade),
            singleHopOnly ? 'SH' : 'MH',
          ].join('/'),
        });
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        });
      });
  }, [
    priceImpact,
    swapCallback,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade,
    singleHopOnly,
  ]);

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false);

  // warnings on the greater of fiat value price impact and execution price impact
  const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = trade?.priceImpact;
    return warningSeverity(
      executionPriceImpact && priceImpact
        ? executionPriceImpact.greaterThan(priceImpact)
          ? executionPriceImpact
          : priceImpact
        : executionPriceImpact ?? priceImpact,
    );
  }, [priceImpact, trade]);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '');
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency);
    },
    [onCurrencySelection],
  );

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact());
  }, [maxInputAmount, onUserInput]);

  const handleHalfInput = useCallback(
    (value: ShortcutAmount) => {
      halfInputAmount && value === 'half' && onUserInput(Field.INPUT, halfInputAmount.toExact());
    },
    [halfInputAmount, onUserInput],
  );

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection],
  );

  const swapIsUnsupported = useIsSwapUnsupported(currencies?.INPUT, currencies?.OUTPUT);

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode;

  const { realizedLPFee } = useMemo(() => {
    if (!trade) return { realizedLPFee: undefined, priceImpact: undefined };

    const realizedLpFeePercent = computeRealizedLPFeePercent(trade);
    const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent);
    return { realizedLPFee };
  }, [trade]);

  return (
    <>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />

      <AppBody>
        {false && <NomadWarningBanner />}
        <SwapHeader allowedSlippage={allowedSlippage} />
        <Wrapper id='swap-page'>
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap={'md'}>
            <div style={{ display: 'relative' }}>
              <CurrencyInputPanel
                label={independentField === Field.OUTPUT && !showWrap ? 'From (at most)' : 'From'}
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={showMaxButton}
                showShortcutButtons={true}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                onShortcutAmount={handleHalfInput}
                fiatValue={fiatValueInput ?? undefined}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                showCommonBases={true}
                id='swap-currency-input'
              />

              <ArrowWrapper clickable>
                <img
                  src={SwitchSwap}
                  onClick={() => {
                    setApprovalSubmitted(false); // reset 2 step UI for approvals
                    onSwitchTokens();
                  }}
                />
              </ArrowWrapper>
              <CurrencyInputPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                label={independentField === Field.INPUT && !showWrap ? 'To (at least)' : 'To'}
                showMaxButton={false}
                hideBalance={false}
                fiatValue={fiatValueOutput ?? undefined}
                priceImpact={priceImpact}
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                showCommonBases={true}
                id='swap-currency-output'
              />
            </div>

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify='space-between' style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size='16' color={theme.primary1} />
                  </ArrowWrapper>
                  <LinkStyledButton id='remove-recipient-button' onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id='recipient' value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}
            <div>
              {trade ? (
                <Row
                  style={{
                    justifyContent: !trade ? 'center' : 'space-between',
                    height: '48px',
                    backgroundColor: theme.primary1,
                    color: theme.text1,
                    padding: '0px 20px',
                  }}
                >
                  <>
                    <RowFixed>
                      <TradePrice
                        price={trade.executionPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    </RowFixed>
                    <Fee>
                      <img src={Gas} /> &nbsp;{' '}
                      {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${realizedLPFee.currency.symbol}` : '-'}
                      &nbsp;&nbsp;
                      <img
                        style={{ cursor: 'pointer' }}
                        src={!openDetailSwap ? CollaseIconDown : CollaseIconUp}
                        onClick={() => {
                          setOpenDetailSwap(!openDetailSwap);
                        }}
                      />
                    </Fee>
                  </>
                </Row>
              ) : null}
              <Details className={openDetailSwap.toString()}>
                <CollapseSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
              </Details>
            </div>
            <BottomGrouping>
              {swapIsUnsupported ? (
                <ButtonPrimary disabled={true}>
                  <TYPE.main mb='4px'>Unsupported Asset</TYPE.main>
                </ButtonPrimary>
              ) : !account ? (
                <ButtonLight onClick={toggleWalletModal}>
                  <img src={ConnectWallet} /> &nbsp; Connect Wallet
                </ButtonLight>
              ) : showWrap ? (
                <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                  {wrapInputError ??
                    (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                </ButtonPrimary>
              ) : routeNotFound && userHasSpecifiedInputOutput ? (
                <LightCard style={{ textAlign: 'center' }}>
                  <TYPE.main mb='4px' color={theme.text1}>
                    {isLoadingRoute ? (
                      <Dots>Loading</Dots>
                    ) : (
                      `Insufficient liquidity for this trade.${singleHopOnly ? ' Try enabling multi-hop trades.' : ''}`
                    )}
                  </TYPE.main>
                </LightCard>
              ) : showApproveFlow ? (
                <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
                  <AutoColumn style={{ width: '100%' }} gap='12px'>
                    <ButtonConfirmed
                      onClick={handleApprove}
                      disabled={
                        approvalState !== ApprovalState.NOT_APPROVED ||
                        approvalSubmitted ||
                        signatureState === UseERC20PermitState.SIGNED
                      }
                      width='100%'
                      altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
                      confirmed={
                        approvalState === ApprovalState.APPROVED || signatureState === UseERC20PermitState.SIGNED
                      }
                    >
                      <AutoRow justify='space-between' style={{ flexWrap: 'nowrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', color: theme.text1 }}>
                          <CurrencyLogo
                            currency={currencies[Field.INPUT]}
                            size={'20px'}
                            style={{ marginRight: '8px', flexShrink: 0 }}
                          />
                          {/* we need to shorten this string on mobile */}
                          {approvalState === ApprovalState.APPROVED || signatureState === UseERC20PermitState.SIGNED
                            ? 'You can now trade ' + currencies[Field.INPUT]?.symbol
                            : 'Allow the BrownFi Protocol to use your ' + currencies[Field.INPUT]?.symbol}
                        </span>
                        {approvalState === ApprovalState.PENDING ? (
                          <Loader stroke='white' />
                        ) : (approvalSubmitted && approvalState === ApprovalState.APPROVED) ||
                          signatureState === UseERC20PermitState.SIGNED ? (
                          <CheckCircle size='20' color={theme.green1} />
                        ) : (
                          <MouseoverTooltip
                            text={
                              'You must give the BrownFi smart contracts permission to use your ' +
                              currencies[Field.INPUT]?.symbol +
                              '. You only have to do this once per token.'
                            }
                          >
                            <HelpCircle size='20' color={'white'} style={{ marginLeft: '8px' }} />
                          </MouseoverTooltip>
                        )}
                      </AutoRow>
                    </ButtonConfirmed>
                    <ButtonError
                      onClick={() => {
                        if (isExpertMode) {
                          handleSwap();
                        } else {
                          setSwapState({
                            tradeToConfirm: trade,
                            attemptingTxn: false,
                            swapErrorMessage: undefined,
                            showConfirm: true,
                            txHash: undefined,
                          });
                        }
                      }}
                      width='100%'
                      id='swap-button'
                      disabled={
                        !isValid ||
                        (approvalState !== ApprovalState.APPROVED && signatureState !== UseERC20PermitState.SIGNED) ||
                        priceImpactTooHigh
                      }
                      error={isValid && priceImpactSeverity > 2}
                    >
                      <Text fontSize={16} fontWeight={700}>
                        {priceImpactTooHigh ? `High Price Impact` : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                      </Text>
                    </ButtonError>
                  </AutoColumn>
                </AutoRow>
              ) : (
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap();
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined,
                      });
                    }
                  }}
                  id='swap-button'
                  disabled={!isValid || priceImpactTooHigh || !!swapCallbackError}
                  error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                >
                  <Text fontSize={16} fontWeight={700}>
                    {swapInputError
                      ? swapInputError
                      : priceImpactTooHigh
                      ? `Price Impact Too High`
                      : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                  </Text>
                </ButtonError>
              )}
              {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            </BottomGrouping>
          </AutoColumn>
        </Wrapper>
      </AppBody>

      {!swapIsUnsupported ? null : (
        <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
      )}
    </>
  );
}
