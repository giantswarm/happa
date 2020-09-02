import { IState } from 'reducers/types';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import preloginState from 'testUtils/preloginState';

import { computeCapabilities } from '../clusterUtils';

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
