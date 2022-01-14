import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

export function usePermissionsForReleases(
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
    'release.giantswarm.io',
    'releases'
  );
  computed.canList = hasPermission(
    permissions,
    namespace,
    'list',
    'release.giantswarm.io',
    'releases'
  );
  computed.canUpdate = hasPermission(
    permissions,
    namespace,
    'update',
    'release.giantswarm.io',
    'releases'
  );
  computed.canCreate = hasPermission(
    permissions,
    namespace,
    'create',
    'release.giantswarm.io',
    'releases'
  );
  computed.canDelete = hasPermission(
    permissions,
    namespace,
    'delete',
    'release.giantswarm.io',
    'releases'
  );

  return computed;
}
