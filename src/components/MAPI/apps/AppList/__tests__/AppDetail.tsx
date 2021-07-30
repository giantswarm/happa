import {
  render,
  screen,
  waitForElementToBeRemoved,
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

import AppDetail from '../AppDetail';
import { IAppCatalogIndexResponse } from '../utils';

function getComponent(props: React.ComponentPropsWithoutRef<typeof AppDetail>) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
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

const defaultAppCatalogIndex = yaml.load(
  applicationv1alpha1Mocks.defaultAppCatalogIndex
) as IAppCatalogIndexResponse;
const app = defaultAppCatalogIndex.entries.calico;

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useRouteMatch: jest.fn().mockReturnValue({
    url: '',
    params: {
      catalogName: 'default',
      app: 'calico',
      version: '0.2.0',
    },
  }),
}));

describe('AppDetail', () => {
  afterEach(() => {
    cache.clear();
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays various details about the app', async () => {
    const version = app[0];

    nock(window.config.mapiEndpoint)
      .get('/apis/application.giantswarm.io/v1alpha1/appcatalogs/default/')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.defaultAppCatalog);

    nock('https://catalogs.com')
      .get('/default-catalog/index.yaml')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.defaultAppCatalogIndex);

    render(getComponent({}));

    await waitForElementToBeRemoved(() => screen.queryAllByText('Loading...'));

    expect(screen.getByText(version.name)).toBeInTheDocument();
    expect(
      screen.getByText(applicationv1alpha1Mocks.defaultAppCatalog.spec.title)
    ).toBeInTheDocument();
    expect(screen.getAllByText(version.version)).toHaveLength(2);
    expect(screen.getByText(version.appVersion)).toBeInTheDocument();
    expect(screen.getByText(version.description)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: version.home })
    ).toBeInTheDocument();
  });
});
