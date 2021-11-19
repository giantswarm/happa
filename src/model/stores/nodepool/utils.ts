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
  provider: PropertiesOf<typeof Providers>,
  releaseVersion: string
): boolean {
  switch (true) {
    case provider === Providers.AWS &&
      compare(releaseVersion, Constants.AWS_ONDEMAND_INSTANCES_VERSION) >= 0:
    case provider === Providers.AZURE &&
      compare(releaseVersion, Constants.AZURE_SPOT_INSTANCES_VERSION) >= 0:
      return true;

    default:
      return false;
  }
}

export function supportsAlikeInstances(
  provider: PropertiesOf<typeof Providers>,
  releaseVersion: string
): boolean {
  switch (true) {
    case provider === Providers.AWS &&
      compare(releaseVersion, Constants.AWS_USE_ALIKE_INSTANCES_VERSION) >= 0:
      return true;

    default:
      return false;
  }
}

export function supportsHACPNodes(
  provider: PropertiesOf<typeof Providers>,
  releaseVersion: string
): boolean {
  switch (provider) {
    case Providers.AWS:
      return compare(releaseVersion, Constants.AWS_HA_MASTERS_VERSION) >= 0;

    default:
      return false;
  }
}
