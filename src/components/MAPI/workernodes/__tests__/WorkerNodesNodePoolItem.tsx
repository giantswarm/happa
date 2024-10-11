import { fireEvent, render, screen } from '@testing-library/react';
import sub from 'date-fns/fp/sub';
import { createMemoryHistory } from 'history';
import { ProviderFlavors, Providers, StatusCodes } from 'model/constants';
import { Constants } from 'model/constants';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as capav1beta2Mocks from 'test/mockHttpCalls/capav1beta2';
import * as capgv1beta1Mocks from 'test/mockHttpCalls/capgv1beta1';
import * as capiexpv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3/exp';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import * as capzexpv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3/exp';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import * as infrav1alpha3Mocks from 'test/mockHttpCalls/infrastructurev1alpha3';
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
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays a loading animation if the node pool is not loaded yet', () => {
    render(getComponent({}));

    expect(screen.getAllByLabelText('Loading...').length).toEqual(9);
  });

  it('displays a note when node pool is managed through GitOps', () => {
    const { rerender } = render(
      getComponent({
        nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      })
    );

    expect(
      screen.queryByLabelText('Managed through GitOps. Click to learn more.')
    ).not.toBeInTheDocument();

    rerender(
      getComponent({
        nodePool: {
          ...capiexpv1alpha3Mocks.randomCluster1MachinePool1,
          metadata: {
            ...capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata,
            labels: {
              ...capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata
                .labels,
              'kustomize.toolkit.fluxcd.io/namespace': 'default',
            },
          },
        },
        providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      })
    );

    expect(
      screen.getByLabelText('Managed through GitOps. Click to learn more.')
    ).toBeInTheDocument();
  });
});

describe('WorkerNodesNodePoolItem on Azure', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
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
        additionalColumns: getAdditionalColumns(
          capiv1beta1Mocks.randomCluster1
        ),
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
        additionalColumns: getAdditionalColumns(
          capiv1beta1Mocks.randomCluster1
        ),
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

  it('can delete a node pool with non-experimental MachinePools and AzureMachinePools', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinepools/${capiv1beta1Mocks.randomCluster3MachinePool1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomCluster3MachinePool1);

    nock(window.config.mapiEndpoint)
      .delete(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinepools/${capiv1beta1Mocks.randomCluster3MachinePool1.metadata.name}/`
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
        nodePool: capiv1beta1Mocks.randomCluster3MachinePool1,
        providerNodePool: capzv1beta1Mocks.randomCluster3AzureMachinePool1,
        canDeleteNodePools: true,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(await screen.findByText('Delete'));

    expect(
      await screen.findByText('Do you really want to delete node pool a8s10?')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete a8s10' }));

    expect(
      await withMarkup(screen.findByText)(
        'Node pool a8s10 deleted successfully'
      )
    ).toBeInTheDocument();

    jest.clearAllTimers();
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

  it('can change the scaling for a node pool with non-experimental MachinePools and AzureMachinePools', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinepools/${capiv1beta1Mocks.randomCluster3MachinePool1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomCluster3MachinePool1);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinepools/${capiv1beta1Mocks.randomCluster3MachinePool1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomCluster3MachinePool1);

    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomCluster3MachinePool1,
        providerNodePool: capzv1beta1Mocks.randomCluster3AzureMachinePool1,
        canUpdateNodePools: true,
      })
    );

    expect(
      screen.getByLabelText('Autoscaler minimum node count: 3')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Autoscaler maximum node count: 10')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(await screen.findByText('Edit scaling limits'));

    fireEvent.change(screen.getByLabelText('Maximum'), {
      target: { value: '11' },
    });

    const submitButton = screen.getByRole('button', {
      name: 'Apply',
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    expect(
      await withMarkup(screen.findByText)(
        'Node pool a8s10 updated successfully'
      )
    ).toBeInTheDocument();
  });
});

describe('WorkerNodesNodePoolItem on Azure for user with read-only permissions', () => {
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
});

describe('WorkerNodesNodePoolItem on AWS', () => {
  it('displays various information about the node pool', () => {
    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterAWS1MachineDeployment1,
        providerNodePool:
          infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1,
        flatcarContainerLinuxVersion: '3000.0',
      })
    );

    expect(screen.getByLabelText('Name: 4snbn')).toBeInTheDocument();
    expect(screen.getByLabelText('Description: workload')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Instance type: m4.xlarge')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Control groups version: v1')
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Availability zones: eu-central-1b, eu-central-1a')
    ).toBeInTheDocument();
  });

  it('displays the autoscaler configuration', () => {
    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterAWS1MachineDeployment1,
        providerNodePool:
          infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1,
      })
    );

    expect(
      screen.getByLabelText('Autoscaler minimum node count: 1')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Autoscaler maximum node count: 40')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Autoscaler target node count: 3')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Autoscaler current node count: 3')
    ).toBeInTheDocument();
  });

  it('displays if spot instances are used', () => {
    const { rerender } = render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterAWS1MachineDeployment1,
        providerNodePool:
          infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1,
        additionalColumns: getAdditionalColumns(
          capiv1beta1Mocks.randomClusterAWS1
        ),
      })
    );

    expect(
      screen.getByLabelText('Number of nodes using spot instances: 0')
    ).toBeInTheDocument();

    rerender(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterAWS1MachineDeployment1,
        providerNodePool: {
          ...infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1,
          status: {
            ...infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.status,
            provider: {
              worker: {
                spotInstances: 2,
              },
            },
          },
        },
        additionalColumns: getAdditionalColumns(
          capiv1beta1Mocks.randomClusterAWS1
        ),
      })
    );

    expect(
      screen.getByLabelText('Number of nodes using spot instances: 2')
    ).toBeInTheDocument();
  });

  it('can delete a node pool', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/${capiv1beta1Mocks.randomClusterAWS1MachineDeployment1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterAWS1MachineDeployment1
      );
    nock(window.config.mapiEndpoint)
      .delete(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/${capiv1beta1Mocks.randomClusterAWS1MachineDeployment1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Resource deleted.',
        status: metav1.K8sStatuses.Success,
        reason: '',
        code: StatusCodes.Ok,
      });
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1
      );
    nock(window.config.mapiEndpoint)
      .delete(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.metadata.name}/`
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
        nodePool: capiv1beta1Mocks.randomClusterAWS1MachineDeployment1,
        providerNodePool:
          infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1,
        canDeleteNodePools: true,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(await screen.findByText('Delete'));

    expect(
      await screen.findByText('Do you really want to delete node pool 4snbn?')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete 4snbn' }));

    expect(
      await withMarkup(screen.findByText)(
        'Node pool 4snbn deleted successfully'
      )
    ).toBeInTheDocument();

    jest.clearAllTimers();
  });

  it('can edit the node pool description by clicking on the description', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1
      );
    nock(window.config.mapiEndpoint)
      .put(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomClusterAWS1.metadata.namespace}/machinedeployments/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomClusterAWS1.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterAWS1MachineDeploymentList
      );

    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterAWS1MachineDeployment1,
        providerNodePool:
          infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1,
        canUpdateNodePools: true,
      })
    );

    fireEvent.click(screen.getByText('workload'));
    fireEvent.change(screen.getByDisplayValue('workload'), {
      target: { value: 'A random node pool' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(
      await screen.findByText(
        `Successfully updated the node pool's description`
      )
    ).toBeInTheDocument();
  });

  it('can change the node pool scaling', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1
      );
    nock(window.config.mapiEndpoint)
      .put(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomClusterAWS1.metadata.namespace}/machinedeployments/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomClusterAWS1.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterAWS1MachineDeploymentList
      );

    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterAWS1MachineDeployment1,
        providerNodePool:
          infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1,
        canUpdateNodePools: true,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(await screen.findByText('Edit scaling limits'));

    fireEvent.change(await screen.findByLabelText('Minimum'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('Maximum'), {
      target: { value: '20' },
    });

    const submitButton = screen.getByRole('button', {
      name: 'Apply',
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    expect(
      await withMarkup(screen.findByText)(
        'Node pool 4snbn updated successfully'
      )
    ).toBeInTheDocument();

    jest.clearAllTimers();
  });
});

describe('WorkerNodesNodePoolItem on CAPA', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPA;
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays various information about the node pool', () => {
    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterCAPA1MachinePool1,
        providerNodePool: capav1beta2Mocks.randomClusterCAPA1AWSMachinePool,
      })
    );

    expect(
      screen.getByLabelText('Name: asdf1-machine-pool0')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Description: workers')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Instance type: m5.xlarge')
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        'Availability zones: eu-west-2a, eu-west-2b, eu-west-2c'
      )
    ).toBeInTheDocument();
  });

  it('displays the autoscaler configuration', () => {
    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterCAPA1MachinePool1,
        providerNodePool: capav1beta2Mocks.randomClusterCAPA1AWSMachinePool,
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
      screen.getByLabelText('Autoscaler current node count: 3')
    ).toBeInTheDocument();
  });

  it('displays information about instances distribution', () => {
    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterCAPA1MachinePool1,
        providerNodePool: capav1beta2Mocks.randomClusterCAPA1AWSMachinePool,
        additionalColumns: getAdditionalColumns(
          capiv1beta1Mocks.randomClusterCAPA1
        ),
      })
    );

    const spotInstancesDisabledLabel = screen.getByLabelText(
      'Spot instances disabled'
    );
    expect(spotInstancesDisabledLabel).toBeInTheDocument();

    fireEvent.mouseOver(spotInstancesDisabledLabel);

    expect(screen.getByText('Spot instances disabled')).toBeInTheDocument();
    expect(
      screen.getByText('On-demand base capacity: 100')
    ).toBeInTheDocument();
    expect(screen.getByText('Spot instance percentage: 0')).toBeInTheDocument();
  });

  it('displays if spot instances are used', () => {
    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterCAPA1MachinePool1,
        providerNodePool: capav1beta2Mocks.randomClusterCAPA1AWSMachinePoolSpot,
        additionalColumns: getAdditionalColumns(
          capiv1beta1Mocks.randomClusterCAPA1
        ),
      })
    );

    const spotInstancesEnabledLabel = screen.getByLabelText(
      'Spot instances enabled'
    );
    expect(spotInstancesEnabledLabel).toBeInTheDocument();

    fireEvent.mouseOver(spotInstancesEnabledLabel);

    expect(screen.getByText('Spot instances enabled')).toBeInTheDocument();
    expect(screen.getByText('Using maximum price: $0.90'));
    expect(screen.getByText('On-demand base capacity: 0')).toBeInTheDocument();
    expect(
      screen.getByText('Spot instance percentage: 50')
    ).toBeInTheDocument();
  });
});

describe('WorkerNodesNodePoolItem on CAPZ', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPZ;
    window.config.info.general.providerFlavor = ProviderFlavors.CAPI;
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
    window.config.info.general.providerFlavor = providerFlavor;
  });

  it('displays various information about the node pool', () => {
    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterCAPZ1MachineDeployment1,
        providerNodePool:
          capzv1beta1Mocks.randomClusterCAPZ1AzureMachineTemplate,
        additionalColumns: getAdditionalColumns(
          capiv1beta1Mocks.randomCluster1
        ),
      })
    );

    expect(screen.getByLabelText('Name: test12-md00')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Description: test12-md00')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('VM size: Standard_D4s_v3')
    ).toBeInTheDocument();

    expect(screen.getByLabelText('Availability zones: 1')).toBeInTheDocument();
  });

  it('displays the autoscaler configuration', () => {
    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterCAPZ1MachineDeployment1,
        providerNodePool:
          capzv1beta1Mocks.randomClusterCAPZ1AzureMachineTemplate,
        additionalColumns: getAdditionalColumns(
          capiv1beta1Mocks.randomCluster1
        ),
      })
    );

    expect(
      screen.getByLabelText('Autoscaler target node count: 3')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Autoscaler current node count: 3')
    ).toBeInTheDocument();
  });

  it('displays if spot instances are used', () => {
    const { rerender } = render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterCAPZ1MachineDeployment1,
        providerNodePool:
          capzv1beta1Mocks.randomClusterCAPZ1AzureMachineTemplate,
        additionalColumns: getAdditionalColumns(
          capiv1beta1Mocks.randomCluster1
        ),
      })
    );

    expect(
      screen.getByLabelText('Spot virtual machines disabled')
    ).toBeInTheDocument();

    rerender(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterCAPZ1MachineDeployment1,
        providerNodePool: {
          ...capzv1beta1Mocks.randomClusterCAPZ1AzureMachineTemplate,
          spec: {
            ...capzv1beta1Mocks.randomClusterCAPZ1AzureMachineTemplate.spec!,
            template: {
              ...capzv1beta1Mocks.randomClusterCAPZ1AzureMachineTemplate.spec!
                .template,
              spec: {
                ...capzv1beta1Mocks.randomClusterCAPZ1AzureMachineTemplate.spec!
                  .template.spec,
                spotVMOptions: {
                  maxPrice: '2',
                },
              },
            },
          },
        },
        additionalColumns: getAdditionalColumns(
          capiv1beta1Mocks.randomCluster1
        ),
      })
    );

    expect(
      screen.getByLabelText('Spot virtual machines enabled')
    ).toBeInTheDocument();
  });
});

describe('WorkerNodesNodePoolItem on GCP', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.GCP;
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays various information about the node pool', () => {
    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterGCP1MachineDeployment1,
        providerNodePool: capgv1beta1Mocks.randomClusterGCP1GCPMachineTemplate,
      })
    );

    expect(screen.getByLabelText('Name: m317f-worker0')).toBeInTheDocument();
    expect(screen.getByLabelText('Description: workload')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Instance type: n2-standard-4')
    ).toBeInTheDocument();

    expect(screen.getByLabelText('Zones: europe-west3-a')).toBeInTheDocument();
  });

  it('displays the autoscaler configuration', () => {
    render(
      getComponent({
        nodePool: capiv1beta1Mocks.randomClusterGCP1MachineDeployment1,
        providerNodePool: capgv1beta1Mocks.randomClusterGCP1GCPMachineTemplate,
      })
    );

    expect(
      screen.getByLabelText('Autoscaler target node count: 3')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Autoscaler current node count: 3')
    ).toBeInTheDocument();
  });
});
