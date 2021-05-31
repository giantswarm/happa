import useDelayedChange from 'lib/hooks/useDelayedChange';
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

interface IBaseTransitionProps
  extends React.ComponentPropsWithoutRef<typeof CSSTransition> {
  classNames: string;
  delayTimeout?: number;
}

const BaseTransition: React.FC<IBaseTransitionProps> = ({
  children,
  in: inProp,
  delayTimeout,
  ...props
}) => {
  const delayedInProp = useDelayedChange(inProp, delayTimeout!);

  return (
    // @ts-expect-error
    <CSSTransition
      in={delayedInProp}
      mountOnEnter={true}
      unmountOnExit={true}
      {...props}
    >
      {children}
    </CSSTransition>
  );
};

BaseTransition.defaultProps = {
  in: false,
  timeout: 200,
  delayTimeout: 500,
};

BaseTransition.propTypes = {
  ...BaseTransitionPropTypes,
  classNames: PropTypes.string.isRequired,
  delayTimeout: PropTypes.number,
};

export default BaseTransition;
