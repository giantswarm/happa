import PropTypes from 'prop-types';
import React, { ReactElement, ReactNode } from 'react';
import ErrorText from 'UI/ErrorText';

interface IErrorFallbackProps {
  children?: ReactElement;
  error?: string | ReactNode;
  className?: string;
}

/**
 * This component will return the error passed to it,
 * if it exists, or the children, if it does not
 */
const ErrorFallback: React.FC<IErrorFallbackProps> = ({
  error,
  children,
  className,
}) => {
  if (error) {
    return <ErrorText className={className}>{error}</ErrorText>;
  } else if (children) {
    return children;
  }

  return null;
};

ErrorFallback.propTypes = {
  children: PropTypes.element,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default ErrorFallback;
