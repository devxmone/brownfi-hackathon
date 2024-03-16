import styled from 'styled-components/macro';
import { Currency, currencyEquals, Token } from '@uniswap/sdk-core';
import { Text } from 'rebass';

import { CurrencyLogoFromList } from 'components/CurrencyLogo/CurrencyLogoFromList';

import { ChainId } from 'constants/chains';

import { SUGGESTED_BASES } from '../../constants/routing';
import { ETH, Eth } from '../../constants/tokens';
import { AutoColumn } from '../Column';
import CurrencyLogo from '../CurrencyLogo';
import { AutoRow } from '../Row';

const BaseWrapper = styled.div<{ disable?: boolean }>`
  border: 1px solid ${({ theme, disable }) => (disable ? 'rgba(50, 49, 53, 1)' : 'rgba(50, 49, 53, 1)')};
  display: flex;
  padding: 5px 10px;
  align-items: center;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    background: rgba(11, 14, 25, 0.12);
  }
  background-color: ${({ theme, disable }) => (disable ? theme.primary2 : theme.primary2)};
  opacity: ${({ disable }) => disable && '0.4'};
`;

export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency,
}: {
  chainId?: ChainId;
  selectedCurrency?: Currency | null;
  onSelect: (currency: Currency) => void;
}) {
  return (
    <AutoColumn gap='md'>
      {/* <AutoRow>
        <Text fontWeight={500} fontSize={14}>
          Common bases
        </Text>
        <QuestionHelper text='These tokens are commonly paired with other tokens.' />
      </AutoRow> */}
      <AutoRow gap='4px'>
        <BaseWrapper
          onClick={() => {
            if (chainId) {
              const photon = Eth.onChain(chainId || ChainId.MAINNET);
              if (!selectedCurrency || !currencyEquals(selectedCurrency, photon)) {
                onSelect(photon);
              }
            }
          }}
          disable={selectedCurrency?.isNative}
        >
          <CurrencyLogo currency={ETH} style={{ marginRight: 8 }} />
          <Text fontWeight={500} fontSize={14} fontFamily='Montserrat'>
            {ETH.symbol}
          </Text>
        </BaseWrapper>
        {(typeof chainId === 'number' ? SUGGESTED_BASES[chainId] ?? [] : []).map((token: Token) => {
          const selected = selectedCurrency?.isToken && selectedCurrency.address === token.address;
          return (
            <BaseWrapper onClick={() => !selected && onSelect(token)} disable={selected} key={token.address}>
              <CurrencyLogoFromList currency={token} style={{ marginRight: 8 }} />
              <Text fontWeight={500} fontSize={14} fontFamily='Montserrat'>
                {token.symbol}
              </Text>
            </BaseWrapper>
          );
        })}
      </AutoRow>
    </AutoColumn>
  );
}
