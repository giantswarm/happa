import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { SWRConfig } from 'swr';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import * as capiexpv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3/exp';
import * as capzexpv1alpha3Mocks from 'testUtils/mockHttpCalls/capzv1alpha3/exp';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ClusterDetailWidgetWorkerNodes from '../ClusterDetailWidgetWorkerNodes';

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

describe('ClusterDetailWidgetWorkerNodes', () => {
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

  it('displays a placeholder if there are no node pools', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
        kind: capiexpv1alpha3.MachinePoolList,
        metadata: {},
        items: [],
      });

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
      })
    );

    expect(await screen.findByText('No node pools')).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        return (
          node?.textContent ===
          'To create node pools, switch to the worker nodes tab.'
        );
      })
    ).toBeInTheDocument();
  });

  it('displays stats about node pools', async () => {
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
      })
    );

    expect(await screen.findByLabelText('2 node pools')).toBeInTheDocument();
    expect(await screen.findByLabelText('10 nodes')).toBeInTheDocument();
    expect(await screen.findByLabelText('80 CPUs')).toBeInTheDocument();
    expect(await screen.findByLabelText('172 GB RAM')).toBeInTheDocument();
  });

  it('only displays a part of the stats if provider-specific resources fail to load', async () => {
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
        cluster: capiv1alpha3Mocks.randomCluster1,
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
        cluster: capiv1alpha3Mocks.randomCluster1,
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
