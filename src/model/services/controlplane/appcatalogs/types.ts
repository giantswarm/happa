export interface IAppCatalog {
  metadata: IMetaData;
  spec: ISpec;
}

export interface IMetaData {
  name: string;
  labels: Record<string, string>;
}

export interface ISpec {
  title: string;
  description: string;
  logoURL: string;
  storage: IStorage;
}

export interface IStorage {
  type: string;
  URL: string;
}
