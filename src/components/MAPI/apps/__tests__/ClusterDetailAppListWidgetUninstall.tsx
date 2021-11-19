import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { withMarkup } from 'test/assertUtils';
import { getComponentWithStore } from 'test/renderUtils';

import ClusterDetailAppListWidgetUninstall from '../ClusterDetailAppListWidgetUninstall';

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailAppListWidgetUninstall
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <ClusterDetailAppListWidgetUninstall {...p} />
  );

  return getComponentWithStore(
    Component,
    props,
    undefined,
    undefined,
    history,
    auth
  );
}

function generateApp(
  name: string = 'some-app',
  namespace: string = 'j5y9m'
): applicationv1alpha1.IApp {
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
      version: '0.4.1',
    },
    status: {
      appVersion: '0.4.1',
      release: {
        lastDeployed: '2021-04-27T16:21:37Z',
        status,
      },
      version: '0.4.1',
    },
  };
}

describe('ClusterDetailAppWidgetUninstall', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays the button to uninstall an app', () => {
    const app = generateApp();
    render(getComponent({ app }));
    expect(
      screen.getByRole('button', {
        name: /Uninstall/,
      })
    ).toBeInTheDocument();
  });

  it('displays the confirmation for uninstalling an app when the uninstall button is clicked', () => {
    const app = generateApp();

    render(getComponent({ app }));

    const uninstallButton = screen.getByRole('button', {
      name: /Uninstall/,
    });
    fireEvent.click(uninstallButton);

    expect(
      withMarkup(screen.getByText)(
        `Are you sure you want to uninstall ${app.metadata.name} from cluster ${app.metadata.namespace}?`
      )
    ).toBeInTheDocument();
  });

  it('uninstalls an app', async () => {
    const app = generateApp();

    render(getComponent({ app }));

    const uninstallButton = screen.getByRole('button', {
      name: /Uninstall/,
    });
    fireEvent.click(uninstallButton);

    await withMarkup(screen.findByText)(
      `Are you sure you want to uninstall ${app.metadata.name} from cluster ${app.metadata.namespace}?`
    );

    const confirmUninstallButton = screen.getByRole('button', {
      name: 'Uninstall',
    });
    fireEvent.click(confirmUninstallButton);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    nock(window.config.mapiEndpoint)
      .delete(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Resource deleted.',
        status: metav1.K8sStatuses.Success,
        reason: '',
        code: StatusCodes.Ok,
      });

    expect(
      await withMarkup(screen.findByText)(
        `App ${app.metadata.name} will be uninstalled from cluster ${app.metadata.namespace}.`
      )
    ).toBeInTheDocument();
  });
});
