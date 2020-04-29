import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';

import ClusterDetail from './ClusterDetail/ClusterDetail';
import NewCluster from './NewCluster/NewCluster';

const Cluster = () => (
  <Switch>
    <Route
      component={NewCluster}
      exact
      path={OrganizationsRoutes.Clusters.New}
    />
    <Route
      component={ClusterDetail}
      path={OrganizationsRoutes.Clusters.Detail.Home}
    />
    <Redirect to={OrganizationsRoutes.List} />
  </Switch>
);

Cluster.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(Cluster);
