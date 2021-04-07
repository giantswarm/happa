import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { GenericResponse } from 'model/clients/GenericResponse';
import { IHttpClient } from 'model/clients/HttpClient';
import * as corev1 from 'model/services/mapi/corev1';
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
 * @param roleBindings
 */
export function mapResourcesToUiRoles(
  clusterRoles: rbacv1.IClusterRoleList,
  roles: rbacv1.IRoleList,
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

  for (const binding of roleBindings.items) {
    const role = roleMap[binding.roleRef.name];
    if (role) {
      appendSubjectsToRoleItem(binding, role);
    }
  }

  return Object.values(roleMap);
}

/**
 * Get all the subjects from a role binding, and group them by type
 * (e.g. `groups`, `users`, `serviceAccounts`).
 * @param binding
 * @param role
 */
export function appendSubjectsToRoleItem(
  binding: rbacv1.IRoleBinding,
  role: ui.IAccessControlRoleItem
) {
  const uiRoleBinding: ui.IAccessControlRoleSubjectRoleBinding = {
    name: binding.metadata.name,
    namespace: binding.metadata.namespace!,
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
      verbs: rule.verbs,
      apiGroups: rule.apiGroups ?? [],
      resourceNames: rule.resourcesNames ?? [],
      resources: rule.resources ?? [],
    });
  }

  return permissions;
}

/**
 * Compute an organization namespace from the given organization name.
 * @param name
 */
export function getOrgNamespaceFromOrgName(name: string): string {
  return `org-${name}`;
}

/**
 * Fetch the list of roles and role bindings and map it to the
 * data structure necessary for rendering the UI.
 * @param clientFactory
 * @param auth
 * @param namespace
 */
export async function getRoleItems(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  namespace: string
) {
  const response = await Promise.all([
    rbacv1.getClusterRoleList(clientFactory(), auth),
    rbacv1.getRoleList(clientFactory(), auth, namespace),
    rbacv1.getRoleBindingList(clientFactory(), auth, namespace),
  ]);

  return mapResourcesToUiRoles(...response);
}

/**
 * Get the cache key used for the role getter request in.
 * @param namespace
 */
export function getRoleItemsKey(namespace: string): string | null {
  const keyParts = [
    rbacv1.getClusterRoleListKey(),
    rbacv1.getRoleListKey(namespace),
    rbacv1.getRoleBindingListKey(namespace),
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
  const searchQuery = query.trim().toLowerCase();
  if (!searchQuery) return roles;

  return roles.filter((role) => {
    const value = role.name.toLowerCase();

    return value.includes(searchQuery);
  });
}

/**
 * Get the username and domain out of a subject username.
 * @param user
 */
export function getUserNameParts(
  user: string
): [userName: string, domain?: string] {
  const userParts = user.split('@');

  return userParts.slice(0, 2) as [string, string];
}

/**
 * Create empty `RoleBinding` resource, based on the given role.
 * @param roleItem
 */
export function makeRoleBinding(
  roleItem: ui.IAccessControlRoleItem
): rbacv1.IRoleBinding {
  const now = Date.now();

  const inCluster = roleItem.namespace.length < 1;

  return {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: rbacv1.RoleBinding,
    metadata: {
      name: `${roleItem.name}-${now}`,
      namespace: 'default',
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: inCluster ? rbacv1.ClusterRole : rbacv1.Role,
      name: roleItem.name,
    },
    subjects: [],
  };
}

/**
 * Create empty `ServiceAccount`, based on the given role.
 * @param name
 */
function makeServiceAccount(name: string): corev1.IServiceAccount {
  return {
    apiVersion: 'v1',
    kind: corev1.ServiceAccount,
    metadata: {
      name,
      namespace: 'default',
    },
  };
}

/**
 * Map the UI subject type to the subject kind
 * used in Kubernetes.
 * @param type
 */
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

/**
 * Create a new role binding that contains the given subjects.
 * @param clientFactory
 * @param auth
 * @param type - The type of the given subject names.
 * @param subjectNames - The given subject names.
 * @param namespace
 * @param roleItem - The role that the binding should point to.
 */
export async function createRoleBindingWithSubjects(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  type: ui.AccessControlSubjectTypes,
  subjectNames: string[],
  namespace: string,
  roleItem: ui.IAccessControlRoleItem
) {
  const subjectCreationRequests = [];

  const roleBinding = makeRoleBinding(roleItem);
  roleBinding.metadata.namespace = namespace;
  for (const name of subjectNames) {
    const subject: rbacv1.ISubject = {
      name,
      kind: mapUiSubjectTypeToSubjectKind(type),
      apiGroup: 'rbac.authorization.k8s.io',
    };

    if (subject.kind === rbacv1.SubjectKinds.ServiceAccount) {
      // We need to create a `ServiceAccount` resource first.
      const serviceAccount = makeServiceAccount(subject.name);
      serviceAccount.metadata.namespace = namespace;

      subject.apiGroup = '';
      subject.namespace = namespace;

      subjectCreationRequests.push(
        corev1.createServiceAccount(clientFactory(), auth, serviceAccount)
      );
    }

    roleBinding.subjects.push(subject);
  }

  await Promise.all(subjectCreationRequests);

  return rbacv1.createRoleBinding(clientFactory(), auth, roleBinding);
}

/**
 * Delete the service account derived from the given subject.
 * @param client
 * @param auth
 * @param subject
 */
export async function deleteServiceAccountFromSubject(
  client: IHttpClient,
  auth: IOAuth2Provider,
  subject: rbacv1.ISubject
) {
  const serviceAccount = await corev1.getServiceAccount(
    client,
    auth,
    subject.name,
    subject.namespace!
  );

  return corev1.deleteServiceAccount(client, auth, serviceAccount);
}

/**
 * Delete a subject from a given `RoleBinding` resource.
 * @param clientFactory
 * @param auth
 * @param subject
 * @param subjectType
 * @param namespace
 * @param binding
 */
export async function deleteSubjectFromRoleBinding(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  subject: ui.IAccessControlRoleSubjectItem,
  subjectType: ui.AccessControlSubjectTypes,
  namespace: string,
  binding: ui.IAccessControlRoleSubjectRoleBinding
) {
  const subjectKind = mapUiSubjectTypeToSubjectKind(subjectType);

  const bindingResource = await rbacv1.getRoleBinding(
    clientFactory(),
    auth,
    binding.name,
    namespace
  );

  const subjectDeletionRequests: Promise<corev1.IServiceAccount>[] = [];

  // Delete the subjects that match.
  bindingResource.subjects = bindingResource.subjects.filter((s) => {
    const isSubject = s.kind === subjectKind && s.name === subject.name;
    if (isSubject) {
      if (s.kind === rbacv1.SubjectKinds.ServiceAccount) {
        subjectDeletionRequests.push(
          deleteServiceAccountFromSubject(clientFactory(), auth, s)
        );
      }

      return false;
    }

    return true;
  });

  await Promise.all(subjectDeletionRequests);

  // If there's no subject left, we can delete the resource.
  if (bindingResource.subjects.length < 1) {
    return rbacv1.deleteRoleBinding(clientFactory(), auth, bindingResource);
  }

  // There are other subjects there, let's keep the resource.
  return rbacv1.updateRoleBinding(clientFactory(), auth, bindingResource);
}

/**
 * Delete a subject from a given role. It will delete the subject from
 * all the role bindings that point to this role.
 * @param clientFactory
 * @param auth
 * @param subjectName
 * @param subjectType
 * @param namespace
 * @param roleItem
 */
export async function deleteSubjectFromRole(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  subjectName: string,
  subjectType: ui.AccessControlSubjectTypes,
  namespace: string,
  roleItem: ui.IAccessControlRoleItem
) {
  const subject = findSubjectInRoleItem(subjectName, subjectType, roleItem);
  if (!subject || subject.roleBindings.length < 1) {
    return Promise.resolve();
  }

  return Promise.all(
    subject.roleBindings.map((binding) =>
      deleteSubjectFromRoleBinding(
        clientFactory,
        auth,
        subject,
        subjectType,
        namespace,
        binding
      )
    )
  );
}

/**
 * Find a subject by name and type into a given role.
 * @param subjectName
 * @param subjectType
 * @param role
 */
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

/**
 * Extract the error message from a K8s API response.
 * @param fromErr
 * @param fallback - What message to return if the message
 * could not be extracted.
 */
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
