import { CLUSTER_LOAD_APP_README_SUCCESS } from 'actions/actionTypes';
import produce from 'immer';
import {
  CATALOG_LOAD_INDEX_ERROR,
  CATALOG_LOAD_INDEX_REQUEST,
  CATALOG_LOAD_INDEX_SUCCESS,
  CATALOGS_LIST_SUCCESS,
} from 'stores/appcatalog/constants';

import * as actions from './actions';
import { AppCatalogActions, IAppCatalogsState } from './types';

const initialState: IAppCatalogsState = {
  lastUpdated: 0,
  isFetching: false,
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
        draft.items[action.catalogName].isFetchingIndex = false;

        break;

      // TODO(axbarsan): Remove type casts once we have a generic app action type.
      case CLUSTER_LOAD_APP_README_SUCCESS as unknown: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyAction = action as any;
        const appList =
          draft.items[anyAction.catalogName]?.apps?.[anyAction.appVersion.name];
        if (!appList) break;

        const currentAppVersion = appList.find(
          (app) => app.version === anyAction.appVersion.version
        );
        if (!currentAppVersion) break;

        currentAppVersion.readme = anyAction.readmeText;

        break;
      }
    }
  },
  initialState
);

export default catalogReducer;
