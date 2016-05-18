'use strict';

var createServiceWizard = require('./create_service_wizard/index');
var React               = require('react');
var ReactRouter         = require('react-router');
var render              = require('react-dom').render;

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var browserHistory = ReactRouter.browserHistory;

require('normalize.css');
require('../styles/app.scss');

var appContainer = document.getElementById('app');

render((
  <Router history={browserHistory}>
    <Route path = "/" component={createServiceWizard}>
    </Route>
  </Router>
), appContainer);