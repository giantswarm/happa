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
  CLUSTER_CREATE_APP_CONFIG_ERROR,
  CLUSTER_CREATE_APP_CONFIG_REQUEST,
  CLUSTER_CREATE_APP_CONFIG_SUCCESS,
  CLUSTER_CREATE_APP_SECRET_ERROR,
  CLUSTER_CREATE_APP_SECRET_REQUEST,
  CLUSTER_CREATE_APP_SECRET_SUCCESS,
  CLUSTER_DELETE_APP_CONFIG_ERROR,
  CLUSTER_DELETE_APP_CONFIG_REQUEST,
  CLUSTER_DELETE_APP_CONFIG_SUCCESS,
  CLUSTER_DELETE_APP_SECRET_ERROR,
  CLUSTER_DELETE_APP_SECRET_REQUEST,
  CLUSTER_DELETE_APP_SECRET_SUCCESS,
  CLUSTER_LOAD_APP_README_ERROR,
  CLUSTER_LOAD_APP_README_REQUEST,
  CLUSTER_LOAD_APP_README_SUCCESS,
  CLUSTER_UPDATE_APP_CONFIG_ERROR,
  CLUSTER_UPDATE_APP_CONFIG_REQUEST,
  CLUSTER_UPDATE_APP_CONFIG_SUCCESS,
  CLUSTER_UPDATE_APP_SECRET_ERROR,
  CLUSTER_UPDATE_APP_SECRET_REQUEST,
  CLUSTER_UPDATE_APP_SECRET_SUCCESS,
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

export interface IAppCatalogCreateInstalledAppConfigRequestAction {
  type: typeof CLUSTER_CREATE_APP_CONFIG_REQUEST;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogCreateInstalledAppConfigSuccessAction {
  type: typeof CLUSTER_CREATE_APP_CONFIG_SUCCESS;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogCreateInstalledAppConfigErrorAction {
  type: typeof CLUSTER_CREATE_APP_CONFIG_ERROR;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogUpdateInstalledAppConfigRequestAction {
  type: typeof CLUSTER_UPDATE_APP_CONFIG_REQUEST;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogUpdateInstalledAppConfigSuccessAction {
  type: typeof CLUSTER_UPDATE_APP_CONFIG_SUCCESS;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogUpdateInstalledAppConfigErrorAction {
  type: typeof CLUSTER_UPDATE_APP_CONFIG_ERROR;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogDeleteInstalledAppConfigRequestAction {
  type: typeof CLUSTER_DELETE_APP_CONFIG_REQUEST;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogDeleteInstalledAppConfigSuccessAction {
  type: typeof CLUSTER_DELETE_APP_CONFIG_SUCCESS;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogDeleteInstalledAppConfigErrorAction {
  type: typeof CLUSTER_DELETE_APP_CONFIG_ERROR;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogUpdateInstalledAppSecretRequestAction {
  type: typeof CLUSTER_UPDATE_APP_SECRET_REQUEST;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogUpdateInstalledAppSecretSuccessAction {
  type: typeof CLUSTER_UPDATE_APP_SECRET_SUCCESS;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogUpdateInstalledAppSecretErrorAction {
  type: typeof CLUSTER_UPDATE_APP_SECRET_ERROR;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogCreateInstalledAppSecretRequestAction {
  type: typeof CLUSTER_CREATE_APP_SECRET_REQUEST;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogCreateInstalledAppSecretSuccessAction {
  type: typeof CLUSTER_CREATE_APP_SECRET_SUCCESS;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogCreateInstalledAppSecretErrorAction {
  type: typeof CLUSTER_CREATE_APP_SECRET_ERROR;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogDeleteInstalledAppSecretRequestAction {
  type: typeof CLUSTER_DELETE_APP_SECRET_REQUEST;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogDeleteInstalledAppSecretSuccessAction {
  type: typeof CLUSTER_DELETE_APP_SECRET_SUCCESS;
  clusterID: string;
  appName: string;
}

export interface IAppCatalogDeleteInstalledAppSecretErrorAction {
  type: typeof CLUSTER_DELETE_APP_SECRET_ERROR;
  clusterID: string;
  appName: string;
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
  | IAppCatalogLoadAppReadmeErrorAction
  | IAppCatalogCreateInstalledAppConfigRequestAction
  | IAppCatalogCreateInstalledAppConfigSuccessAction
  | IAppCatalogCreateInstalledAppConfigErrorAction
  | IAppCatalogUpdateInstalledAppConfigRequestAction
  | IAppCatalogUpdateInstalledAppConfigSuccessAction
  | IAppCatalogUpdateInstalledAppConfigErrorAction
  | IAppCatalogDeleteInstalledAppConfigRequestAction
  | IAppCatalogDeleteInstalledAppConfigSuccessAction
  | IAppCatalogDeleteInstalledAppConfigErrorAction
  | IAppCatalogCreateInstalledAppSecretRequestAction
  | IAppCatalogCreateInstalledAppSecretSuccessAction
  | IAppCatalogCreateInstalledAppSecretErrorAction
  | IAppCatalogUpdateInstalledAppSecretRequestAction
  | IAppCatalogUpdateInstalledAppSecretSuccessAction
  | IAppCatalogUpdateInstalledAppSecretErrorAction
  | IAppCatalogDeleteInstalledAppSecretRequestAction
  | IAppCatalogDeleteInstalledAppSecretSuccessAction
  | IAppCatalogDeleteInstalledAppSecretErrorAction;
