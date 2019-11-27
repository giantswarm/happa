import BootstrapTabs from 'react-bootstrap/lib/Tabs';
import PropTypes from 'prop-types';
import React from 'react';

const Tabs = props => {
  return (
    <BootstrapTabs
      animation={false}
      defaultActiveKey={props.defaultActiveKey || 1}
      id='tabs'
    >
      {props.children}
    </BootstrapTabs>
  );
};

Tabs.propTypes = {
  defaultActiveKey: PropTypes.any,
  children: PropTypes.node,
};

export default Tabs;
