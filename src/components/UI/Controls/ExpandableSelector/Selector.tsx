import { Text } from 'grommet';
import styled from 'styled-components';

export const SelectedItem = styled(Text)`
  margin-right: ${({ theme }) => theme.spacingPx * 9}px;
`;

export const SelectedDescription = styled(Text)``;

export const SelectedWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacingPx * 2}px;
`;

export const ListToggler = styled(Text)<{ collapsible?: boolean }>`
  cursor: ${({ collapsible }) => (collapsible ? 'pointer' : 'default')};
  padding: ${({ theme }) => theme.spacingPx * 2}px 0;
  color: ${({ theme }) => theme.colors.white4};
  user-select: none;
  &:hover {
    text-decoration: ${({ collapsible }) => collapsible && 'underline'};
  }
  i {
    margin-right: ${({ theme }) => theme.spacingPx}px;
    width: 16px;
  }
`;
