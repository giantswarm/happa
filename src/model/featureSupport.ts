import { LoggedInUserTypes } from 'model/stores/main/types';

import { Providers } from '../shared/constants';
import * as featureFlags from '../shared/featureFlags';

export function supportsMapiApps(
  user: ILoggedInUser,
  provider: PropertiesOf<typeof Providers>
): boolean {
  return user.type === LoggedInUserTypes.MAPI && provider !== Providers.KVM;
}

export function supportsMapiClusters(
  user: ILoggedInUser,
  provider: PropertiesOf<typeof Providers>
) {
  if (!featureFlags.flags.NextGenClusters.enabled) return false;

  return user.type === LoggedInUserTypes.MAPI && provider !== Providers.KVM;
}
