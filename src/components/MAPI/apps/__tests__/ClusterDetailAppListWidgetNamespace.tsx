import { screen } from '@testing-library/react';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import { renderWithTheme } from 'testUtils/renderUtils';

import ClusterDetailAppListWidgetNamespace from '../ClusterDetailAppListWidgetNamespace';

function generateApp(
  name: string = 'some-app',
  version: string = '1.2.1'
): applicationv1alpha1.IApp {
  const namespace = capiv1alpha3Mocks.randomCluster1.metadata.name;

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
        app: name,
        'app-operator.giantswarm.io/version': '3.2.1',
        'giantswarm.io/cluster': namespace,
        'giantswarm.io/managed-by': 'Helm',
        'giantswarm.io/organization': 'org1',
        'giantswarm.io/service-type': 'managed',
      },
      name,
      namespace,
      resourceVersion: '294675096',
      selfLink: `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/${name}`,
      uid: '859c4eb1-ece4-4eca-85b2-a4a456b6ae81',
    },
    spec: {
      catalog: 'default',
      config: {
        configMap: {
          name: `${namespace}-cluster-values`,
          namespace,
        },
        secret: {
          name: '',
          namespace: '',
        },
      },
      kubeConfig: {
        context: {
          name: `${namespace}-kubeconfig`,
        },
        inCluster: false,
        secret: {
          name: `${namespace}-kubeconfig`,
          namespace,
        },
      },
      name,
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

type ComponentProps = React.ComponentPropsWithoutRef<
  typeof ClusterDetailAppListWidgetNamespace
>;

describe('ClusterDetailAppListWidgetNamespace', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailAppListWidgetNamespace, {} as ComponentProps);
  });

  it('displays the app target namespace', () => {
    const app = generateApp();

    renderWithTheme(ClusterDetailAppListWidgetNamespace, {
      app,
    } as ComponentProps);

    expect(
      screen.getByLabelText('App target namespace: giantswarm')
    ).toBeInTheDocument();
  });
});
