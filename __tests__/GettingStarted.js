import '@testing-library/jest-dom/extend-expect';

import { fireEvent, wait } from '@testing-library/react';
import nock from 'nock';
import { AppRoutes } from 'shared/constants/routes';
import {
  appCatalogsResponse,
  AWSInfoResponse,
  getMockCall,
  ORGANIZATION,
  orgResponse,
  orgsResponse,
  userResponse,
  V4_CLUSTER,
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v4ClustersResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

// Responses to requests
beforeEach(() => {
  getMockCall('/v4/user/', userResponse);
  getMockCall('/v4/info/', AWSInfoResponse);
  getMockCall('/v4/organizations/', orgsResponse);
  getMockCall(`/v4/organizations/${ORGANIZATION}/`, orgResponse);
  getMockCall(`/v4/organizations/${ORGANIZATION}/credentials/`);
  getMockCall('/v4/appcatalogs/', appCatalogsResponse);
  // prettier-ignore
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/status/`,v4AWSClusterStatusResponse);
});

afterEach(async () => {
  if (!nock.isDone()) {
    // eslint-disable-next-line no-console
    console.error('Nock has pending mocks:', nock.pendingMocks());
  }

  await wait(() => expect(nock.isDone()).toBeTruthy());

  nock.cleanAll();
});

/************ TESTS ************/

it('lets me get there from the dashboard and go through the pages', async () => {
  // prettier-ignore
  getMockCall('/v4/clusters/', v4ClustersResponse);
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`, v4AWSClusterResponse);

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

it('the get started button does not show up if the cluster is older than 30 days', async () => {
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 2);

  const clusterCreateDate2MonthsLater = futureDate.toISOString();

  // prettier-ignore
  getMockCall('/v4/clusters/', [Object.assign({}, v4ClustersResponse[0], {create_date: clusterCreateDate2MonthsLater})]);
  // prettier-ignore
  getMockCall(`/v4/clusters/${V4_CLUSTER.id}/`,Object.assign({}, v4AWSClusterResponse, {create_date: clusterCreateDate2MonthsLater,}));

  const { findByText, queryByText } = renderRouteWithStore(AppRoutes.Home);

  await findByText(V4_CLUSTER.id);
  expect(queryByText('Get Started')).not.toBeInTheDocument();

  await wait(() => expect(nock.isDone()).toBeTruthy());
});
