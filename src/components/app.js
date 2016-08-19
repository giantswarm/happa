'use strict';

import React from 'react';
import ReactRouter, {applyRouterMiddleware, Router, Route, IndexRoute, NotFoundRoute, browserHistory} from 'react-router';
import useScroll from 'react-router-scroll';
import {render} from 'react-dom';
import Layout from './layout';
import docs from './docs/index';
import login from './login/index';
import logout from './logout/index';
import signup from './signup/index';
import notFound from './not_found/index';
import forgot_password_index from './forgot_password/index';
import forgot_password_set_password from './forgot_password/set_password';
import Organizations from './organizations';
import {Provider} from 'react-redux';
import configureStore from '../stores/configureStore';
import organizationDetail from './organizations/detail';
import accountSettings from './account_settings';
import wip from './wip';
import UserActions from '../actions/user_actions';
import UserStore from '../stores/user_store';

require('normalize.css');
require('../styles/app.scss');

var appContainer = document.getElementById('app');

function requireAuth(nextState, replace) {
  UserStore.getInitialState();

  if (! UserStore.isAuthenticated()) {
    replace({
      pathname: '/login',
      query: { nextPathname: nextState.location.pathname }
    });
  }
}

const store = configureStore();

render(
  <Provider store={store}>
    <Router history={browserHistory} render={applyRouterMiddleware(useScroll())}>
      <Route path = "/login" component={login} />
      <Route path = "/logout" component={logout} />
      <Route path = "/forgot_password" component={forgot_password_index} />
      <Route path = "/forgot_password/:token" component={forgot_password_set_password} />
      <Route path = "/signup/:contactId/:token" component={signup} />

      <Route path="/" component={Layout}>
        <IndexRoute component={wip} onEnter={requireAuth} />
        <Route path = "/docs" component={docs} onEnter={requireAuth} />
        <Route path = "/docs/:pageId" component={docs} onEnter={requireAuth} />
        <Route path = "/organizations" component={Organizations} onEnter={requireAuth} />
        <Route path = "/organizations/:orgId" component={organizationDetail} onEnter={requireAuth} />
        <Route path = "/account_settings" component={accountSettings} onEnter={requireAuth} />
        <Route path="*" component={notFound} />
      </Route>
    </Router>
  </Provider>,
  appContainer
);
