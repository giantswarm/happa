import '@testing-library/jest-dom/extend-expect';
import { fireEvent, wait } from '@testing-library/react';
import {
  clusterCreate as mockClusterCreate,
  clusterDelete as mockClusterDelete,
  clusterPatch as mockClusterPatch,
} from 'actions/clusterActions';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import initialState from 'test_utils/initialState';
import statusState from 'test_utils/statusState';

// Mock actions to return nothing, we don't want them perform API calls for now,
// and we don't want them to return any values either.
// TODO To be changed when mocked http calls ready.
jest.mock('actions/userActions');
jest.mock('actions/organizationActions');
jest.mock('actions/clusterActions', () => {
  return {
    clustersLoad: jest.fn(() => () => Promise.resolve()),
    clusterLoadApps: jest.fn(() => () => Promise.resolve()),
    clusterLoadDetails: jest.fn(() => () => Promise.resolve()),
    clusterLoadKeyPairs: jest.fn(() => () => Promise.resolve()),
    clusterCreate: jest.fn(() => () => Promise.resolve()),
    clusterDelete: jest.fn(() => () => Promise.resolve()),
    clusterPatch: jest.fn(() => () => Promise.resolve()),
    clusterLoadDetailsSuccess: jest.fn(() => () => Promise.resolve()),
  };
});
jest.mock('actions/releaseActions');
jest.mock('actions/catalogActions');

// TODO rewrite it as the form is renered dinammically depending if the user is
// creating a NPs Cluster or a regular one.
it.skip('drives us to the cluster creation form when launch new cluster button is clicked', async () => {
  const div = document.createElement('div');
  const { getByText, getByTestId } = renderRouteWithStore('/', div);

  await wait(() => {
    const button = getByText(/launch new cluster/i);
    fireEvent.click(button);
  });

  expect(getByTestId('cluster-creation-view')).toBeInTheDocument();
});

// TODO change it and look for rendered changes once we have API methods mocked
// instead of action creators mocked
// TODO rewrite it as the form is renered dinammically depending if the user is
// creating a NPs Cluster or a regular one.
it.skip(`renders the form when in new cluster route with default values and calls
    the action creator with the correct arguments`, async () => {
  const div = document.createElement('div');
  const { container } = renderRouteWithStore(
    '/organizations/acme/clusters/new/',
    div
  );

  await wait(() => container.querySelector('input'));

  // TODO we need labels in the component instead h3s or alt attr on inputs,
  // something more semantic than this.
  const inputs = container.querySelectorAll('input');

  const name = 'New cluster name';
  const availability_zones = +inputs[1].value;
  const scaling = { min: +inputs[3].value, max: +inputs[4].value };
  const owner = initialState().app.selectedOrganization;

  const releases = initialState().entities.releases.items;
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

  // Change the name and submit the form.
  fireEvent.change(inputs[0], { target: { value: name } });
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

  expect(mockClusterCreate).toHaveBeenCalledTimes(1);
  expect(mockClusterCreate).toHaveBeenCalledWith(payload);
});

it('deletes a v4 cluster using the button in cluster details view', async () => {
  const div = document.createElement('div');
  const clusterId = 'zu6w0';
  const { getByText, debug } = renderRouteWithStore(
    `/organizations/acme/clusters/${clusterId}`,
    div
  );

  // await wait(() => debug());
  // fireEvent.click(getByText(/delete cluster/i));

  // expect(mockClusterDelete).toHaveBeenCalledTimes(1);
  // expect(mockClusterDelete).toHaveBeenCalledWith(
  //   initialState().entities.clusters.items[clusterId]
  // );
});

// The modal is opened calling a function that lives in the parent component of
// <NodePoolDropdownMenu>, so we can't test it in isolation, we need to render
// the full tree.
it.skip(`shows the scaling settings modal when the button is clicked with default values and calls
  the action creator with the correct arguments`, async () => {
  const div = document.createElement('div');
  const clusterId = 'zu6w0';

  const state = initialState();
  const cluster = state.entities.clusters.items[clusterId];
  cluster.status = statusState();

  const { getByText, getByLabelText } = renderRouteWithStore(
    `/organizations/acme/clusters/${clusterId}`,
    div,
    state
  );

  await wait(() => getByText(/edit/i));
  fireEvent.click(getByText(/edit/i));
  const modalTitle = getByText(/edit scaling settings for/i);

  // Is the modal in the document?
  expect(modalTitle).toBeInTheDocument();

  const clusterScaling = initialState().entities.clusters.items[clusterId]
    .scaling;
  const min = clusterScaling.min.toString();
  const max = clusterScaling.max.toString();

  await wait(() => getByLabelText(/minimum/i));
  const inputMin = getByLabelText(/minimum/i);
  const inputMax = getByLabelText(/maximum/i);

  // Are the correct values in the correct fields?
  expect(inputMin.value).toBe(min);
  expect(inputMax.value).toBe(max);

  const increaseValue = 1;
  const newScaling = {
    min: +inputMin.value + increaseValue,
    max: +inputMax.value + increaseValue,
  };

  // // Change the values and modify the scaling settings
  fireEvent.change(inputMax, { target: { value: newScaling.max } });
  fireEvent.change(inputMin, { target: { value: newScaling.min } });

  await wait(() =>
    getByText(`Increase minimum number of nodes by ${increaseValue}`)
  );

  // TODO change it and look for rendered changes once we have API methods mocked
  // instead of action creators mocked
  const submitButton = getByText(
    `Increase minimum number of nodes by ${increaseValue}`
  );
  fireEvent.click(submitButton);
  expect(mockClusterPatch).toHaveBeenCalledTimes(1);
  expect(mockClusterPatch).toHaveBeenCalledWith(cluster, {
    scaling: { min: newScaling.min, max: newScaling.max },
  });
});
