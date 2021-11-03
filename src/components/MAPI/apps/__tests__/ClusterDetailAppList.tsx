import { render, screen } from '@testing-library/react';
import sub from 'date-fns/fp/sub';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'testUtils/assertUtils';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import {
  getComponentWithStore,
  getComponentWithTheme,
  renderWithTheme,
} from 'testUtils/renderUtils';

import ClusterDetailAppList from '../ClusterDetailAppList';

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
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailAppList>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailAppList {...p} />
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

describe('ClusterDetailAppList', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailAppList, {
      apps: [],
    });
  });

  it('displays loading animations', () => {
    const { rerender } = render(
      getComponent({
        apps: [],
        isLoading: true,
      })
    );

    expect(screen.getAllByLabelText('Loading...')).toHaveLength(6);

    rerender(
      getComponentWithTheme(ClusterDetailAppList, {
        apps: [],
        isLoading: false,
      })
    );

    expect(screen.queryAllByLabelText('Loading...')).toHaveLength(0);
  });

  it('displays a placeholder if there are no apps', () => {
    render(
      getComponent({
        apps: [],
        isLoading: false,
      })
    );

    expect(
      screen.getByText('No apps installed on this cluster')
    ).toBeInTheDocument();
  });

  it('displays the error message if it is provided', () => {
    render(
      getComponent({
        apps: [],
        isLoading: false,
        errorMessage: 'Something went wrong',
      })
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays basic app information when the apps are collapsed', () => {
    render(
      getComponent({
        apps: [
          generateApp('some-app', '1.3.0'),
          generateApp('some-other-app', '2.3.1'),
          generateApp('random-app', '5.0.0'),
        ],
        isLoading: false,
      })
    );

    expect(screen.getByLabelText('App name: some-app')).toBeInTheDocument();
    expect(screen.getByLabelText('App version: 1.3.0')).toBeInTheDocument();

    expect(
      screen.getByLabelText('App name: some-other-app')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('App version: 2.3.1')).toBeInTheDocument();

    expect(screen.getByLabelText('App name: random-app')).toBeInTheDocument();
    expect(screen.getByLabelText('App version: 5.0.0')).toBeInTheDocument();
  });

  it('displays apps in a different state if they have been deleted', () => {
    const deletedApp = generateApp('some-other-app', '2.3.1');

    const deletionDate = sub({
      hours: 1,
    })(new Date());
    deletedApp.metadata.deletionTimestamp = deletionDate.toISOString();

    render(
      getComponent({
        apps: [deletedApp],
        isLoading: false,
      })
    );

    expect(screen.getByText('some-other-app')).toBeInTheDocument();
    expect(
      withMarkup(screen.getByText)('Deleted about 1 hour ago')
    ).toBeInTheDocument();
  });
});
