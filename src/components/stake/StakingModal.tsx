import { useCallback, useState } from 'react';

import styled from 'styled-components/macro';

import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask';

import { CurrencyAmount, Token } from 'sdk-core';

import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { useDiffusionBar } from '../../hooks/useContract';
// import { V2_ROUTER_ADDRESS } from '../../constants/addresses'
// import { useV2LiquidityTokenPermit } from '../../hooks/useERC20Permit'
import useTransactionDeadline from '../../hooks/useTransactionDeadline';
import { useActiveWeb3React } from '../../hooks/web3';
import { useDerivedStakeInfo } from '../../state/stake/hooks';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { CloseIcon, TYPE } from '../../theme';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import { ButtonConfirmed, ButtonError, ButtonSecondary } from '../Button';
import { AutoColumn } from '../Column';
import CurrencyInputPanel from '../CurrencyInputPanel';
import Modal from '../Modal';
import { LoadingView, SubmittedView } from '../ModalViews';
import ProgressCircles from '../ProgressSteps';
import { RowBetween } from '../Row';

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`;

interface StakingModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  availableAmount?: CurrencyAmount<Token>;
  currencyToAdd?: Token;
}

export default function StakingModal({ isOpen, onDismiss, availableAmount, currencyToAdd }: StakingModalProps) {
  const { library, account } = useActiveWeb3React();

  const { addToken, success: success } = useAddTokenToMetamask(currencyToAdd);

  // track and parse user input
  const [typedValue, setTypedValue] = useState('');
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, availableAmount?.currency, availableAmount);

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder();
  const [attempting, setAttempting] = useState<boolean>(false);
  const [hash, setHash] = useState<string | undefined>();
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined);
    setAttempting(false);
    onDismiss();
  }, [onDismiss]);

  // approval data for stake
  const deadline = useTransactionDeadline();

  const diffusionBar = useDiffusionBar();
  const [approval, approveCallback] = useApproveCallback(parsedAmount, diffusionBar?.address);

  async function onStake() {
    setAttempting(true);

    if (diffusionBar && parsedAmount && deadline && account) {
      if (approval === ApprovalState.APPROVED) {
        try {
          const response = await diffusionBar.enter(`0x${parsedAmount.quotient.toString(16)}`);
          addTransaction(response, {
            summary: 'Stake BROWN',
          });
          setHash(response.hash);
        } catch (e: any) {
          console.error(e);
          setAttempting(false);
        }
      } else {
        setAttempting(false);
        throw new Error('Attempting to stake without approval or a signature. Please contact support.');
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue);
  }, []);

  // used for max input button
  const maxAmountInput = maxAmountSpend(availableAmount);
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput));
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  async function onAttemptToApprove() {
    if (!library || !deadline) throw new Error('missing dependencies');
    if (!parsedAmount) throw new Error('missing liquidity amount');

    await approveCallback();
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap='lg'>
          <RowBetween>
            <TYPE.mediumHeader>Stake</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={availableAmount?.currency}
            label={''}
            customBalanceText={'Available to stake: '}
            id='stake-token'
          />

          <RowBetween>
            <ButtonConfirmed
              mr='0.5rem'
              onClick={onAttemptToApprove}
              confirmed={approval === ApprovalState.APPROVED}
              disabled={approval !== ApprovalState.NOT_APPROVED}
            >
              Approve
            </ButtonConfirmed>
            <ButtonError
              disabled={!!error || approval !== ApprovalState.APPROVED}
              error={!!error && !!parsedAmount}
              onClick={onStake}
            >
              {error ?? 'Deposit'}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[approval === ApprovalState.APPROVED]} disabled={true} />
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap='12px' justify={'center'}>
            <TYPE.largeHeader>Staking</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{parsedAmount?.toSignificant(4)} BROWN</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap='12px' justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Staked {parsedAmount?.toSignificant(4)} BROWN</TYPE.body>
            <AddXDiffButton addToken={addToken} success={success} />
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  );
}

function AddXDiffButton({ addToken, success }: { addToken: () => void; success?: boolean }) {
  if (success) {
    return <ButtonSecondary disabled>Added to Metamask</ButtonSecondary>;
  }
  return <ButtonSecondary onClick={addToken}>Add xBROWN to Metamask</ButtonSecondary>;
}
