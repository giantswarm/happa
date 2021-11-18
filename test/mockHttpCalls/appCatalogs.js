export const appCatalogsResponse = [
  {
    metadata: {
      name: 'giantswarm-internal',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-visibility': 'internal',
      },
    },
    spec: {
      title: 'Giant Swarm CatalogYolo',
      description: 'This catalog holds Apps managed by Giant Swarm. ',
      logoURL: '/images/repo_icons/giantswarm.png',
      storage: {
        type: 'helm',
        URL: 'https://catalogshost/giantswarm-internal-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm-incubator',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'incubator',
      },
    },
    spec: {
      title: 'Giant Swarm Incubator',
      description: `This catalog holds Apps that Giant Swarm is considering adding to the stable catalog. For these Apps there's currently no SLA. Management and support will be done on a best-effort basis with the goal of learning operative processes and best-practice configuration for a successful graduation of the App to stable and SLA supported. This also allows customers to get started with these Apps and get a feeling for how they can be used for their use cases. Any feedback through your usual channels is appreciated. `,
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL: 'https://catalogshost/giantswarm-incubator-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'stable',
      },
    },
    spec: {
      title: 'Giant Swarm Another Catalog',
      description:
        'This catalog holds stable versions of the apps in Giant Swarm.',
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL: 'https://catalogshost/giantswarm-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'test',
      },
    },
    spec: {
      title: 'Giant Swarm Test',
      description:
        'This catalog holds test versions of the apps in Giant Swarm. No guarantees, no SLA! Here be dragons! Giant Swarm developers only.',
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL: 'https://catalogshost/giantswarm-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'helm-stable',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'community',
      },
    },
    spec: {
      title: 'Helm Stable',
      description:
        'This is the Helm Stable chart repository that you can find here: https://github.com/helm/charts/tree/master/stable This App Catalog does not have any guarantees or SLA. ',
      logoURL: '/images/repo_icons/community.png',
      storage: {
        type: 'helm',
        URL: 'https://catalogshost/helmstable/',
      },
    },
  },
];
