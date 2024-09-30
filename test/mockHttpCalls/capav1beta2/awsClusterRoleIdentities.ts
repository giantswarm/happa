import * as capav1beta2 from 'model/services/mapi/capav1beta2';

export const defaultAWSClusterRoleIdentity: capav1beta2.IAWSClusterRoleIdentity =
  {
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2',
    kind: 'AWSClusterRoleIdentity',
    metadata: {
      creationTimestamp: '2022-09-29T09:14:00Z',
      generation: 1,
      name: 'default',
      resourceVersion: '3140',
      uid: 'e8d37b8a-52b3-4003-88ec-97cf35143411',
    },
    spec: {
      roleARN: 'arn:aws:iam::262033476510:role/capa-controller',
      sourceIdentityRef: {
        kind: 'AWSClusterControllerIdentity',
        name: 'default',
      },
    },
  };
