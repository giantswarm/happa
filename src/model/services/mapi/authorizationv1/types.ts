import * as metav1 from '../metav1';

export interface ISelfSubjectRulesReviewSpec {
  namespace?: string;
}

// https://github.com/kubernetes/kubernetes/blob/2eb6911e832152abb1cbfd31ae15ceceb4e844a0/pkg/apis/authorization/types.go#L179

// ResourceRule is the list of actions the subject is allowed to perform on resources. The list ordering isn't significant,
// may contain duplicates, and possibly be incomplete.
export interface IResourceRule {
  // Verb is a list of kubernetes resource API verbs, like: get, list, watch, create, update, delete, proxy.  "*" means all.
  verbs: string[];
  // APIGroups is the name of the APIGroup that contains the resources.  If multiple API groups are specified, any action requested against one of
  // the enumerated resources in any API group will be allowed.  "*" means all.
  apiGroups: string[];
  // Resources is a list of resources this rule applies to.  "*" means all in the specified apiGroups.
  //  "*/foo" represents the subresource 'foo' for all resources in the specified apiGroups.
  resources: string[];
  // ResourceNames is an optional list of allowed of names that the rule applies to.  An empty set means that everything is allowed.  "*" means all.
  resourceNames?: string[];
}

// NonResourceRule holds information that describes a rule for the non-resource
interface INonResourceRule {
  // Verb is a list of kubernetes non-resource API verbs, like: get, post, put, delete, patch, head, options.  "*" means all.
  Verbs: string[];

  // NonResourceURLs is a set of partial urls that a user should have access to.  *s are allowed, but only as the full,
  // final step in the path.  "*" means all.
  NonResourceURLs: string[];
}

export interface ISelfSubjectRulesReviewStatus {
  // ResourceRules is the list of actions the subject is allowed to perform on resources.
  // The list ordering isn't significant, may contain duplicates, and possibly be incomplete.
  resourceRules: IResourceRule[];
  // NonResourceRules is the list of actions the subject is allowed to perform on non-resources.
  // The list ordering isn't significant, may contain duplicates, and possibly be incomplete.
  nonResourceRules: INonResourceRule[];
  // Incomplete is true when the rules returned by this call are incomplete. This is most commonly
  // encountered when an authorizer, such as an external authorizer, doesn't support rules evaluation.
  incomplete: boolean;
  // EvaluationError can appear in combination with Rules. It indicates an error occurred during
  // rule evaluation, such as an authorizer that doesn't support rule evaluation, and that
  // ResourceRules and/or NonResourceRules may be incomplete.
  evaluationError?: string;
}

export interface ISelfSubjectRulesReview {
  apiVersion: 'authorization.k8s.io/v1';
  kind: 'SelfSubjectRulesReview';
  metadata?: metav1.IObjectMeta;
  spec: ISelfSubjectRulesReviewSpec;
  status?: ISelfSubjectRulesReviewStatus;
}

export interface ISelfSubjectAccessReview {
  apiVersion: string;
  kind: string;
  metadata?: metav1.IObjectMeta;
  spec: ISelfSubjectAccessReviewSpec;
  status?: ISelfSubjectAccessReviewStatus;
}

// SelfSubjectAccessReviewSpec is a description of the access request.  Exactly one of ResourceAttributes
// and NonResourceAttributes must be set
export interface ISelfSubjectAccessReviewSpec {
  // ResourceAttributes describes information for a resource access request
  resourceAttributes?: IResourceAttributes;
  // NonResourceAttributes describes information for a non-resource access request
  nonResourceAttributes?: INonResourceAttributes;
}

// ResourceAttributes includes the authorization attributes available for resource requests to the Authorizer interface
export interface IResourceAttributes {
  // Namespace is the namespace of the action being requested.  Currently, there is no distinction between no namespace and all namespaces
  // "" (empty) is defaulted for LocalSubjectAccessReviews
  // "" (empty) is empty for cluster-scoped resources
  // "" (empty) means "all" for namespace scoped resources from a SubjectAccessReview or SelfSubjectAccessReview
  namespace?: string;
  // Verb is a kubernetes resource API verb, like: get, list, watch, create, update, delete, proxy.  "*" means all.
  verb?: string;
  // Group is the API Group of the Resource.  "*" means all.
  group?: string;
  // Version is the API Version of the Resource.  "*" means all.
  version?: string;
  // Resource is one of the existing resource types.  "*" means all.
  resource?: string;
  // Subresource is one of the existing resource types.  "" means none.
  subresource?: string;
  // Name is the name of the resource being requested for a "get" or deleted for a "delete". "" (empty) means all.
  name?: string;
}

// NonResourceAttributes includes the authorization attributes available for non-resource requests to the Authorizer interface
export interface INonResourceAttributes {
  // Path is the URL path of the request
  path: string;
  // Verb is the standard HTTP verb
  verb: string;
}

// SubjectAccessReviewStatus represents the current state of a SubjectAccessReview.
export interface ISelfSubjectAccessReviewStatus {
  // Allowed is required. True if the action would be allowed, false otherwise.
  allowed: boolean;
  // Denied is optional. True if the action would be denied, otherwise
  // false. If both allowed is false and denied is false, then the
  // authorizer has no opinion on whether to authorize the action. Denied
  // may not be true if Allowed is true.
  denied: boolean;
  // Reason is optional.  It indicates why a request was allowed or denied.
  reason: string;
  // EvaluationError is an indication that some error occurred during the authorization check.
  // It is entirely possible to get an error and be able to continue determine authorization status in spite of it.
  // For instance, RBAC can be missing a role, but enough roles are still present and bound to reason about the request.
  evaluationError: string;
}
