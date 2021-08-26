import React from 'react';

import BaseTransition from './BaseTransition';

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

export default SlideTransition;
