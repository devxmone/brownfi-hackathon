import styled from 'styled-components/macro';

import { AutoColumn } from '../Column';
import { RowBetween, RowFixed } from '../Row';

export const ModalInfo = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  flex: 1;
  user-select: none;
`;
export const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
`;

export const PopoverContainer = styled.div<{ show: boolean }>`
  z-index: 100;
  visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;
  background: ${({ theme }) => theme.bg0};
  border: 1px solid ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  color: ${({ theme }) => theme.primary1};
  border-radius: 0.5rem;
  padding: 1rem;
  display: grid;
  grid-template-rows: 1fr;
  grid-gap: 8px;
  font-size: 1rem;
  text-align: left;
  top: 80px;
`;

export const TextDot = styled.div`
  height: 3px;
  width: 3px;
  background-color: ${({ theme }) => theme.primary1};
  border-radius: 50%;
`;

export const FadedSpan = styled(RowFixed)`
  color: ${({ theme }) => theme.primary1};
  font-size: 14px;
`;
export const Checkbox = styled.input`
  border: 1px solid ${({ theme }) => theme.red1};
  height: 20px;
  margin: 0;
`;

export const PaddedColumn = styled(AutoColumn)`
  padding: 20px;
`;

export const MenuItem = styled(RowBetween)`
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
  grid-gap: 16px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  :hover {
    background: rgba(50, 48, 56, 1);
    border: 1px solid rgba(39, 227, 171, 1);
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
  border-bottom: 1px solid rgba(29, 28, 33, 0.4);
`;

export const SearchInput = styled.input`
  font-family: 'Montserrat';
  position: relative;
  display: flex;
  padding: 16px;
  align-items: center;
  width: 100%;
  height: 44px;
  white-space: nowrap;
  background: ${({ theme }) => theme.primary1};
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text1};
  border-style: solid;
  border: 1px solid ${({ theme }) => theme.primary1};
  -webkit-appearance: none;
  font-size: 14px;
  font-weight: 500;
  ::placeholder {
    color: ${({ theme }) => theme.text1};
  }
  transition: border 100ms;
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    outline: none;
  }
`;
export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.primary1};
`;

export const SeparatorDark = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.primary1};
`;

export const AssetList = styled.div`
  width: 100%;
  height: 30px;
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  font-weight: 500;
  font-family: 'Montserrat';
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
`;
