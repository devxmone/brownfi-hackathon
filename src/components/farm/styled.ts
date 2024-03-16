import styled from 'styled-components/macro'

import { RowBetween } from 'components/Row'

import { AutoColumn } from '../Column'

export const TextBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  width: fit-content;
  justify-self: flex-end;
`

export const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  border-radius: 8px;
  width: 100%;
  position: relative;
  overflow: hidden;
`

export const CardBGImage = styled.span<{ desaturate?: boolean }>`
  width: 1000px;
  height: 600px;
  position: absolute;
  border-radius: 8px;
  opacity: 0.4;
  top: -260px;
  left: -100px;
  transform: rotate(-15deg);
  user-select: none;
`

export const CardNoise = styled.span`
  background-size: cover;
  mix-blend-mode: overlay;
  border-radius: 8px;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
`

export const CardSection = styled(AutoColumn)<{ disabled?: boolean }>`
  padding: 1rem;
  z-index: 1;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.primary1};
`

export const Break = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.primary1};
  height: 1px;
`

export const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;
  border-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

export const DataButtonRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;
  border-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`
