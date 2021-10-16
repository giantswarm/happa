import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { Accordion } from 'grommet';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { SWRConfig } from 'swr';
import { withMarkup } from 'testUtils/assertUtils';
import * as applicationv1alpha1Mocks from 'testUtils/mockHttpCalls/applicationv1alpha1';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ClusterDetailAppListItem from '../ClusterDetailAppListItem';

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
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailAppListItem>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <Accordion activeIndex={0}>
        <ClusterDetailAppListItem {...p} />
      </Accordion>
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

describe('ClusterDetailAppListItem', () => {
  // eslint-disable-next-line no-magic-numbers
  jest.setTimeout(20000);

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays various information about the supported app versions', async () => {
    const entryList = Object.assign(
      {},
      applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList,
      {
        items:
          applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList.items.map(
            (entry) => ({
              ...entry,
              spec: {
                ...entry.spec,
                dateCreated: new Date().toISOString(),
              },
            })
          ),
      }
    );

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=app.kubernetes.io%2Fname%3Dcoredns%2Capplication.giantswarm.io%2Fcatalog%3Ddefault'
      )
      .reply(StatusCodes.Ok, entryList);

    const currentVersion = '1.2.0';

    render(
      getComponent({
        app: generateApp('coredns', currentVersion),
      })
    );

    const appVersionWidget = await screen.findByLabelText('Version');
    expect(
      within(appVersionWidget).getByText(currentVersion)
    ).toBeInTheDocument();

    expect(
      await screen.findByText('released less than a minute ago')
    ).toBeInTheDocument();
    expect(
      screen.getByText('includes upstream version 1.6.5')
    ).toBeInTheDocument();
    expect(screen.getByText('(current version)')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Select app version'));

    for (const entry of entryList.items) {
      const row = await screen.findByLabelText(entry.spec.version);
      expect(within(row).getByText(entry.spec.version)).toBeInTheDocument();
      expect(
        within(row).getByText('released less than a minute ago')
      ).toBeInTheDocument();
      expect(
        within(row).getByText(
          `includes upstream version ${entry.spec.appVersion}`
        )
      ).toBeInTheDocument();

      if (entry.spec.version === currentVersion) {
        expect(within(row).getByText('(current version)')).toBeInTheDocument();
      } else {
        expect(
          within(row).queryByText('(current version)')
        ).not.toBeInTheDocument();
      }
    }
  });

  it('displays current version even if it is not in the list of supported versions', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=app.kubernetes.io%2Fname%3Dcoredns%2Capplication.giantswarm.io%2Fcatalog%3Ddefault'
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList
      );

    const currentVersion = '1.2.0-dev';

    render(
      getComponent({
        app: generateApp('coredns', currentVersion),
      })
    );

    const appVersionWidget = await screen.findByLabelText('Version');
    expect(
      within(appVersionWidget).getByText(currentVersion)
    ).toBeInTheDocument();

    const appVersionSelector = screen.getByLabelText('Select app version');
    expect(
      await within(appVersionSelector).findAllByLabelText(
        'no information available'
      )
    ).toHaveLength(2);
    expect(screen.getByText('(current version)')).toBeInTheDocument();
  });

  it('can upgrade to a newer version', async () => {
    let app = generateApp('coredns', '1.2.0');
    const newVersion = '1.3.0';

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=app.kubernetes.io%2Fname%3D${app.metadata.name}%2Capplication.giantswarm.io%2Fcatalog%3D${app.spec.catalog}`
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList
      );

    render(
      getComponent({
        app,
      })
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Details/ })).not.toBeDisabled()
    );

    fireEvent.click(screen.getByLabelText('Select app version'));
    fireEvent.click(screen.getByLabelText(newVersion));

    const updateButton = screen.getByRole('button', { name: /Update/ });
    expect(updateButton).not.toBeDisabled();
    fireEvent.click(updateButton);

    await withMarkup(screen.findByText)(
      `Are you sure that you want to switch the ${app.metadata.name} version in cluster ${app.metadata.namespace} from version ${app.spec.version} to ${newVersion}?`
    );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    app = {
      ...app,
      spec: { ...app.spec, version: newVersion },
    };

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`,
        app as unknown as nock.DataMatcherMap
      )
      .reply(StatusCodes.Ok, app);

    fireEvent.click(screen.getByRole('button', { name: /Upgrade/ }));

    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', { name: /Upgrade/ })
    );

    await withMarkup(screen.findByText)(
      `${app.metadata.name} on cluster ${app.metadata.namespace} will be upgraded to version ${newVersion}.`
    );
  });

  it('can downgrade to an older version', async () => {
    let app = generateApp('coredns', '1.3.0');
    const newVersion = '1.2.0';

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=app.kubernetes.io%2Fname%3D${app.metadata.name}%2Capplication.giantswarm.io%2Fcatalog%3D${app.spec.catalog}`
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList
      );

    render(
      getComponent({
        app,
      })
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Details/ })).not.toBeDisabled()
    );

    fireEvent.click(screen.getByLabelText('Select app version'));
    fireEvent.click(screen.getByLabelText(newVersion));

    const updateButton = screen.getByRole('button', { name: /Update/ });
    expect(updateButton).not.toBeDisabled();
    fireEvent.click(updateButton);

    await withMarkup(screen.findByText)(
      `Are you sure that you want to switch the ${app.metadata.name} version in cluster ${app.metadata.namespace} from version ${app.spec.version} to ${newVersion}?`
    );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    app = {
      ...app,
      spec: { ...app.spec, version: newVersion },
    };

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`,
        app as unknown as nock.DataMatcherMap
      )
      .reply(StatusCodes.Ok, app);

    fireEvent.click(screen.getByRole('button', { name: /Downgrade/ }));

    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', { name: /Downgrade/ })
    );

    await withMarkup(screen.findByText)(
      `${app.metadata.name} on cluster ${app.metadata.namespace} will be downgraded to version ${newVersion}.`
    );
  });
});
