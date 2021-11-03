import { fireEvent, waitFor, within } from '@testing-library/react';
import RoutePath from 'lib/routePath';
import { getConfiguration } from 'model/services/metadata/configuration';
import { OrganizationsRoutes } from 'shared/constants/routes';
import {
  appCatalogsResponse,
  appsResponse,
  emptyKeyPairsResponse,
  getMockCall,
  getMockCallTimes,
  keyPairsResponse,
  metadataResponse,
  nodePoolsResponse,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  postPayloadMockCall,
  releasesResponse,
  userResponse,
  V5_CLUSTER,
  v5ClusterResponse,
  v5ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

// Responses to requests
beforeEach(() => {
  getConfiguration.mockResolvedValueOnce(metadataResponse);
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/organizations/', orgsResponse);
  getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
  getMockCall('/v4/clusters/', v5ClustersResponse);
  getMockCallTimes(`/v5/clusters/${V5_CLUSTER.id}/`, v5ClusterResponse, 2);
  getMockCall(`/v5/clusters/${V5_CLUSTER.id}/apps/`, appsResponse);
  getMockCallTimes(`/v4/organizations/${ORGANIZATION}/credentials/`, [], 2);
  getMockCallTimes('/v4/releases/', releasesResponse, 2);
  getMockCallTimes(
    `/v5/clusters/${V5_CLUSTER.id}/nodepools/`,
    nodePoolsResponse,
    2
  );
  getMockCall('/v4/appcatalogs/', appCatalogsResponse);
});

/************ TESTS ************/

it('lets me create a keypair', async () => {
  // Given the cluster has no keypairs.
  // But on the second call it returns some keypairs.
  getMockCall(
    `/v4/clusters/${V5_CLUSTER.id}/key-pairs/`,
    emptyKeyPairsResponse
  );
  getMockCall(`/v4/clusters/${V5_CLUSTER.id}/key-pairs/`, keyPairsResponse);

  // And the app is on the cluster detail page, keypairs tab.
  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.KeyPairs,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );

  const { findByText, getByText, queryByTestId, getByLabelText } =
    renderRouteWithStore(clusterDetailPath);

  // Then I should see also that there are no keypairs yet.
  const message = await findByText(
    `No key pairs yet. Why don't you create your first?`
  );
  expect(message).toBeInTheDocument();

  // When I click the Key Pairs tab button.
  const keyPairTab = getByText('Key Pairs');
  fireEvent.click(keyPairTab);

  // And I click the create key pair button.
  const createKeyPairButton = getByText('Create key pair and kubeconfig');
  fireEvent.click(createKeyPairButton);

  // Then I should see the create key pair modal on the screen.
  const modal = queryByTestId('create-key-pair-modal');
  expect(modal).toBeInTheDocument();

  // And type in a common name prefix.
  const commonNamePrefixField = getByLabelText('Common Name Prefix');
  fireEvent.change(commonNamePrefixField, {
    target: { value: 'my-own-cn-prefix' },
  });

  // And type in Organizations.
  const organizationsField = getByLabelText('Organizations');
  fireEvent.change(organizationsField, {
    target: { value: 'my-own-organizations' },
  });

  // (I'm expecting a specific POST request to be made.)
  const ttl = 24; // In hours
  postPayloadMockCall(
    `/v4/clusters/${V5_CLUSTER.id}/key-pairs/`,
    (body) =>
      body.certificate_organizations === 'my-own-organizations' &&
      body.cn_prefix === 'my-own-cn-prefix' &&
      body.ttl_hours === ttl
  );

  // (Mock window.URL.createObjectURL because it doesn't exist in a test context)
  window.URL.createObjectURL = jest.fn();

  // When I click the create keypair button in the modal
  const confirmKeyPairButton = getByText('Create Key Pair');
  fireEvent.click(confirmKeyPairButton);

  // Then I should see some text confirming the keypair got made.
  const confirmText = await within(modal).findByText(
    'Your key pair and kubeconfig has been created.'
  );
  expect(confirmText).toBeInTheDocument();

  // And when I click the close button.
  const modalFooter = queryByTestId('create-key-pair-modal-footer');
  const closeButton = within(modalFooter).getByText('Close');
  fireEvent.click(closeButton);

  await waitFor(() => {
    // Then the modal should be gone.
    expect(modal).not.toBeInTheDocument();
  });
});

it('lists existing keypairs', async () => {
  // Given the cluster has some keypairs.
  getMockCall(`/v4/clusters/${V5_CLUSTER.id}/key-pairs/`, keyPairsResponse);

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.KeyPairs,
    {
      orgId: ORGANIZATION,
      clusterId: V5_CLUSTER.id,
    }
  );

  // And the app is on the cluster detail page.
  const { findByText, getByText } = renderRouteWithStore(clusterDetailPath);

  // Then I should see existing key pairs.
  const firstKeypair = await findByText(/first-key-pair-cn.*/i);
  expect(firstKeypair).toBeInTheDocument();

  const secondKeypair = getByText(/second-key-pair-cn.*/i);
  expect(secondKeypair).toBeInTheDocument();
});
