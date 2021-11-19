import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import AppsProvider from 'MAPI/apps/AppsProvider';
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as applicationv1alpha1Mocks from 'test/mockHttpCalls/applicationv1alpha1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import AppDetail from '../AppDetail';

function getComponent(props: React.ComponentPropsWithoutRef<typeof AppDetail>) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <AppsProvider>
        <AppDetail {...p} />
      </AppsProvider>
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
  useRouteMatch: jest.fn().mockReturnValue({
    url: '',
    params: {
      catalogName: 'default',
      app: 'coredns',
      version: '1.2.0',
    },
  }),
}));

describe('AppDetail', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays various details about the app', async () => {
    const appCatalogEntry =
      applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1;
    const catalog = applicationv1alpha1Mocks.defaultAppCatalog;

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=app.kubernetes.io%2Fname%3D${appCatalogEntry.spec.appName}%2Capplication.giantswarm.io%2Fcatalog%3D${appCatalogEntry.spec.catalog.name}`
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${catalog.metadata.namespace}/catalogs/${catalog.metadata.name}/`
      )
      .reply(StatusCodes.Ok, catalog);

    render(getComponent({}));

    await waitForElementToBeRemoved(() =>
      screen.getAllByLabelText('Loading...')
    );

    expect(screen.getByText(appCatalogEntry.spec.appName)).toBeInTheDocument();
    expect(screen.getByText(catalog.spec.title)).toBeInTheDocument();
    expect(screen.getAllByText(appCatalogEntry.spec.version)).toHaveLength(2);
    expect(
      screen.getByText(appCatalogEntry.spec.appVersion)
    ).toBeInTheDocument();
    expect(
      screen.getByText(appCatalogEntry.spec.chart.description!)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: appCatalogEntry.spec.chart.home })
    ).toBeInTheDocument();
  });
});
