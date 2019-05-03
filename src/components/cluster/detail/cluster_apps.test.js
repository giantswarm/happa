import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';

import ClusterApps from './cluster_apps.js';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Router>
      <ClusterApps />
    </Router>,
    div
  );
});

it('doesnt render a block for installed apps if there are none', () => {
  const noApps = [];
  const clusterApps = mount(<Router><ClusterApps installedApps={noApps} /></Router>);
  expect(clusterApps.find('#installed-apps').exists()).toEqual(false);
});

it('renders a block for installed apps if there are some', () => {
  const someApps = [{}];
  const clusterApps = mount(<Router><ClusterApps installedApps={someApps} /></Router>);
  expect(clusterApps.find('#installed-apps').exists()).toEqual(true);
});