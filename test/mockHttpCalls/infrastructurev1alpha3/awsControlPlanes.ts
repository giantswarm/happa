import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';

export const randomClusterAWS1AWSControlPlaneList: infrav1alpha3.IAWSControlPlaneList =
  {
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'AWSControlPlaneList',
    metadata: {
      resourceVersion: '763162702',
      selfLink:
        '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awscontrolplanes/',
    },
    items: [
      {
        apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
        kind: 'AWSControlPlane',
        metadata: {
          annotations: {
            'giantswarm.io/docs':
              'https://docs.giantswarm.io/ui-api/management-api/crd/awscontrolplanes.infrastructure.giantswarm.io/',
          },
          creationTimestamp: '2021-11-08T16:08:51Z',
          finalizers: [
            'operatorkit.giantswarm.io/aws-operator-drainer-controller',
            'operatorkit.giantswarm.io/aws-operator-control-plane-controller',
          ],
          generation: 2,
          labels: {
            'aws-operator.giantswarm.io/version': '10.11.0',
            'cluster.x-k8s.io/cluster-name': 'c7hm5',
            'giantswarm.io/cluster': 'c7hm5',
            'giantswarm.io/control-plane': 'c0r9w',
            'giantswarm.io/organization': 'org1',
            'release.giantswarm.io/version': '16.3.0',
          },
          name: 'c0r9w',
          namespace: 'org-org1',
          resourceVersion: '740382267',
          selfLink:
            '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awscontrolplanes/c0r9w',
          uid: 'cd733247-e228-4cfa-9080-e221f62e2467',
        },
        spec: {
          availabilityZones: ['eu-central-1a'],
          instanceType: 'm4.xlarge',
        },
      },
    ],
  };

// High availability control plane
export const randomClusterAWS2AWSControlPlaneList: infrav1alpha3.IAWSControlPlaneList =
  {
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'AWSControlPlaneList',
    metadata: {
      resourceVersion: '763162702',
      selfLink:
        '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awscontrolplanes/',
    },
    items: [
      {
        apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
        kind: 'AWSControlPlane',
        metadata: {
          annotations: {
            'giantswarm.io/docs':
              'https://docs.giantswarm.io/ui-api/management-api/crd/awscontrolplanes.infrastructure.giantswarm.io/',
          },
          creationTimestamp: '2021-11-08T16:08:51Z',
          finalizers: [
            'operatorkit.giantswarm.io/aws-operator-drainer-controller',
            'operatorkit.giantswarm.io/aws-operator-control-plane-controller',
          ],
          generation: 2,
          labels: {
            'aws-operator.giantswarm.io/version': '10.11.0',
            'cluster.x-k8s.io/cluster-name': 'as81f',
            'giantswarm.io/cluster': 'as81f',
            'giantswarm.io/control-plane': 'c0r9w',
            'giantswarm.io/organization': 'org1',
            'release.giantswarm.io/version': '16.3.0',
          },
          name: 'c0r9w',
          namespace: 'org-org1',
          resourceVersion: '740382267',
          selfLink:
            '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awscontrolplanes/c0r9w',
          uid: 'cd733247-e228-4cfa-9080-e221f62e2467',
        },
        spec: {
          availabilityZones: [
            'eu-central-1a',
            'eu-central-1b',
            'eu-central-1c',
          ],
          instanceType: 'm4.xlarge',
        },
      },
    ],
  };
