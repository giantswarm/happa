import Cluster from 'Cluster/Cluster';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { Redirect, Switch, useParams, useRouteMatch } from 'react-router';
import Route from 'Route';
import { OrganizationsRoutes } from 'shared/constants/routes';

import OrganizationDetail from './OrganizationDetail';

interface IOrganizationProps {}

const Organization: React.FC<IOrganizationProps> = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const match = useRouteMatch();

  return (
    <Breadcrumb
      data={{
        title: orgId.toUpperCase(),
        pathname: match.url,
      }}
    >
      <Switch>
        <Route component={Cluster} path={OrganizationsRoutes.Clusters.Home} />
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
