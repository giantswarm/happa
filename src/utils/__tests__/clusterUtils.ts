import { v5ClusterResponse } from 'testUtils/mockHttpCalls';
import {
  getInstanceTypesForProvider,
  guessProviderFromNodePools,
  hasClusterLatestCondition,
  isClusterCreating,
  isClusterDeleting,
  isClusterUpdating,
} from 'utils/clusterUtils';

describe('clusterUtils', () => {
  describe('hasClusterLatestCondition', () => {
    it('gets the latest cluster condition', () => {
      const cluster = Object.assign({}, v5ClusterResponse);

      expect(hasClusterLatestCondition(cluster, 'Creating')).toBeFalsy();
      expect(hasClusterLatestCondition(cluster, 'Created')).toBeTruthy();
    });

    it(`doesn't break if there are no conditions in the cluster`, () => {
      const cluster = Object.assign({}, v5ClusterResponse, {
        conditions: undefined,
      });

      expect(hasClusterLatestCondition(cluster, 'Creating')).toBeFalsy();
      expect(hasClusterLatestCondition(cluster, 'Created')).toBeFalsy();
    });
  });

  describe('isClusterCreating', () => {
    it('checks if the latest condition is the creating one', () => {
      let cluster = Object.assign({}, v5ClusterResponse);
      expect(isClusterCreating(cluster)).toBeFalsy();

      cluster = Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: new Date().toISOString(),
            condition: 'Creating',
          },
        ],
      });
      expect(isClusterCreating(cluster)).toBeTruthy();
    });
  });

  describe('isClusterUpdating', () => {
    it('checks if the latest condition is the updating one', () => {
      let cluster = Object.assign({}, v5ClusterResponse);
      expect(isClusterUpdating(cluster)).toBeFalsy();

      cluster = Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: new Date().toISOString(),
            condition: 'Updating',
          },
        ],
      });
      expect(isClusterUpdating(cluster)).toBeTruthy();
    });
  });

  describe('isClusterDeleting', () => {
    it('checks if the latest condition is the deleting one', () => {
      let cluster = Object.assign({}, v5ClusterResponse);
      expect(isClusterDeleting(cluster)).toBeFalsy();

      cluster = Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: new Date().toISOString(),
            condition: 'Deleting',
          },
        ],
      });
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
      ];
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
      ];
      const result = guessProviderFromNodePools(nodePools);

      expect(result).toBe('azure');
    });

    it(`returns 'null' for an unknown provider node pool list`, () => {
      const nodePools = [
        {
          id: '3jx5q',
          node_spec: {},
        },
      ];
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
      const instanceTypes = getInstanceTypesForProvider('');
      expect(instanceTypes).toBeNull();
    });
  });
});
