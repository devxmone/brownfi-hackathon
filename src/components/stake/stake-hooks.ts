import JSBI from 'jsbi';

import { useTotalSupply } from 'hooks/useTotalSupply';
import { useActiveWeb3React } from 'hooks/web3';
import { useTokenBalance } from 'state/wallet/hooks';

import { TOKEN_BAR_ADDRESS } from 'constants/addresses';
import { ChainIdValue } from 'constants/chains';
import { APPTOKEN, XAPPTOKEN } from 'constants/tokens';

import { Currency, CurrencyAmount } from 'sdk-core/entities';

const DAILY_EMITTED_DIFF = JSBI.BigInt(62500);
const YEARLY_EMITTED_DIFF = JSBI.multiply(DAILY_EMITTED_DIFF, JSBI.BigInt(365));

export function useEarnedDiff(xDiffBalance?: CurrencyAmount<Currency>) {
  const { chainId } = useActiveWeb3React();
  const totalDiffusionToDistribute = useTokenBalance(
    chainId ? TOKEN_BAR_ADDRESS[chainId as ChainIdValue] : undefined,
    chainId ? APPTOKEN[chainId as ChainIdValue] : undefined,
  );
  const totalXDiff = useTotalSupply(chainId ? XAPPTOKEN[chainId as ChainIdValue] : undefined);

  if (totalXDiff?.greaterThan('0') && xDiffBalance) {
    return totalDiffusionToDistribute?.multiply(xDiffBalance).divide(totalXDiff);
  }
  return undefined;
}

export function useStakingAPY() {
  const { chainId } = useActiveWeb3React();

  const yearlyEmission = chainId
    ? CurrencyAmount.fromRawAmount(APPTOKEN[chainId as ChainIdValue], YEARLY_EMITTED_DIFF).multiply(
        JSBI.BigInt(10 ** 18),
      )
    : undefined;

  console.log('yearlyEmission', yearlyEmission?.toSignificant());

  const totalXDiff = useTotalSupply(chainId ? XAPPTOKEN[chainId as ChainIdValue] : undefined);
  console.log('TotalXDiff', totalXDiff?.toSignificant());
  if (yearlyEmission && totalXDiff && JSBI.greaterThan(totalXDiff.quotient, JSBI.BigInt('0'))) {
    return JSBI.divide(JSBI.multiply(yearlyEmission.quotient, JSBI.BigInt(100)), totalXDiff.quotient);
  }
  return undefined;
}
