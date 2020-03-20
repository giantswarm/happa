import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const DEFAULT_MESSAGE =
  'There was a problem. Please try again later and, if the problem persists, contact Giant Swarm support.';

// ErrorFallback takes an error string or an array of error strings and will render
//  the message/s. If it receives a falsy value or an array of falsy values it will
// render its children.

const ErrorWrapperSpan = styled.span`
  color: ${props => props.theme.colors.error};
  font-weight: 300;
`;

/**
 * Helper that finds the best way to return a pretty-printed
 * version of the error object passed to it
 * @param {any} errors - Error object
 */
function parseErrors(errors) {
  if (typeof errors === 'string' || !errors) return errors;

  let message = '';

  if (Array.isArray(errors)) {
    // Remove nullable values and join values in a string
    // TODO maybe we want to show errors in a different manner.
    const notNullErrors = errors.filter(error => error);
    if (notNullErrors.length === 0) return null;

    message = notNullErrors.join('. ');
  } else {
    // Maybe we're lucky and this is an error object/response object
    message = errors.message || DEFAULT_MESSAGE;
  }

  return message;
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
  errors: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.array,
  ]),
  children: PropTypes.node,
};

export default ErrorFallback;
