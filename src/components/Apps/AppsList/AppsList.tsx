import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { disableCatalog, enableCatalog } from 'stores/appcatalog/actions';
import { selectCatalogs } from 'stores/appcatalog/selectors';
import { getUserIsAdmin } from 'stores/main/selectors';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';

import { catalogsToFacets } from './utils';

const AppsList: React.FC = () => {
  const dispatch = useDispatch();
  const isAdmin = useSelector(getUserIsAdmin);
  const catalogs = useSelector(selectCatalogs);

  return (
    <AppsListPage
      matchCount={0}
      onChangeFacets={(value, checked) => {
        if (checked) {
          dispatch(enableCatalog(value));
        } else {
          dispatch(disableCatalog(value));
        }
      }}
      apps={[]}
      facetOptions={catalogsToFacets(catalogs, isAdmin)}
    />
  );
};

export default AppsList;
