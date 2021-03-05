import MapiUnauthorized from 'Auth/MAPI/MapiUnauthorized';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { MainRoutes } from 'shared/constants/routes';

import AdminLogin from './Auth/AdminLogin';
import Login from './Auth/Login';
import Logout from './Auth/Logout';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import SetPassword from './ForgotPassword/SetPassword';
import Layout from './Layout';
import SignUp from './SignUp/SignUp';

const Routes = () => {
  return (
    <Switch>
      <Route component={AdminLogin} path={MainRoutes.AdminLogin} />
      <Route component={Login} path={MainRoutes.Login} />
      <Route component={MapiUnauthorized} path={MainRoutes.Unauthorized} />
      <Route component={Logout} path={MainRoutes.Logout} />
      <Route component={SetPassword} path={MainRoutes.SetPassword} />
      <Route component={ForgotPassword} path={MainRoutes.ForgotPassword} />
      <Route component={SignUp} path={MainRoutes.SignUp} />
      <Route component={Layout} path={MainRoutes.Home} />
    </Switch>
  );
};

export default Routes;
