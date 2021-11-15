import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

export function usePermissionsForCPNodes(
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
          'infrastructure.giantswarm.io',
          'g8scontrolplanes'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'create',
          'infrastructure.giantswarm.io',
          'awscontrolplanes'
        );

      computed.canDelete =
        hasPermission(
          permissions,
          namespace,
          'delete',
          'infrastructure.giantswarm.io',
          'g8scontrolplanes'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'delete',
          'infrastructure.giantswarm.io',
          'awscontrolplanes'
        );

      computed.canUpdate =
        hasPermission(
          permissions,
          namespace,
          'update',
          'infrastructure.giantswarm.io',
          'g8scontrolplanes'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'update',
          'infrastructure.giantswarm.io',
          'awscontrolplanes'
        );

      computed.canGet =
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.giantswarm.io',
          'g8scontrolplanes'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'get',
          'infrastructure.giantswarm.io',
          'awscontrolplanes'
        );

      computed.canList =
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.giantswarm.io',
          'g8scontrolplanes'
        ) &&
        hasPermission(
          permissions,
          namespace,
          'list',
          'infrastructure.giantswarm.io',
          'awscontrolplanes'
        );

      break;

    case Providers.AZURE:
      computed.canCreate = hasPermission(
        permissions,
        namespace,
        'create',
        'infrastructure.cluster.x-k8s.io',
        'azuremachines'
      );

      computed.canDelete = hasPermission(
        permissions,
        namespace,
        'delete',
        'infrastructure.cluster.x-k8s.io',
        'azuremachines'
      );

      computed.canUpdate = hasPermission(
        permissions,
        namespace,
        'update',
        'infrastructure.cluster.x-k8s.io',
        'azuremachines'
      );

      computed.canGet = hasPermission(
        permissions,
        namespace,
        'get',
        'infrastructure.cluster.x-k8s.io',
        'azuremachines'
      );

      computed.canList = hasPermission(
        permissions,
        namespace,
        'list',
        'infrastructure.cluster.x-k8s.io',
        'azuremachines'
      );

      break;
  }

  return computed;
}
