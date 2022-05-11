import { Providers } from 'model/constants';
import * as authorizationv1 from 'model/services/mapi/authorizationv1';
import * as rbacv1Mocks from 'test/mockHttpCalls/rbacv1';

import {
  Bindings,
  IPermissionMap,
  IPermissionsForUseCase,
  IPermissionsUseCase,
  IResourceRuleMap,
  IRolesForNamespaces,
  IRulesMaps,
  PermissionsUseCaseStatuses,
} from '../types';
import {
  computePermissions,
  computeResourceRulesFromRoles,
  createRulesReviewResponseFromBindings,
  getPermissionsCartesians,
  getStatusesForUseCases,
  hasPermission,
} from '../utils';

describe('permissions::utils', () => {
  describe('computePermissions', () => {
    interface ITestCase {
      rules: {
        namespace: string;
        review: authorizationv1.ISelfSubjectRulesReview;
      }[];
      expected: IPermissionMap;
    }

    const testCases: ITestCase[] = [
      {
        rules: [
          {
            namespace: 'org-giantswarm',
            review: makeRulesReview({
              incomplete: true,
              resourceRules: [],
              nonResourceRules: [],
              evaluationError: 'Failed',
            }),
          },
        ],
        expected: {},
      },
      {
        rules: [
          {
            namespace: 'org-giantswarm',
            review: makeRulesReview({
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: [''],
                  resources: ['pods'],
                  verbs: ['get', 'list', 'watch'],
                },
                {
                  apiGroups: [''],
                  resources: ['pods'],
                  verbs: ['create'],
                },
                {
                  apiGroups: ['events.k8s.io'],
                  resources: ['events'],
                  verbs: ['patch'],
                },
                {
                  apiGroups: ['something.giantswarm.io', 'events.k8s.io'],
                  resources: ['events'],
                  verbs: ['delete'],
                },
              ],
              nonResourceRules: [],
              evaluationError: '',
            }),
          },
        ],
        expected: {
          'org-giantswarm': {
            ':pods:*': ['get', 'list', 'watch', 'create'],
            'events.k8s.io:events:*': ['patch', 'delete'],
            'something.giantswarm.io:events:*': ['delete'],
          },
        },
      },
      {
        rules: [
          {
            namespace: 'org-giantswarm',
            review: makeRulesReview({
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ['*'],
                  resources: ['apps'],
                  verbs: ['get', 'list', 'watch'],
                },
                {
                  apiGroups: [''],
                  resources: ['pods'],
                  verbs: ['create'],
                },
              ],
              nonResourceRules: [],
              evaluationError: '',
            }),
          },
          {
            namespace: 'org-test',
            review: makeRulesReview({
              incomplete: true,
              resourceRules: [
                {
                  apiGroups: ['*'],
                  resources: ['apps'],
                  verbs: ['get', 'list', 'watch'],
                },
                {
                  apiGroups: [''],
                  resources: ['pods'],
                  verbs: ['create'],
                },
                {
                  apiGroups: ['events.k8s.io'],
                  resources: ['events'],
                  verbs: ['patch'],
                },
                {
                  apiGroups: ['something.giantswarm.io', 'events.k8s.io'],
                  resources: ['events'],
                  verbs: ['delete'],
                },
              ],
              nonResourceRules: [],
              evaluationError: '',
            }),
          },
        ],
        expected: {
          'org-giantswarm': {
            '*:apps:*': ['get', 'list', 'watch'],
            ':pods:*': ['create'],
          },
        },
      },
      {
        rules: [
          {
            namespace: 'org-giantswarm',
            review: makeRulesReview({
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: [''],
                  resources: ['deployments'],
                  verbs: ['get', 'list', 'watch'],
                },
              ],
              nonResourceRules: [],
              evaluationError: '',
            }),
          },
          {
            namespace: 'org-test',
            review: makeRulesReview({
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ['something.giantswarm.io'],
                  resources: ['apps'],
                  verbs: ['delete'],
                },
              ],
              nonResourceRules: [],
              evaluationError: '',
            }),
          },
          {
            namespace: 'org-test2',
            review: makeRulesReview({
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ['something.giantswarm.io'],
                  resources: ['apps'],
                  verbs: ['delete'],
                },
                {
                  apiGroups: ['something.giantswarm.io'],
                  resources: ['apps'],
                  verbs: ['get'],
                },
                {
                  apiGroups: ['something.giantswarm.io'],
                  resources: ['apps'],
                  verbs: ['get'],
                },
                {
                  apiGroups: ['something.giantswarm.io'],
                  resources: ['apps'],
                  resourceNames: ['test1', 'test2'],
                  verbs: ['patch'],
                },
              ],
              nonResourceRules: [],
              evaluationError: '',
            }),
          },
        ],
        expected: {
          'org-giantswarm': {
            ':deployments:*': ['get', 'list', 'watch'],
          },
          'org-test': {
            'something.giantswarm.io:apps:*': ['delete'],
          },
          'org-test2': {
            'something.giantswarm.io:apps:*': ['delete', 'get'],
            'something.giantswarm.io:apps:test1': ['patch', 'delete', 'get'],
            'something.giantswarm.io:apps:test2': ['patch', 'delete', 'get'],
          },
        },
      },
      {
        rules: [
          {
            namespace: 'org-giantswarm',
            review: makeRulesReview({
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ['*'],
                  resources: ['*'],
                  verbs: ['get', 'list', 'watch'],
                },
                {
                  apiGroups: ['apps.gs.io'],
                  resources: ['apps'],
                  verbs: ['delete'],
                },
                {
                  apiGroups: ['something.gs.io'],
                  resources: ['aresource'],
                  resourceNames: ['lala'],
                  verbs: ['patch'],
                },
              ],
              nonResourceRules: [],
              evaluationError: '',
            }),
          },
          {
            namespace: 'org-test',
            review: makeRulesReview({
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ['*'],
                  resources: ['*'],
                  verbs: ['*'],
                },
                {
                  apiGroups: ['*'],
                  resources: ['*'],
                  verbs: ['get', 'list', 'watch'],
                },
                {
                  apiGroups: ['dogs.gs.io'],
                  resources: ['cats'],
                  verbs: ['delete'],
                },
              ],
              nonResourceRules: [],
              evaluationError: '',
            }),
          },
          {
            namespace: 'org-test2',
            review: makeRulesReview({
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ['apps.gs.io'],
                  resources: ['*'],
                  verbs: ['get', 'list'],
                },
                {
                  apiGroups: ['apps.gs.io'],
                  resources: ['apps', 'tests'],
                  verbs: ['delete', 'patch'],
                },
              ],
              nonResourceRules: [],
              evaluationError: '',
            }),
          },
          {
            namespace: 'org-test3',
            review: makeRulesReview({
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ['apps.gs.io'],
                  resources: ['apps'],
                  verbs: ['get', 'list'],
                },
                {
                  apiGroups: ['apps.gs.io'],
                  resources: ['apps'],
                  verbs: ['delete', 'patch'],
                  resourceNames: ['some-resource', 'some-other-resource'],
                },
              ],
              nonResourceRules: [],
              evaluationError: '',
            }),
          },
        ],
        expected: {
          'org-giantswarm': {
            '*:*:*': ['get', 'list', 'watch'],
            'apps.gs.io:apps:*': ['delete', 'get', 'list', 'watch'],
            'something.gs.io:aresource:lala': ['patch', 'get', 'list', 'watch'],
          },
          'org-test': {
            '*:*:*': ['*'],
          },
          'org-test2': {
            'apps.gs.io:*:*': ['get', 'list'],
            'apps.gs.io:apps:*': ['delete', 'patch', 'get', 'list'],
            'apps.gs.io:tests:*': ['delete', 'patch', 'get', 'list'],
          },
          'org-test3': {
            'apps.gs.io:apps:*': ['get', 'list'],
            'apps.gs.io:apps:some-resource': ['delete', 'patch', 'get', 'list'],
            'apps.gs.io:apps:some-other-resource': [
              'delete',
              'patch',
              'get',
              'list',
            ],
          },
        },
      },
    ];

    for (const { rules, expected } of testCases) {
      it('computes permissions from rule reviews', () => {
        const r = rules.map(
          ({ namespace, review }) =>
            [namespace, review] as [typeof namespace, typeof review]
        );
        const permissions = computePermissions(r);

        expect(permissions).toStrictEqual(expected);
      });
    }
  });

  describe('hasPermission', () => {
    const permissions: IPermissionMap = {
      'org-test': {
        ':pods:*': ['list'],
        'something.k8s.io:ducks:*': ['patch', 'delete'],
      },
      'org-giantswarm': {
        'frogs.k8s.io:apps:app2': ['list'],
      },
      'org-test2': {
        '*:*:*': ['*'],
      },
      'org-test3': {
        '*:*:*': ['get', 'list'],
      },
    };

    test.each`
      namespace            | verb        | group                 | resource    | resourceName | expected
      ${''}                | ${''}       | ${''}                 | ${''}       | ${undefined} | ${false}
      ${'org-test'}        | ${'get'}    | ${''}                 | ${'pods'}   | ${undefined} | ${false}
      ${'org-test'}        | ${'patch'}  | ${'something.k8s.io'} | ${'ducks'}  | ${undefined} | ${true}
      ${'org-test'}        | ${'get'}    | ${'something.k8s.io'} | ${'ducks'}  | ${undefined} | ${false}
      ${'org-giantswarm'}  | ${'list'}   | ${'frogs.k8s.io'}     | ${'apps'}   | ${'app1'}    | ${false}
      ${'org-giantswarm'}  | ${'list'}   | ${'frogs.k8s.io'}     | ${'apps'}   | ${'app2'}    | ${true}
      ${'org-nonexistent'} | ${'list'}   | ${'frogs.k8s.io'}     | ${'apps'}   | ${undefined} | ${false}
      ${'org-test2'}       | ${'delete'} | ${'dogs.k8s.io'}      | ${'houses'} | ${undefined} | ${true}
      ${'org-test3'}       | ${'get'}    | ${'dogs.k8s.io'}      | ${'houses'} | ${undefined} | ${true}
      ${'org-test3'}       | ${'patch'}  | ${'dogs.k8s.io'}      | ${'houses'} | ${undefined} | ${false}
    `(
      `gets permission for verb '$verb' in namespace '$namespace' for '$group'/'$resource'/'$resourceName'`,
      ({
        namespace,
        verb,
        group,
        resource,
        resourceName,
        expected,
      }: {
        namespace: string;
        verb: string;
        group: string;
        resource: string;
        resourceName: string;
        expected: string;
      }) => {
        const result = hasPermission(
          permissions,
          namespace,
          verb,
          group,
          resource,
          resourceName
        );

        expect(result).toEqual(expected);
      }
    );
  });

  describe('getPermissionsCartesians', () => {
    interface ITestCase {
      input: IPermissionsForUseCase[];
      expected: [string, string, string][];
    }

    const testCases: ITestCase[] = [
      {
        input: [
          {
            apiGroups: ['frogs.k8s.io'],
            resources: ['apps'],
            verbs: ['get'],
          },
        ],
        expected: [['get', 'apps', 'frogs.k8s.io']],
      },
      {
        input: [
          {
            apiGroups: ['frogs.k8s.io'],
            resources: ['apps'],
            verbs: ['get', 'list'],
          },
        ],
        expected: [
          ['get', 'apps', 'frogs.k8s.io'],
          ['list', 'apps', 'frogs.k8s.io'],
        ],
      },
      {
        input: [
          {
            apiGroups: ['frogs.k8s.io'],
            resources: ['apps'],
            verbs: ['get', 'list'],
          },
          {
            apiGroups: ['cats.k8s.io'],
            resources: ['catalogs', 'appcatalogentries'],
            verbs: ['create', 'get'],
          },
        ],
        expected: [
          ['get', 'apps', 'frogs.k8s.io'],
          ['list', 'apps', 'frogs.k8s.io'],
          ['create', 'catalogs', 'cats.k8s.io'],
          ['create', 'appcatalogentries', 'cats.k8s.io'],
          ['get', 'catalogs', 'cats.k8s.io'],
          ['get', 'appcatalogentries', 'cats.k8s.io'],
        ],
      },
    ];

    for (const { input, expected } of testCases) {
      it('computes cartesians for use case permissions', () => {
        const useCasePermissions = getPermissionsCartesians(input);

        expect(useCasePermissions).toEqual(expected);
      });
    }
  });

  describe('getStatusesForUseCases', () => {
    interface ITestCase {
      description: string;
      input: {
        permissions: IPermissionMap;
        useCases: IPermissionsUseCase[];
        provider?: PropertiesOf<typeof Providers>;
        organizations?: IOrganization[];
      };
      expected: PermissionsUseCaseStatuses;
    }

    const testCases: ITestCase[] = [
      {
        description:
          'returns permission statuses for use cases in organizations',
        input: {
          permissions: {
            'org-test1': {},
            'org-test2': {
              '*:*:*': ['*'],
            },
            default: {
              '*:*:*': ['*'],
            },
          },
          useCases: createMockUseCases(),
          organizations: [
            { id: 'test1', namespace: 'org-test1' },
            { id: 'test2', namespace: 'org-test2' },
          ],
        },
        expected: {
          'Inspect namespaces': {
            '': false,
          },
          'Inspect shared app catalogs': {
            '': true,
          },
          'Inspect clusters': {
            test1: false,
            test2: true,
          },
        },
      },
      {
        description:
          'returns permission statuses without a given list of organizations',
        input: {
          permissions: {
            'org-test1': {},
            'org-test2': {
              '*:*:*': ['*'],
            },
            default: {
              '*:*:*': ['*'],
            },
          },
          useCases: createMockUseCases(),
        },
        expected: {
          'Inspect namespaces': {
            '': false,
          },
          'Inspect shared app catalogs': {
            '': true,
          },
          'Inspect clusters': {},
        },
      },
      {
        description:
          'returns permission statuses for use cases with cluster-scoped permissions',
        input: {
          permissions: {
            'org-test1': {},
            'org-test2': {
              '*:*:*': ['*'],
            },
            default: {
              '*:*:*': ['*'],
            },
            '': {
              '*:*:*': ['*'],
            },
          },
          useCases: createMockUseCases(),
          organizations: [
            { id: 'test1', namespace: 'org-test1' },
            { id: 'test2', namespace: 'org-test2' },
          ],
        },
        expected: {
          'Inspect namespaces': {
            '': true,
          },
          'Inspect shared app catalogs': {
            '': true,
          },
          'Inspect clusters': {
            test1: false,
            test2: true,
          },
        },
      },
      {
        description: 'ignores resources not applicable to the given provider',
        input: {
          permissions: {
            'org-test1': {},
            'org-test2': {
              'cluster.x-k8s.io:clusters:*': ['*'],
              'infrastructure.cluster.x-k8s.io:azureclusters:*': ['*'],
              'infrastructure.cluster.x-k8s.io:azuremachines:*': ['*'],
            },
            default: {
              '*:*:*': ['*'],
            },
          },
          useCases: createMockUseCases(),
          provider: Providers.AZURE,
          organizations: [
            { id: 'test1', namespace: 'org-test1' },
            { id: 'test2', namespace: 'org-test2' },
          ],
        },
        expected: {
          'Inspect namespaces': {
            '': false,
          },
          'Inspect shared app catalogs': {
            '': true,
          },
          'Inspect clusters': {
            test1: false,
            test2: true,
          },
        },
      },
    ];

    for (const { description, input, expected } of testCases) {
      it(description, () => {
        const statuses = getStatusesForUseCases(
          input.permissions,
          input.useCases,
          input.provider,
          input.organizations
        );

        expect(statuses).toStrictEqual(expected);
      });
    }
  });

  describe('computeResourceRulesFromRoles', () => {
    interface ITestCase {
      description: string;
      input: IRolesForNamespaces;
      expected: IResourceRuleMap;
    }

    const testCases: ITestCase[] = [
      {
        description: 'returns resource rules for empty roles',
        input: {},
        expected: {},
      },
      {
        description: 'returns resource rules for cluster roles',
        input: { '': rbacv1Mocks.clusterRoleList.items },
        expected: {
          '': {
            'read-all': [
              {
                verbs: ['get', 'list', 'watch'],
                apiGroups: ['*'],
                resources: ['*'],
              },
            ],
            'read-apps': [
              {
                verbs: ['get', 'list', 'watch'],
                apiGroups: ['apps'],
                resources: ['*'],
              },
            ],
            'cluster-admin': [
              {
                verbs: ['*'],
                apiGroups: ['*'],
                resources: ['*'],
              },
            ],
            'system:tenant-boss': [
              {
                verbs: ['get', 'list'],
                apiGroups: ['test.giantswarm.io'],
                resources: ['supertest', 'superboss'],
              },
            ],
          },
        },
      },
      {
        description: 'returns resource rules for roles in namespaces',
        input: {
          'org-giantswarm': rbacv1Mocks.roleList.items,
        },
        expected: {
          'org-giantswarm': {
            'edit-all': [
              {
                verbs: ['get', 'list', 'watch', 'patch', 'update'],
                apiGroups: ['*'],
                resources: ['*'],
              },
            ],
            'read-apps': [
              {
                verbs: ['get', 'list', 'watch'],
                apiGroups: ['apps'],
                resources: ['*'],
              },
            ],
            'have-fun': [],
          },
        },
      },
    ];

    for (const { description, input, expected } of testCases) {
      it(description, () => {
        const output = computeResourceRulesFromRoles(input);

        expect(output).toStrictEqual(expected);
      });
    }
  });

  describe('createRulesReviewResponseFromBindings', () => {
    interface ITestCase {
      description: string;
      input: {
        bindings: Bindings;
        rulesMaps: IRulesMaps;
        user?: string;
        groups?: string[];
      };
      expected: authorizationv1.ISelfSubjectRulesReview;
    }

    const testCases: ITestCase[] = [
      {
        description: 'returns empty rules review response for empty bindings',
        input: {
          bindings: [],
          rulesMaps: createDefaultRulesMaps(),
        },
        expected: makeRulesReview({
          incomplete: false,
          nonResourceRules: [],
          resourceRules: [],
        }),
      },
      {
        description:
          'returns empty rules review response for no given user/groups',
        input: {
          bindings: rbacv1Mocks.roleBindingList.items,
          rulesMaps: createDefaultRulesMaps(),
        },
        expected: makeRulesReview({
          incomplete: false,
          nonResourceRules: [],
          resourceRules: [],
        }),
      },
      {
        description: 'returns rules review response for a given user',
        input: {
          bindings: rbacv1Mocks.roleBindingList.items,
          rulesMaps: createDefaultRulesMaps(),
          user: 'system:boss',
        },
        expected: makeRulesReview({
          incomplete: false,
          nonResourceRules: [],
          resourceRules: [
            {
              apiGroups: ['*'],
              resources: ['*'],
              verbs: ['get', 'list', 'watch', 'patch', 'update'],
            },
          ],
        }),
      },
      {
        description: 'returns rules review response for a given group',
        input: {
          bindings: rbacv1Mocks.roleBindingList.items,
          rulesMaps: createDefaultRulesMaps(),
          groups: ['Admins'],
        },
        expected: makeRulesReview({
          incomplete: false,
          nonResourceRules: [],
          resourceRules: [
            {
              verbs: ['*'],
              apiGroups: ['*'],
              resources: ['*'],
            },
            {
              apiGroups: ['*'],
              resources: ['*'],
              verbs: ['get', 'list', 'watch', 'patch', 'update'],
            },
          ],
        }),
      },
      {
        description: 'returns rules review response given both user and groups',
        input: {
          bindings: rbacv1Mocks.roleBindingList.items,
          rulesMaps: createDefaultRulesMaps(),
          user: 'system:boss',
          groups: ['Admins'],
        },
        expected: makeRulesReview({
          incomplete: false,
          nonResourceRules: [],
          resourceRules: [
            {
              verbs: ['*'],
              apiGroups: ['*'],
              resources: ['*'],
            },
            {
              apiGroups: ['*'],
              resources: ['*'],
              verbs: ['get', 'list', 'watch', 'patch', 'update'],
            },
          ],
        }),
      },
    ];

    for (const { description, input, expected } of testCases) {
      it(description, () => {
        const output = createRulesReviewResponseFromBindings(
          input.bindings,
          input.rulesMaps,
          input.user,
          input.groups
        );

        expect(output).toStrictEqual(expected);
      });
    }
  });
});

function makeRulesReview(
  status: authorizationv1.ISelfSubjectRulesReviewStatus
): authorizationv1.ISelfSubjectRulesReview {
  return {
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'SelfSubjectRulesReview',
    spec: {},
    status,
  };
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
    {
      name: 'Inspect clusters',
      category: 'workload clusters',
      description: 'Read resources that form workload clusters',
      scope: { namespaces: ['*'] },
      permissions: [
        {
          apiGroups: ['cluster.x-k8s.io'],
          resources: ['clusters'],
          verbs: ['get', 'list'],
        },
        {
          apiGroups: ['infrastructure.cluster.x-k8s.io'],
          resources: ['azureclusters', 'azuremachines'],
          verbs: ['get', 'list'],
        },
        {
          apiGroups: ['infrastructure.giantswarm.io'],
          resources: ['awsclusters', 'awscontrolplanes', 'g8scontrolplanes'],
          verbs: ['get', 'list'],
        },
      ],
    },
  ];
}

function createDefaultRulesMaps(): IRulesMaps {
  return {
    rolesRulesMap: {
      'edit-all': [
        {
          verbs: ['get', 'list', 'watch', 'patch', 'update'],
          apiGroups: ['*'],
          resources: ['*'],
        },
      ],
      'cluster-admin': [],
    },
    clusterRolesRulesMap: {
      'cluster-admin': [
        {
          verbs: ['*'],
          apiGroups: ['*'],
          resources: ['*'],
        },
      ],
      'edit-all': [],
    },
  };
}
