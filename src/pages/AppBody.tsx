import { ReactNode } from 'react';

import styled, { css } from 'styled-components/macro';

export const Glow = css``;

export const BodyWrapper = styled.div<{ margin?: string }>`
  position: relative;
  max-width: 480px;
  width: 100%;
  background: ${({ theme }) => theme.primary2};
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
`;

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, ...rest }: { children: ReactNode }) {
  return <BodyWrapper {...rest}>{children}</BodyWrapper>;
}
