'use strict';

var logo = require('./logo');
var React = require('react');
var {Router, Route, browserHistory} = require('react-router');
var render = require('react-dom').render;

require('normalize.css');
require('../styles/app.scss');

var appContainer = document.getElementById('app');

render((
  <Router history={browserHistory}>
    <Route path = "/" component={logo}>
    </Route>
  </Router>
), appContainer)