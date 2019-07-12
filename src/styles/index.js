import { css } from '@emotion/core';
import styled from '@emotion/styled';

/* BASE STYLES
 * All variables with css emotion are used for extends, so these styles are inherited
 * by a lot of styled variables here and in components and should be modified with caution
 */

export const Row = css`
  padding: 0 21px 0 14px;
  height: 56px;
  font-size: 16px;
  font-weight: 300;
  letter-spacing: 0.3px;
  margin-bottom: 16px;
`;

export const FlexRowBase = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/* STYLED ELEMENTS */

export const FlexRowWithTwoBlocksOnEdges = styled.div`
  ${FlexRowBase};
  ${Row};
  background-color: ${props => props.theme.colors.shade7};
  > div > * {
    display: inline-block;
  }
  /* Left block */
  > div:first-of-type {
    margin-right: auto;
    /* Separation for children */
    > * {
      margin-right: 18px;
    }
  }
  /* Right Block */
  > div:nth-of-type(2) {
    margin-left: auto;
    /* Separation for children */
    > * {
      margin-left: 18px;
    }
  }
  i {
    padding: 0 2px;
  }
`;

export const Code = styled.code`
  font-family: ${props => props.theme.fontFamilies.console};
  background-color: ${props => props.theme.colors.background};
  border-radius: 2px;
  padding: 0 5px;
  height: 30px;
  line-height: 30px;
  display: inline-block;
`;

export const Dot = styled.span`
  padding: 0 5px;
  &:before {
    content: '·';
  }
`;
