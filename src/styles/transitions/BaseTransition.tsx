import React from 'react';
import { CSSTransition } from 'react-transition-group';
import useDelayedChange from 'utils/hooks/useDelayedChange';

type BaseTransitionProps = React.ComponentPropsWithoutRef<
  typeof CSSTransition
> & {
  classNames: string;
  delayTimeout?: number;
};

const BaseTransition: React.FC<
  React.PropsWithChildren<BaseTransitionProps>
> = ({ children, in: inProp, delayTimeout, ...props }) => {
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

export default BaseTransition;
