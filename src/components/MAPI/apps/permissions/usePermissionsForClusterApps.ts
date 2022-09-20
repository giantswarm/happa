import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

import { usePermissionsForAppsInOrgNamespace } from './usePermissionsForApps/usePermissionsForAppsInOrgNamespace';

export function usePermissionsForClusterApps(
  provider: PropertiesOf<typeof Providers>,
  namespace: string
) {
  const { data: permissions } = usePermissions();
  const appPermissions = usePermissionsForAppsInOrgNamespace(
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

  if (!permissions) return computed;

  computed.canCreate =
    Boolean(appPermissions.canCreate) &&
    hasPermission(permissions, namespace, 'create', '', 'configmaps');

  computed.canDelete =
    Boolean(appPermissions.canDelete) &&
    hasPermission(permissions, namespace, 'delete', '', 'configmaps');

  computed.canUpdate =
    Boolean(appPermissions.canUpdate) &&
    hasPermission(permissions, namespace, 'update', '', 'configmaps');

  computed.canGet =
    Boolean(appPermissions.canGet) &&
    hasPermission(permissions, namespace, 'get', '', 'configmaps');

  computed.canList =
    Boolean(appPermissions.canList) &&
    hasPermission(permissions, namespace, 'list', '', 'configmaps');

  return computed;
}
