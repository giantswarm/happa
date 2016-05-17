'use strict';

var HappaApp = require('./HappaApp');
var React = require('react');
var {Router, Route, browserHistory} = require('react-router');
var render = require('react-dom').render;

require('normalize.css');
require('../styles/app.scss');

var content = document.getElementById('app');

render((
  <Router history={browserHistory}>
    <Route path="/" component={HappaApp}>
    </Route>
  </Router>
), content)