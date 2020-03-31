import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { ReactElement } from 'react';

const ErrorWrapperSpan = styled.span`
  color: ${(props) => props.theme.colors.error};
  font-weight: 300;
`;

interface IErrorFallbackProps {
  children: ReactElement;
  error?: string;
}

/**
 * This component will return the error passed to it,
 * if it exists, or the children, if it does not
 */
const ErrorFallback: React.FC<IErrorFallbackProps> = ({ error, children }) => {
  if (error) return <ErrorWrapperSpan>{error}</ErrorWrapperSpan>;

  return children;
};

ErrorFallback.propTypes = {
  children: PropTypes.element.isRequired,
  error: PropTypes.string,
};

export default ErrorFallback;
