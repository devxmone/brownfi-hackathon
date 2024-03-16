import styled from 'styled-components';

import { AutoColumn } from 'components/Column';

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
  margin-top: 5%;
`;

const Heading = styled.div`
  display: flex;
  align-items: center;
  justify-content: left;
  margin-bottom: 2%;
`;

export const ComingSoon = styled.div`
  font-size: 46px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
export function StakingPage() {
  return (
    <>
      <PageWrapper>
        <Heading>
          {/* <TYPE.largeHeader style={{ margin: 0 }}>Earn rewards by staking BROWN for xBROWN</TYPE.largeHeader> */}
        </Heading>
        <AutoColumn gap='lg' justify='center'>
          <ComingSoon>Coming Soon</ComingSoon>
          {/* <InfoCard
            title="Staking rewards"
            description={`The sell tax on our token is distributed as BROWN proportional to your share of the staking pool. When your BROWN is staked you receive xBROWN.

          ${`\n`} Your BROWN is continuously compounding, when you unstake you will receive all the originally deposited BROWN plus any additional tokens accrued from fees.

          ${`\n`} NOTE: The APR shown is based on the fees generated in the last 24 hours and may vary over time.`}
          />
          <StakingBalance /> */}
        </AutoColumn>
      </PageWrapper>
    </>
  );
}
