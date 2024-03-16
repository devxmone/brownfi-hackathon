import { Currency, CurrencyAmount } from '@uniswap/sdk-core';

export const USDCValue = ({ amount }: { amount: CurrencyAmount<Currency> }) => {
  return (
    <span style={{ color: '#F25A3B', fontSize: '14px', paddingLeft: '5px' }}>
      <span>$</span>
      {amount ? <span>{amount.toFixed(2, { groupSeparator: ',' })}</span> : `     `}
    </span>
  );
};
