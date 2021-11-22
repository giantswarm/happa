import { OrganizationsRoutes } from 'model/constants/routes';
import React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import Route from 'Route';

import ClusterDetail from './ClusterDetail/ClusterDetail';
import NewClusterWrapper from './NewCluster/NewClusterWrapper';

const Cluster = () => (
  <Switch>
    <Route
      component={NewClusterWrapper}
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

export default Cluster;
