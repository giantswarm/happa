import { v5ClusterResponse } from 'testUtils/mockHttpCalls';
import {
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
});
