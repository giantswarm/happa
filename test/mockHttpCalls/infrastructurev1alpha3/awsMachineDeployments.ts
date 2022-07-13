import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';

// AWSMachineDeployment for randomClusterAWS1's MachineDeploymentList item
export const randomClusterAWS1AWSMachineDeployment: infrav1alpha3.IAWSMachineDeployment =
  {
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'AWSMachineDeployment',
    metadata: {
      annotations: {
        'machine-deployment.giantswarm.io/subnet': '10.1.60.0/24',
      },
      creationTimestamp: '2022-05-24T08:31:09Z',
      finalizers: [
        'operatorkit.giantswarm.io/aws-operator-machine-deployment-controller',
        'operatorkit.giantswarm.io/aws-operator-drainer-controller',
      ],
      generation: 1,
      labels: {
        'aws-operator.giantswarm.io/version': '11.1.0',
        'cluster.x-k8s.io/cluster-name': 'c7hm5',
        'giantswarm.io/cluster': 'c7hm5',
        'giantswarm.io/machine-deployment': '4snbn',
        'giantswarm.io/organization': 'org1',
        'release.giantswarm.io/version': '17.2.0',
      },
      name: '4snbn',
      namespace: 'org-org1',
      resourceVersion: '992723656',
      selfLink:
        '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/4snbn',
      uid: '140893be-7c92-46f7-a1dd-5d628d45fc1f',
    },
    spec: {
      nodePool: {
        description: 'workload',
        machine: {
          dockerVolumeSizeGB: 100,
          kubeletVolumeSizeGB: 100,
        },
        scaling: {
          max: 40,
          min: 1,
        },
      },
      provider: {
        availabilityZones: ['eu-central-1b', 'eu-central-1a'],
        instanceDistribution: {
          onDemandBaseCapacity: 0,
          onDemandPercentageAboveBaseCapacity: 100,
        },
        worker: {
          instanceType: 'm4.xlarge',
          useAlikeInstanceTypes: false,
        },
      },
    },
    status: {
      provider: {
        worker: {
          instanceTypes: ['m4.xlarge'],
        },
      },
    },
  };

// AWSMachineDeployment for randomClusterAWS2's MachineDeploymentList item
export const randomClusterAWS2AWSMachineDeployment: infrav1alpha3.IAWSMachineDeployment =
  {
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'AWSMachineDeployment',
    metadata: {
      annotations: {
        'kubectl.kubernetes.io/last-applied-configuration':
          '{"apiVersion":"infrastructure.giantswarm.io/v1alpha2","kind":"AWSMachineDeployment","metadata":{"annotations":{},"labels":{"aws-operator.giantswarm.io/version":"8.4.0","giantswarm.io/cluster":"c7hm5","giantswarm.io/machine-deployment":"vud0a","giantswarm.io/organization":"org1","release.giantswarm.io/version":"11.2.1"},"name":"vud0a","namespace":"default"},"spec":{"nodePool":{"description":"Node pool 1","machine":{"dockerVolumeSizeGB":100,"kubeletVolumeSizeGB":100},"scaling":{"max":10,"min":3}},"provider":{"availabilityZones":["eu-central-1a","eu-central-1b"],"instanceDistribution":{"onDemandBaseCapacity":0,"onDemandPercentageAboveBaseCapacity":0},"worker":{"instanceType":"m4.xlarge","useAlikeInstanceTypes":false}}}}\n',
        'machine-deployment.giantswarm.io/subnet': '10.1.39.0/24',
      },
      creationTimestamp: '2022-05-24T08:31:10Z',
      finalizers: [
        'operatorkit.giantswarm.io/aws-operator-machine-deployment-controller',
        'operatorkit.giantswarm.io/aws-operator-drainer-controller',
      ],
      generation: 1,
      labels: {
        'aws-operator.giantswarm.io/version': '11.1.0',
        'cluster.x-k8s.io/cluster-name': 'as81f',
        'giantswarm.io/cluster': 'as81f',
        'giantswarm.io/machine-deployment': 'vud0a',
        'giantswarm.io/organization': 'org1',
        'release.giantswarm.io/version': '17.2.0',
      },

      name: 'vud0a',
      namespace: 'org-org1',
      resourceVersion: '992723659',
      selfLink:
        '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/vud0a',
      uid: '05df9010-9264-436e-ba92-2be77b25f2cf',
    },
    spec: {
      nodePool: {
        description: 'tools',
        machine: {
          dockerVolumeSizeGB: 100,
          kubeletVolumeSizeGB: 100,
        },
        scaling: {
          max: 6,
          min: 2,
        },
      },
      provider: {
        availabilityZones: ['eu-central-1a', 'eu-central-1b'],
        instanceDistribution: {
          onDemandBaseCapacity: 0,
          onDemandPercentageAboveBaseCapacity: 100,
        },
        worker: {
          instanceType: 'm4.xlarge',
          useAlikeInstanceTypes: false,
        },
      },
    },
    status: {
      provider: {
        worker: {
          instanceTypes: ['m4.xlarge'],
        },
      },
    },
  };
