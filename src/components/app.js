'use strict';

import 'babel-polyfill';
import AdminLogin from './auth/admin';
import configureStore from '../stores/configureStore';
import { ConnectedRouter } from 'connected-react-router';
import ForgotPassword from './forgot_password/index';
import forgot_password_set_password from './forgot_password/set_password';
import history from '../stores/history';
import Layout from './layout';
import Login from './auth/login';
import Logout from './auth/logout';
import OAuthCallback from './auth/oauth_callback.js';
import { Provider } from 'react-redux';
import React from 'react';
import { render } from 'react-dom';
import { Route, Switch } from 'react-router-dom';
import SignUp from './signup/index';

// CSS Imports.
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/app.sass';
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
          <Route
            path='/forgot_password/:token/'
            component={forgot_password_set_password}
          />
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
