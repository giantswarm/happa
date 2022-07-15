import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Providers, StatusCodes } from 'model/constants';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as capgv1beta1Mocks from 'test/mockHttpCalls/capgv1beta1';
import * as capiexpv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3/exp';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import * as capzexpv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3/exp';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import * as infrav1alpha3Mocks from 'test/mockHttpCalls/infrastructurev1alpha3';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailWidgetWorkerNodes from '../ClusterDetailWidgetWorkerNodes';
import { usePermissionsForNodePools } from '../permissions/usePermissionsForNodePools';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWidgetWorkerNodes>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWidgetWorkerNodes {...p} />
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

describe('ClusterDetailWidgetWorkerNodes', () => {
  beforeAll(() => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

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
});

describe('ClusterDetailWidgetWorkerNodes on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays a placeholder if there are no node pools', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${capiv1beta1Mocks.randomCluster1.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster1.metadata.name}`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
        kind: capiexpv1alpha3.MachinePoolList,
        metadata: {},
        items: [],
      });

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster1,
      })
    );

    expect(await screen.findByText('No node pools')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add node pool' })
    ).toBeInTheDocument();
  });

  it('displays stats about node pools', async () => {
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
      })
    );

    expect(await screen.findByLabelText('2 node pools')).toBeInTheDocument();
    expect(await screen.findByLabelText('10 nodes')).toBeInTheDocument();
    expect(await screen.findByLabelText('80 CPUs')).toBeInTheDocument();
    expect(await screen.findByLabelText('172 GB RAM')).toBeInTheDocument();
  });

  it('displays stats about node pools with non-experimental MachinePools and AzureMachinePools', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomCluster3.metadata.namespace}/machinepools/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomCluster3.metadata.name}`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomCluster3MachinePoolList);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azuremachinepools/${capzv1beta1Mocks.randomCluster3AzureMachinePool1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomCluster3AzureMachinePool1);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster3,
      })
    );

    expect(await screen.findByLabelText('1 node pool')).toBeInTheDocument();
    expect(await screen.findByLabelText('2 nodes')).toBeInTheDocument();
    expect(await screen.findByLabelText('16 CPUs')).toBeInTheDocument();
    expect(await screen.findByLabelText('34 GB RAM')).toBeInTheDocument();
  });

  it('only displays a part of the stats if provider-specific resources fail to load', async () => {
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
      .reply(StatusCodes.NotFound, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Lolz',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.NotFound,
        code: StatusCodes.NotFound,
      });
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachinepools/${capzexpv1alpha3Mocks.randomCluster1AzureMachinePool2.metadata.name}/`
      )
      .reply(StatusCodes.NotFound, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Lolz',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.NotFound,
        code: StatusCodes.NotFound,
      });

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster1,
      })
    );

    expect(await screen.findByLabelText('2 node pools')).toBeInTheDocument();
    expect(await screen.findByLabelText('10 nodes')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('CPUs not available')
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText('GB RAM not available')
    ).toBeInTheDocument();
  });

  it('only displays a part of the stats if one of the machine types is unknown', async () => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );

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
      .reply(StatusCodes.Ok, {
        ...capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
        spec: {
          ...capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1.spec,
          template: {
            ...capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1.spec!
              .template,
            vmSize: 'random_stuff',
          },
        },
      });
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
      })
    );

    expect(await screen.findByLabelText('2 node pools')).toBeInTheDocument();
    expect(await screen.findByLabelText('10 nodes')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('CPUs not available')
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText('GB RAM not available')
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetWorkerNodes when user cannot create node pools on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canCreate: false,
    });
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('does not display the link button to add node pools if the user does not have permissions to do so', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${capiv1beta1Mocks.randomCluster1.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster1.metadata.name}`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
        kind: capiexpv1alpha3.MachinePoolList,
        metadata: {},
        items: [],
      });

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster1,
      })
    );

    expect(await screen.findByText('No node pools')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add node pool' })
    ).not.toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetWorkerNodes on AWS', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AWS;
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays stats about node pools', async () => {
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

    expect(await screen.findByLabelText('2 node pools')).toBeInTheDocument();
    expect(await screen.findByLabelText('6 nodes')).toBeInTheDocument();
    expect(await screen.findByLabelText('24 CPUs')).toBeInTheDocument();
    expect(await screen.findByLabelText('96 GB RAM')).toBeInTheDocument();
  });

  it('only displays a part of the stats if provider-specific resources fail to load', async () => {
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
      .reply(StatusCodes.NotFound);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${capiv1beta1Mocks.randomClusterAWS1MachineDeploymentList.items[1].metadata.name}/`
      )
      .reply(StatusCodes.NotFound);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterAWS1,
      })
    );

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterAWS1,
      })
    );

    expect(await screen.findByLabelText('2 node pools')).toBeInTheDocument();
    expect(await screen.findByLabelText('6 nodes')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('CPUs not available')
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText('GB RAM not available')
    ).toBeInTheDocument();
  });

  it('only displays a part of the stats if one of the machine types is unknown', async () => {
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
      .reply(StatusCodes.Ok, {
        ...infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment2,
        spec: {
          ...infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.spec,
          provider: {
            ...infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.spec
              .provider,
            worker: {
              ...infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.spec
                .provider.worker,
              instanceType: 'nonexistent-machine',
            },
          },
        },
      });

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterAWS1,
      })
    );

    expect(await screen.findByLabelText('2 node pools')).toBeInTheDocument();
    expect(await screen.findByLabelText('6 nodes')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('CPUs not available')
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText('GB RAM not available')
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetWorkerNodes on GCP', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.GCP;
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays stats about node pools', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterGCP1.metadata.name}%2Ccluster.x-k8s.io%2Frole%21%3Dbastion`
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

    expect(await screen.findByLabelText('1 node pool')).toBeInTheDocument();
    expect(await screen.findByLabelText('3 nodes')).toBeInTheDocument();
    expect(await screen.findByLabelText('12 CPUs')).toBeInTheDocument();
    expect(await screen.findByLabelText('49 GB RAM')).toBeInTheDocument();
  });

  it('only displays a part of the stats if provider-specific resources fail to load', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterGCP1.metadata.name}%2Ccluster.x-k8s.io%2Frole%21%3Dbastion`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterGCP1MachineDeploymentList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/gcpmachinetemplates/${capiv1beta1Mocks.randomClusterGCP1MachineDeploymentList.items[0].spec?.template.spec.infrastructureRef.name}/`
      )
      .reply(StatusCodes.NotFound, {});

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterGCP1,
      })
    );

    expect(await screen.findByLabelText('1 node pool')).toBeInTheDocument();
    expect(await screen.findByLabelText('3 nodes')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('CPUs not available')
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText('GB RAM not available')
    ).toBeInTheDocument();
  });

  it('only displays a part of the stats if one of the machine types is unknown', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterGCP1.metadata.name}%2Ccluster.x-k8s.io%2Frole%21%3Dbastion`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterGCP1MachineDeploymentList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/gcpmachinetemplates/${capiv1beta1Mocks.randomClusterGCP1MachineDeploymentList.items[0].spec?.template.spec.infrastructureRef.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...capgv1beta1Mocks.randomClusterGCP1GCPMachineTemplate,
        spec: {
          ...capgv1beta1Mocks.randomClusterGCP1GCPMachineTemplate,
          template: {
            ...capgv1beta1Mocks.randomClusterGCP1GCPMachineTemplate.spec!
              .template,
            spec: {
              ...capgv1beta1Mocks.randomClusterGCP1GCPMachineTemplate.spec!
                .template.spec,
              instanceType: 'nonexistent-type',
            },
          },
        },
      });

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterGCP1,
      })
    );

    expect(await screen.findByLabelText('1 node pool')).toBeInTheDocument();
    expect(await screen.findByLabelText('3 nodes')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('CPUs not available')
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText('GB RAM not available')
    ).toBeInTheDocument();
  });
});
