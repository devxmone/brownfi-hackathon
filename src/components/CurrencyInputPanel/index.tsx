import { useCallback, useState } from 'react';
import { Lock } from 'react-feather';

import styled from 'styled-components/macro';
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import { Pair } from '@uniswap/v2-sdk';
import { darken } from 'polished';

import { AutoColumn } from 'components/Column';
import { CurrencyLogoFromList } from 'components/CurrencyLogo/CurrencyLogoFromList';

import { formatTokenAmount } from 'utils/formatTokenAmount';

import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg';
import useTheme from '../../hooks/useTheme';
import { useActiveWeb3React } from '../../hooks/web3';
import { useCurrencyBalance } from '../../state/wallet/hooks';
import { TYPE } from '../../theme';
import { ButtonGray } from '../Button';
import DoubleCurrencyLogo from '../DoubleLogo';
import { Input as NumericalInput } from '../NumericalInput';
import { ResponsiveRow, RowBetween, RowFixed } from '../Row';
import CurrencySearchModal from '../SearchModal/CurrencySearchModal';

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  background-color: ${({ theme, hideInput }) => (hideInput ? theme.primary1 : theme.primary1)};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 16px 20px;
`;

const FixedContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 23px;
  background-color: ${({ theme }) => theme.dark5};
  opacity: 0.95;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '12px' : '12px')};
  border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.primary1)};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.primary1)};
  }
`;

const CurrencySelect = styled(ButtonGray)<{ selected: boolean; hideInput?: boolean }>`
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Montserrat';
  background: ${({ theme }) => theme.primary2};
  color: ${({ theme }) => theme.text1};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  border-radius: 0px;
  height: ${({ hideInput }) => (hideInput ? '2.8rem' : '2.4rem')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 0 8px;
  justify-content: space-between;
  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.primary2 : darken(0.05, theme.primary2))};
  }
`;

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
`;

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.primary1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding-bottom: 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.primary1)};
  }
`;

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
`;

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;

  path {
    stroke: ${({ theme }) => theme.text1};
    stroke-width: 1.5px;
  }
`;

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '14px' : '14px')};
  font-weight: 500;
`;

const Title = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 18px;
  font-weight: 400;
  font-family: 'Russo One';
`;

const Balance = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
  font-weight: 500;
  font-family: 'Montserrat';
`;

export type ShortcutAmount = 'half';

const StyledBalanceShortcut = styled(ButtonGray)<{ disabled?: boolean }>`
  background-color: ${({ theme }) => theme.red2};
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 6px;
  color: ${({ theme }) => theme.text1};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};

  :not(:first-of-type) {
    margin-left: 0.25rem;
  }

  :focus {
    outline: none;
  }

  :focus,
  :hover {
    background-color: ${({ theme }) => darken(0.05, theme.red2)};
  }
`;

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax?: () => void;
  onShortcutAmount?: (value: ShortcutAmount) => void;
  showMaxButton: boolean;
  showShortcutButtons?: boolean;
  label?: string;
  onCurrencySelect?: (currency: Currency) => void;
  currency?: Currency | null;
  hideBalance?: boolean;
  pair?: Pair | null;
  hideInput?: boolean;
  otherCurrency?: Currency | null;
  fiatValue?: CurrencyAmount<Token> | null;
  priceImpact?: Percent;
  id: string;
  showCommonBases?: boolean;
  customBalanceText?: string;
  locked?: boolean;
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  onShortcutAmount,
  showMaxButton,
  onCurrencySelect,
  currency,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
  fiatValue,
  priceImpact,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  showShortcutButtons = false,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { account } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined);
  const theme = useTheme();

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);
  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      {locked && (
        <FixedContainer>
          <AutoColumn gap='sm' justify='center'>
            <Lock />
            <TYPE.label fontSize='12px' textAlign='center'>
              The market price is outside your specified price range. Single-asset deposit only.
            </TYPE.label>
          </AutoColumn>
        </FixedContainer>
      )}
      <Container hideInput={hideInput}>
        {!hideInput && !hideBalance && (
          <FiatRow>
            <RowBetween>
              {/* <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} /> */}
              <Title>
                {id === 'swap-currency-input' || id === 'add-liquidity-input-tokena' ? 'You Pay' : 'Your Receive'}
              </Title>
              {account ? (
                <ResponsiveRow style={{ gap: '5px' }}>
                  <RowFixed style={{ height: '25px' }}>
                    <div className='flex gap-3 items-center'>
                      <Balance>
                        Balance:{' '}
                        {!hideBalance && !!currency && selectedCurrencyBalance
                          ? customBalanceText ?? formatTokenAmount(selectedCurrencyBalance, 6)
                          : '-'}
                      </Balance>
                      {/* <div className='flex justify-center items-center bg-[#773030] py-[16px] px-[19px] max-h-[24px] cursor-pointer'>
                        <TYPE.label
                          fontSize='12px'
                          fontWeight={700}
                          color={theme.white}
                          textAlign='center'
                          onClick={onMax}
                        >
                          Max
                        </TYPE.label>
                      </div> */}
                    </div>
                  </RowFixed>
                  <RowFixed>
                    {/* {showShortcutButtons && selectedCurrencyBalance ? (
                      <StyledBalanceShortcut onClick={() => onShortcutAmount && onShortcutAmount('half')}>
                        Half
                      </StyledBalanceShortcut>
                    ) : null} */}
                    {showMaxButton && selectedCurrencyBalance ? (
                      <StyledBalanceShortcut onClick={onMax}>Max</StyledBalanceShortcut>
                    ) : null}
                  </RowFixed>
                </ResponsiveRow>
              ) : (
                '-'
              )}
            </RowBetween>
          </FiatRow>
        )}
        <InputRow style={hideInput ? { padding: '0' } : {}} selected={!onCurrencySelect}>
          {!hideInput && (
            <>
              <NumericalInput
                className='token-amount-input'
                value={value}
                onUserInput={(val) => {
                  onUserInput(val);
                }}
                placeholder={id !== 'swap-currency-input' ? 'Enter Amount' : '0.0'}
              />
            </>
          )}
          <CurrencySelect
            selected={!!currency}
            hideInput={hideInput}
            className='open-currency-select-button'
            onClick={() => {
              if (onCurrencySelect) {
                setModalOpen(true);
              }
            }}
          >
            <Aligner>
              <RowFixed>
                {pair ? (
                  <span style={{ marginRight: '0.5rem' }}>
                    <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                  </span>
                ) : currency ? (
                  <CurrencyLogoFromList style={{ marginRight: '0.5rem' }} currency={currency} size={'24px'} />
                ) : null}
                {pair ? (
                  <StyledTokenName className='pair-name-container'>
                    {pair?.token0.symbol}:{pair?.token1.symbol}
                  </StyledTokenName>
                ) : (
                  <StyledTokenName className='token-symbol-container' active={Boolean(currency && currency.symbol)}>
                    {(currency && currency.symbol && currency.symbol.length > 20
                      ? currency.symbol.slice(0, 4) +
                        '...' +
                        currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                      : currency?.symbol) || 'Select a token'}
                  </StyledTokenName>
                )}
              </RowFixed>
              {onCurrencySelect && <StyledDropDown selected={!!currency} />}
            </Aligner>
          </CurrencySelect>
        </InputRow>
      </Container>
      {onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </InputPanel>
  );
}
