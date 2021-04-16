import * as rbacv1 from 'model/services/mapi/rbacv1';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

import {
  getRolePermissions,
  getUserNameParts,
  parseSubjects,
  sortPermissions,
} from '../utils';

describe('AccessControl/utils', () => {
  describe('parseSubjects', () => {
    test.each`
      subjects                          | expected
      ${''}                             | ${[]}
      ${'subject1'}                     | ${['subject1']}
      ${'subject1 subject2'}            | ${['subject1', 'subject2']}
      ${'subject1,subject2'}            | ${['subject1', 'subject2']}
      ${'subject1, subject2'}           | ${['subject1', 'subject2']}
      ${'subject1 ,subject2'}           | ${['subject1', 'subject2']}
      ${'subject1 , subject2'}          | ${['subject1', 'subject2']}
      ${'subject1 ,subject2, subject3'} | ${['subject1', 'subject2', 'subject3']}
      ${'subject1;subject2'}            | ${['subject1', 'subject2']}
      ${'subject1; subject2'}           | ${['subject1', 'subject2']}
      ${'subject1 ;subject2'}           | ${['subject1', 'subject2']}
      ${'subject1 ; subject2'}          | ${['subject1', 'subject2']}
      ${'subject1 ;subject2; subject3'} | ${['subject1', 'subject2', 'subject3']}
      ${'subject1	subject2; subject3'}   | ${['subject1', 'subject2', 'subject3']}
      ${'subject1			subject2 subject3'}    | ${['subject1', 'subject2', 'subject3']}
      ${'subject1			subject2 subject3						'}    | ${['subject1', 'subject2', 'subject3']}
    `(`gets subjects from '$subjects'`, ({ subjects, expected }) => {
      const parsed = parseSubjects(subjects);
      expect(parsed).toStrictEqual(expected);
    });
  });

  describe('getUserNameParts', () => {
    test.each`
      userName                             | expected
      ${''}                                | ${['']}
      ${'test'}                            | ${['test']}
      ${'test@test.com'}                   | ${['test', 'test.com']}
      ${'test@other-test@some-other-test'} | ${['test', 'other-test']}
    `(`gets userName parts from '$userName'`, ({ userName, expected }) => {
      const parts = getUserNameParts(userName);
      expect(parts).toStrictEqual(expected);
    });
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
