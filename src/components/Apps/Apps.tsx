import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { Route, Switch } from 'react-router-dom';
import { AppsRoutes } from 'shared/constants/routes';

import AppDetails from './AppDetail/AppDetail';
import AppsList from './AppsList/AppsList';

const Apps: React.FC = () => {
  return (
    <Breadcrumb
      data={{
        title: 'Apps'.toUpperCase(),
        pathname: AppsRoutes.Home,
      }}
    >
      <Switch>
        <Route exact path={AppsRoutes.AppDetail} component={AppDetails} />
        <Route path={AppsRoutes.Home} component={AppsList} />
      </Switch>
    </Breadcrumb>
  );
};

export default Apps;
