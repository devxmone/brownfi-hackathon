import { FunctionComponent, useRef } from 'react';
import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import Discord from '../../assets/images/discord.png';
import Medium from '../../assets/images/medium.png';
import { ReactComponent as MenuIcon } from '../../assets/images/menu.svg';
import Twitter from '../../assets/images/twitter.png';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { ApplicationModal } from '../../state/application/actions';
import { useModalOpen, useToggleModal } from '../../state/application/hooks';
import { ExternalLink } from '../../theme';

export enum FlyoutAlignment {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.primary1};
  }
`;

export const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    border: ${({ theme }) => `1px solid ${theme.primary1}`};
  }

  svg {
    margin-top: 2px;
  }
`;

export const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`;

export const MenuFlyout = styled.span<{ flyoutAlignment?: FlyoutAlignment }>`
  min-width: 12.125rem;
  border: ${({ theme }) => `1px solid ${theme.primary1}`};

  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 3rem;
  z-index: 101;
  ${({ flyoutAlignment = FlyoutAlignment.RIGHT }) =>
    flyoutAlignment === FlyoutAlignment.RIGHT
      ? css`
          right: 0rem;
        `
      : css`
          left: 0rem;
        `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: -11.25rem;
  `};
`;

export const MenuItem = styled(ExternalLink)`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.primary1};
  :hover {
    color: ${({ theme }) => theme.primary1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`;

const InternalMenuItem = styled(Link)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.primary1};
  :hover {
    color: ${({ theme }) => theme.primary1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`;

const Image = styled.img`
  margin-right: 8px;
  width: 24px;
`;

export const SOCIAL = [
  {
    link: '#',
    icon: Twitter,
    text: 'Twitter',
  },
  {
    link: '#',
    icon: Medium,
    text: 'Medium',
  },
  {
    link: '#',
    icon: Discord,
    text: 'Discord',
  },
  // {
  //   link: 'https://discord.gg/',
  //   icon: Discord,
  //   text: 'Discord',
  // },
  // {
  //   link: 'https://www.reddit.com/',
  //   icon: Reddit,
  //   text: 'Reddit',
  // },
  // {
  //   link: 'https://www.instagram.com/',
  //   icon: Instagram,
  //   text: 'Instagram',
  // },
];

export default function Menu() {
  const node = useRef<HTMLDivElement>();
  const open = useModalOpen(ApplicationModal.MENU);
  const toggle = useToggleModal(ApplicationModal.MENU);
  useOnClickOutside(node, open ? toggle : undefined);

  return (
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <StyledMenuIcon />
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          {SOCIAL.map(({ link, icon, text }, index) => (
            <MenuItem href={link} key={index}>
              <Image src={icon} alt={text} />
              <div>{text}</div>
            </MenuItem>
          ))}
        </MenuFlyout>
      )}
    </StyledMenu>
  );
}

interface NewMenuProps {
  flyoutAlignment?: FlyoutAlignment;
  ToggleUI?: FunctionComponent;
  toggleElementProps?: Record<string, any>;
  menuItems: {
    content: any;
    link: string;
    external: boolean;
  }[];
}

const NewMenuFlyout = styled(MenuFlyout)`
  top: 3rem !important;
`;
const NewMenuItem = styled(InternalMenuItem)`
  width: max-content;
  text-decoration: none;
`;

const ExternalMenuItem = styled(MenuItem)`
  width: max-content;
  text-decoration: none;
`;

export const NewMenu = ({
  flyoutAlignment = FlyoutAlignment.RIGHT,
  ToggleUI,
  menuItems,

  toggleElementProps,
  ...rest
}: NewMenuProps) => {
  const node = useRef<HTMLDivElement>();
  const open = useModalOpen(ApplicationModal.POOL_OVERVIEW_OPTIONS);
  const toggle = useToggleModal(ApplicationModal.POOL_OVERVIEW_OPTIONS);
  useOnClickOutside(node, open ? toggle : undefined);
  const ToggleElement = ToggleUI || StyledMenuIcon;
  return (
    <StyledMenu ref={node as any} {...rest}>
      <ToggleElement onClick={toggle} {...toggleElementProps} />
      {open && (
        <NewMenuFlyout flyoutAlignment={flyoutAlignment}>
          {menuItems.map(({ content, link, external }, i) =>
            external ? (
              <ExternalMenuItem id='link' href={link} key={link + i}>
                {content}
              </ExternalMenuItem>
            ) : (
              <NewMenuItem id='link' to={link} key={link + i}>
                {content}
              </NewMenuItem>
            ),
          )}
        </NewMenuFlyout>
      )}
    </StyledMenu>
  );
};
