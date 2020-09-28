interface IAppCatalogMetaData {
  name: string;
  labels: Record<string, string>;
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
