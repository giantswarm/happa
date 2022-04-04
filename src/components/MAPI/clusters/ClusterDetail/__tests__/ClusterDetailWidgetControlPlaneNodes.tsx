import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import { usePermissionsForCPNodes } from '../../permissions/usePermissionsForCPNodes';
import ClusterDetailWidgetControlPlaneNodes from '../ClusterDetailWidgetControlPlaneNodes';

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailWidgetControlPlaneNodes
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWidgetControlPlaneNodes {...p} />
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

jest.mock('MAPI/clusters/permissions/usePermissionsForCPNodes');

describe('ClusterDetailWidgetControlPlaneNodes', () => {
  it('renders without crashing', () => {
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);

    render(getComponent({}));
  });

  it('displays loading animations if the cluster is still loading', () => {
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);

    render(
      getComponent({
        cluster: undefined,
      })
    );

    expect(screen.getAllByLabelText('Loading...').length).toEqual(2);
  });

  it('displays the number of control plane nodes that are ready on Azure', async () => {
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomCluster2.metadata.namespace}/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster2.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList2);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster2,
      })
    );

    expect(
      await screen.findByLabelText('0 of 1 control plane node ready')
    ).toBeInTheDocument();
  });

  it('displays if all control planes are ready on Azure', async () => {
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomCluster2.metadata.namespace}/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList1);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster1,
      })
    );

    expect(
      await screen.findByLabelText('Control plane node ready')
    ).toBeInTheDocument();
  });

  it('displays if the cluster is not in an availability zone', async () => {
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomCluster2.metadata.namespace}/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster2.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList2);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster2,
      })
    );

    expect(await screen.findByText('Availability zones'));
    expect(await screen.findByLabelText('no information available'));
  });

  it(`displays the cluster's availability zone`, async () => {
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomCluster2.metadata.namespace}/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList1);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster1,
      })
    );

    expect(await screen.findByText('Availability zone'));
    expect(await screen.findByText('2'));
  });
});
