import { ReactNode, useContext } from 'react';
import { AlertTriangle, ArrowUpCircle } from 'react-feather';

import styled, { ThemeContext } from 'styled-components';
import { Currency } from '@uniswap/sdk-core';
import { Text } from 'rebass';

import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask';

import { ChainId } from 'constants/chains';

import Circle from '../../assets/images/blue-loader.svg';
import ErrorIcon from '../../assets/images/error-icon.svg';
import SuccessIcon from '../../assets/images/success-icon.svg';
import { useActiveWeb3React } from '../../hooks/web3';
import { ExternalLink } from '../../theme';
import { CloseIcon, CustomLightSpinner } from '../../theme/components';
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink';
import { ButtonPrimary } from '../Button';
import { AutoColumn, ColumnCenter } from '../Column';
import Modal from '../Modal';
import { RowBetween } from '../Row';

const Wrapper = styled.div`
  width: 100%;
  padding: 30px;
`;
const Section = styled(AutoColumn)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '0' : '0')};
`;

const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const ConfirmedIcon = styled(ColumnCenter)<{ inline?: boolean }>`
  padding: 0px;
`;

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`;

export function ConfirmationPendingContent({
  onDismiss,
  pendingText,
  inline,
}: {
  onDismiss: () => void;
  pendingText: string;
  inline?: boolean; // not in modal
}) {
  const theme = useContext(ThemeContext);
  return (
    <Wrapper>
      <AutoColumn gap='md'>
        {!inline && (
          <RowBetween>
            <div />
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          <CustomLightSpinner src={Circle} alt='loader' size={inline ? '40px' : '90px'} color={theme.green2} />
        </ConfirmedIcon>
        <AutoColumn gap='12px' justify={'center'}>
          <Text fontWeight={600} fontSize={32} textAlign='center' color={theme.text1}>
            Waiting...
          </Text>
          <Text fontWeight={500} fontSize={20} textAlign='center' color={theme.text2}>
            For confirmation
          </Text>
          <br></br>
          <AutoColumn gap='12px' justify={'center'}>
            <Text fontWeight={500} fontSize={14} color={theme.text1} textAlign='center'>
              {pendingText}
            </Text>
          </AutoColumn>
          <Text fontSize={12} fontWeight={500} color={theme.text2} textAlign='center' marginBottom={12}>
            Confirm this transaction in your wallet
          </Text>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  );
}

export function ConfirmationPendingSwapContent({
  onDismiss,
  pendingText,
  inline,
}: {
  onDismiss: () => void;
  pendingText: string;
  inline?: boolean; // not in modal
}) {
  const theme = useContext(ThemeContext);
  return (
    <Wrapper>
      <AutoColumn gap='md'>
        {!inline && (
          <RowBetween>
            <div />
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          <CustomLightSpinner src={Circle} alt='loader' size={inline ? '40px' : '90px'} color={theme.green2} />
        </ConfirmedIcon>
        <AutoColumn gap='12px' justify={'center'}>
          <Text fontWeight={600} fontSize={32} textAlign='center' color={theme.text1}>
            Confirm Swap
          </Text>
          <br></br>
          <AutoColumn gap='12px' justify={'center'}>
            <Text fontWeight={500} fontSize={14} color={theme.text1} textAlign='center'>
              {pendingText}
            </Text>
          </AutoColumn>
          <Text fontSize={12} fontWeight={500} color={theme.text2} textAlign='center' marginBottom={12}>
            Proceed in your wallet
          </Text>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  );
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  inline,
}: {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: ChainId;
  currencyToAdd?: Currency | undefined;
  inline?: boolean; // not in modal
}) {
  const theme = useContext(ThemeContext);

  const { library } = useActiveWeb3React();

  const { addToken, success } = useAddTokenToMetamask(currencyToAdd);

  return (
    <Wrapper>
      <Section inline={inline}>
        {!inline && (
          <RowBetween>
            <div />
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          <ArrowUpCircle strokeWidth={0.5} size={inline ? '40px' : '90px'} color={theme.green2} />
        </ConfirmedIcon>
        <AutoColumn gap='12px' justify={'center'}>
          <Text fontWeight={500} fontSize={32} textAlign='center' color={theme.green2}>
            Transaction Submitted
          </Text>

          <ButtonPrimary onClick={onDismiss} style={{ margin: '20px 0 0 0' }}>
            <Text fontWeight={500} fontSize={20}>
              {inline ? 'Return' : 'Close'}
            </Text>
          </ButtonPrimary>

          {chainId && hash && (
            <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
              <Text fontWeight={500} fontSize={14} color={theme.green2}>
                View on Block Explorer
              </Text>
            </ExternalLink>
          )}
          {/* {currencyToAdd && library?.provider?.isMetaMask && (
            <ButtonLight mt='12px' padding='6px 12px' width='fit-content' onClick={addToken}>
              {!success ? (
                <RowFixed>
                  Add {currencyToAdd.symbol} to Metamask <StyledLogo src={MetaMaskLogo} />
                </RowFixed>
              ) : (
                <RowFixed>
                  Added {currencyToAdd.symbol}{' '}
                  <CheckCircle size={'16px'} stroke={theme.green1} style={{ marginLeft: '6px' }} />
                </RowFixed>
              )}
            </ButtonLight>
          )} */}
        </AutoColumn>
      </Section>
    </Wrapper>
  );
}
export function TransactionSubmittedSwapContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  inline,
  pendingText,
}: {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: ChainId;
  currencyToAdd?: Currency | undefined;
  inline?: boolean; // not in modal
  pendingText: any;
}) {
  const theme = useContext(ThemeContext);

  const { library } = useActiveWeb3React();

  const { addToken, success } = useAddTokenToMetamask(currencyToAdd);

  return (
    <Wrapper>
      <Section inline={inline}>
        {!inline && (
          <RowBetween>
            <Text fontWeight={400} fontSize={24} fontFamily={'Russo One'}>
              Review Swap
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          <img style={{ marginTop: '50px' }} src={SuccessIcon} />
        </ConfirmedIcon>
        <AutoColumn gap='12px' justify={'center'}>
          <Text fontWeight={500} fontSize={32} textAlign='center' color={theme.green2} style={{ marginTop: '30px' }}>
            Swap Success
          </Text>
          <AutoColumn gap='12px' justify={'center'}>
            <Text fontWeight={500} fontSize={14} color={theme.text1} textAlign='center'>
              {pendingText}
            </Text>
          </AutoColumn>
          {chainId && hash && (
            <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
              <br></br>
              <Text fontWeight={500} fontSize={14} color={theme.green2}>
                View on Explorer
              </Text>
            </ExternalLink>
          )}
          {/* {currencyToAdd && library?.provider?.isMetaMask && (
            <ButtonLight mt='12px' padding='6px 12px' width='fit-content' onClick={addToken}>
              {!success ? (
                <RowFixed>
                  Add {currencyToAdd.symbol} to Metamask <StyledLogo src={MetaMaskLogo} />
                </RowFixed>
              ) : (
                <RowFixed>
                  Added {currencyToAdd.symbol}{' '}
                  <CheckCircle size={'16px'} stroke={theme.green1} style={{ marginLeft: '6px' }} />
                </RowFixed>
              )}
            </ButtonLight>
          )} */}
          <ButtonPrimary onClick={onDismiss} style={{ margin: '20px 0 0 0' }}>
            <Text fontWeight={500} fontSize={20}>
              {inline ? 'Return' : 'Close'}
            </Text>
          </ButtonPrimary>
        </AutoColumn>
      </Section>
    </Wrapper>
  );
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
}: {
  title: string;
  onDismiss: () => void;
  topContent: () => ReactNode;
  bottomContent?: () => ReactNode | undefined;
}) {
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={400} fontSize={24} fontFamily={'Russo One'}>
            {title}
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        {topContent()}
      </Section>
      {bottomContent && <BottomSection gap='12px'>{bottomContent()}</BottomSection>}
    </Wrapper>
  );
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const theme = useContext(ThemeContext);
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            Error
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap='24px' justify='center'>
          <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
          <Text
            fontWeight={500}
            fontSize={16}
            color={theme.red1}
            style={{ textAlign: 'center', width: '85%', wordBreak: 'break-word' }}
          >
            {message}
          </Text>
        </AutoColumn>
      </Section>
      <BottomSection gap='12px'>
        <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
      </BottomSection>
    </Wrapper>
  );
}

export function TransactionErrorSwapContent({
  message,
  onDismiss,
  pendingText,
}: {
  message: string;
  onDismiss: () => void;
  pendingText: any;
}) {
  const theme = useContext(ThemeContext);
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={400} fontSize={24} fontFamily={'Russo One'}>
            Review Swap
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ padding: '50px 0 10px' }} gap='24px' justify='center'>
          <img src={ErrorIcon} />
          <Text
            fontWeight={600}
            fontSize={32}
            color={theme.red3}
            style={{ textAlign: 'center', width: '85%', wordBreak: 'break-word' }}
          >
            {'Swap Fail'}
          </Text>
        </AutoColumn>
        <AutoColumn gap='12px' justify={'center'} style={{ marginBottom: '50px' }}>
          <Text fontWeight={500} fontSize={14} color={theme.text1} textAlign='center'>
            {pendingText}
          </Text>
        </AutoColumn>
      </Section>
      <BottomSection gap='12px'>
        <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
      </BottomSection>
    </Wrapper>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  hash: string | undefined;
  content: () => ReactNode;
  attemptingTxn: boolean;
  pendingText: any;
  currencyToAdd?: Currency | undefined;
}

export function TransactionConfirmationSwapModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React();

  if (!chainId) return null;

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingSwapContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <>
          <TransactionSubmittedSwapContent
            chainId={chainId}
            hash={hash}
            onDismiss={onDismiss}
            currencyToAdd={currencyToAdd}
            pendingText={pendingText}
          />
        </>
      ) : (
        content()
      )}
    </Modal>
  );
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React();

  if (!chainId) return null;

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <>
          <TransactionSubmittedContent
            chainId={chainId}
            hash={hash}
            onDismiss={onDismiss}
            currencyToAdd={currencyToAdd}
          />
        </>
      ) : (
        content()
      )}
    </Modal>
  );
}
