import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitFor } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { getNumberOfNodes } from 'stores/cluster/utils';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  getMockCall,
  getMockCallTimes,
  metadataResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v4ClustersResponse,
} from 'test/mockHttpCalls';
import { renderRouteWithStore } from 'test/renderUtils';

// Responses to requests
beforeEach(() => {
  getConfiguration.mockResolvedValueOnce(metadataResponse);
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/organizations/', orgsResponse);
  getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
  getMockCall('/v4/releases/', releasesResponse);
  getMockCall('/v4/appcatalogs/', appCatalogsResponse);
  getMockCall('/v4/clusters/', v4ClustersResponse);
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
  getMockCallTimes(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AWSClusterStatusResponse,
    2
  );
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse, 2);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
});

/************ TESTS ************/

// This triggers a warning because of this weird array-like value we are receiving
// as a response to the apps call. Here we are using a real array to mock the response
// and hence the warning because we are transforming an array into an array
it('renders all the v4 AWS cluster data correctly without nodes ready', async () => {
  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.Home,
    {
      orgId: ORGANIZATION,
      clusterId: V4_CLUSTER.id,
    }
  );
  const { getByText, findByText, findAllByText, findByTestId } =
    renderRouteWithStore(clusterDetailPath);

  const clusterHeader = await findByText(V4_CLUSTER.name);
  expect(clusterHeader).toBeInTheDocument();

  const clusterIDElements = await findAllByText(V4_CLUSTER.id);
  expect(clusterIDElements).toHaveLength(2);

  const expectedNodesRunning = getNumberOfNodes({
    ...v4AWSClusterResponse,
    status: v4AWSClusterStatusResponse,
  }).toString();

  const expectedNodesDesired =
    v4AWSClusterStatusResponse.cluster.scaling.desiredCapacity.toString();

  const nodesRunning = await findByTestId('running-nodes');
  expect(nodesRunning.querySelector('div:nth-child(2)').textContent).toBe(
    expectedNodesRunning
  );

  const nodesDesired = await findByTestId('desired-nodes');
  expect(nodesDesired.querySelector('div:nth-child(2)').textContent).toBe(
    expectedNodesDesired
  );

  expect(getByText(v4AWSClusterResponse.api_endpoint)).toBeInTheDocument();
  // n/a because the cluster hasn't been updated yet
  expect(document.querySelector('abbr')).toHaveTextContent('n/a');
  expect(getByText(V4_CLUSTER.AWSInstanceType)).toBeInTheDocument();
  expect(getByText('Pinned at 3')).toBeInTheDocument();
});

it(`shows the v4 AWS cluster scaling modal when the button is clicked with default values and
scales correctly`, async () => {
  const cluster = v4AWSClusterResponse;
  const defaultScaling = cluster.scaling;
  const increaseValue = 1;
  const newScaling = {
    min: defaultScaling.min + increaseValue,
    max: defaultScaling.max + increaseValue,
  };

  const clusterPatchResponse = {
    ...cluster,
    scaling: newScaling,
    workers: [
      ...cluster.workers,
      cluster.workers[0], // Just adding another worker
    ],
  };

  // Cluster patch request
  nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${V4_CLUSTER.id}/`, 'PATCH')
    .reply(StatusCodes.Ok, clusterPatchResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.Home,
    {
      orgId: ORGANIZATION,
      clusterId: V4_CLUSTER.id,
    }
  );
  const { getByTestId, getByText, getByLabelText } =
    renderRouteWithStore(clusterDetailPath);

  await waitFor(() => {
    expect(
      getByTestId('desired-nodes').querySelector('div:nth-child(2)').textContent
    ).toBe('3');
    expect(
      getByTestId('running-nodes').querySelector('div:nth-child(2)').textContent
    ).toBe('3');
  });

  // Click edit button. Will throw an error if it founds more thanon edit button
  fireEvent.click(getByText(/edit/i));

  await waitFor(() => getByText(/edit scaling settings for/i));

  // Is the modal in the document?
  const modalTitle = getByText(/edit scaling settings for/i);
  expect(modalTitle).toBeInTheDocument();
  expect(modalTitle).toHaveTextContent(V4_CLUSTER.id);

  const inputMin = getByLabelText(/minimum/i);
  const inputMax = getByLabelText(/maximum/i);

  // Are the correct values in the correct fields?
  expect(inputMin.value).toBe(defaultScaling.min.toString());
  expect(inputMax.value).toBe(defaultScaling.max.toString());

  // Change the values and modify the scaling settings
  fireEvent.change(inputMax, { target: { value: newScaling.max } });
  await waitFor(() => expect(inputMax.value).toBe(newScaling.max.toString()));

  fireEvent.change(inputMin, { target: { value: newScaling.min } });
  const textButton = `Increase minimum number of nodes by ${increaseValue}`;
  const submitButton = getByText(textButton);
  fireEvent.click(submitButton);

  //Wait for the Flash message to appear
  await waitFor(() => {
    getByText(/the cluster will be scaled within the next couple of minutes./i);
    // Does the cluster have node values updated?
    expect(getByText(`Pinned at ${newScaling.min}`));
  });
});

it('patches v4 cluster name correctly', async () => {
  const newClusterName = 'New cluster name';
  const clusterName = V4_CLUSTER.name;

  // Response to request should be the exact same NP with the new name
  const clusterPatchResponse = {
    ...v4AWSClusterResponse,
    name: newClusterName,
  };

  // Request
  nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${V4_CLUSTER.id}/`, 'PATCH')
    .reply(StatusCodes.Ok, clusterPatchResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.Home,
    {
      orgId: ORGANIZATION,
      clusterId: V4_CLUSTER.id,
    }
  );
  // Mounting
  const { getByText, getByDisplayValue } =
    renderRouteWithStore(clusterDetailPath);

  await waitFor(() => getByText(clusterName));
  const clusterNameEl = getByText(clusterName);
  fireEvent.click(clusterNameEl);

  await waitFor(() => getByDisplayValue(clusterName));

  // Change the new name and submit it.
  fireEvent.change(getByDisplayValue(clusterName), {
    target: { value: newClusterName },
  });

  const submitButton = getByText(/ok/i);
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(getByText(newClusterName)).toBeInTheDocument();
  });
});
