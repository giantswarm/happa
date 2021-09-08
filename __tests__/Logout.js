import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitFor } from '@testing-library/react';
import { getConfiguration } from 'model/services/metadata/configuration';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { MainRoutes } from 'shared/constants/routes';
import {
  API_ENDPOINT,
  getMockCall,
  metadataResponse,
  userResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

beforeEach(() => {
  getConfiguration.mockResolvedValueOnce(metadataResponse);
});

it('logging out redirects to the login page', async () => {
  // Given I have a Giant Swarm API with no clusters, organizations, appcatalogs
  // that I am already logged in on.

  // The response to the user info call
  getMockCall('/v4/user/', userResponse);
  // The response to the org call (no orgs)
  getMockCall('/v4/organizations/');
  // The response to the clusters call (no clusters)
  getMockCall('/v4/clusters/');
  // The response to the appcatalogs call (no catalogs)
  getMockCall('/v4/appcatalogs/');

  nock(API_ENDPOINT).delete('/v4/auth-tokens/').reply(StatusCodes.Ok);

  // Given I am logged in and on the home page.
  const { getByText } = renderRouteWithStore(MainRoutes.Home);

  // Wait till the app is ready and we're on the home page.
  await waitFor(() => {
    expect(getByText(/Welcome to Giant Swarm!/i)).toBeInTheDocument();
  });

  // When I click logout in the user dropdown.
  const userDropdown = getByText('developer@giantswarm.io');
  fireEvent.click(userDropdown);

  const logoutButton = getByText('Logout');
  fireEvent.click(logoutButton);

  // Then I should get redirected to the login page.
  await waitFor(() => {
    expect(getByText('Welcome to Giant Swarm')).toBeInTheDocument();
  });
});
