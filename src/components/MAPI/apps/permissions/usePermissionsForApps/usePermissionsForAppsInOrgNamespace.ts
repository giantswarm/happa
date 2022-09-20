import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

import { IAppsPermissions } from '../types';
import { usePermissionsForAppConfigsInOrgNamespace } from './usePermissionsForAppConfigsInOrgNamespace';

export function usePermissionsForAppsInOrgNamespace(
  provider: PropertiesOf<typeof Providers>,
  namespace: string
) {
  const { data: permissions } = usePermissions();
  const appConfigsPermissions = usePermissionsForAppConfigsInOrgNamespace(
    provider,
    namespace
  );

  const computed: IAppsPermissions = {
    canGet: false,
    canList: false,
    canUpdate: false,
    canCreate: false,
    canDelete: false,
    canConfigure: false,
  };

  if (!permissions) return computed;

  computed.canGet = hasPermission(
    permissions,
    namespace,
    'get',
    'application.giantswarm.io',
    'apps'
  );
  computed.canList = hasPermission(
    permissions,
    namespace,
    'list',
    'application.giantswarm.io',
    'apps'
  );
  computed.canUpdate = hasPermission(
    permissions,
    namespace,
    'update',
    'application.giantswarm.io',
    'apps'
  );
  computed.canCreate = hasPermission(
    permissions,
    namespace,
    'create',
    'application.giantswarm.io',
    'apps'
  );
  computed.canDelete = hasPermission(
    permissions,
    namespace,
    'delete',
    'application.giantswarm.io',
    'apps'
  );
  computed.canConfigure =
    computed.canGet &&
    computed.canUpdate &&
    appConfigsPermissions.canGet &&
    appConfigsPermissions.canUpdate &&
    appConfigsPermissions.canCreate;

  return computed;
}
