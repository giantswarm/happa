import styled from 'styled-components';
import Button from 'UI/Controls/Button';

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

export const Tr = styled.tr<{ isSelected: boolean; toneDown?: boolean }>`
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.foreground : 'transparent'};
  td {
    ${({ toneDown, theme }) =>
      toneDown ? `color: ${theme.colors.darkBlueLighter4};` : ''};
    font-variant-numeric: tabular-nums;
    span.selection-bullet {
      margin-right: 0;
    }
    .selection-radio {
      margin-bottom: 0;
    }
  }
  &:hover {
    background-color: ${({ isSelected, theme }) =>
      theme.colors[isSelected ? 'foreground' : 'shade4']};
    color: #fff;
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
