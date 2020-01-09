import PropTypes from 'prop-types';
import React from 'react';
import BootstrapTabs from 'react-bootstrap/lib/Tabs';

const Tabs = props => {
  return (
    <BootstrapTabs animation={false} defaultActiveKey={1} id='tabs'>
      {props.children}
    </BootstrapTabs>
  );
};

Tabs.propTypes = {
  children: PropTypes.node,
};

export default Tabs;
