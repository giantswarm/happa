import { usePermissionsForClusterApps } from 'MAPI/apps/permissions/usePermissionsForClusterApps';
import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

import { usePermissionsForCPNodes } from './usePermissionsForCPNodes';

// eslint-disable-next-line complexity
export function usePermissionsForClusters(
  provider: PropertiesOf<typeof Providers>,
  namespace: string
) {
  const {
    canCreate: canCreateClusterApps,
    canDelete: canDeleteClusterApps,
    canUpdate: canUpdateClusterApps,
  } = usePermissionsForClusterApps(provider, namespace);

  const { canCreate: canCreateCPNodes, canDelete: canDeleteCPNodes } =
    usePermissionsForCPNodes(provider, namespace);

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
      computed.canCreate =
        canCreateCPNodes &&
        hasPermission(
          permissions,
          namespace,
          'create',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'create',
          'infrastructure.giantswarm.io',
          'awsclusters'
        );

      computed.canDelete =
        canDeleteCPNodes &&
        hasPermission(
          permissions,
          namespace,
          'delete',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'delete',
          'infrastructure.giantswarm.io',
          'awsclusters'
        );

      computed.canUpdate =
        hasPermission(
          permissions,
          namespace,
          'update',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'update',
          'infrastructure.giantswarm.io',
          'awsclusters'
        );

      computed.canGet =
        hasPermission(
          permissions,
          namespace,
          'get',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.giantswarm.io',
          'awsclusters'
        );

      computed.canList =
        hasPermission(
          permissions,
          namespace,
          'list',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.giantswarm.io',
          'awsclusters'
        );

      break;

    case Providers.AZURE:
      computed.canCreate =
        canCreateCPNodes &&
        hasPermission(
          permissions,
          namespace,
          'create',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'create',
          'infrastructure.cluster.x-k8s.io',
          'azureclusters'
        );

      computed.canDelete =
        canDeleteCPNodes &&
        hasPermission(
          permissions,
          namespace,
          'delete',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'delete',
          'infrastructure.cluster.x-k8s.io',
          'azureclusters'
        );

      computed.canUpdate =
        hasPermission(
          permissions,
          namespace,
          'update',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'update',
          'infrastructure.cluster.x-k8s.io',
          'azureclusters'
        );

      computed.canGet =
        hasPermission(
          permissions,
          namespace,
          'get',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.cluster.x-k8s.io',
          'azureclusters'
        );

      computed.canList =
        hasPermission(
          permissions,
          namespace,
          'list',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.cluster.x-k8s.io',
          'azureclusters'
        );

      break;

    case Providers.CAPA:
      computed.canCreate = canCreateClusterApps;
      computed.canDelete = canDeleteClusterApps;
      computed.canUpdate = canUpdateClusterApps;

      computed.canGet =
        hasPermission(
          permissions,
          namespace,
          'get',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.cluster.x-k8s.io',
          'awsclusters'
        );

      computed.canList =
        hasPermission(
          permissions,
          namespace,
          'list',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.cluster.x-k8s.io',
          'awsclusters'
        );

      break;

    case Providers.CAPZ:
      computed.canCreate = canCreateClusterApps;
      computed.canDelete = canDeleteClusterApps;
      computed.canUpdate = canUpdateClusterApps;

      computed.canGet =
        hasPermission(
          permissions,
          namespace,
          'get',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.cluster.x-k8s.io',
          'azureclusters'
        );

      computed.canList =
        hasPermission(
          permissions,
          namespace,
          'list',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.cluster.x-k8s.io',
          'azureclusters'
        );
      break;

    case Providers.GCP:
      computed.canCreate = canCreateClusterApps;
      computed.canDelete = canDeleteClusterApps;
      computed.canUpdate = canUpdateClusterApps;

      computed.canGet =
        hasPermission(
          permissions,
          namespace,
          'get',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.cluster.x-k8s.io',
          'gcpclusters'
        );

      computed.canList =
        hasPermission(
          permissions,
          namespace,
          'list',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.cluster.x-k8s.io',
          'gcpclusters'
        );

      break;

    case Providers.VSPHERE:
      computed.canCreate = canCreateClusterApps;
      computed.canDelete = canDeleteClusterApps;
      computed.canUpdate = canUpdateClusterApps;

      computed.canGet =
        hasPermission(
          permissions,
          namespace,
          'get',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.cluster.x-k8s.io',
          'vsphereclusters'
        );

      computed.canList =
        hasPermission(
          permissions,
          namespace,
          'list',
          'cluster.x-k8s.io',
          'clusters'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.cluster.x-k8s.io',
          'vsphereclusters'
        );

      break;
  }

  return computed;
}
