import { GenericResponse } from 'model/clients/GenericResponse';
import { IHttpClient } from 'model/clients/HttpClient';
import * as metav1 from 'model/services/mapi/metav1';
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
        namespace: '',
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
        namespace: role.metadata.namespace!,
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
    if (role?.namespace.length < 1) {
      appendSubjectsToRoleItem(binding, role);
    }
  }

  for (const binding of roleBindings.items) {
    const role = roleMap[binding.roleRef.name];
    if (role?.namespace.length > 0) {
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

export function getOrgNamespaceFromOrgName(name: string): string {
  return `org-${name}`;
}

/**
 * Fetch the list of roles and role bindings and map it to the
 * data structure necessary for rendering the UI.
 * @param client
 * @param user
 * @param organizationName
 */
export function getRoleItems(
  client: IHttpClient,
  user: ILoggedInUser,
  namespace: string
) {
  return async () => {
    const response = await Promise.all([
      rbacv1.getClusterRoleList(client, user)(),
      rbacv1.getRoleList(client, user, namespace)(),
      rbacv1.getClusterRoleBindingList(client, user)(),
      rbacv1.getRoleBindingList(client, user, namespace)(),
    ]);

    return mapResourcesToUiRoles(...response);
  };
}

/**
 * Get the cache key used for the role getter request in.
 * @param user
 */
export function getRoleItemsKey(
  user: ILoggedInUser | null,
  namespace: string
): string | null {
  const keyParts = [
    rbacv1.getClusterRoleListKey(user),
    rbacv1.getRoleListKey(user, namespace),
    rbacv1.getClusterRoleBindingListKey(user),
    rbacv1.getRoleBindingListKey(user, namespace),
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

  const inCluster = roleItem.namespace.length < 1;

  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: inCluster ? rbacv1.ClusterRoleBinding : rbacv1.RoleBinding,
    metadata: {
      name: `${roleItem.name}-${now}`,
      namespace: roleItem.namespace,
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: inCluster ? rbacv1.ClusterRole : rbacv1.Role,
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

export async function createRoleBindingWithSubjects(
  client: IHttpClient,
  user: ILoggedInUser,
  type: ui.AccessControlSubjectTypes,
  subjectNames: string[],
  roleItem: ui.IAccessControlRoleItem
) {
  const roleBinding = makeRoleBinding(roleItem);
  for (const name of subjectNames) {
    const kind = mapUiSubjectTypeToSubjectKind(type);

    // TODO(axbarsan): Actually create `ServiceAccount` resources.
    let apiGroup = '';
    if (kind !== rbacv1.SubjectKinds.ServiceAccount) {
      apiGroup = 'rbac.authorization.k8s.io';
    }

    roleBinding.subjects.push({
      name,
      kind,
      apiGroup,
    });
  }

  if (roleItem.namespace.length < 1) {
    return rbacv1.createClusterRoleBinding(
      client,
      user,
      roleBinding as rbacv1.IClusterRoleBinding
    );
  }

  return rbacv1.createRoleBinding(
    client,
    user,
    roleBinding as rbacv1.IRoleBinding
  );
}

export async function deleteSubjectFromClusterRoleBinding(
  client: IHttpClient,
  user: ILoggedInUser,
  subject: ui.IAccessControlRoleSubjectItem,
  subjectType: ui.AccessControlSubjectTypes,
  binding: ui.IAccessControlRoleSubjectRoleBinding
) {
  const subjectKind = mapUiSubjectTypeToSubjectKind(subjectType);

  const bindingResource = await rbacv1.getClusterRoleBinding(
    client,
    user,
    binding.name
  )();
  // Delete the subjects that match.
  bindingResource.subjects = bindingResource.subjects.filter((s) => {
    const isSubject = s.kind === subjectKind && s.name === subject.name;

    return !isSubject;
  });

  // If there's no subject left, we can delete the resource.
  if (bindingResource.subjects.length < 1) {
    return rbacv1.deleteClusterRoleBinding(client, user, bindingResource);
  }

  // There are other subjects there, let's keep the resource.
  return rbacv1.updateClusterRoleBinding(client, user, bindingResource);
}

export async function deleteSubjectFromRoleBinding(
  client: IHttpClient,
  user: ILoggedInUser,
  subject: ui.IAccessControlRoleSubjectItem,
  subjectType: ui.AccessControlSubjectTypes,
  binding: ui.IAccessControlRoleSubjectRoleBinding
) {
  const subjectKind = mapUiSubjectTypeToSubjectKind(subjectType);

  const bindingResource = await rbacv1.getRoleBinding(
    client,
    user,
    binding.name,
    binding.namespace
  )();
  // Delete the subjects that match.
  bindingResource.subjects = bindingResource.subjects.filter((s) => {
    const isSubject = s.kind === subjectKind && s.name === subject.name;

    return !isSubject;
  });

  // If there's no subject left, we can delete the resource.
  if (bindingResource.subjects.length < 1) {
    return rbacv1.deleteRoleBinding(client, user, bindingResource);
  }

  // There are other subjects there, let's keep the resource.
  return rbacv1.updateRoleBinding(client, user, bindingResource);
}

export async function deleteSubjectFromRole(
  client: IHttpClient,
  user: ILoggedInUser,
  subjectName: string,
  subjectType: ui.AccessControlSubjectTypes,
  roleItem: ui.IAccessControlRoleItem
) {
  const subject = findSubjectInRoleItem(subjectName, subjectType, roleItem);
  if (!subject || subject.roleBindings.length < 1) {
    return Promise.resolve();
  }

  if (roleItem.namespace.length < 1) {
    return Promise.all(
      subject.roleBindings.map((binding) =>
        deleteSubjectFromClusterRoleBinding(
          client,
          user,
          subject,
          subjectType,
          binding
        )
      )
    );
  }

  return Promise.all(
    subject.roleBindings.map((binding) =>
      deleteSubjectFromRoleBinding(client, user, subject, subjectType, binding)
    )
  );
}

export function findSubjectInRoleItem(
  subjectName: string,
  subjectType: ui.AccessControlSubjectTypes,
  role: ui.IAccessControlRoleItem
): ui.IAccessControlRoleSubjectItem | undefined {
  switch (subjectType) {
    case ui.AccessControlSubjectTypes.Group:
      return role.groups[subjectName];
    case ui.AccessControlSubjectTypes.User:
      return role.users[subjectName];
    case ui.AccessControlSubjectTypes.ServiceAccount:
      return role.serviceAccounts[subjectName];
    default:
      return undefined;
  }
}

export function extractErrorMessage(
  fromErr: unknown,
  fallback = 'Something went wrong'
): string {
  if (!fromErr) return '';

  let message = '';

  if (metav1.isStatus((fromErr as GenericResponse).data)) {
    message =
      (fromErr as GenericResponse<metav1.IK8sStatus>).data.message ?? '';
  } else if (fromErr instanceof Error) {
    message = fromErr.message;
  }

  message ||= fallback;

  return message;
}
