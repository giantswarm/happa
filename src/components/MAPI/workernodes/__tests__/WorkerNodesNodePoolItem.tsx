import { fireEvent, render, screen } from '@testing-library/react';
import sub from 'date-fns/fp/sub';
import { createMemoryHistory } from 'history';
import { Providers, StatusCodes } from 'model/constants';
import { Constants } from 'model/constants';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as capiexpv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3/exp';
import * as capzexpv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3/exp';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import { getAdditionalColumns } from '../ClusterDetailWorkerNodes';
import WorkerNodesNodePoolItem from '../WorkerNodesNodePoolItem';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof WorkerNodesNodePoolItem>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <WorkerNodesNodePoolItem {...p} />
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

describe('WorkerNodesNodePoolItem', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays a loading animation if the node pool is not loaded yet', () => {
    render(getComponent({}));

    expect(screen.getAllByLabelText('Loading...').length).toEqual(9);
  });

  it('displays if a node pool has been deleted', () => {
    const deletionDate = sub({
      hours: 1,
    })(new Date());

    render(
      getComponent({
        nodePool: {
          ...capiexpv1alpha3Mocks.randomCluster1MachinePool1,
          metadata: {
            ...capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata,
            deletionTimestamp: deletionDate.toISOString(),
          },
        },
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      })
    );

    expect(
      screen.getByText((_, node) => {
        if (!node) return false;

        const hasText = (n: Element) =>
          n.textContent === 'Deleted about 1 hour ago';
        const hasTextInChildren = Array.from(node.children).some((child) =>
          hasText(child)
        );

        return hasText(node) && !hasTextInChildren;
      })
    ).toBeInTheDocument();
  });

  it('displays various information about the node pool', () => {
    render(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
        flatcarContainerLinuxVersion:
          Constants.FLATCAR_CONTAINERLINUX_CGROUP_V2_VERSION,
      })
    );

    expect(screen.getByLabelText('Name: t6yo9')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Description: Some node pool')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('VM size: Standard_A8_v2')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Control groups version: v2')
    ).toBeInTheDocument();

    expect(screen.getByLabelText('Availability zones: 1')).toBeInTheDocument();
  });

  it('displays the lack of availability zones', () => {
    render(
      getComponent({
        nodePool: {
          ...capiexpv1alpha3Mocks.randomCluster1MachinePool1,
          spec: {
            ...capiexpv1alpha3Mocks.randomCluster1MachinePool1.spec!,
            failureDomains: undefined,
          },
        },
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      })
    );

    expect(
      screen.getByLabelText('Availability zones: not available')
    ).toBeInTheDocument();
  });

  it('displays the autoscaler configuration', () => {
    render(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      })
    );

    expect(
      screen.getByLabelText('Autoscaler minimum node count: 3')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Autoscaler maximum node count: 10')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Autoscaler target node count: 3')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Autoscaler current node count: 2')
    ).toBeInTheDocument();
  });

  it('displays if spot instances are used', () => {
    const { rerender } = render(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
        additionalColumns: getAdditionalColumns(Providers.AZURE),
      })
    );

    expect(
      screen.getByLabelText('Spot virtual machines disabled')
    ).toBeInTheDocument();

    rerender(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: {
          ...capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
          spec: {
            ...capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1.spec!,
            template: {
              ...capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1.spec!
                .template,
              spotVMOptions: {
                maxPrice: '-1',
              },
            },
          },
        },
        additionalColumns: getAdditionalColumns(Providers.AZURE),
      })
    );

    expect(
      screen.getByLabelText('Spot virtual machines enabled')
    ).toBeInTheDocument();
  });

  it('displays full name if the name is too short to be truncated', () => {
    render(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      })
    );

    expect(screen.getByLabelText('Name: t6yo9')).toHaveTextContent('t6yo9');
  });

  it('displays truncated name with a tooltip if the name is long', () => {
    render(
      getComponent({
        nodePool: {
          ...capiexpv1alpha3Mocks.randomCluster1MachinePool1,
          metadata: {
            ...capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata,
            name: 'qwertyuiopq',
          },
        },
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      })
    );

    expect(screen.getByLabelText('Name: qwertyuiopq')).toHaveTextContent(
      'qwer…uiopq'
    );
    const label: HTMLSpanElement = screen.getByText('qwer…uiopq');
    fireEvent.mouseOver(label);
    expect(screen.getByText('qwertyuiopq')).toBeInTheDocument();
  });

  it('can delete a node pool', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/machinepools/${capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiexpv1alpha3Mocks.randomCluster1MachinePool1);

    nock(window.config.mapiEndpoint)
      .delete(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/machinepools/${capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata.name}/`
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
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
        canDeleteNodePools: true,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(await screen.findByText('Delete'));

    expect(
      await screen.findByText('Do you really want to delete node pool t6yo9?')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete t6yo9' }));

    expect(
      await withMarkup(screen.findByText)(
        'Node pool t6yo9 deleted successfully'
      )
    ).toBeInTheDocument();

    jest.clearAllTimers();
  });

  it('does not allow deleting the node pool for a read-only user', async () => {
    render(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
        canDeleteNodePools: false,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(await screen.findByText('Delete'));

    expect(
      screen.queryByText('Do you really want to delete node pool t6yo9?')
    ).not.toBeInTheDocument();
  });

  it('can edit the node pool description by clicking on the description', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/machinepools/${capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiexpv1alpha3Mocks.randomCluster1MachinePool1);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/machinepools/${capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiexpv1alpha3Mocks.randomCluster1MachinePool1);

    render(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
        canUpdateNodePools: true,
      })
    );

    fireEvent.click(screen.getByText('Some node pool'));
    fireEvent.change(screen.getByDisplayValue('Some node pool'), {
      target: { value: 'A random node pool' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(
      await screen.findByText(
        `Successfully updated the node pool's description`
      )
    ).toBeInTheDocument();
  });

  it('does not allow editing the node pool description for a read-only user', () => {
    render(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
        canUpdateNodePools: false,
      })
    );

    fireEvent.click(screen.getByText('Some node pool'));

    expect(
      screen.queryByRole('button', { name: 'OK' })
    ).not.toBeInTheDocument();
  });

  it('can change the node pool scaling', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/machinepools/${capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiexpv1alpha3Mocks.randomCluster1MachinePool1);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/machinepools/${capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiexpv1alpha3Mocks.randomCluster1MachinePool1);

    render(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
        canUpdateNodePools: true,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(await screen.findByText('Edit scaling limits'));

    fireEvent.change(await screen.findByLabelText('Minimum'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Maximum'), {
      target: { value: '1' },
    });

    expect(
      screen.getByText(
        'The node pool currently has 3 worker nodes running. By setting the maximum lower than that, you enforce the removal of 2 nodes. This could result in unscheduled workloads.'
      )
    ).toBeInTheDocument();

    let submitButton = screen.getByRole('button', { name: 'Remove 2 nodes' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    fireEvent.change(await screen.findByLabelText('Minimum'), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText('Maximum'), {
      target: { value: '4' },
    });

    expect(
      screen.queryByText(
        'The node pool currently has 3 worker nodes running. By setting the maximum lower than that, you enforce the removal of 2 nodes. This could result in unscheduled workloads.'
      )
    ).not.toBeInTheDocument();

    submitButton = screen.getByRole('button', {
      name: 'Increase minimum number of nodes by 1',
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    fireEvent.change(await screen.findByLabelText('Minimum'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('Maximum'), {
      target: { value: '20' },
    });

    expect(
      screen.queryByText(
        'The node pool currently has 3 worker nodes running. By setting the maximum lower than that, you enforce the removal of 2 nodes. This could result in unscheduled workloads.'
      )
    ).not.toBeInTheDocument();

    submitButton = screen.getByRole('button', {
      name: 'Apply',
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    expect(
      await withMarkup(screen.findByText)(
        'Node pool t6yo9 updated successfully'
      )
    ).toBeInTheDocument();

    jest.clearAllTimers();
  });

  it('does not allow editing the node pool scaling limits for a read-only user', async () => {
    render(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
        canUpdateNodePools: false,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(await screen.findByText('Edit scaling limits'));

    // Controls for editing the node pool scaling limits
    expect(screen.queryByLabelText('Minimum')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Maximum')).not.toBeInTheDocument();
  });
});
