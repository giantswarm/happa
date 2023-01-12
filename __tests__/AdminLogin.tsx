import { screen } from '@testing-library/react';
import { MainRoutes } from 'model/constants/routes';
import {
  createSelfSubjectAccessReview,
  createSelfSubjectRulesReview,
} from 'model/services/mapi/authorizationv1';
import { getOrganizationList } from 'model/services/mapi/securityv1alpha1/getOrganizationList';
import { getConfiguration } from 'model/services/metadata/configuration';
import {
  getMockCall,
  getOrganizationListResponse,
  metadataResponse,
  releasesResponse,
  selfSubjectAccessReviewCanListOrgs,
  selfSubjectRulesReviewWithSomeOrgs,
} from 'test/mockHttpCalls';
import { createInitialHistory, renderRouteWithStore } from 'test/renderUtils';
import { MapiAuthConnectorFilters } from 'utils/MapiAuth/MapiAuth';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

describe('AdminLogin', () => {
  it('performs the admin login flow via OAuth2', async () => {
    (getOrganizationList as jest.Mock).mockResolvedValue(
      getOrganizationListResponse
    );
    (createSelfSubjectAccessReview as jest.Mock).mockResolvedValue(
      selfSubjectAccessReviewCanListOrgs
    );
    (createSelfSubjectRulesReview as jest.Mock).mockResolvedValue(
      selfSubjectRulesReviewWithSomeOrgs
    );
    (getConfiguration as jest.Mock).mockResolvedValueOnce(metadataResponse);
    getMockCall('/v4/clusters/');
    getMockCall('/v4/releases/', releasesResponse);

    const history = createInitialHistory(MainRoutes.AdminLogin);

    const testAuth = new TestOAuth2(history);
    const attemptLoginMockFn = jest.spyOn(testAuth, 'attemptLogin');

    renderRouteWithStore(
      MainRoutes.AdminLogin,
      undefined,
      undefined,
      testAuth,
      history
    );

    expect(attemptLoginMockFn).toHaveBeenCalledWith(
      MapiAuthConnectorFilters.GiantSwarm
    );

    expect(await screen.findByText('Launch new cluster')).toBeInTheDocument();
    attemptLoginMockFn.mockRestore();
  });

  it('displays an error message if the OAuth2 flow fails', async () => {
    const history = createInitialHistory(MainRoutes.AdminLogin);

    const testAuth = new TestOAuth2(history);
    const handleLoginResponseMockFn = jest.spyOn(
      testAuth,
      'handleLoginResponse'
    );
    handleLoginResponseMockFn.mockImplementation(() => {
      return Promise.reject(new Error('Authentication failed.'));
    });
    (createSelfSubjectRulesReview as jest.Mock).mockResolvedValue(
      selfSubjectRulesReviewWithSomeOrgs
    );

    renderRouteWithStore(
      MainRoutes.AdminLogin,
      undefined,
      undefined,
      testAuth,
      history
    );

    expect(
      await screen.findByText(
        'Please log in again, as your previously saved credentials appear to be invalid.'
      )
    ).toBeInTheDocument();
    handleLoginResponseMockFn.mockRestore();
  });
});
