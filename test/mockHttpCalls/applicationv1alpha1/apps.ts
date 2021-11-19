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
