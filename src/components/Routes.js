import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppRoutes } from 'shared/constants/routes';

import AdminLogin from './Auth/AdminLogin';
import Login from './Auth/Login';
import Logout from './Auth/Logout';
import OAuthCallback from './Auth/OAuthCallback';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import SetPassword from './ForgotPassword/SetPassword';
import Layout from './Layout';
import SignUp from './SignUp/SignUp';
import StyleGuide from './UI/StyleGuide';

const Routes = () => {
  return (
    <Switch>
      <Route component={AdminLogin} path={AppRoutes.AdminLogin} />
      <Route component={Login} path={AppRoutes.Login} />
      <Route component={Logout} path={AppRoutes.Logout} />
      <Route component={SetPassword} path={AppRoutes.SetPassword} />
      <Route component={ForgotPassword} path={AppRoutes.ForgotPassword} />
      <Route component={SignUp} path={AppRoutes.SignUp} />
      <Route component={OAuthCallback} path={AppRoutes.OAuthCallback} />
      <Route component={StyleGuide} path={AppRoutes.StyleGuide} />
      <Route component={Layout} path={AppRoutes.Home} />
    </Switch>
  );
};

export default Routes;
