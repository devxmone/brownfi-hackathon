import { useMemo } from 'react';

import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core';

import HoverInlineText from 'components/HoverInlineText';

import useTheme from '../../hooks/useTheme';
import { TYPE } from '../../theme';
import { warningSeverity } from '../../utils/prices';

export function FiatValue({
  fiatValue,
  priceImpact,
}: {
  fiatValue: CurrencyAmount<Currency> | null | undefined;
  priceImpact?: Percent;
}) {
  const theme = useTheme();
  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined;
    if (priceImpact.lessThan('0')) return theme.green1;
    const severity = warningSeverity(priceImpact);
    if (severity < 1) return theme.bg0;
    if (severity < 3) return theme.yellow1;
    return theme.red1;
  }, [priceImpact, theme.green1, theme.red1, theme.bg0, theme.yellow1]);

  return (
    <TYPE.body fontSize={14} color={theme.text2}>
      {fiatValue ? '~' : ''}$
      <HoverInlineText text={fiatValue ? fiatValue?.toSignificant(6, { groupSeparator: ',' }) : '-'} />{' '}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}> ({priceImpact.multiply(-1).toSignificant(3)}%)</span>
      ) : null}
    </TYPE.body>
  );
}
