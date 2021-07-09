import NewClusterWrapper from 'Cluster/NewCluster/NewClusterWrapper';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import Route from 'Route';
import { OrganizationsRoutes } from 'shared/constants/routes';

import ClusterDetail from './ClusterDetail';
import GettingStarted from './GettingStarted';

const Cluster: React.FC<{}> = () => {
  return (
    <Switch>
      <Route
        component={NewClusterWrapper}
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

Cluster.propTypes = {};

export default Cluster;
