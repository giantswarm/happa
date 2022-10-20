import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { SubjectTypes } from 'MAPI/permissions/types';
import { usePermissions } from 'MAPI/permissions/usePermissions';
import { Providers, StatusCodes } from 'model/constants';
import { mapOAuth2UserToUser } from 'model/stores/main/utils';
import { IOrganizationState } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as authorizationv1Mocks from 'test/mockHttpCalls/authorizationv1';
import * as rbacv1Mocks from 'test/mockHttpCalls/rbacv1';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import PermissionsOverview, {
  IPermissionsOverviewProps,
} from '../PermissionsOverview';

function getComponent(props: IPermissionsOverviewProps) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <PermissionsOverview {...p} />
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
      entities: {
        organizations: {
          ...preloginState.entities.organizations,
          items: {
            org1: {
              id: 'org1',
              name: 'org1',
              namespace: 'org-org1',
            },
            org2: {
              id: 'org2',
              name: 'org2',
              namespace: 'org-org2',
            },
          },
        } as IOrganizationState,
      } as IState['entities'],
    },
    undefined,
    history,
    auth
  );
}

function createDefaultPermissions() {
  return {
    default: {
      '*:*:*': ['*'],
    },
    'org-org1': {
      '*:*:*': ['*'],
    },
    'org-org2': {
      'application.giantswarm.io:apps:*': ['get', 'list'],
      ':configmaps:*': ['get', 'list'],
      ':secrets:*': ['get', 'list'],
    },
  };
}

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.unmock(
  'model/services/mapi/authorizationv1/createLocalSubjectAccessReview'
);
jest.mock('MAPI/permissions/usePermissions');

describe('PermissionsOverview', () => {
  beforeEach(() => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: createDefaultPermissions(),
    });
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays permissions for global use cases', async () => {
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

    render(getComponent({}));

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
    expect(
      within(screen.getByLabelText('app catalogs permission status')).getByText(
        'Yes'
      )
    ).toBeInTheDocument();
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

    render(getComponent({}));

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

    render(getComponent({}));

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

    render(getComponent({}));

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

  it('displays organization permissions for categories', async () => {
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

    render(getComponent({}));

    expect(await screen.findByText('access control')).toBeInTheDocument();

    // Toggle 'For organizations' tab
    fireEvent.click(screen.getByRole('tab', { name: 'For organizations' }));

    expect(await screen.findByText('app catalogs')).toBeInTheDocument();
    expect(screen.queryByText('Inspect app catalogs')).not.toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'app catalogs for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'app catalogs for org2 organization permission status'
        )
      ).getByText('No')
    ).toBeInTheDocument();

    expect(await screen.findByText('apps')).toBeInTheDocument();
    expect(screen.queryByText('Inspect apps')).not.toBeInTheDocument();
    expect(screen.queryByText('Manage apps')).not.toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('apps for org1 organization permission status')
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('apps for org2 organization permission status')
      ).getByText('Partial')
    ).toBeInTheDocument();
  });

  it('displays organization permissions for use cases', async () => {
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

    render(getComponent({}));

    expect(await screen.findByText('access control')).toBeInTheDocument();

    // Toggle 'For organizations' tab
    fireEvent.click(screen.getByRole('tab', { name: 'For organizations' }));

    // Toggle app catalogs category
    fireEvent.click(screen.getByLabelText('app catalogs'));
    expect(await screen.findByText('Inspect app catalogs')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect app catalogs for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect app catalogs for org2 organization permission status'
        )
      ).getByText('No')
    ).toBeInTheDocument();

    // Toggle apps category
    fireEvent.click(screen.getByLabelText('apps'));
    expect(await screen.findByText('Inspect apps')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect apps for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect apps for org2 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();

    expect(await screen.findByText('Manage apps')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Manage apps for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Manage apps for org2 organization permission status'
        )
      ).getByText('No')
    ).toBeInTheDocument();
  });

  it('allows inspecting permissions for users', async () => {
    nock(window.config.mapiEndpoint)
      .post(
        '/apis/authorization.k8s.io/v1/namespaces/default/localsubjectaccessreviews/',
        {
          apiVersion: 'authorization.k8s.io/v1',
          kind: 'LocalSubjectAccessReview',
          metadata: { name: '', namespace: 'default' },
          spec: {
            resourceAttributes: {
              namespace: 'default',
              verb: 'list',
              group: 'security.giantswarm.io',
              resource: 'organizations',
            },
            user: 'test-user',
          },
        }
      )
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.localSubjectAccessReviewCanListOrgs
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/clusterroles/')
      .reply(StatusCodes.Ok, rbacv1Mocks.clusterRoleList);
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/roles/')
      .reply(StatusCodes.Ok, rbacv1Mocks.roleList);
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/rolebindings/')
      .reply(StatusCodes.Ok, rbacv1Mocks.roleBindingList);
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
              name: 'read-all',
            },
            subjects: [
              {
                kind: 'User',
                name: 'test-user',
              },
            ],
          },
        ],
      });
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/clusterroles/')
      .reply(StatusCodes.Ok, rbacv1Mocks.clusterRoleList);

    render(
      getComponent({
        subjectType: SubjectTypes.User,
        subjectName: 'test-user',
      })
    );

    expect(await screen.findByText('access control')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('access control permission status')
      ).getByText('Partial')
    ).toBeInTheDocument();

    // displays app (web UI) access use case
    const interfacesCategory = await screen.findByText('interfaces');
    fireEvent.click(interfacesCategory);

    expect(await screen.findByText('Use web UI')).toBeInTheDocument();
  });

  it('allows inspecting permissions for groups', async () => {
    nock(window.config.mapiEndpoint)
      .post(
        '/apis/authorization.k8s.io/v1/namespaces/default/localsubjectaccessreviews/',
        {
          apiVersion: 'authorization.k8s.io/v1',
          kind: 'LocalSubjectAccessReview',
          metadata: { name: '', namespace: 'default' },
          spec: {
            resourceAttributes: {
              namespace: 'default',
              verb: 'list',
              group: 'security.giantswarm.io',
              resource: 'organizations',
            },
            groups: ['customer:giantswarm:test-group'],
          },
        }
      )
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.localSubjectAccessReviewCanListOrgs
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/clusterroles/')
      .reply(StatusCodes.Ok, rbacv1Mocks.clusterRoleList);
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/roles/')
      .reply(StatusCodes.Ok, rbacv1Mocks.roleList);
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/rolebindings/')
      .reply(StatusCodes.Ok, rbacv1Mocks.roleBindingList);
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
                kind: 'Group',
                name: 'customer:giantswarm:test-group',
              },
            ],
          },
        ],
      });
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/clusterroles/')
      .reply(StatusCodes.Ok, rbacv1Mocks.clusterRoleList);

    render(
      getComponent({
        subjectType: SubjectTypes.Group,
        subjectName: 'customer:giantswarm:test-group',
      })
    );

    expect(await screen.findByText('access control')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('access control permission status')
      ).getByText('Yes')
    ).toBeInTheDocument();

    // displays app (web UI) access use case
    const interfacesCategory = await screen.findByText('interfaces');
    fireEvent.click(interfacesCategory);

    expect(await screen.findByText('Use web UI')).toBeInTheDocument();
  });

  it('allows inspecting permissions for service accounts', async () => {
    nock(window.config.mapiEndpoint)
      .post(
        '/apis/authorization.k8s.io/v1/namespaces/default/localsubjectaccessreviews/',
        {
          apiVersion: 'authorization.k8s.io/v1',
          kind: 'LocalSubjectAccessReview',
          metadata: { name: '', namespace: 'default' },
          spec: {
            resourceAttributes: {
              namespace: 'default',
              verb: 'list',
              group: 'security.giantswarm.io',
              resource: 'organizations',
            },
            user: 'system:serviceaccount:default:test-service-account',
          },
        }
      )
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.localSubjectAccessReviewCanListOrgs
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/clusterroles/')
      .reply(StatusCodes.Ok, rbacv1Mocks.clusterRoleList);
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/roles/')
      .reply(StatusCodes.Ok, rbacv1Mocks.roleList);
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/rolebindings/')
      .reply(StatusCodes.Ok, rbacv1Mocks.roleBindingList);
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
              name: 'yolo',
            },
            subjects: [
              {
                kind: 'Service Account',
                name: 'test-service-account',
                namespace: 'default',
              },
            ],
          },
        ],
      });
    nock(window.config.mapiEndpoint)
      .get('/apis/rbac.authorization.k8s.io/v1/clusterroles/')
      .reply(StatusCodes.Ok, rbacv1Mocks.clusterRoleList);

    render(
      getComponent({
        subjectType: SubjectTypes.ServiceAccount,
        subjectName: 'system:serviceaccount:default:test-service-account',
      })
    );

    expect(await screen.findByText('access control')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('access control permission status')
      ).getByText('No')
    ).toBeInTheDocument();

    // does not display category for app access use case
    expect(screen.queryByLabelText('interfaces')).not.toBeInTheDocument();
  });
});

describe('PermissionsOverview on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const useCases = window.config.permissionsUseCasesJSON;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  beforeEach(() => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: createDefaultPermissions(),
    });
  });
  afterEach(() => {
    window.config.permissionsUseCasesJSON = useCases;
  });

  it('displays permissions statuses for workload clusters use cases', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        'org-org1': {
          'cluster.x-k8s.io:clusters:*': ['*'],
          'infrastructure.cluster.x-k8s.io:azureclusters:*': ['*'],
          'infrastructure.cluster.x-k8s.io:azuremachines:*': ['*'],
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

    render(getComponent({}));

    // Toggle 'For organizations' tab
    fireEvent.click(screen.getByRole('tab', { name: 'For organizations' }));

    expect(await screen.findByText('workload clusters')).toBeInTheDocument();

    // Toggle clusters category
    fireEvent.click(screen.getByLabelText('workload clusters'));
    expect(await screen.findByText('Inspect clusters')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect clusters for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
  });
});

describe('PermissionsOverview on AWS', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const useCases = window.config.permissionsUseCasesJSON;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AWS;
    (usePermissions as jest.Mock).mockReturnValue({
      data: createDefaultPermissions(),
    });
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  beforeEach(() => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: createDefaultPermissions(),
    });
  });
  afterEach(() => {
    window.config.permissionsUseCasesJSON = useCases;
  });

  it('displays permissions statuses for workload clusters use cases', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        'org-org1': {
          'cluster.x-k8s.io:clusters:*': ['*'],
          'infrastructure.giantswarm.io:awsclusters:*': ['*'],
          'infrastructure.giantswarm.io:awscontrolplanes:*': ['*'],
          'infrastructure.giantswarm.io:g8scontrolplanes:*': ['*'],
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

    render(getComponent({}));

    // Toggle 'For organizations' tab
    fireEvent.click(screen.getByRole('tab', { name: 'For organizations' }));

    expect(await screen.findByText('workload clusters')).toBeInTheDocument();

    // Toggle clusters category
    fireEvent.click(screen.getByLabelText('workload clusters'));
    expect(await screen.findByText('Inspect clusters')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect clusters for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
  });
});

describe('PermissionsOverview on GCP', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const useCases = window.config.permissionsUseCasesJSON;

  beforeAll(() => {
    window.config.info.general.provider = Providers.GCP;
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  beforeEach(() => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: createDefaultPermissions(),
    });
  });
  afterEach(() => {
    window.config.permissionsUseCasesJSON = useCases;
  });

  it('displays permissions statuses for workload clusters use cases', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        'org-org1': {
          'cluster.x-k8s.io:clusters:*': ['*'],
          'infrastructure.cluster.x-k8s.io:gcpclusters:*': ['*'],
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

    render(getComponent({}));

    // Toggle 'For organizations' tab
    fireEvent.click(screen.getByRole('tab', { name: 'For organizations' }));

    expect(await screen.findByText('workload clusters')).toBeInTheDocument();

    // Toggle clusters category
    fireEvent.click(screen.getByLabelText('workload clusters'));
    expect(await screen.findByText('Inspect clusters')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect clusters for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
  });

  it('does not display permissions use cases for releases', async () => {
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

    render(getComponent({}));

    expect(await screen.findByText('access control')).toBeInTheDocument();
    expect(screen.queryByText('releases')).not.toBeInTheDocument();
  });

  it('does not display permission use cases for provider credentials', async () => {
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

    render(getComponent({}));

    // Toggle 'For organizations' tab
    fireEvent.click(screen.getByRole('tab', { name: 'For organizations' }));

    // Toggle category
    expect(await screen.findByText('workload clusters')).toBeInTheDocument();
    expect(screen.queryByText('provider credentials')).not.toBeInTheDocument();
  });
});

describe('PermissionsOverview on CAPA', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const useCases = window.config.permissionsUseCasesJSON;

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPA;
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  beforeEach(() => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: createDefaultPermissions(),
    });
  });
  afterEach(() => {
    window.config.permissionsUseCasesJSON = useCases;
  });

  it('displays permissions statuses for workload clusters use cases', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        'org-org1': {
          'cluster.x-k8s.io:clusters:*': ['*'],
          'infrastructure.cluster.x-k8s.io:awsclusters:*': ['*'],
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

    render(getComponent({}));

    // Toggle 'For organizations' tab
    fireEvent.click(screen.getByRole('tab', { name: 'For organizations' }));

    expect(await screen.findByText('workload clusters')).toBeInTheDocument();

    // Toggle clusters category
    fireEvent.click(screen.getByLabelText('workload clusters'));
    expect(await screen.findByText('Inspect clusters')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect clusters for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
  });

  it('does not display permissions use cases for releases', async () => {
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

    render(getComponent({}));

    expect(await screen.findByText('access control')).toBeInTheDocument();
    expect(screen.queryByText('releases')).not.toBeInTheDocument();
  });

  it('displays permission use case for provider credentials with awsclusterroleidentities in the Global tab', async () => {
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

    render(getComponent({}));

    // Toggle category
    expect(await screen.findByText('provider credentials')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('provider credentials'));
    expect(
      screen.getByText('Inspect provider credentials')
    ).toBeInTheDocument();
  });
});
