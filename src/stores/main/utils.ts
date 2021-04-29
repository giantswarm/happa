import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import * as authorizationv1 from 'model/services/mapi/authorizationv1';

import { LoggedInUserTypes } from './types';

const MAPI_ADMIN_GROUP = window.config.mapiAuthAdminGroup;

export function mapOAuth2UserToUser(user: IOAuth2User): ILoggedInUser {
  const isAdmin = user.groups.includes(MAPI_ADMIN_GROUP);

  return {
    email: user.email,
    auth: {
      scheme: user.authorizationType,
      token: user.idToken,
    },
    groups: user.groups,
    type: LoggedInUserTypes.MAPI,
    isAdmin,
  };
}

export function computePermissions(
  ruleReviews: readonly [
    namespace: string,
    review: authorizationv1.ISelfSubjectRulesReview
  ][]
): IPermissionMap {
  const permissions: IPermissionMap = {};

  for (const [namespace, review] of ruleReviews) {
    if (review.status.incomplete) {
      continue;
    }

    permissions[namespace] = computeResourceRules(review.status.resourceRules);
  }

  return permissions;
}

function hashPermissionKey(
  apiGroup: string,
  resource: string,
  resourceName: string
) {
  return `${apiGroup}:${resource}:${resourceName}`;
}

function computeResourceRules(
  rules: authorizationv1.IResourceRule[]
): INamespacePermissions {
  let permissions: INamespacePermissions = {};

  for (const rule of rules) {
    for (const group of rule.apiGroups) {
      for (const resource of rule.resources) {
        /**
         * If the rule defines verbs for all the resources
         * in the current group, then there's no need
         * to take into account resource names.
         */
        if (resource === '*') {
          const key = hashPermissionKey(group, '*', '*');
          appendKeyToNamespacePermissions(key, rule.verbs, permissions);

          break;
        }

        if (rule.resourceNames) {
          for (const resourceName of rule.resourceNames) {
            const key = hashPermissionKey(group, resource, resourceName);
            appendKeyToNamespacePermissions(key, rule.verbs, permissions);
          }

          continue;
        }

        const key = hashPermissionKey(group, resource, '*');
        appendKeyToNamespacePermissions(key, rule.verbs, permissions);
      }
    }
  }

  permissions = optimizeNamespacePermissions(permissions);

  return permissions;
}

function appendKeyToNamespacePermissions(
  key: string,
  verbs: string[],
  permissions: INamespacePermissions
) {
  if (key.length < 1) return;

  const uniqueVerbs: Set<string> = permissions.hasOwnProperty(key)
    ? new Set([...permissions[key], ...verbs])
    : new Set(verbs);

  if (uniqueVerbs.has('*')) {
    permissions[key] = ['*'];

    return;
  }

  permissions[key] = Array.from(uniqueVerbs);
}

function optimizeNamespacePermissions(
  permissions: INamespacePermissions
): INamespacePermissions {
  const newPermissions: INamespacePermissions = Object.assign({}, permissions);

  for (const key of Object.keys(permissions)) {
    const [group, resource, resourceName] = key.split(':');

    /**
     * If the user has access to everything,
     * there's no need to store anything else.
     */
    if (
      group === '*' &&
      resource === '*' &&
      resourceName === '*' &&
      newPermissions[key].length === 1 &&
      newPermissions[key][0] === '*'
    ) {
      return {
        [key]: ['*'],
      };
    }

    const wildcardPermissionsKeys: string[] = [];

    if (group.length > 0) {
      wildcardPermissionsKeys.push(hashPermissionKey('*', '*', '*'));
    }

    if (resource.length > 0) {
      wildcardPermissionsKeys.push(hashPermissionKey(group, '*', '*'));
    }

    if (resourceName.length > 0) {
      wildcardPermissionsKeys.push(hashPermissionKey(group, resource, '*'));
    }

    /**
     * Merge permissions from  wildcard rules that include all (`*`)
     * groups, resources and resource names with the ones
     * that include specific groups, resources and resource names.
     *
     * For example: add permissions from `:apps:*` to `:apps:some-app`.
     * @example `*:*:*` and `apps.gs.io:apps:*`
     * @example `apps.gs.io:*:*` and `apps.gs.io:apps:*`
     * @example `:apps:*` and `:apps:some-app`
     */
    for (const wildcardKey of wildcardPermissionsKeys) {
      if (newPermissions.hasOwnProperty(wildcardKey)) {
        appendKeyToNamespacePermissions(
          key,
          newPermissions[wildcardKey],
          newPermissions
        );
      }
    }
  }

  return newPermissions;
}

/**
 * Check if the user has the permission to use
 * the given verb for the given resource configuration.
 * @param permissions
 * @param verb
 * @param group
 * @param resource
 * @param resourceName
 */
export function hasNamespacePermission(
  permissions: INamespacePermissions,
  verb: PermissionVerb,
  group: string,
  resource: string,
  resourceName: string = '*'
): boolean {
  let verbs: string[] = [];

  const key = hashPermissionKey(group, resource, resourceName);
  if (permissions.hasOwnProperty(key)) {
    verbs = permissions[key];
  } else {
    const wildcardKey = hashPermissionKey('*', '*', '*');
    if (!permissions.hasOwnProperty(wildcardKey)) return false;

    verbs = permissions[wildcardKey];
  }

  if (verbs.length === 1 && verbs[0] === '*') return true;

  return verbs.includes(verb);
}

/**
 * Check if the user has the permission to use
 * the given verb for the given resource configuration
 * in the given namespace.
 * @param permissions
 * @param namespace
 * @param verb
 * @param group
 * @param resource
 * @param resourceName
 */
export function hasPermission(
  permissions: IPermissionMap,
  namespace: string,
  verb: string,
  group: string,
  resource: string,
  resourceName?: string
): boolean {
  if (!permissions.hasOwnProperty(namespace)) return false;

  return hasNamespacePermission(
    permissions[namespace],
    verb,
    group,
    resource,
    resourceName
  );
}

/**
 * Compute an organization namespace from the given organization name.
 * This also makes the org name follow the [DNS label standard](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names).
 * @param name
 */
export function getNamespaceFromOrgName(name: string): string {
  if (name.length < 1) return '';

  const prefix = 'org-';
  const nameChars = [];
  for (const char of name.toLowerCase()) {
    // Allow maximum 63 chars.
    // eslint-disable-next-line no-magic-numbers
    if (nameChars.length === 63 - prefix.length) break;

    if ((char >= '0' && char <= '9') || (char >= 'a' && char <= 'z')) {
      nameChars.push(char);
    } else if (
      nameChars.length > 0 &&
      nameChars[nameChars.length - 1] !== '-'
    ) {
      nameChars.push('-');
    }
  }

  if (nameChars.length < 1) return '';

  // Remove trailing `-` char if it exists.
  if (nameChars[nameChars.length - 1] === '-') {
    nameChars.pop();
  }

  return `org-${nameChars.join('')}`;
}
