import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import Detail from './Detail/Detail';
import List from './List/List';
import LoadingOverlay from 'UI/LoadingOverlay';
import PropTypes from 'prop-types';
import React from 'react';

const Organizations = props => {
  const { url, path } = props.match;

  return (
    <Breadcrumb data={{ title: 'ORGANIZATIONS', pathname: url }}>
      <LoadingOverlay loading={props.loadingClustersDetails}>
        <Switch>
          <Route component={List} exact path={`${path}`} />
          <Route component={Detail} path={`${path}/:orgId`} />
          <Redirect path={`${path}*`} to={`${url}`} />
        </Switch>
      </LoadingOverlay>
    </Breadcrumb>
  );
};

Organizations.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
  loadingClustersDetails: PropTypes.bool
};

function mapStateToProps(state) {
  const loadingClustersDetails = state.loadingFlags.CLUSTERS_DETAILS;

  return {
    loadingClustersDetails,
  };
}

export default connect(mapStateToProps)(Organizations);
