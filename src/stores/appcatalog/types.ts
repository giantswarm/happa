import {
  CATALOG_LOAD_INDEX_ERROR,
  CATALOG_LOAD_INDEX_REQUEST,
  CATALOG_LOAD_INDEX_SUCCESS,
  CATALOGS_LIST_ERROR,
  CATALOGS_LIST_REQUEST,
  CATALOGS_LIST_SUCCESS,
  CATALOGS_LOAD_ERROR,
  CATALOGS_LOAD_REQUEST,
  CATALOGS_LOAD_SUCCESS,
  CLUSTER_LOAD_APP_README_ERROR,
  CLUSTER_LOAD_APP_README_REQUEST,
  CLUSTER_LOAD_APP_README_SUCCESS,
  INSTALL_INGRESS_APP_ERROR,
  INSTALL_INGRESS_APP_REQUEST,
  INSTALL_INGRESS_APP_SUCCESS,
  PREPARE_INGRESS_TAB_DATA_ERROR,
  PREPARE_INGRESS_TAB_DATA_REQUEST,
  PREPARE_INGRESS_TAB_DATA_SUCCESS,
} from 'stores/appcatalog/constants';

export interface IAppCatalogsMap {
  [key: string]: IAppCatalog;
}

export interface IAppCatalogsState {
  lastUpdated: number;
  isFetching: boolean;
  items: IAppCatalogsMap;
}

export interface IInstallIngressActionPayload {
  clusterId: string;
}

export interface IAppCatalogListRequestAction {
  type: typeof CATALOGS_LIST_REQUEST;
}

export interface IAppCatalogListSuccessAction {
  type: typeof CATALOGS_LIST_SUCCESS;
  response: IAppCatalogsMap;
}

export interface IAppCatalogListErrorAction {
  type: typeof CATALOGS_LIST_ERROR;
  error: string;
}

export interface IAppCatalogLoadIndexRequestAction {
  type: typeof CATALOG_LOAD_INDEX_REQUEST;
  catalogName: string;
}

export interface IAppCatalogLoadIndexSuccessAction {
  type: typeof CATALOG_LOAD_INDEX_SUCCESS;
  catalog: IAppCatalog;
  id: string;
}

export interface IAppCatalogLoadIndexErrorAction {
  type: typeof CATALOG_LOAD_INDEX_ERROR;
  catalogName: string;
  id: string;
  error: string;
}

export interface IAppCatalogLoadRequestAction {
  type: typeof CATALOGS_LOAD_REQUEST;
}

export interface IAppCatalogLoadSuccessAction {
  type: typeof CATALOGS_LOAD_SUCCESS;
  catalogs: IAppCatalogsMap;
}

export interface IAppCatalogLoadErrorAction {
  type: typeof CATALOGS_LOAD_ERROR;
  error: string;
}

export interface IAppCatalogInstallLatestIngressRequestAction {
  type: typeof INSTALL_INGRESS_APP_REQUEST;
}

export interface IAppCatalogInstallLatestIngressSuccessAction {
  type: typeof INSTALL_INGRESS_APP_SUCCESS;
}

export interface IAppCatalogInstallLatestIngressErrorAction {
  type: typeof INSTALL_INGRESS_APP_ERROR;
  error: string;
}

export interface IAppCatalogPrepareIngressTabDataRequestAction {
  type: typeof PREPARE_INGRESS_TAB_DATA_REQUEST;
}

export interface IAppCatalogPrepareIngressTabDataSuccessAction {
  type: typeof PREPARE_INGRESS_TAB_DATA_SUCCESS;
}

export interface IAppCatalogPrepareIngressTabDataErrorAction {
  type: typeof PREPARE_INGRESS_TAB_DATA_ERROR;
  error: string;
}

export interface IAppCatalogLoadAppReadmeRequestAction {
  type: typeof CLUSTER_LOAD_APP_README_REQUEST;
  catalogName: string;
  appVersion: IAppCatalogApp;
}

export interface IAppCatalogLoadAppReadmeSuccessAction {
  type: typeof CLUSTER_LOAD_APP_README_SUCCESS;
  catalogName: string;
  appVersion: IAppCatalogApp;
  readmeText: string;
}

export interface IAppCatalogLoadAppReadmeErrorAction {
  type: typeof CLUSTER_LOAD_APP_README_ERROR;
  catalogName: string;
  appVersion: IAppCatalogApp;
  error: string;
}

export type AppCatalogActions =
  | IAppCatalogListRequestAction
  | IAppCatalogListSuccessAction
  | IAppCatalogListErrorAction
  | IAppCatalogLoadIndexRequestAction
  | IAppCatalogLoadIndexSuccessAction
  | IAppCatalogLoadIndexErrorAction
  | IAppCatalogLoadRequestAction
  | IAppCatalogLoadSuccessAction
  | IAppCatalogLoadErrorAction
  | IAppCatalogInstallLatestIngressRequestAction
  | IAppCatalogInstallLatestIngressSuccessAction
  | IAppCatalogInstallLatestIngressErrorAction
  | IAppCatalogPrepareIngressTabDataRequestAction
  | IAppCatalogPrepareIngressTabDataSuccessAction
  | IAppCatalogPrepareIngressTabDataErrorAction
  | IAppCatalogLoadAppReadmeRequestAction
  | IAppCatalogLoadAppReadmeSuccessAction
  | IAppCatalogLoadAppReadmeErrorAction;
