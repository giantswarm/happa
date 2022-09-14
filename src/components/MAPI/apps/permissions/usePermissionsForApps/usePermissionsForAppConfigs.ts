import { isCAPIProvider } from 'MAPI/utils';
import { Providers } from 'model/constants';

import { usePermissionsForAppConfigsInClusterNamespace } from './usePermissionsForAppConfigsInClusterNamespace';
import { usePermissionsForAppConfigsInOrgNamespace } from './usePermissionsForAppConfigsInOrgNamespace';

export function usePermissionsForAppConfigs(
  provider: PropertiesOf<typeof Providers>,
  namespace: string
) {
  return (
    isCAPIProvider(provider)
      ? usePermissionsForAppConfigsInOrgNamespace
      : usePermissionsForAppConfigsInClusterNamespace
  )(provider, namespace);
}
