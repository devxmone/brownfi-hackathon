import { ChangeEvent, KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import styled from 'styled-components/macro';
import { Currency, Token } from '@uniswap/sdk-core';
import { Text } from 'rebass';

import useDebounce from 'hooks/useDebounce';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import useTheme from 'hooks/useTheme';
import useToggle from 'hooks/useToggle';

import { ChainId } from 'constants/chains';

import { Eth } from '../../constants/tokens';
import { useAllTokens, useIsUserAddedToken, useSearchInactiveTokenLists, useToken } from '../../hooks/Tokens';
import { useActiveWeb3React } from '../../hooks/web3';
import { CloseIcon, TYPE } from '../../theme';
import { isAddress } from '../../utils';
import Column from '../Column';
import Row, { RowBetween } from '../Row';

import CommonBases from './CommonBases';
import CurrencyList from './CurrencyList';
import { filterTokens, useSortedTokensByQuery } from './filtering';
import ImportRow from './ImportRow';
import { useTokenComparator } from './sorting';
import { AssetList, PaddedColumn, SearchInput } from './styleds';

const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;
  background-color: ${({ theme }) => theme.primary4};
  color: ${({ theme }) => theme.text1};
`;

const Footer = styled.div`
  width: 100%;
  border-radius: 20px;
  padding: 20px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: ${({ theme }) => theme.bg0};
  border-top: 1px solid ${({ theme }) => theme.bg0};
`;

interface CurrencySearchProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
  showManageView: () => void;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  showManageView,
  showImportView,
  setImportToken,
}: CurrencySearchProps) {
  const { chainId } = useActiveWeb3React();
  const theme = useTheme();

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, 200);

  const [invertSearchOrder] = useState<boolean>(false);

  const allTokens = useAllTokens();

  // if they input an address, use it
  const isAddressSearch = isAddress(debouncedQuery);

  const searchToken = useToken(debouncedQuery);

  const searchTokenIsAdded = useIsUserAddedToken(searchToken);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(allTokens), debouncedQuery);
  }, [allTokens, debouncedQuery]);

  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator);
  }, [filteredTokens, tokenComparator]);

  const filteredSortedTokens = useSortedTokensByQuery(sortedTokens, debouncedQuery);

  const filteredSortedTokensWithETH: Currency[] = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim();
    if (['c', 'ca', 'can', 'cant', 'bone'].includes(s)) {
      return [Eth.onChain(chainId || ChainId.MAINNET), ...filteredSortedTokens];
    }
    return filteredSortedTokens;
  }, [chainId, debouncedQuery, filteredSortedTokens]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect],
  );

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('');
  }, [isOpen]);

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
    fixedList.current?.scrollTo(0);
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim();
        if (s === 'bone' && chainId) {
          handleCurrencySelect(Eth.onChain(chainId));
        } else if (filteredSortedTokensWithETH.length > 0) {
          if (
            filteredSortedTokensWithETH[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokensWithETH.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokensWithETH[0]);
          }
        }
      }
    },
    [debouncedQuery, filteredSortedTokensWithETH, handleCurrencySelect, chainId],
  );

  // menu ui
  const [open, toggle] = useToggle(false);
  const node = useRef<HTMLDivElement>();
  useOnClickOutside(node, open ? toggle : undefined);

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(
    filteredTokens.length === 0 || (debouncedQuery.length > 2 && !isAddressSearch) ? debouncedQuery : undefined,
  );

  return (
    <ContentWrapper>
      <PaddedColumn gap='16px'>
        <RowBetween>
          <Text fontWeight={400} fontSize={24}>
            Select Asset
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <Row>
          <SearchInput
            type='text'
            id='token-search-input'
            placeholder='Search'
            autoComplete='off'
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            onKeyDown={handleEnter}
          />
        </Row>
        {showCommonBases && (
          <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
        )}
      </PaddedColumn>
      <AssetList>
        <div>Asset</div>
        <div>Balance</div>
      </AssetList>
      {searchToken && !searchTokenIsAdded ? (
        <Column style={{ padding: '20px 0', height: '100%' }}>
          <ImportRow token={searchToken} showImportView={showImportView} setImportToken={setImportToken} />
        </Column>
      ) : filteredSortedTokens?.length > 0 || filteredInactiveTokens?.length > 0 ? (
        <div style={{ flex: '1', width: '428px', margin: 'auto' }}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <CurrencyList
                height={height}
                currencies={filteredSortedTokensWithETH}
                otherListTokens={filteredInactiveTokens}
                onCurrencySelect={handleCurrencySelect}
                otherCurrency={otherSelectedCurrency}
                selectedCurrency={selectedCurrency}
                fixedListRef={fixedList}
                showImportView={showImportView}
                setImportToken={setImportToken}
              />
            )}
          </AutoSizer>
        </div>
      ) : (
        <Column style={{ padding: '20px', height: '100%' }}>
          <TYPE.main color={theme.text1} textAlign='center' mb='20px' fontFamily='Montserrat' fontSize='14px'>
            No results found.
          </TYPE.main>
        </Column>
      )}
      {/* <Footer>
        <Row justify='center'>
          <ButtonText onClick={showManageView} color={theme.blue1} className='list-token-manage-button'>
            <RowFixed>
              <IconWrapper size='16px' marginRight='6px'>
                <Edit />
              </IconWrapper>
              <TYPE.main color={theme.blue1}>Manage Token Lists</TYPE.main>
            </RowFixed>
          </ButtonText>
        </Row>
      </Footer> */}
    </ContentWrapper>
  );
}
