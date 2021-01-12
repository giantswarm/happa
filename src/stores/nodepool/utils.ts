import { compare } from 'lib/semver';
import { Constants, Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

export function supportsNodePoolAutoscaling(
  provider: PropertiesOf<typeof Providers>,
  releaseVersion: string
): boolean {
  switch (true) {
    case provider === Providers.AWS &&
      compare(releaseVersion, Constants.AWS_V5_VERSION) >= 0:
    case provider === Providers.AZURE &&
      compare(releaseVersion, Constants.AZURE_NP_AUTOSCALING_VERSION) >= 0:
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
