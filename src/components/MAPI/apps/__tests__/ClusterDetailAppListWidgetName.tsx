import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory, MemoryHistory } from 'history';
import React from 'react';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListWidgetName from '../ClusterDetailAppListWidgetName';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidgetName>,
  history?: MemoryHistory
) {
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <ClusterDetailAppListWidgetName {...p} />
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

describe('ClusterDetailAppListWidgetName', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays the app name', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'some-app',
    });

    render(getComponent({ app }));

    expect(screen.getByLabelText('App name: some-app')).toBeInTheDocument();
  });

  it(`displays a link to the app's details page, if the user has permissions for the corresponding appcatalogentry`, () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      specName: 'some-app',
    });

    const history = createMemoryHistory();
    history.push = jest.fn();

    render(getComponent({ app, canListAppCatalogEntries: true }, history));

    const appLink = screen.getByLabelText('App name: some-app');
    expect(appLink).toBeInTheDocument();

    fireEvent.click(appLink);
    expect(history.push).toHaveBeenCalledWith('/apps/default/some-app/1.0.1');
  });
});
