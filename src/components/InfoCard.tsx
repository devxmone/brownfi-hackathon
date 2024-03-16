import styled from 'styled-components';

import { TYPE } from 'theme';

import { CardSection, DataCard } from './farm/styled';
import { AutoColumn } from './Column';
import { RowBetween } from './Row';

const VoteCard = styled(DataCard)`
  overflow: hidden;

  white-space: pre-line;
`;

export function InfoCard({
  title,
  description,
  style,
}: {
  title: string;
  description: string | React.ReactNode;
  style?: any;
}) {
  return (
    <VoteCard style={style}>
      <CardSection>
        <AutoColumn gap='md'>
          <RowBetween>
            <TYPE.white fontSize={18} fontWeight={600}>
              {title}
            </TYPE.white>
          </RowBetween>
          <RowBetween>
            <TYPE.white fontSize={14}>{description}</TYPE.white>
          </RowBetween>
        </AutoColumn>
      </CardSection>
    </VoteCard>
  );
}
