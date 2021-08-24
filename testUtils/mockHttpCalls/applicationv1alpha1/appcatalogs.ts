import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';

export const defaultAppCatalog: applicationv1alpha1.IAppCatalog = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: 'AppCatalog',
  metadata: {
    annotations: {
      'helm.sh/resource-policy': 'keep',
      'meta.helm.sh/release-name': 'appcatalog-default',
      'meta.helm.sh/release-namespace': 'giantswarm',
    },
    creationTimestamp: '2020-07-17T07:49:28Z',
    finalizers: [
      'operatorkit.giantswarm.io/app-operator',
      'operatorkit.giantswarm.io/appCatalog',
      'operatorkit.giantswarm.io/app-operator-appcatalog',
    ],
    generation: 1,
    labels: {
      'app-operator.giantswarm.io/version': '1.0.0',
      'app.kubernetes.io/managed-by': 'Helm',
      'application.giantswarm.io/catalog-type': 'stable',
      'application.giantswarm.io/catalog-visibility': 'internal',
    },
    name: 'default',
    resourceVersion: '414355456',
    selfLink: '/apis/application.giantswarm.io/v1alpha1/appcatalogs/default',
    uid: '7cc5b7db-130b-470d-b7b6-90ed3b548b8e',
  },
  spec: {
    config: {
      configMap: {
        name: 'default-catalog',
        namespace: 'giantswarm',
      },
    },
    description:
      'This catalog holds Apps managed by Giant Swarm that are installed by default and not chosen by customers. ',
    logoURL: '/images/repo_icons/giantswarm.png',
    storage: {
      URL: 'https://catalogs.com/default-catalog/',
      type: 'helm',
    },
    title: 'Giant Swarm Default Catalog',
  },
};

export const giantswarmAppCatalog: applicationv1alpha1.IAppCatalog = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: 'AppCatalog',
  metadata: {
    annotations: {
      'helm.sh/resource-policy': 'keep',
      'meta.helm.sh/release-name': 'appcatalog-giantswarm',
      'meta.helm.sh/release-namespace': 'giantswarm',
    },
    creationTimestamp: '2020-07-17T07:48:06Z',
    finalizers: [
      'operatorkit.giantswarm.io/app-operator',
      'operatorkit.giantswarm.io/appCatalog',
      'operatorkit.giantswarm.io/app-operator-appcatalog',
    ],
    generation: 2,
    labels: {
      'app-operator.giantswarm.io/version': '1.0.0',
      'app.kubernetes.io/managed-by': 'Helm',
      'application.giantswarm.io/catalog-type': 'stable',
      'application.giantswarm.io/catalog-visibility': 'public',
    },
    name: 'giantswarm',
    resourceVersion: '414355851',
    selfLink: '/apis/application.giantswarm.io/v1alpha1/appcatalogs/giantswarm',
    uid: '125c4cbc-ff4e-4a59-a2c8-b42911353fbe',
  },
  spec: {
    config: {
      configMap: {
        name: 'giantswarm-catalog',
        namespace: 'giantswarm',
      },
    },
    description: 'This catalog holds Apps managed by Giant Swarm. ',
    logoURL: '/images/repo_icons/managed.png',
    storage: {
      URL: 'https://catalogs.com/giantswarm-catalog/',
      type: 'helm',
    },
    title: 'Giant Swarm Catalog',
  },
};

export const appCatalogList = {
  apiVersion: 'application.giantswarm.io/v1alpha1',
  kind: applicationv1alpha1.AppCatalog,
  metadata: {
    continue: '',
    resourceVersion: '2318290',
    selfLink: '/apis/application.giantswarm.io/v1alpha1/appcatalogs/',
  },
  items: [defaultAppCatalog, giantswarmAppCatalog],
};
