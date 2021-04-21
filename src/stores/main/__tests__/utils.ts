import * as authorizationv1 from 'model/services/mapi/authorizationv1';

import {
  computePermissions,
  getNamespaceFromOrgName,
  hasPermission,
} from '../utils';

describe('main::utils', () => {
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
      ({ namespace, verb, group, resource, resourceName, expected }) => {
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

  describe('getNamespaceFromOrgName', () => {
    test.each`
      orgName                                                                       | expected
      ${''}                                                                         | ${''}
      ${'%_#!'}                                                                     | ${''}
      ${'someorg'}                                                                  | ${'org-someorg'}
      ${'someOrg'}                                                                  | ${'org-someorg'}
      ${'some-org'}                                                                 | ${'org-some-org'}
      ${'some-Org'}                                                                 | ${'org-some-org'}
      ${'some_org'}                                                                 | ${'org-some-org'}
      ${'some_Org'}                                                                 | ${'org-some-org'}
      ${'some____Org'}                                                              | ${'org-some-org'}
      ${'some$Org'}                                                                 | ${'org-some-org'}
      ${'some-random%org'}                                                          | ${'org-some-random-org'}
      ${'some-org-'}                                                                | ${'org-some-org'}
      ${'-some-org-'}                                                               | ${'org-some-org'}
      ${'-some-org----'}                                                            | ${'org-some-org'}
      ${'-some-org%'}                                                               | ${'org-some-org'}
      ${'-some-random123_org'}                                                      | ${'org-some-random123-org'}
      ${'some-random_org401'}                                                       | ${'org-some-random-org401'}
      ${'some-random_org401some-random_org401some-random_org401some-random_org401'} | ${'org-some-random-org401'}
    `(`computes namespace from '$orgName'`, ({ orgName, expected }) => {
      const result = getNamespaceFromOrgName(orgName);
      expect(result).toEqual(expected);
    });
  });
});

function makeRulesReview(
  status?: authorizationv1.ISelfSubjectRulesReviewStatus
): authorizationv1.ISelfSubjectRulesReview {
  return {
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'SelfSubjectRulesReview',
    spec: {},
    status,
  };
}
