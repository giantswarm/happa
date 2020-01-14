import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import ClusterApps from '../ClusterApps';

it('renders without crashing', () => {
  render(
    <Router>
      <ClusterApps />
    </Router>
  );
});

it('doesnt show the installed apps section at all when showInstalledAppsBlock is false', () => {
  const { queryByTestId } = render(
    <Router>
      <ClusterApps showInstalledAppsBlock={false} />
    </Router>
  );

  expect(queryByTestId('installed-apps-section')).toBeNull();
  expect(queryByTestId('installed-apps')).toBeNull();
  expect(queryByTestId('error-loading-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeNull();
});

it('doesnt render a block for installed apps if there are none', () => {
  const noApps = [];
  const { queryByTestId } = render(
    <Router>
      <ClusterApps installedApps={noApps} showInstalledAppsBlock={true} />
    </Router>
  );

  expect(queryByTestId('installed-apps')).toBeNull();
  expect(queryByTestId('error-loading-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeDefined();
});

it('renders an error message if there was an error loading apps', () => {
  const { queryByTestId } = render(
    <Router>
      <ClusterApps errorLoading={true} showInstalledAppsBlock={true} />
    </Router>
  );

  expect(queryByTestId('error-loading-apps')).toBeDefined();
  expect(queryByTestId('installed-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeNull();
});

it('renders a block for installed apps if there are some', () => {
  const someApps = [
    {
      metadata: {
        name: 'test-app',
        labels: {},
      },
    },
  ];
  const { queryByTestId } = render(
    <Router>
      <ClusterApps installedApps={someApps} showInstalledAppsBlock={true} />
    </Router>
  );

  expect(queryByTestId('installed-apps')).toBeDefined();
  expect(queryByTestId('error-loading-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeNull();
});
