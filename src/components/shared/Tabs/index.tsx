import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';
import BootstrapTabs from 'react-bootstrap/lib/Tabs';
import { useHistory, useLocation } from 'react-router';

interface ITabsProps
  extends React.ComponentPropsWithoutRef<typeof BootstrapTabs> {
  defaultActiveKey: string;
  children: ReactNode;
  useRoutes?: boolean;
}

const Tabs: React.FC<ITabsProps> = ({
  defaultActiveKey,
  children,
  useRoutes,
  ...props
}) => {
  const history = useHistory();
  const { pathname } = useLocation();

  // eslint-disable-next-line @typescript-eslint/init-declarations
  let activeKey: string | undefined;
  if (useRoutes) {
    activeKey = pathname;
  }

  const handleTabChange = (eventKey: string) => {
    if (useRoutes && pathname !== eventKey) {
      history.replace(eventKey);
    }
  };

  return (
    <BootstrapTabs
      activeKey={activeKey}
      onSelect={handleTabChange as never}
      defaultActiveKey={defaultActiveKey}
      animation={false}
      id='tabs'
      mountOnEnter={true}
      unmountOnExit={true}
      {...props}
    >
      {children}
    </BootstrapTabs>
  );
};

Tabs.propTypes = {
  children: PropTypes.node,
  defaultActiveKey: PropTypes.any,
  useRoutes: PropTypes.bool,
};

Tabs.defaultProps = {
  useRoutes: false,
};

export default Tabs;
