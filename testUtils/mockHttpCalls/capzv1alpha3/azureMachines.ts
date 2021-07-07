import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';

export const randomAzureMachine1: capzv1alpha3.IAzureMachine = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
  kind: 'AzureMachine',
  metadata: {
    annotations: {
      'release.giantswarm.io/last-deployed-version': '14.1.5',
    },
    creationTimestamp: '2021-04-26T15:05:26Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-azure-machine-controller',
    ],
    generation: 1,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.2',
      'cluster.x-k8s.io/cluster-name': 'j5y9m',
      'cluster.x-k8s.io/control-plane': 'true',
      'giantswarm.io/cluster': 'j5y9m',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '14.1.5',
    },
    name: 'j5y9m-master-0',
    namespace: 'org-org1',
    resourceVersion: '294232688',
    selfLink:
      '/apis/infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachines/j5y9m-master-0',
    uid: '9f42172b-f87e-41ac-8fb6-49e0247ad1dc',
  },
  spec: {
    location: 'westeurope',
    failureDomain: '2',
    identity: 'None',
    image: {
      marketplace: {
        offer: 'flatcar-container-linux-free',
        publisher: 'kinvolk',
        sku: 'stable',
        thirdPartyImage: false,
        version: '2345.3.1',
      },
    },
    osDisk: {
      cachingType: 'ReadWrite',
      diskSizeGB: 50,
      managedDisk: {
        storageAccountType: 'Premium_LRS',
      },
      osType: 'Linux',
    },
    sshPublicKey: '',
    vmSize: 'Standard_A8_v2',
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2021-04-26T15:18:58Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2021-04-26T15:20:26Z',
        message: 'Creation has been completed in 15m0.120533613s',
        reason: 'CreationCompleted',
        severity: 'Info',
        status: 'False',
        type: 'Creating',
      },
      {
        lastTransitionTime: '2021-04-26T15:09:11Z',
        status: 'True',
        type: 'SubnetReady',
      },
      {
        lastTransitionTime: '2021-04-26T15:05:44Z',
        message: 'Upgrade has not been started',
        reason: 'UpgradeNotStarted',
        severity: 'Info',
        status: 'False',
        type: 'Upgrading',
      },
      {
        lastTransitionTime: '2021-04-26T15:18:58Z',
        status: 'True',
        type: 'VMSSReady',
      },
    ],
    ready: true,
  },
};

export const randomAzureMachine2: capzv1alpha3.IAzureMachine = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
  kind: 'AzureMachine',
  metadata: {
    annotations: {
      'release.giantswarm.io/last-deployed-version': '14.0.1',
    },
    creationTimestamp: '2021-04-26T15:05:26Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-azure-machine-controller',
    ],
    generation: 1,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.2',
      'cluster.x-k8s.io/cluster-name': 'as43z',
      'cluster.x-k8s.io/control-plane': 'true',
      'giantswarm.io/cluster': 'as43z',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '14.0.1',
    },
    name: 'as43z-master-0',
    namespace: 'org-org1',
    resourceVersion: '294232688',
    selfLink:
      '/apis/infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachines/as43z-master-0',
    uid: '9f42172b-f87e-41ac-8fb6-49e0247ad1dc',
  },
  spec: {
    location: 'westeurope',
    failureDomain: '2',
    identity: 'None',
    image: {
      marketplace: {
        offer: 'flatcar-container-linux-free',
        publisher: 'kinvolk',
        sku: 'stable',
        thirdPartyImage: false,
        version: '2345.3.1',
      },
    },
    osDisk: {
      cachingType: 'ReadWrite',
      diskSizeGB: 50,
      managedDisk: {
        storageAccountType: 'Premium_LRS',
      },
      osType: 'Linux',
    },
    sshPublicKey: '',
    vmSize: 'Standard_A8_v2',
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2021-04-26T15:18:58Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2021-04-26T15:20:26Z',
        message: 'Creation has been completed in 15m0.120533613s',
        reason: 'CreationCompleted',
        severity: 'Info',
        status: 'False',
        type: 'Creating',
      },
      {
        lastTransitionTime: '2021-04-26T15:09:11Z',
        status: 'True',
        type: 'SubnetReady',
      },
      {
        lastTransitionTime: '2021-04-26T15:05:44Z',
        message: 'Upgrade has not been started',
        reason: 'UpgradeNotStarted',
        severity: 'Info',
        status: 'False',
        type: 'Upgrading',
      },
      {
        lastTransitionTime: '2021-04-26T15:18:58Z',
        status: 'True',
        type: 'VMSSReady',
      },
    ],
    ready: true,
  },
};

export const randomAzureMachine3: capzv1alpha3.IAzureMachine = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
  kind: 'AzureMachine',
  metadata: {
    annotations: {
      'release.giantswarm.io/last-deployed-version': '13.1.0',
    },
    creationTimestamp: '2021-04-26T15:05:26Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-azure-machine-controller',
    ],
    generation: 1,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.2',
      'cluster.x-k8s.io/cluster-name': '0fa12',
      'cluster.x-k8s.io/control-plane': 'true',
      'giantswarm.io/cluster': '0fa12',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '13.1.0',
    },
    name: '0fa12-master-0',
    namespace: 'org-org1',
    resourceVersion: '294232688',
    selfLink:
      '/apis/infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachines/0fa12-master-0',
    uid: '9f42172b-f87e-41ac-8fb6-49e0247ad1dc',
  },
  spec: {
    location: 'westeurope',
    failureDomain: '2',
    identity: 'None',
    image: {
      marketplace: {
        offer: 'flatcar-container-linux-free',
        publisher: 'kinvolk',
        sku: 'stable',
        thirdPartyImage: false,
        version: '2345.3.1',
      },
    },
    osDisk: {
      cachingType: 'ReadWrite',
      diskSizeGB: 50,
      managedDisk: {
        storageAccountType: 'Premium_LRS',
      },
      osType: 'Linux',
    },
    sshPublicKey: '',
    vmSize: 'Standard_A8_v2',
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2021-04-26T15:18:58Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2021-04-26T15:20:26Z',
        message: 'Creation has been completed in 15m0.120533613s',
        reason: 'CreationCompleted',
        severity: 'Info',
        status: 'False',
        type: 'Creating',
      },
      {
        lastTransitionTime: '2021-04-26T15:09:11Z',
        status: 'True',
        type: 'SubnetReady',
      },
      {
        lastTransitionTime: '2021-04-26T15:05:44Z',
        message: 'Upgrade has not been started',
        reason: 'UpgradeNotStarted',
        severity: 'Info',
        status: 'False',
        type: 'Upgrading',
      },
      {
        lastTransitionTime: '2021-04-26T15:18:58Z',
        status: 'True',
        type: 'VMSSReady',
      },
    ],
    ready: true,
  },
};

export const randomAzureMachineList1: capzv1alpha3.IAzureMachineList = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
  kind: capzv1alpha3.AzureMachineList,
  metadata: {},
  items: [randomAzureMachine1],
};

export const randomAzureMachineList2: capzv1alpha3.IAzureMachineList = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
  kind: capzv1alpha3.AzureMachineList,
  metadata: {},
  items: [randomAzureMachine2],
};

export const randomAzureMachineList3: capzv1alpha3.IAzureMachineList = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
  kind: capzv1alpha3.AzureMachineList,
  metadata: {},
  items: [randomAzureMachine3],
};
