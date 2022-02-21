import * as rbacv1 from 'model/services/mapi/rbacv1';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

import {
  appendSubjectSuggestionToValue,
  filterSubjectSuggestions,
  getRolePermissions,
  getUserNameParts,
  parseSubjects,
  sortPermissions,
} from '../utils';

describe('AccessControl/utils', () => {
  describe('parseSubjects', () => {
    test.each`
      subjects                                            | expected
      ${''}                                               | ${[]}
      ${'subject1'}                                       | ${['subject1']}
      ${'subject one'}                                    | ${['subject one']}
      ${'subject1,subject2'}                              | ${['subject1', 'subject2']}
      ${'subject one,subject two'}                        | ${['subject one', 'subject two']}
      ${'subject1, subject2'}                             | ${['subject1', 'subject2']}
      ${'subject one, subject two'}                       | ${['subject one', 'subject two']}
      ${'subject1 ,subject2'}                             | ${['subject1', 'subject2']}
      ${'subject one ,subject two'}                       | ${['subject one', 'subject two']}
      ${'subject1 , subject2'}                            | ${['subject1', 'subject2']}
      ${'subject one , subject two'}                      | ${['subject one', 'subject two']}
      ${'subject1 ,subject2, subject3'}                   | ${['subject1', 'subject2', 'subject3']}
      ${'subject one ,subject two ,subject three'}        | ${['subject one', 'subject two', 'subject three']}
      ${'subject1;subject2'}                              | ${['subject1', 'subject2']}
      ${'subject one;subject two'}                        | ${['subject one', 'subject two']}
      ${'subject1; subject2'}                             | ${['subject1', 'subject2']}
      ${'subject one; subject two'}                       | ${['subject one', 'subject two']}
      ${'subject1 ;subject2'}                             | ${['subject1', 'subject2']}
      ${'subject one ;subject two'}                       | ${['subject one', 'subject two']}
      ${'subject1 ; subject2'}                            | ${['subject1', 'subject2']}
      ${'subject one ; subject two'}                      | ${['subject one', 'subject two']}
      ${'subject1 ;subject2; subject3'}                   | ${['subject1', 'subject2', 'subject3']}
      ${'subject one ;subject two; subject three'}        | ${['subject one', 'subject two', 'subject three']}
      ${'subject1	subject2; subject3'}                     | ${['subject1	subject2', 'subject3']}
      ${'subject1			subject2 subject3'}                      | ${['subject1			subject2 subject3']}
      ${'subject1			subject2 subject3						'}                      | ${['subject1			subject2 subject3']}
      ${'some-account, test1, test, test2, default, '}    | ${['some-account', 'test1', 'test', 'test2', 'default']}
      ${'some-account, test1, test, test2, default,;,; '} | ${['some-account', 'test1', 'test', 'test2', 'default']}
    `(
      `gets subjects from '$subjects'`,
      ({ subjects, expected }: { subjects: string; expected: string }) => {
        const parsed = parseSubjects(subjects);
        expect(parsed).toStrictEqual(expected);
      }
    );
  });

  describe('getUserNameParts', () => {
    test.each`
      userName                             | expected
      ${''}                                | ${['']}
      ${'test'}                            | ${['test']}
      ${'test@test.com'}                   | ${['test', 'test.com']}
      ${'test@other-test@some-other-test'} | ${['test', 'other-test']}
    `(
      `gets userName parts from '$userName'`,
      ({ userName, expected }: { userName: string; expected: string }) => {
        const parts = getUserNameParts(userName);
        expect(parts).toStrictEqual(expected);
      }
    );
  });

  describe('filterSubjectSuggestions', () => {
    test.each`
      input             | suggestions                                           | limit | expected
      ${''}             | ${[]}                                                 | ${3}  | ${[]}
      ${'test'}         | ${[]}                                                 | ${3}  | ${[]}
      ${''}             | ${['test1', 'test2']}                                 | ${3}  | ${['test1', 'test2']}
      ${'test'}         | ${['test1', 'test2']}                                 | ${3}  | ${['test1', 'test2']}
      ${'test1'}        | ${['test1', 'test2']}                                 | ${3}  | ${['test1']}
      ${'test1 test2'}  | ${['test1', 'test2', 'test3']}                        | ${3}  | ${[]}
      ${'test1 '}       | ${['test1 test2', 'test3']}                           | ${3}  | ${['test1 test2']}
      ${'test1 test2 '} | ${['test1 test2', 'test3']}                           | ${3}  | ${['test1 test2']}
      ${'test'}         | ${['test1', 'test2', 'some-other']}                   | ${3}  | ${['test1', 'test2']}
      ${'test'}         | ${['test1', 'test2', 'some-other', 'test3', 'test4']} | ${3}  | ${['test1', 'test2', 'test3']}
    `(
      `filters suggestions with the '$input' input`,
      ({
        input,
        suggestions,
        limit,
        expected,
      }: {
        input: string;
        suggestions: string[];
        limit: number;
        expected: string;
      }) => {
        const result = filterSubjectSuggestions(input, suggestions, limit);
        expect(result).toStrictEqual(expected);
      }
    );
  });

  describe('appendSubjectSuggestionToValue', () => {
    test.each`
      value                      | suggestion  | expected
      ${''}                      | ${''}       | ${''}
      ${''}                      | ${'test1'}  | ${'test1, '}
      ${'tes'}                   | ${'test1'}  | ${'test1, '}
      ${'test '}                 | ${'test 1'} | ${'test 1, '}
      ${'tes,    '}              | ${'test1'}  | ${'tes,    test1, '}
      ${'test1, test2, test3, '} | ${'test4'}  | ${'test1, test2, test3, test4, '}
    `(
      `appends the '$suggestion' suggestion to '$value'`,
      ({
        value,
        suggestion,
        expected,
      }: {
        value: string;
        suggestion: string;
        expected: string;
      }) => {
        const result = appendSubjectSuggestionToValue(value, suggestion);
        expect(result).toEqual(expected);
      }
    );
  });

  describe('getRolePermissions', () => {
    it('aggregates similar permissions', () => {
      const role: rbacv1.IClusterRole = {
        kind: rbacv1.ClusterRole,
        apiVersion: 'rbac.authorization.k8s.io/v1',
        metadata: {
          name: 'tenant-boss',
          labels: {
            'ui.giantswarm.io/display': 'true',
          },
        },
        rules: [
          {
            verbs: ['get', 'list'],
            apiGroups: ['test.giantswarm.io'],
            resources: ['supertest', 'superboss'],
          },
          {
            verbs: ['watch', 'delete'],
            apiGroups: ['test.giantswarm.io'],
            resources: ['supertest', 'superboss'],
          },
          {
            verbs: ['patch'],
            apiGroups: ['test.giantswarm.io'],
            resources: ['supertest'],
          },
          {
            verbs: ['create'],
            apiGroups: ['test.giantswarm.io'],
            resources: ['otherthing'],
          },
          {
            verbs: ['get'],
            apiGroups: ['test2.giantswarm.io'],
            resources: ['supertest'],
          },
        ],
      };

      const expectedPermissions: ui.IAccessControlRoleItemPermission[] = [
        {
          apiGroups: ['test.giantswarm.io'],
          resources: ['otherthing'],
          resourceNames: [],
          verbs: ['create'],
        },
        {
          apiGroups: ['test.giantswarm.io'],
          resources: ['supertest'],
          resourceNames: [],
          verbs: ['patch'],
        },
        {
          apiGroups: ['test.giantswarm.io'],
          resources: ['supertest', 'superboss'],
          resourceNames: [],
          verbs: ['get', 'list', 'watch', 'delete'],
        },
        {
          apiGroups: ['test2.giantswarm.io'],
          resources: ['supertest'],
          resourceNames: [],
          verbs: ['get'],
        },
      ];

      const result = getRolePermissions(role);
      expect(result).toStrictEqual(expectedPermissions);
    });
  });

  describe('sortPermissions', () => {
    it('sorts permissions by the required fields', () => {
      const permissions: ui.IAccessControlRoleItemPermission[] = [
        {
          apiGroups: ['test.giantswarm.io'],
          resources: ['supertest', 'superboss'],
          resourceNames: [],
          verbs: ['get', 'list'],
        },
        {
          apiGroups: ['test2.giantswarm.io'],
          resources: ['supertest', 'superboss'],
          resourceNames: [],
          verbs: ['get', 'list'],
        },
        {
          apiGroups: ['test5.giantswarm.io'],
          resources: ['some-test'],
          resourceNames: [],
          verbs: ['watch'],
        },
        {
          apiGroups: ['test2.giantswarm.io'],
          resources: ['some-other'],
          resourceNames: [],
          verbs: ['delete'],
        },
        {
          apiGroups: ['test3.giantswarm.io'],
          resources: ['some-resource'],
          resourceNames: ['some-other-name'],
          verbs: ['get', 'list'],
        },
        {
          apiGroups: ['test2.giantswarm.io'],
          resources: ['superboss'],
          resourceNames: [],
          verbs: ['watch'],
        },
        {
          apiGroups: ['test3.giantswarm.io'],
          resources: ['some-resource'],
          resourceNames: ['some-name'],
          verbs: ['get', 'list'],
        },
      ];

      const expected = [
        {
          apiGroups: ['test.giantswarm.io'],
          resources: ['supertest', 'superboss'],
          resourceNames: [],
          verbs: ['get', 'list'],
        },
        {
          apiGroups: ['test2.giantswarm.io'],
          resources: ['some-other'],
          resourceNames: [],
          verbs: ['delete'],
        },
        {
          apiGroups: ['test2.giantswarm.io'],
          resources: ['superboss'],
          resourceNames: [],
          verbs: ['watch'],
        },
        {
          apiGroups: ['test2.giantswarm.io'],
          resources: ['supertest', 'superboss'],
          resourceNames: [],
          verbs: ['get', 'list'],
        },
        {
          apiGroups: ['test3.giantswarm.io'],
          resources: ['some-resource'],
          resourceNames: ['some-name'],
          verbs: ['get', 'list'],
        },
        {
          apiGroups: ['test3.giantswarm.io'],
          resources: ['some-resource'],
          resourceNames: ['some-other-name'],
          verbs: ['get', 'list'],
        },
        {
          apiGroups: ['test5.giantswarm.io'],
          resources: ['some-test'],
          resourceNames: [],
          verbs: ['watch'],
        },
      ];

      const result = permissions.sort(sortPermissions);
      expect(result).toStrictEqual(expected);
    });
  });
});
