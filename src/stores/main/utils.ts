import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import * as authorizationv1 from 'model/services/mapi/authorizationv1';

import { LoggedInUserTypes } from './types';

const MAPI_ADMIN_GROUP = 'giantswarm:giantswarm-admins';

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
    if (!review.status || review.status.incomplete) {
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
): IOrganizationPermissions {
  const permissions: IOrganizationPermissions = {};

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
          appendKeyToOrgPermissions(key, rule.verbs, permissions);

          break;
        }

        if (rule.resourceNames) {
          for (const resourceName of rule.resourceNames) {
            const key = hashPermissionKey(group, resource, resourceName);
            appendKeyToOrgPermissions(key, rule.verbs, permissions);
          }

          continue;
        }

        const key = hashPermissionKey(group, resource, '*');
        appendKeyToOrgPermissions(key, rule.verbs, permissions);
      }
    }
  }

  optimizeOrgPermissions(permissions);

  return permissions;
}

function appendKeyToOrgPermissions(
  key: string,
  verbs: string[],
  permissions: IOrganizationPermissions
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

function optimizeOrgPermissions(
  permissions: IOrganizationPermissions
): IOrganizationPermissions {
  for (const key of Object.keys(permissions)) {
    const [group, resource, resourceName] = key.split(':');

    /**
     * Handle the case when all resources have the same verbs.
     */
    if (group === '*' && resource === '*' && resourceName === '*') {
      return {
        [key]: permissions[key],
      };
    }

    /**
     * Merge permissions from rules that include all (`*`)
     * resources, and the ones that include specific resources.
     *
     * For example: add permissions from `apps.gs.io:*:*` to `apps.gs.io:apps:*`.
     */
    if (resource.length > 0) {
      const commonPermissionsKey = hashPermissionKey(group, '*', '*');
      if (permissions.hasOwnProperty(commonPermissionsKey)) {
        appendKeyToOrgPermissions(
          key,
          permissions[commonPermissionsKey],
          permissions
        );
      }
    }

    /**
     * Merge permissions from rules that include all (`*`)
     * resource names, and the ones that include specific
     * resource names.
     *
     * For example: add permissions from `:apps:*` to `:apps:some-app`.
     */
    if (resourceName.length > 0) {
      const commonPermissionsKey = hashPermissionKey(group, resource, '*');
      if (permissions.hasOwnProperty(commonPermissionsKey)) {
        appendKeyToOrgPermissions(
          key,
          permissions[commonPermissionsKey],
          permissions
        );
      }
    }
  }

  return permissions;
}
