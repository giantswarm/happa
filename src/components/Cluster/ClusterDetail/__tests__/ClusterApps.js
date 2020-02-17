import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ClusterApps from '../ClusterApps';

it('renders without crashing', () => {
  render(getComponentWithStore(ClusterApps));
});

it('doesnt show the installed apps section at all when showInstalledAppsBlock is false', () => {
  const props = { showInstalledAppsBlock: false };
  const { queryByTestId } = render(getComponentWithStore(ClusterApps, props));

  expect(queryByTestId('installed-apps-section')).toBeNull();
  expect(queryByTestId('installed-apps')).toBeNull();
  expect(queryByTestId('error-loading-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeNull();
});

it('doesnt render a block for installed apps if there are none', () => {
  const props = { installedApps: [] };
  const { queryByTestId } = render(getComponentWithStore(ClusterApps, props));

  expect(queryByTestId('installed-apps')).toBeNull();
  expect(queryByTestId('error-loading-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeDefined();
});

it('renders a block for installed apps if there are some', () => {
  const someApps = {
    installedApps: [
      {
        metadata: {
          name: 'test-app',
          labels: {},
        },
      },
    ],
  };
  const { queryByTestId } = render(
    getComponentWithStore(ClusterApps, someApps)
  );

  expect(queryByTestId('installed-apps')).toBeDefined();
  expect(queryByTestId('error-loading-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeNull();
});
