import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core';
import { Text } from 'rebass';

import { ButtonPrimary } from '../../components/Button';
import CurrencyLogo from '../../components/CurrencyLogo';
import Row, { RowBetween, RowFixed } from '../../components/Row';
import { Field } from '../../state/mint/actions';
import { TYPE } from '../../theme';

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
}: {
  noLiquidity?: boolean;
  price?: Fraction;
  currencies: { [field in Field]?: Currency };
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> };
  poolTokenPercentage?: Percent;
  onAdd: () => void;
}) {
  return (
    <>
      <Row
        style={{
          justifyContent: 'space-between',
          marginTop: '20px',
          backgroundColor: 'rgba(50, 48, 56, 1)',
          padding: '10px 20px',
        }}
      >
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <TYPE.body style={{ fontSize: '32px' }}>{currencies[Field.CURRENCY_A]?.symbol}</TYPE.body>
        </div>

        <RowFixed>
          <TYPE.body
            style={{
              fontSize: ' 32px',
            }}
          >
            {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
          </TYPE.body>
        </RowFixed>
      </Row>
      <Row style={{ justifyContent: 'space-between', backgroundColor: 'rgba(50, 48, 56, 1)', padding: '10px 20px' }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <TYPE.body style={{ fontSize: '32px' }}>{currencies[Field.CURRENCY_B]?.symbol}</TYPE.body>
        </div>
        <RowFixed>
          <TYPE.body
            style={{
              fontSize: ' 32px',
            }}
          >
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
          </TYPE.body>
        </RowFixed>
      </Row>
      <RowBetween>
        <TYPE.body>Parameter</TYPE.body>
        <TYPE.body>--</TYPE.body>
      </RowBetween>
      <RowBetween>
        <TYPE.body>LP price</TYPE.body>
        <TYPE.body>--</TYPE.body>
      </RowBetween>
      <RowBetween>
        <TYPE.body>Fee</TYPE.body>
        <TYPE.body>--</TYPE.body>
      </RowBetween>
      {/*       
      <RowBetween>
        <TYPE.body>Rates</TYPE.body>
        <TYPE.body>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
            currencies[Field.CURRENCY_B]?.symbol
          }`}
        </TYPE.body>
      </RowBetween>
      <RowBetween style={{ justifyContent: 'flex-end' }}>
        <TYPE.body>
          {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
            currencies[Field.CURRENCY_A]?.symbol
          }`}
        </TYPE.body>
      </RowBetween>
      <RowBetween>
        <TYPE.body>Share of Pool:</TYPE.body>
        <TYPE.body>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</TYPE.body>
      </RowBetween> */}
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        <Text fontWeight={500} fontSize={20}>
          {noLiquidity ? 'Create Pool & Supply' : 'Confirm'}
        </Text>
      </ButtonPrimary>
    </>
  );
}
