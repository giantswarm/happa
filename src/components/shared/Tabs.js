import PropTypes from 'prop-types';
import React from 'react';
import BootstrapTabs from 'react-bootstrap/lib/Tabs';
import { useHistory, useLocation } from 'react-router';

const Tabs = ({ defaultActiveKey, children, useRoutes }) => {
  const history = useHistory();
  const { pathname } = useLocation();

  // eslint-disable-next-line init-declarations
  let activeKey;
  if (useRoutes) {
    activeKey = pathname;
  }

  const handleTabChange = (eventKey) => {
    if (useRoutes && pathname !== eventKey) {
      history.replace(eventKey);
    }
  };

  return (
    <BootstrapTabs
      activeKey={activeKey}
      onSelect={handleTabChange}
      defaultActiveKey={defaultActiveKey}
      animation={false}
      id='tabs'
      mountOnEnter={true}
      unmountOnExit={true}
    >
      {children}
    </BootstrapTabs>
  );
};
Tabs.propTypes = {
  children: PropTypes.node,
  defaultActiveKey: PropTypes.node,
  useRoutes: PropTypes.bool,
};

export default Tabs;
