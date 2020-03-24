import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const ErrorWrapperSpan = styled.span`
  color: ${(props) => props.theme.colors.error};
  font-weight: 300;
`;

/**
 * This component will return the error passed to it,
 * if it exists, or the children, if it does not
 */
function ErrorFallback({ errors, children, ...rest }) {
  if (errors) {
    return <ErrorWrapperSpan {...rest}>{errors}</ErrorWrapperSpan>;
  }

  return children;
}

ErrorFallback.propTypes = {
  errors: PropTypes.string,
  children: PropTypes.node,
};

export default ErrorFallback;
