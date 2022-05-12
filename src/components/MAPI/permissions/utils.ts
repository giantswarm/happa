import { getNamespaceFromOrgName } from 'MAPI/utils';
import { Providers } from 'model/constants';
import * as authorizationv1 from 'model/services/mapi/authorizationv1';
import * as rbacv1 from 'model/services/mapi/rbacv1';
import {
  isSubjectKindGroup,
  isSubjectKindUser,
} from 'model/services/mapi/rbacv1';
import { LoggedInUserTypes } from 'model/stores/main/types';
import { AccessControlRoleItemVerb } from 'UI/Display/MAPI/AccessControl/types';
import { groupBy } from 'underscore';
import { cartesian } from 'utils/helpers';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import {
  Bindings,
  INamespacePermissions,
  INamespaceResourceRules,
  IPermissionMap,
  IPermissionsForUseCase,
  IPermissionsUseCase,
  IResourceRuleMap,
  IRolesForNamespaces,
  IRulesMaps,
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

export async function fetchPermissionsForSubject(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  organizations: IOrganization[],
  user?: string,
  groups?: string[]
): Promise<IPermissionMap> {
  // These are not organization namespaces, but we have resources in them.
  const namespaces = ['default', 'giantswarm'];
  const orgNamespaces = organizations.map(
    (o) => o.namespace ?? getNamespaceFromOrgName(o.id)
  );

  // Can the subject LIST organizations?
  const listOrgsrequest: authorizationv1.ILocalSubjectAccessReviewSpec = {
    resourceAttributes: {
      namespace: 'default',
      verb: 'list',
      group: 'security.giantswarm.io',
      resource: 'organizations',
    },
    user,
    groups,
  };
  const accessReviewResponse =
    await authorizationv1.createLocalSubjectAccessReview(
      httpClientFactory(),
      auth,
      listOrgsrequest
    );

  if (accessReviewResponse?.status?.allowed) {
    // If the subject can LIST organizations, add all organizations'
    // namespaces.
    namespaces.push(...orgNamespaces);
  } else {
    // Find out which organizations the subject can GET.
    const requests = orgNamespaces.map((namespace) => {
      const getOrgRequest: authorizationv1.ILocalSubjectAccessReviewSpec = {
        resourceAttributes: {
          namespace,
          verb: 'get',
          group: 'security.giantswarm.io',
          resource: 'organizations',
        },
        user,
        groups,
      };

      return authorizationv1.createLocalSubjectAccessReview(
        httpClientFactory(),
        auth,
        getOrgRequest
      );
    });
    const responses = await Promise.allSettled(requests);

    for (let i = 0; i < orgNamespaces.length; i++) {
      const response = responses[i];
      if (response.status === 'fulfilled' && response.value.status?.allowed) {
        namespaces.push(orgNamespaces[i]);
      }
    }
  }

  // Get all Roles and ClusterRoles. Map role names to their resource rules, grouping by namespace.
  const roleList = await rbacv1.getRoleList(httpClientFactory(), auth, {
    labelSelector: {},
  });
  const roleListByNamespace = groupBy(
    roleList.items,
    (s) => s.metadata.namespace ?? ''
  );
  const rolesRulesMap = computeResourceRulesFromRoles(roleListByNamespace);

  const clusterRoles = await rbacv1.getClusterRoleList(
    httpClientFactory(),
    auth,
    {}
  );
  // ClusterRoles are not namespaced - we use '' as a placeholder namespace.
  const clusterRolesRulesMap = computeResourceRulesFromRoles({
    '': clusterRoles.items,
  })[''];

  // Get all RoleBindings and group by namespace.
  const roleBindingList = await rbacv1.getRoleBindingList(
    httpClientFactory(),
    auth,
    ''
  );
  const bindingsByNamespace = groupBy(
    roleBindingList.items,
    (s) => s.metadata.namespace ?? ''
  );

  const reviews: [
    namespace: string,
    review: authorizationv1.ISelfSubjectRulesReview
  ][] = [];

  for (const namespace of namespaces) {
    const bindings = bindingsByNamespace[namespace] ?? [];
    const review = createRulesReviewResponseFromBindings(
      bindings,
      {
        rolesRulesMap: rolesRulesMap[namespace],
        clusterRolesRulesMap,
      },
      user,
      groups
    );

    reviews.push([namespace, review] as [typeof namespace, typeof review]);
  }

  const permissions = computePermissions(reviews);

  return permissions;
}

export function fetchPermissionsForSubjectKey(
  user?: string,
  groups?: string[]
) {
  return `getUserPermissionsForSubject/${user ? user : ''}/${
    groups ? groups.join(',') : ''
  }`;
}

export async function fetchPermissionsAtClusterScope(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  useCases: IPermissionsUseCase[],
  namespacedPermissions: IPermissionMap,
  user?: string,
  groups?: string[]
): Promise<IPermissionMap> {
  const requests: authorizationv1.ISelfSubjectAccessReviewSpec[] = [
    {
      resourceAttributes: {
        verb: 'list',
        group: 'rbac.authorization.k8s.io',
        resource: 'clusterrolebindings',
      },
    },
    {
      resourceAttributes: {
        verb: 'list',
        group: 'rbac.authorization.k8s.io',
        resource: 'clusterroles',
      },
    },
  ];

  // Can the user LIST clusterrolebindings and LIST clusterroles?
  const accessReviewResponses = await Promise.allSettled(
    requests.map((req) =>
      authorizationv1.createSelfSubjectAccessReview(
        httpClientFactory(),
        auth,
        req
      )
    )
  );

  for (const response of accessReviewResponses) {
    if (response.status === 'rejected') {
      return Promise.reject(response.reason);
    }

    if (response.status === 'fulfilled' && !response.value.status?.allowed) {
      return getPermissionsWithUseCases(
        httpClientFactory,
        auth,
        useCases,
        namespacedPermissions
      );
    }
  }

  return getPermissionsWithClusterRoleBindings(
    httpClientFactory,
    auth,
    user,
    groups
  );
}

export function fetchPermissionsAtClusterScopeKey(
  user?: string,
  groups?: string[]
): string {
  return `getUserPermissionsAtClusterScope/${user ? user : ''}/${
    groups ? groups?.join(',') : ''
  }`;
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

export function isClusterScopeUseCase(useCase: IPermissionsUseCase): boolean {
  return useCase.scope.cluster === true;
}

/**
 * Get a list of resources to ignore for a given provider.
 * @param provider
 */
function getResourcesToIgnore(
  provider: PropertiesOf<typeof Providers>
): string[] {
  const providerSpecificResources = [
    {
      provider: Providers.AWS,
      resources: ['awsclusters', 'g8scontrolplanes', 'awscontrolplanes'],
    },
    {
      provider: Providers.AZURE,
      resources: ['azureclusters', 'azuremachines'],
    },
  ];

  return providerSpecificResources.reduce<string[]>((prev, curr) => {
    if (curr.provider === provider) return prev;

    return prev.concat(...curr.resources);
  }, []);
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
  provider?: PropertiesOf<typeof Providers>,
  organizations?: IOrganization[]
): PermissionsUseCaseStatuses {
  const resourcesToIgnore = provider ? getResourcesToIgnore(provider) : [];

  const statuses: PermissionsUseCaseStatuses = {};
  useCases.forEach((useCase) => {
    const useCasePermissions = getPermissionsCartesians(useCase.permissions);

    statuses[useCase.name] = {};

    const orgs =
      useCase.scope.cluster === true
        ? [{ id: '', namespace: '' }]
        : useCase.scope.namespaces?.[0] === '*'
        ? organizations
        : useCase.scope.namespaces?.map((ns) => ({ id: '', namespace: ns }));

    orgs?.forEach((org) => {
      const permissionsValues = useCasePermissions.map((p) => {
        const [verb, resource, apiGroup] = p;

        // If the resource is in the list of resources to ignore,
        // we skip it.
        if (resourcesToIgnore.includes(resource)) return true;

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

/**
 * Get permissions by fetching ClusterRoleBindings for
 * given user/group and aggregating permissions of the
 * ClusterRoles referenced.
 * @param httpClientFactory
 * @param auth
 * @param user
 * @param groups
 */
async function getPermissionsWithClusterRoleBindings(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  user?: string,
  groups?: string[]
): Promise<IPermissionMap> {
  const clusterRoleBindingList = await rbacv1.getClusterRoleBindingList(
    httpClientFactory(),
    auth
  );

  const clusterRoles = await rbacv1.getClusterRoleList(
    httpClientFactory(),
    auth,
    {}
  );
  // ClusterRoles are not namespaced - we use '' as a placeholder namespace.
  const clusterRolesRulesMap = computeResourceRulesFromRoles({
    '': clusterRoles.items,
  })[''];

  const review = createRulesReviewResponseFromBindings(
    clusterRoleBindingList.items,
    {
      rolesRulesMap: {},
      clusterRolesRulesMap,
    },
    user,
    groups
  );

  return computePermissions([['', review]]);
}

/**
 * Get permissions given a list of use cases by performing
 * SelfSubjectAccessReviews for each use case.
 * @param httpClientFactory
 * @param auth
 * @param useCases
 */
async function getPermissionsWithUseCases(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  useCases: IPermissionsUseCase[],
  namespacedPermissions: IPermissionMap
): Promise<IPermissionMap> {
  // Get unique use case permissions
  const allPermissions = useCases.flatMap((useCase) =>
    getPermissionsCartesians(useCase.permissions)
  );

  const uniquePermissions: [string, string, string][] = Array.from(
    new Set(allPermissions.map((p) => JSON.stringify(p)))
  ).map((p) => JSON.parse(p));

  // To prevent calling the API for each use case permission, we
  // check first if the user has permissions in the 'default' namespace.
  // If not, we know they won't have permissions at the cluster level.
  const filteredUniquePermisisons = uniquePermissions.filter((p) => {
    const [verb, resource, apiGroup] = p;

    return hasPermission(
      namespacedPermissions,
      'default',
      verb,
      apiGroup,
      resource
    );
  });

  // Fetch access for each unique permission
  const requests = filteredUniquePermisisons.map((p) => {
    const [verb, resource, apiGroup] = p;

    const request: authorizationv1.ISelfSubjectAccessReviewSpec = {
      resourceAttributes: {
        verb,
        group: apiGroup,
        resource,
      },
    };

    return authorizationv1.createSelfSubjectAccessReview(
      httpClientFactory(),
      auth,
      request
    );
  });

  const responses = await Promise.allSettled(requests);

  const resourceRules: authorizationv1.IResourceRule[] = [];

  for (let i = 0; i < filteredUniquePermisisons.length; i++) {
    const response = responses[i];
    if (
      response.status === 'fulfilled' &&
      response.value.status?.allowed === true
    ) {
      const permission = filteredUniquePermisisons[i];
      resourceRules.push({
        verbs: [permission[0]],
        resources: [permission[1]],
        apiGroups: [permission[2]],
      });
    }
  }

  const review: authorizationv1.ISelfSubjectRulesReview = {
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'SelfSubjectRulesReview',
    spec: {},
    status: {
      incomplete: false,
      nonResourceRules: [],
      resourceRules: resourceRules,
    },
  };

  return computePermissions([['', review]]);
}

/**
 * Given a list of Roles/ClusterRoles grouped by namespace,
 * create a map of role names to resource rules in each namespace.
 * @param roles
 */
export function computeResourceRulesFromRoles(
  rolesForNamespaces: IRolesForNamespaces
): IResourceRuleMap {
  const resourceRuleMap: IResourceRuleMap = {};

  for (const [namespace, roles] of Object.entries(rolesForNamespaces)) {
    const rules: INamespaceResourceRules = {};

    for (const role of roles) {
      if (!role.rules) continue;

      const resourceRules = role.rules.reduce<authorizationv1.IResourceRule[]>(
        (prev, rule) => {
          if (
            typeof rule.apiGroups === 'undefined' ||
            typeof rule.resources === 'undefined' ||
            typeof rule.verbs === 'undefined'
          ) {
            return prev;
          }
          // Map rbacv1 PolicyRule to authorizationv1 ResourceRule.
          const resourceRule: authorizationv1.IResourceRule = {
            apiGroups: rule.apiGroups,
            resources: rule.resources,
            verbs: rule.verbs,
          };

          return prev.concat(resourceRule);
        },
        []
      );

      rules[role.metadata.name] = resourceRules;
    }

    resourceRuleMap[namespace] = rules;
  }

  return resourceRuleMap;
}

/**
 * Create a review response object from Roles/ClusterRoles bound
 * to a given user/groups by aggregating resource rules from
 * each Role/ClusterRole.
 *
 * @param bindings
 * @param rulesMaps
 * @param user
 * @param groups
 */
export function createRulesReviewResponseFromBindings(
  bindings: Bindings,
  rulesMaps: IRulesMaps,
  user?: string,
  groups?: string[]
): authorizationv1.ISelfSubjectRulesReview {
  const resourceRules: authorizationv1.IResourceRule[] = [];

  // Get all bindings bound to the user/groups.
  for (const binding of bindings) {
    if (
      binding.subjects?.find(
        (subject) =>
          (isSubjectKindUser(subject) && subject.name === user) ||
          (isSubjectKindGroup(subject) && groups?.includes(subject.name))
      )
    ) {
      // Determine role rules map to use based on the Kind of
      // the role referenced in the binding.
      const rulesMap =
        binding.roleRef.kind === rbacv1.ClusterRole
          ? rulesMaps.clusterRolesRulesMap
          : rulesMaps.rolesRulesMap;

      const rules = rulesMap[binding.roleRef.name];
      if (rules) resourceRules.push(...rules);
    }
  }

  const uniqueResourceRules: authorizationv1.IResourceRule[] = Array.from(
    new Set(resourceRules.map((p) => JSON.stringify(p)))
  ).map((p) => JSON.parse(p));

  return {
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'SelfSubjectRulesReview',
    spec: {},
    status: {
      incomplete: false,
      nonResourceRules: [],
      resourceRules: uniqueResourceRules,
    },
  };
}

export function getPermissionsCartesians(
  permissions: IPermissionsForUseCase[]
): [PermissionVerb, string, string][] {
  return permissions.flatMap((permission) =>
    cartesian(permission.verbs, permission.resources, permission.apiGroups)
  );
}
