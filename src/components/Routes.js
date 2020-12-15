import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { OtherRoutes } from 'shared/constants/routes';

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
      <Route component={AdminLogin} path={OtherRoutes.AdminLogin} />
      <Route component={Login} path={OtherRoutes.Login} />
      <Route component={Logout} path={OtherRoutes.Logout} />
      <Route component={SetPassword} path={OtherRoutes.SetPassword} />
      <Route component={ForgotPassword} path={OtherRoutes.ForgotPassword} />
      <Route component={SignUp} path={OtherRoutes.SignUp} />
      <Route component={OAuthCallback} path={OtherRoutes.OAuthCallback} />
      <Route component={StyleGuide} path={OtherRoutes.StyleGuide} />
      <Route component={Layout} path={OtherRoutes.Home} />
    </Switch>
  );
};

export default Routes;
