import { render, screen, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as capiexpv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3/exp';
import * as mockCapiv1beta1 from 'test/mockHttpCalls/capiv1beta1';
import * as capzexpv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3/exp';
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
  useParams: jest.fn().mockReturnValue({
    orgId: 'org1',
    clusterId: mockCapiv1beta1.randomCluster1.metadata.name,
  }),
}));

jest.unmock('model/services/mapi/securityv1alpha1/getOrganization');

jest.mock('MAPI/workernodes/permissions/usePermissionsForNodePools');
jest.mock('MAPI/clusters/permissions/usePermissionsForClusters');

describe('ClusterDetailWorkerNodes', () => {
  // eslint-disable-next-line no-magic-numbers
  jest.setTimeout(10000);
  (usePermissionsForNodePools as jest.Mock).mockReturnValue(defaultPermissions);
  (usePermissionsForClusters as jest.Mock).mockReturnValue(defaultPermissions);

  it('renders without crashing', () => {
    render(getComponent({}));
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
});

it('displays a warning message for a node pool using cgroups version 1', async () => {
  nock(window.config.mapiEndpoint)
    .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
    .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
  nock(window.config.mapiEndpoint)
    .get(
      `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
    )
    .reply(StatusCodes.Ok, {
      ...mockCapiv1beta1.randomCluster1,
      metadata: mockCapiv1beta1.randomCluster1.metadata,
    });
  nock(window.config.mapiEndpoint)
    .get(
      `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${mockCapiv1beta1.randomCluster1.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${mockCapiv1beta1.randomCluster1.metadata.name}`
    )
    .reply(StatusCodes.Ok, capiexpv1alpha3Mocks.randomCluster1MachinePoolList);
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
