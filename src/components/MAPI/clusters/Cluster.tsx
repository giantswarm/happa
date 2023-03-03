import { ProviderFlavors } from 'model/constants';
import { OrganizationsRoutes } from 'model/constants/routes';
import { getUserIsAdmin } from 'model/stores/main/selectors';
import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Switch } from 'react-router';
import Route from 'Route';

import ClusterDetail from './ClusterDetail';
import CreateCluster from './CreateCluster/CreateCluster';
import CreateClusterAppBundles from './CreateClusterAppBundles';
import GettingStarted from './GettingStarted';

const Cluster: React.FC<React.PropsWithChildren<{}>> = () => {
  const providerFlavor = window.config.info.general.providerFlavor;
  const isAdmin = useSelector(getUserIsAdmin);

  return (
    <Switch>
      <Route
        component={
          isAdmin && providerFlavor === ProviderFlavors.CAPI
            ? CreateClusterAppBundles
            : CreateCluster
        }
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
