import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { forceRemoveAll } from 'lib/flashMessage';
import RoutePath from 'lib/routePath';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { Constants } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { filterLabels, getNumberOfNodePoolsNodes } from 'stores/cluster/utils';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  AWSInfoResponse,
  generateRandomString,
  getMockCall,
  getMockCallTimes,
  metadataResponse,
  mockCall,
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
import { validateLabelKey } from 'utils/labelUtils';

describe('V5ClusterManagement', () => {
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
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);
    getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
    getMockCallTimes(
      `/v5/clusters/${V5_CLUSTER.id}/nodepools/`,
      nodePoolsResponse,
      2
    );
  });

  /************ TESTS ************/

  it('renders all the v5 cluster data correctly', async () => {
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
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
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
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
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

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
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V5_CLUSTER.id,
      }
    );
    // Mounting
    const {
      getAllByTestId,
      getByText,
      getByDisplayValue,
    } = renderRouteWithStore(clusterDetailPath);

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
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

    const defaultScaling = {
      min: Constants.NP_DEFAULT_MIN_SCALING,
      max: Constants.NP_DEFAULT_MAX_SCALING,
    };
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
      OrganizationsRoutes.Clusters.Detail.Home,
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
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

    const cluster = v5ClusterResponse;
    const clusterDeleteResponse = {
      code: 'RESOURCE_DELETION_STARTED',
      message: `Deletion of cluster with ID '${V5_CLUSTER.id}' is in progress.`,
    };

    // Request
    nock(API_ENDPOINT)
      .intercept(`/v4/clusters/${V5_CLUSTER.id}/`, 'DELETE')
      .reply(StatusCodes.Ok, clusterDeleteResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
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
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

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
      OrganizationsRoutes.Clusters.Detail.Home,
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
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

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
      OrganizationsRoutes.Clusters.Detail.Home,
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
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V5_CLUSTER.id,
      }
    );

    renderRouteWithStore(clusterDetailPath, {
      errorsByEntity: {
        [V5_CLUSTER.id]: { CLUSTER_LOAD_APPS: 'Error loading apps' },
      },
    });

    expect(screen.getByText('Error Loading Apps:')).toBeInTheDocument();

    expect(
      screen.getByText('No apps installed on this cluster')
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Apps installed by user')
    ).not.toBeInTheDocument();
  });

  it(`renders the master nodes row for an unsupported release version`, async () => {
    const clusterResponse = Object.assign({}, v5ClusterResponse, {
      release_version: '11.0.0',
    });
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, clusterResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V5_CLUSTER.id,
      }
    );
    renderRouteWithStore(clusterDetailPath);

    expect(
      await screen.findByText(/kubernetes endpoint uri/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/master nodes/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/switch to high availability…/i)
    ).not.toBeInTheDocument();
  });

  it('can convert a cluster to HA masters', async () => {
    const clusterResponse = Object.assign({}, v5ClusterResponse, {
      release_version: '11.4.0',
      master_nodes: {
        high_availability: false,
        availability_zones: ['b'],
        num_ready: 1,
      },
    });
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, clusterResponse);

    const patchResponse = Object.assign({}, clusterResponse, {
      master_nodes: {
        high_availability: true,
        availability_zones: ['b', 'c', 'd'],
        num_ready: 1,
      },
    });
    nock(API_ENDPOINT)
      .intercept(`/v5/clusters/${V5_CLUSTER.id}/`, 'PATCH')
      .reply(StatusCodes.Ok, patchResponse);
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, patchResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V5_CLUSTER.id,
      }
    );
    renderRouteWithStore(clusterDetailPath);

    fireEvent.click(await screen.findByText(/switch to high availability…/i));
    fireEvent.click(await screen.findByText(/^switch to high availability$/i));

    await waitForElementToBeRemoved(() =>
      screen.getByText(/^switch to high availability$/i)
    );
    expect(screen.getByText(/1 of 3 master nodes ready/i)).toBeInTheDocument();
  });

  it(`can't convert a cluster that is not ready to HA masters`, async () => {
    const clusterResponse = Object.assign({}, v5ClusterResponse, {
      conditions: [
        {
          last_transition_time: new Date().toISOString(),
          condition: 'Creating',
        },
      ],
      release_version: '11.4.0',
      master_nodes: {
        high_availability: false,
        availability_zones: ['b'],
        num_ready: 1,
      },
    });
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, clusterResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V5_CLUSTER.id,
      }
    );
    renderRouteWithStore(clusterDetailPath);

    await screen.findByText(/all purpose cluster/i);
    expect(
      screen.queryByText(/switch to high availability…/i)
    ).not.toBeInTheDocument();
  });

  it('renders cluster labels', async () => {
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V5_CLUSTER.id,
      }
    );
    const { findByText, getByText, queryByText } = renderRouteWithStore(
      clusterDetailPath
    );

    await findByText('Labels:');

    for (const [key, value] of Object.entries(v5ClusterResponse.labels)) {
      if (validateLabelKey(key).isValid) {
        expect(getByText(key)).toBeInTheDocument();
        expect(getByText(value)).toBeInTheDocument();
      } else {
        expect(queryByText(key)).not.toBeInTheDocument();
        expect(queryByText(value)).not.toBeInTheDocument();
      }
    }
  });

  it('allows to delete cluster labels', async () => {
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

    mockCall('put', `/v5/clusters/${V5_CLUSTER.id}/labels/`, {
      labels: {
        'giantswarm.io/hidden-label': 'ok',
      },
    });
    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V5_CLUSTER.id,
      }
    );
    const visibleLabels = Object.entries(
      filterLabels(v5ClusterResponse.labels)
    );

    const { findByText, getByRole } = renderRouteWithStore(clusterDetailPath);

    await findByText('Labels:');

    fireEvent.click(
      getByRole('button', { name: `Delete '${visibleLabels[0][0]}' label` })
    );
    fireEvent.click(await findByText('Delete', { selector: 'button' }));

    await findByText(/This cluster has no labels./);
  });

  it('disallows to add invalid cluster labels', async () => {
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V5_CLUSTER.id,
      }
    );
    const {
      findByLabelText,
      findByText,
      getByLabelText,
      getByText,
    } = renderRouteWithStore(clusterDetailPath);

    await findByText('Labels:');
    fireEvent.click(getByText('Add label', { selector: 'button ' }));

    const keyInput = await findByLabelText('Label key');
    const valueInput = getByLabelText('Label value');
    const saveButton = getByText('Save', { selector: 'button' });

    fireEvent.change(keyInput, { target: { value: '.invalid.' } });
    fireEvent.change(valueInput, { target: { value: 'valid' } });

    await findByText(
      `Key name part must consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character.`
    );
    expect(saveButton.disabled).toBeTruthy();

    fireEvent.change(keyInput, { target: { value: 'valid' } });
    fireEvent.change(valueInput, { target: { value: '.invalid.' } });

    await findByText(
      `Value must consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character.`
    );
    expect(saveButton.disabled).toBeTruthy();
  });

  it('allows to add cluster labels', async () => {
    getMockCall(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse);

    const newLabelKey = 'brand-new-label';
    const newLabelValue = generateRandomString();
    mockCall('put', `/v5/clusters/${V5_CLUSTER.id}/labels/`, {
      labels: {
        ...v5ClusterResponse.labels,
        ...{ [newLabelKey]: newLabelValue },
      },
    });
    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V5_CLUSTER.id,
      }
    );
    const {
      findByLabelText,
      findByText,
      getByLabelText,
      getByText,
    } = renderRouteWithStore(clusterDetailPath);

    await findByText('Labels:');
    fireEvent.click(getByText('Add label', { selector: 'button ' }));

    const keyInput = await findByLabelText('Label key');
    const valueInput = getByLabelText('Label value');
    const saveButton = getByText('Save', { selector: 'button' });

    fireEvent.change(keyInput, { target: { value: newLabelKey } });
    fireEvent.change(valueInput, {
      target: { value: newLabelValue },
    });

    expect(saveButton.disabled).toBeFalsy();

    fireEvent.click(saveButton);

    expect(await findByText(newLabelKey)).toBeInTheDocument();
    expect(getByText(newLabelValue)).toBeInTheDocument();
  });
});
