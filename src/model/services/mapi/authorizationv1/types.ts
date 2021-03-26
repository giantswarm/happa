import * as metav1 from '../metav1';

export interface ISelfSubjectRulesReviewSpec {
  namespace: string;
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
  // ResourceNames is an optional white list of names that the rule applies to.  An empty set means that everything is allowed.  "*" means all.
  resourceNames: string[];
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
  evaluationError: string;
}

export interface ISelfSubjectRulesReview {
  apiVersion: string;
  kind: string;
  metadata?: metav1.IObjectMeta;
  spec: ISelfSubjectRulesReviewSpec;
  status?: ISelfSubjectRulesReviewStatus;
}
