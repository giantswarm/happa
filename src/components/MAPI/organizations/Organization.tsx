import Cluster from 'Cluster/Cluster';
import ClusterMapi from 'MAPI/clusters/Cluster';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { Redirect, Switch, useParams, useRouteMatch } from 'react-router';
import Route from 'Route';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { supportsMapiClusters } from 'shared/featureSupport';
import { getLoggedInUser, getProvider } from 'stores/main/selectors';

import OrganizationDetail from './OrganizationDetail';

interface IOrganizationProps {}

const Organization: React.FC<IOrganizationProps> = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const match = useRouteMatch();

  const user = useSelector(getLoggedInUser)!;
  const provider = useSelector(getProvider);

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

Organization.propTypes = {};

export default Organization;
