import { Route, Switch } from 'react-router-dom';
import AdminLogin from './auth/admin';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import Layout from './Layout';
import Login from './auth/login';
import Logout from './auth/Logout';
import OAuthCallback from './auth/OAuthCallback';
import React from 'react';
import SetPassword from './ForgotPassword/SetPassword';
import SignUp from './SignUp/SignUp';
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
