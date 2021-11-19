import {
  CATALOG_LOAD_INDEX_ERROR,
  CATALOG_LOAD_INDEX_REQUEST,
  CATALOG_LOAD_INDEX_SUCCESS,
  CATALOGS_LIST_ERROR,
  CATALOGS_LIST_REQUEST,
  CATALOGS_LIST_SUCCESS,
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
  DELETE_CLUSTER_APP_ERROR,
  DELETE_CLUSTER_APP_REQUEST,
  DELETE_CLUSTER_APP_SUCCESS,
  DISABLE_CATALOG,
  ENABLE_CATALOG,
  INSTALL_INGRESS_APP_ERROR,
  INSTALL_INGRESS_APP_REQUEST,
  INSTALL_INGRESS_APP_SUCCESS,
  LOAD_CLUSTER_APPS_ERROR,
  LOAD_CLUSTER_APPS_REQUEST,
  LOAD_CLUSTER_APPS_SUCCESS,
  PREPARE_INGRESS_TAB_DATA_ERROR,
  PREPARE_INGRESS_TAB_DATA_REQUEST,
  PREPARE_INGRESS_TAB_DATA_SUCCESS,
  SET_APP_SEARCH_QUERY,
  SET_APP_SORT_ORDER,
  UPDATE_CLUSTER_APP_ERROR,
  UPDATE_CLUSTER_APP_REQUEST,
  UPDATE_CLUSTER_APP_SUCCESS,
} from 'model/stores/appcatalog/constants';

export interface IAppCatalogsMap {
  [key: string]: IAppCatalog;
}

export interface IAppCatalogsUI {
  selectedCatalogs: {
    [key: string]: boolean;
  };

  searchQuery: string;
  sortOrder: string;
}

export interface IAppCatalogsState {
  lastUpdated: number;
  isFetching: boolean;
  ui: IAppCatalogsUI;
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

export interface IAppCatalogLoadAppReadmeRequestAction {
  type: typeof CLUSTER_LOAD_APP_README_REQUEST;
  catalogName: string;
  appVersion: IAppCatalogAppVersion;
}

export interface IAppCatalogLoadAppReadmeSuccessAction {
  type: typeof CLUSTER_LOAD_APP_README_SUCCESS;
  catalogName: string;
  appVersion: IAppCatalogAppVersion;
  readmeText: string;
}

export interface IAppCatalogLoadAppReadmeErrorAction {
  type: typeof CLUSTER_LOAD_APP_README_ERROR;
  catalogName: string;
  appVersion: IAppCatalogAppVersion;
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

export interface IAppCatalogUpdateClusterAppActionPayload {
  appName: string;
  clusterId: string;
  version: string;
}

export interface IAppCatalogUpdateClusterAppActionResponse {
  error: string;
}

export interface IAppCatalogUpdateClusterAppRequestAction {
  type: typeof UPDATE_CLUSTER_APP_REQUEST;
}

export interface IAppCatalogUpdateClusterAppSuccessAction {
  type: typeof UPDATE_CLUSTER_APP_SUCCESS;
  response: IAppCatalogUpdateClusterAppActionResponse;
}

export interface IAppCatalogUpdateClusterAppErrorAction {
  type: typeof UPDATE_CLUSTER_APP_ERROR;
  error: string;
}

export interface IAppCatalogDeleteClusterAppActionPayload {
  appName: string;
  clusterId: string;
}

export interface IAppCatalogDeleteClusterAppActionResponse {
  appName: string;
  clusterId: string;
}

export interface IAppCatalogDeleteClusterAppRequestAction {
  type: typeof DELETE_CLUSTER_APP_REQUEST;
}

export interface IAppCatalogDeleteClusterAppSuccessAction {
  type: typeof DELETE_CLUSTER_APP_SUCCESS;
  response: IAppCatalogDeleteClusterAppActionResponse;
}

export interface IAppCatalogDeleteClusterAppErrorAction {
  type: typeof DELETE_CLUSTER_APP_ERROR;
  error: string;
}

export interface IAppCatalogLoadClusterAppsActionPayload {
  clusterId: string;
}

export interface IAppCatalogLoadClusterAppsActionResponse {
  apps: IInstalledApp[];
  clusterId: string;
}

export interface IAppCatalogLoadClusterAppRequestAction {
  type: typeof LOAD_CLUSTER_APPS_REQUEST;
}

export interface IAppCatalogLoadClusterAppSuccessAction {
  type: typeof LOAD_CLUSTER_APPS_SUCCESS;
  response: IAppCatalogLoadClusterAppsActionResponse;
}

export interface IAppCatalogLoadClusterAppErrorAction {
  type: typeof LOAD_CLUSTER_APPS_ERROR;
  error: string;
}

export interface IAppCatalogInstallAppActionPayload {
  clusterId: string;
  app: {
    name: string;
    catalog: string;
    namespace: string;
    version: string;
    chartName: string;
    valuesYAML: string;
    secretsYAML: string;
  };
}

export interface IAppCatalogInstallAppActionResponse {
  clusterId: string;
}

export interface IAppCatalogInstallAppRequestAction {
  type: typeof INSTALL_INGRESS_APP_REQUEST;
}

export interface IAppCatalogInstallAppSuccessAction {
  type: typeof INSTALL_INGRESS_APP_SUCCESS;
  response: IAppCatalogInstallAppActionResponse;
}

export interface IAppCatalogInstallAppErrorAction {
  type: typeof INSTALL_INGRESS_APP_ERROR;
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

export interface IAppCatalogEnableCatalogAction {
  type: typeof ENABLE_CATALOG;
  catalog: string;
}

export interface IAppCatalogDisableCatalogAction {
  type: typeof DISABLE_CATALOG;
  catalog: string;
}

export interface IAppCatalogSetAppSearchQuery {
  type: typeof SET_APP_SEARCH_QUERY;
  query: string;
}

export interface IAppCatalogSetAppSortOrder {
  type: typeof SET_APP_SORT_ORDER;
  order: string;
}

export type AppCatalogActions =
  | IAppCatalogListRequestAction
  | IAppCatalogListSuccessAction
  | IAppCatalogListErrorAction
  | IAppCatalogLoadIndexRequestAction
  | IAppCatalogLoadIndexSuccessAction
  | IAppCatalogLoadIndexErrorAction
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
  | IAppCatalogDeleteInstalledAppSecretErrorAction
  | IAppCatalogUpdateClusterAppRequestAction
  | IAppCatalogUpdateClusterAppSuccessAction
  | IAppCatalogUpdateClusterAppErrorAction
  | IAppCatalogDeleteClusterAppRequestAction
  | IAppCatalogDeleteClusterAppSuccessAction
  | IAppCatalogDeleteClusterAppErrorAction
  | IAppCatalogLoadClusterAppRequestAction
  | IAppCatalogLoadClusterAppSuccessAction
  | IAppCatalogLoadClusterAppErrorAction
  | IAppCatalogInstallAppRequestAction
  | IAppCatalogInstallAppSuccessAction
  | IAppCatalogInstallAppErrorAction
  | IAppCatalogInstallLatestIngressRequestAction
  | IAppCatalogInstallLatestIngressSuccessAction
  | IAppCatalogInstallLatestIngressErrorAction
  | IAppCatalogPrepareIngressTabDataRequestAction
  | IAppCatalogPrepareIngressTabDataSuccessAction
  | IAppCatalogPrepareIngressTabDataErrorAction
  | IAppCatalogEnableCatalogAction
  | IAppCatalogDisableCatalogAction
  | IAppCatalogSetAppSearchQuery
  | IAppCatalogSetAppSortOrder;
