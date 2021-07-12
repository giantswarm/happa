import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { cache, SWRConfig } from 'swr';
import { generateRandomString } from 'testUtils/mockHttpCalls';
import * as applicationv1alpha1Mocks from 'testUtils/mockHttpCalls/applicationv1alpha1';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ClusterDetailWidgetApps from '../ClusterDetailWidgetApps';

function generateApp(
  specName: string = 'some-app',
  status = 'deployed' as 'deployed' | 'not-deployed'
): applicationv1alpha1.IApp {
  const appName = generateRandomString();
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
        app: appName,
        'app-operator.giantswarm.io/version': '3.2.1',
        'giantswarm.io/cluster': namespace,
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
      version: '1.2.1',
    },
    status: {
      appVersion: '0.4.1',
      release: {
        lastDeployed: '2021-04-27T16:21:37Z',
        status,
      },
      version: '1.2.1',
    },
  };
}

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWidgetApps>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <ClusterDetailWidgetApps {...p} />
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

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn().mockReturnValue({
    orgId: 'org1',
    clusterId: capiv1alpha3Mocks.randomCluster1.metadata.name,
  }),
}));

describe('ClusterDetailWidgetApps', () => {
  afterEach(() => {
    cache.clear();
  });

  it('displays loading animations if the cluster is still loading', () => {
    render(getComponent({}));

    expect(screen.getAllByLabelText('Loading...').length).toEqual(3);
  });

  it('displays a placeholder if there are no apps', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'application.giantswarm.io/v1alpha1',
        kind: applicationv1alpha1.AppList,
        items: [],
        metadata: {
          resourceVersion: '294675100',
          selfLink:
            '/apis/application.giantswarm.io/v1alpha1/namespaces/j5y9m/apps/',
        },
      });

    render(getComponent({}));

    expect(await screen.findByText('No apps installed')).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        return (
          node?.textContent === 'To find apps to install, browse our apps.'
        );
      })
    ).toBeInTheDocument();
  });

  it('displays stats about the apps installed in the cluster', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomCluster1AppsList,
        items: [
          ...applicationv1alpha1Mocks.randomCluster1AppsList.items,
          generateApp('some-random-app'),
          generateApp(),
          generateApp(undefined, 'not-deployed'),
          generateApp(),
          generateApp('some-random-app'),
          generateApp(),
        ],
      });

    render(getComponent({}));

    expect(await screen.findByLabelText('6 apps')).toBeInTheDocument();
    expect(await screen.findByLabelText('2 unique apps')).toBeInTheDocument();
    expect(await screen.findByLabelText('5 deployed')).toBeInTheDocument();
  });
});
