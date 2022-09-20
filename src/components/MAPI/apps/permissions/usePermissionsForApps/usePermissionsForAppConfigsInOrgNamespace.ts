import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

export function usePermissionsForAppConfigsInOrgNamespace(
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

  computed.canGet =
    hasPermission(permissions, namespace, 'get', '', 'configmaps') &&
    hasPermission(permissions, namespace, 'get', '', 'secrets');
  computed.canList =
    hasPermission(permissions, namespace, 'list', '', 'configmaps') &&
    hasPermission(permissions, namespace, 'list', '', 'secrets');
  computed.canUpdate =
    hasPermission(permissions, namespace, 'update', '', 'configmaps') &&
    hasPermission(permissions, namespace, 'update', '', 'secrets');
  computed.canCreate =
    hasPermission(permissions, namespace, 'create', '', 'configmaps') &&
    hasPermission(permissions, namespace, 'create', '', 'secrets');
  computed.canDelete =
    hasPermission(permissions, namespace, 'delete', '', 'configmaps') &&
    hasPermission(permissions, namespace, 'delete', '', 'secrets');

  return computed;
}
