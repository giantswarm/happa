import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import React from 'react';

export const BaseTransitionPropTypes = {
  classNames: PropTypes.string,
  visible: PropTypes.bool,
  children: PropTypes.element,
};

const BaseTransition = ({ visible, children, ...props }) => {
  return (
    <CSSTransition in={visible} mountOnEnter unmountOnExit {...props}>
      {children}
    </CSSTransition>
  );
};

BaseTransition.defaultProps = {
  visible: true,
  timeout: 200,
};

BaseTransition.propTypes = {
  ...BaseTransitionPropTypes,
  classNames: PropTypes.string.isRequired,
};

export default BaseTransition;
