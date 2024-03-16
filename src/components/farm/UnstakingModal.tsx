import { useState } from 'react';

import styled from 'styled-components/macro';
import { TransactionResponse } from '@ethersproject/providers';

import { useMiniChef } from '../../hooks/useContract';
import { useActiveWeb3React } from '../../hooks/web3';
import { StakingInfo } from '../../state/stake/hooks';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { CloseIcon, TYPE } from '../../theme';
import { ButtonError } from '../Button';
import { AutoColumn } from '../Column';
import FormattedCurrencyAmount from '../FormattedCurrencyAmount';
import Modal from '../Modal';
import { LoadingView, SubmittedView } from '../ModalViews';
import { RowBetween } from '../Row';

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`;

interface StakingModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  stakingInfo: Pick<StakingInfo, 'stakedAmount' | 'earnedAmount'> & { poolId?: number };
  // rewardInfo:
}

export default function UnstakingModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account } = useActiveWeb3React();

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder();
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);

  function wrappedOndismiss() {
    setHash(undefined);
    setAttempting(false);
    onDismiss();
  }

  const miniChef = useMiniChef();

  async function onWithdraw() {
    if (miniChef && stakingInfo?.stakedAmount && account && typeof stakingInfo?.poolId === 'number') {
      setAttempting(true);

      await miniChef
        .withdrawAndHarvest(stakingInfo.poolId, `0x${stakingInfo.stakedAmount.quotient.toString(16)}`, account)
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw deposited liquidity`,
          });
          setHash(response.hash);
        })
        .catch((error: any) => {
          setAttempting(false);
          console.log(error);
        });
    }
  }

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? 'Enter an amount';
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap='lg'>
          <RowBetween>
            <TYPE.mediumHeader>Withdraw</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          {stakingInfo?.stakedAmount && (
            <AutoColumn justify='center' gap='md'>
              <TYPE.body fontWeight={600} fontSize={36}>
                {<FormattedCurrencyAmount currencyAmount={stakingInfo.stakedAmount} />}
              </TYPE.body>
              <TYPE.body>Deposited liquidity:</TYPE.body>
            </AutoColumn>
          )}
          {stakingInfo?.earnedAmount && (
            <AutoColumn justify='center' gap='md'>
              <TYPE.body fontWeight={600} fontSize={36}>
                {<FormattedCurrencyAmount currencyAmount={stakingInfo?.earnedAmount} />}
              </TYPE.body>
              <TYPE.body>Unclaimed BROWN</TYPE.body>
            </AutoColumn>
          )}
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            When you withdraw, your BROWN is claimed and your liquidity is removed from the mining pool.
          </TYPE.subHeader>
          <ButtonError disabled={!!error} error={!!error && !!stakingInfo?.stakedAmount} onClick={onWithdraw}>
            {error ?? 'Withdraw & Claim'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap='12px' justify={'center'}>
            <TYPE.body fontSize={20}>Withdrawing {stakingInfo?.stakedAmount?.toSignificant(4)} BrownFi-LP</TYPE.body>
            <TYPE.body fontSize={20}>Claiming {stakingInfo?.earnedAmount?.toSignificant(4)} BrownFi</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap='12px' justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Withdrew BrownFi-LP!</TYPE.body>
            <TYPE.body fontSize={20}>Claimed BrownFi!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  );
}