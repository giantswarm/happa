import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';

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
