import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { usePermissionsForClusters } from 'MAPI/clusters/permissions/usePermissionsForClusters';
import { usePermissionsForReleases } from 'MAPI/releases/permissions/usePermissionsForReleases';
import { StatusCodes } from 'model/constants';
import * as metav1 from 'model/services/mapi/metav1';
import { IMainState } from 'model/stores/main/types';
import { IOrganizationState } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as applicationv1alpha1Mocks from 'test/mockHttpCalls/applicationv1alpha1';
import * as authorizationv1Mocks from 'test/mockHttpCalls/authorizationv1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import AppInstallModal from '../AppInstallModal';
import { IAppsPermissions } from '../permissions/types';

function createState(selectedClusterID: string | null): IState {
  return {
    ...preloginState,
    main: {
      ...preloginState.main,
      selectedOrganization: 'org1',
      selectedClusterID,
    } as IMainState,
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
}

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof AppInstallModal>,
  selectedClusterID?: string
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <AppInstallModal {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    props,
    createState(selectedClusterID ?? null),
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

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.mock('MAPI/releases/permissions/usePermissionsForReleases');
jest.mock('MAPI/clusters/permissions/usePermissionsForClusters');

describe('AppInstallModal', () => {
  (usePermissionsForReleases as jest.Mock).mockReturnValue(defaultPermissions);
  (usePermissionsForClusters as jest.Mock).mockReturnValue(defaultPermissions);

  it('renders without crashing', () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];
    const appCatalogEntry =
      applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1;

    render(
      getComponent({
        selectedAppCatalogEntry: appCatalogEntry,
        catalogName: app.spec.catalog,
        versions: [],
        selectVersion: () => {},
      })
    );
  });

  it('can install an app using the default values', async () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'cluster.x-k8s.io',
            resource: 'clusters',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListClustersAtClusterScope
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/clusters/')
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterList);

    nock(window.config.mapiEndpoint)
      .get(
        `/api/v1/namespaces/${capiv1beta1Mocks.randomCluster1.metadata.name}/configmaps/${app.metadata.name}-user-values/`
      )
      .reply(StatusCodes.NotFound, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Lolz',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.NotFound,
        code: StatusCodes.NotFound,
      });

    nock(window.config.mapiEndpoint)
      .post(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1beta1Mocks.randomCluster1.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, app);

    nock(window.config.mapiEndpoint)
      .get(
        `/api/v1/namespaces/${capiv1beta1Mocks.randomCluster1.metadata.name}/secrets/${app.metadata.name}-user-secrets/`
      )
      .reply(StatusCodes.NotFound, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Lolz',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.NotFound,
        code: StatusCodes.NotFound,
      });

    render(
      getComponent({
        selectedAppCatalogEntry:
          applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1,
        catalogName: app.spec.catalog,
        versions: [
          {
            chartVersion: '1.0.0',
            created: new Date().toISOString(),
            includesVersion: '1.0.0',
            test: false,
          },
          {
            chartVersion: '2.0.0',
            created: new Date().toISOString(),
            includesVersion: '2.0.0',
            test: false,
          },
        ],
        selectVersion: () => {},
        appsPermissions: defaultAppsPermissions,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Install in cluster' }));

    fireEvent.click(
      await screen.findByText(capiv1beta1Mocks.randomCluster1.metadata.name)
    );

    const input = screen.getByRole('textbox', { name: /application name/gi });
    fireEvent.change(input, {
      target: { value: app.metadata.name },
    });

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Install app',
      })
    );

    expect(
      await withMarkup(screen.findByText)(
        `Your app ${app.metadata.name} is being installed on ${capiv1beta1Mocks.randomCluster1.metadata.name}`
      )
    ).toBeInTheDocument();
  });

  it('can pick a cluster if one is not already selected', async () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'cluster.x-k8s.io',
            resource: 'clusters',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListClustersAtClusterScope
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/clusters/')
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterList);

    render(
      getComponent({
        selectedAppCatalogEntry:
          applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1,
        catalogName: app.spec.catalog,
        versions: [],
        selectVersion: () => {},
        appsPermissions: defaultAppsPermissions,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Install in cluster' }));

    fireEvent.click(
      await screen.findByText(capiv1beta1Mocks.randomCluster1.metadata.name)
    );

    expect(
      await withMarkup(screen.findByText)(
        `Install ${app.spec.name} on ${capiv1beta1Mocks.randomCluster1.metadata.name}`
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Pick a different cluster'));

    fireEvent.click(
      await screen.findByText(capiv1beta1Mocks.randomCluster2.metadata.name)
    );

    expect(
      await withMarkup(screen.findByText)(
        `Install ${app.spec.name} on ${capiv1beta1Mocks.randomCluster2.metadata.name}`
      )
    ).toBeInTheDocument();
  });

  it('displays app installation button as disabled if the user does not have permissions to install apps', () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    render(
      getComponent({
        selectedAppCatalogEntry:
          applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1,
        catalogName: app.spec.catalog,
        versions: [],
        selectVersion: () => {},
        appsPermissions: {
          ...defaultAppsPermissions,
          canCreate: false,
          canConfigure: false,
        },
      })
    );

    expect(
      screen.getByRole('button', { name: 'Install in cluster' })
    ).toBeDisabled();
  });

  it('allows an app to be selected again for installation on the selected cluster, if the app catalog entry does not have the clusterSingleton restriction', async () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'cluster.x-k8s.io',
            resource: 'clusters',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListClustersAtClusterScope
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/clusters/')
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1beta1Mocks.randomCluster1.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.randomCluster1AppsList);

    render(
      getComponent({
        selectedAppCatalogEntry:
          applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1,
        catalogName: app.spec.catalog,
        versions: [],
        selectVersion: () => {},
        appsPermissions: defaultAppsPermissions,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Install in cluster' }));

    const selectedClusterItem = await screen.findByText(
      capiv1beta1Mocks.randomCluster1.metadata.name
    );

    expect(selectedClusterItem).not.toHaveClass('disabled');

    fireEvent.click(selectedClusterItem);

    expect(
      await withMarkup(screen.findByText)(
        `Install ${app.spec.name} on ${capiv1beta1Mocks.randomCluster1.metadata.name}`
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      await screen.findByRole('button', { name: 'Installed in this cluster' })
    ).not.toBeDisabled();
  });

  it('displays an appropriate message if the app is already installed in the selected cluster, and the app catalog entry has the clusterSingleton restriction', async () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'cluster.x-k8s.io',
            resource: 'clusters',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListClustersAtClusterScope
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/clusters/')
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1beta1Mocks.randomCluster1.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.randomCluster1AppsList);

    render(
      getComponent(
        {
          selectedAppCatalogEntry: {
            ...applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1,
            spec: {
              ...applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1.spec,
              restrictions: { clusterSingleton: true },
            },
          },
          catalogName: app.spec.catalog,
          versions: [],
          selectVersion: () => {},
          appsPermissions: defaultAppsPermissions,
        },
        capiv1beta1Mocks.randomCluster1.metadata.name
      )
    );
    expect(
      await screen.findByText('Installed in this cluster')
    ).toBeInTheDocument();
  });

  it('cannot select a cluster for app installation if the app is already installed on that cluster, and the app catalog entry has the clusterSingleton restriction', async () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'cluster.x-k8s.io',
            resource: 'clusters',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListClustersAtClusterScope
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/clusters/')
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1beta1Mocks.randomCluster1.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.randomCluster1AppsList);

    render(
      getComponent({
        selectedAppCatalogEntry: {
          ...applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1,
          spec: {
            ...applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1.spec,
            restrictions: { clusterSingleton: true },
          },
        },
        catalogName: app.spec.catalog,
        versions: [],
        selectVersion: () => {},
        appsPermissions: defaultAppsPermissions,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Install in cluster' }));

    for (const c of capiv1beta1Mocks.randomClusterList.items) {
      if (c.metadata.name === capiv1beta1Mocks.randomCluster1.metadata.name) {
        await waitFor(() => {
          expect(screen.getByTestId(c.metadata.name)).toHaveClass('disabled');
        });
      } else {
        expect(screen.getByTestId(c.metadata.name)).not.toHaveClass('disabled');
      }
    }
  });
});
