import styled from 'styled-components';
import Button from 'UI/Controls/Button';

export const TableButton = styled(Button)`
  position: relative;
  margin-left: 0;
  padding: 0px 15px;
  text-transform: uppercase;

  i {
    margin-right: 4px;
  }
`;

export const Tr = styled.tr<{ isSelected: boolean; toneDown?: boolean }>`
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.foreground : 'transparent'};
  td {
    ${({ toneDown, theme }) =>
      toneDown ? `color: ${theme.colors.darkBlueLighter4};` : ''};
    font-variant-numeric: tabular-nums;
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
