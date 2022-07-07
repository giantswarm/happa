import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

export function usePermissionsForClusterApps(
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

  computed.canCreate =
    hasPermission(
      permissions,
      namespace,
      'create',
      'application.giantswarm.io',
      'apps'
    ) && hasPermission(permissions, namespace, 'create', '', 'configmaps');

  computed.canDelete =
    hasPermission(
      permissions,
      namespace,
      'delete',
      'application.giantswarm.io',
      'apps'
    ) && hasPermission(permissions, namespace, 'delete', '', 'configmaps');

  computed.canUpdate =
    hasPermission(
      permissions,
      namespace,
      'update',
      'application.giantswarm.io',
      'apps'
    ) && hasPermission(permissions, namespace, 'update', '', 'configmaps');

  computed.canGet =
    hasPermission(
      permissions,
      namespace,
      'get',
      'application.giantswarm.io',
      'apps'
    ) && hasPermission(permissions, namespace, 'get', '', 'configmaps');

  computed.canList =
    hasPermission(
      permissions,
      namespace,
      'list',
      'application.giantswarm.io',
      'apps'
    ) && hasPermission(permissions, namespace, 'list', '', 'configmaps');

  return computed;
}
