import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

// import { ExternalLink } from 'theme/components'
import styled from 'styled-components/macro';
import useScrollPosition from '@react-hook/window-scroll';
import { darken } from 'polished';

import TickIcon from '../../assets/images/icon-tick.svg';
// import Modal from '../Modal'
// import UniBalanceContent from './UniBalanceContent'
import Logo from '../../assets/images/logo.png';
import LineaIcon from '../../assets/images/scroll.png';
import CollaseIconDown from '../../assets/images/select-icon-down.svg';
import CollaseIconUp from '../../assets/images/select-icon-up.svg';
// import Logo from '../../assets/logo'
import { useActiveWeb3React } from '../../hooks/web3';
import { useETHBalances } from '../../state/wallet/hooks';
// import { ExternalLink } from '../../theme'
import { MobileMenu } from '../Menu/MobileMenu';
import Row, { RowFixed } from '../Row';
import Web3Status from '../Web3Status';
const HeaderFrame = styled.div<{ showBackground: boolean; isHomePage: boolean }>`
  display: grid;
  grid-template-columns: 230px 0fr 1fr;
  align-items: center;
  height: 96px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding: 1rem;
  z-index: 21;
  position: relative;
  background: ${({ theme }) => theme.bg0};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:  1rem;
    grid-template-columns: 275px 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 1rem;
  `}
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 15px;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg0};
  `};
`;

const HeaderElement = styled.div`
  height: 56px;
  display: flex;
  align-items: center;
  width: 193px;
  font-family: Montserrat;
  background: ${({ theme }) => theme.red2};
  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row-reverse;
    align-items: center;
  `};
`;

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`;

const HeaderLinks = styled(Row)`
  margin-left: 4%;
  width: fit-content;
  padding: 4px;
  border-radius: 10px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  overflow: auto;
  font-size: 20px;
  font-weight: 400;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: flex-end;
  `};
  .ACTIVE {
    color: rgba(39, 227, 171, 1);
  }
`;

export const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  padding: 0px 20px;
  align-items: center;
  background: ${({ theme }) => theme.red2};
  border: none;
  white-space: nowrap;
  cursor: pointer;
  height: 100%;
  button {
    border: none;
    p {
      color: ${({ theme }) => theme.text1};
      font-family: Montserrat;
      font-size: 16px;
      font-weight: 500;
    }
    div {
      height: 30px !important;
      width: 30px !important;
    }
    :hover {
      background: ${({ theme }) => theme.red2};
      border: none;
      box-shadow: none;
    }
  }
`;

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`;

const HideLarge = styled.span`
  @media screen and (min-width: 700px) {
    display: none !important;
  }
`;

const Title = styled(Link)`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`;

const activeClassName = 'ACTIVE';

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 10px;
  outline: none;
  font-family: Russo One;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  width: fit-content;
  font-weight: 400;
  padding: 8px 12px;

  &.${activeClassName} {
    border-radius: 0px;
    color: rgba(39, 227, 171, 1);
  }

  :hover, ;
  // :focus {
  //   color: ${({ theme }) => theme.primary2};
  // }
`;

export const StyledLink = styled.a.attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.primary1};
  font-size: 1rem;
  width: fit-content;
  font-weight: 700;
  padding: 8px 12px;

  &.${activeClassName} {
    border-radius: 0px;
    color: ${({ theme }) => theme.primary1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
`;

// const StyledExternalLink = styled(ExternalLink).attrs({
//   activeClassName,
// })<{ isActive?: boolean }>`
//   ${({ theme }) => theme.flexRowNoWrap}
//   align-items: left;
//   border-radius: 3rem;
//   outline: none;
//   cursor: pointer;
//   text-decoration: none;
//   color: ${({ theme }) => theme.primary1};
//   font-size: 1rem;
//   width: fit-content;
//   margin: 0 12px;
//   font-weight: 500;

//   &.${activeClassName} {
//     border-radius: 0px;
//     font-weight: 800;
//     color: ${({ theme }) => theme.primary1};
//   }

//   :hover,
//   :focus {
//     text-decoration: none;
//     color: ${({ theme }) => darken(0.1, theme.primary1)};
//   }

//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//       display: none;
// `}
// `

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg0};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    border: ${({ theme }) => `1px solid ${theme.primary1}`};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.primary1};
  }
`;

const DropDownContainer = styled('div')`
  width: 190px;
  margin: 0 auto;
`;

const DropDownHeader = styled('div')`
  font-weight: 500;
  font-size: 16px;
  height: 56px;
  color: ${({ theme }) => theme.text1};
  background: rgba(30, 30, 30, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const DropDownListContainer = styled('div')`
  position: absolute;
  margin-top: 10px;
  z-index: 2;
`;

const Overlay = styled('div')`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
`;

const DropDownList = styled('ul')`
  padding: 10px;
  width: 190px;
  margin: 0;
  padding-left: 1em;
  background: rgba(30, 30, 30, 1);
  box-sizing: border-box;
  color: ${({ theme }) => theme.text1};
  font-weight: 500;
  font-size: 16px;
  li {
    display: flex;
    align-items: center;
    justify-content: start;
    margin-bottom: 20px;
    cursor: pointer;
  }
  li:last-child {
    margin-bottom: 0px;
  }
`;

const ListItem = styled('li')`
  list-style: none;
  margin-bottom: 0.8em;
`;

export default function Header() {
  const { account } = useActiveWeb3React();
  const location = useLocation();
  const options = [
    { icon: LineaIcon, value: 'Scroll Testnet' },
    { icon: LineaIcon, value: 'Scroll Mainnet' },
  ];
  // const [isBridgeOpen, setIsBridgeOpen] = useState(false)

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? ''];
  // const [isDark] = useDarkModeManager()

  // const [showUniBalanceModal, setShowUniBalanceModal] = useState(false)

  const scrollY = useScrollPosition();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options?.[0]);

  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = (value: any) => () => {
    setSelectedOption(value);
    setIsOpen(false);
    console.log(selectedOption);
  };

  return (
    <HeaderFrame showBackground={scrollY > 45} isHomePage={location.pathname === '/'}>
      {/* <Modal isOpen={showUniBalanceModal} onDismiss={() => setShowUniBalanceModal(false)}>
        <UniBalanceContent setShowUniBalanceModal={setShowUniBalanceModal} />
      </Modal> */}
      <HeaderRow>
        <Title to='/'>
          <img src={Logo} />
        </Title>
      </HeaderRow>
      <HideSmall>
        <HeaderLinks>
          <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
            Swap
          </StyledNavLink>
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/pool'}
            isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith('/add') ||
              pathname.startsWith('/remove') ||
              pathname.startsWith('/increase') ||
              pathname.startsWith('/find')
            }
          >
            Pools
          </StyledNavLink>
          {/* <StyledLink href='https://app.brownfi.app/stake' target='_blank' rel='noreferrer'>
            Stake
          </StyledLink>
          <StyledLink href='https://app.brownfi.app/farm' target='_blank' rel='noreferrer'>
            Farm
          </StyledLink>
          <StyledNavLink
            id={`assets-nav-link`}
            to={'/assets'}
            isActive={(match, { pathname }) => Boolean(match) || pathname.startsWith('/assets')}
          >
            My Assets
          </StyledNavLink> */}
        </HeaderLinks>
      </HideSmall>

      <HeaderControls>
        <DropDownContainer>
          <DropDownHeader onClick={toggling}>
            {
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <img src={selectedOption?.icon} style={{ width: '28px', height: '28px' }} />
                {selectedOption?.value} &nbsp;
                <img src={!isOpen ? CollaseIconDown : CollaseIconUp} />
              </div>
            }
          </DropDownHeader>
          {isOpen && (
            <DropDownListContainer>
              <DropDownList>
                {options.map((option) => (
                  <ListItem onClick={onOptionClicked(option)} key={Math.random()}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img src={option?.icon} style={{ width: '24px', height: '24px' }} />
                      {option?.value}
                      {selectedOption?.value === option?.value && (
                        <img src={TickIcon} style={{ width: '14px', height: '11px' }} />
                      )}
                    </div>
                  </ListItem>
                ))}
              </DropDownList>
            </DropDownListContainer>
          )}
        </DropDownContainer>
        {isOpen ? <Overlay onClick={() => setIsOpen(false)} /> : null}

        <HeaderElement>
          {/* <HideSmall>
            {chainId && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )}
          </HideSmall> */}
          <AccountElement active={!!account} style={{ pointerEvents: 'auto', height: '100%' }}>
            {/* {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl='0.75rem' pr='0.5rem' fontWeight={500}>
                {userEthBalance?.toSignificant(4)} <span>BNB</span>
              </BalanceText>
            ) : null} */}
            <Web3Status />
          </AccountElement>
        </HeaderElement>

        <HeaderElementWrap>
          <HideLarge>
            <MobileMenu />
          </HideLarge>
        </HeaderElementWrap>
        {/* <HeaderElementWrap>
          <Menu />
        </HeaderElementWrap> */}
      </HeaderControls>
    </HeaderFrame>
  );
}
