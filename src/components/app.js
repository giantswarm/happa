'use strict';

import 'babel-polyfill';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { render } from 'react-dom';
import Layout from './layout';
import adminLogin from './auth/admin';
import login from './auth/login';
import logout from './auth/logout';
import signup from './signup/index';
import oauth_callback from './auth/oauth_callback.js';
import forgot_password_index from './forgot_password/index';
import forgot_password_set_password from './forgot_password/set_password';
import { Provider } from 'react-redux';
import configureStore from '../stores/configureStore';
import history from '../stores/history';
import { ConnectedRouter } from 'connected-react-router';


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
        <Route path="/admin-login" component={adminLogin} />
        <Route path="/login" component={login} />
        <Route path="/logout" component={logout} />
        <Route path="/forgot_password/:token/" component={forgot_password_set_password} />
        <Route path="/forgot_password" component={forgot_password_index} />
        <Route path="/signup/:token" component={signup} />
        <Route path="/oauth/callback" component={oauth_callback} />

        <Route path='/' component={Layout} />
        </Switch>
      </div>
    </ConnectedRouter>
  </Provider>,
  appContainer
);
