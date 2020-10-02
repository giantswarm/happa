interface IAppCatalogMetaData {
  name: string;
  labels: Record<string, string> | null;
}

interface IAppCatalogSpec {
  title: string;
  description: string;
  logoURL: string;
  storage: IAppCatalogStorage;
}

interface IAppCatalogStorage {
  type: string;
  URL: string;
}

interface IAppCatalogApp {
  apiVersion: string;
  appVersion: string;
  version: string;
  created: string;
  description: string;
  digest: string;
  home: string;
  icon: string;
  name: string;
  sources: string[];
  urls: string[];

  // Injected by client-side.
  readme?: string;
}

interface IAppCatalogAppMap {
  [name: string]: IAppCatalogApp[];
}

interface IAppCatalog {
  metadata: IAppCatalogMetaData;
  spec: IAppCatalogSpec;

  // Injected by client-side.
  isFetchingIndex?: boolean;
  apps?: IAppCatalogAppMap;
}

interface IAppCatalogYAML {
  apiVersion: string;
  entries: IAppCatalogAppMap;
}

interface IInstalledAppRelease {
  last_deployed: string | null;
  status: string;
}

interface IInstalledAppStatus {
  app_version: string;
  release: IInstalledAppRelease;
  version: string;
}

interface IInstalledAppSecret {
  name: string;
  namespace: string;
}

interface IInstalledAppConfigmap {
  name: string;
  namespace: string;
}

interface IInstalledAppUserConfig {
  configmap: IInstalledAppConfigmap;
  secret: IInstalledAppSecret;
}

interface IInstalledAppSpec {
  catalog: string;
  name: string;
  namespace: string;
  user_config: IInstalledAppUserConfig;
  version: string;
}

interface IInstalledAppMetadata {
  name: string;
  labels: Record<string, string> | null;
}

interface IInstalledApp {
  metadata: IInstalledAppMetadata;
  spec: IInstalledAppSpec;
  status: IInstalledAppStatus;
}
