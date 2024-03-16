import styled from 'styled-components/macro';
import { Text } from 'rebass';

import { RowFixed } from '../Row';

export const FilterWrapper = styled(RowFixed)`
  padding: 8px;
  background-color: ${({ theme }) => theme.bg0};
  color: ${({ theme }) => theme.primary1};
  border-radius: 8px;
  user-select: none;
  & > * {
    user-select: none;
  }
  :hover {
    cursor: pointer;
  }
`;

export default function SortButton({
  toggleSortOrder,
  ascending,
}: {
  toggleSortOrder: () => void;
  ascending: boolean;
}) {
  return (
    <FilterWrapper onClick={toggleSortOrder}>
      <Text fontSize={14} fontWeight={500}>
        {ascending ? '↑' : '↓'}
      </Text>
    </FilterWrapper>
  );
}
