import invariant from 'tiny-invariant';

import TokenImg from '../assets/images/ethereum-logo.png';
import { NativeCurrency } from '../sdk-core/entities/nativeCurrency';
import { Token } from '../sdk-core/entities/token';

import { WETH9_ADDRESS } from './addresses';
import { ChainId } from './chains';

export const WETH = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, WETH9_ADDRESS[ChainId.MAINNET], 18, 'WETH', 'WETH', TokenImg),
  [ChainId.TESTNET]: new Token(ChainId.TESTNET, WETH9_ADDRESS[ChainId.TESTNET], 18, 'WETH', 'WETH', TokenImg),
};
export const WETH9 = WETH;

export class Eth extends NativeCurrency {
  protected constructor(chainId: number) {
    super(chainId, 18, 'ETH', 'ETH');
  }

  public get wrapped(): Token {
    const weth9 = WETH[this.chainId as ChainId];
    invariant(!!weth9, 'WRAPPED');
    return weth9;
  }

  private static _etherCache: { [chainId: number]: Eth } = {};

  public static onChain(chainId: number): Eth {
    return this._etherCache[chainId] ?? (this._etherCache[chainId] = new Eth(chainId));
  }

  public equals(other: NativeCurrency | Token): boolean {
    return other.isNative && other.chainId === this.chainId;
  }
}
