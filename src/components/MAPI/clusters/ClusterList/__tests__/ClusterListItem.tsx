import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import add from 'date-fns/fp/add';
import format from 'date-fns/fp/format';
import sub from 'date-fns/fp/sub';
import { createMemoryHistory } from 'history';
import { usePermissionsForKeyPairs } from 'MAPI/keypairs/permissions/usePermissionsForKeyPairs';
import { usePermissionsForNodePools } from 'MAPI/workernodes/permissions/usePermissionsForNodePools';
import { Providers, StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as capgv1beta1Mocks from 'test/mockHttpCalls/capgv1beta1';
import * as capiexpv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3/exp';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import * as capzexpv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3/exp';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import * as infrav1alpha3Mocks from 'test/mockHttpCalls/infrastructurev1alpha3';
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

const defaultPermissions = {
  canGet: true,
  canList: true,
  canUpdate: true,
  canCreate: true,
  canDelete: true,
};

jest.mock('MAPI/workernodes/permissions/usePermissionsForNodePools');
jest.mock('MAPI/keypairs/permissions/usePermissionsForKeyPairs');

describe('ClusterListItem', () => {
  beforeAll(() => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays a loading animation if the cluster is not loaded yet', () => {
    render(getComponent({}));

    expect(
      screen.getByRole('link', { name: 'Loading cluster...' })
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText('Loading...')).toHaveLength(8);
  });
});

describe('ClusterListItem on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays if a cluster was deleted', () => {
    const deletionDate = sub({
      hours: 1,
    })(new Date());

    render(
      getComponent({
        cluster: {
          ...capiv1beta1Mocks.randomCluster1,
          metadata: {
            ...capiv1beta1Mocks.randomCluster1.metadata,
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
          ...capiv1beta1Mocks.randomCluster1,
          metadata: {
            ...capiv1beta1Mocks.randomCluster1.metadata,
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
          ...capiv1beta1Mocks.randomCluster1,
          metadata: {
            ...capiv1beta1Mocks.randomCluster1.metadata,
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
          ...capiv1beta1Mocks.randomCluster1,
          metadata: {
            ...capiv1beta1Mocks.randomCluster1.metadata,
            creationTimestamp: creationDate.toISOString(),
          },
        },
        providerCluster: capzv1beta1Mocks.randomAzureCluster1,
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
  });

  it('displays stats about worker nodes', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${capiv1beta1Mocks.randomCluster1.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster1.metadata.name}`
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
        cluster: capiv1beta1Mocks.randomCluster1,
        releases: releasev1alpha1Mocks.releasesList.items,
      })
    );

    expect(await screen.findByText(/2 node pools/)).toBeInTheDocument();
    expect(await screen.findByText('10 worker nodes')).toBeInTheDocument();
    expect(await screen.findByText('80 CPU cores')).toBeInTheDocument();
    expect(await screen.findByText('171.8 GB RAM')).toBeInTheDocument();
  });

  it('displays cluster labels', () => {
    render(
      getComponent({
        cluster: {
          ...capiv1beta1Mocks.randomCluster1,
          metadata: {
            ...capiv1beta1Mocks.randomCluster1.metadata,
            labels: {
              ...capiv1beta1Mocks.randomCluster1.metadata.labels!,
              'giantswarm.io/service-priority': 'highest',
            },
          },
        },
      })
    );

    expect(screen.queryByText('Service priority')).toBeInTheDocument();
    expect(
      screen.queryByText('giantswarm.io/service-priority')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('azure-operator.giantswarm.io/version')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('cluster.x-k8s.io/cluster-name')
    ).not.toBeInTheDocument();
  });

  it(`displays the cluster's current status`, async () => {
    const { rerender } = render(
      getComponent({
        cluster: {
          ...capiv1beta1Mocks.randomCluster1,
          status: {
            ...capiv1beta1Mocks.randomCluster1.status,
            conditions: [
              {
                status: 'True',
                type: 'Creating',
                lastTransitionTime: '2020-04-01T12:00:00Z',
              },
            ],
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
        providerCluster: capzv1beta1Mocks.randomAzureCluster1,
      })
    );

    expect(await screen.findByText('Cluster creating…')).toBeInTheDocument();
    expect(screen.queryByText('Upgrade in progress…')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade available')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade scheduled')).not.toBeInTheDocument();

    rerender(
      getComponent({
        cluster: {
          ...capiv1beta1Mocks.randomCluster1,
          status: {
            ...capiv1beta1Mocks.randomCluster1.status,
            conditions: [
              {
                status: 'True',
                type: 'Upgrading',
                reason: 'UpgradePending',
                lastTransitionTime: '2020-04-01T12:00:00Z',
              },
            ],
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
        providerCluster: capzv1beta1Mocks.randomAzureCluster1,
      })
    );

    expect(await screen.findByText('Upgrade in progress…')).toBeInTheDocument();
    expect(screen.queryByText('Cluster creating…')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade available')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade scheduled')).not.toBeInTheDocument();

    rerender(
      getComponent({
        cluster: {
          ...capiv1beta1Mocks.randomCluster1,
          status: {
            ...capiv1beta1Mocks.randomCluster1.status,
            conditions: [
              {
                status: 'False',
                type: 'Creating',
                reason: 'CreationCompleted',
                lastTransitionTime: '2020-04-01T12:00:00Z',
              },
              {
                status: 'True',
                type: 'Ready',
                lastTransitionTime: '2020-04-01T12:01:00Z',
              },
            ],
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
        providerCluster: capzv1beta1Mocks.randomAzureCluster1,
      })
    );

    expect(await screen.findByText('Upgrade available')).toBeInTheDocument();
    expect(screen.queryByText('Cluster creating…')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade in progress…')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade scheduled')).not.toBeInTheDocument();
  });

  it('displays information if an upgrade has been scheduled', async () => {
    const targetTime = `${format('dd MMM yy HH:mm')(
      add({ days: 1 })(new Date())
    )} UTC`;

    render(
      getComponent({
        cluster: {
          ...capiv1beta1Mocks.randomCluster1,
          metadata: {
            ...capiv1beta1Mocks.randomCluster1.metadata,
            annotations: {
              ...capiv1beta1Mocks.randomCluster1.metadata.annotations,
              'alpha.giantswarm.io/update-schedule-target-release': '15.0.0',
              'alpha.giantswarm.io/update-schedule-target-time': targetTime,
            },
          },
        },
        providerCluster: capzv1beta1Mocks.randomAzureCluster1,
      })
    );

    expect(await screen.findByText('Upgrade scheduled')).toBeInTheDocument();
    expect(screen.queryByText('Upgrade available')).not.toBeInTheDocument();
    expect(screen.queryByText('Upgrade in progress…')).not.toBeInTheDocument();
    expect(screen.queryByText('Cluster creating…')).not.toBeInTheDocument();
  });

  it(`does not display an available upgrade to preview releases`, () => {
    render(
      getComponent({
        cluster: {
          ...capiv1beta1Mocks.randomCluster1,
          metadata: {
            ...capiv1beta1Mocks.randomCluster1.metadata,
            labels: {
              ...capiv1beta1Mocks.randomCluster1.metadata.labels,
              'release.giantswarm.io/version': '15.0.0',
            },
          },
        },
        releases: releasev1alpha1Mocks.releasesList.items,
        providerCluster: capzv1beta1Mocks.randomAzureCluster1,
      })
    );
    expect(screen.queryByText('Upgrade available')).not.toBeInTheDocument();
  });
});

describe('ClusterListItem when user cannot create key pairs on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canCreate: false,
    });
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('does not displays the getting started button', () => {
    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster1,
        releases: releasev1alpha1Mocks.releasesList.items,
        canCreateClusters: false,
      })
    );

    expect(
      screen.queryByRole('button', { name: 'Get Started' })
    ).not.toBeInTheDocument();
  });
});

describe('ClusterListItem on AWS', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AWS;
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays various information about the cluster', () => {
    const creationDate = sub({
      hours: 1,
    })(new Date());

    render(
      getComponent({
        cluster: {
          ...capiv1beta1Mocks.randomClusterAWS1,
          metadata: {
            ...capiv1beta1Mocks.randomClusterAWS1.metadata,
            creationTimestamp: creationDate.toISOString(),
          },
        },
        providerCluster: infrav1alpha3Mocks.randomAWSCluster1,
        releases: releasev1alpha1Mocks.releasesList.items,
      })
    );

    expect(screen.getByLabelText('Name: c7hm5')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Description: Random Cluster')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Release version: 17.0.3')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Kubernetes version: no information available')
    ).toBeInTheDocument();
  });

  it('displays stats about worker nodes', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomClusterAWS1.metadata.namespace}/machinedeployments/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomClusterAWS1.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterAWS1MachineDeploymentList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${capiv1beta1Mocks.randomClusterAWS1MachineDeploymentList.items[0].metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${capiv1beta1Mocks.randomClusterAWS1MachineDeploymentList.items[1].metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment2
      );

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterAWS1,
      })
    );

    expect(await screen.findByText(/2 node pools/)).toBeInTheDocument();
    expect(await screen.findByText('6 worker nodes')).toBeInTheDocument();
    expect(await screen.findByText('24 CPU cores')).toBeInTheDocument();
    expect(await screen.findByText('96 GB RAM')).toBeInTheDocument();
  });
});

describe('ClusterListItem on GCP', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.GCP;
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays stats about worker nodes', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomClusterGCP1.metadata.namespace}/machinedeployments/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterGCP1.metadata.name}%2Ccluster.x-k8s.io%2Frole%21%3Dbastion`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterGCP1MachineDeploymentList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/gcpmachinetemplates/${capiv1beta1Mocks.randomClusterGCP1MachineDeploymentList.items[0].spec?.template.spec.infrastructureRef.name}/`
      )
      .reply(
        StatusCodes.Ok,
        capgv1beta1Mocks.randomClusterGCP1GCPMachineTemplate
      );

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterGCP1,
      })
    );

    expect(await screen.findByText(/1 node pool/)).toBeInTheDocument();
    expect(await screen.findByText('3 worker nodes')).toBeInTheDocument();
    expect(await screen.findByText('12 CPU cores')).toBeInTheDocument();
    expect(await screen.findByText('49.2 GB RAM')).toBeInTheDocument();
  });
});
