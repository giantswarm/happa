import { Providers } from 'shared/constants';
import { INodePool, PropertiesOf } from 'shared/types';
import {
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v5ClusterResponse,
} from 'testUtils/mockHttpCalls';
import {
  getClusterLatestCondition,
  getInstanceTypesForProvider,
  guessProviderFromNodePools,
  isClusterCreating,
  isClusterDeleting,
  isClusterUpdating,
} from 'utils/clusterUtils';

describe('clusterUtils', () => {
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
