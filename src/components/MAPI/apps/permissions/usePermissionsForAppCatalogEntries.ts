import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

export function usePermissionsForAppCatalogEntries(
  _provider: PropertiesOf<typeof Providers>,
  namespace: string
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
    namespace,
    'get',
    'application.giantswarm.io',
    'appcatalogentries'
  );
  computed.canList = hasPermission(
    permissions,
    namespace,
    'list',
    'application.giantswarm.io',
    'appcatalogentries'
  );
  computed.canUpdate = hasPermission(
    permissions,
    namespace,
    'update',
    'application.giantswarm.io',
    'appcatalogentries'
  );
  computed.canCreate = hasPermission(
    permissions,
    namespace,
    'create',
    'application.giantswarm.io',
    'appcatalogentries'
  );
  computed.canDelete = hasPermission(
    permissions,
    namespace,
    'delete',
    'application.giantswarm.io',
    'appcatalogentries'
  );

  return computed;
}
