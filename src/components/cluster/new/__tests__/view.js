import 'jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// import { nodePoolPatch as mockedNodePoolPatch } from 'actions/nodePoolActions';
import {
  renderRouteWithStore,
  renderWithRouter,
} from 'test_utils/renderRouteWithStore';
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
jest.mock('actions/clusterActions');
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

it('renders form when in new cluster route with default values', async () => {
  const div = document.createElement('div');
  const { getByDisplayValue, debug, container } = renderRouteWithStore(
    '/organizations/acme/clusters/new/',
    div
  );

  await wait(() => {});

  // TODO we need labels in the component instead h3s or alt attr on inputs,
  // something more semantic than this
  const inputs = container.querySelectorAll('input');
  expect(inputs[0]).toHaveValue('My cluster');
  expect(inputs[1]).toHaveValue(1);
  expect(inputs[2]).toHaveValue('m3.large');
  expect(inputs[3]).toHaveValue(3);
  expect(inputs[4]).toHaveValue(3);
});

it('sends the data to the action creator', async () => {
  const div = document.createElement('div');
  const { getByDisplayValue, debug, container } = renderRouteWithStore(
    '/organizations/acme/clusters/new/',
    div
  );

  await wait(() => {});
});
