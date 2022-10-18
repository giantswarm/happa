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
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as applicationv1alpha1Mocks from 'test/mockHttpCalls/applicationv1alpha1';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListItem from '../ClusterDetailAppListItem';
import { IAppsPermissions } from '../permissions/types';
import { usePermissionsForAppCatalogEntries } from '../permissions/usePermissionsForAppCatalogEntries';
import { usePermissionsForCatalogs } from '../permissions/usePermissionsForCatalogs';

const defaultPermissions: IAppsPermissions = {
  canGet: true,
  canList: true,
  canUpdate: true,
  canCreate: true,
  canDelete: true,
  canConfigure: true,
};

jest.mock('MAPI/apps/permissions/usePermissionsForCatalogs');
jest.mock('MAPI/apps/permissions/usePermissionsForAppCatalogEntries');

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
  jest.setTimeout(40000);
  beforeAll(() => {
    (usePermissionsForCatalogs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForAppCatalogEntries as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays app name and alias', async () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'some-app',
      name: 'some-app-alias',
    });

    render(getComponent({ app }));

    const appNameWidget = await screen.findByLabelText('App name');
    expect(within(appNameWidget).getByText('some-app')).toBeInTheDocument();

    const appInstalledAsWidget = await screen.findByLabelText('Installed as');
    expect(
      within(appInstalledAsWidget).getByText('some-app-alias')
    ).toBeInTheDocument();
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
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'coredns',
      version: currentVersion,
    });

    render(getComponent({ app }));

    const appVersionWidget = await screen.findByLabelText('Version');
    expect(
      within(appVersionWidget).getByText(currentVersion)
    ).toBeInTheDocument();

    expect(
      await screen.findByText((_content, node) =>
        node ? node.textContent === 'released less than a minute ago' : false
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('includes upstream version 1.6.5')
    ).toBeInTheDocument();
    expect(screen.getByText('(current version)')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Select app version/));

    for (const entry of entryList.items) {
      const row = await screen.findByLabelText(entry.spec.version);
      expect(within(row).getByText(entry.spec.version)).toBeInTheDocument();
      expect(
        within(row).getByText((_content, node) =>
          node ? node.textContent === 'released less than a minute ago' : false
        )
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
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'coredns',
      version: currentVersion,
    });

    render(getComponent({ app }));

    const appVersionWidget = await screen.findByLabelText('Version');
    expect(
      within(appVersionWidget).getByText(currentVersion)
    ).toBeInTheDocument();

    const appVersionSelector = screen.getByLabelText(/Select app version/);
    expect(
      await within(appVersionSelector).findAllByLabelText(
        'no information available'
      )
    ).toHaveLength(2);
    expect(screen.getByText('(current version)')).toBeInTheDocument();
  });

  it('displays a note when app is managed through GitOps', () => {
    (usePermissionsForCatalogs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForAppCatalogEntries as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    const { rerender } = render(getComponent({ app }));

    expect(
      screen.queryByText('Managed through GitOps -')
    ).not.toBeInTheDocument();

    rerender(
      getComponent({
        app: {
          ...app,
          metadata: {
            ...app.metadata,
            labels: {
              ...app.metadata.labels,
              'kustomize.toolkit.fluxcd.io/namespace': 'default',
            },
          },
        },
      })
    );

    expect(screen.getByText('Managed through GitOps -')).toBeInTheDocument();
  });

  it('can upgrade to a newer version', async () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    let app = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'coredns',
      version: '1.2.0',
    });
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
        appsPermissions: defaultPermissions,
        isClusterApp: false,
      })
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Details/ })).not.toBeDisabled()
    );

    fireEvent.click(screen.getByLabelText(/Select app version/));
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

    await waitForElementToBeRemoved(
      () => screen.getByRole('button', { name: /Upgrade/ }),
      { timeout: 10000 }
    );

    await withMarkup(screen.findByText)(
      `${app.metadata.name} on cluster ${app.metadata.namespace} will be upgraded to version ${newVersion}.`
    );
  });

  it('can downgrade to an older version', async () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    let app = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'coredns',
      version: '1.3.0',
    });
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
        appsPermissions: defaultPermissions,
        isClusterApp: false,
      })
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Details/ })).not.toBeDisabled()
    );

    fireEvent.click(screen.getByLabelText(/Select app version/));
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

    await waitForElementToBeRemoved(
      () => screen.getByRole('button', { name: /Downgrade/ }),
      { timeout: 10000 }
    );

    await withMarkup(screen.findByText)(
      `${app.metadata.name} on cluster ${app.metadata.namespace} will be downgraded to version ${newVersion}.`
    );
  });

  it(`does not allow updating an app for a 'read-only' user`, async () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'coredns',
      version: '1.2.0',
    });
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
        appsPermissions: { ...defaultPermissions, canUpdate: false },
        isClusterApp: false,
      })
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Details/ })).not.toBeDisabled()
    );

    fireEvent.click(screen.getByLabelText(/Select app version/));
    fireEvent.click(screen.getByLabelText(newVersion));

    const updateButton = screen.getByRole('button', { name: /Update/ });
    expect(updateButton).toBeDisabled();

    fireEvent.mouseEnter(updateButton);

    expect(
      screen.getByText(
        'For updating this app, you need additional permissions.'
      )
    ).toBeInTheDocument();
  });

  it(`does not allow navigating to an app's details if a user does not have permissions to get the app's catalog entry`, () => {
    (usePermissionsForAppCatalogEntries as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canList: false,
    });

    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    render(getComponent({ app }));

    const detailsButton = screen.getByRole('button', { name: /Details/ });
    expect(detailsButton).toBeDisabled();

    fireEvent.mouseEnter(detailsButton);

    expect(
      screen.getByText(
        'For viewing details of this app, you need additional permissions.'
      )
    ).toBeInTheDocument();
  });

  it('displays the current app catalog', async () => {
    nock(window.config.mapiEndpoint)
      .get(`/apis/application.giantswarm.io/v1alpha1/catalogs/`)
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.defaultCatalogList);

    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    render(getComponent({ app }));

    expect(
      await screen.findByLabelText('App catalog: Default Catalog')
    ).toBeInTheDocument();
  });
});
