import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import AppsProvider from 'MAPI/apps/AppsProvider';
import { usePermissionsForAppCatalogEntries } from 'MAPI/apps/permissions/usePermissionsForAppCatalogEntries';
import { usePermissionsForCatalogs } from 'MAPI/apps/permissions/usePermissionsForCatalogs';
import { StatusCodes } from 'model/constants';
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

import AppList from '../';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof AppList>,
  selectedClusterID?: string
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <AppsProvider>
        <AppList {...p} />
      </AppsProvider>
    </SWRConfig>
  );

  const state = {
    ...preloginState,
    main: {
      ...preloginState.main,
      loggedInUser: { isAdmin: true },
      selectedClusterID: selectedClusterID ?? null,
    },
  } as IState;

  return getComponentWithStore(
    Component,
    props,
    state,
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

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.mock('MAPI/apps/permissions/usePermissionsForCatalogs');
jest.mock('MAPI/apps/permissions/usePermissionsForAppCatalogEntries');

describe('AppList', () => {
  (usePermissionsForCatalogs as jest.Mock).mockReturnValue(defaultPermissions);
  (usePermissionsForAppCatalogEntries as jest.Mock).mockReturnValue(
    defaultPermissions
  );

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays all the apps in the pre-selected catalogs', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/application.giantswarm.io/v1alpha1/catalogs/')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.catalogList);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'application.giantswarm.io',
            resource: 'appcatalogentries',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListAppCatalogEntriesAtClusterScope
      );
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
      .get('/apis/application.giantswarm.io/v1alpha1/catalogs/')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.catalogList);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'application.giantswarm.io',
            resource: 'appcatalogentries',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListAppCatalogEntriesAtClusterScope
      );
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
    const app = 'coredns-app';

    nock(window.config.mapiEndpoint)
      .get('/apis/application.giantswarm.io/v1alpha1/catalogs/')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.catalogList);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'application.giantswarm.io',
            resource: 'appcatalogentries',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListAppCatalogEntriesAtClusterScope
      );
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

  it('displays whether an app is installed in the current selected cluster', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/application.giantswarm.io/v1alpha1/catalogs/')
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.catalogList);
    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'application.giantswarm.io',
            resource: 'appcatalogentries',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListAppCatalogEntriesAtClusterScope
      );
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=latest%3Dtrue'
      )
      .reply(
        StatusCodes.Ok,
        applicationv1alpha1Mocks.latestAppCatalogEntryList
      );
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

    render(getComponent({}, capiv1beta1Mocks.randomCluster1.metadata.name));

    await waitForElementToBeRemoved(() =>
      screen.getAllByLabelText('Loading...')
    );

    expect(
      withMarkup(screen.getByText)(
        ' Your selected cluster is j5y9m and install status will be shown for this cluster.'
      )
    ).toBeInTheDocument();

    const appNameContainer = screen.getByText('coredns-app');

    expect(
      await within(appNameContainer).findByTitle('Installed in this cluster')
    ).toBeInTheDocument();
  });
});
