import { Component } from 'react';

import styled from 'styled-components/macro';

import store, { AppState } from '../../state';
import { ThemedBackground, TYPE } from '../../theme';
import { getUserAgent } from '../../utils/getUserAgent';
import { AutoColumn } from '../Column';

const FallbackWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  z-index: 1;
`;

const BodyWrapper = styled.div<{ margin?: string }>`
  padding: 1rem;
  width: 100%;
`;

const CodeBlockWrapper = styled.div`
  background: ${({ theme }) => theme.bg0};
  overflow: auto;
  white-space: pre;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 24px;
  padding: 18px 24px;
  color: ${({ theme }) => theme.primary1};
`;

const LinkWrapper = styled.div`
  color: ${({ theme }) => theme.blue1};
  padding: 6px 24px;
`;

const SomethingWentWrongWrapper = styled.div`
  padding: 6px 24px;
`;

type ErrorBoundaryState = {
  error: Error | null;
};

export default class ErrorBoundary extends Component<unknown, ErrorBoundaryState> {
  constructor(props: unknown) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error !== null) {
      const encodedBody = encodeURIComponent(issueBody(error));
      return (
        <FallbackWrapper>
          <ThemedBackground />
          <BodyWrapper>
            <AutoColumn gap={'md'}>
              <SomethingWentWrongWrapper>
                <TYPE.label fontSize={24} fontWeight={600}>
                  Something went wrong
                </TYPE.label>
              </SomethingWentWrongWrapper>
              <CodeBlockWrapper>
                <code>
                  <TYPE.main fontSize={10}>{error.stack}</TYPE.main>
                </code>
              </CodeBlockWrapper>
            </AutoColumn>
          </BodyWrapper>
        </FallbackWrapper>
      );
    }
    return (this.props as any).children;
  }
}

function getRelevantState(): null | keyof AppState {
  const path = window.location.hash;
  if (!path.startsWith('#/')) {
    return null;
  }
  const pieces = path.substring(2).split(/[/\\?]/);
  switch (pieces[0]) {
    case 'swap':
      return 'swap';
    case 'add':
      return 'mint';
    case 'remove':
      return 'burn';
  }
  return null;
}

function issueBody(error: Error): string {
  const relevantState = getRelevantState();
  const deviceData = getUserAgent();
  return `## URL
  
${window.location.href}

${
  relevantState
    ? `## \`${relevantState}\` state
    
\`\`\`json
${JSON.stringify(store.getState()[relevantState], null, 2)}
\`\`\`
`
    : ''
}
${
  error.name &&
  `## Error

\`\`\`
${error.name}${error.message && `: ${error.message}`}
\`\`\`
`
}
${
  error.stack &&
  `## Stacktrace

\`\`\`
${error.stack}
\`\`\`
`
}
${
  deviceData &&
  `## Device data

\`\`\`json
${JSON.stringify(deviceData, null, 2)}
\`\`\`
`
}
`;
}
