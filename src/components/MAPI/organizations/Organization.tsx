import Cluster from 'Cluster/Cluster';
import ClusterMapi from 'MAPI/clusters/Cluster';
import { OrganizationsRoutes } from 'model/constants/routes';
import { supportsMapiClusters } from 'model/featureSupport';
import { getLoggedInUser } from 'model/stores/main/selectors';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { Redirect, Switch, useParams, useRouteMatch } from 'react-router';
import Route from 'Route';

import OrganizationDetail from './OrganizationDetail';

interface IOrganizationProps {}

const Organization: React.FC<IOrganizationProps> = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const match = useRouteMatch();

  const user = useSelector(getLoggedInUser)!;
  const provider = window.config.info.general.provider;

  return (
    <Breadcrumb
      data={{
        title: orgId.toUpperCase(),
        pathname: match.url,
      }}
    >
      <Switch>
        {supportsMapiClusters(user, provider) ? (
          <Route
            component={ClusterMapi}
            path={OrganizationsRoutes.Clusters.Home}
          />
        ) : (
          <Route component={Cluster} path={OrganizationsRoutes.Clusters.Home} />
        )}

        <Route
          path={OrganizationsRoutes.Detail}
          component={OrganizationDetail}
        />
        <Redirect to={OrganizationsRoutes.Detail} />
      </Switch>
    </Breadcrumb>
  );
};

export default Organization;
