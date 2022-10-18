import { render, screen } from '@testing-library/react';
import sub from 'date-fns/fp/sub';
import { createMemoryHistory } from 'history';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import {
  getComponentWithStore,
  getComponentWithTheme,
  renderWithTheme,
} from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppList from '../ClusterDetailAppList';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailAppList>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailAppList {...p} />
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

describe('ClusterDetailAppList', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailAppList, {
      apps: [],
    });
  });

  it('displays loading animations', () => {
    const { rerender } = render(
      getComponent({
        apps: [],
        isLoading: true,
      })
    );

    expect(screen.getAllByLabelText('Loading...')).toHaveLength(6);

    rerender(
      getComponentWithTheme(ClusterDetailAppList, {
        apps: [],
        isLoading: false,
      })
    );

    expect(screen.queryAllByLabelText('Loading...')).toHaveLength(0);
  });

  it('displays a placeholder if there are no apps', () => {
    render(
      getComponent({
        apps: [],
        isLoading: false,
      })
    );

    expect(
      screen.getByText('No apps installed on this cluster')
    ).toBeInTheDocument();
  });

  it('displays the error message if it is provided', () => {
    render(
      getComponent({
        apps: [],
        isLoading: false,
        errorMessage: 'Something went wrong',
      })
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays basic app information when the apps are collapsed', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    render(
      getComponent({
        apps: [
          generateApp({
            clusterId,
            namespace: clusterId,
            specName: 'some-app',
            version: '1.3.0',
          }),
          generateApp({
            clusterId,
            namespace: clusterId,
            specName: 'some-other-app',
            version: '2.3.1',
          }),
          generateApp({
            clusterId,
            namespace: clusterId,
            specName: 'random-app',
            version: '5.0.0',
          }),
        ],
        isLoading: false,
      })
    );

    expect(screen.getByLabelText('App name: some-app')).toBeInTheDocument();
    expect(screen.getByLabelText('App version: 1.3.0')).toBeInTheDocument();

    expect(
      screen.getByLabelText('App name: some-other-app')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('App version: 2.3.1')).toBeInTheDocument();

    expect(screen.getByLabelText('App name: random-app')).toBeInTheDocument();
    expect(screen.getByLabelText('App version: 5.0.0')).toBeInTheDocument();
  });

  it('displays apps in a different state if they have been deleted', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const deletedApp = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'some-other-app',
      version: '2.3.1',
    });

    const deletionDate = sub({
      hours: 1,
    })(new Date());
    deletedApp.metadata.deletionTimestamp = deletionDate.toISOString();

    render(
      getComponent({
        apps: [deletedApp],
        isLoading: false,
      })
    );

    expect(screen.getByText('some-other-app')).toBeInTheDocument();
    expect(
      withMarkup(screen.getByText)('Deleted about 1 hour ago')
    ).toBeInTheDocument();
  });
});
