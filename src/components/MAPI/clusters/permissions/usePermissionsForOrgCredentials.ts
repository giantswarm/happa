import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

export function usePermissionsForOrgCredentials(
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
    legacyCredentials.credentialsNamespace,
    'get',
    '',
    'secrets'
  );
  computed.canList = hasPermission(
    permissions,
    legacyCredentials.credentialsNamespace,
    'list',
    '',
    'secrets'
  );
  computed.canUpdate = hasPermission(
    permissions,
    legacyCredentials.credentialsNamespace,
    'update',
    '',
    'secrets'
  );
  computed.canCreate = hasPermission(
    permissions,
    legacyCredentials.credentialsNamespace,
    'create',
    '',
    'secrets'
  );
  computed.canDelete = hasPermission(
    permissions,
    legacyCredentials.credentialsNamespace,
    'delete',
    '',
    'secrets'
  );

  return computed;
}
