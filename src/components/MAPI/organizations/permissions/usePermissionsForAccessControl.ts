import { usePermissions } from 'MAPI/permissions/usePermissions';
import { hasPermission } from 'MAPI/permissions/utils';
import { Providers } from 'model/constants';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

export function usePermissionsForAccessControl(
  _provider: PropertiesOf<typeof Providers>,
  namespace: string
): ui.IAccessControlPermissions {
  const { data: permissions } = usePermissions();

  if (!permissions) {
    return {
      roles: {
        '': {
          canList: false,
        },
        [namespace]: {
          canList: false,
        },
      },
      subjects: {
        [ui.AccessControlSubjectTypes.Group]: {
          canCreate: false,
          canBind: false,
          canDelete: false,
          canList: false,
        },
        [ui.AccessControlSubjectTypes.User]: {
          canCreate: false,
          canBind: false,
          canDelete: false,
          canList: false,
        },
        [ui.AccessControlSubjectTypes.ServiceAccount]: {
          canCreate: false,
          canBind: false,
          canDelete: false,
          canList: false,
        },
      },
    };
  }

  const canListClusterRoles = hasPermission(
    permissions,
    'default',
    'list',
    'rbac.authorization.k8s.io',
    'clusterroles'
  );
  const canListRoles = hasPermission(
    permissions,
    namespace,
    'list',
    'rbac.authorization.k8s.io',
    'roles'
  );

  const canDeleteSubjects =
    hasPermission(
      permissions,
      namespace,
      'delete',
      'rbac.authorization.k8s.io',
      'rolebindings'
    ) &&
    hasPermission(
      permissions,
      namespace,
      'update',
      'rbac.authorization.k8s.io',
      'rolebindings'
    );

  const canBindSubjects = hasPermission(
    permissions,
    namespace,
    'create',
    'rbac.authorization.k8s.io',
    'rolebindings'
  );

  return {
    roles: {
      '': {
        canList: canListClusterRoles,
      },
      [namespace]: {
        canList: canListRoles,
      },
    },
    subjects: {
      [ui.AccessControlSubjectTypes.Group]: {
        canCreate: true,
        canBind: canBindSubjects,
        canDelete: canDeleteSubjects,
        canList: canListClusterRoles || canListRoles,
      },
      [ui.AccessControlSubjectTypes.User]: {
        canCreate: true,
        canBind: canBindSubjects,
        canDelete: canDeleteSubjects,
        canList: canListClusterRoles || canListRoles,
      },
      [ui.AccessControlSubjectTypes.ServiceAccount]: {
        canCreate: hasPermission(
          permissions,
          namespace,
          'create',
          '',
          'serviceaccounts'
        ),
        canBind:
          canBindSubjects &&
          hasPermission(permissions, namespace, 'get', '', 'serviceaccounts') &&
          hasPermission(permissions, namespace, 'list', '', 'serviceaccounts'),
        canDelete: canDeleteSubjects,
        canList: canListClusterRoles || canListRoles,
      },
    },
  };
}
