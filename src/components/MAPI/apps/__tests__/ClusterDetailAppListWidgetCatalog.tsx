import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as applicationv1alpha1Mocks from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListWidgetCatalog from '../ClusterDetailAppListWidgetCatalog';

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

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailAppListWidgetCatalog
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailAppListWidgetCatalog {...p} />
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

describe('ClusterDetailAppListWidgetCatalog', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays the current app catalog', async () => {
    const catalog = applicationv1alpha1Mocks.defaultAppCatalog;
    const defaultCatalog = applicationv1alpha1Mocks.defaultCatalogList;
    const giantswarmCatalog = applicationv1alpha1Mocks.giantswarmCatalogList;

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/default/catalogs/`
      )
      .reply(StatusCodes.Ok, defaultCatalog);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/giantswarm/catalogs/`
      )
      .reply(StatusCodes.Ok, giantswarmCatalog);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${catalog.metadata.namespace}/catalogs/${catalog.metadata.name}/`
      )
      .reply(StatusCodes.Ok, catalog);

    const app = generateApp('some-app', '1.2.3');

    render(getComponent({ app, canReadCatalogs: true }));

    expect(
      await screen.findByLabelText('App catalog: Default Catalog')
    ).toBeInTheDocument();
  });

  it('displays if the catalog is managed or not', async () => {
    const catalog = applicationv1alpha1Mocks.giantswarmAppCatalog;
    const defaultCatalog = applicationv1alpha1Mocks.defaultCatalogList;
    const giantswarmCatalog = applicationv1alpha1Mocks.giantswarmCatalogList;

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/default/catalogs/`
      )
      .reply(StatusCodes.Ok, defaultCatalog);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/giantswarm/catalogs/`
      )
      .reply(StatusCodes.Ok, giantswarmCatalog);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${catalog.metadata.namespace}/catalogs/${catalog.metadata.name}/`
      )
      .reply(StatusCodes.Ok, catalog);

    const app = generateApp('some-app', '1.2.3');
    app.spec.catalog = 'giantswarm';

    render(getComponent({ app, canReadCatalogs: true }));

    expect(
      await screen.findByLabelText('App catalog: Giant Swarm Catalog')
    ).toBeInTheDocument();

    expect(screen.getByText(/managed/i)).toBeInTheDocument();
  });
});
