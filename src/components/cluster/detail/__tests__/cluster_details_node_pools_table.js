import 'jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import { nodePoolPatch as mockedNodePoolPatch } from 'actions/nodePoolActions';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import { ThemeProvider } from 'emotion-theming';
import initialState from 'test_utils/initialState';
import React from 'react';
import theme from 'styles/theme';

// Components
import NodePoolDropdownMenu from '../node_pool_dropdown_menu';

// Mock actions to return nothing, we don't want them perform API calls and we don't
// want them to return any values either cause we are using a mocked store.
jest.mock('actions/userActions');
jest.mock('actions/organizationActions');
jest.mock('actions/clusterActions');
jest.mock('actions/releaseActions');
jest.mock('actions/catalogActions');
jest.mock('actions/nodePoolActions', () => {
  return {
    nodePoolPatch: jest.fn(() => () => Promise.resolve()),
  };
});

it('renders all node pools in store', async () => {
  const div = document.createElement('div');
  const { getByText } = renderRouteWithStore(
    '/organizations/acme/clusters/m0ckd/np',
    div
  );

  const nodePools = Object.keys(initialState().entities.nodePools);

  await wait(() => {
    nodePools.forEach(nodePool => {
      expect(getByText(nodePool)).toBeInTheDocument();
    });
  });
});

it('shows the dropdown when the three dots button is clicked', () => {
  const div = document.createElement('div');
  const { getByText, getByRole } = render(
    <ThemeProvider theme={theme}>
      <NodePoolDropdownMenu render={{ isOpen: true }} />
    </ThemeProvider>,
    div
  );
  fireEvent.click(getByText('•••'));
  const menu = getByRole('menu');
  expect(menu).toBeInTheDocument();
});

// Here we are testing everything UI related.
// We are NOT testing the http call and redux internals, just checking that we are
// calling the right method with the right arguments when clicking the submit button
it('patches node pool name correctly', async () => {
  const div = document.createElement('div');
  const { getByText, container } = renderRouteWithStore(
    '/organizations/acme/clusters/m0ckd/np',
    div
  );

  const nodePools = Object.keys(initialState().entities.nodePools);
  const clusterId = 'm0ckd';
  const nodePool = initialState().entities.nodePools[nodePools[0]];
  const nodePoolName = initialState().entities.nodePools[nodePools[0]].name;
  const newNodePoolName = 'New NP name';

  await wait(() => {
    const nodePoolNameEl = getByText(nodePoolName);
    fireEvent.click(nodePoolNameEl);
  });

  container.querySelector(
    `input[value="${nodePoolName}"]`
  ).value = newNodePoolName;

  const submitButton = getByText(/ok/i);
  fireEvent.click(submitButton);
  expect(mockedNodePoolPatch).toHaveBeenCalledTimes(1);
  expect(mockedNodePoolPatch).toHaveBeenCalledWith(clusterId, nodePool, {
    name: newNodePoolName,
  });
});

// The modal is opened calling a function that lives in the parent component of
// <NodePoolDropdownMenu>, so we can't test it in isolation, we need to render
// the full tree.
it('shows the modal when the button is clicked', async () => {
  const div = document.createElement('div');
  const { getAllByText, getByText } = renderRouteWithStore(
    '/organizations/acme/clusters/m0ckd/np',
    div
  );

  await wait(() => fireEvent.click(getAllByText('•••')[0]));
  fireEvent.click(getByText(/edit scaling limits/i));
  const modalTitle = getByText(/edit scaling settings for/i);
  expect(modalTitle).toBeInTheDocument();

  // TODO Call the action creator with the right args
});
