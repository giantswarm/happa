import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { cache, SWRConfig } from 'swr';
import { withMarkup } from 'testUtils/assertUtils';
import * as applicationv1alpha1Mocks from 'testUtils/mockHttpCalls/applicationv1alpha1';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import { getComponentWithStore } from 'testUtils/renderUtils';

import AppDetailsModal from '../';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof AppDetailsModal>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <AppDetailsModal {...p} />
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

describe('AppDetailsModal', () => {
  afterEach(() => {
    cache.clear();
  });

  it('renders without crashing', () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    render(
      getComponent({
        appName: app.metadata.name,
        clusterName: capiv1alpha3Mocks.randomCluster1.metadata.name,
        onClose: jest.fn(),
      })
    );
  });

  it('displays various details about the app', async () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    render(
      getComponent({
        appName: app.metadata.name,
        clusterName: capiv1alpha3Mocks.randomCluster1.metadata.name,
        onClose: jest.fn(),
        visible: true,
      })
    );

    expect(await screen.findByText(app.spec.catalog)).toBeInTheDocument();
    expect(screen.getByText(app.spec.namespace)).toBeInTheDocument();
    expect(screen.getByText(app.status!.release.status!)).toBeInTheDocument();
    expect(screen.getByText(app.spec.version)).toBeInTheDocument();
    expect(screen.getByText(app.status!.appVersion)).toBeInTheDocument();
  });

  it('can delete an app', async () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    nock(window.config.mapiEndpoint)
      .delete(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Resource deleted.',
        status: metav1.K8sStatuses.Success,
        reason: '',
        code: StatusCodes.Ok,
      });

    render(
      getComponent({
        appName: app.metadata.name,
        clusterName: capiv1alpha3Mocks.randomCluster1.metadata.name,
        onClose: jest.fn(),
        visible: true,
      })
    );

    fireEvent.click(
      await screen.findByRole('button', {
        name: /delete app/i,
      })
    );

    expect(
      await screen.findByText(
        new RegExp(`Are you sure you want to delete ${app.metadata.name}`)
      )
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: /delete app/i,
      })
    );

    expect(
      await withMarkup(screen.findByText)(
        `App ${app.metadata.name} was scheduled for deletion on ${capiv1alpha3Mocks.randomCluster1.metadata.name}. This may take a couple of minutes.`
      )
    ).toBeInTheDocument();
  });

  it(`can change an app's chart version`, async () => {
    const app = applicationv1alpha1Mocks.randomCluster1AppsList.items[4];

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=app.kubernetes.io%2Fname%3D${app.spec.name}%2Capplication.giantswarm.io%2Fcatalog%3D${app.spec.catalog}`
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...app,
        spec: { ...app.spec, version: '2.0.0' },
      });

    render(
      getComponent({
        appName: app.metadata.name,
        clusterName: capiv1alpha3Mocks.randomCluster1.metadata.name,
        onClose: jest.fn(),
        visible: true,
      })
    );

    fireEvent.click(
      await screen.findByRole('button', {
        name: app.spec.version,
      })
    );

    fireEvent.click(
      await screen.findByText(
        applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry3.spec.version
      )
    );

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Update chart version',
      })
    );

    expect(
      await withMarkup(screen.findByText)(
        `App ${app.metadata.name} on ${capiv1alpha3Mocks.randomCluster1.metadata.name} has been updated. Changes might take some time to take effect.`
      )
    ).toBeInTheDocument();
  });
});
