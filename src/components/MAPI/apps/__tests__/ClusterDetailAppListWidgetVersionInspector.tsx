import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListWidgetVersionInspector from '../ClusterDetailAppListWidgetVersionInspector';

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailAppListWidgetVersionInspector
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <ClusterDetailAppListWidgetVersionInspector {...p} />
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

describe('ClusterDetailAppListWidgetVersionInspector', () => {
  it('renders without crashing', () => {
    render(getComponent({ onSelectVersion: () => {} }));
  });

  it(`displays the current and upstream versions for a user without permissions to get the app's catalog entry`, () => {
    const currentVersion = '1.2.0';
    const upstreamVersion = '0.1.2';

    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
      version: currentVersion,
      upstreamVersion,
    });

    render(
      getComponent({
        app,
        currentSelectedVersion: currentVersion,
        canListAppCatalogEntries: false,
        onSelectVersion: () => {},
      })
    );

    expect(screen.getByText(currentVersion)).toBeInTheDocument();
    expect(
      screen.getByText(`includes upstream version ${upstreamVersion}`)
    ).toBeInTheDocument();
  });
});
