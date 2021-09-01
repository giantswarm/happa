import React, { ReactElement } from 'react';

interface IRUMActionTargetProps {
  name: string;
  children: ReactElement;
}

/**
 * Decorator that adds the RUM element properties to the wrapped
 * child element, for dispatching custom RUM actions.
 */
const RUMActionTarget: React.FC<IRUMActionTargetProps> = ({
  name,
  children,
}) => {
  if (!children.props) return children;

  const newChildren = Object.assign({}, children, {
    props: {
      ...children.props,
      'data-dd-action-name': name.toUpperCase(),
    },
  });

  return React.Children.only(newChildren);
};

export default RUMActionTarget;
