import 'jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { clusterCreate as mockedClusterCreate } from 'actions/clusterActions';
// import { nodePoolPatch as mockedNodePoolPatch } from 'actions/nodePoolActions';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
// import { ThemeProvider } from 'emotion-theming';
import initialState from 'test_utils/initialState';
import React from 'react';

// import theme from 'styles/theme';
import Layout from 'layout';

// Components
import CreateCluster from '../view';

// Mock actions to return nothing, we don't want them perform API calls and we don't
// want them to return any values either cause we are using a mocked store.
jest.mock('actions/userActions');
jest.mock('actions/organizationActions');
jest.mock('actions/clusterActions', () => {
  return {
    clustersLoad: jest.fn(() => () => Promise.resolve()),
    clusterLoadDetails: jest.fn(() => () => Promise.resolve()),
    clusterLoadKeyPairs: jest.fn(() => () => Promise.resolve()),
    clusterCreate: jest.fn(() => () => Promise.resolve()),
  };
});
jest.mock('actions/releaseActions');
jest.mock('actions/catalogActions');

// TODO find a way tot test router links
it.skip('drives us to the cluster creation form when launch new cluster button is clicked', async () => {
  const div = document.createElement('div');
  const { getByText } = renderRouteWithStore('/', div);

  await wait(() => {
    const button = getByText(/launch new cluster/i);
    fireEvent.click(button);
    expect(getByText(/create cluster/i)).toBeInTheDocument();
  });
});

it('renders form when in new cluster route with default values and sends data in inputs to the action creator', async () => {
  const div = document.createElement('div');
  const { container, getByAltText, debug } = renderRouteWithStore(
    '/organizations/acme/clusters/new/',
    div
  );

  await wait(() => {});

  // TODO we need labels in the component instead h3s or alt attr on inputs,
  // something more semantic than this. If
  const inputs = container.querySelectorAll('input');
  const name = inputs[0].value;
  const availability_zones = +inputs[1].value;
  const scaling = { min: +inputs[3].value, max: +inputs[4].value };
  const owner = initialState.app.selectedOrganization;

  const releases = initialState.entities.releases.items;
  const releases_active = Object.keys(releases).filter(release => {
    return releases[release].active === true;
  });
  const release_version = releases_active[releases_active.length - 1];
  const workers = [
    {
      aws: {
        instance_type: `${inputs[2].value}`,
      },
    },
  ];

  expect(inputs[0]).toHaveValue('My cluster');
  expect(inputs[1]).toHaveValue(1);
  expect(inputs[2]).toHaveValue('m3.large');
  expect(inputs[3]).toHaveValue(3);
  expect(inputs[4]).toHaveValue(3);

  debug(inputs);

  const submitButton = container.querySelector('button[type="submit"]');
  fireEvent.click(submitButton);

  const payload = {
    availability_zones,
    scaling,
    name,
    owner,
    release_version,
    workers,
  };

  expect(mockedClusterCreate).toHaveBeenCalledTimes(1);
  expect(mockedClusterCreate).toHaveBeenCalledWith(payload);
});
