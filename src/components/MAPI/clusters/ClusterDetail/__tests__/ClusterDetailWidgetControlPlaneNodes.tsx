import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { SWRConfig } from 'swr';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import * as capzv1alpha3Mocks from 'testUtils/mockHttpCalls/capzv1alpha3';
import { getComponentWithStore } from 'testUtils/renderUtils';

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

describe('ClusterDetailWidgetControlPlaneNodes', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays loading animations if the cluster is still loading', () => {
    render(
      getComponent({
        cluster: undefined,
      })
    );

    expect(screen.getAllByLabelText('Loading...').length).toEqual(2);
  });

  it('displays the number of control plane nodes that are ready on Azure', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster2.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList2);

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster2,
      })
    );

    expect(
      await screen.findByLabelText('0 of 1 control plane node ready')
    ).toBeInTheDocument();
  });

  it('displays if all control planes are ready on Azure', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList1);

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
      })
    );

    expect(
      await screen.findByLabelText('Control plane node ready')
    ).toBeInTheDocument();
  });

  it('displays if the cluster is not in an availability zone', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster2.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList2);

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster2,
      })
    );

    expect(await screen.findByText('Availability zones'));
    expect(await screen.findByLabelText('no information available'));
  });

  it(`displays the cluster's availability zone`, async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList1);

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
      })
    );

    expect(await screen.findByText('Availability zone'));
    expect(await screen.findByText('2'));
  });
});
