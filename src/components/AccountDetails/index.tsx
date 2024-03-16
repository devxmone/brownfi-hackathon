import { useCallback, useContext } from 'react';
import { ExternalLink as LinkIcon } from 'react-feather';
import { useDispatch } from 'react-redux';

import styled, { ThemeContext } from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { ButtonGray, ButtonPrimary } from 'components/Button';

import CoinbaseWalletIcon from '../../assets/images/coinbaseWalletIcon.svg';
import FortmaticIcon from '../../assets/images/fortmaticIcon.png';
import PortisIcon from '../../assets/images/portisIcon.png';
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg';
import { ReactComponent as Close } from '../../assets/images/x.svg';
import { fortmatic, injected, portis, walletconnect, walletlink } from '../../connectors';
import { SUPPORTED_WALLETS } from '../../constants/wallet';
import { useActiveWeb3React } from '../../hooks/web3';
import { AppDispatch } from '../../state';
import { clearAllTransactions } from '../../state/transactions/actions';
import { ExternalLink, LinkStyledButton, TYPE } from '../../theme';
import { shortenAddress } from '../../utils';
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink';
import Identicon from '../Identicon';
import { AutoRow } from '../Row';

import Copy from './Copy';
import Transaction from './Transaction';

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 400;
  font-size: 18px;
  font-family: 'Russo One';
  color: ${({ theme }) => theme.text1};
`;

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const InfoCard = styled.div`
  padding: 1rem;
  background: rgba(50, 48, 56, 1);
  position: relative;
  display: grid;
  grid-row-gap: 12px;
  margin-bottom: 20px;
`;

const AccountGroupingRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  color: ${({ theme }) => theme.primary1};

  div {
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
  }
`;

const AccountSection = styled.div`
  padding: 0rem 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0rem 1rem 1.5rem 1rem;`};
`;

const YourAccount = styled.div`
  h5 {
    margin: 0 0 1rem 0;
    font-weight: 400;
  }

  h4 {
    margin: 0;
    font-weight: 500;
  }
`;

const LowerSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  padding: 1.5rem;
  flex-grow: 1;
  overflow: auto;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  h5 {
    margin: 0;
    font-weight: 400;
    color: ${({ theme }) => theme.primary1};
  }
`;

const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;

  font-weight: 500;
  font-size: 1.25rem;

  a:hover {
    text-decoration: underline;
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const AddressLink = styled(ExternalLink)<{ hasENS: boolean; isENS: boolean }>`
  font-size: 0.825rem;
  color: ${({ theme }) => theme.primary1};
  margin-left: 1rem;
  font-size: 0.825rem;
  display: flex;
  :hover {
    color: ${({ theme }) => theme.primary1};
  }
`;

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.primary1};
  }
`;

const WalletName = styled.div`
  width: initial;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
`;

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`;

const TransactionListWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
`;

const WalletAction = styled(ButtonPrimary)`
  width: fit-content;
  font-weight: 400;
  margin-left: 8px;
  font-size: 0.825rem;
  padding: 4px 6px;
  color: ${({ theme }) => theme.text1};
`;
const WalletActionDisconnect = styled(ButtonGray)`
  width: fit-content;
  font-weight: 400;
  margin-left: 8px;
  font-size: 0.825rem;
  padding: 4px 6px;
  color: ${({ theme }) => theme.text1};
`;

const MainWalletAction = styled(WalletAction)`
  color: ${({ theme }) => theme.primary1};
`;

function renderTransactions(transactions: string[]) {
  return (
    <TransactionListWrapper>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />;
      })}
    </TransactionListWrapper>
  );
}

interface AccountDetailsProps {
  toggleWalletModal: () => void;
  pendingTransactions: string[];
  confirmedTransactions: string[];
  ENSName?: string;
  openOptions: () => void;
}

export default function AccountDetails({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions,
}: AccountDetailsProps) {
  const { chainId, account, connector } = useActiveWeb3React();
  const { deactivate } = useWeb3React();
  const theme = useContext(ThemeContext);
  const dispatch = useDispatch<AppDispatch>();

  function formatConnectorName() {
    const { ethereum } = window;
    const isMetaMask = !!(ethereum && ethereum.isMetaMask);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        (k) =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK')),
      )
      .map((k) => SUPPORTED_WALLETS[k].name)[0];
    return <WalletName>Connected with {name}</WalletName>;
  }

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <IconWrapper size={16}>
          <Identicon />
        </IconWrapper>
      );
    } else if (connector === walletconnect) {
      return (
        <IconWrapper size={16}>
          <img src={WalletConnectIcon} alt={'wallet connect logo'} />
        </IconWrapper>
      );
    } else if (connector === walletlink) {
      return (
        <IconWrapper size={16}>
          <img src={CoinbaseWalletIcon} alt={'coinbase wallet logo'} />
        </IconWrapper>
      );
    } else if (connector === fortmatic) {
      return (
        <IconWrapper size={16}>
          <img src={FortmaticIcon} alt={'fortmatic logo'} />
        </IconWrapper>
      );
    } else if (connector === portis) {
      return (
        <>
          <IconWrapper size={16}>
            <img src={PortisIcon} alt={'portis logo'} />
            <MainWalletAction
              onClick={() => {
                portis.portis.showPortis();
              }}
            >
              Show Portis
            </MainWalletAction>
          </IconWrapper>
        </>
      );
    }
    return null;
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }));
  }, [dispatch, chainId]);

  return (
    <>
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        <HeaderRow>Account</HeaderRow>
        <AccountSection>
          <YourAccount>
            <InfoCard>
              <AccountGroupingRow>
                {formatConnectorName()}
                <div>
                  {connector !== injected && connector !== walletlink && (
                    <WalletActionDisconnect
                      style={{
                        fontSize: '.825rem',
                        fontWeight: 400,
                        marginRight: '8px',
                        background: 'rgba(30, 30, 30, 1)',
                        border: 'none',
                      }}
                      onClick={() => {
                        (connector as any).close();
                      }}
                    >
                      Disconnect
                    </WalletActionDisconnect>
                  )}
                  <WalletAction
                    style={{ fontSize: '12px', fontWeight: 700 }}
                    onClick={() => {
                      openOptions();
                    }}
                  >
                    Change
                  </WalletAction>
                </div>
              </AccountGroupingRow>
              <AccountGroupingRow id='web3-account-identifier-row'>
                <AccountControl>
                  {ENSName ? (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p> {ENSName}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p style={{ fontSize: '32px', fontWeight: 600, color: 'rgba(255, 255, 255, 1)' }}>
                          {' '}
                          {account && shortenAddress(account)}
                        </p>
                      </div>
                    </>
                  )}
                </AccountControl>
              </AccountGroupingRow>
              <AccountGroupingRow>
                {ENSName ? (
                  <>
                    <AccountControl>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span
                              style={{
                                marginLeft: '4px',
                                color: 'rgba(39, 227, 171, 1)',
                                fontSize: '14px',
                                fontWeight: '500',
                              }}
                            >
                              Copy Address
                            </span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={true}
                            href={chainId ? getExplorerLink(chainId, ENSName, ExplorerDataType.ADDRESS) : ''}
                          >
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: '4px' }}>View on Block Explorer</span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                ) : (
                  <>
                    <AccountControl>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span
                              style={{
                                marginLeft: '4px',
                                color: 'rgba(39, 227, 171, 1)',
                                fontSize: '14px',
                                fontWeight: '500',
                              }}
                            >
                              Copy Address
                            </span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={false}
                            href={getExplorerLink(chainId, account, ExplorerDataType.ADDRESS)}
                          >
                            <LinkIcon
                              size={16}
                              style={{
                                color: 'rgba(39, 227, 171, 1)',
                              }}
                            />
                            <span
                              style={{
                                marginLeft: '4px',
                                color: 'rgba(39, 227, 171, 1)',
                                fontSize: '14px',
                                fontWeight: '500',
                              }}
                            >
                              View on Block Explorer
                            </span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                )}
              </AccountGroupingRow>
            </InfoCard>
          </YourAccount>
        </AccountSection>
      </UpperSection>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          <AutoRow mb={'1rem'} style={{ justifyContent: 'space-between' }}>
            <TYPE.body style={{ fontSize: '14px', fontWeight: '500' }}>Recent Transactions</TYPE.body>
            <LinkStyledButton
              style={{ fontSize: '14px', fontWeight: '500', color: theme.text1 }}
              onClick={clearAllTransactionsCallback}
            >
              (clear all)
            </LinkStyledButton>
          </AutoRow>
          {renderTransactions(pendingTransactions)}
          {renderTransactions(confirmedTransactions)}
        </LowerSection>
      ) : (
        <LowerSection>
          <TYPE.body style={{ fontSize: '14px', fontWeight: '500' }} color={theme.text1}>
            Your transactions will appear here...
          </TYPE.body>
        </LowerSection>
      )}
    </>
  );
}
