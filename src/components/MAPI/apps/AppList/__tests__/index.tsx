import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import yaml from 'js-yaml';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import AppsProvider from 'MAPI/apps/AppsProvider';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { cache, SWRConfig } from 'swr';
import * as applicationv1alpha1Mocks from 'testUtils/mockHttpCalls/applicationv1alpha1';
import { getComponentWithStore } from 'testUtils/renderUtils';

import AppList from '../';
import { IAppCatalogIndexResponse } from '../utils';

function getComponent(props: React.ComponentPropsWithoutRef<typeof AppList>) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <AppsProvider>
        <AppList {...p} />
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

describe('AppList', () => {
  const defaultAppCatalogIndex = yaml.load(
    applicationv1alpha1Mocks.defaultAppCatalogIndex
  ) as IAppCatalogIndexResponse;
  const giantswarmAppCatalogIndex = yaml.load(
    applicationv1alpha1Mocks.giantswarmAppCatalogIndex
  ) as IAppCatalogIndexResponse;
  const helmAppCatalogIndex = yaml.load(
    applicationv1alpha1Mocks.helmAppCatalogIndex
  ) as IAppCatalogIndexResponse;

  afterEach(() => {
    cache.clear();
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays all the apps in the pre-selected catalogs', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/application.giantswarm.io/v1alpha1/appcatalogs/')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.appCatalogList);

    nock('https://catalogs.com')
      .get('/default-catalog/index.yaml')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.defaultAppCatalogIndex);

    nock('https://catalogs.com')
      .get('/giantswarm-catalog/index.yaml')
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.giantswarmAppCatalogIndex
      );

    nock('https://charts.helm.sh')
      .get('/stable/index.yaml')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.helmAppCatalogIndex);

    render(getComponent({}));

    await waitForElementToBeRemoved(() => screen.queryAllByText('Loading...'));

    for (const appName of [
      ...Object.keys(defaultAppCatalogIndex.entries),
      ...Object.keys(giantswarmAppCatalogIndex.entries),
    ]) {
      expect(screen.getByLabelText(appName)).toBeInTheDocument();
    }

    for (const appName of Object.keys(helmAppCatalogIndex.entries)) {
      expect(screen.queryByLabelText(appName)).not.toBeInTheDocument();
    }
  });

  it('displays apps in the selected catalogs', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/application.giantswarm.io/v1alpha1/appcatalogs/')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.appCatalogList);

    nock('https://catalogs.com')
      .get('/default-catalog/index.yaml')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.defaultAppCatalogIndex);

    nock('https://catalogs.com')
      .get('/giantswarm-catalog/index.yaml')
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.giantswarmAppCatalogIndex
      );

    nock('https://charts.helm.sh')
      .get('/stable/index.yaml')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.helmAppCatalogIndex);

    render(getComponent({}));

    await waitForElementToBeRemoved(() => screen.queryAllByText('Loading...'));

    const filterWrapperElement = screen.getByText('Filter by Catalog')
      .parentElement!;

    fireEvent.click(
      within(filterWrapperElement).getByLabelText('Default Catalog')
    );

    for (const appName of Object.keys(giantswarmAppCatalogIndex.entries)) {
      expect(screen.getByLabelText(appName)).toBeInTheDocument();
    }

    for (const appName of [
      ...Object.keys(defaultAppCatalogIndex.entries),
      ...Object.keys(helmAppCatalogIndex.entries),
    ]) {
      expect(screen.queryByLabelText(appName)).not.toBeInTheDocument();
    }

    fireEvent.click(
      within(filterWrapperElement).getByRole('button', {
        name: 'Select none',
      })
    );

    for (const appName of [
      ...Object.keys(giantswarmAppCatalogIndex.entries),
      ...Object.keys(defaultAppCatalogIndex.entries),
      ...Object.keys(helmAppCatalogIndex.entries),
    ]) {
      expect(screen.queryByLabelText(appName)).not.toBeInTheDocument();
    }

    expect(
      screen.getByText('No apps found for your search')
    ).toBeInTheDocument();
  });

  it('can search for a specific app', async () => {
    const app = 'calico';

    nock(window.config.mapiEndpoint)
      .get('/apis/application.giantswarm.io/v1alpha1/appcatalogs/')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.appCatalogList);

    nock('https://catalogs.com')
      .get('/default-catalog/index.yaml')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.defaultAppCatalogIndex);

    nock('https://catalogs.com')
      .get('/giantswarm-catalog/index.yaml')
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.giantswarmAppCatalogIndex
      );

    nock('https://charts.helm.sh')
      .get('/stable/index.yaml')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.helmAppCatalogIndex);

    render(getComponent({}));

    await waitForElementToBeRemoved(() => screen.queryAllByText('Loading...'));

    const searchInput = screen.getByLabelText('Search for a specific app');
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: app } });

    expect(
      await screen.findByText('Showing 1 app matching your query')
    ).toBeInTheDocument();
    expect(screen.getByText(app)).toBeInTheDocument();

    for (const appName of [
      ...Object.keys(giantswarmAppCatalogIndex.entries),
      ...Object.keys(defaultAppCatalogIndex.entries),
      ...Object.keys(helmAppCatalogIndex.entries),
    ]) {
      if (appName === app) continue;

      expect(screen.queryByLabelText(appName)).not.toBeInTheDocument();
    }

    fireEvent.change(searchInput, {
      target: { value: 'random-unmatched-string' },
    });

    expect(
      await screen.findByText('No apps found for your search')
    ).toBeInTheDocument();
  });
});
