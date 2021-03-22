import { IHttpClient } from 'model/clients/HttpClient';
import * as rbacv1 from 'model/services/mapi/rbacv1';
import { SubjectKinds } from 'model/services/mapi/rbacv1';
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
        groups: [],
        serviceAccounts: [],
        users: [],
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
        groups: [],
        serviceAccounts: [],
        users: [],
        permissions: getRolePermissions(role),
      };
    }
  }

  for (const binding of clusterRoleBindings.items) {
    if (roleMap[binding.roleRef.name]?.inCluster) {
      const subjects = getSubjectsFromBindingByCategories(binding);
      roleMap[binding.roleRef.name].groups = subjects.groups;
      roleMap[binding.roleRef.name].users = subjects.users;
      roleMap[binding.roleRef.name].serviceAccounts = subjects.serviceAccounts;
    }
  }

  for (const binding of roleBindings.items) {
    if (roleMap[binding.roleRef.name]?.inCluster === false) {
      const subjects = getSubjectsFromBindingByCategories(binding);
      roleMap[binding.roleRef.name].groups = subjects.groups;
      roleMap[binding.roleRef.name].users = subjects.users;
      roleMap[binding.roleRef.name].serviceAccounts = subjects.serviceAccounts;
    }
  }

  return Object.values(roleMap);
}

/**
 * Get all the subjects from a role binding, and group them by type
 * (e.g. `groups`, `users`, `serviceAccounts`).
 * @param binding
 */
function getSubjectsFromBindingByCategories(
  binding: rbacv1.IClusterRoleBinding | rbacv1.IRoleBinding
): Pick<ui.IAccessControlRoleItem, 'groups' | 'users' | 'serviceAccounts'> {
  const categories: Pick<
    ui.IAccessControlRoleItem,
    'groups' | 'users' | 'serviceAccounts'
  > = {
    groups: [],
    users: [],
    serviceAccounts: [],
  };

  for (const subject of binding.subjects) {
    switch (subject.kind) {
      case SubjectKinds.Group:
        categories.groups.push({
          name: subject.name,
          isEditable: isSubjectEditable(subject),
        });
        break;
      case SubjectKinds.User:
        categories.users.push({
          name: subject.name,
          isEditable: isSubjectEditable(subject),
        });
        break;
      case SubjectKinds.ServiceAccount:
        categories.serviceAccounts.push({
          name: subject.name,
          isEditable: isSubjectEditable(subject),
        });
        break;
    }
  }

  return categories;
}

/**
 * Extract all the permissions from given roles.
 * @param role
 */
export function getRolePermissions(
  role: rbacv1.IClusterRole | rbacv1.IRole
): ui.IAccessControlRoleItemPermission[] {
  return new Array(role.rules.length).fill(null).map((_, idx) => {
    const rule = role.rules[idx];

    return {
      verbs: rule.verbs ?? [],
      apiGroups: rule.apiGroups ?? [],
      resourceNames: rule.resourcesNames ?? [],
      resources: rule.resources ?? [],
    };
  });
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
