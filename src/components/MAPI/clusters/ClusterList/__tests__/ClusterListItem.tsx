import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import sub from 'date-fns/fp/sub';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { cache, SWRConfig } from 'swr';
import { withMarkup } from 'testUtils/assertUtils';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import * as capiexpv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3/exp';
import * as capzexpv1alpha3Mocks from 'testUtils/mockHttpCalls/capzv1alpha3/exp';
import * as releasev1alpha1Mocks from 'testUtils/mockHttpCalls/releasev1alpha1';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ClusterListItem from '../ClusterListItem';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterListItem>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <ClusterListItem {...p} />
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

describe('ClusterListItem', () => {
  afterEach(() => {
    cache.clear();
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays a loading animation if the cluster is not loaded yet', () => {
    render(getComponent({}));

    expect(
      screen.getByRole('link', { name: 'Loading cluster...' })
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText('Loading...')).toHaveLength(9);
  });

  it('displays if a cluster was deleted', () => {
    const deletionDate = sub({
      hours: 1,
    })(new Date());

    render(
      getComponent({
        cluster: {
          ...capiv1alpha3Mocks.randomCluster1,
          metadata: {
            ...capiv1alpha3Mocks.randomCluster1.metadata,
            deletionTimestamp: deletionDate.toISOString(),
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
      })
    );

    expect(
      withMarkup(screen.getByText)('Deleted about 1 hour ago')
    ).toBeInTheDocument();
  });

  it('displays the getting started button if the cluster has been created recently', () => {
    let creationDate = sub({
      days: 20,
    })(new Date());

    const { rerender } = render(
      getComponent({
        cluster: {
          ...capiv1alpha3Mocks.randomCluster1,
          metadata: {
            ...capiv1alpha3Mocks.randomCluster1.metadata,
            creationTimestamp: creationDate.toISOString(),
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
      })
    );

    expect(
      screen.getByRole('button', { name: 'Get Started' })
    ).toBeInTheDocument();

    creationDate = sub({
      days: 50,
    })(new Date());

    rerender(
      getComponent({
        cluster: {
          ...capiv1alpha3Mocks.randomCluster1,
          metadata: {
            ...capiv1alpha3Mocks.randomCluster1.metadata,
            creationTimestamp: creationDate.toISOString(),
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
      })
    );

    expect(
      screen.queryByRole('button', { name: 'Get Started' })
    ).not.toBeInTheDocument();
  });

  it('displays various information about the cluster', () => {
    const creationDate = sub({
      hours: 1,
    })(new Date());

    render(
      getComponent({
        cluster: {
          ...capiv1alpha3Mocks.randomCluster1,
          metadata: {
            ...capiv1alpha3Mocks.randomCluster1.metadata,
            creationTimestamp: creationDate.toISOString(),
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
      })
    );

    expect(screen.getByLabelText('Name: j5y9m')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Description: Random Cluster')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Release version: 14.1.5')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Kubernetes version: 1.19')
    ).toBeInTheDocument();
    expect(
      withMarkup(screen.getByText)('Created about 1 hour ago')
    ).toBeInTheDocument();
  });

  it('displays stats about worker nodes', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiexpv1alpha3Mocks.randomCluster1MachinePoolList
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachinepools/${capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachinepools/${capzexpv1alpha3Mocks.randomCluster1AzureMachinePool2.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        capzexpv1alpha3Mocks.randomCluster1AzureMachinePool2
      );

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
        releases: releasev1alpha1Mocks.releasesList.items,
      })
    );

    expect(await screen.findByText(/2 node pools/)).toBeInTheDocument();
    expect(await screen.findByText('10 worker nodes')).toBeInTheDocument();
    expect(await screen.findByText('80 CPU cores')).toBeInTheDocument();
    expect(await screen.findByText('171.8 GB RAM')).toBeInTheDocument();
  });

  it(`displays the cluster's current status`, () => {
    const { rerender } = render(
      getComponent({
        cluster: {
          ...capiv1alpha3Mocks.randomCluster1,
          status: {
            ...capiv1alpha3Mocks.randomCluster1.status,
            conditions: [
              {
                status: 'True',
                type: 'Creating',
              },
            ],
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
      })
    );

    expect(screen.queryByText('Cluster creating…')).toBeInTheDocument();
    expect(screen.queryByText('Upgrade in progress…')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade available')).not.toBeInTheDocument();

    rerender(
      getComponent({
        cluster: {
          ...capiv1alpha3Mocks.randomCluster1,
          status: {
            ...capiv1alpha3Mocks.randomCluster1.status,
            conditions: [
              {
                status: 'True',
                type: 'Upgrading',
                reason: 'UpgradePending',
              },
            ],
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
      })
    );

    expect(screen.queryByText('Cluster creating…')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade in progress…')).toBeInTheDocument();
    expect(screen.queryByText('Upgrade available')).not.toBeInTheDocument();

    rerender(
      getComponent({
        cluster: {
          ...capiv1alpha3Mocks.randomCluster1,
          status: {
            ...capiv1alpha3Mocks.randomCluster1.status,
            conditions: [
              {
                status: 'False',
                type: 'Creating',
                reason: 'CreationCompleted',
              },
              {
                status: 'True',
                type: 'Ready',
              },
            ],
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
      })
    );

    expect(screen.queryByText('Cluster creating…')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade in progress…')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade available')).toBeInTheDocument();
  });
});
