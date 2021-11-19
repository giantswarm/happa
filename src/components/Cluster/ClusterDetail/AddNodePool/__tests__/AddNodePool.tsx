import { fireEvent, screen } from '@testing-library/react';
import { V5AddNodePoolRequest } from 'giantswarm';
import { Providers } from 'model/constants';
import { renderWithStore } from 'test/renderUtils';

import AddNodePool from '../AddNodePool';

describe('AddNodePool', () => {
  describe('Azure', () => {
    describe('Spot Instances', () => {
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
            countPerCluster: { max: 0, default: 10 },
            vmSize: {
              options: ['Standard_D4s_v3'],
              default: 'Standard_D4s_v3',
            },
          },
        };
      });

      afterAll(() => {
        window.config.info = originalInfo;
      });

      it('does not render the spot instances section if the feature is unsupported', () => {
        const capabilities: IClusterCapabilities = {
          hasOptionalIngress: false,
          supportsAlikeInstances: false,
          supportsHAMasters: false,
          supportsNodePoolAutoscaling: false,
          supportsNodePoolSpotInstances: false,
        };

        renderWithStore(AddNodePool, {
          id: '123sd',
          capabilities,
          informParent: jest.fn(),
        });

        expect(
          screen.queryByText(/spot virtual machines/i)
        ).not.toBeInTheDocument();
      });

      it('when spot instances are turned on, the default behaviour is using on-demand max pricing', () => {
        const capabilities: IClusterCapabilities = {
          hasOptionalIngress: false,
          supportsAlikeInstances: false,
          supportsHAMasters: false,
          supportsNodePoolAutoscaling: false,
          supportsNodePoolSpotInstances: true,
        };

        const informParentMockFn = jest.fn();

        renderWithStore(AddNodePool, {
          id: '123sd',
          capabilities,
          informParent: informParentMockFn,
        });

        expect(screen.getByText('Spot virtual machines')).toBeInTheDocument();

        const toggleLabelElement = screen.getByText('Enabled');
        expect(toggleLabelElement).toBeInTheDocument();
        fireEvent.click(toggleLabelElement);

        expect(screen.getByLabelText('Price limit')).toHaveValue(0);

        const expectedNodePool = {
          availability_zones: {
            number: 1,
          },
          name: 'Unnamed node pool',
          node_spec: {
            azure: {
              spot_instances: {
                enabled: true,
                max_price: undefined,
              },
              vm_size: 'Standard_D4s_v3',
            },
          },
          scaling: {
            max: 3,
            min: 3,
          },
        } as unknown as V5AddNodePoolRequest;

        expect(informParentMockFn).toHaveBeenLastCalledWith(
          {
            isValid: true,
            data: expectedNodePool,
          },
          '123sd'
        );
      });

      it('can set a maximum price when on-demand max pricing is turned off', () => {
        const capabilities: IClusterCapabilities = {
          hasOptionalIngress: false,
          supportsAlikeInstances: false,
          supportsHAMasters: false,
          supportsNodePoolAutoscaling: false,
          supportsNodePoolSpotInstances: true,
        };

        const informParentMockFn = jest.fn();

        renderWithStore(AddNodePool, {
          id: '123sd',
          capabilities,
          informParent: informParentMockFn,
        });

        expect(screen.getByText('Spot virtual machines')).toBeInTheDocument();

        const toggleLabelElement = screen.getByText('Enabled');
        expect(toggleLabelElement).toBeInTheDocument();
        fireEvent.click(toggleLabelElement);

        // Deactivate current on-demand max pricing.
        const onDemandToggleElement = screen.getByText(
          'Use the on-demand price as limit'
        );
        fireEvent.click(onDemandToggleElement);

        const maxPriceInputElement = screen.getByLabelText('Price limit');
        fireEvent.change(maxPriceInputElement, {
          target: {
            value: '0.00035',
          },
        });

        const expectedNodePool = {
          availability_zones: {
            number: 1,
          },
          name: 'Unnamed node pool',
          node_spec: {
            azure: {
              spot_instances: {
                enabled: true,
                max_price: 0.00035,
              },
              vm_size: 'Standard_D4s_v3',
            },
          },
          scaling: {
            max: 3,
            min: 3,
          },
        } as unknown as V5AddNodePoolRequest;

        expect(informParentMockFn).toHaveBeenLastCalledWith(
          {
            isValid: true,
            data: expectedNodePool,
          },
          '123sd'
        );
      });
    });
  });
});
