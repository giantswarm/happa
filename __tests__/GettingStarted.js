import '@testing-library/jest-dom/extend-expect';

import { fireEvent } from '@testing-library/react';
import { getInstallationInfo } from 'model/services/giantSwarm';
import { AppRoutes } from 'shared/constants/routes';
import {
  appCatalogsResponse,
  appsResponse,
  AWSInfoResponse,
  getPersistedMockCall,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  releasesResponse,
  userResponse,
  V4_CLUSTER,
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v4ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

// Tests setup
const requests = {};

// Responses to requests
beforeAll(() => {
  requests.userInfo = getPersistedMockCall('/v4/user/', userResponse);
  getInstallationInfo.mockResolvedValueOnce(AWSInfoResponse);
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

it('lets me get there from the dashboard and go through the pages', async () => {
  const { findByText } = renderRouteWithStore(AppRoutes.Home);

  const getStartedButton = await findByText('Get Started');
  expect(getStartedButton).toBeInTheDocument();

  fireEvent.click(getStartedButton);

  const guideTitle = await findByText(
    'Get started with your Kubernetes cluster'
  );
  expect(guideTitle).toBeInTheDocument();

  const startButton = await findByText('Start');
  fireEvent.click(startButton);

  const continueButton = await findByText('Continue');
  fireEvent.click(continueButton);

  const finishButton = await findByText('Finish');
  fireEvent.click(finishButton);

  const congratulations = await findByText('Congratulations');
  expect(congratulations).toBeInTheDocument();
});
