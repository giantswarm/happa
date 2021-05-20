import AppList from 'MAPI/apps/AppList';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { Switch } from 'react-router-dom';
import Route from 'Route';
import { Providers } from 'shared/constants';
import { AppsRoutes } from 'shared/constants/routes';
import { getLoggedInUser, getProvider } from 'stores/main/selectors';
import { LoggedInUserTypes } from 'stores/main/types';

import AppDetail from './AppDetail/AppDetail';
import AppsList from './AppsList/AppsList';

const Apps: React.FC = () => {
  const user = useSelector(getLoggedInUser);
  const provider = useSelector(getProvider);

  return (
    <Breadcrumb
      data={{
        title: 'Apps'.toUpperCase(),
        pathname: AppsRoutes.Home,
      }}
    >
      <Switch>
        <Route exact path={AppsRoutes.AppDetail} component={AppDetail} />

        {user?.type === LoggedInUserTypes.MAPI && provider !== Providers.KVM ? (
          <Route path={AppsRoutes.Home} component={AppList} />
        ) : (
          <Route path={AppsRoutes.Home} component={AppsList} />
        )}
      </Switch>
    </Breadcrumb>
  );
};

export default Apps;
