export const selfSubjectAccessReviewCanListOrgs = {
  kind: 'SelfSubjectAccessReview',
  apiVersion: 'authorization.k8s.io/v1',
  metadata: {
    creationTimestamp: null,
  },
  spec: {
    resourceAttributes: {
      namespace: 'default',
      verb: 'list',
      group: 'security.giantswarm.io',
      resource: 'organizations',
    },
  },
  status: {
    allowed: true,
    reason:
      'RBAC: allowed by ClusterRoleBinding "write-all-giantswarm-group" of ClusterRole "cluster-admin" to Group "giantswarm:giantswarm-admins"',
  },
};

export const selfSubjectAccessReviewCantListOrgs = {
  kind: 'SelfSubjectAccessReview',
  apiVersion: 'authorization.k8s.io/v1',
  metadata: {
    creationTimestamp: null,
  },
  spec: {
    resourceAttributes: {
      namespace: 'default',
      verb: 'list',
      group: 'security.giantswarm.io',
      resource: 'organizations',
    },
  },
  status: {
    allowed: false,
    reason: 'RBAC: ',
  },
};

export const selfSubjectAccessReviewCanListClustersAtClusterScope = {
  kind: 'SelfSubjectAccessReview',
  apiVersion: 'authorization.k8s.io/v1',
  metadata: {
    creationTimestamp: null,
  },
  spec: {
    resourceAttributes: {
      verb: 'list',
      group: 'cluster.x-k8s.io',
      resource: 'clusters',
    },
  },
  status: {
    allowed: true,
    reason:
      'RBAC: allowed by ClusterRoleBinding "write-all-giantswarm-group" of ClusterRole "cluster-admin" to Group "giantswarm:giantswarm-admins"',
  },
};

export const selfSubjectAccessReviewCanListAppCatalogEntriesAtClusterScope = {
  kind: 'SelfSubjectAccessReview',
  apiVersion: 'authorization.k8s.io/v1',
  metadata: {
    creationTimestamp: null,
  },
  spec: {
    resourceAttributes: {
      verb: 'list',
      group: 'application.giantswarm.io',
      resource: 'appcatalogentries',
    },
  },
  status: {
    allowed: true,
    reason:
      'RBAC: allowed by ClusterRoleBinding "write-all-giantswarm-group" of ClusterRole "cluster-admin" to Group "giantswarm:giantswarm-admins"',
  },
};

export const selfSubjectAccessReviewCanListClusterRoleBindings = {
  kind: 'SelfSubjectAccessReview',
  apiVersion: 'authorization.k8s.io/v1',
  metadata: {
    creationTimestamp: null,
  },
  spec: {
    resourceAttributes: {
      verb: 'list',
      group: 'rbac.authorization.k8s.io',
      resource: 'clusterrolebindings',
    },
  },
  status: {
    allowed: true,
    reason: 'RBAC: ',
  },
};

export const selfSubjectAccessReviewCantListClusterRoleBindings = {
  kind: 'SelfSubjectAccessReview',
  apiVersion: 'authorization.k8s.io/v1',
  metadata: {
    creationTimestamp: null,
  },
  spec: {
    resourceAttributes: {
      verb: 'list',
      group: 'rbac.authorization.k8s.io',
      resource: 'clusterrolebindings',
    },
  },
  status: {
    allowed: false,
    reason: 'RBAC: ',
  },
};

export const selfSubjectAccessReviewCanGetClusterRoles = {
  kind: 'SelfSubjectAccessReview',
  apiVersion: 'authorization.k8s.io/v1',
  metadata: {
    creationTimestamp: null,
  },
  spec: {
    resourceAttributes: {
      verb: 'get',
      group: 'rbac.authorization.k8s.io',
      resource: 'clusterroles',
    },
  },
  status: {
    allowed: true,
    reason: 'RBAC: ',
  },
};

export const localSubjectAccssReviewCanListOrgs = {
  kind: 'LocalSubjectAccessReview',
  apiVersion: 'authorization.k8s.io/v1',
  metadata: {
    creationTimestamp: null,
    namespace: 'default',
  },
  spec: {
    resourceAttributes: {
      namespace: 'default',
      verb: 'list',
      group: 'security.giantswarm.io',
      resource: 'organizations',
    },
  },
  status: {
    allowed: true,
    reason: 'RBAC: ',
  },
};
