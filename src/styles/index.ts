import { css } from '@emotion/core';
import styled, { WithTheme } from '@emotion/styled';
import { CSSBreakpoints } from 'shared/constants';

import theme from './theme';

export interface IColorMap {
  darkBlue: string;
  darkBlueDarker1: string;
  darkBlueDarker2: string;
  darkBlueDarker3: string;
  darkBlueDarker4: string;
  darkBlueDarker5: string;
  darkBlueDarker6: string;
  darkBlueDarker7: string;
  darkBlueDarker8: string;
  darkBlueDarker9: string;
  darkBlueLighter1: string;
  darkBlueLighter2: string;
  darkBlueLighter3: string;
  darkBlueLighter4: string;
  darkBlueLighter5: string;
  darkBlueLighter6: string;
  darkBlueLighter7: string;
  darkBlueLighter8: string;
  darkBlueLighter9: string;
  shade1: string;
  shade2: string;
  shade3: string;
  shade4: string;
  shade5: string;
  shade6: string;
  shade7: string;
  shade8: string;
  shade9: string;
  shade10: string;
  white1: string;
  white2: string;
  white3: string;
  whiteInput: string;
  yellow1: string;
  gold: string;
  goldBackground: string;
  red: string;
  gray: string;
  error: string;
  loadingForeground: string;
}

export interface IThemeFonts {
  console: string;
}

export interface ITheme {
  colors: IColorMap;
  border_radius: string;
  breakpoints: Record<CSSBreakpoints, number>;
  fontFamilies: IThemeFonts;
  border: string;
}

/***** BASE STYLES ****/

/*
 * All variables with css emotion are used for extends, so these styles may be inherited
 * by a lot of styled variables here and in components and should be modified with caution
 */

export const Row = css`
  padding: 14px 20px;
  min-height: 56px;
  font-weight: 300;
  letter-spacing: 0.3px;
  margin-bottom: 16px;
  border-radius: 5px;
`;

export const FlexRowBase = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Input = (props: WithTheme<{}, ITheme>) => css`
  input {
    box-sizing: border-box;
    width: 100%;
    background-color: ${props.theme.colors.shade5};
    padding: 11px 10px;
    outline: 0;
    color: ${props.theme.colors.whiteInput};
    border-radius: 4px;
    border: ${props.theme.border};
    padding-left: 15px;
    line-height: normal;
  }
`;

export const Ellipsis = css`
  text-overflow: ellipsis;
  max-width: 95%;
  overflow: hidden;
`;

/***** STYLED ELEMENTS *****/

// Layout

export const FlexRowWithTwoBlocksOnEdges = styled.div`
  ${FlexRowBase};
  ${Row};
  background-color: ${(props) => props.theme.colors.shade7};
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
