import produce from 'immer';
import {
  CATALOG_LOAD_INDEX_ERROR,
  CATALOG_LOAD_INDEX_REQUEST,
  CATALOG_LOAD_INDEX_SUCCESS,
  CATALOGS_LIST_SUCCESS,
  CLUSTER_LOAD_APP_README_SUCCESS,
  DISABLE_CATALOG,
  ENABLE_CATALOG,
  SET_APP_SEARCH_QUERY,
  SET_APP_SORT_ORDER,
} from 'model/stores/appcatalog/constants';

import * as actions from './actions';
import { AppCatalogActions, IAppCatalogsState } from './types';

const initialState: IAppCatalogsState = {
  lastUpdated: 0,
  isFetching: false,
  ui: {
    selectedCatalogs: {},
    searchQuery: '',
    sortOrder: 'name',
  },
  items: {},
};

const catalogReducer = produce(
  (draft: IAppCatalogsState, action: AppCatalogActions) => {
    switch (action.type) {
      case actions.listCatalogs().types.request:
        draft.isFetching = true;

        break;

      case actions.listCatalogs().types.success as typeof CATALOGS_LIST_SUCCESS:
        draft.items = action.response;
        draft.isFetching = false;
        draft.lastUpdated = Date.now();

        break;

      case actions.listCatalogs().types.error:
        draft.isFetching = false;

        break;

      case CATALOG_LOAD_INDEX_REQUEST:
        draft.items[action.catalogName].isFetchingIndex = true;

        break;

      case CATALOG_LOAD_INDEX_SUCCESS:
        draft.items[action.catalog.metadata.name] = action.catalog;
        draft.items[action.catalog.metadata.name].isFetchingIndex = false;
        draft.lastUpdated = Date.now();
        draft.isFetching = false;

        break;

      case CATALOG_LOAD_INDEX_ERROR:
        if (draft.items[action.catalogName]) {
          draft.items[action.catalogName].isFetchingIndex = false;
        }

        break;

      case CLUSTER_LOAD_APP_README_SUCCESS: {
        const appList =
          draft.items[action.catalogName]?.apps?.[action.appVersion.name];
        if (!appList) break;

        const currentAppVersion = appList.find(
          (app) => app.version === action.appVersion.version
        );
        if (!currentAppVersion) break;

        currentAppVersion.readme = action.readmeText;

        break;
      }

      case ENABLE_CATALOG: {
        if (!draft.ui.selectedCatalogs[action.catalog]) {
          draft.ui.selectedCatalogs[action.catalog] = true;
        }

        break;
      }

      case DISABLE_CATALOG: {
        draft.ui.selectedCatalogs[action.catalog] = false;

        break;
      }

      case SET_APP_SEARCH_QUERY: {
        draft.ui.searchQuery = action.query;

        break;
      }

      case SET_APP_SORT_ORDER: {
        draft.ui.sortOrder = action.order;

        break;
      }
    }
  },
  initialState
);

export default catalogReducer;
