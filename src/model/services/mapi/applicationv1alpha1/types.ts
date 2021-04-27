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
