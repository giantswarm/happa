import { canClusterUpgrade } from '../clusterUtils';

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
