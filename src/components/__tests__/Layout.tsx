import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import axios from 'axios';
import { createMemoryHistory } from 'history';
import Layout from 'Layout';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import nock from 'nock';
import * as React from 'react';
import { StatusCodes } from 'shared/constants';
import { mapOAuth2UserToUser } from 'stores/main/utils';
import { cache, SWRConfig } from 'swr';
import * as authorizationv1Mocks from 'testUtils/mockHttpCalls/authorizationv1';
import preloginState from 'testUtils/preloginState';
import { getComponentWithStore } from 'testUtils/renderUtils';

function getComponent(props: React.ComponentPropsWithoutRef<typeof Layout>) {
  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <Layout {...p} />
    </SWRConfig>
  );

  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  return getComponentWithStore(
    Component,
    props,
    {
      main: {
        ...preloginState.main,
        loggedInUser: mapOAuth2UserToUser(auth.loggedInUser!),
      },
    },
    {},
    history,
    auth
  );
}

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.unmock('model/services/mapi/authorizationv1/createSelfSubjectRulesReview');
jest.unmock('model/services/mapi/securityv1alpha1/getOrganizationList');
jest.unmock('model/services/mapi/securityv1alpha1/getOrganization');

describe('Layout', () => {
  beforeAll(() => {
    axios.defaults.adapter = require('axios/lib/adapters/http');
  });

  afterAll(() => {
    axios.defaults.adapter = require('axios/lib/adapters/xhr');
  });

  beforeEach(() => {
    const organizations = {
      apiVersion: 'security.giantswarm.io/v1alpha1',
      items: [
        {
          apiVersion: 'security.giantswarm.io/v1alpha1',
          kind: 'Organization',
          metadata: {
            creationTimestamp: '2021-04-20T11:04:21Z',
            name: 'giantswarm',
          },
          spec: {},
        },
        {
          apiVersion: 'security.giantswarm.io/v1alpha1',
          kind: 'Organization',
          metadata: {
            creationTimestamp: '2021-04-20T11:04:21Z',
            name: 'test',
          },
          spec: {},
        },
      ],
      kind: 'OrganizationList',
    };

    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/')
      .reply(StatusCodes.Ok, organizations);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: 'default',
            verb: 'list',
            group: 'security.giantswarm.io',
            resource: 'organizations',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListOrgs
      );
  });

  afterEach(() => {
    cache.clear();
  });

  it('blocks users that do not have the required permissions to use the app', async () => {
    const rulesReview = {
      kind: 'SelfSubjectRulesReview',
      apiVersion: 'authorization.k8s.io/v1',
      metadata: {
        creationTimestamp: null,
      },
      spec: {},
      status: {
        resourceRules: [
          {
            verbs: ['create'],
            apiGroups: ['authorization.k8s.io'],
            resources: ['selfsubjectaccessreviews', 'selfsubjectrulesreviews'],
          },
        ],
        incomplete: false,
      },
    };

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectrulesreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectRulesReview',
        spec: { namespace: 'org-giantswarm' },
      })
      .reply(StatusCodes.Ok, rulesReview);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectrulesreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectRulesReview',
        spec: { namespace: 'org-test' },
      })
      .reply(StatusCodes.Ok, rulesReview);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectrulesreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectRulesReview',
        spec: { namespace: 'default' },
      })
      .reply(StatusCodes.Ok, rulesReview);

    render(getComponent({}));

    await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));

    expect(
      await screen.findByText('Insufficient permissions')
    ).toBeInTheDocument();
  });

  it('allows users that have the required permissions to use the app', async () => {
    const rulesReview = {
      kind: 'SelfSubjectRulesReview',
      apiVersion: 'authorization.k8s.io/v1',
      metadata: {
        creationTimestamp: null,
      },
      spec: {},
      status: {
        resourceRules: [
          {
            verbs: ['create'],
            apiGroups: ['authorization.k8s.io'],
            resources: ['selfsubjectaccessreviews', 'selfsubjectrulesreviews'],
          },
          {
            verbs: ['list'],
            apiGroups: ['cluster.x-k8s.io'],
            resources: ['clusters'],
          },
        ],
        incomplete: false,
      },
    };

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectrulesreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectRulesReview',
        spec: { namespace: 'org-giantswarm' },
      })
      .reply(StatusCodes.Ok, rulesReview);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectrulesreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectRulesReview',
        spec: { namespace: 'org-test' },
      })
      .reply(StatusCodes.Ok, rulesReview);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectrulesreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectRulesReview',
        spec: { namespace: 'default' },
      })
      .reply(StatusCodes.Ok, rulesReview);

    render(getComponent({}));

    await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));

    expect(
      screen.queryByText('Insufficient permissions')
    ).not.toBeInTheDocument();
  });
});
