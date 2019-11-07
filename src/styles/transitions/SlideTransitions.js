import BaseTransition, { BaseTransitionPropTypes } from './BaseTransition';
import React from 'react';

export const SlideRightTransition = ({ children, ...props }) => {
  return (
    <BaseTransition classNames='slide-right' {...props}>
      {children}
    </BaseTransition>
  );
};

SlideRightTransition.propTypes = BaseTransitionPropTypes;
