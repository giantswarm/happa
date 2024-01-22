import { usePermissionsForClusterApps } from 'MAPI/apps/permissions/usePermissionsForClusterApps';
import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

export function usePermissionsForControlPlanes(
  provider: PropertiesOf<typeof Providers>,
  namespace: string
) {
  const {
    canCreate: canCreateClusterApps,
    canDelete: canDeleteClusterApps,
    canUpdate: canUpdateClusterApps,
  } = usePermissionsForClusterApps(provider, namespace);

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
    case Providers.CAPA:
    case Providers.CAPZ:
      computed.canCreate = canCreateClusterApps;
      computed.canDelete = canDeleteClusterApps;
      computed.canUpdate = canUpdateClusterApps;

      computed.canGet = hasPermission(
        permissions,
        namespace,
        'get',
        'controlplane.cluster.x-k8s.io',
        'kubeadmcontrolplanes'
      );

      computed.canList = hasPermission(
        permissions,
        namespace,
        'list',
        'controlplane.cluster.x-k8s.io',
        'kubeadmcontrolplanes'
      );

      break;
  }

  return computed;
}
