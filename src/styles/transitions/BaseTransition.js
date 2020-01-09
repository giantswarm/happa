import useDelayedChange from 'lib/effects/useDelayedChange';
import PropTypes from 'prop-types';
import React from 'react';
import { CSSTransition } from 'react-transition-group';

export const BaseTransitionPropTypes = {
  in: PropTypes.bool,
  children: PropTypes.node.isRequired,
  timeout: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      appear: PropTypes.number,
      enter: PropTypes.number,
      exit: PropTypes.number,
    }),
  ]),
};

const BaseTransition = ({ children, in: inProp, ...props }) => {
  const delayTimeout = 500;
  const delayedInProp = useDelayedChange(inProp, delayTimeout);

  return (
    <CSSTransition in={delayedInProp} mountOnEnter unmountOnExit {...props}>
      {children}
    </CSSTransition>
  );
};

BaseTransition.defaultProps = {
  // Disabling lines due to including in `BaseTransitionPropTypes`
  // eslint-disable-next-line react/default-props-match-prop-types
  in: false,
  // eslint-disable-next-line react/default-props-match-prop-types
  timeout: 200,
};

BaseTransition.propTypes = {
  ...BaseTransitionPropTypes,
  classNames: PropTypes.string.isRequired,
};

export default BaseTransition;
