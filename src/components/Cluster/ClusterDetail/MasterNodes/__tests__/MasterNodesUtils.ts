import {
  getAvailabilityZonesSectionLabel,
  getReadinessLabel,
} from 'Cluster/ClusterDetail/MasterNodes/MasterNodesUtils';

describe('MasterNodesUtils', () => {
  describe('getAvailabilityZonesSectionLabel', () => {
    it('returns the correct value for no AZ', () => {
      const result = getAvailabilityZonesSectionLabel([]);
      expect(result).toBe('Availability zone');
    });

    it('returns the correct value for a single AZ', () => {
      const result = getAvailabilityZonesSectionLabel(['a']);
      expect(result).toBe('Availability zone');
    });

    it('returns the correct value for multiple AZs', () => {
      const result = getAvailabilityZonesSectionLabel(['a', 'b', 'c']);
      expect(result).toBe('Availability zones');
    });
  });

  describe('getReadinessLabel', () => {
    it('returns the correct value for a maximum node count of 1 and a current value less than the maximum', () => {
      const result = getReadinessLabel(0, 1);
      expect(result).toBe('Not ready');
    });

    it('returns the correct value for a maximum node count of 1 and a current value equal to the maximum', () => {
      const result = getReadinessLabel(1, 1);
      expect(result).toBe('Ready');
    });

    it('returns the correct value for a maximum node count of 3 and a current value less than the maximum', () => {
      // eslint-disable-next-line no-magic-numbers
      let result = getReadinessLabel(0, 3);
      expect(result).toBe('0 of 3 control plane nodes ready');

      // eslint-disable-next-line no-magic-numbers
      result = getReadinessLabel(1, 3);
      expect(result).toBe('1 of 3 control plane nodes ready');

      // eslint-disable-next-line no-magic-numbers
      result = getReadinessLabel(2, 3);
      expect(result).toBe('2 of 3 control plane nodes ready');
    });

    it('returns the correct value for a maximum node count of 3 and a current value equal to the maximum', () => {
      // eslint-disable-next-line no-magic-numbers
      const result = getReadinessLabel(3, 3);
      expect(result).toBe('All 3 control plane nodes ready');
    });

    it('returns the correct value for an unknown current node count', () => {
      const result = getReadinessLabel(null, 1);
      expect(result).toBe('No status info');
    });
  });
});
