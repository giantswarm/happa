import 'jest-dom/extend-expect';
import { fireEvent, wait } from '@testing-library/react';
import {
  clusterCreate as mockClusterCreate,
  clusterDelete as mockClusterDelete,
} from 'actions/clusterActions';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import initialState from 'test_utils/initialState';

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
    clusterDelete: jest.fn(() => () => Promise.resolve()),
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

it(`renders the form when in new cluster route with default values and calls
    the action creator with the correct arguments`, async () => {
  const div = document.createElement('div');
  const { container } = renderRouteWithStore(
    '/organizations/acme/clusters/new/',
    div
  );

  await wait(() => container.querySelector('input'));

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

it('deletes a cluster using the button in cluster details view', async () => {
  const div = document.createElement('div');
  const clusterId = 'zu6w0';
  const { getByText } = renderRouteWithStore(
    `/organizations/acme/clusters/${clusterId}`,
    div
  );

  await wait(() => getByText(/delete cluster/i));
  fireEvent.click(getByText(/delete cluster/i));

  expect(mockClusterDelete).toHaveBeenCalledTimes(1);
  expect(mockClusterDelete).toHaveBeenCalledWith(
    initialState.entities.clusters.items[clusterId]
  );
});
