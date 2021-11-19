import { OrganizationsRoutes } from 'model/constants/routes';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import Route from 'Route';

import ClusterDetail from './ClusterDetail';
import CreateCluster from './CreateCluster';
import GettingStarted from './GettingStarted';

const Cluster: React.FC<{}> = () => {
  return (
    <Switch>
      <Route
        component={CreateCluster}
        exact
        path={OrganizationsRoutes.Clusters.New}
      />
      <Route
        path={OrganizationsRoutes.Clusters.GettingStarted.Overview}
        component={GettingStarted}
      />
      <Route
        component={ClusterDetail}
        path={OrganizationsRoutes.Clusters.Detail.Home}
      />
      <Redirect to={OrganizationsRoutes.List} />
    </Switch>
  );
};

export default Cluster;
