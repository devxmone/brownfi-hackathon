import { ComponentPropsWithoutRef, useMemo } from 'react';

import styled from 'styled-components/macro';
import { Currency } from '@uniswap/sdk-core';

import { ChainId } from 'constants/chains';

import NativeLogo from '../../assets/images/bnb.png';
import useHttpLocations from '../../hooks/useHttpLocations';
import { WrappedTokenInfo } from '../../state/lists/wrappedTokenInfo';
import Logo from '../Logo';

export const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;

const StyledNativeLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
  object-fit: cover;
`;

export const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  object-fit: cover;
`;

export type CurrencyLogoProps = {
  currency?: Currency;
  size?: string;
  title?: string;
  style?: any;
} & ComponentPropsWithoutRef<'img'>;

export default function CurrencyLogo({ currency, size = '24px', style, ...rest }: CurrencyLogoProps) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined);

  const srcs: string[] = useMemo(() => {
    if (!currency || currency.isNative) return [];

    if (currency.isToken) {
      const defaultUrls = currency.chainId === ChainId.MAINNET ? [getTokenLogoURL(currency.address)] : [];
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, currency?.logoURI || '', ...defaultUrls];
      }
      return [currency?.logoURI || '', ...defaultUrls];
    }
    return [];
  }, [currency, uriLocations]);

  if (currency?.isNative) {
    return <StyledNativeLogo src={NativeLogo} size={size} style={style} {...rest} />;
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} {...rest} />;
}
