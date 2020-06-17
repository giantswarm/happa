import { css } from '@emotion/core';
import styled from '@emotion/styled';
import Button from 'react-bootstrap/lib/Button';

export const TableButton = styled(Button)`
  height: 24px;
  line-height: 24px;
  position: relative;
  top: -2px;
  margin-left: 5px;
  padding: 0px 15px;
  text-transform: uppercase;
  i {
    margin-right: 4px;
  }
`;

export const ComponentsWrapper = styled.div`
  margin-left: ${({ theme }) => theme.spacingPx * 9}px;
`;

export const Tr = styled.tr<{ isSelected: boolean }>`
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.foreground : 'transparent'};
  td {
    font-variant-numeric: tabular-nums;
  }
  &:hover {
    background-color: ${({ isSelected, theme }) =>
      theme.colors[isSelected ? 'foreground' : 'shade4']};
  }
`;

export const ComponentsRow = styled.tr`
  &:hover td {
    color: ${({ theme }) => theme.colors.gray};
  }
`;

export const CenteredCell = styled.td`
  text-align: center;
`;

export const CursorPointerCell = styled(CenteredCell)`
  cursor: pointer;
`;

export const BulletStyle = css`
  span.release-selection-bullet {
    margin-right: 0;
  }
  .release-selection-radio {
    margin-bottom: 0;
  }
`;
