import { Route, Switch } from 'react-router-dom';
import AdminLogin from './auth/admin';
import ForgotPassword from './forgot_password/index';
import Layout from './layout';
import Login from './auth/login';
import Logout from './auth/logout';
import OAuthCallback from './auth/oauth_callback';
import React from 'react';
import SetPassword from './forgot_password/set_password';
import SignUp from './signup/index';
import StyleGuide from './UI/style_guide';

const Routes = () => {
  return (
    <Switch>
      <Route component={AdminLogin} path='/admin-login' />
      <Route component={Login} path='/login' />
      <Route component={Logout} path='/logout' />
      <Route component={SetPassword} path='/forgot_password/:token/' />
      <Route component={ForgotPassword} path='/forgot_password' />
      <Route component={SignUp} path='/signup/:token' />
      <Route component={OAuthCallback} path='/oauth/callback' />
      <Route component={StyleGuide} path='/styleguide' />
      <Route component={Layout} path='/' />
    </Switch>
  );
};

export default Routes;
