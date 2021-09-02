import { screen } from '@testing-library/react';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import { renderWithTheme } from 'testUtils/renderUtils';

import ClusterDetailAppListWidgetStatus from '../ClusterDetailAppListWidgetStatus';

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
  typeof ClusterDetailAppListWidgetStatus
>;

describe('ClusterDetailAppListWidgetStatus', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailAppListWidgetStatus, {} as ComponentProps);
  });

  it('displays the app status', () => {
    const app = generateApp();
    app.status!.release.status = 'deployed';

    renderWithTheme(ClusterDetailAppListWidgetStatus, {
      app,
    } as ComponentProps);

    expect(screen.getByLabelText('App status: deployed')).toBeInTheDocument();
  });

  it(`displays a 'n/a' label if the app status is not there`, () => {
    const app = generateApp();
    delete app.status!.release.status;

    renderWithTheme(ClusterDetailAppListWidgetStatus, {
      app,
    } as ComponentProps);

    expect(
      screen.getByLabelText('no information available')
    ).toBeInTheDocument();
  });
});
