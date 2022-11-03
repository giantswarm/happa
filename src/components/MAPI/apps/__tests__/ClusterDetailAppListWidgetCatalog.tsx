import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory, MemoryHistory } from 'history';
import React from 'react';
import { SWRConfig } from 'swr';
import * as applicationv1alpha1Mocks from 'test/mockHttpCalls/applicationv1alpha1';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListWidgetCatalog from '../ClusterDetailAppListWidgetCatalog';
import { usePermissionsForCatalogs } from '../permissions/usePermissionsForCatalogs';

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailAppListWidgetCatalog
  >,
  history?: MemoryHistory
) {
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailAppListWidgetCatalog {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    props,
    undefined,
    undefined,
    history ?? createMemoryHistory(),
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

jest.mock('MAPI/apps/permissions/usePermissionsForCatalogs');

describe('ClusterDetailAppListWidgetCatalog', () => {
  beforeAll(() => {
    (usePermissionsForCatalogs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays the current app catalog', async () => {
    const catalog = applicationv1alpha1Mocks.defaultAppCatalog;
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    render(getComponent({ app, catalog }));

    expect(
      await screen.findByLabelText('App catalog: Default Catalog')
    ).toBeInTheDocument();
  });

  it('displays if the catalog is managed or not', async () => {
    const catalog = applicationv1alpha1Mocks.giantswarmAppCatalog;
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });
    app.spec.catalog = 'giantswarm';

    render(getComponent({ app, catalog }));

    expect(
      await screen.findByLabelText('App catalog: Giant Swarm Catalog')
    ).toBeInTheDocument();

    expect(screen.getByText(/managed/i)).toBeInTheDocument();
  });

  it('displays a link to the app catalogs page', async () => {
    const catalog = applicationv1alpha1Mocks.defaultAppCatalog;
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    const history = createMemoryHistory();
    history.push = jest.fn();

    render(getComponent({ app, catalog }, history));

    const catalogLink = await screen.findByText('Default Catalog');
    expect(catalogLink).toBeInTheDocument();

    fireEvent.click(catalogLink);
    expect(history.push).toHaveBeenCalledWith({
      pathname: '/apps',
      state: { selectedCatalog: 'default' },
    });
  });

  it(`displays the app catalog name for users who do not have permissions to get the app's catalog`, async () => {
    (usePermissionsForCatalogs as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canList: false,
    });

    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });
    app.spec.catalog = 'random-test-catalog';

    render(getComponent({ app }));

    expect(
      await screen.findByLabelText('App catalog: Random Test Catalog')
    ).toBeInTheDocument();
  });
});
