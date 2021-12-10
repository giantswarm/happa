import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';

// eslint-disable-next-line complexity
export function usePermissionsForNodePools(
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
        ) &&
        hasPermission(
          permissions,
          namespace,
          'create',
          'core.giantswarm.io',
          'sparks'
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
        ) &&
        hasPermission(
          permissions,
          namespace,
          'delete',
          'core.giantswarm.io',
          'sparks'
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
        ) &&
        hasPermission(
          permissions,
          namespace,
          'update',
          'core.giantswarm.io',
          'sparks'
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
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'core.giantswarm.io',
          'sparks'
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
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'core.giantswarm.io',
          'sparks'
        );

      break;
  }

  return computed;
}
