'use strict';

var newService  = require('./new_service/index');
var React       = require('react');
var ReactRouter = require('react-router');
var render      = require('react-dom').render;
var docs        = require('./docs/index');

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var browserHistory = ReactRouter.browserHistory;

require('normalize.css');
require('../styles/app.scss');

var appContainer = document.getElementById('app');

render((
  <Router history={browserHistory}>
    <Route path = "/" component={docs} />
    <Route path = "/services/new" component={newService} />
  </Router>
), appContainer);