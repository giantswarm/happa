interface IAppCatalog {
  metadata: IAppCatalogMetaData;
  spec: IAppCatalogSpec;

  // Injected by client-side.
  isFetchingIndex?: boolean;
  // FIXME(axbarsan): Write proper type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apps?: any;
}

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
