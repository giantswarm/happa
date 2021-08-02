export const getOrganizationByName = {
  apiVersion: 'security.giantswarm.io/v1alpha1',
  kind: 'Organization',
  metadata: {
    name: 'org1',
  },
  spec: {},
  status: {
    namespace: 'org-org1',
  },
};
