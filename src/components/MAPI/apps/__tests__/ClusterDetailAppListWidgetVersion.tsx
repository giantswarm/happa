import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as applicationv1alpha1Mocks from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListWidgetVersion from '../ClusterDetailAppListWidgetVersion';

function generateApp(
  name: string = 'some-app',
  version: string = '1.2.1'
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
      appVersion: '0.4.1',
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
    typeof ClusterDetailAppListWidgetVersion
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailAppListWidgetVersion {...p} />
    </SWRConfig>
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

describe('ClusterDetailAppListWidgetVersion', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays the current app version', () => {
    const app = generateApp('some-app', '1.2.3');

    render(getComponent({ app, canListAppCatalogEntries: true }));

    expect(screen.getByLabelText('App version: 1.2.3')).toBeInTheDocument();
  });

  it('displays if the app is switching versions', () => {
    const app = generateApp('some-app', '1.2.3');
    app.spec.version = '1.3.0';

    render(getComponent({ app, canListAppCatalogEntries: true }));

    expect(screen.getByLabelText('App version: 1.2.3')).toBeInTheDocument();
    expect(screen.getByText('Switching to 1.3.0')).toBeInTheDocument();
  });

  it('displays the spec version if there is no status', () => {
    const app = generateApp('some-app', '1.2.3');
    delete app.status;

    render(getComponent({ app, canListAppCatalogEntries: true }));

    expect(screen.getByLabelText('App version: 1.2.3')).toBeInTheDocument();
  });

  it('displays the spec version if there is no status', () => {
    const app = generateApp('some-app', '1.2.3');
    delete app.status;

    render(getComponent({ app, canListAppCatalogEntries: true }));

    expect(screen.getByLabelText('App version: 1.2.3')).toBeInTheDocument();
  });

  it('displays a warning if a newer version is available', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=app.kubernetes.io%2Fname%3Dcoredns-app%2Capplication.giantswarm.io%2Fcatalog%3Ddefault'
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList
      );

    const app = generateApp('coredns-app', '1.1.0');
    delete app.status;

    render(getComponent({ app, canListAppCatalogEntries: true }));

    expect(screen.getByLabelText('App version: 1.1.0')).toBeInTheDocument();

    expect(await screen.findByText('Upgrade available')).toBeInTheDocument();
  });
});
