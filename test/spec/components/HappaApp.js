'use strict';

describe('HappaApp', function () {
  var React = require('react/addons');
  var HappaApp, component;

  beforeEach(function () {
    var container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    HappaApp = require('components/HappaApp.js');
    component = React.createElement(HappaApp);
  });

  it('should create a new instance of HappaApp', function () {
    expect(component).toBeDefined();
  });
});
