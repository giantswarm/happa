import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';

export const defaultCatalogAppCatalogEntry1: applicationv1alpha1.IAppCatalogEntry =
  {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: applicationv1alpha1.AppCatalogEntry,
    metadata: {
      annotations: {
        'application.giantswarm.io/metadata':
          'https://catalogs.io/default-catalog/coredns-app-1.2.0.tgz-meta/main.yaml',
        'application.giantswarm.io/readme':
          'https://catalogs.io/default-catalog/coredns-app-1.2.0.tgz-meta/README.md',
        'application.giantswarm.io/values-schema':
          'https://catalogs.io/default-catalog/coredns-app-1.2.0.tgz-meta/values.schema.json',
      },
      creationTimestamp: '2021-04-17T13:07:38Z',
      generation: 2,
      labels: {
        'app.kubernetes.io/name': 'coredns-app',
        'app.kubernetes.io/version': '1.2.0',
        'application.giantswarm.io/catalog': 'default',
        'application.giantswarm.io/catalog-type': 'stable',
        'giantswarm.io/managed-by': 'app-operator-unique',
        latest: 'false',
      },
      name: 'default-coredns-app-1.2.0',
      namespace: 'default',
      resourceVersion: '415976118',
      selfLink:
        '/apis/application.giantswarm.io/v1alpha1/namespaces/default/appcatalogentries/default-coredns-app-1.2.0',
      uid: 'a24ffaa1-216d-4807-90a5-2b66596795df',
    },
    spec: {
      appName: 'coredns-app',
      appVersion: '1.6.5',
      catalog: {
        name: 'default',
        namespace: 'default',
      },
      chart: {
        apiVersion: 'v1',
        home: 'https://github.com/default/coredns-app',
        icon: 'https://s.giantswarm.io/app-icons/1/png/coredns-light.png',
        description: 'A cool app for friends and family',
        keywords: ['cool app', 'really awesome'],
      },
      dateCreated: '2021-04-17T13:05:28Z',
      dateUpdated: '2021-04-17T13:05:28Z',
      version: '1.2.0',
    },
  };

export const defaultCatalogAppCatalogEntry2: applicationv1alpha1.IAppCatalogEntry =
  {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: applicationv1alpha1.AppCatalogEntry,
    metadata: {
      annotations: {
        'application.giantswarm.io/metadata':
          'https://catalogs.io/default-catalog/coredns-app-1.2.1.tgz-meta/main.yaml',
        'application.giantswarm.io/readme':
          'https://catalogs.io/default-catalog/coredns-app-1.2.1.tgz-meta/README.md',
        'application.giantswarm.io/values-schema':
          'https://catalogs.io/default-catalog/coredns-app-1.2.1.tgz-meta/values.schema.json',
      },
      creationTimestamp: '2021-04-18T13:07:38Z',
      generation: 2,
      labels: {
        'app.kubernetes.io/name': 'coredns-app',
        'app.kubernetes.io/version': '1.2.1',
        'application.giantswarm.io/catalog': 'default',
        'application.giantswarm.io/catalog-type': 'stable',
        'giantswarm.io/managed-by': 'app-operator-unique',
        latest: 'false',
      },
      name: 'default-coredns-app-1.2.1',
      namespace: 'default',
      resourceVersion: '415976118',
      selfLink:
        '/apis/application.giantswarm.io/v1alpha1/namespaces/default/appcatalogentries/default-coredns-app-1.2.1',
      uid: 'a24ffaa1-216d-4807-90a5-2b66596795df',
    },
    spec: {
      appName: 'coredns-app',
      appVersion: '1.6.5',
      catalog: {
        name: 'default',
        namespace: 'default',
      },
      chart: {
        apiVersion: 'v1',
        home: 'https://github.com/default/coredns-app',
        icon: 'https://s.giantswarm.io/app-icons/1/png/coredns-light.png',
      },
      dateCreated: '2021-04-18T13:05:28Z',
      dateUpdated: '2021-04-18T13:05:28Z',
      version: '1.2.1',
    },
  };

export const defaultCatalogAppCatalogEntry3: applicationv1alpha1.IAppCatalogEntry =
  {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: applicationv1alpha1.AppCatalogEntry,
    metadata: {
      annotations: {
        'application.giantswarm.io/metadata':
          'https://catalogs.io/default-catalog/coredns-app-1.3.0.tgz-meta/main.yaml',
        'application.giantswarm.io/readme':
          'https://catalogs.io/default-catalog/coredns-app-1.3.0.tgz-meta/README.md',
        'application.giantswarm.io/values-schema':
          'https://catalogs.io/default-catalog/coredns-app-1.3.0.tgz-meta/values.schema.json',
      },
      creationTimestamp: '2021-04-19T13:07:38Z',
      generation: 2,
      labels: {
        'app.kubernetes.io/name': 'coredns-app',
        'app.kubernetes.io/version': '1.3.0',
        'application.giantswarm.io/catalog': 'default',
        'application.giantswarm.io/catalog-type': 'stable',
        'giantswarm.io/managed-by': 'app-operator-unique',
        latest: 'false',
      },
      name: 'default-coredns-app-1.3.0',
      namespace: 'default',
      resourceVersion: '415976118',
      selfLink:
        '/apis/application.giantswarm.io/v1alpha1/namespaces/default/appcatalogentries/default-coredns-app-1.3.0',
      uid: 'a24ffaa1-216d-4807-90a5-2b66596795df',
    },
    spec: {
      appName: 'coredns-app',
      appVersion: '1.7.0',
      catalog: {
        name: 'default',
        namespace: 'default',
      },
      chart: {
        apiVersion: 'v1',
        home: 'https://github.com/default/coredns-app',
        icon: 'https://s.giantswarm.io/app-icons/1/png/coredns-light.png',
      },
      dateCreated: '2021-04-19T13:05:28Z',
      dateUpdated: '2021-04-19T13:05:28Z',
      version: '1.3.0',
    },
  };

export const defaultCatalogAppCatalogEntryList = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: applicationv1alpha1.AppCatalogEntryList,
  metadata: {
    continue: '',
    resourceVersion: '440789394',
    selfLink: '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/',
  },
  items: [
    defaultCatalogAppCatalogEntry1,
    defaultCatalogAppCatalogEntry2,
    defaultCatalogAppCatalogEntry3,
  ],
};

export const giantswarmCatalogAppCatalogEntry1: applicationv1alpha1.IAppCatalogEntry =
  {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: applicationv1alpha1.AppCatalogEntry,
    metadata: {
      annotations: {
        'application.giantswarm.io/metadata':
          'https://catalogs.io/giantswarm-catalog/some-app-1.2.0.tgz-meta/main.yaml',
        'application.giantswarm.io/readme':
          'https://catalogs.io/giantswarm-catalog/some-app-1.2.0.tgz-meta/README.md',
        'application.giantswarm.io/values-schema':
          'https://catalogs.io/giantswarm-catalog/some-app-1.2.0.tgz-meta/values.schema.json',
      },
      creationTimestamp: '2021-04-17T13:07:38Z',
      generation: 2,
      labels: {
        'app.kubernetes.io/name': 'some-app',
        'app.kubernetes.io/version': '1.2.0',
        'application.giantswarm.io/catalog': 'giantswarm',
        'application.giantswarm.io/catalog-type': 'stable',
        'giantswarm.io/managed-by': 'app-operator-unique',
        latest: 'false',
      },
      name: 'giantswarm-some-app-1.2.0',
      namespace: 'default',
      resourceVersion: '415976118',
      selfLink:
        '/apis/application.giantswarm.io/v1alpha1/namespaces/giantswarm/appcatalogentries/giantswarm-some-app-1.2.0',
      uid: 'a24ffaa1-216d-4807-90a5-2b66596795df',
    },
    spec: {
      appName: 'some-app',
      appVersion: '1.6.5',
      catalog: {
        name: 'giantswarm',
        namespace: 'default',
      },
      chart: {
        apiVersion: 'v1',
        home: 'https://github.com/giantswarm/some-app',
        icon: 'https://s.giantswarm.io/app-icons/1/png/some-app-light.png',
        description: 'A cool app for friends and family',
        keywords: ['cool app', 'really awesome'],
      },
      dateCreated: '2021-04-17T13:05:28Z',
      dateUpdated: '2021-04-17T13:05:28Z',
      version: '1.2.0',
    },
  };

export const giantswarmCatalogAppCatalogEntry2: applicationv1alpha1.IAppCatalogEntry =
  {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: applicationv1alpha1.AppCatalogEntry,
    metadata: {
      annotations: {
        'application.giantswarm.io/metadata':
          'https://catalogs.io/giantswarm-catalog/some-app-1.2.1.tgz-meta/main.yaml',
        'application.giantswarm.io/readme':
          'https://catalogs.io/giantswarm-catalog/some-app-1.2.1.tgz-meta/README.md',
        'application.giantswarm.io/values-schema':
          'https://catalogs.io/giantswarm-catalog/some-app-1.2.1.tgz-meta/values.schema.json',
      },
      creationTimestamp: '2021-04-18T13:07:38Z',
      generation: 2,
      labels: {
        'app.kubernetes.io/name': 'some-app',
        'app.kubernetes.io/version': '1.2.1',
        'application.giantswarm.io/catalog': 'giantswarm',
        'application.giantswarm.io/catalog-type': 'stable',
        'giantswarm.io/managed-by': 'app-operator-unique',
        latest: 'false',
      },
      name: 'giantswarm-some-app-1.2.1',
      namespace: 'default',
      resourceVersion: '415976118',
      selfLink:
        '/apis/application.giantswarm.io/v1alpha1/namespaces/giantswarm/appcatalogentries/giantswarm-some-app-1.2.1',
      uid: 'a24ffaa1-216d-4807-90a5-2b66596795df',
    },
    spec: {
      appName: 'some-app',
      appVersion: '1.6.5',
      catalog: {
        name: 'giantswarm',
        namespace: 'default',
      },
      chart: {
        apiVersion: 'v1',
        home: 'https://github.com/giantswarm/some-app',
        icon: 'https://s.giantswarm.io/app-icons/1/png/some-app-light.png',
      },
      dateCreated: '2021-04-18T13:05:28Z',
      dateUpdated: '2021-04-18T13:05:28Z',
      version: '1.2.1',
    },
  };

export const giantswarmCatalogAppCatalogEntry3: applicationv1alpha1.IAppCatalogEntry =
  {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: applicationv1alpha1.AppCatalogEntry,
    metadata: {
      annotations: {
        'application.giantswarm.io/metadata':
          'https://catalogs.io/giantswarm-catalog/some-app-1.3.0.tgz-meta/main.yaml',
        'application.giantswarm.io/readme':
          'https://catalogs.io/giantswarm-catalog/some-app-1.3.0.tgz-meta/README.md',
        'application.giantswarm.io/values-schema':
          'https://catalogs.io/giantswarm-catalog/some-app-1.3.0.tgz-meta/values.schema.json',
      },
      creationTimestamp: '2021-04-19T13:07:38Z',
      generation: 2,
      labels: {
        'app.kubernetes.io/name': 'some-app',
        'app.kubernetes.io/version': '1.3.0',
        'application.giantswarm.io/catalog': 'giantswarm',
        'application.giantswarm.io/catalog-type': 'stable',
        'giantswarm.io/managed-by': 'app-operator-unique',
        latest: 'false',
      },
      name: 'giantswarm-some-app-1.3.0',
      namespace: 'default',
      resourceVersion: '415976118',
      selfLink:
        '/apis/application.giantswarm.io/v1alpha1/namespaces/giantswarm/appcatalogentries/giantswarm-some-app-1.3.0',
      uid: 'a24ffaa1-216d-4807-90a5-2b66596795df',
    },
    spec: {
      appName: 'some-app',
      appVersion: '1.7.0',
      catalog: {
        name: 'giantswarm',
        namespace: 'default',
      },
      chart: {
        apiVersion: 'v1',
        home: 'https://github.com/giantswarm/some-app',
        icon: 'https://s.giantswarm.io/app-icons/1/png/some-app-light.png',
      },
      dateCreated: '2021-04-19T13:05:28Z',
      dateUpdated: '2021-04-19T13:05:28Z',
      version: '1.3.0',
    },
  };

export const giantswarmCatalogAppCatalogEntryList = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: applicationv1alpha1.AppCatalogEntryList,
  metadata: {
    continue: '',
    resourceVersion: '440789394',
    selfLink: '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/',
  },
  items: [
    giantswarmCatalogAppCatalogEntry1,
    giantswarmCatalogAppCatalogEntry2,
    giantswarmCatalogAppCatalogEntry3,
  ],
};

export const latestAppCatalogEntryList = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: applicationv1alpha1.AppCatalogEntryList,
  metadata: {
    continue: '',
    resourceVersion: '440789394',
    selfLink:
      '/apis/application.giantswarm.io/v1alpha1/appcatalogentries/?labelSelector=latest%3D$true',
  },
  items: [defaultCatalogAppCatalogEntry3, giantswarmCatalogAppCatalogEntry3],
};

export const defaultCatalogAppCatalogEntryAppBundle: applicationv1alpha1.IAppCatalogEntry =
  {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'AppCatalogEntry',
    metadata: {
      annotations: {
        'application.giantswarm.io/app-type': 'bundle',
        'application.giantswarm.io/in-cluster-app': 'true',
        'application.giantswarm.io/metadata':
          'https://giantswarm.github.io/giantswarm-catalog/security-pack-0.9.0.tgz-meta/main.yaml',
        'application.giantswarm.io/readme':
          'https://giantswarm.github.io/giantswarm-catalog/security-pack-0.9.0.tgz-meta/README.md',
        'application.giantswarm.io/team': 'shield',
        'application.giantswarm.io/values-schema':
          'https://giantswarm.github.io/giantswarm-catalog/security-pack-0.9.0.tgz-meta/values.schema.json',
      },
      creationTimestamp: '2022-11-10T14:01:12Z',
      generation: 1,
      labels: {
        'app.kubernetes.io/name': 'security-pack',
        'app.kubernetes.io/version': '0.9.0',
        'application.giantswarm.io/catalog': 'giantswarm',
        'application.giantswarm.io/catalog-type': 'stable',
        'giantswarm.io/managed-by': 'app-operator-unique',
        latest: 'true',
      },
      name: 'giantswarm-security-pack-0.9.0',
      namespace: 'default',
      ownerReferences: [
        {
          apiVersion: 'application.giantswarm.io/v1alpha1',
          blockOwnerDeletion: true,
          kind: 'Catalog',
          name: 'giantswarm',
          uid: '1057335e-0036-4504-8934-b9410db9ef57',
        },
      ],
      resourceVersion: '920462102',
      uid: '2bd73930-ea9a-4cce-8508-a0898cb70fd9',
    },
    spec: {
      appName: 'security-pack',
      appVersion: '',
      catalog: {
        name: 'giantswarm',
        namespace: 'default',
      },
      chart: {
        apiVersion: 'v2',
        description: `A Helm chart for Giant Swarm's collection of open-source security tools.`,
        home: 'https://github.com/giantswarm/security-pack',
      },
      dateCreated: '2022-11-10T13:59:08Z',
      dateUpdated: '2022-11-10T13:59:08Z',
      version: '0.9.0',
    },
  };
