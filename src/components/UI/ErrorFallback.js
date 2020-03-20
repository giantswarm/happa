import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

// ErrorFallback takes an error string or an array of error strings and will render
//  the message/s. If it receives a falsy value or an array of falsy values it will
// render its children.

const ErrorWrapperSpan = styled.span`
  color: ${props => props.theme.colors.error};
  font-weight: 300;
`;

function ErrorFallback({ errors, children }) {
  if (errors) {
    return <ErrorWrapperSpan>{errors}</ErrorWrapperSpan>;
  }

  return children;
}

ErrorFallback.propTypes = {
  errors: PropTypes.string,
  children: PropTypes.node,
};

export default ErrorFallback;
