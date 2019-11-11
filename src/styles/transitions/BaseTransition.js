import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import React from 'react';

export const BaseTransitionPropTypes = {
  classNames: PropTypes.string,
  in: PropTypes.bool,
  children: PropTypes.element,
};

const BaseTransition = ({ children, ...props }) => {
  return (
    <CSSTransition mountOnEnter unmountOnExit {...props}>
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
