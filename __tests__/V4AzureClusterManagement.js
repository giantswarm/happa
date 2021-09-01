import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitFor } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import { Providers, StatusCodes } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { getNumberOfNodes } from 'stores/cluster/utils';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  azureInfoResponse,
  getMockCall,
  getMockCallTimes,
  metadataResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  preNodePoolRelease,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4AzureClusterResponse,
  v4AzureClusterStatusResponse,
  v4ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

describe('V4AzureClusterManagement', () => {
  const minNodesCount = 3;

  const originalInfo = window.config.info;

  beforeAll(() => {
    window.config.info = {
      ...window.config.info,
      general: {
        ...window.config.info.general,
        availabilityZones: {
          default: 1,
          max: 3,
          zones: ['1', '2', '3'],
        },
        provider: Providers.AZURE,
      },
      workers: {
        ...window.config.info.workers,
        countPerCluster: { max: 0, default: 10 },
        vmSize: {
          options: ['Standard_A2_v2'],
          default: 'Standard_A2_v2',
        },
      },
    };
  });

  afterAll(() => {
    window.config.info = originalInfo;
  });

  // Responses to requests
  beforeEach(() => {
    getInstallationInfo.mockResolvedValueOnce(azureInfoResponse);
    getConfiguration.mockResolvedValueOnce(metadataResponse);
    getMockCall('/v4/user/', userResponse);
    getMockCallTimes('/v4/organizations/', orgsResponse);
    getMockCall('/v4/clusters/', v4ClustersResponse);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AzureClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AzureClusterStatusResponse
    );
    getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);
  });

  it('renders all the v4 Azure cluster data correctly', async () => {
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AzureClusterResponse);
    getMockCall(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AzureClusterStatusResponse
    );
    getMockCall('/v4/releases/', releasesResponse);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V4_CLUSTER.id,
      }
    );
    const { getByText, getAllByText, getByTitle } = renderRouteWithStore(
      clusterDetailPath
    );

    await waitFor(() => {
      expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
    });
    expect(getAllByText(V4_CLUSTER.id)).toHaveLength(2);

    const apiEndpoint = getByText(v4AzureClusterResponse.api_endpoint);
    expect(apiEndpoint).toBeInTheDocument();

    const instance = getByText(V4_CLUSTER.AzureInstanceType);
    expect(instance).toBeInTheDocument();

    const nodesRunning = getNumberOfNodes({
      ...v4AzureClusterResponse,
      status: v4AzureClusterStatusResponse,
    }).toString();

    await waitFor(() => {
      expect(getByText('Nodes').nextSibling.textContent).toBe(nodesRunning);
    });

    const availabilityZones = getByText(/availability zones/i);
    expect(availabilityZones).toBeInTheDocument();

    const azLabels = [];
    for (const azLabel of v4AzureClusterResponse.availability_zones) {
      azLabels.push(getByTitle(azLabel));
    }

    expect(azLabels.length).toBe(
      v4AzureClusterResponse.availability_zones.length
    );
  });

  it('prevents availability zones customization for an unsupported release version', async () => {
    getMockCall('/v4/releases/', [preNodePoolRelease]);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);

    const clusterCreationPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.New,
      { orgId: ORGANIZATION }
    );
    const { findByText } = renderRouteWithStore(clusterCreationPath);

    const azNotAvailableWarning = await findByText(
      /selection of availability zones is only possible for release version 11.1.0 or greater./i
    );
    expect(azNotAvailableWarning).toBeInTheDocument();
  });

  it('can customize availability zones during cluster creation', async () => {
    getMockCallTimes('/v4/releases/', releasesResponse, 2);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);
    getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
    getMockCallTimes(
      `/v4/clusters/${V4_CLUSTER.id}/`,
      v4AzureClusterResponse,
      2
    );
    getMockCallTimes(
      `/v4/clusters/${V4_CLUSTER.id}/status/`,
      v4AzureClusterStatusResponse,
      2
    );

    const clusterCreationResponse = {
      code: 'RESOURCE_CREATED',
      message: `The cluster with ID ${V4_CLUSTER.id} has been created.`,
    };
    nock(API_ENDPOINT)
      .intercept('/v4/clusters/', 'POST')
      .reply(StatusCodes.Ok, clusterCreationResponse, {
        location: `/v4/clusters/${V4_CLUSTER.id}/`,
      });

    const clusterCreationPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.New,
      { orgId: ORGANIZATION }
    );
    const { findByText, getByText } = renderRouteWithStore(clusterCreationPath);
    const {
      default: defaultAZCount,
      max: maxAZCount,
    } = azureInfoResponse.data.general.availability_zones;

    const azLabel = await findByText(/number of availability zones to use:/i);
    expect(azLabel).toBeInTheDocument();

    const azInput = azLabel.parentNode.querySelector(
      `[value='${defaultAZCount}']`
    );
    expect(azInput).toBeInTheDocument();

    fireEvent.change(azInput, {
      target: {
        value: defaultAZCount,
      },
    });
    expect(azInput.value).toBe(String(defaultAZCount));

    fireEvent.change(azInput, {
      target: {
        value: maxAZCount,
      },
    });
    expect(azInput.value).toBe(String(maxAZCount));

    const createButton = getByText('Create cluster');
    expect(createButton.disabled).toBeFalsy();
    fireEvent.click(createButton);

    // Expect to be redirected to the cluster detail page
    const successMessage = await findByText(/kubernetes endpoint URI/i);
    expect(successMessage).toBeInTheDocument();

    // eslint-disable-next-line no-empty-function
    await waitFor(() => {});
  });

  it(`shows the v4 Azure cluster scaling modal when the button is clicked with default values and
scales correctly`, async () => {
    getMockCallTimes('/v4/releases/', releasesResponse, 2);
    getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AzureClusterResponse);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse);
    getMockCall(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`);

    const cluster = v4AzureClusterResponse;
    const defaultScaling = cluster.scaling;
    const increaseByCount = 1;

    const newScaling = {
      min: defaultScaling.min + increaseByCount,
      max: defaultScaling.max + increaseByCount,
    };
    // Add another worker
    const newWorkers = [...cluster.workers, cluster.workers[0]];

    const scaleResponse = {
      ...cluster,
      scaling: newScaling,
      workers: newWorkers,
    };

    getMockCall(`/v4/clusters/${cluster.id}/status/`, {
      ...v4AzureClusterStatusResponse,
      cluster: {
        ...v4AzureClusterStatusResponse.cluster,
        scaling: { desiredCapacity: newScaling.min },
      },
    });

    // Cluster scale request
    nock(API_ENDPOINT)
      .intercept(`/v4/clusters/${cluster.id}/`, 'PATCH')
      .reply(StatusCodes.Ok, scaleResponse);

    const clusterDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.Detail.Home,
      {
        orgId: ORGANIZATION,
        clusterId: V4_CLUSTER.id,
      }
    );
    const { getByText, findByText, getByDisplayValue } = renderRouteWithStore(
      clusterDetailPath
    );

    const nodesTitle = await findByText('Nodes');
    const nodesCounter = nodesTitle.nextSibling;

    expect(nodesCounter).toHaveTextContent(String(minNodesCount));

    // Simulate click on the Edit button
    fireEvent.click(getByText(/edit/i));

    // Check if the modal is in the document
    const modalTitle = await findByText(/edit scaling settings for/i);
    expect(modalTitle).toHaveTextContent(cluster.id);

    // Check if the node count selector is there, and has the right value
    const nodeCountInput = getByDisplayValue(String(defaultScaling.min));

    // Set the new node count
    fireEvent.change(nodeCountInput, { target: { value: newScaling.min } });

    const submitButtonLabel = `Add ${increaseByCount} worker node`;
    const submitButton = getByText(submitButtonLabel);
    fireEvent.click(submitButton);

    await findByText(
      /the cluster will be scaled within the next couple of minutes./i
    );
  });
});
