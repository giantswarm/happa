import { IState } from 'reducers/types';
import { Providers } from 'shared/constants';
import { INodePool, PropertiesOf } from 'shared/types';
import {
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v5ClusterResponse,
} from 'testUtils/mockHttpCalls';
import preloginState from 'testUtils/preloginState';
import {
  canClusterUpgrade,
  computeCapabilities,
  getClusterLatestCondition,
  getInstanceTypesForProvider,
  guessProviderFromNodePools,
  isClusterCreating,
  isClusterDeleting,
  isClusterUpdating,
} from 'utils/clusterUtils';

describe('clusterUtils', () => {
  describe('canClusterUpgrade', () => {
    describe('on azure', () => {
      it('is true for any version', () => {
        const can = canClusterUpgrade('8.1.0', '9.0.0', 'azure');
        expect(can).toBe(true);
      });
    });

    describe('on aws', () => {
      it('is true when going from <10.0.0 to <10.0.0', () => {
        const can = canClusterUpgrade('8.1.0', '9.0.0', 'aws');
        expect(can).toBe(true);
      });

      it('is true when going from >10.0.0 to >10.0.0', () => {
        const can = canClusterUpgrade('10.1.0', '11.0.0', 'aws');
        expect(can).toBe(true);
      });

      it('is false when going from <10.0.0 to >10.0.0', () => {
        const can = canClusterUpgrade('9.1.0', '11.0.0', 'aws');
        expect(can).toBe(false);
      });
    });

    describe('on kvm', () => {
      it('is true for any version', () => {
        const can = canClusterUpgrade('8.0.0', '11.0.0', 'kvm');
        expect(can).toBe(true);
      });
    });
  });

  describe('computeCapabilities', () => {
    describe('hasOptionalIngress', () => {
      describe('on azure', () => {
        it('is false for Azure below 12.0.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('azure')
          )('11.0.0', 'azure');
          expect(capabilities.hasOptionalIngress).toBe(false);
        });

        it('is true for Azure at 12.0.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('azure')
          )('12.0.0', 'azure');
          expect(capabilities.hasOptionalIngress).toBe(true);
        });

        it('is true for Azure above 12.0.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('azure')
          )('13.0.0', 'azure');
          expect(capabilities.hasOptionalIngress).toBe(true);
        });
      });

      describe('on aws', () => {
        it('is false for AWS below 10.1.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('aws')
          )('9.0.0', 'aws');
          expect(capabilities.hasOptionalIngress).toBe(false);
        });

        it('is true for AWS at 10.1.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('aws')
          )('10.1.0', 'aws');
          expect(capabilities.hasOptionalIngress).toBe(true);
        });

        it('is true for AWS above 10.1.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('aws')
          )('11.1.0', 'aws');
          expect(capabilities.hasOptionalIngress).toBe(true);
        });
      });

      describe('on kvm', () => {
        it('is false for KVM below 12.2.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('kvm')
          )('11.0.0', 'kvm');
          expect(capabilities.hasOptionalIngress).toBe(false);
        });

        it('is true for KVM at 12.2.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('kvm')
          )('12.2.0', 'kvm');
          expect(capabilities.hasOptionalIngress).toBe(true);
        });

        it('is true for KVM above 12.2.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('kvm')
          )('13.0.0', 'kvm');
          expect(capabilities.hasOptionalIngress).toBe(true);
        });
      });
    });

    describe('supportsHAMasters', () => {
      describe('on azure', () => {
        it('is false for Azure at any version', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('azure')
          )('8.1.0', 'azure');
          expect(capabilities.supportsHAMasters).toBe(false);
        });
      });

      describe('on aws', () => {
        it('is false for AWS below 9.0.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('aws')
          )('9.0.0', 'aws');
          expect(capabilities.supportsHAMasters).toBe(false);
        });

        it('is true for AWS at 11.4.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('aws')
          )('11.4.0', 'aws');
          expect(capabilities.supportsHAMasters).toBe(true);
        });

        it('is true for AWS above 13.0.0', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('aws')
          )('13.0.0', 'aws');
          expect(capabilities.supportsHAMasters).toBe(true);
        });
      });

      describe('on kvm', () => {
        it('is false for KVM at any version', () => {
          const capabilities = computeCapabilities(
            getEmptyStateWithProvider('kvm')
          )('8.0.0', 'kvm');
          expect(capabilities.supportsHAMasters).toBe(false);
        });
      });
    });
  });

  describe('getClusterLatestCondition', () => {
    it('gets the latest cluster condition, on a v5 cluster', () => {
      const cluster = (Object.assign(
        {},
        v5ClusterResponse
      ) as unknown) as V5.ICluster;

      expect(getClusterLatestCondition(cluster)).toBe('Created');
    });

    it('gets the latest cluster condition, on a v4 cluster', () => {
      const cluster = (Object.assign({}, v4AWSClusterResponse, {
        status: v4AWSClusterStatusResponse,
      }) as unknown) as V4.ICluster;

      expect(getClusterLatestCondition(cluster)).toBe('Created');
    });

    it(`doesn't break if there are no conditions in a v5 cluster`, () => {
      const cluster = Object.assign({}, v5ClusterResponse, {
        conditions: undefined,
      }) as V5.ICluster;

      expect(getClusterLatestCondition(cluster)).not.toBe('Created');
    });

    it(`doesn't break if there are no conditions in a v4 cluster`, () => {
      const cluster = (Object.assign({}, v4AWSClusterResponse, {
        status: undefined,
      }) as unknown) as V4.ICluster;

      expect(getClusterLatestCondition(cluster)).not.toBe('Created');
    });
  });

  describe('isClusterCreating', () => {
    it('checks if the latest condition is the creating one, on a v5 cluster', () => {
      let cluster = (Object.assign(
        {},
        v5ClusterResponse
      ) as unknown) as V5.ICluster;
      expect(isClusterCreating(cluster)).toBeFalsy();

      cluster = (Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: new Date().toISOString(),
            condition: 'Creating',
          },
        ],
      }) as unknown) as V5.ICluster;
      expect(isClusterCreating(cluster)).toBeTruthy();
    });

    it('checks if the latest condition is the creating one, on a v4 cluster', () => {
      const cluster = (Object.assign({}, v4AWSClusterResponse, {
        status: v4AWSClusterStatusResponse,
      }) as unknown) as V4.ICluster;
      expect(isClusterCreating(cluster)).toBeFalsy();

      cluster.status = {
        ...cluster.status,
        cluster: {
          ...cluster.status?.cluster,
          conditions: [
            {
              lastTransitionTime: new Date().toISOString(),
              type: 'Creating',
              status: '',
            },
          ],
        },
      } as V4.IClusterStatus;

      expect(isClusterCreating(cluster)).toBeTruthy();
    });
  });

  describe('isClusterUpdating', () => {
    it('checks if the latest condition is the updating one, on a v5 cluster', () => {
      let cluster = (Object.assign(
        {},
        v5ClusterResponse
      ) as unknown) as V5.ICluster;
      expect(isClusterUpdating(cluster)).toBeFalsy();

      cluster = (Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: new Date().toISOString(),
            condition: 'Updating',
          },
        ],
      }) as unknown) as V5.ICluster;
      expect(isClusterUpdating(cluster)).toBeTruthy();
    });

    it('checks if the latest condition is the updating one, on a v4 cluster', () => {
      const cluster = (Object.assign({}, v4AWSClusterResponse, {
        status: v4AWSClusterStatusResponse,
      }) as unknown) as V4.ICluster;
      expect(isClusterUpdating(cluster)).toBeFalsy();

      cluster.status = {
        ...cluster.status,
        cluster: {
          ...cluster.status?.cluster,
          conditions: [
            {
              lastTransitionTime: new Date().toISOString(),
              type: 'Updating',
              status: '',
            },
          ],
        },
      } as V4.IClusterStatus;

      expect(isClusterUpdating(cluster)).toBeTruthy();
    });
  });

  describe('isClusterDeleting', () => {
    it('checks if the latest condition is the deleting one, on a v5 cluster', () => {
      let cluster = (Object.assign(
        {},
        v5ClusterResponse
      ) as unknown) as V5.ICluster;
      expect(isClusterDeleting(cluster)).toBeFalsy();

      cluster = (Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: new Date().toISOString(),
            condition: 'Deleting',
          },
        ],
      }) as unknown) as V5.ICluster;
      expect(isClusterDeleting(cluster)).toBeTruthy();
    });

    it('checks if the latest condition is the deleting one, on a v4 cluster', () => {
      const cluster = (Object.assign({}, v4AWSClusterResponse, {
        status: v4AWSClusterStatusResponse,
      }) as unknown) as V4.ICluster;
      expect(isClusterDeleting(cluster)).toBeFalsy();

      cluster.status = {
        ...cluster.status,
        cluster: {
          ...cluster.status?.cluster,
          conditions: [
            {
              lastTransitionTime: new Date().toISOString(),
              type: 'Deleting',
              status: '',
            },
          ],
        },
      } as V4.IClusterStatus;

      expect(isClusterDeleting(cluster)).toBeTruthy();
    });
  });

  describe('guessProviderFromNodePools', () => {
    it(`returns 'null' for an empty NP list`, () => {
      const result = guessProviderFromNodePools([]);

      expect(result).toBeNull();
    });

    it(`returns 'aws' for an AWS node pool list`, () => {
      const nodePools = [
        {
          id: '3jx5q',
          node_spec: {
            aws: { instance_type: 'm3.xlarge' },
          },
        },
      ] as INodePool[];
      const result = guessProviderFromNodePools(nodePools);

      expect(result).toBe('aws');
    });

    it(`returns 'azure' for an Azure node pool list`, () => {
      const nodePools = [
        {
          id: '3jx5q',
          node_spec: {
            azure: { vm_size: 'm3.xlarge' },
          },
        },
      ] as INodePool[];
      const result = guessProviderFromNodePools(nodePools);

      expect(result).toBe('azure');
    });

    it(`returns 'null' for an unknown provider node pool list`, () => {
      const nodePools = [
        {
          id: '3jx5q',
          node_spec: {},
        },
      ] as INodePool[];
      const result = guessProviderFromNodePools(nodePools);

      expect(result).toBeNull();
    });
  });

  describe('getInstanceTypesForProvider', () => {
    const initialAWSCapabilitiesJSON = window.config.awsCapabilitiesJSON;
    const initialAzureCapabilitiesJSON = window.config.azureCapabilitiesJSON;

    afterEach(() => {
      window.config.awsCapabilitiesJSON = initialAWSCapabilitiesJSON;
      window.config.azureCapabilitiesJSON = initialAzureCapabilitiesJSON;
    });

    it('gets the correct list for the AWS provider', () => {
      const instanceTypes = getInstanceTypesForProvider('aws');
      expect(instanceTypes).toStrictEqual(
        JSON.parse(initialAWSCapabilitiesJSON)
      );
    });

    it('gets the correct list for the Azure provider', () => {
      const instanceTypes = getInstanceTypesForProvider('azure');
      expect(instanceTypes).toStrictEqual(
        JSON.parse(initialAzureCapabilitiesJSON)
      );
    });

    it(`returns 'null' for an unknown provider`, () => {
      const instanceTypes = getInstanceTypesForProvider(
        '' as PropertiesOf<typeof Providers>
      );
      expect(instanceTypes).toBeNull();
    });
  });
});

function getEmptyStateWithProvider(
  provider: PropertiesOf<typeof Providers>
): IState {
  return {
    ...preloginState,
    main: {
      ...preloginState.main,
      info: {
        ...preloginState.main.info,
        general: {
          ...preloginState.main.info.general,
          provider,
        },
      },
    },
  };
}
