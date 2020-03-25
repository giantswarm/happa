import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

const ErrorWrapperSpan = styled.span`
  color: ${(props) => props.theme.colors.error};
  font-weight: 300;
`;

interface IErrorFallbackProps {
  error: string;
  children: ReactNode;
}

/**
 * This component will return the error passed to it,
 * if it exists, or the children, if it does not
 */
function ErrorFallback({ error, children }: IErrorFallbackProps) {
  if (error) return <ErrorWrapperSpan>{error}</ErrorWrapperSpan>;

  return children;
}

ErrorFallback.propTypes = {
  error: PropTypes.string,
  children: PropTypes.node,
};

export default ErrorFallback;
