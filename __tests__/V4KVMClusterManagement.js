import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitFor } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import { Providers, StatusCodes } from 'shared/constants';
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
  v4ClustersResponse,
  v4KVMClusterResponse,
  v4KVMClusterStatusResponse,
} from 'test/mockHttpCalls';
import { renderRouteWithStore } from 'test/renderUtils';

const minNodesCount = 3;

const originalProvider = window.config.info.general.provider;

beforeAll(() => {
  window.config.info.general.provider = Providers.KVM;
});

afterAll(() => {
  window.config.info.general.provider = originalProvider;
});

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
  getMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4KVMClusterStatusResponse
  );
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/`, v4KVMClusterResponse, 2);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
});

it('renders all the v4 KVM cluster data correctly', async () => {
  getMockCall(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4KVMClusterStatusResponse
  );

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.Home,
    {
      orgId: ORGANIZATION,
      clusterId: V4_CLUSTER.id,
    }
  );
  const { getByText, getAllByText } = renderRouteWithStore(clusterDetailPath);

  await waitFor(() => {
    expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
  });
  expect(getAllByText(V4_CLUSTER.id)).toHaveLength(2);

  const apiEndpoint = getByText(v4KVMClusterResponse.api_endpoint);
  expect(apiEndpoint).toBeInTheDocument();

  const portsInResponse = v4KVMClusterResponse.kvm.port_mappings;
  const portsContainer = getByText('Ingress ports:');

  portsInResponse.forEach((mapping) => {
    const protocol = mapping.protocol.toUpperCase();
    const html = `<dt>${protocol}</dt><dd>${mapping.port}</dd>`;
    expect(portsContainer).toContainHTML(html);
  });

  const nodesRunning = getNumberOfNodes({
    ...v4KVMClusterResponse,
    status: v4KVMClusterStatusResponse,
  }).toString();

  await waitFor(() => {
    expect(getByText('Nodes').nextSibling.textContent).toBe(nodesRunning);
  });
});

it(`shows the v4 KVM cluster scaling modal when the button is clicked with default values and
scales correctly`, async () => {
  const cluster = v4KVMClusterResponse;
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
    ...v4KVMClusterStatusResponse,
    cluster: {
      ...v4KVMClusterStatusResponse.cluster,
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
  const { getByText, findByText, getByDisplayValue } =
    renderRouteWithStore(clusterDetailPath);

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
