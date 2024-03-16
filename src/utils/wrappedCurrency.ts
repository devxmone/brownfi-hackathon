import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core';
import invariant from 'tiny-invariant';

import { ChainId } from 'constants/chains';
import { ETH, WETH } from 'constants/tokens';

import { supportedChainId } from './supportedChainId';

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency ? wrappedCurrencyInternal(currency, chainId) : undefined;
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount<Currency> | undefined,
  chainId: ChainId | undefined,
): CurrencyAmount<Token> | undefined {
  return currencyAmount && chainId ? wrappedCurrencyAmountInternal(currencyAmount, chainId) : undefined;
}

export function unwrappedToken(token: Token): Currency {
  if (token?.isNative) return token;
  const formattedChainId = supportedChainId(token?.chainId);
  if (formattedChainId && token.equals(WETH[formattedChainId])) return ETH;
  return token;
}

/**
 * Source: https://github.com/Uniswap/sdk-core/blob/d61d31e5f6e79e174f3e4226c04e8c5cfcf3e227/src/utils/wrappedCurrency.ts
 */
function wrappedCurrencyInternal(currency: Currency, chainId: ChainId): Token {
  if (currency.isToken) {
    invariant(currency.chainId === chainId, 'CHAIN_ID');
    return currency;
  }
  if (currency.isNative) return WETH[chainId];
  throw new Error('CURRENCY');
}

/**
 * Source: https://github.com/Uniswap/sdk-core/blob/d61d31e5f6e79e174f3e4226c04e8c5cfcf3e227/src/utils/wrappedCurrencyAmount.ts
 */
function wrappedCurrencyAmountInternal(
  currencyAmount: CurrencyAmount<Currency>,
  chainId: ChainId,
): CurrencyAmount<Token> {
  return CurrencyAmount.fromFractionalAmount(
    wrappedCurrencyInternal(currencyAmount.currency, chainId),
    currencyAmount.numerator,
    currencyAmount.denominator,
  );
}
