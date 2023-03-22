import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';

export const defaultAzureClusterIdentity: capzv1beta1.IAzureClusterIdentity = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: 'AzureClusterIdentity',
  metadata: {
    creationTimestamp: '2023-02-21T15:28:53Z',
    finalizers: [],
    generation: 2,
    labels: {
      'kustomize.toolkit.fluxcd.io/name': 'flux',
      'kustomize.toolkit.fluxcd.io/namespace': 'flux-giantswarm',
    },
    name: 'test-identity',
    namespace: 'org-org1',
    resourceVersion: '',
    uid: '',
  },
  spec: {
    allowedNamespaces: {},
    clientID: '',
    resourceID: '',
    tenantID: 'test-tenant-id',
    type: 'UserAssignedMSI',
  },
};
