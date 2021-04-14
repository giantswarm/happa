import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import axios from 'axios';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import RoutePath from 'lib/routePath';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import * as React from 'react';
import { StatusCodes } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { cache, SWRConfig } from 'swr';
import * as authorizationv1Mocks from 'testUtils/mockHttpCalls/authorizationv1';
import * as securityv1alpha1Mocks from 'testUtils/mockHttpCalls/securityv1alpha1';
import { getComponentWithStore } from 'testUtils/renderUtils';

import OrganizationDetail from '../OrganizationDetail';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof OrganizationDetail>
) {
  const path = RoutePath.createUsablePath(OrganizationsRoutes.Detail, {
    orgId: 'org1',
  });

  const history = createMemoryHistory({
    initialEntries: [path],
    initialIndex: 0,
  });
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <OrganizationDetail {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    props,
    undefined,
    undefined,
    history,
    auth
  );
}

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn().mockReturnValue({ orgId: 'org1' }),
}));

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.unmock('model/services/mapi/securityv1alpha1/getOrganization');
jest.unmock('model/services/mapi/securityv1alpha1/getOrganizationList');

describe('OrganizationDetail', () => {
  beforeAll(() => {
    axios.defaults.adapter = require('axios/lib/adapters/http');
  });

  afterAll(() => {
    axios.defaults.adapter = require('axios/lib/adapters/xhr');
  });

  beforeEach(() => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
  });

  afterEach(() => {
    cache.clear();
  });

  it('renders without crashing', async () => {
    render(getComponent({}));

    await waitForElementToBeRemoved(screen.getByTitle('Loading...'));
  });

  it('provides the ability to delete an organization', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .delete('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/')
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListOrgs
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationListResponse);

    render(getComponent({}));

    await waitForElementToBeRemoved(screen.getByTitle('Loading...'));

    const deleteButton = screen.getByText('Delete Organization');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Yes, delete it'));

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();

    expect(
      await screen.findByText('Organization org1 deleted successfully.')
    ).toBeInTheDocument();
  });

  it('displays an error if deleting an organization fails', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .delete('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.InternalServerError, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'There was a huge problem.',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.InternalError,
        code: StatusCodes.InternalServerError,
      });

    render(getComponent({}));

    await waitForElementToBeRemoved(screen.getByTitle('Loading...'));

    const deleteButton = screen.getByText('Delete Organization');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Yes, delete it'));

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();

    expect(
      await screen.findByText('Could not delete organization org1:')
    ).toBeInTheDocument();
    expect(screen.getByText('There was a huge problem.')).toBeInTheDocument();
  });

  it('can cancel deletion', async () => {
    render(getComponent({}));

    await waitForElementToBeRemoved(screen.getByTitle('Loading...'));

    const deleteButton = screen.getByText('Delete Organization');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Cancel'));

    await waitForElementToBeRemoved(screen.getByText('Are you sure?'));
  });
});
