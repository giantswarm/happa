import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ClusterApps from '../ClusterApps';

it('renders without crashing', () => {
  render(getComponentWithStore(ClusterApps, { clusterId: 'test' }));
});

it('does not show the installed apps section at all when showInstalledAppsBlock is false', () => {
  const props = { clusterId: 'test', showInstalledAppsBlock: false };
  const { queryByTestId } = render(getComponentWithStore(ClusterApps, props));

  expect(queryByTestId('installed-apps-section')).toBeNull();
  expect(queryByTestId('installed-apps')).toBeNull();
  expect(queryByTestId('error-loading-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeNull();
});

it('does not render a block for installed apps if there are none', () => {
  const props = { clusterId: 'test', installedApps: [] };
  const { queryByTestId } = render(getComponentWithStore(ClusterApps, props));

  expect(queryByTestId('installed-apps')).toBeNull();
  expect(queryByTestId('error-loading-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeDefined();
});

it('renders a block for installed apps if there are some', () => {
  const props = {
    clusterId: 'test',
    installedApps: [
      {
        metadata: {
          name: 'test-app',
          labels: {},
        },
      },
    ],
  };
  const { queryByTestId } = render(getComponentWithStore(ClusterApps, props));

  expect(queryByTestId('installed-apps')).toBeDefined();
  expect(queryByTestId('error-loading-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeNull();
});
