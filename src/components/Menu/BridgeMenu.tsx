import { useCallback, useRef, useState } from 'react';
import { usePopper } from 'react-popper';

import { css } from 'styled-components';
import styled from 'styled-components/macro';
import { darken } from 'polished';

import { useOnClickOutside } from 'hooks/useOnClickOutside';

import { MenuItem } from './index';

const StyledBridgeButton = styled.div<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.primary1};
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
  padding: 8px 12px;

  ${({ isActive }) =>
    isActive &&
    css`
      border-radius: 8px;
      color: ${({ theme }) => theme.primary1};
      background-color: ${({ theme }) => theme.bg3};
    `}

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
`;

const Menu = styled.div`
  min-width: 8.125rem;
  border: ${({ theme }) => `1px solid ${theme.primary1}`};
  background: ${({ theme }) => theme.bg0};
  border-radius: 8px;
`;

export function BridgeMenu() {
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

  return (
    <div ref={node as any}>
      <StyledBridgeButton onClick={toggle} isActive={open} ref={setReferenceElement as any}>
        Bridges
      </StyledBridgeButton>

      {open && (
        <Menu ref={setPopperElement as any} style={styles.popper} {...attributes.popper}>
          <MenuItem href='https://app.squidrouter.com'>
            <div>
              Axelar Squid Router <span style={{ fontSize: '11px', textDecoration: 'none !important' }}>↗</span>
            </div>
          </MenuItem>
          <MenuItem href='https://docs.base.org/tools/bridges'>
            <div>
              Base Bridge <span style={{ fontSize: '11px', textDecoration: 'none !important' }}>↗</span>
            </div>
          </MenuItem>
        </Menu>
      )}
    </div>
  );
}
