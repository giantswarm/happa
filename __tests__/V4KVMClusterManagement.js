import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  appCatalogsResponse,
  appsResponse,
  getMockCall,
  getMockCallTimes,
  KVMInfoResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4ClustersResponse,
  v4KVMClusterResponse,
  v4KVMClusterStatusResponse,
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

beforeEach(() => {
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/info/', KVMInfoResponse);
  getMockCall('/v4/organizations/', orgsResponse);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/`, orgResponse, 2);
  getMockCall('/v4/clusters/', v4ClustersResponse);
  // eslint-disable-next-line no-magic-numbers
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/`, v4KVMClusterResponse, 3);
  getMockCallTimes(
    `/v4/clusters/${V4_CLUSTER.id}/status/`,
    v4KVMClusterStatusResponse,
    // eslint-disable-next-line no-magic-numbers
    3
  );
  // eslint-disable-next-line no-magic-numbers
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/apps/`, appsResponse, 3);
  getMockCallTimes(`/v4/clusters/${V4_CLUSTER.id}/key-pairs/`, [], 2);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
  getMockCall('/v4/releases/', releasesResponse);
  getMockCall('/v4/appcatalogs/', appCatalogsResponse);
});

// Stop persisting responses
afterEach(() => {
  expect(nock.isDone());
  nock.cleanAll();
});

it('renders all the v4 KVM cluster data correctly', async () => {
  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: ORGANIZATION,
      clusterId: V4_CLUSTER.id,
    }
  );
  const { getByText, getAllByText } = renderRouteWithStore(clusterDetailPath);

  await wait(() => {
    expect(getByText(V4_CLUSTER.name)).toBeInTheDocument();
  });
  expect(getAllByText(V4_CLUSTER.id)).toHaveLength(2);

  const apiEndpoint = getByText(v4KVMClusterResponse.api_endpoint);
  expect(apiEndpoint).toBeInTheDocument();

  const portsInResponse = v4KVMClusterResponse.kvm.port_mappings;
  const portsContainer = getByText('Ingress ports:');

  portsInResponse.forEach(mapping => {
    const protocol = mapping.protocol.toUpperCase();
    const html = `<dt>${protocol}</dt><dd>${mapping.port}</dd>`;
    expect(portsContainer).toContainHTML(html);
  });

  const nodesRunning = getNumberOfNodes({
    ...v4KVMClusterResponse,
    status: v4KVMClusterStatusResponse,
  }).toString();

  await wait(() => {
    expect(getByText('Nodes').nextSibling.textContent).toBe(nodesRunning);
  });
});

/******************** PENDING TESTS ********************/

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
