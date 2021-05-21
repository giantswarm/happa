import * as metav1 from '../metav1';

export interface IAppStatusRelease {
  lastDeployed?: string;
  reason?: string;
  status?: string;
}

export interface IAppStatus {
  appVersion: string;
  release: IAppStatusRelease;
  version: string;
}

export interface IAppSpecUserConfigSecret {
  name: string;
  namespace: string;
}

export interface IAppSpecUserConfigConfigMap {
  name: string;
  namespace: string;
}

export interface IAppSpecUserConfig {
  configMap?: IAppSpecUserConfigConfigMap;
  secret?: IAppSpecUserConfigSecret;
}

export interface IAppSpecNamespaceConfig {
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}

export interface IAppSpecKubeConfigSecret {
  name: string;
  namespace: string;
}

export interface IAppSpecKubeConfigContext {
  name: string;
}

export interface IAppSpecKubeConfig {
  inCluster: boolean;
  context?: IAppSpecKubeConfigContext;
  secret?: IAppSpecKubeConfigSecret;
}

export interface IAppSpecConfigSecret {
  name: string;
  namespace: string;
}

export interface IAppSpecConfigConfigMap {
  name: string;
  namespace: string;
}

export interface IAppSpecConfig {
  configMap?: IAppSpecConfigConfigMap;
  secret?: IAppSpecConfigSecret;
}

export interface IAppSpecInstall {
  skipCRDs?: boolean;
}

export interface IAppSpec {
  name: string;
  namespace: string;
  version: string;
  catalog: string;
  kubeConfig: IAppSpecKubeConfig;
  config?: IAppSpecConfig;
  install?: IAppSpecInstall;
  namespaceConfig?: IAppSpecNamespaceConfig;
  userConfig?: IAppSpecUserConfig;
}

export const App = 'App';

export interface IApp {
  apiVersion: 'application.giantswarm.io/v1alpha1';
  kind: typeof App;
  metadata: metav1.IObjectMeta;
  spec: IAppSpec;
  status?: IAppStatus;
}

export const AppList = 'AppList';

export interface IAppList extends metav1.IList<IApp> {
  apiVersion: 'application.giantswarm.io/v1alpha1';
  kind: typeof AppList;
}

export interface IAppCatalogSpecStorage {
  type: string;
  URL: string;
}

export interface IAppCatalogSpecConfigSecret {
  name: string;
  namespace: string;
}

export interface IAppCatalogSpecConfigConfigMap {
  name: string;
  namespace: string;
}

export interface IAppCatalogSpecConfig {
  configMap?: IAppCatalogSpecConfigConfigMap;
  secret?: IAppCatalogSpecConfigSecret;
}

export interface IAppCatalogSpec {
  title: string;
  description: string;
  storage: IAppCatalogSpecStorage;
  logoURL?: string;
  config?: IAppCatalogSpecConfig;
}

export const AppCatalog = 'AppCatalog';

export interface IAppCatalog {
  apiVersion: 'application.giantswarm.io/v1alpha1';
  kind: typeof AppCatalog;
  metadata: metav1.IObjectMeta;
  spec: IAppCatalogSpec;
}

export const AppCatalogList = 'AppCatalogList';

export interface IAppCatalogList extends metav1.IList<IAppCatalog> {
  apiVersion: 'application.giantswarm.io/v1alpha1';
  kind: typeof AppCatalogList;
}

export type Provider = 'aws' | 'azure' | 'kvm';

export interface IAppCatalogEntrySpecRestrictions {
  clusterSingleton?: boolean;
  fixedNamespace?: string;
  gpuInstance?: string;
  compatibleProviders?: Provider[];
  namespaceSingleton?: boolean;
}

export interface IAppCatalogEntrySpecChart {
  apiVersion: string;
  home?: string;
  icon?: string;
}

export interface IAppCatalogEntrySpecCatalog {
  name: string;
  namespace?: string;
}

export interface IAppCatalogEntrySpec {
  appName: string;
  appVersion: string;
  version: string;
  catalog: IAppCatalogEntrySpecCatalog;
  chart: IAppCatalogEntrySpecChart;
  dateCreated: string | null;
  dateUpdated: string | null;
  restrictions?: IAppCatalogEntrySpecRestrictions;
}

export const AppCatalogEntry = 'AppCatalogEntry';

export interface IAppCatalogEntry {
  apiVersion: 'application.giantswarm.io/v1alpha1';
  kind: typeof AppCatalogEntry;
  metadata: metav1.IObjectMeta;
  spec: IAppCatalogEntrySpec;
}

export const AppCatalogEntryList = 'AppCatalogEntryList';

export interface IAppCatalogEntryList extends metav1.IList<IAppCatalogEntry> {
  apiVersion: 'application.giantswarm.io/v1alpha1';
  kind: typeof AppCatalogEntryList;
}
