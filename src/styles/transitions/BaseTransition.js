import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import React from 'react';
import useDelayedChange from 'lib/effects/useDelayedChange';

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
  const delayedInProp = useDelayedChange(inProp, 500);

  return (
    <CSSTransition in={delayedInProp} mountOnEnter unmountOnExit {...props}>
      {children}
    </CSSTransition>
  );
};

BaseTransition.defaultProps = {
  in: false,
  timeout: 200,
};

BaseTransition.propTypes = {
  ...BaseTransitionPropTypes,
  classNames: PropTypes.string.isRequired,
};

export default BaseTransition;
