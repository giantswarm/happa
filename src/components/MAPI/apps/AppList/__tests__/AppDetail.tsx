import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
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
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import AppDetail from '../AppDetail';

function createState(selectedClusterID: string | null) {
  return {
    ...preloginState,
    main: {
      ...preloginState.main,
      selectedClusterID,
    },
  } as IState;
}

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof AppDetail>,
  selectedClusterID?: string
) {
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
    createState(selectedClusterID ?? null),
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
jest.mock('MAPI/apps/permissions/usePermissionsForAppCatalogEntries');
jest.mock('MAPI/apps/permissions/usePermissionsForCatalogs');

describe('AppDetail', () => {
  (usePermissionsForAppCatalogEntries as jest.Mock).mockReturnValue(
    defaultPermissions
  );
  (usePermissionsForCatalogs as jest.Mock).mockReturnValue(defaultPermissions);

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays various details about the app', async () => {
    const appCatalogEntry =
      applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1;
    const catalog = applicationv1alpha1Mocks.defaultAppCatalog;

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

  it('displays the current selected cluster', async () => {
    const appCatalogEntry =
      applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1;
    const catalog = applicationv1alpha1Mocks.defaultAppCatalog;

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

    const testClusterID = 'test1';

    render(getComponent({}, testClusterID));

    await waitForElementToBeRemoved(() =>
      screen.getAllByLabelText('Loading...')
    );

    expect(
      withMarkup(screen.getByText)(
        ' Your selected cluster is test1 and install status will be shown for this cluster.'
      )
    ).toBeInTheDocument();
  });

  it('allows deselecting the current selected cluster', async () => {
    const appCatalogEntry =
      applicationv1alpha1Mocks.defaultCatalogAppCatalogEntry1;
    const catalog = applicationv1alpha1Mocks.defaultAppCatalog;

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

    const testClusterID = 'test1';

    render(getComponent({}, testClusterID));

    await waitForElementToBeRemoved(() =>
      screen.getAllByLabelText('Loading...')
    );

    const selectedClusterElement = withMarkup(screen.getByText)(
      ' Your selected cluster is test1 and install status will be shown for this cluster.'
    );

    expect(selectedClusterElement).toBeInTheDocument();

    fireEvent.click(screen.getByTitle(`Deselect cluster ${testClusterID}`));

    expect(selectedClusterElement).not.toBeInTheDocument();
  });
});
