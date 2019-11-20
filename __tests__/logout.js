import '@testing-library/jest-dom/extend-expect';
import { fireEvent, wait } from '@testing-library/react';
import {
  getMockCall,
  infoResponse,
  userResponse,
} from 'test_utils/mockHttpCalls';
import { renderRouteWithStore } from 'test_utils/renderUtils';
import initialState from 'test_utils/initialState';

it('logging out redirects to the login page', async () => {
  // Given I have a Giant Swarm API with no clusters, organizations, appcatalogs
  // that I am already logged in on.

  // The response to the user info call
  const userInfoRequest = getMockCall('/v4/user/', userResponse);
  // The response to the info call
  const infoRequest = getMockCall('/v4/info/', infoResponse);
  // The response to the org call (no orgs)
  const orgRequest = getMockCall('/v4/organizations/');
  // The response to the clusters call (no clusters)
  const clustersRequest = getMockCall('/v4/clusters/');
  // The response to the appcatalogs call (no catalogs)
  const appcatalogsRequest = getMockCall('/v4/appcatalogs/');

  // Given I am logged in and on the home page.
  const div = document.createElement('div');
  const { getByText } = renderRouteWithStore('/', div, initialState());

  // Wait till the app is ready and we're on the home page.
  await wait(() => {
    expect(getByText(/Welcome to Giant Swarm!/i)).toBeInTheDocument();
  });

  // When I click logout in the user dropdown.
  const userDropdown = getByText('developer@giantswarm.io');
  fireEvent.click(userDropdown);

  const logoutButton = getByText('Logout');
  fireEvent.click(logoutButton);

  // Then I should get redirected to the login page.
  await wait(() => {
    expect(getByText('Log in')).toBeInTheDocument();
  });

  // Assert that the mocked responses got called, tell them to stop waiting for
  // a request.
  userInfoRequest.done();
  infoRequest.done();
  orgRequest.done();
  clustersRequest.done();
  appcatalogsRequest.done();
});
