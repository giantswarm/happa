import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

export function usePermissionsForOrganizations(
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
    'security.giantswarm.io',
    'organizations'
  );
  computed.canList = hasPermission(
    permissions,
    namespace,
    'list',
    'security.giantswarm.io',
    'organizations'
  );
  computed.canUpdate = hasPermission(
    permissions,
    namespace,
    'update',
    'security.giantswarm.io',
    'organizations'
  );
  computed.canCreate = hasPermission(
    permissions,
    namespace,
    'create',
    'security.giantswarm.io',
    'organizations'
  );
  computed.canDelete = hasPermission(
    permissions,
    namespace,
    'delete',
    'security.giantswarm.io',
    'organizations'
  );

  return computed;
}
