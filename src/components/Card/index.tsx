import styled from 'styled-components/macro';
import { Box } from 'rebass/styled-components';

const Card = styled(Box)<{ width?: string; padding?: string; border?: string; borderRadius?: string }>`
  width: ${({ width }) => width ?? '100%'};
  padding: 1rem;
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
  font-size: 16px;
  font-weight: 700;
  font-family: 'Montserrat';
  color: ${({ theme }) => theme.text2};
`;
export default Card;

export const LightCard = styled(Card)`
  background-color: ${({ theme }) => theme.primary3};
  color: ${({ theme }) => theme.text2};
`;

export const LightGreyCard = styled(Card)`
  border: 1px solid rgba(4, 76, 26, 0);
  background-color: rgba(50, 48, 56, 1);
  color: ${({ theme }) => theme.text2};
`;

export const DarkCard = styled(Card)``;

export const OutlineCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.primary3};
`;

export const YellowCard = styled(Card)`
  background: ${({ theme }) =>
    `linear-gradient(90deg, ${theme.primary1} 0%, ${theme.dark5} 35%, ${theme.primary1} 100%);`};
  color: ${({ theme }) => theme.text2};
  font-weight: 500;
`;

export const PinkCard = styled(Card)`
  background-color: rgba(255, 0, 122, 0.03);
  color: ${({ theme }) => theme.text2};
  font-weight: 500;
`;

export const BlueCard = styled(Card)`
  background-color: ${({ theme }) => theme.primary1};
  color: ${({ theme }) => theme.text2};
  border-radius: 23px;
`;
