export const canListOrgs = {
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

export const cantListOrgs = {
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
