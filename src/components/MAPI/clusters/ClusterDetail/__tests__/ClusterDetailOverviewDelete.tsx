import { fireEvent, screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { cache, SWRConfig } from 'swr';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ClusterDetailOverviewDelete from '../ClusterDetailOverviewDelete';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailOverviewDelete>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <ClusterDetailOverviewDelete {...p} />
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
    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
      })
    );
  });

  it('can delete a cluster', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomCluster1);

    nock(window.config.mapiEndpoint)
      .delete(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Resource deleted.',
        status: metav1.K8sStatuses.Success,
        reason: '',
        code: StatusCodes.Ok,
      });

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
      })
    );

    fireEvent.click(
      await screen.findByRole('button', { name: /Delete cluster/ })
    );
    fireEvent.click(
      await screen.findByText(
        `Delete ${capiv1alpha3Mocks.randomCluster1.metadata.name}`
      )
    );

    expect(
      await screen.findByText(
        `Cluster ${capiv1alpha3Mocks.randomCluster1.metadata.name} deleted successfully.`
      )
    ).toBeInTheDocument();
  });
});
