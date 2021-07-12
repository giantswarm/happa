import { fireEvent, screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { cache, SWRConfig } from 'swr';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ClusterDetail from '../';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetail>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <ClusterDetail {...p} />
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
  useRouteMatch: jest.fn().mockReturnValue({
    url: '',
    params: {
      orgId: 'org1',
      clusterId: capiv1alpha3Mocks.randomCluster1.metadata.name,
    },
  }),
}));

describe('ClusterDetail', () => {
  afterEach(() => {
    cache.clear();
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays loading animations if the cluster is still loading', () => {
    render(getComponent({}));

    expect(screen.getAllByLabelText('Loading...').length).toEqual(1);
  });

  it(`displays the cluster's description`, async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomCluster1);

    render(getComponent({}));

    expect(await screen.findByText('Random Cluster')).toBeInTheDocument();
  });

  it(`can edit the cluster's description`, async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomCluster1);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...capiv1alpha3Mocks.randomCluster1,
        metadata: {
          ...capiv1alpha3Mocks.randomCluster1.metadata,
          annotations: {
            ...capiv1alpha3Mocks.randomCluster1.metadata.annotations,
            'cluster.giantswarm.io/description': 'Some Cluster',
          },
        },
      });

    render(getComponent({}));

    fireEvent.click(await screen.findByText('Random Cluster'));
    fireEvent.change(screen.getByDisplayValue('Random Cluster'), {
      target: { value: 'Some Cluster' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(
      await screen.findByText(`Successfully updated the cluster's description`)
    ).toBeInTheDocument();
  });
});
