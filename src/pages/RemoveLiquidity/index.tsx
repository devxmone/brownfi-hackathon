import { useCallback, useContext, useMemo, useState } from 'react';
import { ArrowDown, Plus } from 'react-feather';
import ReactGA from 'react-ga';
import { RouteComponentProps } from 'react-router';

import { ThemeContext } from 'styled-components';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { TransactionResponse } from '@ethersproject/providers';
import { Currency, currencyEquals, Percent } from '@uniswap/sdk-core';
import { Text } from 'rebass';

import { Dots } from 'components/swap/styleds';

import { ChainIdValue } from 'constants/chains';
import { WETH } from 'constants/tokens';

import ELLIPSE from '../../assets/images/ellipse.svg';
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button';
import { LightCard } from '../../components/Card';
import { AutoColumn, ColumnCenter } from '../../components/Column';
import CurrencyInputPanel from '../../components/CurrencyInputPanel';
import CurrencyLogo from '../../components/CurrencyLogo';
import DoubleCurrencyLogo from '../../components/DoubleLogo';
import { AddRemoveTabs } from '../../components/NavigationTabs';
import Row, { RowBetween, RowFixed } from '../../components/Row';
import Slider from '../../components/Slider';
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal';
import { useCurrency } from '../../hooks/Tokens';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { usePairContract, useV2RouterContract } from '../../hooks/useContract';
import useDebouncedChangeHandler from '../../hooks/useDebouncedChangeHandler';
import useTransactionDeadline from '../../hooks/useTransactionDeadline';
import { useActiveWeb3React } from '../../hooks/web3';
import { useWalletModalToggle } from '../../state/application/hooks';
import { Field } from '../../state/burn/actions';
import { useBurnActionHandlers } from '../../state/burn/hooks';
import { useBurnState, useDerivedBurnInfo } from '../../state/burn/hooks';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { useUserSlippageToleranceWithDefault } from '../../state/user/hooks';
import { TYPE } from '../../theme';
import { calculateGasMargin } from '../../utils/calculateGasMargin';
import { calculateSlippageAmount } from '../../utils/calculateSlippageAmount';
import { currencyId } from '../../utils/currencyId';
import { unwrappedToken, wrappedCurrency } from '../../utils/wrappedCurrency';
import AppBody from '../AppBody';
import { ClickableText, MaxButton, Wrapper } from '../Pool/styleds';

const DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE = new Percent(5, 100);

export default function RemoveLiquidity({
  history,
  match: {
    params: { currencyIdA, currencyIdB },
  },
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined];

  console.log('🚀 ~ currencyA:', currencyA);
  const { account, chainId, library } = useActiveWeb3React();
  const [tokenA, tokenB] = useMemo(
    () => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)],
    [currencyA, currencyB, chainId],
  );

  const theme = useContext(ThemeContext);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  // burn state
  const { independentField, typedValue } = useBurnState();
  const { pair, parsedAmounts, error }: any = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined);
  const { onUserInput: _onUserInput } = useBurnActionHandlers();
  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showDetailed, setShowDetailed] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false); // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('');
  const deadline = useTransactionDeadline();
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE);

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
  };

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'));

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address);

  const router = useV2RouterContract();
  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], router?.address);

  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library || !deadline) throw new Error('missing dependencies');
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error('missing liquidity amount');
    await approveCallback();
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      return _onUserInput(field, typedValue);
    },
    [_onUserInput],
  );

  const onLiquidityInput = useCallback(
    (typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue),
    [onUserInput],
  );
  const onCurrencyAInput = useCallback(
    (typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue),
    [onUserInput],
  );
  const onCurrencyBInput = useCallback(
    (typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue),
    [onUserInput],
  );

  // tx sending
  const addTransaction = useTransactionAdder();

  async function onRemove() {
    if (!chainId || !library || !account || !deadline || !router) throw new Error('missing dependencies');
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts;
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts');
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    };

    if (!currencyA || !currencyB) throw new Error('missing tokens');
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error('missing liquidity amount');

    const currencyBIsETH = currencyB.isNative;
    const oneCurrencyIsETH = currencyA.isNative || currencyBIsETH;

    if (!tokenA || !tokenB) throw new Error('could not wrap');

    let methodNames: string[], args: Array<string | string[] | number | boolean>;
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens'];
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadline.toHexString(),
        ];
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity'];
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadline.toHexString(),
        ];
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.');
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName) =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((error) => {
            console.error(`estimateGas failed`, methodName, args, error);
            // return BigNumber.from('1000000')
            return undefined;
          }),
      ),
    );

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex((safeGasEstimate) =>
      BigNumber.isBigNumber(safeGasEstimate),
    );

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.');
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation];
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];

      setAttemptingTxn(true);
      await router[methodName](...args, {
        gasLimit: safeGasEstimate,
      })
        .then((response: TransactionResponse) => {
          setAttemptingTxn(false);

          addTransaction(response, {
            summary:
              'Remove ' +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              ' ' +
              currencyA?.symbol +
              ' and ' +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              ' ' +
              currencyB?.symbol,
          });

          setTxHash(response.hash);

          ReactGA.event({
            category: 'Liquidity',
            action: 'Remove',
            label: [currencyA?.symbol, currencyB?.symbol].join('/'),
          });
        })
        .catch((error: Error) => {
          setAttemptingTxn(false);
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(error);
        });
    }
  }

  function modalHeader() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <RowBetween align='flex-end'>
          <Text fontSize={24} fontWeight={500}>
            {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
          </Text>
          <RowFixed gap='4px'>
            <CurrencyLogo currency={currencyA} size={'24px'} />
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
              {currencyA?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowFixed>
          <Plus size='16' color={theme.text1} />
        </RowFixed>
        <RowBetween align='flex-end'>
          <Text fontSize={24} fontWeight={500}>
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
          </Text>
          <RowFixed gap='4px'>
            <CurrencyLogo currency={currencyB} size={'24px'} />
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
              {currencyB?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>

        <TYPE.italic fontSize={12} color={theme.text1} textAlign='left' padding={'12px 0 0 0'}>
          {`Output is estimated. If the price changes by more than ${allowedSlippage.toSignificant(
            4,
          )}% your transaction will revert.`}
        </TYPE.italic>
      </AutoColumn>
    );
  }

  function modalBottom() {
    return (
      <>
        <RowBetween>
          <Text color={theme.text1} fontWeight={500} fontSize={16}>
            {'BROWN ' + currencyA?.symbol + '/' + currencyB?.symbol} Burned
          </Text>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyB} currency1={currencyA} margin={true} />
            <Text fontWeight={500} fontSize={16}>
              {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}
            </Text>
          </RowFixed>
        </RowBetween>
        {pair && (
          <>
            <RowBetween>
              <Text color={theme.text1} fontWeight={500} fontSize={16}>
                Price
              </Text>
              <Text fontWeight={500} fontSize={16} color={theme.text1}>
                1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
              </Text>
            </RowBetween>
            <RowBetween>
              <div />
              <Text fontWeight={500} fontSize={16} color={theme.text1}>
                1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
              </Text>
            </RowBetween>
          </>
        )}
        <ButtonPrimary disabled={!(approval === ApprovalState.APPROVED)} onClick={onRemove}>
          <Text fontWeight={500} fontSize={20}>
            Confirm
          </Text>
        </ButtonPrimary>
      </>
    );
  }

  const pendingText = `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencyA?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencyB?.symbol}`;

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString());
    },
    [onUserInput],
  );

  const oneCurrencyIsETH = currencyA?.isNative || currencyB?.isNative;
  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(WETH[chainId as ChainIdValue], currencyA)) ||
        (currencyB && currencyEquals(WETH[chainId as ChainIdValue], currencyB))),
  );

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        history.push(`/remove/v2/${currencyId(currency)}/${currencyIdA}`);
      } else {
        history.push(`/remove/v2/${currencyId(currency)}/${currencyIdB}`);
      }
    },
    [currencyIdA, currencyIdB, history],
  );
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        history.push(`/remove/v2/${currencyIdB}/${currencyId(currency)}`);
      } else {
        history.push(`/remove/v2/${currencyIdA}/${currencyId(currency)}`);
      }
    },
    [currencyIdA, currencyIdB, history],
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0');
    }
    setTxHash('');
  }, [onUserInput, txHash]);

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback,
  );
  const currency0 = oneCurrencyIsWETH ? pair?.token0 : unwrappedToken(pair?.token0);
  const currency1 = oneCurrencyIsWETH ? pair?.token1 : unwrappedToken(pair?.token1);

  return (
    <>
      <AppBody>
        <AddRemoveTabs creating={false} adding={false} defaultSlippage={DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE} />
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash ? txHash : ''}
            content={() => (
              <ConfirmationModalContent
                title={'Review'}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <TYPE.body
            className='flex gap-2 justify-between'
            color={theme.white}
            fontSize={16}
            fontWeight={700}
            style={{ marginBottom: '10px' }}
          >
            <RowFixed>
              <DoubleCurrencyLogo currency0={currency1} currency1={currency0} margin={true} size={20} />
              <Text fontWeight={500} fontSize={16}>
                {currency0?.symbol}/{currency1?.symbol}
              </Text>
            </RowFixed>
            <div className='h-6 flex justify-center items-center bg-[#314243] px-2'>
              <TYPE.body className='flex gap-1' color={'#27e39f'} fontSize={14} fontWeight={500}>
                <img src={ELLIPSE} alt='' />
                Active
              </TYPE.body>
            </div>
          </TYPE.body>
          <AutoColumn gap='md'>
            <LightCard backgroundColor={'rgba(50, 48, 56, 1) !important'}>
              <AutoColumn gap='20px'>
                <RowBetween>
                  <Text fontWeight={500} color={theme.white} fontSize={'16px'}>
                    Amount
                  </Text>
                  <ClickableText
                    fontWeight={500}
                    color={theme.white}
                    backgroundColor={'rgba(30, 30, 30, 1)'}
                    padding={'3px 10px'}
                    fontSize={12}
                  >
                    Increase liquidity
                  </ClickableText>
                </RowBetween>
                <Row style={{ alignItems: 'center', gap: '20px' }}>
                  <Text fontSize={32} fontWeight={500} width={'83px'} color={theme.text1}>
                    {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                  </Text>
                  <RowBetween>
                    <MaxButton
                      className='max-h-8'
                      onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')}
                      width='57px'
                    >
                      25%
                    </MaxButton>
                    <MaxButton
                      className='max-h-8'
                      onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')}
                      width='57px'
                    >
                      50%
                    </MaxButton>
                    <MaxButton
                      className='max-h-8'
                      onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')}
                      width='57px'
                    >
                      75%
                    </MaxButton>
                    <MaxButton
                      className='max-h-8'
                      onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                      width='57px'
                    >
                      Max
                    </MaxButton>
                  </RowBetween>
                </Row>
                <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
              </AutoColumn>
            </LightCard>
            <LightCard backgroundColor={'rgba(50, 48, 56, 1) !important'}>
              <AutoColumn gap='10px'>
                <RowBetween color={theme.text1}>
                  <Text fontSize={14} fontWeight={500}>
                    {`Pooled ${currencyA?.symbol}:`}
                  </Text>
                  <RowFixed className='flex gap-3 items-center'>
                    <Text fontSize={14} fontWeight={500} id='remove-liquidity-tokena-symbol'>
                      {formattedAmounts[Field.CURRENCY_A] || '-'}
                    </Text>
                    <CurrencyLogo size='20px' currency={currencyA} style={{ marginRight: '12px' }} />
                  </RowFixed>
                </RowBetween>
                <RowBetween color={theme.text1}>
                  <Text fontSize={14} fontWeight={500}>
                    {`Pooled ${currencyB?.symbol}:`}
                  </Text>
                  <RowFixed className='flex gap-3 items-center'>
                    <Text fontSize={14} fontWeight={500} id='remove-liquidity-tokena-symbol'>
                      {formattedAmounts[Field.CURRENCY_B] || '-'}
                    </Text>
                    <CurrencyLogo size='20px' currency={currencyB} style={{ marginRight: '12px' }} />
                  </RowFixed>
                </RowBetween>
                <div className='w-full h-[1px] bg-[#4c4a4f]'></div>
                <RowBetween color={theme.text1}>
                  <Text fontSize={14} fontWeight={500}>
                    {`${currencyA?.symbol} Fees Earned:`}
                  </Text>
                  <RowFixed className='flex gap-3 items-center'>
                    <Text fontSize={14} fontWeight={500} id='remove-liquidity-tokena-symbol'>
                      --
                    </Text>
                    <CurrencyLogo size='20px' currency={currencyA} style={{ marginRight: '12px' }} />
                  </RowFixed>
                </RowBetween>
                <RowBetween color={theme.text1}>
                  <Text fontSize={14} fontWeight={500}>
                    {`${currencyB?.symbol} Fees Earned:`}
                  </Text>
                  <RowFixed className='flex gap-3 items-center'>
                    <Text fontSize={14} fontWeight={500} id='remove-liquidity-tokena-symbol'>
                      --
                    </Text>
                    <CurrencyLogo size='20px' currency={currencyB} style={{ marginRight: '12px' }} />
                  </RowFixed>
                </RowBetween>
                {/* <RowBetween>
                  <Text fontSize={24} fontWeight={500}>
                    {formattedAmounts[Field.CURRENCY_B] || '-'}
                  </Text>
                  <RowFixed>
                    <CurrencyLogo currency={currencyB} style={{ marginRight: '12px' }} />
                    <Text fontSize={24} fontWeight={500} id='remove-liquidity-tokenb-symbol'>
                      {currencyB?.symbol}
                    </Text>
                  </RowFixed>
                </RowBetween> */}
                {/* {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                  <RowBetween style={{ justifyContent: 'flex-end' }}>
                    {oneCurrencyIsETH ? (
                      <StyledInternalLink
                        to={`/remove/v2/${currencyA?.isNative ? WETH[chainId as ChainIdValue].address : currencyIdA}/${
                          currencyB?.isNative ? WETH[chainId as ChainIdValue].address : currencyIdB
                        }`}
                      >
                        Receive WBNB
                      </StyledInternalLink>
                    ) : oneCurrencyIsWETH ? (
                      <StyledInternalLink
                        to={`/remove/v2/${
                          currencyA && currencyEquals(currencyA, WETH[chainId as ChainIdValue]) ? 'BNB' : currencyIdA
                        }/${
                          currencyB && currencyEquals(currencyB, WETH[chainId as ChainIdValue]) ? 'BNB' : currencyIdB
                        }`}
                      >
                        Receive BNB
                      </StyledInternalLink>
                    ) : null}
                  </RowBetween>
                ) : null} */}
              </AutoColumn>
            </LightCard>

            {showDetailed && (
              <>
                <CurrencyInputPanel
                  value={formattedAmounts[Field.LIQUIDITY]}
                  onUserInput={onLiquidityInput}
                  onMax={() => {
                    onUserInput(Field.LIQUIDITY_PERCENT, '100');
                  }}
                  showMaxButton={!atMaxAmount}
                  currency={pair?.liquidityToken}
                  pair={pair}
                  id='liquidity-amount'
                />
                <ColumnCenter>
                  <ArrowDown size='16' color={theme.primary1} />
                </ColumnCenter>
                <CurrencyInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onCurrencyAInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyA}
                  label={'Output'}
                  onCurrencySelect={handleSelectCurrencyA}
                  id='remove-liquidity-tokena'
                />
                <ColumnCenter>
                  <Plus size='16' color={theme.primary1} />
                </ColumnCenter>
                <CurrencyInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onCurrencyBInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyB}
                  label={'Output'}
                  onCurrencySelect={handleSelectCurrencyB}
                  id='remove-liquidity-tokenb'
                />
              </>
            )}
            {/* {pair && (
              <div style={{ padding: '10px 20px' }}>
                <RowBetween>
                  Price:
                  <div>
                    1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
                  </div>
                </RowBetween>
                <RowBetween>
                  <div />
                  <div>
                    1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
                  </div>
                </RowBetween>
              </div>
            )} */}
            <div style={{ position: 'relative' }}>
              {!account ? (
                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
              ) : (
                <RowBetween>
                  {approval !== ApprovalState.APPROVED && (
                    <ButtonConfirmed
                      onClick={onAttemptToApprove}
                      disabled={approval !== ApprovalState.NOT_APPROVED}
                      mr='0.5rem'
                      fontWeight={500}
                      fontSize={16}
                    >
                      {approval === ApprovalState.PENDING ? <Dots>Approving</Dots> : 'Approve'}
                    </ButtonConfirmed>
                  )}

                  <ButtonError
                    onClick={() => {
                      setShowConfirm(true);
                    }}
                    backgroundColor={'rgba(119, 48, 48, 1) !important'}
                    className='!border-none'
                    disabled={!isValid || approval !== ApprovalState.APPROVED}
                    error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                  >
                    <Text fontSize={16} fontWeight={500} color={theme.white}>
                      {'Remove'}
                    </Text>
                  </ButtonError>
                </RowBetween>
              )}
            </div>
          </AutoColumn>
        </Wrapper>
      </AppBody>

      {pair ? (
        <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
          {/* <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} /> */}
        </AutoColumn>
      ) : null}
    </>
  );
}
