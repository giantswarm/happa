import { OrganizationsRoutes } from 'model/constants/routes';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import Route from 'Route';

import ClusterDetail from './ClusterDetail';
import CreateCluster from './CreateCluster';
import CreateClusterAppForm from './CreateCluster/CreateClusterAppForm';
import GettingStarted from './GettingStarted';

const Cluster: React.FC<React.PropsWithChildren<{}>> = () => {
  return (
    <Switch>
      <Route
        component={CreateCluster}
        exact
        path={OrganizationsRoutes.Clusters.New}
      />
      <Route
        component={CreateClusterAppForm}
        exact
        path={OrganizationsRoutes.Clusters.NewViaAppBundles}
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
