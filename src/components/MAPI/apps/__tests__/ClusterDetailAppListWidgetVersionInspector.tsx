import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListWidgetVersionInspector from '../ClusterDetailAppListWidgetVersionInspector';

function generateApp(
  name: string = 'some-app',
  version: string = '1.2.1',
  upstreamVersion: string = '0.4.1'
): applicationv1alpha1.IApp {
  const namespace = capiv1beta1Mocks.randomCluster1.metadata.name;

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
      appVersion: upstreamVersion,
      release: {
        lastDeployed: '2021-04-27T16:21:37Z',
        status,
      },
      version,
    },
  };
}

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailAppListWidgetVersionInspector
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <ClusterDetailAppListWidgetVersionInspector {...p} />
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

describe('ClusterDetailAppListWidgetVersionInspector', () => {
  it('renders without crashing', () => {
    render(getComponent({ onSelectVersion: () => {} }));
  });

  it(`displays the current and upstream versions for a user without permissions to get the app's catalog entry`, () => {
    const currentVersion = '1.2.0';
    const upstreamVerison = '0.1.2';

    render(
      getComponent({
        app: generateApp('coredns', currentVersion, upstreamVerison),
        currentSelectedVersion: currentVersion,
        canListAppCatalogEntries: false,
        onSelectVersion: () => {},
      })
    );

    expect(screen.getByText(currentVersion)).toBeInTheDocument();
    expect(
      screen.getByText(`includes upstream version ${upstreamVerison}`)
    ).toBeInTheDocument();
  });
});
