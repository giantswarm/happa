import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';

export const randomCluster1AppsList: applicationv1alpha1.IAppList = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: applicationv1alpha1.AppList,
  items: [
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:44Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'azure-scheduled-events',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'j5y9m',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'azure-scheduled-events',
        namespace: 'j5y9m',
        resourceVersion: '294675085',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/azure-scheduled-events',
        uid: 'c418922f-eddc-4a7b-a081-673356bd6e16',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'j5y9m-cluster-values',
            namespace: 'j5y9m',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'j5y9m-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'j5y9m-kubeconfig',
            namespace: 'j5y9m',
          },
        },
        name: 'azure-scheduled-events-app',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '0.4.0',
      },
      status: {
        appVersion: '0.4.0',
        release: {
          lastDeployed: '2021-04-27T16:21:42Z',
          status: 'deployed',
        },
        version: '0.4.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '294674489',
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:41Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'cert-exporter',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'j5y9m',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'cert-exporter',
        namespace: 'j5y9m',
        resourceVersion: '294675095',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/cert-exporter',
        uid: '3daa2782-90cc-4e36-8453-c4a8f7dae10a',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'j5y9m-cluster-values',
            namespace: 'j5y9m',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'j5y9m-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'j5y9m-kubeconfig',
            namespace: 'j5y9m',
          },
        },
        name: 'cert-exporter',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '1.6.0',
      },
      status: {
        appVersion: '1.6.0',
        release: {
          lastDeployed: '2021-04-27T16:22:36Z',
          status: 'deployed',
        },
        version: '1.6.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '294674489',
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:41Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'chart-operator',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'j5y9m',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'chart-operator',
        namespace: 'j5y9m',
        resourceVersion: '294675084',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/chart-operator',
        uid: '4b4c6a31-b254-4209-b74c-75ab7d504653',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'j5y9m-cluster-values',
            namespace: 'j5y9m',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'j5y9m-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'j5y9m-kubeconfig',
            namespace: 'j5y9m',
          },
        },
        name: 'chart-operator',
        namespace: 'giantswarm',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '2.12.0',
      },
      status: {
        appVersion: '2.12.0',
        release: {
          lastDeployed: '2021-04-27T16:21:32Z',
          status: 'deployed',
        },
        version: '2.12.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:43Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'cluster-autoscaler',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'j5y9m',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'cluster-autoscaler',
        namespace: 'j5y9m',
        resourceVersion: '294674855',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/cluster-autoscaler',
        uid: 'ec2e63cf-fa1f-48be-89e5-279e102ed2b5',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'j5y9m-cluster-values',
            namespace: 'j5y9m',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'j5y9m-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'j5y9m-kubeconfig',
            namespace: 'j5y9m',
          },
        },
        name: 'cluster-autoscaler-app',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '1.19.1',
      },
      status: {
        appVersion: 'v1.19.1',
        release: {
          lastDeployed: '2021-04-27T16:21:49Z',
          status: 'deployed',
        },
        version: '1.19.1',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '294674489',
          'chart-operator.giantswarm.io/force-helm-upgrade': 'false',
        },
        creationTimestamp: '2021-04-27T16:20:41Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'coredns',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'j5y9m',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'coredns',
        namespace: 'j5y9m',
        resourceVersion: '294675100',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/coredns',
        uid: '6d241d1f-d9d7-4427-a40a-9f5808c634bf',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'j5y9m-cluster-values',
            namespace: 'j5y9m',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'j5y9m-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'j5y9m-kubeconfig',
            namespace: 'j5y9m',
          },
        },
        name: 'coredns-app',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '1.2.0',
      },
      status: {
        appVersion: '1.6.5',
        release: {
          lastDeployed: '2021-04-27T16:21:26Z',
          status: 'deployed',
        },
        version: '1.2.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:41Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'external-dns',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'j5y9m',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'external-dns',
        namespace: 'j5y9m',
        resourceVersion: '294674847',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/external-dns',
        uid: '9663a04a-3cd8-4532-8659-d7fc9195c1a4',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'j5y9m-cluster-values',
            namespace: 'j5y9m',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'j5y9m-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'j5y9m-kubeconfig',
            namespace: 'j5y9m',
          },
        },
        name: 'external-dns-app',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '2.3.0',
      },
      status: {
        appVersion: 'v0.7.6',
        release: {
          lastDeployed: '2021-04-27T16:21:48Z',
          status: 'deployed',
        },
        version: '2.3.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:41Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'kube-state-metrics',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'j5y9m',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'kube-state-metrics',
        namespace: 'j5y9m',
        resourceVersion: '294674842',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/kube-state-metrics',
        uid: '2e9f0e29-cd70-415c-8691-348f832c7ff6',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'j5y9m-cluster-values',
            namespace: 'j5y9m',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'j5y9m-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'j5y9m-kubeconfig',
            namespace: 'j5y9m',
          },
        },
        name: 'kube-state-metrics-app',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '1.3.0',
      },
      status: {
        appVersion: 'v1.9.7',
        release: {
          lastDeployed: '2021-04-27T16:21:48Z',
          status: 'deployed',
        },
        version: '1.3.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:41Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'metrics-server',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'j5y9m',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'metrics-server',
        namespace: 'j5y9m',
        resourceVersion: '294675096',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/metrics-server',
        uid: '859c4eb1-ece4-4eca-85b2-a4a456b6ae81',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'j5y9m-cluster-values',
            namespace: 'j5y9m',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'j5y9m-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'j5y9m-kubeconfig',
            namespace: 'j5y9m',
          },
        },
        name: 'metrics-server-app',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '1.2.1',
      },
      status: {
        appVersion: '0.4.1',
        release: {
          lastDeployed: '2021-04-27T16:21:37Z',
          status: 'deployed',
        },
        version: '1.2.1',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:42Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'net-exporter',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'j5y9m',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'net-exporter',
        namespace: 'j5y9m',
        resourceVersion: '294674845',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/net-exporter',
        uid: 'af95af8c-c8ce-4032-a317-a6cc1d6b9292',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'j5y9m-cluster-values',
            namespace: 'j5y9m',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'j5y9m-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'j5y9m-kubeconfig',
            namespace: 'j5y9m',
          },
        },
        name: 'net-exporter',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '1.9.2',
      },
      status: {
        appVersion: '1.9.2',
        release: {
          lastDeployed: '2021-04-27T16:21:48Z',
          status: 'deployed',
        },
        version: '1.9.2',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:42Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'node-exporter',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'j5y9m',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'node-exporter',
        namespace: 'j5y9m',
        resourceVersion: '294675090',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/node-exporter',
        uid: '3824fe11-99d1-4613-91be-4cf14d23b492',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'j5y9m-cluster-values',
            namespace: 'j5y9m',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'j5y9m-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'j5y9m-kubeconfig',
            namespace: 'j5y9m',
          },
        },
        name: 'node-exporter-app',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '1.7.1',
      },
      status: {
        appVersion: 'v1.0.1',
        release: {
          lastDeployed: '2021-04-27T16:21:21Z',
          status: 'deployed',
        },
        version: '1.7.1',
      },
    },
  ],
  metadata: {
    resourceVersion: '294675100',
    selfLink: '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/',
  },
};

export const randomCluster2AppsList: applicationv1alpha1.IAppList = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: applicationv1alpha1.AppList,
  items: [
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:44Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'azure-scheduled-events',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'as43z',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'azure-scheduled-events',
        namespace: 'as43z',
        resourceVersion: '294675085',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/as43z/apps/azure-scheduled-events',
        uid: 'c418922f-eddc-4a7b-a081-673356bd6e16',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'as43z-cluster-values',
            namespace: 'as43z',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'as43z-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'as43z-kubeconfig',
            namespace: 'as43z',
          },
        },
        name: 'azure-scheduled-events-app',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '0.4.0',
      },
      status: {
        appVersion: '0.4.0',
        release: {
          lastDeployed: '2021-04-27T16:21:42Z',
          status: 'deployed',
        },
        version: '0.4.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '294674489',
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:41Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'cert-exporter',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'as43z',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'cert-exporter',
        namespace: 'as43z',
        resourceVersion: '294675095',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/as43z/apps/cert-exporter',
        uid: '3daa2782-90cc-4e36-8453-c4a8f7dae10a',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'as43z-cluster-values',
            namespace: 'as43z',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'as43z-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'as43z-kubeconfig',
            namespace: 'as43z',
          },
        },
        name: 'cert-exporter',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '1.6.0',
      },
      status: {
        appVersion: '1.6.0',
        release: {
          lastDeployed: '2021-04-27T16:22:36Z',
          status: 'deployed',
        },
        version: '1.6.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '294674489',
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:41Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'cert-exporter',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'as43z',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'cert-exporter',
        namespace: 'as43z',
        resourceVersion: '294675095',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/as43z/apps/cert-exporter',
        uid: '3daa2782-90cc-4e36-8453-c4a8f7dae10a',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'as43z-cluster-values',
            namespace: 'as43z',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'as43z-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'as43z-kubeconfig',
            namespace: 'as43z',
          },
        },
        name: 'cert-exporter-2',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '1.6.0',
      },
      status: {
        appVersion: '1.6.0',
        release: {
          lastDeployed: '2021-04-27T16:22:36Z',
          status: 'deployed',
        },
        version: '1.6.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '294674489',
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
        },
        creationTimestamp: '2021-04-27T16:20:41Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          app: 'cert-exporter',
          'app-operator.giantswarm.io/version': '3.2.1',
          'giantswarm.io/cluster': 'as43z',
          'giantswarm.io/managed-by': 'cluster-operator',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
        },
        name: 'cert-exporter',
        namespace: 'as43z',
        resourceVersion: '294675095',
        selfLink:
          '/apis/application.giantswarm.io/v1alpha1/namespaces/as43z/apps/cert-exporter',
        uid: '3daa2782-90cc-4e36-8453-c4a8f7dae10a',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'as43z-cluster-values',
            namespace: 'as43z',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: 'as43z-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'as43z-kubeconfig',
            namespace: 'as43z',
          },
        },
        name: 'cert-exporter-3',
        namespace: 'kube-system',
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '1.6.0',
      },
      status: {
        appVersion: '1.6.0',
        release: {
          lastDeployed: '2021-04-27T16:22:36Z',
          status: 'deployed',
        },
        version: '1.6.0',
      },
    },
  ],
  metadata: {
    resourceVersion: '294675100',
    selfLink: '/apis/application.giantswarm.io/v1alpha1/namespaces/as43z/apps/',
  },
};

export const randomCluster3AppsList: applicationv1alpha1.IAppList = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: applicationv1alpha1.AppList,
  items: [],
  metadata: {
    resourceVersion: '294675100',
    selfLink: '/apis/application.giantswarm.io/v1alpha1/namespaces/as43z/apps/',
  },
};

export const randomClusterCAPA1AppsList: applicationv1alpha1.IAppList = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: applicationv1alpha1.AppList,
  metadata: {
    resourceVersion: '71861408',
  },
  items: [
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion":"application.giantswarm.io/v1alpha1","kind":"App","metadata":{"annotations":{},"labels":{"app-operator.giantswarm.io/version":"0.0.0"},"name":"asdf1-default-apps","namespace":"org-org1"},"spec":{"catalog":"cluster","config":{"configMap":{"name":"","namespace":""},"secret":{"name":"","namespace":""}},"kubeConfig":{"context":{"name":""},"inCluster":true,"secret":{"name":"","namespace":""}},"name":"default-apps-aws","namespace":"org-org1","userConfig":{"configMap":{"name":"asdf1-default-apps-userconfig","namespace":"org-org1"}},"version":"0.5.5"}}\n',
        },
        creationTimestamp: '2022-10-10T09:20:55Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app-operator.giantswarm.io/version': '0.0.0',
          'app.kubernetes.io/name': 'default-apps-aws',
          'giantswarm.io/cluster': 'asdf1',
        },
        name: 'asdf1-default-apps',
        namespace: 'org-org1',
        resourceVersion: '62752402',
        uid: '0fb59102-8cd5-4046-ae4d-58b5c93cabfd',
      },
      spec: {
        catalog: 'cluster',
        config: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: '',
          },
          inCluster: true,
          secret: {
            name: '',
            namespace: '',
          },
        },
        name: 'default-apps-aws',
        namespace: 'org-org1',
        userConfig: {
          configMap: {
            name: 'asdf1-default-apps-userconfig',
            namespace: 'org-org1',
          },
        },
        version: '0.5.5',
      },
      status: {
        appVersion: '',
        release: {
          lastDeployed: '2022-10-10T09:20:56Z',
          status: 'deployed',
        },
        version: '0.5.5',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'false',
        },
        creationTimestamp: '2022-10-10T09:20:56Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app-operator.giantswarm.io/version': '0.0.0',
          'app.kubernetes.io/name': 'app-operator',
          'giantswarm.io/cluster': 'asdf1',
          'giantswarm.io/managed-by': 'cluster-apps-operator',
        },
        name: 'asdf1-app-operator',
        namespace: 'org-org1',
        resourceVersion: '62752470',
        uid: '7a4be5b7-244b-4dab-82b5-d91841d2cc04',
      },
      spec: {
        catalog: 'control-plane-catalog',
        config: {
          configMap: {
            name: 'asdf1-app-operator-values',
            namespace: 'org-org1',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        install: {},
        kubeConfig: {
          context: {
            name: '',
          },
          inCluster: true,
          secret: {
            name: '',
            namespace: '',
          },
        },
        name: 'app-operator',
        namespace: 'org-org1',
        namespaceConfig: {},
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '6.4.0',
      },
      status: {
        appVersion: '6.4.0',
        release: {
          lastDeployed: '2022-10-10T09:20:58Z',
          status: 'deployed',
        },
        version: '6.4.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '68103702',
          'app-operator.giantswarm.io/trigger-reconciliation':
            '2022-10-10T09:27:06Z',
          'chart-operator.giantswarm.io/force-helm-upgrade': 'false',
          'meta.helm.sh/release-name': 'asdf1-default-apps',
          'meta.helm.sh/release-namespace': 'org-org1',
        },
        creationTimestamp: '2022-10-10T09:20:56Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app.giantswarm.io/branch': '',
          'app.giantswarm.io/commit': '',
          'app.kubernetes.io/instance': 'asdf1-default-apps',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/name': 'default-apps-aws',
          'app.kubernetes.io/version': '0.5.5',
          'application.giantswarm.io/team': 'hydra',
          'giantswarm.io/cluster': 'asdf1',
          'giantswarm.io/managed-by': 'asdf1-default-apps',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
          'helm.sh/chart': 'default-apps-aws-0.5.5',
        },
        name: 'asdf1-aws-ebs-csi-driver',
        namespace: 'org-org1',
        resourceVersion: '68104716',
        uid: 'ddf02daa-308d-4159-aa5e-2cb0681193e1',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'asdf1-cluster-values',
            namespace: 'org-org1',
          },
        },
        kubeConfig: {
          context: {
            name: 'asdf1-admin@asdf1',
          },
          inCluster: false,
          secret: {
            name: 'asdf1-kubeconfig',
            namespace: 'org-org1',
          },
        },
        name: 'aws-ebs-csi-driver-app',
        namespace: 'kube-system',
        version: '2.16.1',
      },
      status: {
        appVersion: '1.8.0',
        release: {
          lastDeployed: '2022-10-10T14:35:29Z',
          status: 'deployed',
        },
        version: '2.16.1',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '68103702',
          'app-operator.giantswarm.io/trigger-reconciliation':
            '2022-10-10T09:27:06Z',
          'chart-operator.giantswarm.io/force-helm-upgrade': 'false',
          'meta.helm.sh/release-name': 'asdf1-default-apps',
          'meta.helm.sh/release-namespace': 'org-org1',
        },
        creationTimestamp: '2022-10-10T09:20:56Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app.giantswarm.io/branch': '',
          'app.giantswarm.io/commit': '',
          'app.kubernetes.io/instance': 'asdf1-default-apps',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/name': 'default-apps-aws',
          'app.kubernetes.io/version': '0.5.5',
          'application.giantswarm.io/team': 'hydra',
          'giantswarm.io/cluster': 'asdf1',
          'giantswarm.io/managed-by': 'asdf1-default-apps',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
          'helm.sh/chart': 'default-apps-aws-0.5.5',
        },
        name: 'asdf1-capi-node-labeler',
        namespace: 'org-org1',
        resourceVersion: '68104847',
        uid: 'cbaed317-7c31-430f-bb56-cfd4c11823c1',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'asdf1-cluster-values',
            namespace: 'org-org1',
          },
        },
        kubeConfig: {
          context: {
            name: 'asdf1-admin@asdf1',
          },
          inCluster: false,
          secret: {
            name: 'asdf1-kubeconfig',
            namespace: 'org-org1',
          },
        },
        name: 'capi-node-labeler',
        namespace: 'kube-system',
        version: '0.3.4',
      },
      status: {
        appVersion: '0.0.1',
        release: {
          lastDeployed: '2022-10-10T14:35:44Z',
          status: 'deployed',
        },
        version: '0.3.4',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '68103702',
          'app-operator.giantswarm.io/trigger-reconciliation':
            '2022-10-10T09:27:06Z',
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
          'meta.helm.sh/release-name': 'asdf1-default-apps',
          'meta.helm.sh/release-namespace': 'org-org1',
        },
        creationTimestamp: '2022-10-10T09:20:56Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app.giantswarm.io/branch': '',
          'app.giantswarm.io/commit': '',
          'app.kubernetes.io/instance': 'asdf1-default-apps',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/name': 'default-apps-aws',
          'app.kubernetes.io/version': '0.5.5',
          'application.giantswarm.io/team': 'hydra',
          'giantswarm.io/cluster': 'asdf1',
          'giantswarm.io/managed-by': 'asdf1-default-apps',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
          'helm.sh/chart': 'default-apps-aws-0.5.5',
        },
        name: 'asdf1-cert-exporter',
        namespace: 'org-org1',
        resourceVersion: '68104484',
        uid: 'a6971bdd-ce2d-4369-80d6-e351b119213c',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'asdf1-cluster-values',
            namespace: 'org-org1',
          },
        },
        kubeConfig: {
          context: {
            name: 'asdf1-admin@asdf1',
          },
          inCluster: false,
          secret: {
            name: 'asdf1-kubeconfig',
            namespace: 'org-org1',
          },
        },
        name: 'cert-exporter',
        namespace: 'kube-system',
        version: '2.3.0',
      },
      status: {
        appVersion: '2.3.0',
        release: {
          lastDeployed: '2022-10-10T14:35:55Z',
          status: 'deployed',
        },
        version: '2.3.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '68103702',
          'app-operator.giantswarm.io/trigger-reconciliation':
            '2022-10-10T09:27:06Z',
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
          'meta.helm.sh/release-name': 'asdf1-default-apps',
          'meta.helm.sh/release-namespace': 'org-org1',
        },
        creationTimestamp: '2022-10-10T09:20:56Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app.giantswarm.io/branch': '',
          'app.giantswarm.io/commit': '',
          'app.kubernetes.io/instance': 'asdf1-default-apps',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/name': 'default-apps-aws',
          'app.kubernetes.io/version': '0.5.5',
          'application.giantswarm.io/team': 'hydra',
          'giantswarm.io/cluster': 'asdf1',
          'giantswarm.io/managed-by': 'asdf1-default-apps',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
          'helm.sh/chart': 'default-apps-aws-0.5.5',
        },
        name: 'asdf1-cert-manager',
        namespace: 'org-org1',
        resourceVersion: '68104818',
        uid: '5fe08cee-a291-44a5-a5f8-b2363ee80d05',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'asdf1-cluster-values',
            namespace: 'org-org1',
          },
        },
        kubeConfig: {
          context: {
            name: 'asdf1-admin@asdf1',
          },
          inCluster: false,
          secret: {
            name: 'asdf1-kubeconfig',
            namespace: 'org-org1',
          },
        },
        name: 'cert-manager-app',
        namespace: 'kube-system',
        version: '2.15.3',
      },
      status: {
        appVersion: '1.7.3',
        release: {
          lastDeployed: '2022-10-10T14:35:11Z',
          status: 'deployed',
        },
        version: '2.15.3',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'false',
        },
        creationTimestamp: '2022-10-10T09:20:57Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app-operator.giantswarm.io/version': '6.4.0',
          'app.kubernetes.io/name': 'chart-operator',
          'giantswarm.io/cluster': 'asdf1',
          'giantswarm.io/managed-by': 'cluster-apps-operator',
        },
        name: 'asdf1-chart-operator',
        namespace: 'org-org1',
        resourceVersion: '68106032',
        uid: 'f90d0258-ffa1-4362-9b47-59752f7d316f',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'asdf1-cluster-values',
            namespace: 'org-org1',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        install: {},
        kubeConfig: {
          context: {
            name: 'asdf1-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'asdf1-kubeconfig',
            namespace: 'org-org1',
          },
        },
        name: 'chart-operator',
        namespace: 'giantswarm',
        namespaceConfig: {},
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '2.30.0',
      },
      status: {
        appVersion: '2.30.0',
        release: {
          lastDeployed: '2022-10-10T14:35:03Z',
          status: 'deployed',
        },
        version: '2.30.0',
      },
    },
  ],
};

export const randomClusterGCP1AppsList: applicationv1alpha1.IAppList = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: applicationv1alpha1.AppList,
  metadata: {
    resourceVersion: '21664731',
  },
  items: [
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'app-operator.giantswarm.io/latest-configmap-version': '62846797',
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion":"application.giantswarm.io/v1alpha1","kind":"App","metadata":{"annotations":{},"labels":{"app-operator.giantswarm.io/version":"0.0.0","giantswarm.io/cluster":"m317f","giantswarm.io/managed-by":"cluster"},"name":"m317f-default-apps","namespace":"org-org1"},"spec":{"catalog":"cluster","config":{"configMap":{"name":"m317f-cluster-values","namespace":"org-org1"},"secret":{"name":"","namespace":""}},"kubeConfig":{"context":{"name":""},"inCluster":true,"secret":{"name":"","namespace":""}},"name":"default-apps-gcp","namespace":"org-org1","userConfig":{"configMap":{"name":"m317f-default-apps-userconfig","namespace":"org-org1"}},"version":"0.14.3"}}\n',
        },
        creationTimestamp: '2022-11-07T13:44:53Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app-operator.giantswarm.io/version': '0.0.0',
          'app.kubernetes.io/name': 'default-apps-gcp',
          'giantswarm.io/cluster': 'm317f',
          'giantswarm.io/managed-by': 'cluster',
        },
        name: 'm317f-default-apps',
        namespace: 'org-org1',
        resourceVersion: '62846981',
        uid: '7bd478d8-ac8c-4fb6-8a58-f12ae5f3eb30',
      },
      spec: {
        catalog: 'cluster',
        config: {
          configMap: {
            name: 'm317f-cluster-values',
            namespace: 'org-org1',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        kubeConfig: {
          context: {
            name: '',
          },
          inCluster: true,
          secret: {
            name: '',
            namespace: '',
          },
        },
        name: 'default-apps-gcp',
        namespace: 'org-org1',
        userConfig: {
          configMap: {
            name: 'm317f-default-apps-userconfig',
            namespace: 'org-org1',
          },
        },
        version: '0.14.3',
      },
      status: {
        appVersion: '',
        release: {
          lastDeployed: '2022-11-07T13:44:55Z',
          status: 'deployed',
        },
        version: '0.14.3',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'false',
        },
        creationTimestamp: '2022-11-07T13:44:54Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app-operator.giantswarm.io/version': '0.0.0',
          'app.kubernetes.io/name': 'app-operator',
          'giantswarm.io/cluster': 'm317f',
          'giantswarm.io/managed-by': 'cluster-apps-operator',
        },
        name: 'm317f-app-operator',
        namespace: 'org-org1',
        resourceVersion: '62847031',
        uid: '83e7ec91-c1aa-4e42-a09c-bcc935c7e2c9',
      },
      spec: {
        catalog: 'control-plane-catalog',
        config: {
          configMap: {
            name: 'm317f-app-operator-values',
            namespace: 'org-org1',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        install: {},
        kubeConfig: {
          context: {
            name: '',
          },
          inCluster: true,
          secret: {
            name: '',
            namespace: '',
          },
        },
        name: 'app-operator',
        namespace: 'org-org1',
        namespaceConfig: {},
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '6.4.1',
      },
      status: {
        appVersion: '6.4.1',
        release: {
          lastDeployed: '2022-11-07T13:44:58Z',
          status: 'deployed',
        },
        version: '6.4.1',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'false',
        },
        creationTimestamp: '2022-11-07T13:44:54Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app-operator.giantswarm.io/version': '6.4.1',
          'app.kubernetes.io/name': 'chart-operator',
          'giantswarm.io/cluster': 'm317f',
          'giantswarm.io/managed-by': 'cluster-apps-operator',
        },
        name: 'm317f-chart-operator',
        namespace: 'org-org1',
        resourceVersion: '62846996',
        uid: '6035f064-43d2-4eee-8bd4-9ec7d5f75db1',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'm317f-cluster-values',
            namespace: 'org-org1',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        install: {},
        kubeConfig: {
          context: {
            name: 'm317f-kubeconfig',
          },
          inCluster: false,
          secret: {
            name: 'm317f-kubeconfig',
            namespace: 'org-org1',
          },
        },
        name: 'chart-operator',
        namespace: 'giantswarm',
        namespaceConfig: {},
        userConfig: {
          configMap: {
            name: '',
            namespace: '',
          },
          secret: {
            name: '',
            namespace: '',
          },
        },
        version: '2.30.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'false',
          'meta.helm.sh/release-name': 'm317f-default-apps',
          'meta.helm.sh/release-namespace': 'org-org1',
        },
        creationTimestamp: '2022-11-07T13:44:55Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app.giantswarm.io/branch': '',
          'app.giantswarm.io/commit': '',
          'app.kubernetes.io/instance': 'm317f-default-apps',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/name': 'default-apps-gcp',
          'app.kubernetes.io/version': '0.14.3',
          'application.giantswarm.io/team': 'hydra',
          'giantswarm.io/cluster': 'm317f',
          'giantswarm.io/managed-by': 'm317f-default-apps',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
          'helm.sh/chart': 'default-apps-gcp-0.14.3',
        },
        name: 'm317f-capi-node-labeler',
        namespace: 'org-org1',
        resourceVersion: '62847034',
        uid: 'ecce42d3-204a-440b-975f-27236584a2bd',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'm317f-cluster-values',
            namespace: 'org-org1',
          },
        },
        kubeConfig: {
          context: {
            name: 'm317f-admin@m317f',
          },
          inCluster: false,
          secret: {
            name: 'm317f-kubeconfig',
            namespace: 'org-org1',
          },
        },
        name: 'capi-node-labeler',
        namespace: 'kube-system',
        version: '0.3.4',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
          'meta.helm.sh/release-name': 'm317f-default-apps',
          'meta.helm.sh/release-namespace': 'org-org1',
        },
        creationTimestamp: '2022-11-07T13:44:55Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app.giantswarm.io/branch': '',
          'app.giantswarm.io/commit': '',
          'app.kubernetes.io/instance': 'm317f-default-apps',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/name': 'default-apps-gcp',
          'app.kubernetes.io/version': '0.14.3',
          'application.giantswarm.io/team': 'hydra',
          'giantswarm.io/cluster': 'm317f',
          'giantswarm.io/managed-by': 'm317f-default-apps',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
          'helm.sh/chart': 'default-apps-gcp-0.14.3',
        },
        name: 'm317f-cert-exporter',
        namespace: 'org-org1',
        resourceVersion: '62846956',
        uid: 'ba690040-2c80-4eca-abd4-e66571d4318a',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'm317f-cluster-values',
            namespace: 'org-org1',
          },
        },
        kubeConfig: {
          context: {
            name: 'm317f-admin@m317f',
          },
          inCluster: false,
          secret: {
            name: 'm317f-kubeconfig',
            namespace: 'org-org1',
          },
        },
        name: 'cert-exporter',
        namespace: 'kube-system',
        version: '2.3.0',
      },
    },
    {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        annotations: {
          'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
          'meta.helm.sh/release-name': 'm317f-default-apps',
          'meta.helm.sh/release-namespace': 'org-org1',
        },
        creationTimestamp: '2022-11-07T13:44:55Z',
        finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
        generation: 1,
        labels: {
          'app.giantswarm.io/branch': '',
          'app.giantswarm.io/commit': '',
          'app.kubernetes.io/instance': 'm317f-default-apps',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/name': 'default-apps-gcp',
          'app.kubernetes.io/version': '0.14.3',
          'application.giantswarm.io/team': 'hydra',
          'giantswarm.io/cluster': 'm317f',
          'giantswarm.io/managed-by': 'm317f-default-apps',
          'giantswarm.io/organization': 'org1',
          'giantswarm.io/service-type': 'managed',
          'helm.sh/chart': 'default-apps-gcp-0.14.3',
        },
        name: 'm317f-cert-manager',
        namespace: 'org-org1',
        resourceVersion: '62846951',
        uid: 'b1d39adc-a8a9-4335-b179-6b67a7ddcbb5',
      },
      spec: {
        catalog: 'default',
        config: {
          configMap: {
            name: 'm317f-cluster-values',
            namespace: 'org-org1',
          },
        },
        kubeConfig: {
          context: {
            name: 'm317f-admin@m317f',
          },
          inCluster: false,
          secret: {
            name: 'm317f-kubeconfig',
            namespace: 'org-org1',
          },
        },
        name: 'cert-manager-app',
        namespace: 'kube-system',
        version: '2.17.1',
      },
    },
  ],
};

export const randomCluster1AppBundle: applicationv1alpha1.IApp = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: 'App',
  metadata: {
    creationTimestamp: '2022-12-07T12:00:04Z',
    generation: 1,
    labels: {
      'app-operator.giantswarm.io/version': '0.0.0',
      'app.kubernetes.io/name': 'security-pack',
      'giantswarm.io/cluster': 'j5y9m',
    },
    name: 'j5y9m-security-pack',
    namespace: 'j5y9m',
    resourceVersion: '996766191',
    uid: '94732d33-6272-45df-a2a5-dd6068d7ba15',
  },
  spec: {
    catalog: 'giantswarm',
    config: {
      configMap: {
        name: 'j5y9m-cluster-values',
        namespace: 'j5y9m',
      },
    },
    kubeConfig: {
      context: {
        name: 'j5y9m',
      },
      inCluster: true,
      secret: {
        name: 'j5y9m-kubeconfig',
        namespace: 'j5y9m',
      },
    },
    name: 'security-pack',
    namespace: 'j5y9m',
    userConfig: {
      configMap: {
        name: 'j5y9m-security-pack-user-values',
        namespace: 'j5y9m',
      },
    },
    version: '0.9.0',
  },
};
