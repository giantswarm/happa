import { Box } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import styled, { css } from 'styled-components';

const TREE_VIEW_LEFT_PADDING = 20;
const TREE_VIEW_TOP_PADDING = 10;
export const TREE_VIEW_ITEM_HEIGHT = 60;

export const TreeViewItem = styled(Box)<{
  isRootItem: boolean;
  isLastItem: boolean;
}>`
  position: relative;

  ${({ isRootItem, isLastItem, theme }) =>
    !isRootItem &&
    css`
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: ${TREE_VIEW_ITEM_HEIGHT / 2}px;
        width: ${TREE_VIEW_LEFT_PADDING / 2}px;
        height: 1px;
        transform: translateX(-100%);
        background-color: ${normalizeColor('border-weak', theme)};
      }

      &::after {
        content: '';
        position: absolute;
        height: ${isLastItem
          ? `${TREE_VIEW_TOP_PADDING + TREE_VIEW_ITEM_HEIGHT / 2}px`
          : `calc(100% + ${TREE_VIEW_TOP_PADDING}px)`};
        width: 1px;
        left: -${TREE_VIEW_LEFT_PADDING / 2}px;
        top: -${TREE_VIEW_TOP_PADDING}px;
        background-color: ${normalizeColor('border-weak', theme)};
      }
    `}
`;

export const TreeViewSubtree = styled(Box)<{
  isRootItemSubtree: boolean;
  isLastSubtree: boolean;
}>`
  position: relative;
  padding-left: ${TREE_VIEW_LEFT_PADDING}px;
  padding-top: ${TREE_VIEW_TOP_PADDING}px;

  ${({ isRootItemSubtree, isLastSubtree, theme }) =>
    !isRootItemSubtree &&
    !isLastSubtree &&
    css`
      &::before {
        content: '';
        position: absolute;
        height: 100%;
        width: 1px;
        left: -${TREE_VIEW_LEFT_PADDING / 2}px;
        top: 0;
        background-color: ${normalizeColor('border-weak', theme)};
      }
    `}
`;
