import styled from 'styled-components';

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-weight: 400;
`;

export default ErrorText;
