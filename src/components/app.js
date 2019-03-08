'use strict';

import 'babel-polyfill';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { Route, Switch } from 'react-router-dom';
import AdminLogin from './auth/admin';
import configureStore from '../stores/configureStore';
import ForgotPassword from './forgot_password/index';
import history from '../stores/history';
import Layout from './layout';
import Login from './auth/login';
import Logout from './auth/logout';
import OAuthCallback from './auth/oauth_callback.js';
import React from 'react';
import SetPassword from './forgot_password/set_password';
import SignUp from './signup/index';

// CSS Imports
// Keep the blank lines to allow for a certain ordering!

import 'normalize.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import '../styles/app.sass';
import 'noty/lib/noty.css';
import 'react-datepicker/dist/react-datepicker.css';

var appContainer = document.getElementById('app');

const store = configureStore({});

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <Switch>
          <Route path='/admin-login' component={AdminLogin} />
          <Route path='/login' component={Login} />
          <Route path='/logout' component={Logout} />
          <Route path='/forgot_password/:token/' component={SetPassword} />
          <Route path='/forgot_password' component={ForgotPassword} />
          <Route path='/signup/:token' component={SignUp} />
          <Route path='/oauth/callback' component={OAuthCallback} />

          <Route path='/' component={Layout} />
        </Switch>
      </div>
    </ConnectedRouter>
  </Provider>,
  appContainer
);
