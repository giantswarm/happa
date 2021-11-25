import styled from 'styled-components';

const ValidationError = styled.div<{ isValid: boolean }>`
  margin: 5px;
  text-align: left;
  color: ${({ theme }) => theme.colors.error};
  transition: max-height 500ms ease-in-out;
  max-height: ${({ isValid }) => (isValid ? '0' : 'none')};
  overflow: hidden;
`;

export default ValidationError;
