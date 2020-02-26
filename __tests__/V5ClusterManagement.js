import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getInstallationInfo } from 'model/services/giantSwarm';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  AWSInfoResponse,
  getPersistedMockCall,
  nodePoolsResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V5_CLUSTER,
  v5ClusterResponse,
  v5ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';
import { getNumberOfNodePoolsNodes } from 'utils/clusterUtils';

// Tests setup
const requests = {};

// Responses to requests
beforeEach(() => {
  getInstallationInfo.mockResolvedValueOnce(AWSInfoResponse);
  requests.userInfo = getPersistedMockCall('/v4/user/', userResponse);
  requests.organizations = getPersistedMockCall(
    '/v4/organizations/',
    orgsResponse
  );
  requests.organization = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/`,
    orgResponse
  );
  requests.clusters = getPersistedMockCall('/v4/clusters/', v5ClustersResponse);
  requests.cluster = getPersistedMockCall(
    `/v5/clusters/${V5_CLUSTER.id}/`,
    v5ClusterResponse
  );
  requests.apps = getPersistedMockCall(
    `/v5/clusters/${V5_CLUSTER.id}/apps/`,
    appsResponse
  );
  requests.keyPairs = getPersistedMockCall(
    `/v4/clusters/${V5_CLUSTER.id}/key-pairs/`
  );
  requests.credentials = getPersistedMockCall(
    `/v4/organizations/${ORGANIZATION}/credentials/`
  );
  requests.releases = getPersistedMockCall('/v4/releases/', releasesResponse);
  requests.nodePools = getPersistedMockCall(
    `/v5/clusters/${V5_CLUSTER.id}/nodepools/`,
    nodePoolsResponse
  );
  requests.appcatalogs = getPersistedMockCall(
    '/v4/appcatalogs/',
    appCatalogsResponse
  );

  // TODO no apps response?? Check on gauss.
});

// Stop persisting responses
afterEach(() => {
  Object.keys(requests).forEach(req => {
    requests[req].persist(false);
  });
});

/************ TESTS ************/

it('renders all the v5 cluster data correctly', async () => {
  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );
  const { getByText, getAllByText } = renderRouteWithStore(clusterDetailPath);

  await wait(() => {
    expect(getByText(V5_CLUSTER.name)).toBeInTheDocument();
  });
  expect(getAllByText(V5_CLUSTER.id)).toHaveLength(2);

  // expect(getByText('0 nodes')).toBeInTheDocument();
  const workerNodesRunning = getNumberOfNodePoolsNodes(nodePoolsResponse);
  const textRendered = `${workerNodesRunning} nodes in ${nodePoolsResponse.length} node pools`;

  // Expect computed values are rendered
  await wait(() => {
    expect(getByText(textRendered)).toBeInTheDocument();
  });

  const k8sEndpoint = getByText('Kubernetes endpoint URI:').nextSibling;
  expect(k8sEndpoint).not.toBeEmpty();
});

it('renders all node pools in store', async () => {
  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );
  const { getByText, findAllByTestId } = renderRouteWithStore(
    clusterDetailPath
  );

  await wait(() => findAllByTestId('node-pool-id'));

  nodePoolsResponse.forEach(nodePool => {
    expect(getByText(nodePool.id)).toBeInTheDocument();
  });
});

it('patches node pool name correctly and re-sort node pools accordingly', async () => {
  const newNodePoolName = 'New NP name';
  const nodePoolName = nodePoolsResponse[0].name;
  const nodePoolId = nodePoolsResponse[0].id;

  // Response to request should be the exact same NP with the new name
  const nodePoolPatchResponse = {
    ...nodePoolsResponse[0],
    name: newNodePoolName,
  };

  // Request
  const nodePoolPatchRequest = nock(API_ENDPOINT)
    .intercept(
      `/v5/clusters/${V5_CLUSTER.id}/nodepools/${nodePoolsResponse[0].id}/`,
      'PATCH'
    )
    .reply(StatusCodes.Ok, nodePoolPatchResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );
  // Mounting
  const { getAllByTestId, getByText, getByDisplayValue } = renderRouteWithStore(
    clusterDetailPath
  );

  await wait(() => getByText(nodePoolName));

  // All mock node pools have the same first 14 characters.
  const nodePoolNameEl = getByText(nodePoolName);
  const nodePools = getAllByTestId('node-pool-id');

  // Is this NP the first in the list?
  expect(nodePools[0]).toContainHTML(nodePoolNameEl);
  fireEvent.click(nodePoolNameEl);

  await wait(() => {
    getByDisplayValue(nodePoolName);
  });

  // Change the new name and submit it.
  fireEvent.change(getByDisplayValue(nodePoolName), {
    target: { value: newNodePoolName },
  });

  const submitButton = getByText(/ok/i);
  fireEvent.click(submitButton);

  //Wait for the Flash message to appear
  await wait(() => {
    getByText(/succesfully edited node pool name/i);
  });

  // Is the new NP name in the document?
  expect(getByText(newNodePoolName)).toBeInTheDocument();

  // Is it now the 2nd node pool in list?
  const reSortedNodePools = getAllByTestId('node-pool-id');
  expect(reSortedNodePools[1]).toHaveTextContent(nodePoolId);

  // This is not inside the component tree we are testing and so it is not cleaned up
  // after test, so we have to remove it manually in order to not cause conflicts with
  // the next test with a flash message
  document.querySelector('#noty_layout__topRight').remove();

  // Assert that the mocked responses got called, tell them to stop waiting for
  // a request.
  nodePoolPatchRequest.done();
});

// TODO This test triggers a memory leak error related with setting state depending
// on the response of an asynchronous call in ScaleNodePoolModal.
// Not fixing it now because is a "minor" error, this error can't break the app and
// because I will be working on the data flow refactor that will solve this.
it(`shows the v5 cluster scaling modal when the button is clicked with default values and
scales node pools correctly`, async () => {
  // TODO default values from constants file
  const defaultScaling = { min: 3, max: 10 };
  const increaseValue = 1;
  const newScaling = {
    min: defaultScaling.min + increaseValue,
    max: defaultScaling.max + increaseValue,
  };

  const nodePool = nodePoolsResponse[0];
  const nodePoolPatchResponse = {
    ...nodePoolsResponse[0],
    scaling: newScaling,
  };

  // Request
  const nodePoolPatchRequest = nock(API_ENDPOINT)
    .intercept(
      `/v5/clusters/${V5_CLUSTER.id}/nodepools/${nodePool.id}/`,
      'PATCH'
    )
    .reply(StatusCodes.Ok, nodePoolPatchResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );
  const {
    getByText,
    getAllByText,
    getAllByTestId,
    getByLabelText,
  } = renderRouteWithStore(clusterDetailPath);

  await wait(() => getAllByTestId('node-pool-id'));

  // Expect first nodePool is the first one in the list.
  const nodePoolId = getAllByTestId('node-pool-id')[0].textContent;
  expect(nodePoolId).toBe(nodePool.id);

  fireEvent.click(getAllByText('•••')[0]);
  fireEvent.click(getByText(/edit scaling limits/i));

  await wait(() => getByText(/edit scaling settings for/i));

  // Is the modal in the document?
  const modalTitle = getByText(/edit scaling settings for/i);
  expect(modalTitle).toBeInTheDocument();
  expect(modalTitle).toHaveTextContent(nodePool.id);

  const inputMin = getByLabelText(/minimum/i);
  const inputMax = getByLabelText(/maximum/i);

  // Are the correct values in the correct fields?
  expect(inputMin.value).toBe(defaultScaling.min.toString());
  expect(inputMax.value).toBe(defaultScaling.max.toString());

  // Change the values and modify the scaling settings.
  fireEvent.change(inputMin, { target: { value: newScaling.min } });
  fireEvent.change(inputMax, { target: { value: newScaling.max } });

  // Wait for the text button to update
  await wait(() => getByText(/increase minimum number of nodes by 1/i));

  const submitButton = getByText(/increase minimum number of nodes by 1/i);
  fireEvent.click(submitButton);

  //Wait for the Flash message to appear
  await wait(() => {
    getByText(
      /The node pool will be scaled within the next couple of minutes./i
    );
  });

  // Our node pool is the first one. Does it have the scaling values updated?
  expect(getAllByTestId('scaling-min')[0]).toHaveTextContent(
    newScaling.min.toString()
  );
  expect(getAllByTestId('scaling-max')[0]).toHaveTextContent(
    newScaling.max.toString()
  );

  // This is not inside the component tree we are testing and so it is not cleaned up
  // after test, so we have to remove it manually in order to not cause conflicts with
  // the next test with a flash message
  document.querySelector('#noty_layout__topRight').remove();

  nodePoolPatchRequest.done();
});

it('deletes a v5 cluster', async () => {
  const cluster = v5ClusterResponse;
  const clusterDeleteResponse = {
    code: 'RESOURCE_DELETION_STARTED',
    message: `Deletion of cluster with ID '${V5_CLUSTER.id}' is in progress.`,
  };

  // Request
  const clusterDeleteRequest = nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${V5_CLUSTER.id}/`, 'DELETE')
    .reply(StatusCodes.Ok, clusterDeleteResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );
  const { getByText, getAllByText, queryByTestId } = renderRouteWithStore(
    clusterDetailPath
  );

  // Wait for the view to render
  await wait(() => {
    expect(getByText(V5_CLUSTER.name)).toBeInTheDocument();
  });

  const button = getByText(/delete cluster/i);
  fireEvent.click(button);

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

it('deletes a node pool', async () => {
  const nodePool = nodePoolsResponse[0];
  const nodePoolDeleteResponse = {
    code: 'RESOURCE_DELETION_STARTED',
    message: `Deletion of node pool with ID '${nodePool.id}' is in progress.`,
  };

  // Request
  const nodePoolDeleteRequest = nock(API_ENDPOINT)
    .intercept(
      `/v5/clusters/${V5_CLUSTER.id}/nodepools/${nodePool.id}/`,
      'DELETE'
    )
    .reply(StatusCodes.Ok, nodePoolDeleteResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );
  const {
    getByText,
    getAllByText,
    queryByTestId,
    getAllByTestId,
  } = renderRouteWithStore(clusterDetailPath);

  // Wait for node pools to render
  await wait(() => getAllByTestId('node-pool-id'));

  fireEvent.click(getAllByText('•••')[0]);
  // Regex doesn't work, don't know why...
  await wait(() => getByText('Delete'));
  fireEvent.click(getByText('Delete'));

  // Is the modal in the document?
  const titleText = /are you sure you want to delete/i;
  await wait(() => getByText(titleText));
  const modalTitle = getByText(titleText);
  expect(modalTitle).toBeInTheDocument();
  expect(modalTitle.textContent.includes(nodePool.id)).toBeTruthy();

  // Click delete button.
  const deleteButtonText = 'Delete Node Pool';
  const deleteButton = getByText(deleteButtonText);
  fireEvent.click(deleteButton);

  // Flash message confirming deletion.
  await wait(() => {
    getByText(/will be deleted/i);
  });
  const flashElement = getByText(/will be deleted/i);
  expect(flashElement).toBeInTheDocument();
  expect(flashElement).toHaveTextContent(nodePool.id);

  // Expect the node pool is not in the view.
  await wait(() => {
    expect(queryByTestId(nodePool.id)).not.toBeInTheDocument();
  });

  nodePoolDeleteRequest.done();
});

it('adds a node pool with default values', async () => {
  const nodePoolCreationResponse = {
    id: '2bbzf',
    name: 'My third node pool',
    availability_zones: ['eu-central-1a'],
    scaling: { min: 3, max: 10 },
    node_spec: {
      aws: { instance_type: 'm3.xlarge' },
      volume_sizes_gb: { docker: 100, kubelet: 100 },
    },
    status: { nodes: 0, nodes_ready: 0 },
    subnet: '10.1.7.0/24',
  };

  // Request
  const nodePoolCreationRequest = nock(API_ENDPOINT)
    .intercept(`/v5/clusters/${V5_CLUSTER.id}/nodepools/`, 'POST')
    .reply(StatusCodes.Ok, nodePoolCreationResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );
  const { getByText, getAllByText } = renderRouteWithStore(clusterDetailPath);

  await wait(() => getAllByText(/add node pool/i));

  fireEvent.click(getByText(/add node pool/i));
  await wait(() => getByText(/create node pool/i));
  fireEvent.click(getByText(/create node pool/i));

  // Flash message confirming creation.
  await wait(() => {
    getByText(/Your new node pool with ID/i);
  });
  expect(getByText(/Your new node pool with ID/i)).toHaveTextContent(
    nodePoolCreationResponse.id
  );

  // Remove flash message.
  document.querySelector('#noty_layout__topRight').remove();

  // Is the new NodePool in the document?
  await wait(() => {
    getByText(nodePoolCreationResponse.id);
  });

  expect(getByText(nodePoolCreationResponse.id)).toBeInTheDocument();

  nodePoolCreationRequest.done();
});

it('renders an error message if there was an error loading apps', () => {
  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );

  const { queryByTestId } = renderRouteWithStore(clusterDetailPath, {
    errorsByEntity: {
      [V5_CLUSTER.id]: { CLUSTER_LOAD_APPS: 'Error loading apps' },
    },
  });

  expect(queryByTestId('error-loading-apps')).toBeDefined();
  expect(queryByTestId('installed-apps')).toBeNull();
  expect(queryByTestId('no-apps-found')).toBeNull();
});
