import { useEffect, useRef } from 'react';

import styled from 'styled-components/macro';
import Jazzicon from 'jazzicon';

import { useActiveWeb3React } from '../../hooks/web3';

const StyledIdenticonContainer = styled.div`
  border-radius: 1.125rem;
  background-color: ${({ theme }) => theme.bg4};
`;

export default function Identicon() {
  const ref = useRef<HTMLDivElement>();

  const { account } = useActiveWeb3React();

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = '';
      ref.current.appendChild(Jazzicon(32, parseInt(account.slice(2, 10), 32)));
    }
  }, [account]);

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
  return <StyledIdenticonContainer ref={ref as any} />;
}
