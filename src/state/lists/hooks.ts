import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { TokenList } from '@uniswap/token-lists';

import sortByListPriority from 'utils/listSort';

import { AppState } from '../index';

import { ChainId } from './../../constants/chains';
import { UNSUPPORTED_LIST_URLS } from './../../constants/lists';
import { WrappedTokenInfo } from './wrappedTokenInfo';

export type TokenAddressMap = Readonly<{
  [chainId in ChainId | number]: Readonly<{ [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList } }>;
}>;

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.MAINNET]: {},
  [ChainId.TESTNET]: {},
};

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null;

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list);
  if (result) return result;

  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const token = new WrappedTokenInfo(tokenInfo, list);
      if (!tokenMap[token.chainId]) {
        console.warn(`Trying to add token for unsuppored chain: ${token.chainId}`);
        return tokenMap;
      }
      if (tokenMap[token.chainId][token.address] !== undefined) {
        console.error(new Error(`Duplicate token! ${token.address}`));
        return tokenMap;
      }
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId as ChainId],
          [token.address]: {
            token,
            list,
          },
        },
      };
    },
    { ...EMPTY_LIST },
  );
  listCache?.set(list, map);
  return map;
}

const TRANSFORMED_DEFAULT_TOKEN_LIST = listToTokenMap({ tokens: [] } as unknown as TokenList);

export function useAllLists(): AppState['lists']['byUrl'] {
  return useSelector<AppState, AppState['lists']['byUrl']>((state) => state.lists.byUrl);
}

function combineMaps(map1: TokenAddressMap, map2: TokenAddressMap): TokenAddressMap {
  return {
    [ChainId.MAINNET]: { ...map1[ChainId.MAINNET], ...map2[ChainId.MAINNET] },
    [ChainId.TESTNET]: { ...map1[ChainId.TESTNET], ...map2[ChainId.TESTNET] },
  };
}

// merge tokens contained within lists from urls
function useCombinedTokenMapFromUrls(urls: string[] | undefined): TokenAddressMap {
  const lists = useAllLists();
  return useMemo(() => {
    if (!urls) return EMPTY_LIST;
    return (
      urls
        .slice()
        // sort by priority so top priority goes last
        .sort(sortByListPriority)
        .reduce((allTokens, currentUrl) => {
          // const current = lists[currentUrl]?.current;
          const current = {
            name: 'SumoSwap List',
            timestamp: '2023-08-17T00:30:00.000Z',
            logoURI: 'https://sumoswap.com/favicon.ico',
            version: {
              major: 10,
              minor: 0,
              patch: 1,
            },
            tokens: [
              {
                name: 'TEST02',
                address: '0x82dA7E68e20b6d19d3763224FC9BC3B424575c84',
                symbol: 'TEST02',
                decimals: 18,
                chainId: 59140,
                logoURI: 'https://raw.githubusercontent.com/SumoSwapOfficial/tokenlist/main/logos/bnb.png',
              },
              {
                name: 'TEST01',
                address: '0xF460E6DF3Ce8fe32625dE484805129EE2dC399a5',
                symbol: 'TEST01',
                decimals: 18,
                chainId: 59140,
                logoURI: 'https://raw.githubusercontent.com/SumoSwapOfficial/tokenlist/main/logos/bnbrats.png',
              },
            ],
          };

          if (!current) return allTokens;
          try {
            const combined = combineMaps(allTokens, listToTokenMap(current));
            return combined;
          } catch (error) {
            console.error('Could not show token list due to error', error);
            return allTokens;
          }
        }, EMPTY_LIST)
    );
  }, [lists, urls]);
}

// filter out unsupported lists
export function useActiveListUrls(): string[] | undefined {
  return useSelector<AppState, AppState['lists']['activeListUrls']>((state) => state.lists.activeListUrls)?.filter(
    (url) => !UNSUPPORTED_LIST_URLS.includes(url),
  );
}

export function useInactiveListUrls(): string[] {
  const lists = useAllLists();
  const allActiveListUrls = useActiveListUrls();
  return Object.keys(lists).filter((url) => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS.includes(url));
}

// get all the tokens from active lists, combine with local default tokens
export function useCombinedActiveList(): TokenAddressMap {
  const activeListUrls = useActiveListUrls();
  const activeTokens = useCombinedTokenMapFromUrls(activeListUrls);
  return combineMaps(activeTokens, TRANSFORMED_DEFAULT_TOKEN_LIST);
}

// list of tokens not supported on interface, used to show warnings and prevent swaps and adds
export function useUnsupportedTokenList(): TokenAddressMap {
  // get hard coded unsupported tokens
  const localUnsupportedListMap = listToTokenMap({ tokens: [] } as unknown as TokenList);

  // get any loaded unsupported tokens
  const loadedUnsupportedListMap = useCombinedTokenMapFromUrls(UNSUPPORTED_LIST_URLS);

  // format into one token address map
  return useMemo(
    () => combineMaps(localUnsupportedListMap, loadedUnsupportedListMap),
    [localUnsupportedListMap, loadedUnsupportedListMap],
  );
}

export function useIsListActive(url: string): boolean {
  const activeListUrls = useActiveListUrls();
  return Boolean(activeListUrls?.includes(url));
}
