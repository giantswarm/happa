import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: #395c72;
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 5px;

  img {
    width: 36px;
    height: 36px;
    margin-right: 16px;
    float: left;
    position: relative;
    top: 3px;
    border-radius: 5px;
    background-color: #fff;
  }

  small {
    font-size: 12px;
  }
`;

/**
 * ClusterDetailPreinstalledApp is a component for showing an app in the list of preinstalled
 * apps in apps pane of the cluster detail page.
 */
const ClusterDetailPreinstalledApp = (props) => {
  return (
    <Wrapper>
      <img alt={`${props.name} icon`} src={props.logoUrl} />
      {props.name}
      <small>{props.version}&nbsp;</small>
    </Wrapper>
  );
};

ClusterDetailPreinstalledApp.propTypes = {
  logoUrl: PropTypes.string,
  name: PropTypes.string,
  version: PropTypes.node,
};

export default ClusterDetailPreinstalledApp;
