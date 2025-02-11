import { MainRoutes } from 'model/constants/routes';
import React from 'react';
import { Switch } from 'react-router-dom';
import Route from 'Route';

import AdminLogin from './Auth/AdminLogin';
import Login from './Auth/Login';
import Logout from './Auth/Logout';
import Layout from './Layout';

const Routes = () => {
  return (
    <Switch>
      <Route component={AdminLogin} path={MainRoutes.AdminLogin} />
      <Route component={Login} path={MainRoutes.Login} />
      <Route component={Logout} path={MainRoutes.Logout} />
      <Route component={Layout} path={MainRoutes.Home} />
    </Switch>
  );
};

export default Routes;
