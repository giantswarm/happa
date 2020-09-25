import * as types from 'actions/actionTypes';
import produce from 'immer';

import * as actions from './actions';
import { IAppCatalogsState } from './types';

const initialState: IAppCatalogsState = {
  lastUpdated: 0,
  isFetching: false,
  items: {},
};

const catalogReducer = produce((draft: IAppCatalogsState, action) => {
  switch (action.type) {
    case actions.listCatalogs().types.request:
      draft.isFetching = true;

      break;

    case actions.listCatalogs().types.success:
      draft.items = action.response;
      draft.isFetching = false;
      draft.lastUpdated = Date.now();

      break;

    case actions.listCatalogs().types.error:
      draft.isFetching = false;

      break;

    case types.CATALOG_LOAD_INDEX_REQUEST:
      draft.items[action.catalogName].isFetchingIndex = true;

      break;

    case types.CATALOG_LOAD_INDEX_SUCCESS:
      draft.items[action.catalog.metadata.name] = action.catalog;
      draft.items[action.catalog.metadata.name].isFetchingIndex = false;
      draft.lastUpdated = Date.now();
      draft.isFetching = false;

      break;

    case types.CATALOG_LOAD_INDEX_ERROR:
      draft.items[action.catalogName].isFetchingIndex = false;

      break;

    case types.CLUSTER_LOAD_APP_README_SUCCESS: {
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
  }
}, initialState);

export default catalogReducer;
