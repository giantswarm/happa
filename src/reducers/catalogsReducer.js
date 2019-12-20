import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = {
  lastUpdated: 0,
  isFetching: false,
  items: [],
};

const catalogReducer = produce((draft, action) => {
  switch (action.type) {
    case types.CATALOGS_LOAD:
      draft.isFetching = true;
      return;

    case types.CATALOGS_LOAD_SUCCESS:
      draft.items = action.catalogs;
      draft.isFetching = false;
      draft.lastUpdated = Date.now();
      return;

    case types.CATALOGS_LOAD_ERROR:
      draft.isFetching = false;
      return;

    case types.CATALOG_LOAD_INDEX:
      draft.items[action.catalogName].isFetchingIndex = true;
      return;

    case types.CATALOG_LOAD_INDEX_SUCCESS:
      draft.items[action.catalog.metadata.name] = action.catalog;
      draft.items[action.catalog.metadata.name].isFetchingIndex = false;
      draft.lastUpdated = Date.now();
      draft.isFetching = false;
      
  }
}, initialState);

export default catalogReducer;
