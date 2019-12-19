export const appCatalogsResponse = [
  {
    metadata: {
      name: 'control-plane-catalog',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'internal',
      },
    },
    spec: {
      title: 'Control Plane Catalog',
      description:
        'This catalog holds Apps exclusively running on Giant Swarm control planes. ',
      logoURL: '/images/repo_icons/giantswarm.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/control-plane-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'control-plane-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'internal',
      },
    },
    spec: {
      title: 'Control Plane Test Catalog',
      description: 'App Catalog for Control Plane apps test releases.',
      logoURL: '',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/control-plane-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'control-plane-test-catalog',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'internal',
      },
    },
    spec: {
      title: 'Control Plane Test Catalog',
      description:
        'This catalog holds test Apps exclusively running on Giant Swarm control planes. ',
      logoURL: '/images/repo_icons/giantswarm.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/control-plane-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'default',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'internal',
      },
    },
    spec: {
      title: 'Giant Swarm Default Catalog',
      description:
        'This catalog holds Apps managed by Giant Swarm that are installed by default and not chosen by customers. ',
      logoURL: '/images/repo_icons/giantswarm.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/default-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'default-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'test',
      },
    },
    spec: {
      title: 'Giant Swarm Default Test',
      description:
        'This catalog holds test versions of the apps in Giant Swarm Default. No guarantees, no SLA! Here be dragons! Giant Swarm developers only.',
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/default-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'internal',
      },
    },
    spec: {
      title: 'Giant Swarm Catalog',
      description: 'This catalog holds Apps managed by Giant Swarm. ',
      logoURL: '/images/repo_icons/giantswarm.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/giantswarm-catalog/',
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
        URL: 'https://giantswarm.github.com/giantswarm-incubator-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm-incubator-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'test',
      },
    },
    spec: {
      title: 'Giant Swarm Incubator Test',
      description:
        'This catalog holds test versions of the apps in Giant Swarm Incubator. No guarantees, no SLA! Here be dragons! Giant Swarm developers only.',
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/giantswarm-incubator-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm-operations-platform-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'test',
      },
    },
    spec: {
      title: 'Giant Swarm Operations Platform Test',
      description:
        'This catalog holds test versions of the apps in Giant Swarm Operations Platform. No guarantees, no SLA! Here be dragons! Giant Swarm developers only.',
      logoURL: '/images/repo_icons/managed.png',
      storage: {
        type: 'helm',
        URL:
          'https://giantswarm.github.com/giantswarm-operations-platform-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm-playground-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'test',
      },
    },
    spec: {
      title: 'Giant Swarm Playground Test',
      description:
        'This catalog holds applications that are not covered by any support plan. Still, we try to make them install and run on Giant Swarm smoothly!',
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL:
          'https://giantswarm.github.com/giantswarm-playground-test-catalog/',
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
        URL: 'https://giantswarm.github.com/giantswarm-test-catalog/',
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
        URL: 'https://kubernetes-charts.storage.googleapis.com/',
      },
    },
  },
];
