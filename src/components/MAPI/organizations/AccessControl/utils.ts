import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { GenericResponse } from 'model/clients/GenericResponse';
import { IHttpClient } from 'model/clients/HttpClient';
import * as corev1 from 'model/services/mapi/corev1';
import * as metav1 from 'model/services/mapi/metav1';
import * as rbacv1 from 'model/services/mapi/rbacv1';
import { IState } from 'stores/state';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

const subjectDelimiterRegexp = /\s*(?:[,\s;])+\s*/;

/**
 * Parse subjects from a serialized value (e.g. an user input).
 * @param from
 */
export function parseSubjects(from: string): string[] {
  const trimmed = from.trim();
  if (trimmed.length < 1) return [];

  return trimmed.split(subjectDelimiterRegexp).filter((s) => s.length > 0);
}

/**
 * Check if a string is a separator between subjects.
 * @param value
 */
export function isSubjectDelimiter(value: string): boolean {
  return subjectDelimiterRegexp.test(value);
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

  return Object.values(roleMap).sort((a, b) => (a.name > b.name ? 1 : -1));
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
  if (!role.rules) return [];

  const permissions: Record<string, ui.IAccessControlRoleItemPermission> = {};

  for (const rule of role.rules) {
    if (
      !rule.hasOwnProperty('apiGroups') &&
      !rule.hasOwnProperty('resourceNames') &&
      !rule.hasOwnProperty('resources')
    ) {
      continue;
    }

    const hashKey = [
      rule.apiGroups?.join(),
      rule.resources?.join(),
      rule.resourcesNames?.join(),
    ].join();

    if (permissions.hasOwnProperty(hashKey)) {
      // Aggregate verbs for similar rules.
      permissions[hashKey].verbs.push(...rule.verbs);
    } else {
      permissions[hashKey] = {
        verbs: rule.verbs,
        apiGroups: rule.apiGroups ?? [],
        resources: rule.resources ?? [],
        resourceNames: rule.resourcesNames ?? [],
      };
    }
  }

  const permissionCollection = Object.values(permissions);

  return permissionCollection.sort(sortPermissions);
}

/**
 * Sort permissions by:
 * - apiGroups
 * - resources
 * - resourceNames
 * @param a
 * @param b
 */
export function sortPermissions(
  a: ui.IAccessControlRoleItemPermission,
  b: ui.IAccessControlRoleItemPermission
): number {
  const sortRules = [
    () => a.apiGroups.join().localeCompare(b.apiGroups.join()),
    () => a.resources.join().localeCompare(b.resources.join()),
    () => a.resourceNames.join().localeCompare(b.resourceNames.join()),
  ];

  let ruleResult = 0;
  for (const rule of sortRules) {
    ruleResult = rule();
    if (ruleResult !== 0) return ruleResult;
  }

  return ruleResult;
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
    const valuesToCheck: string[] = [
      role.name,
      ...Object.keys(role.groups),
      ...Object.keys(role.users),
      ...Object.keys(role.serviceAccounts),
    ];

    for (const permission of role.permissions) {
      valuesToCheck.push(
        ...permission.apiGroups,
        ...permission.resources,
        ...permission.resourceNames
      );
    }

    return valuesToCheck.some((value: string) => {
      return value.toLowerCase().includes(searchQuery);
    });
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
  const roleBinding = makeRoleBinding(roleItem);
  roleBinding.metadata.namespace = namespace;
  for (const name of subjectNames) {
    const subject: rbacv1.ISubject = {
      name,
      kind: mapUiSubjectTypeToSubjectKind(type),
      apiGroup: 'rbac.authorization.k8s.io',
    };

    if (subject.kind === rbacv1.SubjectKinds.ServiceAccount) {
      subject.apiGroup = '';
      subject.namespace = namespace;
    }

    roleBinding.subjects.push(subject);
  }

  return rbacv1.createRoleBinding(clientFactory(), auth, roleBinding);
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

  // Delete the subjects that match.
  bindingResource.subjects = bindingResource.subjects.filter((s) => {
    const isSubject = s.kind === subjectKind && s.name === subject.name;

    return !isSubject;
  });

  // If there's no subject left, we can delete the resource.
  if (bindingResource.subjects.length < 1) {
    await rbacv1.deleteRoleBinding(clientFactory(), auth, bindingResource);

    bindingResource.metadata.deletionTimestamp = new Date().toISOString();

    return bindingResource;
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
 * Check if an account exists. If it does, return its name with an 'Updated' status.
 * If it doesn't, create the account and return its name with a 'Created' status.
 *
 * @param client
 * @param auth
 * @param name
 * @param namespace
 */
export async function ensureServiceAccount(
  client: IHttpClient,
  auth: IOAuth2Provider,
  name: string,
  namespace: string
): Promise<ui.IAccessControlServiceAccount> {
  try {
    await corev1.getServiceAccount(client, auth, name, namespace);

    return { name, status: ui.AccessControlRoleSubjectStatus.Updated };
  } catch (err: unknown) {
    // If the service account is not found, we'll create it.
    if (
      !metav1.isStatusError(
        (err as GenericResponse).data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      return Promise.reject(err);
    }
  }

  const serviceAccount = makeServiceAccount(name);
  serviceAccount.metadata.namespace = namespace;

  await corev1.createServiceAccount(client, auth, serviceAccount);

  return { name, status: ui.AccessControlRoleSubjectStatus.Created };
}

/**
 * Filter subject suggestions based on the
 * existing value.
 * @param existing
 * @param suggestions
 * @param limit
 */
export function filterSubjectSuggestions(
  existing: string,
  suggestions: string[],
  limit: number
): string[] {
  const isLastCharDelimiter = isSubjectDelimiter(existing.slice(-1));

  const subjects = parseSubjects(existing);
  const uniqueSuggestions = suggestions.filter((suggestion) => {
    for (let i = 0; i < subjects.length; i++) {
      // Include the subject if the user is trying to get auto-completion.
      if (!isLastCharDelimiter && i === subjects.length - 1) {
        return true;
      }

      // Don't include existing subjects.
      if (suggestion === subjects[i]) {
        return false;
      }
    }

    return true;
  });

  /**
   * There isn't any value here, let's just return
   * the full suggestion list.
   * If the latest char is a delimiter, it means
   * that the user is trying to add a new value, and
   * doesn't need filtering based on a search query.
   */
  if (subjects.length < 1 || isLastCharDelimiter) {
    return uniqueSuggestions.slice(0, limit);
  }

  /**
   * Consider the last entry as a search query,
   * and try to find suggestions that fit.
   */
  const searchQuery = subjects[subjects.length - 1].toLowerCase();
  const newSuggestions = uniqueSuggestions.filter((suggestion) => {
    return suggestion.toLowerCase().startsWith(searchQuery);
  });

  return newSuggestions.slice(0, limit);
}

/**
 * Append a subject suggestion to a serialized
 * collection of subjects.
 * @param value
 * @param suggestion
 */
export function appendSubjectSuggestionToValue(
  value: string,
  suggestion: string
): string {
  if (value.length < 1 && suggestion.length < 1) return '';

  const subjects = parseSubjects(value);

  let newValue = value;
  if (subjects.length > 0 && !isSubjectDelimiter(newValue.slice(-1))) {
    const latestSubjectLength = subjects[subjects.length - 1].length;
    newValue = newValue.substr(0, newValue.length - latestSubjectLength);
  }

  return `${newValue}${suggestion}, `;
}

/**
 * Fetch all the service accounts in a namespace, and map them
 * into a list of names.
 * @param client
 * @param auth
 * @param namespace
 */
export async function fetchServiceAccountSuggestions(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string = 'default'
): Promise<string[]> {
  const serviceAccounts = await corev1.getServiceAccountList(
    client,
    auth,
    namespace
  );

  return serviceAccounts.items.map((account) => account.metadata.name);
}

/**
 * The unique cache key for the service account suggestion fetcher.
 * @param namespace
 */
export function fetchServiceAccountSuggestionsKey(
  namespace: string = 'default'
): string {
  return corev1.getServiceAccountListKey(namespace);
}

export function computePermissions(
  _state: IState
): ui.IAccessControlPermissions {
  return {
    subjects: {
      [ui.AccessControlSubjectTypes.Group]: {
        canAdd: false,
        canDelete: false,
        canList: true,
      },
      [ui.AccessControlSubjectTypes.User]: {
        canAdd: false,
        canDelete: false,
        canList: true,
      },
      [ui.AccessControlSubjectTypes.ServiceAccount]: {
        canAdd: true,
        canDelete: true,
        canList: true,
      },
    },
  };
}

export function canListSubjects(
  subjectCollection: ui.IAccessControlRoleSubjectItem[],
  subjectPermissions: ui.IAccessControlSubjectPermissions
): boolean {
  if (!subjectPermissions.canAdd && subjectCollection.length < 1) return false;

  return subjectPermissions.canList;
}
