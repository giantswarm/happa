import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { usePermissionsForApps } from 'MAPI/apps/permissions/usePermissionsForApps';
import { getNamespaceFromOrgName } from 'MAPI/utils';
import { Providers, StatusCodes } from 'model/constants';
import { IOrganizationState } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import nock from 'nock';
import React from 'react';
import { useParams } from 'react-router';
import { SWRConfig } from 'swr';
import * as applicationv1alpha1Mocks from 'test/mockHttpCalls/applicationv1alpha1';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailApps from '../ClusterDetailApps';
import { IAppsPermissions } from '../permissions/types';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailApps>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailApps {...p} />
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

const defaultPermissions: IAppsPermissions = {
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

describe('ClusterDetailApps on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const orgId = 'org1';
  const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
  const namespace = clusterId;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;

    (usePermissionsForApps as jest.Mock).mockReturnValue(defaultPermissions);
    (useParams as jest.Mock).mockReturnValue({
      orgId,
      clusterId,
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays user installed apps', async () => {
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
            specName: 'some-app',
          }),
          generateApp({
            clusterId,
            namespace,
            specName: 'another-app',
          }),
        ],
      });

    render(getComponent({ isClusterApp: false }));

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.getByText('Installed Apps')).toBeInTheDocument();

    const installedApps = screen.getAllByRole('tablist')[0];
    expect(
      within(installedApps).getByLabelText('App name: some-app')
    ).toBeInTheDocument();
    expect(
      within(installedApps).getByLabelText('App name: another-app')
    ).toBeInTheDocument();

    expect(
      within(installedApps).queryByLabelText('App name: cert-exporter')
    ).not.toBeInTheDocument();
    expect(
      within(installedApps).queryByLabelText(
        'App name: azure-scheduled-events-app'
      )
    ).not.toBeInTheDocument();
  });

  it('displays preinstalled apps', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomCluster1AppsList,
        items: [
          ...applicationv1alpha1Mocks.randomCluster1AppsList.items,
          generateApp({
            clusterId,
            namespace,
            specName: 'some-app',
          }),
          generateApp({
            clusterId,
            namespace,
            specName: 'another-app',
          }),
        ],
      });

    render(getComponent({ isClusterApp: false }));

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.getByText('Preinstalled Apps')).toBeInTheDocument();

    const preinstalledApps = screen.getAllByRole('tablist')[1];
    expect(
      within(preinstalledApps).getByLabelText('App name: cert-exporter')
    ).toBeInTheDocument();
    expect(
      within(preinstalledApps).getByLabelText('App name: chart-operator')
    ).toBeInTheDocument();
    expect(
      within(preinstalledApps).getByLabelText('App name: coredns-app')
    ).toBeInTheDocument();
    expect(
      within(preinstalledApps).getByLabelText(
        'App name: azure-scheduled-events-app'
      )
    ).toBeInTheDocument();

    expect(
      within(preinstalledApps).queryByLabelText('App name: some-app')
    ).not.toBeInTheDocument();
    expect(
      within(preinstalledApps).queryByLabelText('App name: another-app')
    ).not.toBeInTheDocument();
  });
});

describe('ClusterDetailApps on CAPA', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const orgId = 'org1';
  const clusterId = capiv1beta1Mocks.randomClusterCAPA1.metadata.name;
  const namespace = getNamespaceFromOrgName(orgId);

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPA;

    (usePermissionsForApps as jest.Mock).mockReturnValue(defaultPermissions);
    (useParams as jest.Mock).mockReturnValue({
      orgId,
      clusterId,
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays user installed apps', async () => {
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
            specName: 'some-app',
          }),
          generateApp({
            clusterId,
            namespace,
            specName: 'another-app',
          }),
        ],
      });

    render(getComponent({ isClusterApp: true }));

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.getByText('Installed Apps')).toBeInTheDocument();

    const installedApps = screen.getAllByRole('tablist')[0];
    expect(
      within(installedApps).getByLabelText('App name: some-app')
    ).toBeInTheDocument();
    expect(
      within(installedApps).getByLabelText('App name: another-app')
    ).toBeInTheDocument();

    expect(
      within(installedApps).queryByLabelText('App name: app-operator')
    ).not.toBeInTheDocument();
    expect(
      within(installedApps).queryByLabelText('App name: aws-ebs-csi-driver-app')
    ).not.toBeInTheDocument();
  });

  it('displays default apps', async () => {
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
            specName: 'some-app',
          }),
          generateApp({
            clusterId,
            namespace,
            specName: 'another-app',
          }),
        ],
      });

    render(getComponent({ isClusterApp: true }));

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.getByText('Default Apps')).toBeInTheDocument();

    const defaultApps = screen.getAllByRole('tablist')[1];
    expect(
      within(defaultApps).getByLabelText('App name: app-operator')
    ).toBeInTheDocument();
    expect(
      within(defaultApps).getByLabelText('App name: chart-operator')
    ).toBeInTheDocument();
    expect(
      within(defaultApps).getByLabelText('App name: default-apps-aws')
    ).toBeInTheDocument();
    expect(
      within(defaultApps).getByLabelText('App name: aws-ebs-csi-driver-app')
    ).toBeInTheDocument();

    expect(
      within(defaultApps).queryByLabelText('App name: some-app')
    ).not.toBeInTheDocument();
    expect(
      within(defaultApps).queryByLabelText('App name: another-app')
    ).not.toBeInTheDocument();
  });
});
