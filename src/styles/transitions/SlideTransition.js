import PropTypes from 'prop-types';
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

SlideTransition.propTypes = {
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
  direction: PropTypes.oneOf(['up', 'down', 'right', 'left']),
};

export default SlideTransition;
