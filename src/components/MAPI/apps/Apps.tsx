import AppList from 'MAPI/apps/AppList';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { Switch } from 'react-router-dom';
import Route from 'Route';
import { AppsRoutes } from 'shared/constants/routes';

import AppDetail from './AppList/AppDetail';
import AppsProvider from './AppsProvider';

const Apps: React.FC<{}> = () => {
  return (
    <Breadcrumb
      data={{
        title: 'Apps'.toUpperCase(),
        pathname: AppsRoutes.Home,
      }}
    >
      <AppsProvider>
        <Switch>
          <Route
            exact={true}
            path={AppsRoutes.AppDetail}
            component={AppDetail}
          />
          <Route path={AppsRoutes.Home} component={AppList} />
        </Switch>
      </AppsProvider>
    </Breadcrumb>
  );
};

export default Apps;
