import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';
import * as legacyKeyPairs from 'model/services/mapi/legacy/keypairs';

export function usePermissionsForStorageConfigs(
  _provider: PropertiesOf<typeof Providers>,
  _namespace: string
) {
  const { data: permissions } = usePermissions();

  const computed = {
    canGet: false,
    canList: false,
    canUpdate: false,
    canCreate: false,
    canDelete: false,
  };

  if (!permissions) return computed;

  computed.canGet = hasPermission(
    permissions,
    legacyKeyPairs.keypairStorageResourceNamespace,
    'get',
    'core.giantswarm.io',
    'storageconfigs',
    legacyKeyPairs.keypairStorageResourceName
  );
  computed.canList = hasPermission(
    permissions,
    legacyKeyPairs.keypairStorageResourceNamespace,
    'list',
    'core.giantswarm.io',
    'storageconfigs',
    legacyKeyPairs.keypairStorageResourceName
  );
  computed.canUpdate = hasPermission(
    permissions,
    legacyKeyPairs.keypairStorageResourceNamespace,
    'update',
    'core.giantswarm.io',
    'storageconfigs',
    legacyKeyPairs.keypairStorageResourceName
  );
  computed.canDelete = hasPermission(
    permissions,
    legacyKeyPairs.keypairStorageResourceNamespace,
    'delete',
    'core.giantswarm.io',
    'storageconfigs',
    legacyKeyPairs.keypairStorageResourceName
  );
  computed.canCreate = hasPermission(
    permissions,
    legacyKeyPairs.keypairStorageResourceNamespace,
    'create',
    'core.giantswarm.io',
    'storageconfigs',
    legacyKeyPairs.keypairStorageResourceName
  );

  return computed;
}
