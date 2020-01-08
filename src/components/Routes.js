import React from 'react';
import { Route, Switch } from 'react-router-dom';

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
