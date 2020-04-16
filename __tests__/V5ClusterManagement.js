import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitFor } from '@testing-library/react';
import { forceRemoveAll } from 'lib/flashMessage';
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
  getMockCall,
  getMockCallTimes,
  nodePoolsResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V5_CLUSTER,
  v5ClusterResponse,
  v5ClustersResponse,
  metadataResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';
import { getNumberOfNodePoolsNodes } from 'utils/clusterUtils';
import { getConfiguration } from 'model/services/metadata';

// Responses to requests
beforeEach(() => {
  getInstallationInfo.mockResolvedValueOnce(AWSInfoResponse);
  getConfiguration.mockResolvedValueOnce(metadataResponse);
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/organizations/', orgsResponse);
  getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
  getMockCall('/v4/clusters/', v5ClustersResponse);
  getMockCall(`/v5/clusters/${V5_CLUSTER.id}/apps/`, appsResponse);
  getMockCall(`/v4/clusters/${V5_CLUSTER.id}/key-pairs/`);
  getMockCall('/v4/releases/', releasesResponse);
  getMockCall('/v4/appcatalogs/', appCatalogsResponse);
  getMockCallTimes(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse, 2);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
  getMockCallTimes(
    `/v5/clusters/${V5_CLUSTER.id}/nodepools/`,
    nodePoolsResponse,
    2
  );
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

  await waitFor(() => {
    expect(getByText(V5_CLUSTER.name)).toBeInTheDocument();
  });
  expect(getAllByText(V5_CLUSTER.id)).toHaveLength(2);

  // expect(getByText('0 nodes')).toBeInTheDocument();
  const workerNodesRunning = getNumberOfNodePoolsNodes(nodePoolsResponse);
  const textRendered = `${workerNodesRunning} nodes in ${nodePoolsResponse.length} node pools`;

  // Expect computed values are rendered
  await waitFor(() => {
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

  await waitFor(() => findAllByTestId('node-pool-id'));

  nodePoolsResponse.forEach((nodePool) => {
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
  nock(API_ENDPOINT)
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

  await waitFor(() => getByText(nodePoolName));

  // All mock node pools have the same first 14 characters.
  const nodePoolNameEl = getByText(nodePoolName);
  const nodePools = getAllByTestId('node-pool-id');

  // Is this NP the first in the list?
  expect(nodePools[0]).toContainHTML(nodePoolNameEl);
  fireEvent.click(nodePoolNameEl);

  await waitFor(() => {
    getByDisplayValue(nodePoolName);
  });

  // Change the new name and submit it.
  fireEvent.change(getByDisplayValue(nodePoolName), {
    target: { value: newNodePoolName },
  });

  const submitButton = getByText(/ok/i);
  fireEvent.click(submitButton);

  await waitFor(() => {
    // Is the new NP name in the document?
    expect(getByText(newNodePoolName)).toBeInTheDocument();
  });

  // Is it now the 2nd node pool in list?
  const reSortedNodePools = getAllByTestId('node-pool-id');
  expect(reSortedNodePools[1]).toHaveTextContent(nodePoolId);
});

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
  nock(API_ENDPOINT)
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

  await waitFor(() => getAllByTestId('node-pool-id'));

  // Expect first nodePool is the first one in the list.
  const nodePoolId = getAllByTestId('node-pool-id')[0].textContent;
  expect(nodePoolId).toBe(nodePool.id);

  fireEvent.click(getAllByText('•••')[0]);
  fireEvent.click(getByText(/edit scaling limits/i));

  await waitFor(() => getByText(/edit scaling settings for/i));

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
  await waitFor(() => getByText(/increase minimum number of nodes by 1/i));

  const submitButton = getByText(/increase minimum number of nodes by 1/i);
  fireEvent.click(submitButton);

  //Wait for the Flash message to appear
  await waitFor(() => {
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
});

it('deletes a v5 cluster', async () => {
  const cluster = v5ClusterResponse;
  const clusterDeleteResponse = {
    code: 'RESOURCE_DELETION_STARTED',
    message: `Deletion of cluster with ID '${V5_CLUSTER.id}' is in progress.`,
  };

  // Request
  nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${V5_CLUSTER.id}/`, 'DELETE')
    .reply(StatusCodes.Ok, clusterDeleteResponse);

  getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);

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
  await waitFor(() => {
    expect(getByText(V5_CLUSTER.name)).toBeInTheDocument();
  });

  const button = getByText(/delete cluster/i);
  fireEvent.click(button);

  // Is the modal in the document?
  const titleText = /are you sure you want to delete/i;
  await waitFor(() => getByText(titleText));
  const modalTitle = getByText(titleText);
  expect(modalTitle).toBeInTheDocument();
  expect(modalTitle.textContent.includes(cluster.id)).toBeTruthy();

  // Click delete button.
  const modalDeleteButton = getAllByText('Delete Cluster')[1];
  fireEvent.click(modalDeleteButton);

  // Flash message confirming deletion.
  await waitFor(() => {
    getByText(/will be deleted/i);
  });
  const flashElement = getByText(/will be deleted/i);
  expect(flashElement).toBeInTheDocument();
  expect(flashElement).toHaveTextContent(cluster.id);

  // Expect the cluster is not in the clusters list.
  await waitFor(() => {
    expect(queryByTestId(cluster.id)).not.toBeInTheDocument();
  });
});

it('deletes a node pool', async () => {
  const nodePool = nodePoolsResponse[0];
  const nodePoolDeleteResponse = {
    code: 'RESOURCE_DELETION_STARTED',
    message: `Deletion of node pool with ID '${nodePool.id}' is in progress.`,
  };

  // Request
  nock(API_ENDPOINT)
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
  await waitFor(() => getAllByTestId('node-pool-id'));

  fireEvent.click(getAllByText('•••')[0]);
  // Regex doesn't work, don't know why...
  await waitFor(() => getByText('Delete'));
  fireEvent.click(getByText('Delete'));

  // Is the modal in the document?
  const titleText = /do you want to delete this node pool?/i;
  const bodyTextMultipleNP = /do you want to delete this node pool/i;

  await waitFor(() => getByText(titleText));
  expect(getByText(titleText)).toBeInTheDocument();
  expect(getByText(bodyTextMultipleNP)).toBeInTheDocument();

  // Click delete button.
  const deleteButtonText = 'Delete Node Pool';
  fireEvent.click(getByText(deleteButtonText));

  // Flash message confirming deletion.
  await waitFor(() => {
    getByText(/will be deleted/i);
  });
  const flashElement = getByText(/will be deleted/i);
  expect(flashElement).toBeInTheDocument();
  expect(flashElement).toHaveTextContent(nodePool.id);

  // Expect the node pool is not in the view.
  await waitFor(() => {
    expect(queryByTestId(nodePool.id)).not.toBeInTheDocument();
  });

  // Test that last nodepool warning appears.
  const bodyTextLastNP = /do you want to delete this cluster\'s only node pool?/i;

  fireEvent.click(getByText('•••'));
  fireEvent.click(getByText('Delete'));
  expect(getByText(bodyTextLastNP)).toBeInTheDocument();
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
  nock(API_ENDPOINT)
    .intercept(`/v5/clusters/${V5_CLUSTER.id}/nodepools/`, 'POST')
    .reply(StatusCodes.Created, nodePoolCreationResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );
  const { findByText, getByText } = renderRouteWithStore(clusterDetailPath);

  let addNodePoolButton = null;

  // FindByText doesn't work here, for some reason
  await waitFor(() => {
    addNodePoolButton = getByText(/add node pool/i);
    fireEvent.click(addNodePoolButton);
  });

  addNodePoolButton = await findByText(/create node pool/i);
  fireEvent.click(addNodePoolButton);

  // Flash message confirming creation.
  const flashMessage = await findByText(/Your new node pool with ID/i);
  expect(flashMessage).toHaveTextContent(nodePoolCreationResponse.id);

  // Remove flash message.
  forceRemoveAll();

  // Is the new NodePool in the document?
  const newNodePool = await findByText(nodePoolCreationResponse.id);
  expect(newNodePool).toBeInTheDocument();
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
