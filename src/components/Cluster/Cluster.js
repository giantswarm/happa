import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import ClusterDetail from './ClusterDetail/ClusterDetail';
import NewCluster from './NewCluster/NewCluster';

const Cluster = props => (
  <Switch>
    <Route component={NewCluster} exact path={`${props.match.path}/new`} />
    <Route component={ClusterDetail} path={`${props.match.path}/:clusterId`} />
    <Redirect path={`${props.match.path}/*`} to={`${props.match.url}`} />
  </Switch>
);

Cluster.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(Cluster);
