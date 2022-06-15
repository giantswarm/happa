import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';

export const randomCluster3AzureMachinePool1: capzv1beta1.IAzureMachinePool = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: capzv1beta1.AzureMachinePool,
  metadata: {
    creationTimestamp: '2022-06-10T15:01:14Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-azure-machine-pool-controller',
    ],
    generation: 2,
    labels: {
      'azure-operator.giantswarm.io/version': '5.20.0',
      'cluster.x-k8s.io/cluster-name': '0fa12',
      'giantswarm.io/cluster': '0fa12',
      'giantswarm.io/machine-pool': 'a8s10',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '17.1.0',
    },
    name: 'a8s10',
    namespace: 'org-org1',
    resourceVersion: '294674360',
    selfLink:
      '/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azuremachinepools/a8s10',
    uid: 'a533e830-7af0-4042-acee-fb338f5eba3e',
  },
  spec: {
    identity: 'None',
    location: 'westeurope',
    strategy: {
      type: 'RollingUpdate',
    },
    providerID:
      'azure:///subscriptions/test1337/resourceGroups/0fa12/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-a8s10',
    providerIDList: [
      'azure:///subscriptions/test1337/resourceGroups/0fa12/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-a8s10/virtualMachines/0',
      'azure:///subscriptions/test1337/resourceGroups/0fa12/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-a8s10/virtualMachines/1',
      'azure:///subscriptions/test1337/resourceGroups/0fa12/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-a8s10/virtualMachines/2',
    ],
    template: {
      dataDisks: [
        {
          diskSizeGB: 100,
          lun: 21,
          nameSuffix: 'docker',
        },
        {
          diskSizeGB: 100,
          lun: 22,
          nameSuffix: 'kubelet',
        },
      ],
      osDisk: {
        diskSizeGB: 0,
        managedDisk: {
          storageAccountType: 'Premium_LRS',
        },
        osType: '',
      },
      sshPublicKey: '',
      vmSize: 'Standard_A8_v2',
    },
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2021-04-27T16:20:03Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2021-04-27T16:14:48Z',
        status: 'True',
        type: 'SubnetReady',
      },
      {
        lastTransitionTime: '2021-04-27T16:20:03Z',
        status: 'True',
        type: 'VMSSReady',
      },
    ],
    provisioningState: 'Succeeded',
    ready: true,
    replicas: 3,
    version: '',
  },
};

export const randomCluster3AzureMachinePoolList: capzv1beta1.IAzureMachinePoolList =
  {
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: capzv1beta1.AzureMachinePoolList,
    metadata: {},
    items: [randomCluster3AzureMachinePool1],
  };
