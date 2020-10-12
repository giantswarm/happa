import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

export function supportsNodePoolAutoscaling(
  provider: PropertiesOf<typeof Providers>
): boolean {
  switch (provider) {
    case Providers.AWS:
      return true;

    default:
      return false;
  }
}

export function supportsNodePoolSpotInstances(
  provider: PropertiesOf<typeof Providers>
): boolean {
  switch (provider) {
    case Providers.AWS:
      return true;

    default:
      return false;
  }
}
