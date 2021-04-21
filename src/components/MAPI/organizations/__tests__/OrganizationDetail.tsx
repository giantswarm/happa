import {
  fireEvent,
  render,
  screen,
  waitFor,
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

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1alpha3',
        items: [],
        kind: 'ClusterList',
      });

    render(getComponent({}));

    await waitForElementToBeRemoved(screen.getByTitle('Loading...'));

    const deleteButton = screen.getByText('Delete organization');
    expect(deleteButton).toBeInTheDocument();

    await waitFor(() => expect(deleteButton).toBeEnabled());

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

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1alpha3',
        items: [],
        kind: 'ClusterList',
      });

    render(getComponent({}));

    await waitForElementToBeRemoved(screen.getByTitle('Loading...'));

    const deleteButton = screen.getByText('Delete organization');
    expect(deleteButton).toBeInTheDocument();

    await waitFor(() => expect(deleteButton).toBeEnabled());

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
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1alpha3',
        items: [],
        kind: 'ClusterList',
      });

    render(getComponent({}));

    await waitForElementToBeRemoved(screen.getByTitle('Loading...'));

    const deleteButton = screen.getByText('Delete organization');
    expect(deleteButton).toBeInTheDocument();

    await waitFor(() => expect(deleteButton).toBeEnabled());

    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Cancel'));

    await waitForElementToBeRemoved(screen.getByText('Are you sure?'));
  });

  it('cannot delete the organization if there are still clusters in its namespace', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1alpha3',
        items: [
          {
            apiVersion: 'cluster.x-k8s.io/v1alpha3',
            kind: 'Cluster',
            metadata: {
              annotations: {
                'cluster.giantswarm.io/description': 'Unnamed cluster',
              },
              creationTimestamp: '2021-04-21T17:23:11Z',
              labels: {
                'azure-operator.giantswarm.io/version': '5.5.2',
                'cluster-operator.giantswarm.io/version': '0.23.22',
                'cluster.x-k8s.io/cluster-name': 'ed30d',
                'giantswarm.io/cluster': 'ed30d',
                'giantswarm.io/organization': 'org1',
                'release.giantswarm.io/version': '14.1.4',
              },
              spec: {
                clusterNetwork: {
                  apiServerPort: 443,
                  serviceDomain: 'cluster.local',
                  services: {
                    cidrBlocks: ['172.31.0.0/16'],
                  },
                },
                controlPlaneEndpoint: {
                  host: '',
                  port: 0,
                },
                infrastructureRef: {
                  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
                  kind: 'AzureCluster',
                  name: 'ed30d',
                  namespace: 'org-org1',
                },
              },
            },
          },
        ],
        kind: 'ClusterList',
      });

    render(getComponent({}));

    await waitForElementToBeRemoved(screen.getByTitle('Loading...'));

    const deleteButton = screen.getByText('Delete organization');
    expect(deleteButton).toBeInTheDocument();

    await waitFor(() => expect(nock.isDone()).toBeTruthy());

    expect(deleteButton).toBeDisabled();
  });
});
