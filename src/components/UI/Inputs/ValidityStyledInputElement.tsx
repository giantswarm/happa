import styled from '@emotion/styled';
import { InputElement } from 'UI/Inputs/Input';

const ValidityStyledInputElement = styled(InputElement)<{ isValid: boolean }>`
  ${({ isValid, theme }) =>
    isValid ? '' : `border-color: ${theme.colors.error}`};
`;

export default ValidityStyledInputElement;
