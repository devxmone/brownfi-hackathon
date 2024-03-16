import { useContext, useState } from 'react';

import styled, { ThemeContext } from 'styled-components';
import { Percent } from '@uniswap/sdk-core';

import { useSetUserSlippageTolerance, useUserSlippageTolerance, useUserTransactionTTL } from 'state/user/hooks';

import { DEFAULT_DEADLINE_FROM_NOW } from 'constants/misc';

import { TYPE } from '../../theme';
import { AutoColumn } from '../Column';
import QuestionHelper from '../QuestionHelper';
import { RowBetween, RowFixed } from '../Row';

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

const FancyButton = styled.button`
  color: ${({ theme }) => theme.primary1};
  align-items: center;
  height: 2rem;
  font-size: 1rem;
  width: 63px;
  height: 44px !important;
  min-width: 3.5rem;
  outline: none;
  background: ${({ theme }) => theme.bg0};
  border: none !important;
`;

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;
  :hover {
    cursor: pointer;
  }
  font-size: 12px;
  font-weight: 700;
  background: ${({ theme }) => theme.red2};
  color: ${({ active, theme }) => (active ? theme.text1 : theme.text1)};
`;

const Input = styled.input`
  background: ${({ theme }) => theme.bg0};
  font-size: 16px;
  width: 257px;
  height: 44px;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.text1)};
  text-align: left;
`;

const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  border: ${({ theme, active, warning }) =>
    active ? `1px solid ${warning ? theme.red1 : theme.text2}` : warning && `1px solid ${theme.red1}`};
  input {
    width: 100%;
    height: 100%;
    border: 0px;
    border-radius: 2rem;
  }
`;

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;  
  `}
`;

export interface TransactionSettingsProps {
  placeholderSlippage: Percent; // varies according to the context in which the settings dialog is placed
}

export default function TransactionSettings({ placeholderSlippage }: TransactionSettingsProps) {
  const theme = useContext(ThemeContext);

  const userSlippageTolerance = useUserSlippageTolerance();
  const setUserSlippageTolerance = useSetUserSlippageTolerance();

  const [deadline, setDeadline] = useUserTransactionTTL();

  const [slippageInput, setSlippageInput] = useState('');
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false);

  const [deadlineInput, setDeadlineInput] = useState('');
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(false);

  function parseSlippageInput(value: string) {
    // populate what the user typed and clear the error
    setSlippageInput(value);
    setSlippageError(false);

    if (value.length === 0) {
      setUserSlippageTolerance('auto');
    } else {
      const parsed = Math.floor(Number.parseFloat(value) * 100);

      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
        setUserSlippageTolerance('auto');
        if (value !== '.') {
          setSlippageError(SlippageError.InvalidInput);
        }
      } else {
        setUserSlippageTolerance(new Percent(parsed, 10_000));
      }
    }
  }

  const tooLow = userSlippageTolerance !== 'auto' && userSlippageTolerance.lessThan(new Percent(5, 10_000));
  const tooHigh = userSlippageTolerance !== 'auto' && userSlippageTolerance.greaterThan(new Percent(1, 100));

  function parseCustomDeadline(value: string) {
    // populate what the user typed and clear the error
    setDeadlineInput(value);
    setDeadlineError(false);

    if (value.length === 0) {
      setDeadline(DEFAULT_DEADLINE_FROM_NOW);
    } else {
      try {
        const parsed: number = Math.floor(Number.parseFloat(value) * 60);
        if (!Number.isInteger(parsed) || parsed < 60 || parsed > 180 * 60) {
          setDeadlineError(DeadlineError.InvalidInput);
        } else {
          setDeadline(parsed);
        }
      } catch (error) {
        console.error(error);
        setDeadlineError(DeadlineError.InvalidInput);
      }
    }
  }

  return (
    <AutoColumn gap='md'>
      <AutoColumn gap='sm'>
        <RowFixed>
          <TYPE.black fontWeight={500} fontSize={16} color={theme.text1}>
            Slippage tolerance
          </TYPE.black>
          <QuestionHelper text='Your transaction will revert if the price changes unfavorably by more than this percentage.' />
        </RowFixed>
        <RowBetween>
          <OptionCustom active={userSlippageTolerance !== 'auto'} warning={!!slippageError} tabIndex={-1}>
            <RowBetween>
              {/* {tooLow || tooHigh ? (
                <SlippageEmojiContainer>
                  <span role='img' aria-label='warning'>
                    ⚠️
                  </span>
                </SlippageEmojiContainer>
              ) : null} */}
              <Input
                placeholder={placeholderSlippage.toFixed(2)}
                value={
                  slippageInput.length > 0
                    ? slippageInput
                    : userSlippageTolerance === 'auto'
                    ? ''
                    : userSlippageTolerance.toFixed(2)
                }
                onChange={(e) => parseSlippageInput(e.target.value)}
                onBlur={() => {
                  setSlippageInput('');
                  setSlippageError(false);
                }}
                color={slippageError ? 'red' : ''}
              />
              %
            </RowBetween>
          </OptionCustom>
          &nbsp; &nbsp;
          <Option
            onClick={() => {
              parseSlippageInput('');
            }}
            active={userSlippageTolerance === 'auto'}
          >
            Auto
          </Option>
        </RowBetween>
        {slippageError || tooLow || tooHigh ? (
          <RowBetween
            style={{
              fontSize: '14px',
              paddingTop: '7px',
              color: slippageError ? 'red' : '#F3841E',
            }}
          >
            {slippageError
              ? 'Enter a valid slippage percentage'
              : tooLow
              ? 'Your transaction may fail'
              : 'Your transaction may be frontrun'}
          </RowBetween>
        ) : null}
      </AutoColumn>

      <AutoColumn gap='sm'>
        <RowFixed>
          <TYPE.black fontSize={16} fontWeight={500} color={theme.text1}>
            Transaction deadline
          </TYPE.black>
          <QuestionHelper text='Your transaction will revert if it is pending for more than this period of time.' />
        </RowFixed>
        <RowBetween>
          <OptionCustom warning={!!deadlineError} tabIndex={-1}>
            <Input
              placeholder={(DEFAULT_DEADLINE_FROM_NOW / 60).toString()}
              value={
                deadlineInput.length > 0
                  ? deadlineInput
                  : deadline === DEFAULT_DEADLINE_FROM_NOW
                  ? ''
                  : (deadline / 60).toString()
              }
              onChange={(e) => parseCustomDeadline(e.target.value)}
              onBlur={() => {
                setDeadlineInput('');
                setDeadlineError(false);
              }}
              color={deadlineError ? 'red' : ''}
            />
          </OptionCustom>
          &nbsp; &nbsp;
          <TYPE.body color={theme.text1} style={{ width: '70px' }} fontSize={14}>
            Minutes
          </TYPE.body>
        </RowBetween>
      </AutoColumn>

      <div style={{ width: '100%', borderTop: '1px solid rgba(50, 49, 53, 1)', marginTop: '5px' }}></div>
    </AutoColumn>
  );
}
