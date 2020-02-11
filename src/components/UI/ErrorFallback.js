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

// This function joins error messages into a single string if it receives an array,
// or returns the error if it is a single value of type string or null.
// If an array of null values are passed, it returns null.
function parseErrors(errors) {
  if (typeof errors === 'string' || !errors) return errors;

  // Remove null values and joins values in a string
  // TODO maybe we want to show errors in a different manner.
  const notNullErrors = errors.filter(error => error);
  if (notNullErrors.length === 0) return null;

  return notNullErrors.join('. ');
}

function ErrorFallback({ errors, children }) {
  const errorMessage = parseErrors(errors);

  return errorMessage ? (
    <ErrorWrapperSpan>{errorMessage}</ErrorWrapperSpan>
  ) : (
    children
  );
}

ErrorFallback.propTypes = {
  errors: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  children: PropTypes.node,
};

export default ErrorFallback;
