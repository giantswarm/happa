import { render, screen, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { usePermissions } from 'MAPI/permissions/usePermissions';
import { StatusCodes } from 'model/constants';
import { mapOAuth2UserToUser } from 'model/stores/main/utils';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as authorizationv1Mocks from 'test/mockHttpCalls/authorizationv1';
import * as rbacv1Mocks from 'test/mockHttpCalls/rbacv1';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import PermissionsOverview from '../PermissionsOverview';

function getComponent() {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = () => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <PermissionsOverview />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    undefined,
    {
      ...preloginState,
      main: {
        ...preloginState.main,
        loggedInUser: mapOAuth2UserToUser(auth.loggedInUser!),
      },
    },
    undefined,
    history,
    auth
  );
}

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.mock('MAPI/permissions/usePermissions');

describe('PermissionsOverview', () => {
  it('renders without crashing', () => {
    (usePermissions as jest.Mock).mockReturnValue({});
    render(getComponent());
  });

  it('displays permissions for use cases', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        default: {
          '*:*:*': ['*'],
        },
      },
    });

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            verb: 'list',
            group: 'rbac.authorization.k8s.io',
            resource: 'clusterrolebindings',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListClusterRoleBindings
      );
    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            verb: 'list',
            group: 'rbac.authorization.k8s.io',
            resource: 'clusterroles',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanGetClusterRoles
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/')
      .reply(StatusCodes.Ok, {
        kind: 'ClusterRoleBindingList',
        apiVersion: 'authorization.k8s.io/v1',
        items: [
          {
            roleRef: {
              kind: 'ClusterRole',
              name: 'cluster-admin',
            },
            subjects: [
              {
                kind: 'User',
                name: 'developer@giantswarm.io',
              },
            ],
          },
        ],
      });
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/clusterroles/')
      .reply(StatusCodes.Ok, rbacv1Mocks.clusterRoleList);

    render(getComponent());

    expect(await screen.findByText('access control')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('access control permission status')
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(await screen.findByText('app catalogs')).toBeInTheDocument();
    expect(
      within(screen.getByLabelText('app catalogs permission status')).getByText(
        'Yes'
      )
    ).toBeInTheDocument();
  });

  it('displays an error message if we cannot get permissions at the cluster scope', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        default: {
          '*:*:*': ['*'],
        },
      },
    });

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            verb: 'list',
            group: 'rbac.authorization.k8s.io',
            resource: 'clusterrolebindings',
          },
        },
      })
      .reply(StatusCodes.BadRequest);

    render(getComponent());

    expect(
      await screen.findByText(
        `Something went wrong while trying to compute your user's RBAC permissions at the cluster scope.`
      )
    ).toBeInTheDocument();
  });

  it('displays permissions for global use cases for a user without permissions at the cluster scope', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        default: {
          'application.giantswarm.io:catalogs:*': ['get', 'list'],
          'application.giantswarm.io:appcatalogentries:*': ['get', 'list'],
        },
      },
    });

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            verb: 'list',
            group: 'rbac.authorization.k8s.io',
            resource: 'clusterrolebindings',
          },
        },
      })
      .reply(
        StatusCodes.Created,
        authorizationv1Mocks.selfSubjectAccessReviewCantListClusterRoleBindings
      );

    render(getComponent());

    expect(await screen.findByText('access control')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('access control permission status')
      ).getByText('No')
    ).toBeInTheDocument();

    expect(await screen.findByText('app catalogs')).toBeInTheDocument();
    expect(
      within(screen.getByLabelText('app catalogs permission status')).getByText(
        'Yes'
      )
    ).toBeInTheDocument();
  });

  it('displays permissions for global use cases for a user without permissions in the `default` namespace', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        default: {},
      },
    });
    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            verb: 'list',
            group: 'rbac.authorization.k8s.io',
            resource: 'clusterrolebindings',
          },
        },
      })
      .reply(
        StatusCodes.Created,
        authorizationv1Mocks.selfSubjectAccessReviewCantListClusterRoleBindings
      );

    render(getComponent());

    expect(await screen.findByText('access control')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('access control permission status')
      ).getByText('No')
    ).toBeInTheDocument();

    expect(await screen.findByText('app catalogs')).toBeInTheDocument();
    expect(
      within(screen.getByLabelText('app catalogs permission status')).getByText(
        'No'
      )
    ).toBeInTheDocument();
  });
});
