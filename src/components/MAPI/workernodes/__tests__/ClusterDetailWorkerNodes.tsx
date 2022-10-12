import { render, screen, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import Router from 'react-router';
import { SWRConfig } from 'swr';
import * as capav1beta1Mocks from 'test/mockHttpCalls/capav1beta1';
import * as capgv1beta1Mocks from 'test/mockHttpCalls/capgv1beta1';
import * as capiexpv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3/exp';
import * as mockCapiv1beta1 from 'test/mockHttpCalls/capiv1beta1';
import * as capzexpv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3/exp';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import * as infrav1alpha3Mocks from 'test/mockHttpCalls/infrastructurev1alpha3';
import * as releasev1alpha1Mocks from 'test/mockHttpCalls/releasev1alpha1';
import * as securityv1alpha1Mocks from 'test/mockHttpCalls/securityv1alpha1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import { usePermissionsForClusters } from '../../clusters/permissions/usePermissionsForClusters';
import ClusterDetailWorkerNodes from '../ClusterDetailWorkerNodes';
import { usePermissionsForNodePools } from '../permissions/usePermissionsForNodePools';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWorkerNodes>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWorkerNodes {...p} />
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

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn(),
}));

const useParamsMockFn = jest.spyOn(Router, 'useParams');

jest.unmock('model/services/mapi/securityv1alpha1/getOrganization');

jest.mock('MAPI/workernodes/permissions/usePermissionsForNodePools');
jest.mock('MAPI/clusters/permissions/usePermissionsForClusters');

describe('ClusterDetailWorkerNodes', () => {
  beforeAll(() => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  beforeEach(() => {
    useParamsMockFn.mockReturnValue({
      orgId: 'org1',
      clusterId: mockCapiv1beta1.randomCluster1.metadata.name,
    });
  });

  afterEach(() => {
    useParamsMockFn.mockRestore();
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });
});

describe('ClusterDetailWorkerNodes on Azure', () => {
  beforeAll(() => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  beforeEach(() => {
    useParamsMockFn.mockReturnValue({
      orgId: 'org1',
      clusterId: mockCapiv1beta1.randomCluster1.metadata.name,
    });
  });

  afterEach(() => {
    useParamsMockFn.mockRestore();
  });

  it('displays a list of node pools', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster1);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${mockCapiv1beta1.randomCluster1.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${mockCapiv1beta1.randomCluster1.metadata.name}`
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
        capzexpv1alpha3Mocks.randomCluster1AzureMachinePoolList
      );
    render(getComponent({}));

    expect(
      await screen.findByLabelText(
        `Name: ${capzexpv1alpha3Mocks.randomCluster1AzureMachinePoolList.items[0].metadata.name}`
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(
        `Name: ${capzexpv1alpha3Mocks.randomCluster1AzureMachinePoolList.items[1].metadata.name}`
      )
    ).toBeInTheDocument();
  });

  it('displays a list of node pools for Azure clusters using release v17.1.0 or newer', async () => {
    useParamsMockFn.mockReturnValue({
      orgId: 'org1',
      clusterId: mockCapiv1beta1.randomCluster3.metadata.name,
    });
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster3.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster3);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${mockCapiv1beta1.randomCluster3.metadata.namespace}/machinepools/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${mockCapiv1beta1.randomCluster3.metadata.name}`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster3MachinePoolList);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azuremachinepools/${capzv1beta1Mocks.randomCluster3AzureMachinePool1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        capzv1beta1Mocks.randomCluster3AzureMachinePoolList
      );
    render(getComponent({}));

    expect(
      await screen.findByLabelText(
        `Name: ${capzv1beta1Mocks.randomCluster3AzureMachinePoolList.items[0].metadata.name}`
      )
    ).toBeInTheDocument();
  });

  it('displays an error message if the list of node pools could not be fetched', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${mockCapiv1beta1.randomCluster1.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${mockCapiv1beta1.randomCluster1.metadata.name}`
      )
      .reply(StatusCodes.NotFound, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Lolz',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.NotFound,
        code: StatusCodes.NotFound,
      });

    render(getComponent({}));

    expect(
      await screen.findByText('There was a problem loading node pools.')
    ).toBeInTheDocument();
  });

  it('displays a placeholder if there are no node pools', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${mockCapiv1beta1.randomCluster1.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${mockCapiv1beta1.randomCluster1.metadata.name}`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
        kind: 'MachinePoolList',
        metadata: {},
        items: [],
      });

    render(getComponent({}));

    expect(
      await screen.findByText(
        'Add at least one node pool to the cluster so you could run workloads'
      )
    ).toBeInTheDocument();
  });

  it('does not allow a read-only user to add node pools', async () => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canUpdate: false,
      canCreate: false,
      canDelete: false,
    });
    (usePermissionsForClusters as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canUpdate: false,
      canCreate: false,
      canDelete: false,
    });

    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${mockCapiv1beta1.randomCluster1.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${mockCapiv1beta1.randomCluster1.metadata.name}`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
        kind: 'MachinePoolList',
        metadata: {},
        items: [],
      });

    render(getComponent({}));

    expect(
      await screen.findByRole('button', { name: 'Add node pool' })
    ).toBeDisabled();
  });

  it('displays a warning message for a node pool using cgroups version 1', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster1);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${mockCapiv1beta1.randomCluster1.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${mockCapiv1beta1.randomCluster1.metadata.name}`
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
        capzexpv1alpha3Mocks.randomCluster1AzureMachinePoolList
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/release.giantswarm.io/v1alpha1/releases/v${
          mockCapiv1beta1.randomCluster1.metadata.labels![
            capiv1beta1.labelReleaseVersion
          ]
        }/`
      )
      .reply(StatusCodes.Ok, {
        ...releasev1alpha1Mocks.v14_0_1,
        name: `v${
          mockCapiv1beta1.randomCluster1.metadata.labels![
            capiv1beta1.labelReleaseVersion
          ]
        }`,
      });

    render(getComponent({}));

    expect(
      await screen.findByLabelText(
        `Name: ${capzexpv1alpha3Mocks.randomCluster1AzureMachinePoolList.items[0].metadata.name}`
      )
    ).toBeInTheDocument();

    const firstNodePoolCGroupsLabel = (
      await screen.findAllByLabelText('Control groups version: v1')
    )[0];

    expect(firstNodePoolCGroupsLabel).toBeInTheDocument();

    expect(
      within(firstNodePoolCGroupsLabel).getByLabelText(
        'Warning: This node pool uses the deprecated control groups version 1.'
      )
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWorkerNodes on AWS', () => {
  beforeAll(() => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  beforeEach(() => {
    useParamsMockFn.mockReturnValue({
      orgId: 'org1',
      clusterId: mockCapiv1beta1.randomClusterAWS1.metadata.name,
    });
  });

  afterEach(() => {
    useParamsMockFn.mockRestore();
  });

  it('displays a list of node pools', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomClusterAWS1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomClusterAWS1);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${mockCapiv1beta1.randomClusterAWS1.metadata.namespace}/machinedeployments/?labelSelector=giantswarm.io%2Fcluster%3D${mockCapiv1beta1.randomClusterAWS1.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        mockCapiv1beta1.randomClusterAWS1MachineDeploymentList
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${
          mockCapiv1beta1.randomClusterAWS1MachineDeployment1.spec!.template
            .spec.infrastructureRef.name
        }/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${
          mockCapiv1beta1.randomClusterAWS1MachineDeployment2.spec!.template
            .spec.infrastructureRef.name
        }/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment2
      );

    render(getComponent({}));

    expect(
      await screen.findByLabelText(
        `Name: ${mockCapiv1beta1.randomClusterAWS1MachineDeploymentList.items[0].metadata.name}`
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(
        `Name: ${mockCapiv1beta1.randomClusterAWS1MachineDeploymentList.items[1].metadata.name}`
      )
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWorkerNodes on CAPA', () => {
  beforeAll(() => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  beforeEach(() => {
    useParamsMockFn.mockReturnValue({
      orgId: 'org1',
      clusterId: mockCapiv1beta1.randomClusterCAPA1.metadata.name,
    });
  });

  afterEach(() => {
    useParamsMockFn.mockRestore();
  });

  it('displays a list of node pools', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomClusterCAPA1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomClusterCAPA1);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinepools/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${mockCapiv1beta1.randomClusterCAPA1.metadata.name}`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomClusterCAPA1MachinePoolList);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/awsmachinepools/${mockCapiv1beta1.randomClusterCAPA1MachinePoolList.items[0].spec?.template.spec?.infrastructureRef.name}/`
      )
      .reply(StatusCodes.Ok, capav1beta1Mocks.randomClusterCAPA1AWSMachinePool);

    render(getComponent({}));

    expect(
      await screen.findByLabelText(
        `Name: ${mockCapiv1beta1.randomClusterCAPA1MachinePoolList.items[0].metadata.name}`
      )
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWorkerNodes on GCP', () => {
  beforeAll(() => {
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  beforeEach(() => {
    useParamsMockFn.mockReturnValue({
      orgId: 'org1',
      clusterId: mockCapiv1beta1.randomClusterGCP1.metadata.name,
    });
  });

  afterEach(() => {
    useParamsMockFn.mockRestore();
  });

  it('displays a list of node pools', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomClusterGCP1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomClusterGCP1);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${mockCapiv1beta1.randomClusterGCP1.metadata.name}%2Ccluster.x-k8s.io%2Frole%21%3Dbastion`
      )
      .reply(
        StatusCodes.Ok,
        mockCapiv1beta1.randomClusterGCP1MachineDeploymentList
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/gcpmachinetemplates/${
          mockCapiv1beta1.randomClusterGCP1MachineDeployment1.spec!.template
            .spec.infrastructureRef.name
        }/`
      )
      .reply(
        StatusCodes.Ok,
        capgv1beta1Mocks.randomClusterGCP1GCPMachineTemplate
      );

    render(getComponent({}));

    expect(
      await screen.findByLabelText(
        `Name: ${mockCapiv1beta1.randomClusterGCP1MachineDeploymentList.items[0].metadata.name}`
      )
    ).toBeInTheDocument();
  });
});
