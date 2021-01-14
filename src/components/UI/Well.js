import styled from 'styled-components';

const Well = styled.div`
  background-color: ${({ theme }) => theme.colors.shade7};
  border-radius: ${({ theme }) => theme.border_radius};
  border: 0px;
  min-height: 20px;
  padding: ${({ theme }) => theme.spacingPx * 4}px;
  margin-bottom: ${({ theme }) => theme.spacingPx * 5}px;
`;

export default Well;
