import useDebounce from 'lib/hooks/useDebounce';
import RoutePath from 'lib/routePath';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppsRoutes } from 'shared/constants/routes';
import {
  disableCatalog,
  enableCatalog,
  setAppSearchQuery,
  setAppSortOrder,
} from 'stores/appcatalog/actions';
import { CATALOG_LOAD_INDEX_REQUEST } from 'stores/appcatalog/constants';
import {
  selectApps,
  selectAppSearchQuery,
  selectAppSortOrder,
  selectCatalogs,
  selectSelectedCatalogs,
} from 'stores/appcatalog/selectors';
import { selectErrorsByIdsAndAction } from 'stores/entityerror/selectors';
import { getUserIsAdmin } from 'stores/main/selectors';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';

import { catalogsToFacets, searchApps } from './utils';

const SEARCH_THROTTLE_RATE_MS = 250;

const AppsList: React.FC = () => {
  const dispatch = useDispatch();
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

  const apps = useMemo(() => searchApps(debouncedSearchQuery, allApps), [
    debouncedSearchQuery,
    memoSelectedCatalogs,
  ]);

  return (
    <AppsListPage
      matchCount={apps.length}
      onChangeSearchQuery={(event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setAppSearchQuery(event.target.value));
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
