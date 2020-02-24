import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getInfo } from 'model/gateways/ControlPlaneGateway';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  azureInfoResponse,
  getMockCall,
  getMockCallTimes,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4AzureClusterResponse,
  v4AzureClusterStatusResponse,
  v4ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';
import { getNumberOfNodes } from 'utils/clusterUtils';

const minNodesCount = 3;

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

// Responses to requests
beforeEach(() => {
  getInfo.mockResolvedValueOnce(azureInfoResponse);
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/organizations/', orgsResponse);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/`, orgResponse, 2);
  getMockCall('/v4/clusters/', v4ClustersResponse);
  // eslint-disable-next-line no-magic-numbers
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/`, v4AzureClusterResponse, 4);
  getMockCallTimes(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4AzureClusterStatusResponse,
    // eslint-disable-next-line no-magic-numbers
    3
  );
  // eslint-disable-next-line no-magic-numbers
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse, 3);
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`, [], 2);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
  getMockCall('/v4/appcatalogs/', appCatalogsResponse);
});

// Stop persisting responses
afterEach(() => {
  expect(nock.isDone());
  nock.cleanAll();
});

it('renders all the v4 Azure cluster data correctly', async () => {
  getMockCall('/v4/releases/', releasesResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V4_CLUSTER.id,
    }
  );
  const { getByText, getAllByText, getByTitle } = renderRouteWithStore(
    clusterDetailPath
  );

  await wait(() => {
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

  await wait(() => {
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
  // Cloning to not break the releases list for the next tests
  const unsupportedReleaseResponse = releasesResponse.slice();
  unsupportedReleaseResponse[2] = Object.assign(
    {},
    unsupportedReleaseResponse[2],
    {
      version: '8.4.0',
    }
  );
  getMockCall('/v4/releases/', unsupportedReleaseResponse);

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
  getMockCall('/v4/releases/', releasesResponse);

  const clusterCreationResponse = {
    code: 'RESOURCE_CREATED',
    message: `The cluster with ID ${V4_CLUSTER.id} has been created.`,
  };
  const clusterCreationRequest = nock(API_ENDPOINT)
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
  } = azureInfoResponse.general.availability_zones;

  const azLabel = await findByText(/number of availability zones to use:/i);
  expect(azLabel).toBeInTheDocument();

  const azInput = azLabel.parentNode.querySelector(
    `[value='${defaultAZCount}']`
  );
  expect(azInput).toBeInTheDocument();

  fireEvent.change(azInput, {
    target: {
      value: defaultAZCount - 1,
    },
  });
  expect(azInput.value).toBe(String(defaultAZCount));

  fireEvent.change(azInput, {
    target: {
      value: maxAZCount + 1,
    },
  });
  expect(azInput.value).toBe(String(maxAZCount));

  const createButton = getByText('Create Cluster');
  fireEvent.click(createButton);

  clusterCreationRequest.done();
});

it(`shows the v4 Azure cluster scaling modal when the button is clicked with default values and
scales correctly`, async () => {
  getMockCall('/v4/releases/', releasesResponse);

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
  const scaleRequest = nock(API_ENDPOINT)
    .intercept(`/v4/clusters/${cluster.id}/`, 'PATCH')
    .reply(StatusCodes.Ok, scaleResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
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

  scaleRequest.done();
});
