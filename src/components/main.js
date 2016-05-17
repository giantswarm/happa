'use strict';

var HappaApp = require('./HappaApp');
var React = require('react');
var {Router, Route, browserHistory} = require('react-router');
var render = require('react-dom').render;

require('normalize.css');
require('../styles/main.css');


var content = document.getElementById('content');


render((
  <Router history={browserHistory}>
    <Route path="/" component={HappaApp}>
    </Route>
  </Router>
), content)