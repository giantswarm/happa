import RoutePath from 'lib/routePath';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppsRoutes } from 'shared/constants/routes';
import {
  disableCatalog,
  enableCatalog,
  setAppSearchQuery,
} from 'stores/appcatalog/actions';
import { CATALOG_LOAD_INDEX_REQUEST } from 'stores/appcatalog/constants';
import {
  selectApps,
  selectAppSearchQuery,
  selectCatalogs,
} from 'stores/appcatalog/selectors';
import { selectErrorsByIdsAndAction } from 'stores/entityerror/selectors';
import { getUserIsAdmin } from 'stores/main/selectors';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';

import { catalogsToFacets, searchApps } from './utils';

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

  const apps = searchApps(searchQuery, useSelector(selectApps));

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
