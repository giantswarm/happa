'use strict';

var React       = require('react');
var ReactRouter, {Router, Route, IndexRoute, browserHistory} = require('react-router');
var render      = require('react-dom').render;

var Layout = require('./layout');
var newService  = require('./new_service/index');
var docs        = require('./docs/index');
var login       = require('./login/index');

require('normalize.css');
require('../styles/app.scss');

var appContainer = document.getElementById('app');

function requireAuth(nextState, replace) {
  if (true) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }
    });
  }
}

render((
  <Router history={browserHistory}>
    <Route path="/" component={Layout}>
      <IndexRoute component={docs} />
      <Route path = "/services/new" component={newService} onEnter={requireAuth} />
      <Route path = "/login" component={login}/>
    </Route>
  </Router>
), appContainer);