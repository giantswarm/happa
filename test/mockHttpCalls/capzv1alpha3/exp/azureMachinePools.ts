import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';

export const randomCluster1AzureMachinePool1: capzexpv1alpha3.IAzureMachinePool =
  {
    apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: capzexpv1alpha3.AzureMachinePool,
    metadata: {
      creationTimestamp: '2021-04-27T16:07:37Z',
      finalizers: [
        'operatorkit.giantswarm.io/azure-operator-azure-machine-pool-controller',
      ],
      generation: 2,
      labels: {
        'azure-operator.giantswarm.io/version': '5.5.3',
        'cluster.x-k8s.io/cluster-name': 'j5y9m',
        'giantswarm.io/cluster': 'j5y9m',
        'giantswarm.io/machine-pool': 't6yo9',
        'giantswarm.io/organization': 'org1',
        'release.giantswarm.io/version': '14.1.5',
      },
      name: 't6yo9',
      namespace: 'org-org1',
      resourceVersion: '294674360',
      selfLink:
        '/apis/exp.infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachinepools/t6yo9',
      uid: 'a533e830-7af0-4042-acee-fb338f5eba3e',
    },
    spec: {
      identity: 'None',
      location: 'westeurope',
      providerID:
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9',
      providerIDList: [
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/0',
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/1',
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/2',
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

export const randomCluster1AzureMachinePool2: capzexpv1alpha3.IAzureMachinePool =
  {
    apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: capzexpv1alpha3.AzureMachinePool,
    metadata: {
      creationTimestamp: '2021-04-27T16:07:37Z',
      finalizers: [
        'operatorkit.giantswarm.io/azure-operator-azure-machine-pool-controller',
      ],
      generation: 2,
      labels: {
        'azure-operator.giantswarm.io/version': '5.5.3',
        'cluster.x-k8s.io/cluster-name': 'j5y9m',
        'giantswarm.io/cluster': 'j5y9m',
        'giantswarm.io/machine-pool': 'f029a',
        'giantswarm.io/organization': 'org1',
        'release.giantswarm.io/version': '14.1.5',
      },
      name: 'f029a',
      namespace: 'org-org1',
      resourceVersion: '294674360',
      selfLink:
        '/apis/exp.infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachinepools/f029a',
      uid: 'a533e830-7af0-4042-acee-fb338f5eba3e',
    },
    spec: {
      identity: 'None',
      location: 'westeurope',
      providerID:
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-f029a',
      providerIDList: [
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-f029a/virtualMachines/0',
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-f029a/virtualMachines/1',
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-f029a/virtualMachines/2',
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

export const randomCluster2AzureMachinePool1: capzexpv1alpha3.IAzureMachinePool =
  {
    apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: capzexpv1alpha3.AzureMachinePool,
    metadata: {
      creationTimestamp: '2021-04-27T16:07:37Z',
      finalizers: [
        'operatorkit.giantswarm.io/azure-operator-azure-machine-pool-controller',
      ],
      generation: 2,
      labels: {
        'azure-operator.giantswarm.io/version': '5.5.3',
        'cluster.x-k8s.io/cluster-name': 'j5y9m',
        'giantswarm.io/cluster': 'j5y9m',
        'giantswarm.io/machine-pool': 't6yo9',
        'giantswarm.io/organization': 'org1',
        'release.giantswarm.io/version': '14.0.1',
      },
      name: 't6yo9',
      namespace: 'org-org1',
      resourceVersion: '294674360',
      selfLink:
        '/apis/exp.infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachinepools/t6yo9',
      uid: 'a533e830-7af0-4042-acee-fb338f5eba3e',
    },
    spec: {
      identity: 'None',
      location: 'westeurope',
      providerID:
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9',
      providerIDList: [
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/0',
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/1',
        'azure:///subscriptions/test1337/resourceGroups/j5y9m/providers/Microsoft.Compute/virtualMachineScaleSets/nodepool-t6yo9/virtualMachines/2',
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

export const randomCluster1AzureMachinePoolList: capzexpv1alpha3.IAzureMachinePoolList =
  {
    apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: capzexpv1alpha3.AzureMachinePoolList,
    metadata: {},
    items: [randomCluster1AzureMachinePool1, randomCluster1AzureMachinePool2],
  };

export const randomCluster2AzureMachinePoolList: capzexpv1alpha3.IAzureMachinePoolList =
  {
    apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: capzexpv1alpha3.AzureMachinePoolList,
    metadata: {},
    items: [randomCluster2AzureMachinePool1],
  };
