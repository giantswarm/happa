'use strict';

var React       = require('react');
var ReactRouter, {applyRouterMiddleware, Router, Route, IndexRoute, NotFoundRoute, browserHistory} = require('react-router');
var useScroll   = require('react-router-scroll');
var render      = require('react-dom').render;

var Layout                = require('./layout');
var docs                  = require('./docs/index');
var login                 = require('./login/index');
var logout                = require('./logout/index');
var signup                = require('./signup/index');
var notFound              = require('./not_found/index');
var forgot_password_index = require('./forgot_password/index');
var forgot_password_set_password = require('./forgot_password/set_password');
var wip = require('./wip');

var UserActions = require('../actions/user_actions');
var UserStore   = require('../stores/user_store');

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

render((
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
      <Route path="*" component={notFound} />
    </Route>
  </Router>
), appContainer);