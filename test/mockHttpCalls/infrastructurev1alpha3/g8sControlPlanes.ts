import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';

export const randomClusterAWS1G8sControlPlaneList: infrav1alpha3.IG8sControlPlaneList =
  {
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'G8sControlPlaneList',
    metadata: {
      resourceVersion: '763162702',
      selfLink:
        '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/g8scontrolplanes/',
    },
    items: [
      {
        apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
        kind: 'G8sControlPlane',
        metadata: {
          annotations: {
            'giantswarm.io/docs':
              'https://docs.giantswarm.io/ui-api/management-api/crd/g8scontrolplanes.infrastructure.giantswarm.io/',
          },
          creationTimestamp: '2021-11-08T16:08:51Z',
          finalizers: [
            'operatorkit.giantswarm.io/cluster-operator-control-plane-controller',
          ],
          generation: 1,
          labels: {
            'cluster-operator.giantswarm.io/version': '3.11.0',
            'cluster.x-k8s.io/cluster-name': 'c7hm5',
            'giantswarm.io/cluster': 'c7hm5',
            'giantswarm.io/control-plane': 'c0r9w',
            'giantswarm.io/organization': 'org1',
            'release.giantswarm.io/version': '16.3.0',
          },
          name: 'c0r9w',
          namespace: 'org-org1',
          resourceVersion: '740382273',
          selfLink:
            '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/g8scontrolplanes/c0r9w',
          uid: '7e294008-b71d-48df-b5b6-fd806e1ee99e',
        },
        spec: {
          infrastructureRef: {
            apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
            kind: 'AWSControlPlane',
            name: 'c0r9w',
            namespace: 'org-org1',
          },
          replicas: 1,
        },
        status: {
          readyReplicas: 1,
          replicas: 1,
        },
      },
    ],
  };

// High availability control plane
export const randomClusterAWS2G8sControlPlaneList: infrav1alpha3.IG8sControlPlaneList =
  {
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'G8sControlPlaneList',
    metadata: {
      resourceVersion: '763162702',
      selfLink:
        '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/g8scontrolplanes/',
    },
    items: [
      {
        apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
        kind: 'G8sControlPlane',
        metadata: {
          annotations: {
            'giantswarm.io/docs':
              'https://docs.giantswarm.io/ui-api/management-api/crd/g8scontrolplanes.infrastructure.giantswarm.io/',
          },
          creationTimestamp: '2021-11-08T16:08:51Z',
          finalizers: [
            'operatorkit.giantswarm.io/cluster-operator-control-plane-controller',
          ],
          generation: 1,
          labels: {
            'cluster-operator.giantswarm.io/version': '3.11.0',
            'cluster.x-k8s.io/cluster-name': 'as81f',
            'giantswarm.io/cluster': 'as81f',
            'giantswarm.io/control-plane': 'c0r9w',
            'giantswarm.io/organization': 'org1',
            'release.giantswarm.io/version': '16.3.0',
          },
          name: 'c0r9w',
          namespace: 'org-org1',
          resourceVersion: '740382273',
          selfLink:
            '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/g8scontrolplanes/c0r9w',
          uid: '7e294008-b71d-48df-b5b6-fd806e1ee99e',
        },
        spec: {
          infrastructureRef: {
            apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
            kind: 'AWSControlPlane',
            name: 'c0r9w',
            namespace: 'org-org1',
          },
          replicas: 3,
        },
        status: {
          readyReplicas: 3,
          replicas: 3,
        },
      },
    ],
  };
