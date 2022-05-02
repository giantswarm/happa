import { getNamespaceFromOrgName } from 'MAPI/utils';
import * as authorizationv1 from 'model/services/mapi/authorizationv1';
import { LoggedInUserTypes } from 'model/stores/main/types';
import { AccessControlRoleItemVerb } from 'UI/Display/MAPI/AccessControl/types';
import { cartesian } from 'utils/helpers';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import {
  INamespacePermissions,
  IPermissionMap,
  IPermissionsUseCase,
  PermissionsUseCaseStatuses,
  PermissionVerb,
} from './types';

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
  verb: PermissionVerb,
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

export async function fetchPermissions(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  organizations: IOrganization[]
) {
  const namespaces = organizations.map(
    (o) => o.namespace ?? getNamespaceFromOrgName(o.id)
  );
  // These are not organization namespaces, but we have resources in them.
  namespaces.push('default', 'giantswarm');

  const requests = namespaces.map(async (namespace) => {
    const client = httpClientFactory();

    const rulesReview: authorizationv1.ISelfSubjectRulesReview = {
      apiVersion: 'authorization.k8s.io/v1',
      kind: 'SelfSubjectRulesReview',
      spec: {
        namespace,
      },
    } as authorizationv1.ISelfSubjectRulesReview;

    const review = await authorizationv1.createSelfSubjectRulesReview(
      client,
      auth,
      rulesReview
    );

    return [namespace, review] as [typeof namespace, typeof review];
  });

  const reviewRequests = await Promise.allSettled(requests);
  const reviews: [
    namespace: string,
    review: authorizationv1.ISelfSubjectRulesReview
  ][] = [];
  for (const reviewRequest of reviewRequests) {
    if (reviewRequest.status === 'fulfilled') {
      reviews.push(reviewRequest.value);
    }
  }

  const permissions = computePermissions(reviews);

  return permissions;
}

export function hasAppAccesInNamespace(
  permissions: IPermissionMap,
  namespace: string
) {
  switch (true) {
    case hasPermission(
      permissions,
      namespace,
      'list',
      'cluster.x-k8s.io',
      'clusters'
    ):
    case hasPermission(
      permissions,
      namespace,
      'get',
      'cluster.x-k8s.io',
      'clusters'
    ):
      return true;
    default:
      return false;
  }
}

export function hasAppAccess(
  user: ILoggedInUser,
  permissions?: IPermissionMap
): boolean {
  if (user.type !== LoggedInUserTypes.MAPI) return true;
  if (!permissions) return false;

  return Object.keys(permissions).some((ns) =>
    hasAppAccesInNamespace(permissions, ns)
  );
}

/**
 * Fetch access to a resource within a given namespace.
 * Returns an object mapping each given verb to a boolean indicating access.
 * @param httpClientFactory
 * @param auth
 * @param namespace
 * @param group
 * @param resource
 */
export async function fetchAccessForResource(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  namespace: string,
  verbs: readonly AccessControlRoleItemVerb[],
  group: string,
  resource: string
): Promise<Record<AccessControlRoleItemVerb, boolean>> {
  const requests = verbs.map(async (verb) => {
    try {
      const request: authorizationv1.ISelfSubjectAccessReviewSpec = {
        resourceAttributes: {
          namespace,
          verb,
          group,
          resource,
        },
      };

      const accessReviewResponse =
        await authorizationv1.createSelfSubjectAccessReview(
          httpClientFactory(),
          auth,
          request
        );

      return { verb, access: accessReviewResponse.status?.allowed ?? false };
    } catch {
      return { verb, access: false };
    }
  });

  const reviewRequests = await Promise.all(requests);

  const accessMap: Record<AccessControlRoleItemVerb, boolean> = {};

  for (const reviewRequest of reviewRequests) {
    accessMap[reviewRequest.verb] = reviewRequest.access;
  }

  return accessMap;
}

export function fetchAccessForResourceKey(
  namespace: string,
  verbs: readonly AccessControlRoleItemVerb[],
  group: string,
  resource: string
) {
  return `getAccessForResource/${namespace}/${verbs.join(
    ','
  )}/${group}/${resource}`;
}

export function getPermissionsUseCases(): IPermissionsUseCase[] | null {
  if (!window.config.permissionsUseCasesJSON) {
    return null;
  }

  const useCases: IPermissionsUseCase[] = JSON.parse(
    window.config.permissionsUseCasesJSON
  );

  return useCases;
}

export function isGlobalUseCase(useCase: IPermissionsUseCase): boolean {
  return (
    (typeof useCase.scope.namespaces !== undefined &&
      useCase.scope.namespaces?.[0] === 'default') ||
    useCase.scope.cluster === true
  );
}

/**
 * Get permissions statuses from a permissions map for given use cases
 * in the given organizations.
 * @param permissions
 * @param useCases
 * @param organizations
 */
export function getStatusesForUseCases(
  permissions: IPermissionMap,
  useCases: IPermissionsUseCase[],
  organizations?: IOrganization[]
): PermissionsUseCaseStatuses {
  const statuses: Record<string, Record<string, boolean>> = {};
  useCases.forEach((useCase) => {
    const useCasePermissions = useCase.permissions.flatMap((permission) =>
      cartesian(permission.verbs, permission.resources, permission.apiGroups)
    );

    statuses[useCase.name] = {};
    organizations?.forEach((org) => {
      const permissionsValues = useCasePermissions.map((p) => {
        const [verb, resource, apiGroup] = p as string[];

        return hasPermission(
          permissions,
          org.namespace ?? '',
          verb,
          apiGroup,
          resource
        );
      });

      statuses[useCase.name][org.id] = permissionsValues.every(
        (v) => v === true
      );
    });
  });

  return statuses;
}
