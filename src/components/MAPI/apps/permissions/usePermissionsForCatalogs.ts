import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

export function usePermissionsForCatalogs(
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
    'catalogs'
  );
  computed.canList = hasPermission(
    permissions,
    namespace,
    'list',
    'application.giantswarm.io',
    'catalogs'
  );
  computed.canUpdate = hasPermission(
    permissions,
    namespace,
    'update',
    'application.giantswarm.io',
    'catalogs'
  );
  computed.canCreate = hasPermission(
    permissions,
    namespace,
    'create',
    'application.giantswarm.io',
    'catalogs'
  );
  computed.canDelete = hasPermission(
    permissions,
    namespace,
    'delete',
    'application.giantswarm.io',
    'catalogs'
  );

  return computed;
}
