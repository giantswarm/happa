import { IAppCatalog } from 'model/services/controlplane/appcatalogs/types';

export interface IApplicationVersion {
  version: string;
}

export interface IStoredAppCatalog extends IAppCatalog {
  isFetchingIndex: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apps?: any;
}

export interface IAppCatalogsMap {
  [key: string]: IStoredAppCatalog;
}

export interface IAppCatalogsState {
  lastUpdated: number;
  isFetching: boolean;
  items: IAppCatalogsMap;
}
