import { useCallback, useContext, useState } from 'react';
import RangeSlider from 'react-bootstrap-range-slider';
import ReactGA from 'react-ga';
import { RouteComponentProps } from 'react-router-dom';

import styled, { ThemeContext } from 'styled-components';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { Currency, CurrencyAmount, currencyEquals, Percent } from '@uniswap/sdk-core';
import { Text } from 'rebass';

import QuestionHelper from 'components/QuestionHelper';
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter';
import { BodyWrapper } from 'pages/AppBody';

import { useBurnActionHandlers } from 'state/burn/hooks';

import { ChainIdValue } from 'constants/chains';
import { WETH } from 'constants/tokens';
import { calculateGasMargin } from 'utils/calculateGasMargin';

import IOS_SHARE from '../../assets/images/ios-share.svg';
import { ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button';
import { BlueCard, LightCard } from '../../components/Card';
import { AutoColumn, ColumnCenter } from '../../components/Column';
import CurrencyInputPanel from '../../components/CurrencyInputPanel';
import DoubleCurrencyLogo from '../../components/DoubleLogo';
import { AddRemoveTabs } from '../../components/NavigationTabs';
import { RowBetween, RowFlat } from '../../components/Row';
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal';
import { ZERO_PERCENT } from '../../constants/misc';
import { useCurrency } from '../../hooks/Tokens';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { useV2RouterContract } from '../../hooks/useContract';
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported';
import useTransactionDeadline from '../../hooks/useTransactionDeadline';
import { PairState } from '../../hooks/useV2Pairs';
import { useActiveWeb3React } from '../../hooks/web3';
import { useWalletModalToggle } from '../../state/application/hooks';
import { Field } from '../../state/mint/actions';
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { useIsExpertMode, useUserSlippageToleranceWithDefault } from '../../state/user/hooks';
import { TYPE } from '../../theme';
import { calculateSlippageAmount } from '../../utils/calculateSlippageAmount';
import { currencyId } from '../../utils/currencyId';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import { wrappedCurrency } from '../../utils/wrappedCurrency';
import { Dots, Wrapper } from '../Pool/styleds';

import { ConfirmAddModalBottom } from './ConfirmAddModalBottom';

import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
const StyledRangeInput = styled.div`
  width: 100%;
  .range-slider__wrap {
    input {
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        background-color: rgba(39, 227, 171, 1) !important;
        border-radius: 100%;
        border: none;
        color: ${({ theme }) => theme.primary1};
      }
    }
  }
`;
const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

export default function AddLiquidity({
  match: {
    params: { currencyIdA, currencyIdB },
  },
  history,
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const { account, chainId, library } = useActiveWeb3React();
  const theme = useContext(ThemeContext);

  const currencyA = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);

  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(currencyA, WETH[chainId as ChainIdValue])) ||
        (currencyB && currencyEquals(currencyB, WETH[chainId as ChainIdValue]))),
  );

  const toggleWalletModal = useWalletModalToggle(); // toggle wallet when disconnected

  const expertMode = useIsExpertMode();

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState();
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined);

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

  // txn values
  const deadline = useTransactionDeadline(); // custom from users settings
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE); // custom from users
  const [txHash, setTxHash] = useState<string>('');

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      };
    },
    {},
  );

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      };
    },
    {},
  );

  const router = useV2RouterContract();

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], router?.address);
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], router?.address);

  const addTransaction = useTransactionAdder();

  async function onAdd() {
    if (!chainId || !library || !account || !router) return;

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return;
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? ZERO_PERCENT : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? ZERO_PERCENT : allowedSlippage)[0],
    };

    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number>,
      value: BigNumber | null;
    if (currencyA.isNative || currencyB.isNative) {
      const tokenBIsETH = currencyB.isNative;
      estimate = router.estimateGas.addLiquidityETH;
      method = router.addLiquidityETH;
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).quotient.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadline.toHexString(),
      ];
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).quotient.toString());
    } else {
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.quotient.toString(),
        parsedAmountB.quotient.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
      ];
      value = null;
    }

    // estimate = (..._args: any) => Promise.resolve(BigNumber.from('1000000'))

    setAttemptingTxn(true);
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          setAttemptingTxn(false);

          addTransaction(response, {
            summary:
              'Add ' +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              ' ' +
              currencies[Field.CURRENCY_A]?.symbol +
              ' and ' +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              ' ' +
              currencies[Field.CURRENCY_B]?.symbol,
          });

          setTxHash(response.hash);

          ReactGA.event({
            category: 'Liquidity',
            action: 'Add',
            label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/'),
          });
        }),
      )
      .catch((error) => {
        setAttemptingTxn(false);
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error);
        }
      });
    // await method(...args, {
    //   ...(value ? { value } : {}),
    // })
    //   .then((response) => {
    //     setAttemptingTxn(false);

    //     addTransaction(response, {
    //       summary:
    //         'Add ' +
    //         parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
    //         ' ' +
    //         currencies[Field.CURRENCY_A]?.symbol +
    //         ' and ' +
    //         parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
    //         ' ' +
    //         currencies[Field.CURRENCY_B]?.symbol,
    //     });

    //     setTxHash(response.hash);

    //     ReactGA.event({
    //       category: 'Liquidity',
    //       action: 'Add',
    //       label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/'),
    //     });
    //   })
    //   .catch((error) => {
    //     setAttemptingTxn(false);
    //     // we only care if the error is something _other_ than the user rejected the tx
    //     if (error?.code !== 4001) {
    //       console.error(error);
    //     }
    //   });
  }

  const modalHeader = () => {
    return noLiquidity ? (
      <AutoColumn gap='20px'>
        <LightCard mt='20px' borderRadius='8px' marginTop={25} marginBottom={25}>
          <RowFlat>
            <Text fontSize='36px' fontWeight={500} paddingRight='20px' lineHeight='42px' marginRight={40}>
              {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol}
            </Text>
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_A]}
              currency1={currencies[Field.CURRENCY_B]}
              size={30}
            />
          </RowFlat>
        </LightCard>
      </AutoColumn>
    ) : (
      <AutoColumn gap='20px'>
        {/* <RowFlat style={{ marginTop: '20px' }}>
          <Text fontSize='48px' paddingRight='20px' fontWeight={500} lineHeight='42px' marginRight={10}>
            {liquidityMinted?.toSignificant(6)}
          </Text>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={30}
          />
        </RowFlat> */}
        {/* <Row>
          <Text fontSize='24px'>
            {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol + ' Pool Tokens'}
          </Text>
        </Row>
        <TYPE.italic fontSize={12} textAlign='left' padding={'8px 0 0 0 '}>
          {`Output is estimated. If the price changes by more than ${allowedSlippage.toSignificant(
            4,
          )}% your transaction will revert.`}
        </TYPE.italic> */}
      </AutoColumn>
    );
  };

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    );
  };

  const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_A]?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`;

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA);
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/add/v2/${currencyIdB}/${currencyIdA}`);
      } else {
        history.push(`/add/v2/${newCurrencyIdA}/${currencyIdB}`);
      }
    },
    [currencyIdB, history, currencyIdA],
  );
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB);
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/add/v2/${currencyIdB}/${newCurrencyIdB}`);
        } else {
          history.push(`/add/v2/${newCurrencyIdB}`);
        }
      } else {
        history.push(`/add/v2/${currencyIdA ? currencyIdA : 'BNB'}/${newCurrencyIdB}`);
      }
    },
    [currencyIdA, history, currencyIdB],
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('');
    }
    setTxHash('');
  }, [onFieldAInput, txHash]);

  const isCreate = history.location.pathname.includes('/create');
  const { onUserInput: _onUserInput } = useBurnActionHandlers();
  const addIsUnsupported = useIsSwapUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B);
  // wrapped onUserInput to clear signatures

  const [sliderValue, setSliderValue] = useState<number>(0);

  return (
    <>
      <BodyWrapper style={{ marginTop: '50px' }}>
        <AddRemoveTabs creating={isCreate} adding={true} defaultSlippage={DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE} />
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={() => (
              <ConfirmationModalContent
                title={noLiquidity ? 'You are creating a pool' : 'Review'}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
            currencyToAdd={pair?.liquidityToken}
          />
          <AutoColumn gap='10px'>
            {noLiquidity ||
              (isCreate ? (
                <ColumnCenter>
                  <BlueCard>
                    <AutoColumn gap='10px'>
                      <TYPE.link fontWeight={600} color='white'>
                        You are the first liquidity provider.
                      </TYPE.link>
                      <TYPE.link fontWeight={400} color='white'>
                        The ratio of tokens you add will set the price of this pool.
                      </TYPE.link>
                      <TYPE.link fontWeight={400} color='white'>
                        Once you are happy with the rate click supply to review.
                      </TYPE.link>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ) : (
                <ColumnCenter>
                  <BlueCard
                    padding={'7px'}
                    backgroundColor={'rgba(39, 227, 171, 0.1) !important'}
                    borderRadius='0px !important'
                  >
                    <AutoColumn gap='10px'>
                      <TYPE.link fontWeight={500} fontSize={'12px'} color='#27E3AB'>
                        <b>Tip:</b> When you add liquidity, you will receive pool tokens representing your position.
                        <br />
                        These tokens automatically earn fees proportional to your share of the pool, and can be redeemed
                        at any time.
                      </TYPE.link>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ))}
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_A]}
              onUserInput={onFieldAInput}
              onMax={() => {
                onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '');
              }}
              onCurrencySelect={handleCurrencyASelect}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
              currency={currencies[Field.CURRENCY_A]}
              id='add-liquidity-input-tokena'
              showCommonBases
            />
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_B]}
              onUserInput={onFieldBInput}
              onCurrencySelect={handleCurrencyBSelect}
              onMax={() => {
                onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '');
              }}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
              currency={currencies[Field.CURRENCY_B]}
              id='add-liquidity-input-tokenb'
              showCommonBases
            />
            <div className='flex flex-col gap-8'>
              <div className='flex flex-col gap-4'>
                <div className='flex gap-1'>
                  <TYPE.label fontSize={'16px'} fontWeight={700} color={theme.white}>
                    Set Liquidity Concentration Parameter
                  </TYPE.label>
                  <QuestionHelper text='Set Liquidity Concentration Parameter' />
                </div>
                <div className='flex items-center gap-2'>
                  <TYPE.label fontSize={'16px'} fontWeight={500} color={theme.white}>
                    {0}
                  </TYPE.label>
                  <StyledRangeInput>
                    <RangeSlider
                      min={0}
                      max={2}
                      step={0.1}
                      value={sliderValue}
                      onChange={(changeEvent: any) => setSliderValue(changeEvent.target.value)}
                    />
                  </StyledRangeInput>
                  <TYPE.label fontSize={'16px'} fontWeight={500} color={theme.white}>
                    2
                  </TYPE.label>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <TYPE.label fontSize={'16px'} fontWeight={700} color={theme.white}>
                  Capital Efficiency
                </TYPE.label>
                <div className='flex items-center h-8 bg-[#323038] px-[19px] py-4 cursor-pointer'>
                  <TYPE.label fontSize={'12px'} fontWeight={700} color={theme.white}>
                    1000x
                  </TYPE.label>
                </div>
              </div>
            </div>
            {/* {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
              <>
                <LightCard padding='0px' borderRadius={'8px'}>
                  <RowBetween padding='1rem'>
                    <TYPE.subHeader fontWeight={500} fontSize={14}>
                      {noLiquidity ? 'Initial prices' : 'Prices'} and pool share
                    </TYPE.subHeader>
                  </RowBetween>{' '}
                  <LightGreyCard padding='1rem' borderRadius={'8px'}>
                    <PoolPriceBar
                      currencies={currencies}
                      poolTokenPercentage={poolTokenPercentage}
                      noLiquidity={noLiquidity}
                      price={price}
                    />
                  </LightGreyCard>
                </LightCard>
              </>
            )} */}

            {addIsUnsupported ? (
              <ButtonLight style={{ height: '56px' }} disabled={true}>
                Unsupported Asset
              </ButtonLight>
            ) : !account ? (
              <ButtonLight style={{ height: '56px' }} onClick={toggleWalletModal}>
                Connect Wallet
              </ButtonLight>
            ) : (
              <AutoColumn gap={'md'}>
                {(approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING) &&
                  isValid && (
                    <RowBetween>
                      {approvalA !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          style={{ height: '56px' }}
                          onClick={approveACallback}
                          disabled={approvalA === ApprovalState.PENDING}
                          width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalA === ApprovalState.PENDING ? (
                            <Dots>Approving {currencies[Field.CURRENCY_A]?.symbol}</Dots>
                          ) : (
                            'Approve ' + currencies[Field.CURRENCY_A]?.symbol
                          )}
                        </ButtonPrimary>
                      )}
                      {approvalB !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveBCallback}
                          disabled={approvalB === ApprovalState.PENDING}
                          width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalB === ApprovalState.PENDING ? (
                            <Dots>Approving {currencies[Field.CURRENCY_B]?.symbol}</Dots>
                          ) : (
                            'Approve ' + currencies[Field.CURRENCY_B]?.symbol
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
                <ButtonError
                  style={{ height: '56px' }}
                  onClick={() => {
                    expertMode ? onAdd() : setShowConfirm(true);
                  }}
                  disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                  error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {error ?? 'Supply'}
                  </Text>
                </ButtonError>
              </AutoColumn>
            )}
          </AutoColumn>
        </Wrapper>
        <ColumnCenter>
          <BlueCard backgroundColor={'rgba(39, 227, 171, 0.1) !important'} borderRadius='0px !important'>
            <AutoColumn gap='10px'>
              <TYPE.link fontWeight={500} fontSize={'12px'} color='#27E3AB' display='flex' style={{ gap: '5px' }}>
                <b>Tip:</b> Smaller K, greater liquidity concentration. Read how to choose K{' '}
                <img src={IOS_SHARE} alt='' />
              </TYPE.link>
            </AutoColumn>
          </BlueCard>
        </ColumnCenter>
      </BodyWrapper>

      {!addIsUnsupported ? (
        pair && !noLiquidity && pairState !== PairState.INVALID ? (
          <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
            {/* <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} /> */}
          </AutoColumn>
        ) : null
      ) : (
        <UnsupportedCurrencyFooter
          show={addIsUnsupported}
          currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
        />
      )}
    </>
  );
}
