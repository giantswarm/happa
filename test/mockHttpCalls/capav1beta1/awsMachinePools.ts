import * as capav1beta1 from 'model/services/mapi/capav1beta1';

export const randomClusterCAPA1AWSMachinePool: capav1beta1.IAWSMachinePool = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: 'AWSMachinePool',
  metadata: {
    annotations: {
      'cluster-api-provider-aws': 'true',
      'meta.helm.sh/release-name': 'asdf1',
      'meta.helm.sh/release-namespace': 'org1',
    },
    creationTimestamp: '2022-10-07T09:06:02Z',
    finalizers: [
      'awsmachinepool.infrastructure.cluster.x-k8s.io',
      'capa-iam-operator.finalizers.giantswarm.io/nodes',
    ],
    generation: 6,
    labels: {
      app: 'cluster-aws',
      'app.kubernetes.io/managed-by': 'Helm',
      'app.kubernetes.io/version': '0.9.2',
      'application.giantswarm.io/team': 'hydra',
      'cluster.x-k8s.io/cluster-name': 'asdf1',
      'cluster.x-k8s.io/watch-filter': 'capi',
      'giantswarm.io/cluster': 'asdf1',
      'giantswarm.io/machine-pool': 'asdf1-machine-pool0',
      'giantswarm.io/organization': 'org1',
      'helm.sh/chart': 'cluster-aws-0.9.2',
      'release.giantswarm.io/version': '20.0.0-alpha1',
    },
    name: 'asdf1-machine-pool0',
    namespace: 'org1',
    ownerReferences: [
      {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        blockOwnerDeletion: true,
        controller: true,
        kind: 'MachinePool',
        name: 'asdf1-machine-pool0',
        uid: '',
      },
    ],
  },
  spec: {
    availabilityZones: ['eu-west-2a', 'eu-west-2b', 'eu-west-2c'],
    awsLaunchTemplate: {
      ami: {},
      iamInstanceProfile: 'nodes-machine-pool0-asdf1',
      imageLookupBaseOS: 'ubuntu-20.04',
      imageLookupFormat: 'capa-ami-{{.BaseOS}}-{{.K8sVersion}}-00-gs',
      imageLookupOrg: '706635527432',
      instanceType: 'm5.xlarge',
      rootVolume: {
        deviceName: '/dev/sda1',
        size: 300,
        type: 'gp3',
      },
      sshKeyName: '',
    },
    defaultCoolDown: '5m0s',
    maxSize: 10,
    minSize: 3,
    mixedInstancesPolicy: {
      instancesDistribution: {
        onDemandAllocationStrategy: 'prioritized',
        onDemandBaseCapacity: 100,
        onDemandPercentageAboveBaseCapacity: 100,
        spotAllocationStrategy: 'lowest-price',
      },
    },
    subnets: [
      {
        filters: [
          {
            name: 'tag:sigs.k8s.io/cluster-api-provider-aws/cluster/asdf1',
            values: ['owned'],
          },
          {
            name: 'tag:sigs.k8s.io/cluster-api-provider-aws/role',
            values: ['private'],
          },
          {
            name: 'availabilityZone',
            values: ['eu-west-2a', 'eu-west-2b', 'eu-west-2c'],
          },
        ],
      },
    ],
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2022-10-07T09:12:34Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2022-10-07T09:12:34Z',
        status: 'True',
        type: 'ASGReady',
      },
      {
        lastTransitionTime: '2022-10-07T09:12:33Z',
        status: 'True',
        type: 'LaunchTemplateReady',
      },
    ],
    ready: true,
    replicas: 3,
  },
};
