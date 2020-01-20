import { computeCapabilities } from '../clusterUtils';

describe('canInstallApps', () => {
  describe('on azure', () => {
    it('is false for Azure below 8.2.0', () => {
      const capabilities = computeCapabilities('8.1.0', 'azure');
      expect(capabilities.canInstallApps).toBe(false);
    });

    it('is true for Azure at 8.2.0', () => {
      const capabilities = computeCapabilities('8.2.0', 'azure');
      expect(capabilities.canInstallApps).toBe(true);
    });

    it('is true for Azure above 8.2.0', () => {
      const capabilities = computeCapabilities('8.3.0', 'azure');
      expect(capabilities.canInstallApps).toBe(true);
    });
  });

  describe('on aws', () => {
    it('is false for AWS below 8.1.0', () => {
      const capabilities = computeCapabilities('8.0.0', 'aws');
      expect(capabilities.canInstallApps).toBe(false);
    });

    it('is true for AWS at 8.1.0', () => {
      const capabilities = computeCapabilities('8.1.0', 'aws');
      expect(capabilities.canInstallApps).toBe(true);
    });

    it('is true for AWS above 8.1.0', () => {
      const capabilities = computeCapabilities('8.2.0', 'aws');
      expect(capabilities.canInstallApps).toBe(true);
    });
  });

  describe('on kvm', () => {
    it('is false for KVM below 8.1.0', () => {
      const capabilities = computeCapabilities('8.0.0', 'kvm');
      expect(capabilities.canInstallApps).toBe(false);
    });

    it('is true for KVM at 8.1.0', () => {
      const capabilities = computeCapabilities('8.1.0', 'kvm');
      expect(capabilities.canInstallApps).toBe(true);
    });

    it('is true for KVM above 8.1.0', () => {
      const capabilities = computeCapabilities('8.2.0', 'kvm');
      expect(capabilities.canInstallApps).toBe(true);
    });
  });
});

describe('hasOptionalIngress', () => {
  describe('on azure', () => {
    it('is false for Azure at any version', () => {
      const capabilities = computeCapabilities('8.1.0', 'azure');
      expect(capabilities.hasOptionalIngress).toBe(false);
    });
  });

  describe('on aws', () => {
    it('is false for AWS below 10.1.0', () => {
      const capabilities = computeCapabilities('9.0.0', 'aws');
      expect(capabilities.hasOptionalIngress).toBe(false);
    });

    it('is true for AWS at 10.1.0', () => {
      const capabilities = computeCapabilities('10.1.0', 'aws');
      expect(capabilities.hasOptionalIngress).toBe(true);
    });

    it('is true for AWS above 10.1.0', () => {
      const capabilities = computeCapabilities('11.1.0', 'aws');
      expect(capabilities.hasOptionalIngress).toBe(true);
    });
  });

  describe('on kvm', () => {
    it('is false for KVM at any version', () => {
      const capabilities = computeCapabilities('8.0.0', 'kvm');
      expect(capabilities.hasOptionalIngress).toBe(false);
    });
  });
});
