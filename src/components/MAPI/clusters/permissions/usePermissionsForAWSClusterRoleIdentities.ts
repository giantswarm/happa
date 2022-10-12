import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

export function usePermissionsForAWSClusterRoleIdentities(
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

  return computed;
}
