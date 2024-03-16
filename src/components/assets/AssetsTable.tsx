import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import styled from 'styled-components';
import { DefaultTheme } from 'styled-components/macro';

import 'styled-components/macro';

import Column, { AutoColumn } from '../Column';
import { AutoRow } from '../Row';

export const AssetsContainer = styled(Column)`
  max-width: 1080px;
  width: 100%;
  border-radius: 10px;
  padding: 24px;
  flex: 1 1;
  position: relative;
  border-radius: 8px;
  margin-bottom: 50px;
  border: ${({ theme }) => `1px solid ${theme.primary1}`};
  backdrop-filter: blur(2px);
  background-color: rgba(255, 255, 255, 0.2);
`;

export function AssetsTable({ headers, children }: { headers?: string[]; children?: ReactNode }) {
  return (
    <>
      <AssetsContainer>
        <AssetsTableHeader headersOverride={headers} />
        {children}
      </AssetsContainer>
    </>
  );
}

export const AssetsTableHeaderText = styled(AutoColumn)`
  font-size: 1rem;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.primary1};
  text-align: center;
`;

export const AssetsTableHeaderContainer = styled(AutoRow)`
  padding-left: 11%;
  padding-right: 5%;
  margin-bottom: 2%;
`;

export const AssetRow = styled(Link)`
  text-decoration: none;
  border-radius: 10px;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.primary1};
  font-size: 1.1rem;

  :hover,
  :focus {
    color: ${({ theme }) => theme.primary1};
  }
  padding: 10px 30px;
  margin-top: 2%;
`;

export function AssetsTableHeader({ headersOverride }: { headersOverride?: string[] | undefined }) {
  return (
    <AssetsTableHeaderContainer justify={'space-between'}>
      {headersOverride &&
        headersOverride.length &&
        headersOverride.map((header: string) => <AssetsTableHeaderText key={header}>{header}</AssetsTableHeaderText>)}
      {(!headersOverride || !headersOverride.length) && (
        <>
          <AssetsTableHeaderText>Asset</AssetsTableHeaderText>
          <AssetsTableHeaderText>Amount</AssetsTableHeaderText>
          <AssetsTableHeaderText>Position Value</AssetsTableHeaderText>
        </>
      )}
    </AssetsTableHeaderContainer>
  );
}
