import styled from 'styled-components/macro';

const ToggleElement = styled.span<{ isActive?: boolean }>`
  background: ${({ theme, isActive }) => (isActive ? theme.primary3 : theme.primary1)};
  color: ${({ theme }) => theme.colorContrast};
  font-size: 12px;
  font-weight: 700;
  width: 52px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledToggle = styled.button<{ isActive?: boolean; activeElement?: boolean }>`
  border: none;
  background: ${({ theme }) => theme.bg1};
  display: flex;
  width: fit-content;
  cursor: pointer;
  outline: none;
  padding: 0;
`;

export interface ToggleProps {
  id?: string;
  isActive: boolean;
  toggle: () => void;
}

export default function Toggle({ id, isActive, toggle }: ToggleProps) {
  console.log(isActive);
  return (
    <StyledToggle id={id} isActive={isActive} onClick={toggle}>
      <ToggleElement isActive={isActive}>On</ToggleElement>
      <ToggleElement isActive={!isActive}>Off</ToggleElement>
    </StyledToggle>
  );
}
