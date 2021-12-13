import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

export function usePermissionsForCertConfigs(
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
    'core.giantswarm.io',
    'certconfigs'
  );
  computed.canList = hasPermission(
    permissions,
    namespace,
    'list',
    'core.giantswarm.io',
    'certconfigs'
  );
  computed.canUpdate = hasPermission(
    permissions,
    namespace,
    'update',
    'core.giantswarm.io',
    'certconfigs'
  );
  computed.canCreate = hasPermission(
    permissions,
    namespace,
    'create',
    'core.giantswarm.io',
    'certconfigs'
  );
  computed.canDelete = hasPermission(
    permissions,
    namespace,
    'delete',
    'core.giantswarm.io',
    'certconfigs'
  );

  return computed;
}
