import React, { ComponentPropsWithoutRef, FC } from 'react';

interface IProps extends ComponentPropsWithoutRef<'div'> {}

const ClusterApps: FC<IProps> = () => {
  return <h1>Hello World</h1>;
};

export default ClusterApps;
