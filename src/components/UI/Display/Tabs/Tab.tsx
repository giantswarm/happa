import { Tab as GromTab } from 'grommet';
import React from 'react';

interface ITabProps extends React.ComponentPropsWithoutRef<typeof GromTab> {
  path?: string;
}

const Tab: React.FC<ITabProps> = ({ path, children, ...props }) => {
  return <GromTab {...props}>{children}</GromTab>;
};

export default Tab;
