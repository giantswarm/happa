import styled from 'styled-components';

const TextBase = styled.span`
  font-size: 14px;
  i {
    font-size: 16px;
  }
`;

export const SelectedItem = styled(TextBase)`
  margin-right: ${({ theme }) => theme.spacingPx * 9}px;
`;

export const SelectedDescription = styled(TextBase)`
  font-weight: 300;
`;

export const SelectedWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacingPx * 2}px;
`;

export const ListToggler = styled(TextBase)<{ collapsible?: boolean }>`
  cursor: ${({ collapsible }) => (collapsible ? 'pointer' : 'default')};
  font-weight: 300;
  padding: ${({ theme }) => theme.spacingPx * 2}px 0;
  color: ${({ theme }) => theme.colors.white4};
  user-select: none;
  &:hover {
    text-decoration: ${({ collapsible }) => collapsible && 'underline'};
  }
  i {
    margin-right: ${({ theme }) => theme.spacingPx}px;
    width: 14px;
  }
`;
