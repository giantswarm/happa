import { render, screen } from '@testing-library/react';
import { getComponentWithStore } from 'test/renderUtils';

import ClusterApps from '../ClusterApps';

it('renders without crashing', () => {
  render(getComponentWithStore(ClusterApps, { clusterId: 'test' }));
});

it('does not show the installed apps section at all when showInstalledAppsBlock is false', () => {
  const props = { clusterId: 'test', showInstalledAppsBlock: false };
  render(getComponentWithStore(ClusterApps, props));

  expect(
    screen.queryByLabelText('Apps installed by user')
  ).not.toBeInTheDocument();
  expect(screen.queryByText('Error Loading Apps:')).not.toBeInTheDocument();
  expect(
    screen.queryByText('No apps installed on this cluster')
  ).not.toBeInTheDocument();
});

it('does not render a block for installed apps if there are none', () => {
  const props = {
    clusterId: 'test',
    installedApps: [],
    showInstalledAppsBlock: true,
  };
  render(getComponentWithStore(ClusterApps, props));

  expect(
    screen.getByText('No apps installed on this cluster')
  ).toBeInTheDocument();

  expect(
    screen.queryByLabelText('Apps installed by user')
  ).not.toBeInTheDocument();
  expect(screen.queryByText('Error Loading Apps:')).not.toBeInTheDocument();
});

it('renders a block for installed apps if there are some', () => {
  const props = {
    clusterId: 'test',
    showInstalledAppsBlock: true,
    installedApps: [
      {
        metadata: {
          name: 'test-app',
          labels: {},
        },
        spec: {
          version: '',
          catalog: '',
          name: '',
          namespace: '',
          user_config: {
            configmap: {
              name: '',
              namespace: '',
            },
            secret: {
              name: '',
              namespace: '',
            },
          },
        },
        status: {
          app_version: '',
          version: '',
          release: {
            last_deployed: '',
            status: '',
          },
        },
      },
    ],
  };
  render(getComponentWithStore(ClusterApps, props));

  expect(screen.getByLabelText('Apps installed by user')).toBeInTheDocument();

  expect(screen.queryByText('Error Loading Apps:')).not.toBeInTheDocument();
  expect(
    screen.queryByText('No apps installed on this cluster')
  ).not.toBeInTheDocument();
});
