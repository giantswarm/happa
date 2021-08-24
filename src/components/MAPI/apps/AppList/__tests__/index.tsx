import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import AppsProvider from 'MAPI/apps/AppsProvider';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { cache, SWRConfig } from 'swr';
import * as applicationv1alpha1Mocks from 'testUtils/mockHttpCalls/applicationv1alpha1';
import { getComponentWithStore } from 'testUtils/renderUtils';

import AppList from '../';

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

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=latest%3Dtrue'
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.latestAppCatalogEntryList
      );

    render(getComponent({}));

    await waitForElementToBeRemoved(() =>
      screen.getAllByLabelText('Loading...')
    );

    for (const entry of [
      ...applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList.items,
      ...applicationv1alpha1Mocks.giantswarmCatalogAppCatalogEntryList.items,
    ]) {
      expect(screen.getByLabelText(entry.spec.appName)).toBeInTheDocument();
    }
  });

  it('displays apps in the selected catalogs', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/application.giantswarm.io/v1alpha1/appcatalogs/')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.appCatalogList);

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=latest%3Dtrue'
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.latestAppCatalogEntryList
      );

    render(getComponent({}));

    await waitForElementToBeRemoved(() =>
      screen.getAllByLabelText('Loading...')
    );

    const filterWrapperElement = screen.getByLabelText('Filter by catalog');

    fireEvent.click(
      within(filterWrapperElement).getByLabelText('Default Catalog')
    );

    for (const entry of applicationv1alpha1Mocks
      .giantswarmCatalogAppCatalogEntryList.items) {
      expect(screen.getByLabelText(entry.spec.appName)).toBeInTheDocument();
    }

    for (const entry of applicationv1alpha1Mocks
      .defaultCatalogAppCatalogEntryList.items) {
      expect(
        screen.queryByLabelText(entry.spec.appName)
      ).not.toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole('button', { name: 'Select none' }));

    for (const entry of [
      ...applicationv1alpha1Mocks.giantswarmCatalogAppCatalogEntryList.items,
      ...applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList.items,
    ]) {
      expect(
        screen.queryByLabelText(entry.spec.appName)
      ).not.toBeInTheDocument();
    }

    expect(
      screen.getByText('No apps found for your search')
    ).toBeInTheDocument();
  });

  it('can search for a specific app', async () => {
    const app = 'coredns';

    nock(window.config.mapiEndpoint)
      .get('/apis/application.giantswarm.io/v1alpha1/appcatalogs/')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.appCatalogList);

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=latest%3Dtrue'
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.latestAppCatalogEntryList
      );

    render(getComponent({}));

    await waitForElementToBeRemoved(() =>
      screen.getAllByLabelText('Loading...')
    );

    const searchInput = screen.getByLabelText('Search for a specific app');
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: app } });

    expect(
      await screen.findByText('Showing 1 app matching your query')
    ).toBeInTheDocument();
    expect(screen.getByText(app)).toBeInTheDocument();

    for (const entry of [
      ...applicationv1alpha1Mocks.giantswarmCatalogAppCatalogEntryList.items,
      ...applicationv1alpha1Mocks.defaultCatalogAppCatalogEntryList.items,
    ]) {
      if (entry.spec.appName === app) continue;

      expect(
        screen.queryByLabelText(entry.spec.appName)
      ).not.toBeInTheDocument();
    }

    fireEvent.change(searchInput, {
      target: { value: 'random-unmatched-string' },
    });

    expect(
      await screen.findByText('No apps found for your search')
    ).toBeInTheDocument();
  });
});
