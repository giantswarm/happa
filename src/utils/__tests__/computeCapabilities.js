import { computeCapabilities } from '../clusterUtils';

describe('computeCapabilities', () => {
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

  describe('supportsHAMasters', () => {
    describe('on azure', () => {
      it('is false for Azure at any version', () => {
        const capabilities = computeCapabilities('8.1.0', 'azure');
        expect(capabilities.supportsHAMasters).toBe(false);
      });
    });

    describe('on aws', () => {
      it('is false for AWS below 9.0.0', () => {
        const capabilities = computeCapabilities('9.0.0', 'aws');
        expect(capabilities.supportsHAMasters).toBe(false);
      });

      it('is true for AWS at 11.4.0', () => {
        const capabilities = computeCapabilities('11.4.0', 'aws');
        expect(capabilities.supportsHAMasters).toBe(true);
      });

      it('is true for AWS above 13.0.0', () => {
        const capabilities = computeCapabilities('13.0.0', 'aws');
        expect(capabilities.supportsHAMasters).toBe(true);
      });
    });

    describe('on kvm', () => {
      it('is false for KVM at any version', () => {
        const capabilities = computeCapabilities('8.0.0', 'kvm');
        expect(capabilities.supportsHAMasters).toBe(false);
      });
    });
  });
});
