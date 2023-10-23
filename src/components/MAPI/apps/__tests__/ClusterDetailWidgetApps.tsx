import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { getNamespaceFromOrgName } from 'MAPI/utils';
import { Providers, StatusCodes } from 'model/constants';
import { IOrganizationState } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import nock from 'nock';
import React from 'react';
import { useParams } from 'react-router';
import { SWRConfig } from 'swr';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as applicationv1alpha1Mocks from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailWidgetApps from '../ClusterDetailWidgetApps';
import { IAppsPermissions } from '../permissions/types';
import { usePermissionsForAppCatalogEntries } from '../permissions/usePermissionsForAppCatalogEntries';
import { usePermissionsForApps } from '../permissions/usePermissionsForApps';
import { usePermissionsForCatalogs } from '../permissions/usePermissionsForCatalogs';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWidgetApps>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWidgetApps {...p} />
    </SWRConfig>
  );

  const defaultState: IState = {
    entities: {
      organizations: {
        ...preloginState.entities.organizations,
        items: {
          org1: {
            id: 'org1',
            name: 'org1',
            namespace: 'org-org1',
          },
        },
      } as IOrganizationState,
    } as IState['entities'],
  } as IState;

  return getComponentWithStore(
    Component,
    props,
    defaultState,
    undefined,
    history,
    auth
  );
}

const defaultPermissions = {
  canGet: true,
  canList: true,
  canUpdate: true,
  canCreate: true,
  canDelete: true,
};

const defaultAppsPermissions: IAppsPermissions = {
  canGet: true,
  canList: true,
  canUpdate: true,
  canCreate: true,
  canDelete: true,
  canConfigure: true,
};

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn(),
}));

jest.mock('MAPI/apps/permissions/usePermissionsForApps');
jest.mock('MAPI/apps/permissions/usePermissionsForCatalogs');
jest.mock('MAPI/apps/permissions/usePermissionsForAppCatalogEntries');

describe('ClusterDetailWidgetApps on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const orgId = 'org1';
  const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
  const namespace = clusterId;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;

    (usePermissionsForApps as jest.Mock).mockReturnValue(
      defaultAppsPermissions
    );
    (usePermissionsForCatalogs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForAppCatalogEntries as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (useParams as jest.Mock).mockReturnValue({
      orgId,
      clusterId,
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays loading animations if the cluster is still loading', () => {
    render(getComponent({ isClusterApp: false }));

    expect(screen.getAllByLabelText('Loading...').length).toEqual(3);
  });

  it('displays a placeholder if there are no apps', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomCluster1AppsList,
        items: [],
      });

    render(getComponent({ isClusterApp: false }));
    expect(await screen.findByText('No apps installed')).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        return (
          node?.textContent === 'To find apps to install, browse our apps.'
        );
      })
    ).toBeInTheDocument();
  });

  it('does not display a prompt to install apps if the user does not have permissions to do so', async () => {
    (usePermissionsForApps as jest.Mock).mockReturnValue({
      ...defaultAppsPermissions,
      canCreate: false,
    });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomCluster1AppsList,
        items: [],
      });

    render(getComponent({ isClusterApp: false }));

    expect(await screen.findByText('No apps installed')).toBeInTheDocument();
    expect(
      screen.queryByText((_, node) => {
        return (
          node?.textContent === 'To find apps to install, browse our apps.'
        );
      })
    ).not.toBeInTheDocument();
  });

  it('displays stats about the apps installed in the cluster', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomCluster1AppsList,
        items: [
          ...applicationv1alpha1Mocks.randomCluster1AppsList.items,
          generateApp({ clusterId, namespace }),
          generateApp({ clusterId, namespace }),
          generateApp({ clusterId, namespace, status: 'not-deployed' }),
          generateApp({ clusterId, namespace }),
          generateApp({ clusterId, namespace }),
          generateApp({ clusterId, namespace }),
        ],
      });

    render(getComponent({ isClusterApp: false }));

    expect(
      await screen.findByLabelText(
        `${
          applicationv1alpha1Mocks.randomCluster1AppsList.items.length + 6
        } app resources`
      )
    ).toBeInTheDocument();
    expect(await screen.findByLabelText('1 not deployed')).toBeInTheDocument();
  });

  it('displays the number of upgradable apps', async () => {
    nock(window.config.mapiEndpoint)
      .get(`/apis/application.giantswarm.io/v1alpha1/catalogs/`)
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.defaultCatalogList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomCluster1AppsList,
        items: [
          generateApp({
            clusterId,
            namespace,
            specName: 'coredns-app',
            status: 'deployed',
            version: '1.2.0',
          }),
          generateApp({
            clusterId,
            namespace,
            specName: 'coredns-app',
            status: 'deployed',
            version: '1.3.0',
          }),
        ],
      });

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/application.giantswarm.io/v1alpha1/namespaces/default/appcatalogentries/?labelSelector=app.kubernetes.io%2Fname%3Dcoredns-app%2Capplication.giantswarm.io%2Fcatalog%3Ddefault'
      )
      .times(2)
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList
      );

    render(getComponent({ isClusterApp: false }));

    expect(
      await screen.findByLabelText('1 upgrade available')
    ).toBeInTheDocument();
  });

  it('does not display the number of upgradable apps if the user does not have permissions to get catalog resources', async () => {
    (usePermissionsForCatalogs as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canList: false,
    });
    (usePermissionsForAppCatalogEntries as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canList: false,
    });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomCluster1AppsList,
        items: [
          generateApp({
            clusterId,
            namespace,
            specName: 'coredns-app',
            status: 'deployed',
            version: '1.2.0',
          }),
          generateApp({
            clusterId,
            namespace,
            specName: 'coredns-app',
            status: 'deployed',
            version: '1.3.0',
          }),
        ],
      });

    render(getComponent({ isClusterApp: false }));

    expect(
      await screen.findByLabelText('upgrades available not available')
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetApps on CAPA', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const orgId = 'org1';
  const clusterId = capiv1beta1Mocks.randomClusterCAPA1.metadata.name;
  const namespace = getNamespaceFromOrgName(orgId);

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPA;

    (usePermissionsForApps as jest.Mock).mockReturnValue(
      defaultAppsPermissions
    );
    (usePermissionsForCatalogs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForAppCatalogEntries as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (useParams as jest.Mock).mockReturnValue({
      orgId,
      clusterId,
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays loading animations if the cluster is still loading', () => {
    render(getComponent({ isClusterApp: true }));

    expect(screen.getAllByLabelText('Loading...').length).toEqual(3);
  });

  it('displays a placeholder if there are no apps', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/?labelSelector=giantswarm.io%2Fcluster%3D${clusterId}`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomClusterCAPA1AppsList,
        items: [],
      });

    render(getComponent({ isClusterApp: true }));
    expect(await screen.findByText('No apps installed')).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        return (
          node?.textContent === 'To find apps to install, browse our apps.'
        );
      })
    ).toBeInTheDocument();
  });

  it('does not display a prompt to install apps if the user does not have permissions to do so', async () => {
    (usePermissionsForApps as jest.Mock).mockReturnValue({
      ...defaultAppsPermissions,
      canCreate: false,
    });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/?labelSelector=giantswarm.io%2Fcluster%3D${clusterId}`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomClusterCAPA1AppsList,
        items: [],
      });

    render(getComponent({ isClusterApp: true }));

    expect(await screen.findByText('No apps installed')).toBeInTheDocument();
    expect(
      screen.queryByText((_, node) => {
        return (
          node?.textContent === 'To find apps to install, browse our apps.'
        );
      })
    ).not.toBeInTheDocument();
  });

  it('displays stats about the apps installed in the cluster', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/?labelSelector=giantswarm.io%2Fcluster%3D${clusterId}`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomClusterCAPA1AppsList,
        items: [
          ...applicationv1alpha1Mocks.randomClusterCAPA1AppsList.items,
          generateApp({ clusterId, namespace }),
          generateApp({ clusterId, namespace }),
          generateApp({ clusterId, namespace, status: 'not-deployed' }),
          generateApp({ clusterId, namespace }),
          generateApp({ clusterId, namespace }),
          generateApp({ clusterId, namespace }),
        ],
      });

    render(getComponent({ isClusterApp: true }));

    expect(
      await screen.findByLabelText(
        `${
          applicationv1alpha1Mocks.randomClusterCAPA1AppsList.items.length + 6
        } app resources`
      )
    ).toBeInTheDocument();
    expect(await screen.findByLabelText('1 not deployed')).toBeInTheDocument();
  });

  it('displays the number of upgradable apps', async () => {
    nock(window.config.mapiEndpoint)
      .get(`/apis/application.giantswarm.io/v1alpha1/catalogs/`)
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.defaultCatalogList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/?labelSelector=giantswarm.io%2Fcluster%3D${clusterId}`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomClusterCAPA1AppsList,
        items: [
          ...applicationv1alpha1Mocks.randomClusterCAPA1AppsList.items,
          generateApp({
            clusterId,
            namespace,
            specName: 'coredns-app',
            status: 'deployed',
            version: '1.2.0',
          }),
          generateApp({
            clusterId,
            namespace,
            specName: 'coredns-app',
            status: 'deployed',
            version: '1.3.0',
          }),
        ],
      });

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/application.giantswarm.io/v1alpha1/namespaces/default/appcatalogentries/?labelSelector=app.kubernetes.io%2Fname%3Dcoredns-app%2Capplication.giantswarm.io%2Fcatalog%3Ddefault'
      )
      .times(2)
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList
      );

    render(getComponent({ isClusterApp: true }));

    expect(
      await screen.findByLabelText('1 upgrade available')
    ).toBeInTheDocument();
  });

  it('does not display the number of upgradable apps if the user does not have permissions to get catalog resources', async () => {
    (usePermissionsForCatalogs as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canList: false,
    });
    (usePermissionsForAppCatalogEntries as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canList: false,
    });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/?labelSelector=giantswarm.io%2Fcluster%3D${clusterId}`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomClusterCAPA1AppsList,
        items: [
          generateApp({
            clusterId,
            namespace,
            specName: 'coredns-app',
            status: 'deployed',
            version: '1.2.0',
          }),
          generateApp({
            clusterId,
            namespace,
            specName: 'coredns-app',
            status: 'deployed',
            version: '1.3.0',
          }),
        ],
      });

    render(getComponent({ isClusterApp: true }));

    expect(
      await screen.findByLabelText('upgrades available not available')
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetApps on CAPA EKS', () => {});
