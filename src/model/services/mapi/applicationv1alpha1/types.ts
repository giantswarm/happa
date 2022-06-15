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
  catalogNamespace?: string;
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

export interface ICatalogSpecStorage {
  type: string;
  URL: string;
}

export interface ICatalogSpecRepository {
  type: string;
  URL: string;
}

export interface ICatalogSpecConfigSecret {
  name: string;
  namespace: string;
}

export interface ICatalogSpecConfigConfigMap {
  name: string;
  namespace: string;
}

export interface ICatalogSpecConfig {
  configMap?: ICatalogSpecConfigConfigMap;
  secret?: ICatalogSpecConfigSecret;
}

export interface ICatalogSpec {
  title: string;
  description: string;
  storage: ICatalogSpecStorage;
  repositories: ICatalogSpecRepository[];
  logoURL?: string;
  config?: ICatalogSpecConfig;
}

export const Catalog = 'Catalog';

export interface ICatalog {
  apiVersion: 'application.giantswarm.io/v1alpha1';
  kind: typeof Catalog;
  metadata: metav1.IObjectMeta;
  spec: ICatalogSpec;
}

export const CatalogList = 'CatalogList';

export interface ICatalogList extends metav1.IList<ICatalog> {
  apiVersion: 'application.giantswarm.io/v1alpha1';
  kind: typeof CatalogList;
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
  description?: string;
  home?: string;
  icon?: string;
  keywords?: string[];
  upstreamChartVersion?: string;
}

export interface IAppCatalogEntrySpecCatalog {
  name: string;
  namespace: string;
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
