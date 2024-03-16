import { useMemo } from 'react'

import { CurrencyAmount,Token } from '@uniswap/sdk-core'

import { useSingleCallResult } from '../state/multicall/hooks'

import { useTokenContract } from './useContract'

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): CurrencyAmount<Token> | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const callResult = useSingleCallResult(contract, 'allowance', inputs)

  const allowance = callResult.result

  return useMemo(() => {
    if (token && allowance) {
      const parsed = CurrencyAmount.fromRawAmount(token, allowance.toString())
      return parsed
    }
    return undefined
  }, [token, allowance])
}
