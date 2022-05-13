import { AppsRoutes } from 'model/constants/routes';
import {
  disableCatalog,
  enableCatalog,
  setAppSearchQuery,
  setAppSortOrder,
} from 'model/stores/appcatalog/actions';
import { CATALOG_LOAD_INDEX_REQUEST } from 'model/stores/appcatalog/constants';
import {
  selectApps,
  selectAppSearchQuery,
  selectAppsLastUpdated,
  selectAppSortOrder,
  selectCatalogs,
  selectSelectedCatalogs,
} from 'model/stores/appcatalog/selectors';
import { selectErrorsByIdsAndAction } from 'model/stores/entityerror/selectors';
import { getUserIsAdmin } from 'model/stores/main/selectors';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';
import useDebounce from 'utils/hooks/useDebounce';
import RoutePath from 'utils/routePath';

import { catalogsToFacets, searchApps } from './utils';

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

const AppsList: React.FC<React.PropsWithChildren<unknown>> = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch: Dispatch<any> = useDispatch();
  const isAdmin = useSelector(getUserIsAdmin);
  const catalogs = useSelector(selectCatalogs);
  const searchQuery = useSelector(selectAppSearchQuery);

  const catalogErrors = useSelector(
    selectErrorsByIdsAndAction(
      Object.keys(catalogs.items),
      CATALOG_LOAD_INDEX_REQUEST
    )
  );

  const debouncedSearchQuery = useDebounce(
    searchQuery,
    SEARCH_THROTTLE_RATE_MS
  );

  const allApps = useSelector(selectApps);
  const selectedCatalogs = useSelector(selectSelectedCatalogs);
  const memoSelectedCatalogs = selectedCatalogs.join('');
  const sortOrder = useSelector(selectAppSortOrder);
  const lastUpdated = useSelector(selectAppsLastUpdated);

  const apps = useMemo(() => {
    const appCollection = searchApps(debouncedSearchQuery, allApps);
    appCollection.sort(sortFuncs[sortOrder]);

    return appCollection;
  }, [debouncedSearchQuery, memoSelectedCatalogs, sortOrder, lastUpdated]);

  return (
    <AppsListPage
      matchCount={apps.length}
      onChangeSearchQuery={(value: string) => {
        dispatch(setAppSearchQuery(value));
      }}
      searchQuery={searchQuery}
      onChangeFacets={(value, checked) => {
        if (checked) {
          dispatch(enableCatalog(value));
        } else {
          dispatch(disableCatalog(value));
        }
      }}
      sortOrder={sortOrder}
      onChangeSortOrder={(value: string) => {
        dispatch(setAppSortOrder(value));
      }}
      onResetSearch={() => dispatch(setAppSearchQuery(''))}
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
      facetOptions={catalogsToFacets(catalogs, catalogErrors, isAdmin)}
    />
  );
};

export default AppsList;
