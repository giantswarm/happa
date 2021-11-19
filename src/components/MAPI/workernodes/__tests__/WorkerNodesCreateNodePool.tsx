import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as MAPIUtils from 'MAPI/utils';
import { Providers, StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as capiv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3';
import * as capiexpv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3/exp';
import * as capzv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3';
import * as capzexpv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3/exp';
import * as gscorev1alpha1Mocks from 'test/mockHttpCalls/gscorev1alpha1';
import { getComponentWithStore } from 'test/renderUtils';

import * as NodePoolUtils from '../utils';
import WorkerNodesCreateNodePool from '../WorkerNodesCreateNodePool';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof WorkerNodesCreateNodePool>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <WorkerNodesCreateNodePool {...p} />
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

const generateUIDMockFn = jest.spyOn(MAPIUtils, 'generateUID');
generateUIDMockFn.mockReturnValue(
  capiexpv1alpha3Mocks.randomCluster1MachinePool1.metadata.name
);

describe('WorkerNodesCreateNodePool', () => {
  const originalInfo = window.config.info;

  beforeAll(() => {
    window.config.info = {
      ...window.config.info,
      general: {
        ...window.config.info.general,
        availabilityZones: {
          default: 1,
          max: 3,
          zones: ['1', '2', '3'],
        },
        provider: Providers.AZURE,
      },
      workers: {
        ...window.config.info.workers,
        vmSize: {
          default: 'Standard_D4s_v3',
          options: [
            'Standard_D4s_v3',
            'Standard_A2_v2',
            'Standard_A4_v2',
            'Standard_A8_v2',
          ],
        },
      },
    };
  });

  afterAll(() => {
    window.config.info = originalInfo;
  });

  it('renders without crashing', () => {
    render(
      getComponent({
        open: true,
        cluster: capiv1alpha3Mocks.randomCluster1,
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
        id: 'test',
      })
    );
  });

  it('can see the name that the resource will get', () => {
    render(
      getComponent({
        open: true,
        cluster: capiv1alpha3Mocks.randomCluster1,
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
        id: 'test',
      })
    );

    expect(screen.getByLabelText('Name')).toHaveValue('t6yo9');
  });

  it('can set the description', async () => {
    const createNodePoolMockFn = jest.spyOn(NodePoolUtils, 'createNodePool');
    createNodePoolMockFn.mockResolvedValue({
      nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
      providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      bootstrapConfig: gscorev1alpha1Mocks.randomCluster1MachinePool1Spark,
    });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList1);

    render(
      getComponent({
        open: true,
        cluster: capiv1alpha3Mocks.randomCluster1,
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
        id: 'test',
      })
    );

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'A new description' },
    });

    const createButton = screen.getByRole('button', {
      name: 'Create node pool',
    });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(createNodePoolMockFn).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        nodePool: expect.objectContaining({
          metadata: expect.objectContaining({
            annotations: expect.objectContaining({
              'machine-pool.giantswarm.io/name': 'A new description',
            }),
          }),
        }),
      })
    );

    expect(
      await withMarkup(screen.findByText)(
        'Node pool t6yo9 created successfully'
      )
    ).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));

    createNodePoolMockFn.mockRestore();
  });

  it('can set the vm size', async () => {
    const createNodePoolMockFn = jest.spyOn(NodePoolUtils, 'createNodePool');
    createNodePoolMockFn.mockResolvedValue({
      nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
      providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      bootstrapConfig: gscorev1alpha1Mocks.randomCluster1MachinePool1Spark,
    });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList1);

    render(
      getComponent({
        open: true,
        cluster: capiv1alpha3Mocks.randomCluster1,
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
        id: 'test',
      })
    );

    // Has the default VM size selected by default.
    expect(
      await screen.findByLabelText(
        'The currently selected VM size is Standard_D4s_v3'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Available VM sizes'));
    fireEvent.click(screen.getByLabelText('VM size Standard_A8_v2'));

    const createButton = screen.getByRole('button', {
      name: 'Create node pool',
    });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(createNodePoolMockFn).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        providerNodePool: expect.objectContaining({
          spec: expect.objectContaining({
            template: expect.objectContaining({
              vmSize: 'Standard_A8_v2',
            }),
          }),
        }),
      })
    );

    expect(
      await withMarkup(screen.findByText)(
        'Node pool t6yo9 created successfully'
      )
    ).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));

    createNodePoolMockFn.mockRestore();
  });

  it('can configure the availability zone', async () => {
    const createNodePoolMockFn = jest.spyOn(NodePoolUtils, 'createNodePool');
    createNodePoolMockFn.mockResolvedValue({
      nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
      providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      bootstrapConfig: gscorev1alpha1Mocks.randomCluster1MachinePool1Spark,
    });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList1);

    render(
      getComponent({
        open: true,
        cluster: capiv1alpha3Mocks.randomCluster1,
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
        id: 'test',
      })
    );

    fireEvent.click(await screen.findByText('Manual selection'));
    fireEvent.click(await screen.findByLabelText('Availability zone 2'));
    fireEvent.click(await screen.findByLabelText('Availability zone 3'));

    const createButton = screen.getByRole('button', {
      name: 'Create node pool',
    });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(createNodePoolMockFn).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        nodePool: expect.objectContaining({
          spec: expect.objectContaining({
            failureDomains: ['2', '3'],
          }),
        }),
      })
    );

    expect(
      await withMarkup(screen.findByText)(
        'Node pool t6yo9 created successfully'
      )
    ).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));

    createNodePoolMockFn.mockRestore();
  });

  it('can configure the autoscaler', async () => {
    const createNodePoolMockFn = jest.spyOn(NodePoolUtils, 'createNodePool');
    createNodePoolMockFn.mockResolvedValue({
      nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
      providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      bootstrapConfig: gscorev1alpha1Mocks.randomCluster1MachinePool1Spark,
    });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList1);

    render(
      getComponent({
        open: true,
        cluster: capiv1alpha3Mocks.randomCluster1,
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
        id: 'test',
      })
    );

    fireEvent.change(await screen.findByLabelText('Minimum'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Maximum'), {
      target: { value: '5' },
    });

    const createButton = screen.getByRole('button', {
      name: 'Create node pool',
    });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(createNodePoolMockFn).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        nodePool: expect.objectContaining({
          metadata: expect.objectContaining({
            annotations: expect.objectContaining({
              'cluster.k8s.io/cluster-api-autoscaler-node-group-min-size': '1',
              'cluster.k8s.io/cluster-api-autoscaler-node-group-max-size': '5',
            }),
          }),
          spec: expect.objectContaining({
            replicas: 1,
          }),
        }),
      })
    );

    expect(
      await withMarkup(screen.findByText)(
        'Node pool t6yo9 created successfully'
      )
    ).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));

    createNodePoolMockFn.mockRestore();
  });

  it('can configure spot VMs', async () => {
    const createNodePoolMockFn = jest.spyOn(NodePoolUtils, 'createNodePool');
    createNodePoolMockFn.mockResolvedValue({
      nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
      providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      bootstrapConfig: gscorev1alpha1Mocks.randomCluster1MachinePool1Spark,
    });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList1);

    render(
      getComponent({
        open: true,
        cluster: capiv1alpha3Mocks.randomCluster1,
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
        id: 'test',
      })
    );

    fireEvent.click(await screen.findByText('Spot virtual machines'));
    fireEvent.click(
      await screen.findByText('Use the on-demand price as limit')
    );

    fireEvent.change(screen.getByLabelText('Price limit'), {
      target: { value: '0.0035' },
    });

    const createButton = screen.getByRole('button', {
      name: 'Create node pool',
    });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(createNodePoolMockFn).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        providerNodePool: expect.objectContaining({
          spec: expect.objectContaining({
            template: expect.objectContaining({
              spotVMOptions: {
                maxPrice: '0.0035',
              },
            }),
          }),
        }),
      })
    );

    expect(
      await withMarkup(screen.findByText)(
        'Node pool t6yo9 created successfully'
      )
    ).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));

    createNodePoolMockFn.mockRestore();
  });

  it('creates a node pool with default options', async () => {
    const createNodePoolMockFn = jest.spyOn(NodePoolUtils, 'createNodePool');
    createNodePoolMockFn.mockResolvedValue({
      nodePool: capiexpv1alpha3Mocks.randomCluster1MachinePool1,
      providerNodePool: capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1,
      bootstrapConfig: gscorev1alpha1Mocks.randomCluster1MachinePool1Spark,
    });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList1);

    render(
      getComponent({
        open: true,
        cluster: capiv1alpha3Mocks.randomCluster1,
        providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
        id: 'test',
      })
    );

    const createButton = screen.getByRole('button', {
      name: 'Create node pool',
    });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(
      await withMarkup(screen.findByText)(
        'Node pool t6yo9 created successfully'
      )
    ).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));

    createNodePoolMockFn.mockRestore();
  });
});
