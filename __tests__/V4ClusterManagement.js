import '@testing-library/jest-dom/extend-expect';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  getPersistedMockCall,
  infoResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v4ClustersResponse,
} from 'test_utils/mockHttpCalls';
import { fireEvent, wait } from '@testing-library/react';
import { renderRouteWithStore } from 'test_utils/renderRouteWithStore';
import nock from 'nock';

// Cluster and route we are testing with.
const ROUTE = `/organizations/${ORGANIZATION}/clusters/${V4_CLUSTER.id}`;

// Tests setup
const requests = {};

// Responses to requests
beforeAll(() => {
  requests.userInfo = getPersistedMockCall('/v4/user/', userResponse);
  requests.info = getPersistedMockCall('/v4/info/', infoResponse);
  requests.organizations = getPersistedMockCall(
    '/v4/organizations/',
    orgsResponse
  );
  requests.organization = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/`,
    orgResponse
  );
  requests.clusters = getPersistedMockCall('/v4/clusters/', v4ClustersResponse);
  requests.cluster = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/`,
    v4AWSClusterResponse
  );
  requests.status = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AWSClusterStatusResponse
  );
  requests.apps = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/apps/`,
    appsResponse
  );
  // TODO we are not requesting this in v5 cluster calls
  // Empty response
  requests.keyPairs = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/key-pairs/`
  );
  requests.credentials = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/credentials/`
  );
  requests.releases = getPersistedMockCall('/v4/releases/', releasesResponse);
  requests.appcatalogs = getPersistedMockCall(
    '/v4/appcatalogs/',
    appCatalogsResponse
  );
});

// Stop persisting responses
afterAll(() => {
  Object.keys(requests).forEach(req => {
    requests[req].persist(false);
  });
});

/************ TESTS ************/

// This triggers a warning because of this weird array-like value we are receiving
// as a response to the apps call. Here we are using a real array to mock the response
// and hence the warning because we are transforming an array into an array
it('renders all the v4 AWS cluster data correctly without nodes ready', async () => {
  const div = document.createElement('div');
  const { getByText, getAllByText, getByTestId } = renderRouteWithStore(
    ROUTE,
    div,
    {}
  );

  await wait(() => {
    expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
  });
  expect(getAllByText(V4_CLUSTER.id)).toHaveLength(2);
  expect(
    getByTestId('desired-nodes').querySelector('div:nth-child(2)').textContent
  ).toBe('3');
  expect(
    getByTestId('running-nodes').querySelector('div:nth-child(2)').textContent
  ).toBe('3');
  const k8sEndpoint = getByText('Kubernetes endpoint URI:').nextSibling;
  expect(k8sEndpoint).not.toBeEmpty();
  // n/a because the cluster hasn't been updated yet
  expect(document.querySelector('abbr')).toHaveTextContent('n/a');
  expect(getByText(V4_CLUSTER.instanceType)).toBeInTheDocument();
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
  const clusterPatchRequest = nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${V4_CLUSTER.id}/`, 'PATCH')
    .reply(200, clusterPatchResponse);

  const div = document.createElement('div');
  const { getByTestId, getByText, getByLabelText } = renderRouteWithStore(
    ROUTE,
    div,
    {}
  );

  await wait(() => {
    expect(
      getByTestId('desired-nodes').querySelector('div:nth-child(2)').textContent
    ).toBe('3');
    expect(
      getByTestId('running-nodes').querySelector('div:nth-child(2)').textContent
    ).toBe('3');
  });

  // Replace status response
  requests.status.persist(false);
  requests.status = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    {
      ...v4AWSClusterStatusResponse,
      cluster: {
        ...v4AWSClusterStatusResponse.cluster,
        scaling: { desiredCapacity: newScaling.max },
      },
    }
  );

  // Click edit button. Will throw an error if it founds more thanon edit button
  fireEvent.click(getByText(/edit/i));

  await wait(() => getByText(/edit scaling settings for/i));

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
  await wait(() => expect(inputMax.value).toBe(newScaling.max.toString()));

  fireEvent.change(inputMin, { target: { value: newScaling.min } });
  const textButton = `Increase minimum number of nodes by ${increaseValue}`;
  const submitButton = getByText(textButton);
  fireEvent.click(submitButton);

  //Wait for the Flash message to appear
  await wait(() => {
    getByText(/the cluster will be scaled within the next couple of minutes./i);
    // Does the cluster have node values updated?
    expect(getByText(`Pinned at ${newScaling.min}`));
  });

  clusterPatchRequest.done();

  // Restore status response
  requests.status.persist(false);
  requests.status = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AWSClusterStatusResponse
  );
});

it('deletes a v4 cluster', async () => {
  const cluster = v4AWSClusterResponse;
  const clusterDeleteResponse = {
    code: 'RESOURCE_DELETION_STARTED',
    message: `Deletion of cluster with ID '${V4_CLUSTER.id}' is in progress.`,
  };

  // Request
  const clusterDeleteRequest = nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${V4_CLUSTER.id}/`, 'DELETE')
    .reply(200, clusterDeleteResponse);

  const div = document.createElement('div');
  const { getByText, getAllByText, queryByTestId } = renderRouteWithStore(
    ROUTE,
    div,
    {}
  );

  // Wait for the view to render
  await wait(() => {
    expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
  });

  await wait(() => getByText('Delete Cluster'));
  fireEvent.click(getByText('Delete Cluster'));

  // Is the modal in the document?
  const titleText = /are you sure you want to delete/i;
  await wait(() => getByText(titleText));
  const modalTitle = getByText(titleText);
  expect(modalTitle).toBeInTheDocument();
  expect(modalTitle.textContent.includes(cluster.id)).toBeTruthy();

  // Click delete button.
  const modalDeleteButton = getAllByText('Delete Cluster')[1];
  fireEvent.click(modalDeleteButton);

  // Flash message confirming deletion.
  await wait(() => {
    getByText(/will be deleted/i);
  });
  const flashElement = getByText(/will be deleted/i);
  expect(flashElement).toBeInTheDocument();
  expect(flashElement).toHaveTextContent(cluster.id);

  // Expect the cluster is not in the clusters list.
  await wait(() => {
    expect(queryByTestId(cluster.id)).not.toBeInTheDocument();
  });

  // This is not inside the component tree we are testing and so it is not cleaned up
  // after test, so we have to remove it manually in order to not cause conflicts with
  // the next test with a flash message
  document.querySelector('#noty_layout__topRight').remove();
  clusterDeleteRequest.done();
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
  const clusterPatchRequest = nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${V4_CLUSTER.id}/`, 'PATCH')
    .reply(200, clusterPatchResponse);

  requests.cluster.persist(false);
  requests.cluster = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/`,
    clusterPatchResponse
  );

  // Mounting
  const div = document.createElement('div');
  const { getByText, getByDisplayValue } = renderRouteWithStore(ROUTE, div, {});

  await wait(() => getByText(clusterName));
  const clusterNameEl = getByText(clusterName);
  fireEvent.click(clusterNameEl);

  await wait(() => getByDisplayValue(clusterName));

  // Change the new name and submit it.
  fireEvent.change(getByDisplayValue(clusterName), {
    target: { value: newClusterName },
  });

  const submitButton = getByText(/ok/i);
  fireEvent.click(submitButton);

  //Wait for the Flash message to appear
  await wait(() => {
    getByText(/succesfully edited cluster name/i);
  });

  expect(getByText(newClusterName)).toBeInTheDocument();

  // Assert that the mocked responses got called, tell them to stop waiting for
  // a request.
  clusterPatchRequest.done();

  // Restore response
  requests.cluster.persist(false);
  requests.cluster = getPersistedMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/`,
    v4AWSClusterResponse
  );
});
