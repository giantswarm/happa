import BaseTransition, { BaseTransitionPropTypes } from './BaseTransition';
import PropTypes from 'prop-types';
import React from 'react';

const SlideTransition = ({ direction, children, ...props }) => {
  return (
    <BaseTransition classNames={`slide-${direction}`} {...props}>
      {children}
    </BaseTransition>
  );
};

SlideTransition.defaultProps = {
  direction: 'right',
};

SlideTransition.propTypes = {
  ...BaseTransitionPropTypes,
  direction: PropTypes.oneOf(['up', 'down', 'right', 'left']),
};

export default SlideTransition;
