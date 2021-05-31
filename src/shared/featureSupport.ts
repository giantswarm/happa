import { LoggedInUserTypes } from 'stores/main/types';

import { Providers } from './constants';
import { PropertiesOf } from './types';

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
  // TODO(axbarsan): Add feature flag.

  return user.type === LoggedInUserTypes.MAPI && provider !== Providers.KVM;
}
