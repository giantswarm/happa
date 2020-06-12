import { IAppCatalog } from 'model/services/controlplane/appcatalogs/types';

export interface IApplicationVersion {
  version: string;
}

export interface IStoredAppCatalog extends IAppCatalog {
  isFetchingIndex: boolean;
}

export interface IAppCatalogsState {
  [key: string]: IStoredAppCatalog;
}
