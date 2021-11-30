import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import add from 'date-fns/fp/add';
import format from 'date-fns/fp/format';
import sub from 'date-fns/fp/sub';
import { createMemoryHistory } from 'history';
import { usePermissionsForNodePools } from 'MAPI/workernodes/permissions/usePermissionsForNodePools';
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as capiv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3';
import * as capiexpv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3/exp';
import * as capzv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3';
import * as capzexpv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3/exp';
import * as releasev1alpha1Mocks from 'test/mockHttpCalls/releasev1alpha1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterListItem from '../ClusterListItem';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterListItem>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
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

jest.mock('MAPI/workernodes/permissions/usePermissionsForNodePools');

describe('ClusterListItem', () => {
  it('renders without crashing', () => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      canGet: true,
      canList: true,
      canUpdate: true,
      canCreate: true,
      canDelete: true,
    });

    render(getComponent({}));
  });

  it('displays a loading animation if the cluster is not loaded yet', () => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      canGet: true,
      canList: true,
      canUpdate: true,
      canCreate: true,
      canDelete: true,
    });

    render(getComponent({}));

    expect(
      screen.getByRole('link', { name: 'Loading cluster...' })
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText('Loading...')).toHaveLength(9);
  });

  it('displays if a cluster was deleted', () => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      canGet: true,
      canList: true,
      canUpdate: true,
      canCreate: true,
      canDelete: true,
    });

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
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      canGet: true,
      canList: true,
      canUpdate: true,
      canCreate: true,
      canDelete: true,
    });

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
        canCreateClusters: true,
      })
    );

    expect(
      screen.getByRole('button', { name: 'Get started' })
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

  it('does not displays the getting started button if the user does not have permissions create clusters', () => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      canGet: true,
      canList: true,
      canUpdate: true,
      canCreate: true,
      canDelete: true,
    });

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
        releases: releasev1alpha1Mocks.releasesList.items,
        canCreateClusters: false,
      })
    );

    expect(
      screen.queryByRole('button', { name: 'Get Started' })
    ).not.toBeInTheDocument();
  });

  it('displays various information about the cluster', () => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      canGet: true,
      canList: true,
      canUpdate: true,
      canCreate: true,
      canDelete: true,
    });

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
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
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
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      canGet: true,
      canList: true,
      canUpdate: true,
      canCreate: true,
      canDelete: true,
    });

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
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      canGet: true,
      canList: true,
      canUpdate: true,
      canCreate: true,
      canDelete: true,
    });

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
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
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
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
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
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
      })
    );

    expect(screen.queryByText('Cluster creating…')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade in progress…')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade available')).toBeInTheDocument();
  });

  it('displays information if an upgrade has been scheduled', async () => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      canGet: true,
      canList: true,
      canUpdate: true,
      canCreate: true,
      canDelete: true,
    });

    const targetTime = `${format('dd MMM yy HH:mm')(
      add({ days: 1 })(new Date())
    )} UTC`;

    render(
      getComponent({
        cluster: {
          ...capiv1alpha3Mocks.randomCluster1,
          metadata: {
            ...capiv1alpha3Mocks.randomCluster1.metadata,
            annotations: {
              ...capiv1alpha3Mocks.randomCluster1.metadata.annotations,
              'alpha.giantswarm.io/update-schedule-target-release': '15.0.0',
              'alpha.giantswarm.io/update-schedule-target-time': targetTime,
            },
          },
        },
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
      })
    );

    expect(await screen.findByText('Upgrade scheduled')).toBeInTheDocument();
  });
});
