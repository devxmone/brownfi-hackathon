import { Token } from '@uniswap/sdk-core';

import { ChainId } from 'constants/chains';

import TokenImg from '../assets/images/token.png';

import { Eth, WETH } from './native-token';
import { MAINNET, TESTNET } from './periphery';

export { Eth, WETH };

export const ETH = Eth.onChain(ChainId.MAINNET);

export const USDC = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, MAINNET.USDC, 6, 'USDC', 'USDC'),
  [ChainId.TESTNET]: new Token(ChainId.TESTNET, TESTNET.mockUSDC, 18, 'MUSDC', 'Mock USDC'),
};

export const APPTOKEN = makeToken(
  'BrownFi',
  'BROWN',
  18,
  {
    [ChainId.MAINNET]: MAINNET.appToken,
    [ChainId.TESTNET]: TESTNET.appToken,
  },
  TokenImg,
);

export const XAPPTOKEN = makeToken('xBROWN', 'xBROWN', 18, {
  [ChainId.MAINNET]: MAINNET.xappToken,
  [ChainId.TESTNET]: TESTNET.xappToken,
});

function makeToken(
  name: string,
  symbol: string,
  decimals: number,
  addresses: Record<ChainId, string>,
  logoURI?: string,
) {
  return {
    [ChainId.MAINNET]: new Token(ChainId.MAINNET, addresses[ChainId.MAINNET], decimals, symbol, name, logoURI),
    [ChainId.TESTNET]: new Token(
      ChainId.TESTNET,
      addresses[ChainId.TESTNET],
      decimals,
      `${symbol}`,
      `Testnet ${name}`,
      logoURI,
    ),
  };
}
