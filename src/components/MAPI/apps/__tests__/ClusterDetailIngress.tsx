import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { IAppsPermissions } from 'MAPI/apps/permissions/types';
import { usePermissionsForApps } from 'MAPI/apps/permissions/usePermissionsForApps';
import { getNamespaceFromOrgName } from 'MAPI/utils';
import {
  Constants,
  ProviderFlavors,
  Providers,
  StatusCodes,
} from 'model/constants';
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

import ClusterDetailIngress from '../ClusterDetailIngress';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailIngress>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailIngress {...p} />
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

describe('ClusterDetailIngress', () => {
  const orgId = 'org1';
  const cluster = capiv1beta1Mocks.randomCluster1;
  const clusterId = cluster.metadata.name;

  beforeAll(() => {
    (usePermissionsForApps as jest.Mock).mockReturnValue(defaultPermissions);
    (useParams as jest.Mock).mockReturnValue({
      orgId,
      clusterId,
    });
  });

  it('displays loading note if the app list is still loading', () => {
    render(
      getComponent({
        cluster: cluster,
        isClusterApp: false,
      })
    );

    expect(
      screen.getByText('Loading ingress information…')
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailIngress on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;
  const orgId = 'org1';
  const cluster = capiv1beta1Mocks.randomCluster1;
  const clusterId = cluster.metadata.name;
  const namespace = clusterId;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;
    window.config.info.general.providerFlavor = ProviderFlavors.VINTAGE;

    (usePermissionsForApps as jest.Mock).mockReturnValue(defaultPermissions);
    (useParams as jest.Mock).mockReturnValue({
      orgId,
      clusterId,
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
    window.config.info.general.providerFlavor = providerFlavor;
  });

  it('displays instructions with correct API endpoints', async () => {
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
            specName: Constants.INSTALL_INGRESS_TAB_APP_NAME,
          }),
        ],
      });

    render(
      getComponent({
        cluster,
        isClusterApp: false,
      })
    );

    if (screen.queryAllByText('Loading ingress information…').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading ingress information…')
      );
    }

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.getByLabelText('Base domain:')).toHaveTextContent(
      '.j5y9m.k8s.test.gigantic.io'
    );
    expect(screen.getByLabelText('Load balancer DNS name:')).toHaveTextContent(
      'ingress.j5y9m.k8s.test.gigantic.io'
    );
    expect(screen.getByLabelText('Hostname pattern:')).toHaveTextContent(
      'YOUR_PREFIX.j5y9m.k8s.test.gigantic.io'
    );
  });
});

describe('ClusterDetailIngress on GCP', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;
  const mapiAudience = window.config.mapiAudience;
  const orgId = 'org1';
  const cluster = capiv1beta1Mocks.randomClusterGCP1;
  const clusterId = cluster.metadata.name;
  const namespace = getNamespaceFromOrgName(orgId);

  beforeAll(() => {
    window.config.info.general.provider = Providers.GCP;
    window.config.info.general.providerFlavor = ProviderFlavors.CAPI;
    window.config.mapiAudience = 'api.test.gigantic.io';

    (usePermissionsForApps as jest.Mock).mockReturnValue(defaultPermissions);
    (useParams as jest.Mock).mockReturnValue({
      orgId,
      clusterId,
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
    window.config.info.general.providerFlavor = providerFlavor;
    window.config.mapiAudience = mapiAudience;
  });

  it('displays instructions with correct API endpoints', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/?labelSelector=giantswarm.io%2Fcluster%3D${clusterId}`
      )
      .reply(StatusCodes.Ok, {
        ...applicationv1alpha1Mocks.randomClusterGCP1AppsList,
        items: [
          generateApp({
            clusterId,
            namespace,
            specName: Constants.INSTALL_INGRESS_TAB_APP_NAME,
          }),
        ],
      });

    render(
      getComponent({
        cluster,
        isClusterApp: true,
      })
    );

    if (screen.queryAllByText('Loading ingress information…').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading ingress information…')
      );
    }

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.getByLabelText('Base domain:')).toHaveTextContent(
      '.m317f.gigantic.io'
    );
    expect(screen.getByLabelText('Load balancer DNS name:')).toHaveTextContent(
      'ingress.m317f.gigantic.io'
    );
    expect(screen.getByLabelText('Hostname pattern:')).toHaveTextContent(
      'YOUR_PREFIX.m317f.gigantic.io'
    );
  });
});

describe('ClusterDetailIngress on CAPA', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;
  const mapiAudience = window.config.mapiAudience;
  const orgId = 'org1';
  const cluster = capiv1beta1Mocks.randomClusterCAPA1;
  const clusterId = cluster.metadata.name;
  const namespace = getNamespaceFromOrgName(orgId);

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPA;
    window.config.info.general.providerFlavor = ProviderFlavors.CAPI;
    window.config.mapiAudience = 'api.test.gigantic.io';

    (usePermissionsForApps as jest.Mock).mockReturnValue(defaultPermissions);
    (useParams as jest.Mock).mockReturnValue({
      orgId,
      clusterId,
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
    window.config.info.general.providerFlavor = providerFlavor;
    window.config.mapiAudience = mapiAudience;
  });

  it('displays instructions with correct API endpoints', async () => {
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
            specName: Constants.INSTALL_INGRESS_TAB_APP_NAME,
          }),
        ],
      });

    render(
      getComponent({
        cluster,
        isClusterApp: true,
      })
    );

    if (screen.queryAllByText('Loading ingress information…').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading ingress information…')
      );
    }

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.getByLabelText('Base domain:')).toHaveTextContent(
      '.asdf1.gigantic.io'
    );
    expect(screen.getByLabelText('Load balancer DNS name:')).toHaveTextContent(
      'ingress.asdf1.gigantic.io'
    );
    expect(screen.getByLabelText('Hostname pattern:')).toHaveTextContent(
      'YOUR_PREFIX.asdf1.gigantic.io'
    );
  });
});

describe('ClusterDetailIngress on CAPZ', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;
  const mapiAudience = window.config.mapiAudience;
  const cluster = capiv1beta1Mocks.randomClusterCAPZ1;
  const clusterId = cluster.metadata.name;
  const namespace = cluster.metadata.namespace;
  const orgId = 'org1';

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPZ;
    window.config.info.general.providerFlavor = ProviderFlavors.CAPI;
    window.config.mapiAudience = 'api.test.gigantic.io';

    (usePermissionsForApps as jest.Mock).mockReturnValue(defaultPermissions);
    (useParams as jest.Mock).mockReturnValue({
      orgId,
      clusterId,
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
    window.config.info.general.providerFlavor = providerFlavor;
    window.config.mapiAudience = mapiAudience;
  });

  it('displays instructions with correct API endpoints', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/?labelSelector=giantswarm.io%2Fcluster%3D${clusterId}`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'application.giantswarm.io/v1alpha1',
        kind: 'AppList',
        items: [
          generateApp({
            clusterId,
            namespace: namespace!,
            specName: Constants.INSTALL_INGRESS_TAB_APP_NAME,
          }),
        ],
      });

    render(
      getComponent({
        cluster,
        isClusterApp: true,
      })
    );

    if (screen.queryAllByText('Loading ingress information…').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading ingress information…')
      );
    }

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.getByLabelText('Base domain:')).toHaveTextContent(
      '.test12.gigantic.io'
    );
    expect(screen.getByLabelText('Load balancer DNS name:')).toHaveTextContent(
      'ingress.test12.gigantic.io'
    );
    expect(screen.getByLabelText('Hostname pattern:')).toHaveTextContent(
      'YOUR_PREFIX.test12.gigantic.io'
    );
  });
});
