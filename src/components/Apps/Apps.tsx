import AppList from 'MAPI/apps/AppList';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { Switch } from 'react-router-dom';
import Route from 'Route';
import { AppsRoutes } from 'shared/constants/routes';
import { getLoggedInUser } from 'stores/main/selectors';
import { LoggedInUserTypes } from 'stores/main/types';

import AppDetail from './AppDetail/AppDetail';
import AppsList from './AppsList/AppsList';

const Apps: React.FC = () => {
  const user = useSelector(getLoggedInUser);

  return (
    <Breadcrumb
      data={{
        title: 'Apps'.toUpperCase(),
        pathname: AppsRoutes.Home,
      }}
    >
      <Switch>
        <Route exact path={AppsRoutes.AppDetail} component={AppDetail} />

        {user?.type === LoggedInUserTypes.MAPI ? (
          <Route path={AppsRoutes.Home} component={AppList} />
        ) : (
          <Route path={AppsRoutes.Home} component={AppsList} />
        )}
      </Switch>
    </Breadcrumb>
  );
};

export default Apps;
