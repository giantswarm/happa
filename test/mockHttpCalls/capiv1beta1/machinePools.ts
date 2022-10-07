import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';

export const randomCluster3MachinePool1: capiv1beta1.IMachinePool = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'MachinePool',
  metadata: {
    annotations: {
      'cluster.k8s.io/cluster-api-autoscaler-node-group-max-size': '10',
      'cluster.k8s.io/cluster-api-autoscaler-node-group-min-size': '3',
      'machine-pool.giantswarm.io/name': 'Unnamed node pool',
      'release.giantswarm.io/last-deployed-version': '17.1.0',
    },
    creationTimestamp: '2022-06-10T15:01:14Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-machine-pool-controller',
    ],
    generation: 2,
    labels: {
      'azure-operator.giantswarm.io/version': '5.20.0',
      'cluster-operator.giantswarm.io/version': '3.12.0',
      'cluster.x-k8s.io/cluster-name': '0fa12',
      'giantswarm.io/cluster': '0fa12',
      'giantswarm.io/machine-pool': 'a8s10',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '17.1.0',
    },
    name: 'a8s10',
    namespace: 'org-org1',
    resourceVersion: '294674581',
    selfLink:
      '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinepools/a8s10',
    uid: 'bb097412-b4d2-4226-9163-626ce6b8fa63',
  },
  spec: {
    clusterName: '0fa12',
    failureDomains: ['1'],
    minReadySeconds: 0,
    providerIDList: [
      'azure:///subscriptions/test1337/resourceGroups/0fa12/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-a8s10/virtualMachines/0',
      'azure:///subscriptions/test1337/resourceGroups/0fa12/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-a8s10/virtualMachines/1',
      'azure:///subscriptions/test1337/resourceGroups/0fa12/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-a8s10/virtualMachines/2',
    ],
    replicas: 3,
    template: {
      metadata: {
        name: 'a8s10',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'core.giantswarm.io/v1alpha1',
            kind: 'Spark',
            name: '0fa12',
            namespace: 'org-org1',
            resourceVersion: '294670506',
            uid: '4a740934-dd65-48e4-a4c4-6a1309eaf995',
          },
        },
        clusterName: '0fa12',
        infrastructureRef: {
          apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
          kind: 'AzureMachinePool',
          name: 'a8s10',
          namespace: 'org-org1',
          resourceVersion: '294670505',
          uid: 'a533e830-7af0-4042-acee-fb338f5eba3e',
        },
      },
    },
  },
  status: {
    availableReplicas: 3,
    bootstrapReady: false,
    conditions: [
      {
        lastTransitionTime: '2021-04-27T16:20:53Z',
        message: '2/3 replicas are ready, 3/3 node references set',
        reason: 'WaitingForReplicasReady @ /t6yo9',
        severity: 'Warning',
        status: 'False',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2021-04-27T16:20:50Z',
        message: 'Creation has been completed in 13m12.501852279s',
        reason: 'CreationCompleted',
        severity: 'Info',
        status: 'False',
        type: 'Creating',
      },
      {
        lastTransitionTime: '2021-04-27T16:20:35Z',
        status: 'True',
        type: 'InfrastructureReady',
      },
      {
        lastTransitionTime: '2021-04-27T16:20:53Z',
        message: '2/3 replicas are ready, 3/3 node references set',
        reason: 'WaitingForReplicasReady',
        severity: 'Warning',
        status: 'False',
        type: 'ReplicasReady',
      },
      {
        lastTransitionTime: '2021-04-27T16:07:38Z',
        message: 'Upgrade has not been started',
        reason: 'UpgradeNotStarted',
        severity: 'Info',
        status: 'False',
        type: 'Upgrading',
      },
    ],
    infrastructureReady: true,
    readyReplicas: 2,
    replicas: 3,
  },
};

export const randomClusterCAPA1MachinePool1: capiv1beta1.IMachinePool = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'MachinePool',
  metadata: {
    annotations: {
      'machine-pool.giantswarm.io/name': 'workers',
      'meta.helm.sh/release-name': 'asdf1',
      'meta.helm.sh/release-namespace': 'org-org1',
    },
    creationTimestamp: '2022-10-07T09:06:02Z',
    finalizers: ['machinepool.cluster.x-k8s.io'],
    generation: 3,
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
    namespace: 'org-org1',
    ownerReferences: [
      {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        kind: 'Cluster',
        name: 'asdf1',
        uid: '',
      },
    ],
  },
  spec: {
    clusterName: 'asdf1',
    minReadySeconds: 0,
    replicas: 3,
    template: {
      metadata: {
        name: '',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'bootstrap.cluster.x-k8s.io/v1beta1',
            kind: 'KubeadmConfig',
            name: 'asdf1-machine-pool0',
            namespace: 'org-org1',
          },
          dataSecretName: 'asdf1-machine-pool0',
        },
        clusterName: 'asdf1',
        infrastructureRef: {
          apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
          kind: 'AWSMachinePool',
          name: 'asdf1-machine-pool0',
          namespace: 'org-org1',
        },
        version: 'v1.22.12',
      },
    },
  },
  status: {
    availableReplicas: 3,
    bootstrapReady: true,
    conditions: [
      {
        lastTransitionTime: '2022-10-07T09:20:49Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2022-10-07T09:12:32Z',
        status: 'True',
        type: 'BootstrapReady',
      },
      {
        lastTransitionTime: '2022-10-07T09:12:34Z',
        status: 'True',
        type: 'InfrastructureReady',
      },
      {
        lastTransitionTime: '2022-10-07T09:20:49Z',
        status: 'True',
        type: 'ReplicasReady',
      },
    ],
    infrastructureReady: true,
    observedGeneration: 3,
    phase: 'Running',
    readyReplicas: 3,
    replicas: 3,
  },
};

export const randomCluster3MachinePoolList: capiv1beta1.IMachinePoolList = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: capiv1beta1.MachinePoolList,
  metadata: {},
  items: [randomCluster3MachinePool1],
};

export const randomClusterCAPA1MachinePoolList: capiv1beta1.IMachinePoolList = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: capiv1beta1.MachinePoolList,
  metadata: {},
  items: [randomClusterCAPA1MachinePool1],
};
