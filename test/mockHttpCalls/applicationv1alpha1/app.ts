import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { generateRandomString } from 'test/mockHttpCalls';

export function generateApp(
  clusterId: string,
  namespace: string,
  specName: string = 'some-app',
  status = 'deployed' as 'deployed' | 'not-deployed',
  version: string = '1.0.1'
): applicationv1alpha1.IApp {
  const appName = generateRandomString();

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
      catalogNamespace: 'default',
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
      name: specName,
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
      appVersion: '0.4.1',
      release: {
        lastDeployed: '2021-04-27T16:21:37Z',
        status,
      },
      version,
    },
  };
}
