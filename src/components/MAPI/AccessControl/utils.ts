import { IHttpClient } from 'model/clients/HttpClient';
import * as rbacv1 from 'model/services/mapi/rbacv1';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

const subjectDelimiterRegexp = /\s*(?:[,\s;])\s*/;

/**
 * Parse subjects from a serialized value (e.g. an user input).
 * @param from
 */
export function parseSubjects(from: string): string[] {
  const trimmed = from.trim();
  if (trimmed.length < 1) return [];

  return trimmed.split(subjectDelimiterRegexp);
}

/**
 * Map all the resources necessary for rendering the whole UI.
 * @param clusterRoles
 * @param roles
 * @param clusterRoleBindings
 * @param roleBindings
 */
export function mapResourcesToUiRoles(
  clusterRoles: rbacv1.IClusterRoleList,
  roles: rbacv1.IRoleList,
  clusterRoleBindings: rbacv1.IClusterRoleBindingList,
  roleBindings: rbacv1.IRoleBindingList
): ui.IAccessControlRoleItem[] {
  const roleMap: Record<string, ui.IAccessControlRoleItem> = {};

  for (const role of clusterRoles.items) {
    if (
      !roleMap.hasOwnProperty(role.metadata.name) &&
      shouldDisplayRole(role)
    ) {
      roleMap[role.metadata.name] = {
        name: role.metadata.name,
        inCluster: true,
        managedBy: rbacv1.getManagedBy(role) ?? '',
        groups: {},
        serviceAccounts: {},
        users: {},
        permissions: getRolePermissions(role),
      };
    }
  }

  for (const role of roles.items) {
    if (
      // Don't override ClusterRoles with the same name.
      !roleMap.hasOwnProperty(role.metadata.name) &&
      shouldDisplayRole(role)
    ) {
      roleMap[role.metadata.name] = {
        name: role.metadata.name,
        inCluster: false,
        managedBy: rbacv1.getManagedBy(role) ?? '',
        groups: {},
        serviceAccounts: {},
        users: {},
        permissions: getRolePermissions(role),
      };
    }
  }

  for (const binding of clusterRoleBindings.items) {
    const role = roleMap[binding.roleRef.name];
    if (role?.inCluster) {
      appendSubjectsToRoleItem(binding, role);
    }
  }

  for (const binding of roleBindings.items) {
    const role = roleMap[binding.roleRef.name];
    if (role?.inCluster === false) {
      appendSubjectsToRoleItem(binding, role);
    }
  }

  return Object.values(roleMap);
}

/**
 * Get all the subjects from a role binding, and group them by type
 * (e.g. `groups`, `users`, `serviceAccounts`).
 * @param binding
 */
function appendSubjectsToRoleItem(
  binding: rbacv1.IClusterRoleBinding | rbacv1.IRoleBinding,
  role: ui.IAccessControlRoleItem
) {
  const uiRoleBinding: ui.IAccessControlRoleSubjectRoleBinding = {
    name: binding.metadata.name,
    namespace: binding.metadata.namespace ?? '',
    inCluster: binding.kind === rbacv1.ClusterRoleBinding,
  };

  for (const subject of binding.subjects) {
    switch (subject.kind) {
      case rbacv1.SubjectKinds.Group:
        if (role.groups.hasOwnProperty(subject.name)) {
          role.groups[subject.name].roleBindings.push(uiRoleBinding);
          continue;
        }

        role.groups[subject.name] = {
          name: subject.name,
          isEditable: isSubjectEditable(subject),
          roleBindings: [uiRoleBinding],
        };
        break;
      case rbacv1.SubjectKinds.User:
        if (role.users.hasOwnProperty(subject.name)) {
          role.users[subject.name].roleBindings.push(uiRoleBinding);
          continue;
        }

        role.users[subject.name] = {
          name: subject.name,
          isEditable: isSubjectEditable(subject),
          roleBindings: [uiRoleBinding],
        };
        break;
      case rbacv1.SubjectKinds.ServiceAccount:
        if (role.serviceAccounts.hasOwnProperty(subject.name)) {
          role.serviceAccounts[subject.name].roleBindings.push(uiRoleBinding);
          continue;
        }

        role.serviceAccounts[subject.name] = {
          name: subject.name,
          isEditable: isSubjectEditable(subject),
          roleBindings: [uiRoleBinding],
        };
        break;
    }
  }
}

/**
 * Extract all the permissions from given roles.
 * @param role
 */
export function getRolePermissions(
  role: rbacv1.IClusterRole | rbacv1.IRole
): ui.IAccessControlRoleItemPermission[] {
  const permissions: ui.IAccessControlRoleItemPermission[] = [];

  for (const rule of role.rules) {
    if (
      !rule.hasOwnProperty('apiGroups') &&
      !rule.hasOwnProperty('resourceNames') &&
      !rule.hasOwnProperty('resources')
    ) {
      continue;
    }

    permissions.push({
      verbs: rule.verbs ?? [],
      apiGroups: rule.apiGroups ?? [],
      resourceNames: rule.resourcesNames ?? [],
      resources: rule.resources ?? [],
    });
  }

  return permissions;
}

/**
 * Fetch the list of roles and role bindings and map it to the
 * data structure necessary for rendering the UI.
 * @param client
 * @param user
 */
export function getRoleItems(client: IHttpClient, user: ILoggedInUser) {
  return async () => {
    const response = await Promise.all([
      rbacv1.getClusterRoleList(client, user)(),
      rbacv1.getRoleList(client, user)(),
      rbacv1.getClusterRoleBindingList(client, user)(),
      rbacv1.getRoleBindingList(client, user)(),
    ]);

    return mapResourcesToUiRoles(...response);
  };
}

/**
 * Get the cache key used for the role getter request in.
 * @param user
 */
export function getRoleItemsKey(user: ILoggedInUser | null): string | null {
  const keyParts = [
    rbacv1.getClusterRoleListKey(user),
    rbacv1.getRoleListKey(user),
    rbacv1.getClusterRoleBindingListKey(user),
    rbacv1.getRoleBindingListKey(user),
  ];

  let key = '';
  for (const part of keyParts) {
    if (!part) return null;

    key += part;
  }

  return key;
}

/**
 * Check if an user should be able to edit a subject.
 * @param subject
 */
function isSubjectEditable(subject: rbacv1.ISubject): boolean {
  return !subject.name.startsWith('system:');
}

/**
 * Check if a role should be displayed to the user or not.
 * @param role
 */
function shouldDisplayRole(role: rbacv1.IClusterRole | rbacv1.IRole): boolean {
  switch (true) {
    case role.metadata.name.startsWith('system:'):
    case rbacv1.getAppBranch(role) &&
      rbacv1.getManagedBy(role) === 'rbac-operator':
    case rbacv1.getUiDisplay(role) === false:
      return false;
    default:
      return true;
  }
}

/**
 * Filter roles based on a search query.
 * @param roles
 * @param query
 */
export function filterRoles(
  roles: ui.IAccessControlRoleItem[],
  query: string
): ui.IAccessControlRoleItem[] {
  return roles.filter((role) => {
    const searchQuery = query.trim().toLowerCase();
    if (!searchQuery) return true;

    const value = role.name.toLowerCase();

    return value.includes(searchQuery);
  });
}

export function getUserNameParts(
  user: string
): [userName: string, domain?: string] {
  const userParts = user.split('@');

  return [userParts[0], userParts[1]];
}

export function makeRoleBinding(
  roleItem: ui.IAccessControlRoleItem
): rbacv1.IClusterRoleBinding | rbacv1.IRoleBinding {
  const now = Date.now();

  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: roleItem.inCluster ? rbacv1.ClusterRoleBinding : rbacv1.RoleBinding,
    metadata: {
      name: `${roleItem.name}-${now}`,
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: roleItem.inCluster ? rbacv1.ClusterRole : rbacv1.Role,
      name: roleItem.name,
    },
    subjects: [],
  };
}

export function mapUiSubjectTypeToSubjectKind(
  type: ui.AccessControlSubjectTypes
): rbacv1.SubjectKinds {
  switch (type) {
    case ui.AccessControlSubjectTypes.Group:
      return rbacv1.SubjectKinds.Group;
    case ui.AccessControlSubjectTypes.User:
      return rbacv1.SubjectKinds.User;
    case ui.AccessControlSubjectTypes.ServiceAccount:
      return rbacv1.SubjectKinds.ServiceAccount;
    default:
      return rbacv1.SubjectKinds.Group;
  }
}

export async function removeSubjectFromClusterRoleBinding(
  client: IHttpClient,
  user: ILoggedInUser,
  subjectName: string,
  subjectType: ui.AccessControlSubjectTypes,
  binding: ui.IAccessControlRoleSubjectRoleBinding
) {
  const subjectKind = mapUiSubjectTypeToSubjectKind(subjectType);

  const bindingResource = await rbacv1.getClusterRoleBinding(
    client,
    user,
    binding.name
  )();
  // Remove the subjects that match.
  bindingResource.subjects = bindingResource.subjects.filter((subject) => {
    const isSubject =
      subject.kind === subjectKind && subject.name === subjectName;

    return !isSubject;
  });

  // If there's no subject left, we can delete the resource.
  if (bindingResource.subjects.length < 1) {
    return rbacv1.deleteClusterRoleBinding(
      client,
      user,
      bindingResource.metadata.name
    );
  }

  // There are other subjects there, let's keep the resource.
  return rbacv1.updateClusterRoleBinding(client, user, bindingResource);
}

export async function removeSubjectFromAllClusterRoleBindings(
  client: IHttpClient,
  user: ILoggedInUser,
  subjectName: string,
  subjectType: ui.AccessControlSubjectTypes,
  bindings: ui.IAccessControlRoleSubjectRoleBinding[]
) {
  return Promise.all(
    bindings.map((binding) =>
      removeSubjectFromClusterRoleBinding(
        client,
        user,
        subjectName,
        subjectType,
        binding
      )
    )
  );
}
