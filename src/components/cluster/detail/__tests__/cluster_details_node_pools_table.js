import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import { nodePoolPatch as mockNodePoolPatch } from 'actions/nodePoolActions';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import { ThemeProvider } from 'emotion-theming';
import { truncate } from 'lib/helpers';
import initialState from 'test_utils/initialState';
import React from 'react';
import statusState from 'test_utils/statusState';
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

// Cluster and route we are testing with.
const clusterId = 'm0ckd';
const route = `/organizations/acme/clusters/${clusterId}`;

it.skip('renders all node pools in store', async () => {
  const div = document.createElement('div');
  const { getByText } = renderRouteWithStore(route, div);

  const nodePools = Object.keys(initialState().entities.nodePools.items);

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
it.skip('patches node pool name correctly', async () => {
  const div = document.createElement('div');
  const { getAllByText, getByText, container } = renderRouteWithStore(
    route,
    div
  );

  const nodePools = Object.keys(initialState().entities.nodePools.items);
  const nodePool = initialState().entities.nodePools.items[nodePools[0]];
  const nodePoolName = initialState().entities.nodePools.items[nodePools[0]]
    .name;
  const newNodePoolName = 'New NP name';

  await wait(() => {
    // All mock node pools have the same first 14 characters.
    const nodePoolNameEls = getAllByText(truncate(nodePoolName, 14));
    fireEvent.click(nodePoolNameEls[0]);
  });

  container.querySelector(
    `input[value="${nodePoolName}"]`
  ).value = newNodePoolName;

  // TODO change it and look for rendered changes once we have API calls mocked
  // instead of mocked action creators
  const submitButton = getByText(/ok/i);
  fireEvent.click(submitButton);
  expect(mockNodePoolPatch).toHaveBeenCalledTimes(1);
  expect(mockNodePoolPatch).toHaveBeenCalledWith(clusterId, nodePool, {
    name: newNodePoolName,
  });
});

// The modal is opened calling a function that lives in the parent component of
// <NodePoolDropdownMenu>, so we can't test it in isolation, we need to render
// the full tree.
it.skip(`shows the modal when the button is clicked with default values and calls
  the action creator with the correct arguments`, async () => {
  const div = document.createElement('div');
  const state = initialState();

  const { getByText, getAllByText, getAllByTestId } = renderRouteWithStore(
    route,
    div,
    state
  );

  await wait(() => {
    getAllByTestId('node-pool-id')[0];
  });

  const nodePoolId = getAllByTestId('node-pool-id')[0].textContent;
  const nodePool = state.entities.nodePools.items[nodePoolId];
  fireEvent.click(getAllByText('•••')[0]);

  fireEvent.click(getByText(/edit scaling limits/i));
  const modalTitle = getByText(/edit scaling settings for/i);

  // Is the modal in the document?
  expect(modalTitle).toBeInTheDocument();

  // TODO expect correct values and call to action creator.
  // Continue when scaling modal development for NPs is finished.
});
