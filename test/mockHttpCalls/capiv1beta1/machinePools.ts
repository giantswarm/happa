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

export const randomCluster3MachinePoolList: capiv1beta1.IMachinePoolList = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: capiv1beta1.MachinePoolList,
  metadata: {},
  items: [randomCluster3MachinePool1],
};
