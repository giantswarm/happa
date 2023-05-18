import { RJSFValidationError } from '@rjsf/utils';
import React from 'react';
import styled from 'styled-components';

const StyledList = styled.ul`
  padding-inline-start: 1em;
  list-style-position: inside;
`;

interface IErrorListProps {
  errors: RJSFValidationError[];
}

const ErrorList: React.FC<IErrorListProps> = ({ errors }) => {
  return (
    <StyledList>
      {errors.map((error, idx) => (
        <li key={idx}>{error.stack}</li>
      ))}
    </StyledList>
  );
};

export default ErrorList;
