import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';

export const randomCluster1MachinePool1: capiexpv1alpha3.IMachinePool = {
  apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
  kind: 'MachinePool',
  metadata: {
    annotations: {
      'cluster.k8s.io/cluster-api-autoscaler-node-group-max-size': '10',
      'cluster.k8s.io/cluster-api-autoscaler-node-group-min-size': '3',
      'machine-pool.giantswarm.io/name': 'Unnamed node pool',
      'release.giantswarm.io/last-deployed-version': '14.1.5',
    },
    creationTimestamp: '2021-04-27T16:07:38Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-machine-pool-controller',
    ],
    generation: 2,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.3',
      'cluster-operator.giantswarm.io/version': '0.23.22',
      'cluster.x-k8s.io/cluster-name': 'j5y9m',
      'giantswarm.io/cluster': 'j5y9m',
      'giantswarm.io/machine-pool': 't6yo9',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '14.1.5',
    },
    name: 't6yo9',
    namespace: 'org-org1',
    resourceVersion: '294674581',
    selfLink:
      '/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/machinepools/t6yo9',
    uid: 'bb097412-b4d2-4226-9163-626ce6b8fa63',
  },
  spec: {
    clusterName: 'j5y9m',
    failureDomains: ['1'],
    minReadySeconds: 0,
    providerIDList: [
      'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/0',
      'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/1',
      'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/2',
    ],
    replicas: 3,
    template: {
      metadata: {
        name: 't6yo9',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'core.giantswarm.io/v1alpha1',
            kind: 'Spark',
            name: 't6yo9',
            namespace: 'org-org1',
            resourceVersion: '294670506',
            uid: '4a740934-dd65-48e4-a4c4-6a1309eaf995',
          },
        },
        clusterName: 'j5y9m',
        infrastructureRef: {
          apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3',
          kind: 'AzureMachinePool',
          name: 't6yo9',
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

export const randomCluster1MachinePool2: capiexpv1alpha3.IMachinePool = {
  apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
  kind: 'MachinePool',
  metadata: {
    annotations: {
      'cluster.k8s.io/cluster-api-autoscaler-node-group-max-size': '10',
      'cluster.k8s.io/cluster-api-autoscaler-node-group-min-size': '3',
      'machine-pool.giantswarm.io/name': 'Unnamed node pool',
      'release.giantswarm.io/last-deployed-version': '14.1.5',
    },
    creationTimestamp: '2021-04-27T16:07:38Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-machine-pool-controller',
    ],
    generation: 2,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.3',
      'cluster-operator.giantswarm.io/version': '0.23.22',
      'cluster.x-k8s.io/cluster-name': 'j5y9m',
      'giantswarm.io/cluster': 'j5y9m',
      'giantswarm.io/machine-pool': 'f029a',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '14.1.5',
    },
    name: 'f029a',
    namespace: 'org-org1',
    resourceVersion: '294674581',
    selfLink:
      '/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/machinepools/f029a',
    uid: 'bb097412-b4d2-4226-9163-626ce6b8fa63',
  },
  spec: {
    clusterName: 'j5y9m',
    failureDomains: ['1'],
    minReadySeconds: 0,
    providerIDList: [
      'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-f029a/virtualMachines/0',
      'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-f029a/virtualMachines/1',
      'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-f029a/virtualMachines/2',
    ],
    replicas: 8,
    template: {
      metadata: {
        name: 'f029a',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'core.giantswarm.io/v1alpha1',
            kind: 'Spark',
            name: 'f029a',
            namespace: 'org-org1',
            resourceVersion: '294670506',
            uid: '4a740934-dd65-48e4-a4c4-6a1309eaf995',
          },
        },
        clusterName: 'j5y9m',
        infrastructureRef: {
          apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3',
          kind: 'AzureMachinePool',
          name: 'f029a',
          namespace: 'org-org1',
          resourceVersion: '294670505',
          uid: 'a533e830-7af0-4042-acee-fb338f5eba3e',
        },
      },
    },
  },
  status: {
    availableReplicas: 8,
    bootstrapReady: false,
    conditions: [],
    infrastructureReady: true,
    readyReplicas: 8,
    replicas: 8,
  },
};

export const randomCluster2MachinePool1: capiexpv1alpha3.IMachinePool = {
  apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
  kind: 'MachinePool',
  metadata: {
    annotations: {
      'cluster.k8s.io/cluster-api-autoscaler-node-group-max-size': '10',
      'cluster.k8s.io/cluster-api-autoscaler-node-group-min-size': '3',
      'machine-pool.giantswarm.io/name': 'Unnamed node pool',
      'release.giantswarm.io/last-deployed-version': '14.0.1',
    },
    creationTimestamp: '2021-04-27T16:07:38Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-machine-pool-controller',
    ],
    generation: 2,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.3',
      'cluster-operator.giantswarm.io/version': '0.23.22',
      'cluster.x-k8s.io/cluster-name': 'as43z',
      'giantswarm.io/cluster': 'as43z',
      'giantswarm.io/machine-pool': 't6yo9',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '14.0.1',
    },
    name: 't6yo9',
    namespace: 'org-org1',
    resourceVersion: '294674581',
    selfLink:
      '/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/machinepools/t6yo9',
    uid: 'bb097412-b4d2-4226-9163-626ce6b8fa63',
  },
  spec: {
    clusterName: 'as43z',
    failureDomains: ['1'],
    minReadySeconds: 0,
    providerIDList: [
      'azure:///subscriptions/test1337/resourceGroups/as43z/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/0',
      'azure:///subscriptions/test1337/resourceGroups/as43z/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/1',
      'azure:///subscriptions/test1337/resourceGroups/as43z/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/2',
    ],
    replicas: 3,
    template: {
      metadata: {
        name: 't6yo9',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'core.giantswarm.io/v1alpha1',
            kind: 'Spark',
            name: 't6yo9',
            namespace: 'org-org1',
            resourceVersion: '294670506',
            uid: '4a740934-dd65-48e4-a4c4-6a1309eaf995',
          },
        },
        clusterName: 'as43z',
        infrastructureRef: {
          apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3',
          kind: 'AzureMachinePool',
          name: 't6yo9',
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

export const randomCluster1MachinePoolList: capiexpv1alpha3.IMachinePoolList = {
  apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
  kind: capiexpv1alpha3.MachinePoolList,
  metadata: {},
  items: [randomCluster1MachinePool1, randomCluster1MachinePool2],
};

export const randomCluster2MachinePoolList: capiexpv1alpha3.IMachinePoolList = {
  apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
  kind: capiexpv1alpha3.MachinePoolList,
  metadata: {},
  items: [randomCluster2MachinePool1],
};

export const randomCluster3MachinePoolList: capiexpv1alpha3.IMachinePoolList = {
  apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
  kind: capiexpv1alpha3.MachinePoolList,
  metadata: {},
  items: [],
};
