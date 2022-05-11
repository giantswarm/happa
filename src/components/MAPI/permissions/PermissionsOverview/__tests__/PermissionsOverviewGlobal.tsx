import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import { usePermissions } from 'MAPI/permissions/usePermissions';
import { StatusCodes } from 'model/constants';
import { mapOAuth2UserToUser } from 'model/stores/main/utils';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as authorizationv1Mocks from 'test/mockHttpCalls/authorizationv1';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import PermissionsOverviewGlobal from '../PermissionsOverviewGlobal';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof PermissionsOverviewGlobal>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <PermissionsOverviewGlobal {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    props,
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

function createMockUseCases(): IPermissionsUseCase[] {
  return [
    {
      name: 'Inspect namespaces',
      category: 'access control',
      description:
        'List namespaces and get an individual namespace&apos;s details',
      scope: { cluster: true },
      permissions: [
        {
          apiGroups: [''],
          resources: ['namespaces'],
          verbs: ['get', 'list'],
        },
      ],
    },
    {
      name: 'Inspect shared app catalogs',
      category: 'app catalogs',
      description:
        'Read catalogs and their entries in the &quot;default&quot; namespace',
      permissions: [
        {
          apiGroups: ['application.giantswarm.io'],
          resources: ['catalogs', 'appcatalogentries'],
          verbs: ['get', 'list'],
        },
      ],
      scope: { namespaces: ['default'] },
    },
  ];
}

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.mock('MAPI/permissions/usePermissions');

describe('PermissionsOverviewGlobal', () => {
  it('renders without crashing', () => {
    (usePermissions as jest.Mock).mockReturnValue({
      default: {
        '*:*:*': ['*'],
      },
    });
    render(getComponent({ useCases: createMockUseCases() }));
  });

  it('displays permissions for global use cases', async () => {
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
            verb: 'get',
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
      .get('/apis/rbac.authorization.k8s.io/v1/clusterroles/cluster-admin/')
      .reply(StatusCodes.Ok, {
        kind: 'ClusterRoleBindingList',
        apiVersion: 'authorization.k8s.io/v1',
        rules: [
          {
            verbs: ['*'],
            apiGroups: ['*'],
            resources: ['*'],
          },
        ],
      });

    render(getComponent({ useCases: createMockUseCases() }));

    expect(await screen.findByText('access control')).toBeInTheDocument();
    expect(screen.queryByText('Inspect namespaces')).not.toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('access control permission status')
      ).getByText('Yes')
    ).toBeInTheDocument();
    // Toggle use case category
    fireEvent.click(screen.getByLabelText('access control'));
    expect(await screen.findByText('Inspect namespaces')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('Inspect namespaces permission status')
      ).getByText('Yes')
    ).toBeInTheDocument();

    expect(await screen.findByText('app catalogs')).toBeInTheDocument();
    // Toggle use case category
    fireEvent.click(screen.getByLabelText('app catalogs'));
    expect(
      await screen.findByText('Inspect shared app catalogs')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('Inspect shared app catalogs permission status')
      ).getByText('Yes')
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

    render(getComponent({ useCases: createMockUseCases() }));

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

    render(getComponent({ useCases: createMockUseCases() }));

    expect(await screen.findByText('access control')).toBeInTheDocument();
    // Toggle use case category
    fireEvent.click(screen.getByLabelText('access control'));
    expect(await screen.findByText('Inspect namespaces')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('Inspect namespaces permission status')
      ).getByText('No')
    ).toBeInTheDocument();

    expect(await screen.findByText('app catalogs')).toBeInTheDocument();
    // Toggle use case category
    fireEvent.click(screen.getByLabelText('app catalogs'));
    expect(
      await screen.findByText('Inspect shared app catalogs')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('Inspect shared app catalogs permission status')
      ).getByText('Yes')
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

    render(getComponent({ useCases: createMockUseCases() }));

    expect(await screen.findByText('access control')).toBeInTheDocument();
    // Toggle use case category
    fireEvent.click(screen.getByLabelText('access control'));
    expect(await screen.findByText('Inspect namespaces')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('Inspect namespaces permission status')
      ).getByText('No')
    ).toBeInTheDocument();

    expect(await screen.findByText('app catalogs')).toBeInTheDocument();
    // Toggle use case category
    fireEvent.click(screen.getByLabelText('app catalogs'));
    expect(
      await screen.findByText('Inspect shared app catalogs')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('Inspect shared app catalogs permission status')
      ).getByText('No')
    ).toBeInTheDocument();
  });
});
