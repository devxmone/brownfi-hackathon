import { useContext, useRef, useState } from 'react';
import { Settings, X } from 'react-feather';
import ReactGA from 'react-ga';

import styled, { ThemeContext } from 'styled-components';
import { Percent } from '@uniswap/sdk-core';
import { Text } from 'rebass';

import { ButtonConfirmed } from 'components/Button';

import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { ApplicationModal } from '../../state/application/actions';
import { useModalOpen, useToggleSettingsMenu } from '../../state/application/hooks';
import { useExpertModeManager, useUserSingleHopOnly } from '../../state/user/hooks';
import { TYPE } from '../../theme';
import { AutoColumn } from '../Column';
import Modal from '../Modal';
import QuestionHelper from '../QuestionHelper';
import { RowBetween, RowFixed } from '../Row';
import Toggle from '../Toggle';
import TransactionSettings from '../TransactionSettings';

const StyledMenuIcon = styled(Settings)`
  height: 20px;
  width: 20px;

  > * {
    stroke: ${({ theme }) => theme.text1};
  }

  :hover {
    opacity: 0.7;
  }
`;

const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.primary1};
  }
`;

const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  border-radius: 0.5rem;
  height: 20px;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }
`;
const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;
`;

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`;

const MenuFlyout = styled.span`
  min-width: 20.125rem;
  width: 391px;
  background: ${({ theme }) => theme.primary4};
  border:${({ theme }) => `1px solid ${theme.primary4}`}
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 2rem;
  right: 0rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 18.125rem;
  `};

  user-select: none;
`;

const Break = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.text2};
`;

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  background-color: ${({ theme }) => theme.primary4};
  color: ${({ theme }) => theme.primary1};
`;

export default function SettingsTab({ placeholderSlippage }: { placeholderSlippage: Percent }) {
  const node = useRef<HTMLDivElement>();
  const open = useModalOpen(ApplicationModal.SETTINGS);
  const toggle = useToggleSettingsMenu();

  const theme = useContext(ThemeContext);

  const [expertMode, toggleExpertMode] = useExpertModeManager();

  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly();

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false);

  useOnClickOutside(node, open ? toggle : undefined);

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
        <ModalContentWrapper>
          <AutoColumn gap='lg'>
            <RowBetween style={{ padding: '0 2rem' }}>
              <div />
              <Text fontWeight={500} fontSize={20} color={theme.text1}>
                Are you sure?
              </Text>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </RowBetween>
            <Break />
            <AutoColumn gap='lg' style={{ padding: '0 2rem' }}>
              <Text fontWeight={500} fontSize={18} color={theme.text1}>
                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                in bad rates and lost funds.
              </Text>
              <Text fontWeight={600} fontSize={20} color={theme.text1}>
                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
              </Text>
              <ButtonConfirmed
                padding={'12px'}
                onClick={() => {
                  if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
                    toggleExpertMode();
                    setShowConfirmation(false);
                  }
                }}
              >
                <Text fontSize={20} fontWeight={500} color={theme.text1} id='confirm-expert-mode'>
                  Turn On Expert Mode
                </Text>
              </ButtonConfirmed>
            </AutoColumn>
          </AutoColumn>
        </ModalContentWrapper>
      </Modal>
      <StyledMenuButton onClick={toggle} id='open-settings-dialog-button'>
        <StyledMenuIcon />
        {expertMode ? (
          <EmojiWrapper>
            <span role='img' aria-label='wizard-icon'>
              🧙
            </span>
          </EmojiWrapper>
        ) : null}
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap='md' style={{ padding: '25px' }}>
            <Text fontWeight={400} fontSize={18} color={theme.text1} fontFamily='Russo One'>
              Transaction Settings
            </Text>
            <TransactionSettings placeholderSlippage={placeholderSlippage} />
            <Text
              style={{ marginTop: '5px' }}
              fontWeight={400}
              fontSize={18}
              color={theme.text1}
              fontFamily={'Russo One'}
            >
              Interface Settings
            </Text>
            <RowBetween style={{ marginTop: '5px' }}>
              <RowFixed>
                <TYPE.black fontWeight={500} fontSize={16} color={theme.text1}>
                  Toggle Expert Mode
                </TYPE.black>
                <QuestionHelper text='Allow high price impact trades and skip the confirm screen. Use at your own risk.' />
              </RowFixed>
              <Toggle
                id='toggle-expert-mode-button'
                isActive={expertMode}
                toggle={
                  expertMode
                    ? () => {
                        toggle();
                        toggleExpertMode();
                        setShowConfirmation(false);
                      }
                    : () => {
                        toggle();
                        setShowConfirmation(true);
                      }
                }
              />
            </RowBetween>
            <RowBetween style={{ marginTop: '5px' }}>
              <RowFixed>
                <TYPE.black fontWeight={500} fontSize={16} color={theme.text1}>
                  Disable Multihops
                </TYPE.black>
                <QuestionHelper text='Restricts swaps to direct pairs only.' />
              </RowFixed>
              <Toggle
                id='toggle-disable-multihop-button'
                isActive={singleHopOnly}
                toggle={() => {
                  ReactGA.event({
                    category: 'Routing',
                    action: singleHopOnly ? 'disable single hop' : 'enable single hop',
                  });
                  setSingleHopOnly(!singleHopOnly);
                }}
              />
            </RowBetween>
          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  );
}
