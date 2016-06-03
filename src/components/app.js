'use strict';

var React       = require('react');
var ReactRouter, {Router, Route, IndexRoute, hashHistory} = require('react-router');
var render      = require('react-dom').render;

var Layout     = require('./layout');
var newService = require('./new_service/index');
var docs       = require('./docs/index');
var login      = require('./login/index');
var logout     = require('./logout/index');
var signup     = require('./signup/index');

var UserActions = require('./reflux_actions/user_actions');
var UserStore   = require('./reflux_stores/user_store');

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
  <Router history={hashHistory}>
    <Route path="/" component={Layout}>
      <IndexRoute component={docs} onEnter={requireAuth} />
      <Route path = "/services/new" component={newService} onEnter={requireAuth} />
      <Route path = "/signup/:contactId/:token/" component={signup} />
      <Route path = "/login" component={login} />
      <Route path = "/logout" component={logout} />
    </Route>
  </Router>
), appContainer);