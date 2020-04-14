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
      <Route path={AppRoutes.AdminLogin} component={AdminLogin} />
      <Route path={AppRoutes.Login} component={Login} />
      <Route path={AppRoutes.Logout} component={Logout} />
      <Route path={AppRoutes.SetPassword} component={SetPassword} />
      <Route path={AppRoutes.ForgotPassword} component={ForgotPassword} />
      <Route path={AppRoutes.SignUp} component={SignUp} />
      <Route path={AppRoutes.OAuthCallback} component={OAuthCallback} />
      <Route path={AppRoutes.StyleGuide} component={StyleGuide} />
      <Route path={AppRoutes.Home} component={Layout} />
    </Switch>
  );
};

export default Routes;
