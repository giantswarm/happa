'use strict';

var React       = require('react');
var ReactRouter, {applyRouterMiddleware, Router, Route, IndexRoute, NotFoundRoute, browserHistory} = require('react-router');
var useScroll   = require('react-router-scroll');
var render      = require('react-dom').render;

var Layout     = require('./layout');
var newService = require('./new_service/index');
var docs       = require('./docs/index');
var login      = require('./login/index');
var logout     = require('./logout/index');
var signup     = require('./signup/index');
var notFound   = require('./not_found/index');
window.Passage = require('../lib/passage_client');

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
  <Router history={browserHistory} render={applyRouterMiddleware(useScroll())}>
    <Route path = "/login" component={login} />
    <Route path = "/logout" component={logout} />
    <Route path = "/signup/:contactId/:token" component={signup} />

    <Route path="/" component={Layout}>
      <IndexRoute component={docs} onEnter={requireAuth} />
      <Route path = "/docs" component={docs} onEnter={requireAuth} />
      <Route path = "/docs/:pageId" component={docs} onEnter={requireAuth} />
      <Route path = "/services/new" component={newService} onEnter={requireAuth} />
      <Route path="*" component={notFound} />
    </Route>
  </Router>
), appContainer);