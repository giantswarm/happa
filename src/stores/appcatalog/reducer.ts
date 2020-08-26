import * as types from 'actions/actionTypes';
import produce from 'immer';

import * as actions from './actions';
import { IApplicationVersion } from './types';

const initialState = {
  lastUpdated: 0,
  isFetching: false,
  items: {},
};

const catalogReducer = produce((draft, action) => {
  switch (action.type) {
    case actions.listCatalogs().types.request:
      draft.isFetching = true;

      return;

    case actions.listCatalogs().types.success:
      draft.items = action.response;
      draft.isFetching = false;
      draft.lastUpdated = Date.now();

      return;

    case actions.listCatalogs().types.error:
      draft.isFetching = false;

      return;

    case types.CATALOG_LOAD_INDEX_REQUEST:
      draft.items[action.catalogName].isFetchingIndex = true;

      return;

    case types.CATALOG_LOAD_INDEX_SUCCESS:
      draft.items[action.catalog.metadata.name] = action.catalog;
      draft.items[action.catalog.metadata.name].isFetchingIndex = false;
      draft.lastUpdated = Date.now();
      draft.isFetching = false;

      return;

    case types.CATALOG_LOAD_INDEX_ERROR:
      draft.items[action.catalogName].isFetchingIndex = false;

      return;

    case types.CLUSTER_LOAD_APP_README_SUCCESS:
      if (!draft.items[action.catalogName]) return;
      if (!draft.items[action.catalogName].apps[action.appVersion.name]) return;

      draft.items[action.catalogName].apps[action.appVersion.name].find(
        (av: IApplicationVersion) => av.version === action.appVersion.version
      ).readme = action.readmeText;
  }
}, initialState);

export default catalogReducer;
