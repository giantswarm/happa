export const editAllRole = {
  metadata: {
    name: 'edit-all',
    namespace: 'org-giantswarm',
    selfLink: '/apis/rbac.authorization.k8s.io/v1/roles/edit-all',
    uid: '1cb5352b-e7e0-40a4-9aac-fc2ef00e2f2a',
    resourceVersion: '283944854',
    creationTimestamp: '2021-03-22T16:28:26Z',
    labels: {
      'ui.giantswarm.io/display': 'true',
    },
  },
  rules: [
    {
      verbs: ['get', 'list', 'watch', 'patch', 'update'],
      apiGroups: ['*'],
      resources: ['*'],
    },
  ],
};

export const readAppsRole = {
  metadata: {
    name: 'read-apps',
    namespace: 'org-giantswarm',
    selfLink: '/apis/rbac.authorization.k8s.io/v1/roles/read-apps',
    uid: '231asdas-e7e0-40a4-222-sadasdsa12312',
    resourceVersion: '283944854',
    creationTimestamp: '2021-03-22T16:28:26Z',
    labels: {
      'giantswarm.io/managed-by': 'rbac-operator',
      'ui.giantswarm.io/display': 'true',
    },
  },
  rules: [
    {
      verbs: ['get', 'list', 'watch'],
      apiGroups: ['apps'],
      resources: ['*'],
    },
  ],
};

export const roleList = {
  kind: 'RoleList',
  apiVersion: 'rbac.authorization.k8s.io/v1',
  metadata: {
    selfLink: '/apis/rbac.authorization.k8s.io/v1/roles/',
    resourceVersion: '284016986',
  },
  items: [editAllRole, readAppsRole],
};
