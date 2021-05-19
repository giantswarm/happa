import useDebounce from 'lib/hooks/useDebounce';
import usePrevious from 'lib/hooks/usePrevious';
import RoutePath from 'lib/routePath';
import React, { useLayoutEffect, useMemo, useReducer, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppsRoutes } from 'shared/constants/routes';
import { catalogLoadIndex } from 'stores/appcatalog/actions';
import { CATALOG_LOAD_INDEX_REQUEST } from 'stores/appcatalog/constants';
import { selectCatalogs } from 'stores/appcatalog/selectors';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { selectErrorsByIdsAndAction } from 'stores/entityerror/selectors';
import { getUserIsAdmin } from 'stores/main/selectors';
import { IState } from 'stores/state';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';

import { catalogsToFacets, searchApps, selectApps } from './utils';

const SEARCH_THROTTLE_RATE_MS = 250;

function sortByName(a: IAppCatalogApp, b: IAppCatalogApp) {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;

  return 0;
}

function sortByCatalog(a: IAppCatalogApp, b: IAppCatalogApp) {
  if (a.catalogTitle < b.catalogTitle) return -1;
  if (a.catalogTitle > b.catalogTitle) return 1;

  return 0;
}

function sortByLatest(a: IAppCatalogApp, b: IAppCatalogApp) {
  return (
    new Date(b.versions[0].created).getTime() -
    new Date(a.versions[0].created).getTime()
  );
}

const sortFuncs: {
  [key: string]: (a: IAppCatalogApp, b: IAppCatalogApp) => number;
} = {
  name: sortByName,
  catalog: sortByCatalog,
  latest: sortByLatest,
};

type SelectedCatalogsState = Record<string, boolean>;

interface ISelectedCatalogsAction {
  type: 'selectCatalog' | 'deselectCatalog';
  name: string;
}

const selectedCatalogsReducer: React.Reducer<
  SelectedCatalogsState,
  ISelectedCatalogsAction
> = (state: SelectedCatalogsState, action: ISelectedCatalogsAction) => {
  switch (action.type) {
    case 'selectCatalog':
      return Object.assign({}, state, { [action.name]: true });
    case 'deselectCatalog': {
      const nextSelectedCatalogs = Object.assign({}, state);
      delete nextSelectedCatalogs[action.name];

      return nextSelectedCatalogs;
    }
    default:
      return state;
  }
};

const AppList: React.FC<{}> = () => {
  const isAdmin = useSelector(getUserIsAdmin);

  const catalogs = useSelector(selectCatalogs);
  const prevCatalogItems = usePrevious(catalogs.items);
  const catalogErrors = useSelector(
    selectErrorsByIdsAndAction(
      Object.keys(catalogs.items),
      CATALOG_LOAD_INDEX_REQUEST
    )
  );

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(
    searchQuery,
    SEARCH_THROTTLE_RATE_MS
  );

  const [sortOrder, setSortOrder] = useState('name');

  const [selectedCatalogs, dispatchSelectedCatalogs] = useReducer(
    selectedCatalogsReducer,
    {}
  );

  useLayoutEffect(() => {
    if (
      Object.keys(selectedCatalogs).length > 0 ||
      typeof prevCatalogItems !== 'undefined'
    ) {
      return;
    }

    // Pre-select all catalogs except `helm-stable`.
    for (const catalogName of Object.keys(catalogs.items)) {
      if (catalogName === 'helm-stable') continue;

      dispatchSelectedCatalogs({
        type: 'selectCatalog',
        name: catalogName,
      });
    }

    // We don't need to run this again if the selected catalogs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogs.items, prevCatalogItems]);

  const apps = useMemo(() => {
    const appCollection = searchApps(
      debouncedSearchQuery,
      selectApps(catalogs.items, selectedCatalogs)
    );
    appCollection.sort(sortFuncs[sortOrder]);

    return appCollection;
  }, [debouncedSearchQuery, selectedCatalogs, sortOrder, catalogs.items]);

  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();

  return (
    <AppsListPage
      matchCount={apps.length}
      onChangeSearchQuery={setSearchQuery}
      searchQuery={searchQuery}
      onChangeFacets={(value, checked) => {
        if (checked) {
          dispatchSelectedCatalogs({
            type: 'selectCatalog',
            name: value,
          });

          dispatch(catalogLoadIndex(value));
        } else {
          dispatchSelectedCatalogs({
            type: 'deselectCatalog',
            name: value,
          });
        }
      }}
      sortOrder={sortOrder}
      onChangeSortOrder={setSortOrder}
      onResetSearch={() => setSearchQuery('')}
      apps={apps.map((app) => ({
        name: app.name,
        appIconURL: app.appIconURL,
        catalogName: app.catalogName,
        catalogTitle: app.catalogTitle,
        to: RoutePath.createUsablePath(AppsRoutes.AppDetail, {
          catalogName: app.catalogName,
          app: app.name,
          version: app.versions[0].version,
        }),
        catalogIconUrl: app.catalogIconURL,
      }))}
      facetOptions={catalogsToFacets(
        catalogs.items,
        selectedCatalogs,
        catalogErrors,
        isAdmin
      )}
    />
  );
};

export default AppList;
