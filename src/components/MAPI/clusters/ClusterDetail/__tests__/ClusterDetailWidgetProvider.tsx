import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import React from 'react';
import { SWRConfig } from 'swr';
import * as mockCapiv1alpha3 from 'test/mockHttpCalls/capiv1alpha3';
import * as capzv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3';
import { getComponentWithStore } from 'test/renderUtils';

import ClusterDetailWidgetProvider from '../ClusterDetailWidgetProvider';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWidgetProvider>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWidgetProvider {...p} />
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
  useParams: jest.fn().mockReturnValue({
    orgId: 'org1',
    clusterId: mockCapiv1alpha3.randomCluster1.metadata.name,
  }),
}));

describe('ClusterDetailWidgetProvider', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays loading animations if the cluster is still loading', () => {
    render(
      getComponent({
        cluster: undefined,
      })
    );

    expect(screen.getAllByLabelText('Loading...').length).toEqual(4);
  });

  it('displays the cluster region on Azure', () => {
    render(
      getComponent({
        cluster: mockCapiv1alpha3.randomCluster1,
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
      })
    );

    expect(screen.getByText('Azure region')).toBeInTheDocument();
    expect(screen.getByText('westeurope')).toBeInTheDocument();
  });

  it('displays the subscription ID on Azure', () => {
    render(
      getComponent({
        cluster: mockCapiv1alpha3.randomCluster1,
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
      })
    );

    expect(screen.getByText('Subscription ID')).toBeInTheDocument();
    expect(screen.getByText('test-subscription')).toBeInTheDocument();
  });
});
