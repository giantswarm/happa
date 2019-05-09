import * as types from '../actions/actionTypes';

export default function catalogsReducer(
  state = {
    lastUpdated: 0,
    isFetching: false,
    items: [],
  },
  action = undefined
) {
  switch (action.type) {
    case types.CATALOGS_LOAD:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: true,
        items: [],
      };

    case types.CATALOGS_LOAD_SUCCESS:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: action.catalogs,
      };

    case types.CATALOGS_LOAD_ERROR:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: state.items,
      };

    case types.CATALOG_LOAD_INDEX:
      {
        let items = Object.assign({}, state.items);

        items[action.catalogName] = Object.assign({}, items[action.catalogName], {
          isFetchingIndex: true,
        });

        return {
          lastUpdated: Date.now(),
          isFetching: false,
          items: items,
        };
      }

    case types.CATALOG_LOAD_INDEX_SUCCESS:
      {
        let items = Object.assign({}, state.items);

        items[action.catalog.metadata.name] = Object.assign({}, action.catalog, {
          isFetchingIndex: false,
        });

        return {
          lastUpdated: Date.now(),
          isFetching: false,
          items: items,
        };
      }

    default:
      return state;
  }
}
