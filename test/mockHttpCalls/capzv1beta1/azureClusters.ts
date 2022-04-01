import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';

export const randomAzureCluster1: capzv1beta1.IAzureCluster = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: 'AzureCluster',
  metadata: {
    creationTimestamp: '2021-04-27T10:45:06Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-azurecluster-controller',
    ],
    generation: 4,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.2',
      'cluster-operator.giantswarm.io/version': '0.23.22',
      'cluster.x-k8s.io/cluster-name': 'j5y9m',
      'giantswarm.io/cluster': 'j5y9m',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '14.1.5',
    },
    name: 'j5y9m',
    namespace: 'org-org1',
    resourceVersion: '391239110',
    selfLink:
      '/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azureclusters/j5y9m',
    uid: 'a4eeba9e-6a58-4151-b8ad-d1389ae1e223',
  },
  spec: {
    controlPlaneEndpoint: {
      host: '',
      port: 443,
    },
    location: 'westeurope',
    networkSpec: {
      apiServerLB: {
        frontendIPs: [{ name: 'j5y9m-API-PublicLoadBalancer-Frontend' }],
        name: 'j5y9m-API-PublicLoadBalancer',
        sku: 'Standard',
        type: 'Public',
      },
      subnets: [
        {
          cidrBlocks: ['10.14.3.0/24'],
          id: '/subscriptions/test-subscription/resourceGroups/j5y9m/providers/Microsoft.Network/virtualNetworks/j5y9m-VirtualNetwork/subnets/j5y9m',
          name: 'j5y9m',
          role: 'node',
          routeTable: {},
          securityGroup: {},
        },
        {
          cidrBlocks: ['10.14.5.0/24'],
          id: '/subscriptions/test-subscription/resourceGroups/j5y9m/providers/Microsoft.Network/virtualNetworks/j5y9m-VirtualNetwork/subnets/ew87z',
          name: 'ew87z',
          role: 'node',
          routeTable: {},
          securityGroup: {},
        },
      ],
      vnet: {
        cidrBlocks: ['10.14.0.0/16'],
        name: 'j5y9m-VirtualNetwork',
        resourceGroup: 'j5y9m',
      },
    },
    resourceGroup: 'j5y9m',
    subscriptionID: 'test-subscription',
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2021-05-14T16:01:57Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2020-11-23T13:43:31Z',
        status: 'True',
        type: 'ResourceGroupReady',
      },
      {
        lastTransitionTime: '2021-05-14T16:01:57Z',
        status: 'True',
        type: 'VNetPeeringReady',
      },
      {
        lastTransitionTime: '2021-05-14T11:37:34Z',
        status: 'True',
        type: 'VPNGatewayReady',
      },
    ],
  },
};

export const randomCluster2: capzv1beta1.IAzureCluster = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: 'AzureCluster',
  metadata: {
    creationTimestamp: '2021-02-27T08:40:06Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-azurecluster-controller',
    ],
    generation: 4,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.2',
      'cluster-operator.giantswarm.io/version': '0.23.22',
      'cluster.x-k8s.io/cluster-name': 'as43z',
      'giantswarm.io/cluster': 'as43z',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '14.0.1',
    },
    name: 'as43z',
    namespace: 'org-org1',
    resourceVersion: '391239110',
    selfLink:
      '/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azureclusters/as43z',
    uid: 'a4eeba9e-6a58-4151-b8ad-d1389ae1e223',
  },
  spec: {
    controlPlaneEndpoint: {
      host: '',
      port: 443,
    },
    location: 'westeurope',
    networkSpec: {
      apiServerLB: {
        frontendIPs: [{ name: 'as43z-API-PublicLoadBalancer-Frontend' }],
        name: 'as43z-API-PublicLoadBalancer',
        sku: 'Standard',
        type: 'Public',
      },
      subnets: [
        {
          cidrBlocks: ['10.14.3.0/24'],
          id: '/subscriptions/test-subscription/resourceGroups/as43z/providers/Microsoft.Network/virtualNetworks/as43z-VirtualNetwork/subnets/as43z',
          name: 'as43z',
          role: 'node',
          routeTable: {},
          securityGroup: {},
        },
        {
          cidrBlocks: ['10.14.5.0/24'],
          id: '/subscriptions/test-subscription/resourceGroups/as43z/providers/Microsoft.Network/virtualNetworks/as43z-VirtualNetwork/subnets/ew87z',
          name: 'ew87z',
          role: 'node',
          routeTable: {},
          securityGroup: {},
        },
      ],
      vnet: {
        cidrBlocks: ['10.14.0.0/16'],
        name: 'as43z-VirtualNetwork',
        resourceGroup: 'as43z',
      },
    },
    resourceGroup: 'as43z',
    subscriptionID: 'test-subscription',
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2021-05-14T16:01:57Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2020-11-23T13:43:31Z',
        status: 'True',
        type: 'ResourceGroupReady',
      },
      {
        lastTransitionTime: '2021-05-14T16:01:57Z',
        status: 'True',
        type: 'VNetPeeringReady',
      },
      {
        lastTransitionTime: '2021-05-14T11:37:34Z',
        status: 'True',
        type: 'VPNGatewayReady',
      },
    ],
  },
};

export const randomCluster3: capzv1beta1.IAzureCluster = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: 'AzureCluster',
  metadata: {
    creationTimestamp: '2020-12-01T08:40:06Z',
    finalizers: [
      'operatorkit.giantswarm.io/azure-operator-azurecluster-controller',
    ],
    generation: 4,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.2',
      'cluster-operator.giantswarm.io/version': '0.23.22',
      'cluster.x-k8s.io/cluster-name': '0fa12',
      'giantswarm.io/cluster': '0fa12',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '13.1.0',
    },
    name: '0fa12',
    namespace: 'org-org1',
    resourceVersion: '391239110',
    selfLink:
      '/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azureclusters/0fa12',
    uid: 'a4eeba9e-6a58-4151-b8ad-d1389ae1e223',
  },
  spec: {
    controlPlaneEndpoint: {
      host: '',
      port: 443,
    },
    location: 'westeurope',
    networkSpec: {
      apiServerLB: {
        frontendIPs: [{ name: '0fa12-API-PublicLoadBalancer-Frontend' }],
        name: '0fa12-API-PublicLoadBalancer',
        sku: 'Standard',
        type: 'Public',
      },
      subnets: [
        {
          cidrBlocks: ['10.14.3.0/24'],
          id: '/subscriptions/test-subscription/resourceGroups/0fa12/providers/Microsoft.Network/virtualNetworks/0fa12-VirtualNetwork/subnets/0fa12',
          name: '0fa12',
          role: 'node',
          routeTable: {},
          securityGroup: {},
        },
        {
          cidrBlocks: ['10.14.5.0/24'],
          id: '/subscriptions/test-subscription/resourceGroups/0fa12/providers/Microsoft.Network/virtualNetworks/0fa12-VirtualNetwork/subnets/ew87z',
          name: 'ew87z',
          role: 'node',
          routeTable: {},
          securityGroup: {},
        },
      ],
      vnet: {
        cidrBlocks: ['10.14.0.0/16'],
        name: '0fa12-VirtualNetwork',
        resourceGroup: '0fa12',
      },
    },
    resourceGroup: '0fa12',
    subscriptionID: 'test-subscription',
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2021-05-14T16:01:57Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2020-11-23T13:43:31Z',
        status: 'True',
        type: 'ResourceGroupReady',
      },
      {
        lastTransitionTime: '2021-05-14T16:01:57Z',
        status: 'True',
        type: 'VNetPeeringReady',
      },
      {
        lastTransitionTime: '2021-05-14T11:37:34Z',
        status: 'True',
        type: 'VPNGatewayReady',
      },
    ],
  },
};

export const randomAzureClusterList: capzv1beta1.IAzureClusterList = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: 'AzureClusterList',
  metadata: {
    resourceVersion: '294659579',
    selfLink: '/apis/infrastructure.cluster.x-k8s.io/v1beta1/azureclusters/',
  },
  items: [randomAzureCluster1, randomCluster2, randomCluster3],
};
