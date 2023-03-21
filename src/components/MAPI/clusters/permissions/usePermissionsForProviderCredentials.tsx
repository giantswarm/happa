import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';

export function usePermissionsForProviderCredentials(
  provider: PropertiesOf<typeof Providers>,
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

  switch (provider) {
    case Providers.AWS:
    case Providers.AZURE:
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
      break;

    case Providers.CAPA:
      computed.canGet = hasPermission(
        permissions,
        namespace,
        'get',
        'infrastructure.cluster.x-k8s.io',
        'awsclusterroleidentities'
      );
      computed.canList = hasPermission(
        permissions,
        namespace,
        'list',
        'infrastructure.cluster.x-k8s.io',
        'awsclusterroleidentities'
      );
      computed.canUpdate = hasPermission(
        permissions,
        namespace,
        'update',
        'infrastructure.cluster.x-k8s.io',
        'awsclusterroleidentities'
      );
      computed.canCreate = hasPermission(
        permissions,
        namespace,
        'create',
        'infrastructure.cluster.x-k8s.io',
        'awsclusterroleidentities'
      );
      computed.canDelete = hasPermission(
        permissions,
        namespace,
        'delete',
        'infrastructure.cluster.x-k8s.io',
        'awsclusterroleidentities'
      );
      break;

    case Providers.CAPZ:
      computed.canGet = hasPermission(
        permissions,
        namespace,
        'get',
        'infrastructure.cluster.x-k8s.io',
        'azureclusteridentities'
      );
      computed.canList = hasPermission(
        permissions,
        namespace,
        'list',
        'infrastructure.cluster.x-k8s.io',
        'azureclusteridentities'
      );
      computed.canUpdate = hasPermission(
        permissions,
        namespace,
        'update',
        'infrastructure.cluster.x-k8s.io',
        'azureclusteridentities'
      );
      computed.canCreate = hasPermission(
        permissions,
        namespace,
        'create',
        'infrastructure.cluster.x-k8s.io',
        'azureclusteridentities'
      );
      computed.canDelete = hasPermission(
        permissions,
        namespace,
        'delete',
        'infrastructure.cluster.x-k8s.io',
        'azureclusteridentities'
      );
      break;
  }

  return computed;
}
