import { useState } from 'react';

import styled from 'styled-components/macro';

import { ButtonPrimary } from 'components/Button';
import { AutoColumn } from 'components/Column';
import Modal from 'components/Modal';
import { RowBetween } from 'components/Row';
import { Checkbox } from 'components/SearchModal/styleds';

import { TYPE } from 'theme';

const LS_KEY = 'diff:disclaimer-accepted';

export function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(!localStorage.getItem(LS_KEY));
  const [confirmed, setConfirmed] = useState(false);
  if (!isOpen) {
    return null;
  }
  return (
    <Modal
      isOpen
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onDismiss={() => {}}
      maxHeight={90}
      css={`
        max-width: 550px;
      `}
    >
      <Wrapper
        css={`
          overflow: scroll;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        `}
      >
        <ContentWrapper gap='lg'>
          <RowBetween>
            <TYPE.mediumHeader>Before we begin</TYPE.mediumHeader>
          </RowBetween>
          <RowBetween>
            <div style={{ fontSize: '12px' }}>
              <p>
                BrownFi Finance is a decentralized peer-to-peer protocol that people can use to create liquidity and
                trade ERC-20 tokens on Eth. This website is a public and free interface to help users interact with the
                decentralized DEX smart contracts that are deployed on the Eth Blockchain. Your use of the BrownFi
                protocol involves various risks, including, but not limited to, losses while digital assets are being
                supplied to the BrownFi protocol and losses due to the fluctuation of prices of tokens in a trading pair
                or liquidity pool. Before using the BrownFi protocol, you should review the relevant documentation to
                make sure you understand how the BrownFi protocol works. Additionally, just as you can access email
                protocols such as SMTP through multiple email clients, you can access the BrownFi protocol through
                dozens of web or mobile interfaces. You are responsible for doing your own diligence on those interfaces
                to understand the fees and risks they present.
              </p>
              <p>
                THE BrownFi PROTOCOL IS PROVIDED &quot;AS IS&quot;, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY
                KIND. The BrownFi protocol is not owned by anyone, it is run by smart contracts deployed on the Eth
                blockchain. No developer or entity involved in creating the BrownFi protocol will be liable for any
                claims or damages whatsoever associated with your use, inability to use, or your interaction with other
                users of, the BrownFi protocol, including any direct, indirect, incidental, special, exemplary, punitive
                or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value. The
                BrownFi protocol is not a financial product and should not be treated as such. Furthermore, the smart
                contracts, although tested before deployment, are not audited and therefore may contain bugs.
              </p>
            </div>
          </RowBetween>
          <RowBetween>
            <div style={{ display: 'flex' }}>
              <Checkbox
                name='confirmed'
                type='checkbox'
                checked={confirmed}
                onChange={() => setConfirmed(!confirmed)}
              />
              <TYPE.body ml='10px' fontSize='16px' fontWeight={500}>
                I understand the risks and would like to proceed
              </TYPE.body>
            </div>
          </RowBetween>
          <RowBetween>
            <ButtonPrimary
              disabled={!confirmed}
              onClick={() => {
                localStorage.setItem(LS_KEY, 'true');
                setIsOpen(false);
              }}
            >
              Proceed
            </ButtonPrimary>
          </RowBetween>
        </ContentWrapper>
      </Wrapper>
    </Modal>
  );
}

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`;

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`;
