export interface IAppCatalogsMap {
  [key: string]: IAppCatalog;
}

export interface IAppCatalogsState {
  lastUpdated: number;
  isFetching: boolean;
  items: IAppCatalogsMap;
}

export interface IInstallIngress {
  clusterId: string;
}
