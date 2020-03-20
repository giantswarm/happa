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
 * @param {?(string[]|string)} errors - Error message(s)
 * @param {string} [separator=". "] - Separator between messages (if passing an error list)
 * @return {?string}
 */
function parseErrors(errors, separator = '. ') {
  if (typeof errors === 'string' || !errors) return errors;

  let message = DEFAULT_MESSAGE;

  if (Array.isArray(errors)) {
    // Remove nullable values and join values in a string
    // TODO maybe we want to show errors in a different manner.
    message = errors.reduce((acc, currErr) => {
      let newAcc = acc;

      if (currErr) {
        if (newAcc !== '') {
          newAcc += separator;
        }

        newAcc += currErr;
      }

      return newAcc;
    }, '');

    if (message === '') return null;
  }

  return message;
}

function ErrorFallback({ errors, children, separator }) {
  const errorMessage = parseErrors(errors, separator);

  return errorMessage ? (
    <ErrorWrapperSpan>{errorMessage}</ErrorWrapperSpan>
  ) : (
    children
  );
}

ErrorFallback.propTypes = {
  errors: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  children: PropTypes.node,
  separator: PropTypes.string,
};

export default ErrorFallback;
