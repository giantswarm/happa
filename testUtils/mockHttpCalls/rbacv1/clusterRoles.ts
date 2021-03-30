export const readAllClusterRole = {
  metadata: {
    name: 'read-all',
    selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterroles/read-all',
    uid: '1cb5352b-e7e0-40a4-9aac-fc2ef00e2f2a',
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
      apiGroups: ['*'],
      resources: ['*'],
    },
  ],
};

export const readAppsClusterRole = {
  metadata: {
    name: 'read-apps',
    selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterroles/read-apps',
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

export const clusterAdminClusterRole = {
  metadata: {
    name: 'cluster-admin',
    selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterroles/cluster-admin',
    uid: '87f1d3ef-276c-11e8-9e05-000d3a2870da',
    resourceVersion: '281319140',
    creationTimestamp: '2018-03-14T09:46:12Z',
    labels: {
      'kubernetes.io/bootstrapping': 'rbac-defaults',
      'ui.giantswarm.io/display': 'true',
    },
    annotations: {
      'rbac.authorization.kubernetes.io/autoupdate': 'true',
    },
  },
  rules: [
    {
      verbs: ['*'],
      apiGroups: ['*'],
      resources: ['*'],
    },
    {
      verbs: ['*'],
      nonResourceURLs: ['*'],
    },
  ],
};

export const clusterRoleList = {
  kind: 'ClusterRoleList',
  apiVersion: 'rbac.authorization.k8s.io/v1',
  metadata: {
    selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterroles/',
    resourceVersion: '284016986',
  },
  items: [readAllClusterRole, readAppsClusterRole, clusterAdminClusterRole],
};
