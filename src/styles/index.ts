import { CSSBreakpoints } from 'model/constants';
import { css } from 'styled-components';
import styled from 'styled-components';

import theme from './theme';

export enum FlashMessageType {
  Danger = 'danger',
  Success = 'success',
  Warning = 'warning',
  Info = 'info',
}

/***** BASE STYLES ****/

/*
 * All variables with css emotion are used for extends, so these styles may be inherited
 * by a lot of styled variables here and in components and should be modified with caution
 */

export const Row = css`
  padding: 14px 20px;
  min-height: 56px;
  letter-spacing: 0.3px;
  margin-bottom: 16px;
  border-radius: 5px;
`;

export const FlexRowBase = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Ellipsis = css`
  text-overflow: ellipsis;
  max-width: 95%;
  overflow: hidden;
`;

export const VerticalScroll = css`
  scrollbar-gutter: stable;
  scrollbar-color: ${(props) => `${props.theme.colors.shade6} transparent`};

  ::-webkit-scrollbar {
    background-color: ${(props) => props.theme.colors.shade5};
    border-radius: 5px;
    width: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.shade6};
    border-radius: 5px;
  }
`;

/***** STYLED ELEMENTS *****/

// Layout

export const FlexRowWithTwoBlocksOnEdges = styled.div`
  ${FlexRowBase};
  ${Row};
  background-color: ${(props) => props.theme.colors.foreground};
  > div {
    display: flex;
    align-items: center;
  }
  /* Left block */
  > div:first-of-type {
    margin-right: auto;
    /* Separation for children */
    > * {
      margin-right: 18px;
      display: inline-block;
    }
  }
  /* Right Block */
  > div:nth-of-type(2) {
    margin-left: auto;
    /* Separation for children */
    > * {
      margin-left: 18px;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
  }
  i {
    padding: 0 2px;
  }
  span {
    white-space: nowrap;
    display: inline-block;
  }
`;

/* Style Wrappers & Reusable elements */

export const Code = styled.code`
  font-family: ${(props) => props.theme.fontFamilies.console};
  background-color: ${(props) => props.theme.colors.shade2};
  border-radius: 2px;
  padding: 0 12px;
  height: 30px;
  line-height: 30px;
  display: inline-block;
  margin: 0;
  white-space: nowrap;
`;

export const Dot = styled.span`
  padding: 0 5px;
  &:before {
    content: '·';
  }
`;

export const FallbackSpan = styled.span`
  opacity: 0.5;
`;

/**
 * Mixins
 */

// Breakpoint can be a string representing any of the breakpoint properties in
// the theme object or a number/string representing a custom breakpoint.
export const mq = (breakpoint: CSSBreakpoints | number) =>
  `@media only screen and (max-width: ${
    theme.breakpoints[breakpoint as CSSBreakpoints] ?? breakpoint
  }px)`;
