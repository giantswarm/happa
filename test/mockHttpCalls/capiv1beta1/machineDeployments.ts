import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';

// MachineDeploymentList for randomClusterAWS1
export const randomClusterAWS1MachineDeploymentList: capiv1beta1.IMachineDeploymentList =
  {
    apiVersion: 'cluster.x-k8s.io/v1beta1',
    kind: 'MachineDeploymentList',
    metadata: {
      resourceVersion: '1089346777',
      selfLink:
        '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/',
    },
    items: [
      {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        kind: 'MachineDeployment',
        metadata: {
          annotations: {
            'node.giantswarm.io/cgroupv1': '',
          },
          creationTimestamp: '2022-05-24T08:31:11Z',
          finalizers: [
            'operatorkit.giantswarm.io/cluster-operator-machine-deployment-controller',
          ],
          generation: 1,
          labels: {
            'cluster-operator.giantswarm.io/version': '4.0.1',
            'cluster.x-k8s.io/cluster-name': 'c7hm5',
            'giantswarm.io/cluster': 'c7hm5',
            'giantswarm.io/machine-deployment': '4snbn',
            'giantswarm.io/organization': 'org1',
            'release.giantswarm.io/version': '17.2.0',
          },
          name: '4snbn',
          namespace: 'org-org1',
          resourceVersion: '1089201040',
          selfLink:
            '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/4snbn',
          uid: '41611b5d-ba3c-4c7f-8761-18786dc4ee99',
        },
        spec: {
          clusterName: 'c7hm5',
          replicas: 1,
          selector: {},
          template: {
            metadata: { name: '' },
            spec: {
              bootstrap: {},
              clusterName: 'c7hm5',
              infrastructureRef: {
                apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
                kind: 'AWSMachineDeployment',
                name: '4snbn',
                namespace: 'org-org1',
                resourceVersion: '256658380',
                uid: 'e1a16ab1-b089-498d-93f9-6c8372b400b1',
              },
            },
          },
        },
        status: {
          availableReplicas: 0,
          readyReplicas: 3,
          replicas: 3,
          unavailableReplicas: 0,
          updatedReplicas: 0,
        },
      },
      {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        kind: 'MachineDeployment',
        metadata: {
          annotations: {
            'kubectl.kubernetes.io/last-applied-configuration':
              '{"apiVersion":"cluster.x-k8s.io/v1alpha3","kind":"MachineDeployment","metadata":{"annotations":{},"labels":{"cluster-operator.giantswarm.io/version":"2.1.10","giantswarm.io/cluster":"c7hm5","giantswarm.io/machine-deployment":"vud0a","giantswarm.io/organization":"org1","release.giantswarm.io/version":"11.2.1"},"name":"vud0a","namespace":"default"},"spec":{"selector":{},"template":{"metadata":{},"spec":{"bootstrap":{},"infrastructureRef":{"apiVersion":"infrastructure.giantswarm.io/v1alpha3","kind":"AWSMachineDeployment","name":"vud0a","namespace":"default"},"metadata":{}}}}}\n',
            'node.giantswarm.io/cgroupv1': '',
          },
          creationTimestamp: '2022-05-24T08:31:11Z',
          finalizers: [
            'operatorkit.giantswarm.io/cluster-operator-machine-deployment-controller',
          ],
          generation: 1,
          labels: {
            'cluster-operator.giantswarm.io/version': '4.0.1',
            'cluster.x-k8s.io/cluster-name': 'c7hm5',
            'giantswarm.io/cluster': 'c7hm5',
            'giantswarm.io/machine-deployment': 'vud0a',
            'giantswarm.io/organization': 'org1',
            'release.giantswarm.io/version': '17.2.0',
          },
          name: 'vud0a',
          namespace: 'org-org1',
          resourceVersion: '1087343787',
          selfLink:
            '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/vud0a',
          uid: '3c52c5d2-9f2b-4feb-abbb-9cc2813a00aa',
        },
        spec: {
          clusterName: 'c7hm5',
          replicas: 1,
          selector: {},
          template: {
            metadata: { name: '' },
            spec: {
              bootstrap: {},
              clusterName: 'c7hm5',
              infrastructureRef: {
                apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
                kind: 'AWSMachineDeployment',
                name: 'vud0a',
                namespace: 'org-org1',
              },
            },
          },
        },
        status: {
          availableReplicas: 0,
          readyReplicas: 3,
          replicas: 3,
          unavailableReplicas: 0,
          updatedReplicas: 0,
        },
      },
    ],
  };

// MachineDeploymentList for randomClusterAWS2
export const randomClusterAWS2MachineDeploymentList: capiv1beta1.IMachineDeploymentList =
  {
    apiVersion: 'cluster.x-k8s.io/v1beta1',
    kind: 'MachineDeploymentList',
    metadata: {
      resourceVersion: '1089346777',
      selfLink:
        '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/',
    },
    items: [
      {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        kind: 'MachineDeployment',
        metadata: {
          annotations: {
            'kubectl.kubernetes.io/last-applied-configuration':
              '{"apiVersion":"cluster.x-k8s.io/v1alpha3","kind":"MachineDeployment","metadata":{"annotations":{},"creationTimestamp":null,"labels":{"cluster-operator.giantswarm.io/version":"2.1.10","giantswarm.io/cluster":"as81f","giantswarm.io/machine-deployment":"7xt70","giantswarm.io/organization":"org1","release.giantswarm.io/version":"11.3.0"},"name":"7xt70","namespace":"default"},"spec":{"selector":{},"template":{"metadata":{},"spec":{"bootstrap":{},"infrastructureRef":{"apiVersion":"infrastructure.giantswarm.io/v1alpha3","kind":"AWSMachineDeployment","name":"7xt70","namespace":"default"},"metadata":{}}}},"status":{}}\n',
            'node.giantswarm.io/cgroupv1': '',
          },
          creationTimestamp: '2022-05-24T08:23:32Z',
          finalizers: [
            'operatorkit.giantswarm.io/cluster-operator-machine-deployment-controller',
          ],
          generation: 1,
          labels: {
            'cluster-operator.giantswarm.io/version': '4.0.1',
            'cluster.x-k8s.io/cluster-name': 'as81f',
            'giantswarm.io/cluster': 'as81f',
            'giantswarm.io/machine-deployment': '7xt70',
            'giantswarm.io/organization': 'org1',
            'release.giantswarm.io/version': '17.2.0',
          },
          name: '7xt70',
          namespace: 'org-org1',
          resourceVersion: '1089174507',
          selfLink:
            '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/7xt70',
          uid: '0fb78c32-0245-4b07-b2c5-42a99071bf8e',
        },
        spec: {
          clusterName: 'as81f',
          replicas: 1,
          selector: {},
          template: {
            metadata: { name: '' },
            spec: {
              bootstrap: {},
              clusterName: 'as81f',
              infrastructureRef: {
                apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
                kind: 'AWSMachineDeployment',
                name: '7xt70',
                namespace: 'org-org1',
              },
            },
          },
        },
        status: {
          availableReplicas: 0,
          readyReplicas: 6,
          replicas: 6,
          unavailableReplicas: 0,
          updatedReplicas: 0,
        },
      },
    ],
  };
