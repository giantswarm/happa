import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { generateRandomString } from 'test/mockHttpCalls';

export function generateApp({
  clusterId,
  namespace,
  name,
  specName,
  status = 'deployed',
  version = '1.0.1',
  upstreamVersion = '0.4.1',
}: {
  clusterId: string;
  namespace: string;
  name?: string;
  specName?: string;
  status?: 'deployed' | 'not-deployed';
  version?: string;
  upstreamVersion?: string;
}): applicationv1alpha1.IApp {
  const appSpecName = specName ?? generateRandomString();
  const appName = name ?? appSpecName;

  return {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'App',
    metadata: {
      annotations: {
        'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
      },
      creationTimestamp: new Date().toISOString(),
      finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
      generation: 1,
      labels: {
        app: appName,
        'app-operator.giantswarm.io/version': '3.2.1',
        'giantswarm.io/cluster': clusterId,
        'giantswarm.io/managed-by': 'Helm',
        'giantswarm.io/organization': 'org1',
        'giantswarm.io/service-type': 'managed',
      },
      name: appName,
      namespace,
      resourceVersion: '294675096',
      selfLink: `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/${appName}`,
      uid: '859c4eb1-ece4-4eca-85b2-a4a456b6ae81',
    },
    spec: {
      catalog: 'default',
      // catalogNamespace: 'default',
      config: {
        configMap: {
          name: `${clusterId}-cluster-values`,
          namespace,
        },
        secret: {
          name: '',
          namespace: '',
        },
      },
      kubeConfig: {
        context: {
          name: `${clusterId}-kubeconfig`,
        },
        inCluster: false,
        secret: {
          name: `${clusterId}-kubeconfig`,
          namespace,
        },
      },
      name: appSpecName,
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
      version,
    },
    status: {
      appVersion: upstreamVersion,
      release: {
        lastDeployed: '2021-04-27T16:21:37Z',
        status,
      },
      version,
    },
  };
}
