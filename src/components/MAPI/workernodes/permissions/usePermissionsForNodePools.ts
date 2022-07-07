import { usePermissionsForClusterApps } from 'MAPI/apps/permissions/usePermissionsForClusterApps';
import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

import { usePermissionsForSparks } from './usePermissionsForSparks';

// eslint-disable-next-line complexity
export function usePermissionsForNodePools(
  provider: PropertiesOf<typeof Providers>,
  namespace: string
) {
  const { canUpdate: canUpdateClusterApps } = usePermissionsForClusterApps(
    provider,
    namespace
  );

  const { canCreate: canCreateSparks } = usePermissionsForSparks(
    provider,
    namespace
  );

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
        hasPermission(
          permissions,
          namespace,
          'create',
          'cluster.x-k8s.io',
          'machinedeployments'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'create',
          'infrastructure.giantswarm.io',
          'awsmachinedeployments'
        );

      computed.canDelete =
        hasPermission(
          permissions,
          namespace,
          'delete',
          'cluster.x-k8s.io',
          'machinedeployments'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'delete',
          'infrastructure.giantswarm.io',
          'awsmachinedeployments'
        );

      computed.canUpdate =
        hasPermission(
          permissions,
          namespace,
          'update',
          'cluster.x-k8s.io',
          'machinedeployments'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'update',
          'infrastructure.giantswarm.io',
          'awsmachinedeployments'
        );

      computed.canGet =
        hasPermission(
          permissions,
          namespace,
          'get',
          'cluster.x-k8s.io',
          'machinedeployments'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.giantswarm.io',
          'awsmachinedeployments'
        );

      computed.canList =
        hasPermission(
          permissions,
          namespace,
          'list',
          'cluster.x-k8s.io',
          'machinedeployments'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.giantswarm.io',
          'awsmachinedeployments'
        );

      break;

    case Providers.AZURE:
      computed.canCreate =
        canCreateSparks &&
        hasPermission(
          permissions,
          namespace,
          'create',
          'exp.cluster.x-k8s.io',
          'machinepools'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'create',
          'infrastructure.cluster.x-k8s.io',
          'azuremachines'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'create',
          'exp.infrastructure.cluster.x-k8s.io',
          'azuremachinepools'
        );

      computed.canDelete =
        hasPermission(
          permissions,
          namespace,
          'delete',
          'exp.cluster.x-k8s.io',
          'machinepools'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'delete',
          'infrastructure.cluster.x-k8s.io',
          'azuremachines'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'delete',
          'exp.infrastructure.cluster.x-k8s.io',
          'azuremachinepools'
        );

      computed.canUpdate =
        hasPermission(
          permissions,
          namespace,
          'update',
          'exp.cluster.x-k8s.io',
          'machinepools'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'update',
          'infrastructure.cluster.x-k8s.io',
          'azuremachines'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'update',
          'exp.infrastructure.cluster.x-k8s.io',
          'azuremachinepools'
        );

      computed.canGet =
        hasPermission(
          permissions,
          namespace,
          'get',
          'exp.cluster.x-k8s.io',
          'machinepools'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.cluster.x-k8s.io',
          'azuremachines'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'exp.infrastructure.cluster.x-k8s.io',
          'azuremachinepools'
        );

      computed.canList =
        hasPermission(
          permissions,
          namespace,
          'list',
          'exp.cluster.x-k8s.io',
          'machinepools'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.cluster.x-k8s.io',
          'azuremachines'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'exp.infrastructure.cluster.x-k8s.io',
          'azuremachinepools'
        );

      break;

    case Providers.GCP:
      // Node pools are mutated through the cluster app's ConfigMap
      computed.canCreate = canUpdateClusterApps;
      computed.canDelete = canUpdateClusterApps;
      computed.canUpdate = canUpdateClusterApps;

      computed.canGet =
        hasPermission(
          permissions,
          namespace,
          'get',
          'cluster.x-k8s.io',
          'machinedeployments'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.cluster.x-k8s.io',
          'gcpmachinetemplates'
        );

      computed.canList =
        hasPermission(
          permissions,
          namespace,
          'list',
          'cluster.x-k8s.io',
          'machinedeployments'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.cluster.x-k8s.io',
          'gcpmachinetemplates'
        );

      break;
  }

  return computed;
}
