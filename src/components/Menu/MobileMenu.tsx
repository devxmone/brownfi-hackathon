import { useCallback, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import { NavLink, useLocation } from 'react-router-dom';

import { css } from 'styled-components';
import styled from 'styled-components/macro';
import { darken } from 'polished';

import { StyledLink } from 'components/Header';

import { useOnClickOutside } from 'hooks/useOnClickOutside';

const activeClassName = 'ACTIVE';

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.primary1};
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
  padding: 8px 12px;

  &.${activeClassName} {
    border-radius: 0px;
    font-weight: 800;
    color: ${({ theme }) => theme.primary1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
`;

const StyledBridgeButton = styled.div<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.bg0};
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
  padding: 8px 35px;
  background: ${({ theme }) => theme.primary1};

  ${({ isActive }) =>
    isActive &&
    css`
      border-radius: 8px;
      color: ${({ theme }) => theme.bg0};
      background: ${({ theme }) => theme.primary1};
    `};

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.bg0)};
  }
`;

const Menu = styled.div`
  min-width: 8.125rem;
  border: ${({ theme }) => `1px solid ${theme.primary1}`};
  background: ${({ theme }) => theme.bg0};
  border-radius: 8px;
  z-index: 100;
`;

export function MobileMenu() {
  const node = useRef<HTMLDivElement>();
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ],
  });
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((open) => !open), [setOpen]);
  useOnClickOutside(node, open ? toggle : undefined);
  const location = useLocation();

  return (
    <div ref={node as any}>
      <StyledBridgeButton onClick={toggle} isActive={open} ref={setReferenceElement as any}>
        {location.pathname.startsWith('/swap')
          ? 'Swap'
          : location.pathname.startsWith('/pool')
          ? 'Pool'
          : location.pathname.startsWith('/farm')
          ? 'Farm'
          : location.pathname.startsWith('/stake')
          ? 'Stake'
          : 'Stake'}
      </StyledBridgeButton>

      {open && (
        <Menu ref={setPopperElement as any} style={styles.popper} {...attributes.popper}>
          <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
            Swap
          </StyledNavLink>
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/pool'}
            isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith('/add') ||
              pathname.startsWith('/remove') ||
              pathname.startsWith('/increase') ||
              pathname.startsWith('/find')
            }
          >
            Pool
          </StyledNavLink>
          <StyledLink href='https://app.brownfi.app/stake' target='_blank' rel='noreferrer'>
            Stake
          </StyledLink>
          <StyledLink href='https://app.brownfi.app/farm' target='_blank' rel='noreferrer'>
            Farm
          </StyledLink>
        </Menu>
      )}
    </div>
  );
}
