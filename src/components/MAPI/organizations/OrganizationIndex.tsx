import { OrganizationsRoutes } from 'model/constants/routes';
import * as React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { Redirect, Switch } from 'react-router-dom';
import Route from 'Route';
import LoadingOverlay from 'UI/Display/Loading/LoadingOverlay';

import Organization from './Organization';
import OrganizationList from './OrganizationList';

const OrganizationIndex: React.FC<React.PropsWithChildren<unknown>> = () => {
  return (
    <Breadcrumb
      data={{ title: 'ORGANIZATIONS', pathname: OrganizationsRoutes.Home }}
    >
      <LoadingOverlay loading={false}>
        <Switch>
          <Route
            component={OrganizationList}
            exact
            path={OrganizationsRoutes.List}
          />
          <Route component={Organization} path={OrganizationsRoutes.Detail} />
          <Redirect to={OrganizationsRoutes.Home} />
        </Switch>
      </LoadingOverlay>
    </Breadcrumb>
  );
};

export default OrganizationIndex;
