import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const ErrorWrapperSpan = styled.span`
  color: ${props => props.theme.colors.error};
  font-weight: 300;
`;

/**
 * This component will return the error passed to it,
 * if it exists, or the children, if it does not
 */
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
