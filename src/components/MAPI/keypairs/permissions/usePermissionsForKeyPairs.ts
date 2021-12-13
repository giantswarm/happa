import { Providers } from 'model/constants';

import { usePermissionsForCertConfigs } from './usePermissionsForCertConfigs';
import { usePermissionsForStorageConfigs } from './usePermissionsForStorageConfigs';

export function usePermissionsForKeyPairs(
  provider: PropertiesOf<typeof Providers>,
  namespace: string
) {
  const { canCreate: canCreateCertConfigs } = usePermissionsForCertConfigs(
    provider,
    namespace
  );

  const { canGet: canGetStorageConfigs } = usePermissionsForStorageConfigs(
    provider,
    namespace
  );

  const computed = {
    canGet: false,
    canList: false,
    canUpdate: false,
    canCreate: false,
    canDelete: false,
  };

  computed.canGet = canGetStorageConfigs;

  computed.canCreate = canCreateCertConfigs;

  return computed;
}
