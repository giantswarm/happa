import Detail from 'Organizations/Detail/Detail';
import * as React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { Redirect, Route, Switch } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';
import LoadingOverlay from 'UI/Display/Loading/LoadingOverlay';

import OrganizationList from './OrganizationList';

const OrganizationIndex: React.FC = () => {
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
          <Route component={Detail} path={OrganizationsRoutes.Detail} />
          <Redirect to={OrganizationsRoutes.Home} />
        </Switch>
      </LoadingOverlay>
    </Breadcrumb>
  );
};

export default OrganizationIndex;
