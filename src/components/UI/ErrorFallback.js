import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

// ErrorFallback takes one string prop 'errorMessage' and will render the
// message if it evaluates to true and the children otherwise.

const ErrorWrapperSpan = styled.span`
  color: ${props => props.theme.colors.error};
  font-weight: 300;
`;

function ErrorFallback({ errorMessage, children }) {
  return errorMessage ? (
    <ErrorWrapperSpan>{errorMessage}</ErrorWrapperSpan>
  ) : (
    children
  );
}

ErrorFallback.propTypes = {
  errorMessage: PropTypes.string,
  children: PropTypes.node,
};

export default ErrorFallback;
