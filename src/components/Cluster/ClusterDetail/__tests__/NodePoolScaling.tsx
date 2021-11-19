import { fireEvent, screen } from '@testing-library/react';
import { Providers } from 'shared/constants';
import { renderWithTheme } from 'test/renderUtils';

import NodePoolScaling from '../NodePoolScaling';

describe('NodePoolScaling', () => {
  describe('Azure', () => {
    it('does not render the spot instances column when they are not supported', () => {
      const np: INodePool = {
        id: '3jx5q',
        name: 'My first node pool',
        availability_zones: ['1'],
        scaling: { min: 3, max: 10 },
        node_spec: {
          azure: {
            vm_size: 'some-vm-size',
          },
          aws: null,
          volume_sizes_gb: { docker: 100, kubelet: 100 },
        },
        subnet: '123',
        status: {
          nodes: 3,
          nodes_ready: 3,
          instance_types: null,
          spot_instances: 0,
        },
      };

      renderWithTheme(NodePoolScaling, {
        nodePool: np,
        provider: Providers.AZURE,
        supportsAutoscaling: true,
        supportsSpotInstances: false,
      });

      expect(screen.queryByText('Enabled')).not.toBeInTheDocument();
      expect(screen.queryByText('Disabled')).not.toBeInTheDocument();
    });

    it('renders the spot instances column correctly, with spot instances supported', () => {
      const np: INodePool = {
        id: '3jx5q',
        name: 'My first node pool',
        availability_zones: ['1'],
        scaling: { min: 3, max: 10 },
        node_spec: {
          azure: {
            vm_size: 'some-vm-size',
            spot_instances: {
              enabled: false,
              max_price: 0,
            },
          },
          aws: null,
          volume_sizes_gb: { docker: 100, kubelet: 100 },
        },
        subnet: '123',
        status: {
          nodes: 3,
          nodes_ready: 3,
          instance_types: null,
          spot_instances: 0,
        },
      };

      renderWithTheme(NodePoolScaling, {
        nodePool: np,
        provider: Providers.AZURE,
        supportsAutoscaling: true,
        supportsSpotInstances: true,
      });

      const spotInstancesTab = screen.getByTitle('Disabled');
      expect(spotInstancesTab).toBeInTheDocument();

      // Hover over the column.
      fireEvent.mouseEnter(spotInstancesTab);
      expect(
        screen.getByText('Spot virtual machines disabled')
      ).toBeInTheDocument();
      fireEvent.mouseLeave(spotInstancesTab);
    });

    it('renders the spot instances column correctly, with spot instances supported and enabled, using on-demand max pricing', () => {
      const np: INodePool = {
        id: '3jx5q',
        name: 'My first node pool',
        availability_zones: ['1'],
        scaling: { min: 3, max: 10 },
        node_spec: {
          azure: {
            vm_size: 'some-vm-size',
            spot_instances: {
              enabled: true,
              max_price: 0,
            },
          },
          aws: null,
          volume_sizes_gb: { docker: 100, kubelet: 100 },
        },
        subnet: '123',
        status: {
          nodes: 3,
          nodes_ready: 3,
          instance_types: null,
          spot_instances: 0,
        },
      };

      renderWithTheme(NodePoolScaling, {
        nodePool: np,
        provider: Providers.AZURE,
        supportsAutoscaling: true,
        supportsSpotInstances: true,
      });

      const spotInstancesTab = screen.getByTitle('Enabled');
      expect(spotInstancesTab).toBeInTheDocument();

      // Hover over the column.
      fireEvent.mouseEnter(spotInstancesTab);
      expect(
        screen.getByText(/spot virtual machines enabled/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/using current on-demand pricing as maximum/i)
      ).toBeInTheDocument();
      fireEvent.mouseLeave(spotInstancesTab);
    });

    it('renders the spot instances column correctly, with spot instances supported and enabled, using set maximum pricing', () => {
      const np: INodePool = {
        id: '3jx5q',
        name: 'My first node pool',
        availability_zones: ['1'],
        scaling: { min: 3, max: 10 },
        node_spec: {
          azure: {
            vm_size: 'some-vm-size',
            spot_instances: {
              enabled: true,
              max_price: 0.00035,
            },
          },
          aws: null,
          volume_sizes_gb: { docker: 100, kubelet: 100 },
        },
        subnet: '123',
        status: {
          nodes: 3,
          nodes_ready: 3,
          instance_types: null,
          spot_instances: 0,
        },
      };

      renderWithTheme(NodePoolScaling, {
        nodePool: np,
        provider: Providers.AZURE,
        supportsAutoscaling: true,
        supportsSpotInstances: true,
      });

      const spotInstancesTab = screen.getByTitle('Enabled');
      expect(spotInstancesTab).toBeInTheDocument();

      // Hover over the column.
      fireEvent.mouseEnter(spotInstancesTab);
      expect(
        screen.getByText(/spot virtual machines enabled/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/using maximum price: \$0.00035/i)
      ).toBeInTheDocument();
      fireEvent.mouseLeave(spotInstancesTab);
    });
  });
});
