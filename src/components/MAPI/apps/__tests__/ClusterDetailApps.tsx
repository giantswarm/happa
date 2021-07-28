import { render, screen, within } from '@testing-library/react';
import sub from 'date-fns/fp/sub';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import { reduceReleaseToComponents } from 'MAPI/releases/utils';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import nock from 'nock';
import React from 'react';
import { AppConstants, StatusCodes } from 'shared/constants';
import { cache, SWRConfig } from 'swr';
import { withMarkup } from 'testUtils/assertUtils';
import * as applicationv1alpha1Mocks from 'testUtils/mockHttpCalls/applicationv1alpha1';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import * as releasev1alpha1Mocks from 'testUtils/mockHttpCalls/releasev1alpha1';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ClusterDetailApps from '../ClusterDetailApps';

function generateApp(
  appName: string,
  specName: string,
  version: string = '1.2.1',
  appVersion: string = '0.4.1'
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
      version,
    },
    status: {
      appVersion,
      release: {
        lastDeployed: '2021-04-27T16:21:37Z',
        status: 'deployed',
      },
      version,
    },
  };
}

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailApps>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <ClusterDetailApps {...p} />
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

describe('ClusterDetailApps', () => {
  const releaseVersion = releasev1alpha1Mocks.v14_1_5.metadata.name.slice(1);

  afterEach(() => {
    cache.clear();
  });

  it('displays loading animations if the apps are still loading', () => {
    render(
      getComponent({
        releaseVersion,
      })
    );

    // eslint-disable-next-line no-magic-numbers
    expect(screen.getAllByLabelText('Loading...').length).toEqual(18);
  });

  it('displays installed apps', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomCluster1AppsList,
        items: [
          generateApp('some-random-app', 'some-random-app', '1.0.0'),
          generateApp('my-app', 'some-random-app', '2.3.5'),
          generateApp('another-app', 'nice-app-bro', '3.4.0'),
        ],
      });

    render(
      getComponent({
        releaseVersion,
      })
    );

    expect(await screen.findByText('some-random-app')).toBeInTheDocument();
    expect(screen.getByText('Chart version: 1.0.0')).toBeInTheDocument();

    expect(screen.getByText('my-app')).toBeInTheDocument();
    expect(screen.getByText('Chart version: 2.3.5')).toBeInTheDocument();

    expect(screen.getByText('another-app')).toBeInTheDocument();
    expect(screen.getByText('Chart version: 3.4.0')).toBeInTheDocument();
  });

  it('displays deleted installed apps', async () => {
    const app = generateApp('some-random-app', 'some-random-app');

    const deletionDate = sub({
      hours: 1,
    })(new Date());
    app.metadata.deletionTimestamp = deletionDate.toISOString();

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomCluster1AppsList,
        items: [app],
      });

    render(
      getComponent({
        releaseVersion,
      })
    );

    expect(await screen.findByText('some-random-app')).toBeInTheDocument();
    expect(
      withMarkup(screen.getByText)('Deleted about 1 hour ago')
    ).toBeInTheDocument();
  });

  it('displays release pre-installed apps', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/release.giantswarm.io/v1alpha1/releases/${releasev1alpha1Mocks.v14_1_5.metadata.name}/`
      )
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.v14_1_5);

    render(
      getComponent({
        releaseVersion,
      })
    );

    const releaseApps = reduceReleaseToComponents(releasev1alpha1Mocks.v14_1_5);

    for (const appName of Object.keys(AppConstants.appMetas)) {
      const app = releaseApps[appName];
      if (!app) continue;

      const wrapper = await screen.findByText(app.name);
      expect(wrapper).toBeInTheDocument();
      expect(within(wrapper).getByText(app.version)).toBeInTheDocument();
    }
  });

  it('displays info about ingress apps if one is not installed', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/release.giantswarm.io/v1alpha1/releases/${releasev1alpha1Mocks.v14_1_5.metadata.name}/`
      )
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.v14_1_5);

    render(
      getComponent({
        releaseVersion,
      })
    );

    expect(
      await screen.findByText(
        /The ingress controller is optional on this cluster./
      )
    ).toBeInTheDocument();
  });
});
