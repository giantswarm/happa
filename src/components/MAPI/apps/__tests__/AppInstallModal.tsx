import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { IMainState } from 'stores/main/types';
import { IOrganizationState } from 'stores/organization/types';
import { IState } from 'stores/state';
import { SWRConfig } from 'swr';
import { withMarkup } from 'testUtils/assertUtils';
import * as applicationv1alpha1Mocks from 'testUtils/mockHttpCalls/applicationv1alpha1';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import preloginState from 'testUtils/preloginState';
import { getComponentWithStore } from 'testUtils/renderUtils';

import AppInstallModal from '../AppInstallModal';

const defaultState: IState = {
  ...preloginState,
  main: {
    ...preloginState.main,
    selectedOrganization: 'org1',
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

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof AppInstallModal>
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
    defaultState,
    undefined,
    history,
    auth
  );
}

describe('AppInstallModal', () => {
  it('renders without crashing', () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    render(
      getComponent({
        appName: app.metadata.name,
        chartName: app.spec.name,
        catalogName: app.spec.catalog,
        versions: [],
        selectedClusterID: null,
      })
    );
  });

  it('can pick a cluster if one is not already selected', async () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/clusters/')
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomClusterList);

    render(
      getComponent({
        appName: app.metadata.name,
        chartName: app.spec.name,
        catalogName: app.spec.catalog,
        versions: [],
        selectedClusterID: null,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Install in cluster' }));

    fireEvent.click(
      await screen.findByText(capiv1alpha3Mocks.randomCluster1.metadata.name)
    );

    expect(
      await withMarkup(screen.findByText)(
        `Install ${app.spec.name} on ${capiv1alpha3Mocks.randomCluster1.metadata.name}`
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Pick a different cluster'));

    fireEvent.click(
      await screen.findByText(capiv1alpha3Mocks.randomCluster2.metadata.name)
    );

    expect(
      await withMarkup(screen.findByText)(
        `Install ${app.spec.name} on ${capiv1alpha3Mocks.randomCluster2.metadata.name}`
      )
    ).toBeInTheDocument();
  });

  it('can install an app using the default values', async () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/clusters/')
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomClusterList);

    nock(window.config.mapiEndpoint)
      .get(
        `/api/v1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/configmaps/${app.metadata.name}-user-values/`
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
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, app);

    nock(window.config.mapiEndpoint)
      .get(
        `/api/v1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/secrets/${app.metadata.name}-user-secrets/`
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
        appName: app.metadata.name,
        chartName: app.spec.name,
        catalogName: app.spec.catalog,
        versions: [
          {
            chartVersion: '1.0.0',
            created: new Date().toISOString(),
            includesVersion: '1.0.0',
            test: false,
          },
        ],
        selectedClusterID: null,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Install in cluster' }));

    fireEvent.click(
      await screen.findByText(capiv1alpha3Mocks.randomCluster1.metadata.name)
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Install app' }));

    expect(
      await withMarkup(screen.findByText)(
        `Your app ${app.metadata.name} is being installed on ${capiv1alpha3Mocks.randomCluster1.metadata.name}`
      )
    ).toBeInTheDocument();
  });
});
