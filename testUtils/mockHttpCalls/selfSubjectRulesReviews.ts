export const someOrgsSubjectRulesReview = {
  kind: 'SelfSubjectRulesReview',
  apiVersion: 'authorization.k8s.io/v1',
  metadata: {
    creationTimestamp: null,
  },
  spec: {},
  status: {
    resourceRules: [
      {
        verbs: ['get'],
        apiGroups: ['security.giantswarm.io'],
        resources: ['organizations'],
        resourceNames: ['org2'],
      },
      {
        verbs: ['get'],
        apiGroups: ['security.giantswarm.io'],
        resources: ['organizations'],
        resourceNames: ['org1'],
      },
      {
        verbs: ['get'],
        apiGroups: ['security.giantswarm.io'],
        resources: ['organizations'],
        resourceNames: ['org2'],
      },
      {
        verbs: ['use'],
        apiGroups: ['extensions'],
        resources: ['podsecuritypolicies'],
        resourceNames: ['restricted'],
      },
      {
        verbs: ['create'],
        apiGroups: ['authorization.k8s.io'],
        resources: ['selfsubjectaccessreviews', 'selfsubjectrulesreviews'],
      },
    ],
    nonResourceRules: [
      {
        verbs: ['get'],
        nonResourceURLs: ['/healthz', '/version', '/version/'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/livez'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/readyz'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: [
          '/api',
          '/api/*',
          '/apis',
          '/apis/*',
          '/healthz',
          '/swagger-2.0.0.pb-v1',
          '/swagger.json',
          '/swaggerapi',
          '/swaggerapi/*',
          '/version',
        ],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/openapi'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/openapi/*'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/version/'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/livez'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/readyz'],
      },
    ],
    incomplete: false,
  },
};

export const noOrgsSubjectRulesReview = {
  kind: 'SelfSubjectRulesReview',
  apiVersion: 'authorization.k8s.io/v1',
  metadata: {
    creationTimestamp: null,
  },
  spec: {},
  status: {
    resourceRules: [
      {
        verbs: ['use'],
        apiGroups: ['extensions'],
        resources: ['podsecuritypolicies'],
        resourceNames: ['restricted'],
      },
      {
        verbs: ['create'],
        apiGroups: ['authorization.k8s.io'],
        resources: ['selfsubjectaccessreviews', 'selfsubjectrulesreviews'],
      },
    ],
    nonResourceRules: [
      {
        verbs: ['get'],
        nonResourceURLs: ['/healthz', '/version', '/version/'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/livez'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/readyz'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: [
          '/api',
          '/api/*',
          '/apis',
          '/apis/*',
          '/healthz',
          '/swagger-2.0.0.pb-v1',
          '/swagger.json',
          '/swaggerapi',
          '/swaggerapi/*',
          '/version',
        ],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/openapi'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/openapi/*'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/version/'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/livez'],
      },
      {
        verbs: ['get'],
        nonResourceURLs: ['/readyz'],
      },
    ],
    incomplete: false,
  },
};
