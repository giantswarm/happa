import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as applicationv1alpha1Mocks from 'test/mockHttpCalls/applicationv1alpha1';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListWidgetVersion from '../ClusterDetailAppListWidgetVersion';

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailAppListWidgetVersion
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailAppListWidgetVersion {...p} />
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

describe('ClusterDetailAppListWidgetVersion', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays the current app version', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      version: '1.2.3',
    });

    render(getComponent({ app, canListAppCatalogEntries: true }));

    expect(screen.getByLabelText('App version: 1.2.3')).toBeInTheDocument();
  });

  it('displays the upstream version', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      version: '1.2.3',
    });

    render(
      getComponent({
        app,
        canListAppCatalogEntries: true,
        displayUpstreamVersion: true,
      })
    );

    expect(
      screen.getByLabelText('App upstream version: 0.4.1')
    ).toBeInTheDocument();
  });

  it('displays if the app is switching versions', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      version: '1.2.3',
    });
    app.spec.version = '1.3.0';

    render(getComponent({ app, canListAppCatalogEntries: true }));

    expect(screen.getByLabelText('App version: 1.2.3')).toBeInTheDocument();
    expect(screen.getByText('Switching to 1.3.0')).toBeInTheDocument();
  });

  it('displays the spec version if there is no status', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      version: '1.2.3',
    });
    delete app.status;

    render(getComponent({ app, canListAppCatalogEntries: true }));

    expect(screen.getByLabelText('App version: 1.2.3')).toBeInTheDocument();
  });

  it('displays a warning if a newer version is available', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=app.kubernetes.io%2Fname%3Dcoredns-app%2Capplication.giantswarm.io%2Fcatalog%3Ddefault'
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList
      );

    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'coredns-app',
      version: '1.1.0',
    });
    delete app.status;

    render(getComponent({ app, canListAppCatalogEntries: true }));

    expect(screen.getByLabelText('App version: 1.1.0')).toBeInTheDocument();

    expect(await screen.findByText('Upgrade available')).toBeInTheDocument();
  });
});
