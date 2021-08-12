import { Tab as GromTab } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';

interface ITabProps extends React.ComponentPropsWithoutRef<typeof GromTab> {
  path?: string;
}

const Tab: React.FC<ITabProps> = ({ path, children, ...props }) => {
  return <GromTab {...props}>{children}</GromTab>;
};

Tab.propTypes = {
  children: PropTypes.node,
  path: PropTypes.string,
};

export default Tab;
