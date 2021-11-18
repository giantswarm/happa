export const writeAllCustomerRoleBinding = {
  metadata: {
    name: 'write-all-customer-group',
    namespace: 'org-giantswarm',
    selfLink:
      '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/write-all-customer-group',
    uid: '157dba11-6610-4124-899d-ed98f0f81505',
    resourceVersion: '281804540',
    creationTimestamp: '2021-03-22T16:28:27Z',
    labels: {
      'giantswarm.io/managed-by': 'rbac-operator',
    },
    finalizers: [
      'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
    ],
    managedFields: [
      {
        manager: 'rbac-operator',
        operation: 'Update',
        apiVersion: 'rbac.authorization.k8s.io/v1',
        time: '2021-03-25T16:05:55Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:finalizers': {
              '.': {},
              'v:"operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller"':
                {},
            },
            'f:labels': { '.': {}, 'f:giantswarm.io/managed-by': {} },
          },
          'f:roleRef': { 'f:apiGroup': {}, 'f:kind': {}, 'f:name': {} },
          'f:subjects': {},
        },
      },
    ],
  },
  subjects: [
    {
      kind: 'Group',
      apiGroup: 'rbac.authorization.k8s.io',
      name: 'Admins',
    },
  ],
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'cluster-admin',
  },
};

export const editAllRoleBinding = {
  metadata: {
    name: 'edit-all-group',
    namespace: 'org-giantswarm',
    selfLink:
      '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group',
    uid: '27a1682b-c33b-42af-9489-36bf32ba6d52',
    resourceVersion: '281804578',
    creationTimestamp: '2020-09-29T10:42:53Z',
    labels: {
      'giantswarm.io/managed-by': 'rbac-operator',
    },
    finalizers: [
      'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
    ],
  },
  subjects: [
    {
      kind: 'Group',
      apiGroup: 'rbac.authorization.k8s.io',
      name: 'Admins',
    },
    {
      kind: 'ServiceAccount',
      apiGroup: 'rbac.authorization.k8s.io',
      name: 'el-toro',
      namespace: 'org-giantswarm',
    },
    {
      kind: 'User',
      apiGroup: 'rbac.authorization.k8s.io',
      name: 'system:boss',
    },
  ],
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'Role',
    name: 'edit-all',
  },
};

export const coolRoleBinding = {
  metadata: {
    name: 'cool',
    namespace: 'org-giantswarm',
    selfLink:
      '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/cool',
    uid: '27a1682b-c33b-42af-9489-36bf32ba6d52',
    resourceVersion: '281804578',
    creationTimestamp: '2020-09-29T10:42:53Z',
    labels: {
      'giantswarm.io/managed-by': 'rbac-operator',
    },
    finalizers: [
      'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
    ],
  },
  subjects: [
    {
      kind: 'User',
      apiGroup: 'rbac.authorization.k8s.io',
      name: 'test@test.com',
    },
    {
      kind: 'User',
      apiGroup: 'rbac.authorization.k8s.io',
      name: 'system:boss',
    },
  ],
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'Role',
    name: 'edit-all',
  },
};

export const haveFunRoleBinding = {
  metadata: {
    name: 'have-fun',
    namespace: 'org-giantswarm',
    selfLink:
      '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/have-fun',
    uid: '157dba11-6610-4124-899d-ed98f0f81505',
    resourceVersion: '281804540',
    creationTimestamp: '2021-03-22T16:28:27Z',
    labels: {
      'giantswarm.io/managed-by': 'rbac-operator',
    },
    finalizers: [
      'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
    ],
    managedFields: [
      {
        manager: 'rbac-operator',
        operation: 'Update',
        apiVersion: 'rbac.authorization.k8s.io/v1',
        time: '2021-03-25T16:05:55Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:metadata': {
            'f:finalizers': {
              '.': {},
              'v:"operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller"':
                {},
            },
            'f:labels': { '.': {}, 'f:giantswarm.io/managed-by': {} },
          },
          'f:roleRef': { 'f:apiGroup': {}, 'f:kind': {}, 'f:name': {} },
          'f:subjects': {},
        },
      },
    ],
  },
  subjects: [
    {
      kind: 'ServiceAccount',
      apiGroup: 'rbac.authorization.k8s.io',
      name: 'some-random-account',
      namespace: 'org-giantswarm',
    },
  ],
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'cluster-admin',
  },
};

export const roleBindingList = {
  kind: 'RoleBindingList',
  apiVersion: 'rbac.authorization.k8s.io/v1',
  metadata: {
    selfLink:
      '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/',
    resourceVersion: '284086409',
  },
  items: [
    writeAllCustomerRoleBinding,
    editAllRoleBinding,
    coolRoleBinding,
    haveFunRoleBinding,
  ],
};
