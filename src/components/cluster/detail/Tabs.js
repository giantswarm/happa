import BootstrapTabs from 'react-bootstrap/Tabs';
import PropTypes from 'prop-types';
import React from 'react';

const Tabs = props => {
  return (
    <BootstrapTabs transition={false} defaultActiveKey={1} id='tabs'>
      {props.children}
    </BootstrapTabs>
  );
};

Tabs.propTypes = {
  children: PropTypes.node,
};

export default Tabs;
