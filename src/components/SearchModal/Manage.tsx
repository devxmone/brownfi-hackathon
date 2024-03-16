import { useState } from 'react';
import { ArrowLeft } from 'react-feather';

import styled from 'styled-components/macro';
import { Token } from '@uniswap/sdk-core';
import { TokenList } from '@uniswap/token-lists';
import { Text } from 'rebass';

import { RowBetween } from 'components/Row';

import { CloseIcon } from 'theme';

import { CurrencyModalView } from './CurrencySearchModal';
import { ManageLists } from './ManageLists';
import ManageTokens from './ManageTokens';
import { PaddedColumn, Separator } from './styleds';

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 80px;
`;

const ToggleWrapper = styled(RowBetween)`
  background-color: ${({ theme }) => theme.primary1};
  border-radius: 8px;
  padding: 6px;
`;

const ToggleOption = styled.div<{ active?: boolean }>`
  width: 48%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 600;
  background-color: ${({ theme, active }) => (active ? theme.bg0 : 'transparent')};
  color: ${({ theme, active }) => (active ? theme.primary1 : theme.bg0)};
  user-select: none;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;

export default function Manage({
  onDismiss,
  setModalView,
  setImportList,
  setImportToken,
  setListUrl,
}: {
  onDismiss: () => void;
  setModalView: (view: CurrencyModalView) => void;
  setImportToken: (token: Token) => void;
  setImportList: (list: TokenList) => void;
  setListUrl: (url: string) => void;
}) {
  // toggle between tokens and lists
  const [showLists, setShowLists] = useState(true);

  return (
    <Wrapper>
      <PaddedColumn>
        <RowBetween>
          <ArrowLeft style={{ cursor: 'pointer' }} onClick={() => setModalView(CurrencyModalView.search)} />
          <Text fontWeight={500} fontSize={20}>
            Manage
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
      </PaddedColumn>
      <Separator />
      <PaddedColumn style={{ paddingBottom: 0 }}>
        <ToggleWrapper>
          <ToggleOption onClick={() => setShowLists(!showLists)} active={showLists}>
            Lists
          </ToggleOption>
          <ToggleOption onClick={() => setShowLists(!showLists)} active={!showLists}>
            Tokens
          </ToggleOption>
        </ToggleWrapper>
      </PaddedColumn>
      {showLists ? (
        <ManageLists setModalView={setModalView} setImportList={setImportList} setListUrl={setListUrl} />
      ) : (
        <ManageTokens setModalView={setModalView} setImportToken={setImportToken} />
      )}
    </Wrapper>
  );
}
