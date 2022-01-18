import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { getUserIsAdmin } from 'model/stores/main/selectors';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSWR, { useSWRConfig } from 'swr';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import useDebounce from 'utils/hooks/useDebounce';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import usePrevious from 'utils/hooks/usePrevious';

import { useAppsContext } from '../AppsProvider';
import ListAppCatalogsAndAppsGuide from '../guides/ListAppCatalogsAndAppsGuide';
import { usePermissionsForAppCatalogEntries } from '../permissions/usePermissionsForAppCatalogEntries';
import { usePermissionsForCatalogs } from '../permissions/usePermissionsForCatalogs';
import {
  fetchAppCatalogEntryListForOrganizations,
  fetchAppCatalogEntryListForOrganizationsKey,
  fetchCatalogListForOrganizations,
  fetchCatalogListForOrganizationsKey,
} from '../utils';
import {
  compareAppCatalogEntriesFns,
  filterAppCatalogEntries,
  mapAppCatalogEntriesToAppPageApps,
  mapAppCatalogsToFacets,
} from './utils';

const SEARCH_THROTTLE_RATE_MS = 250;

const AppList: React.FC<{}> = () => {
  const isAdmin = useSelector(getUserIsAdmin);
  const organizations = useSelector(selectOrganizations());

  const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();
  const { cache } = useSWRConfig();

  const catalogPermissions = usePermissionsForCatalogs(provider, 'default');

  const catalogListForOrganizationsKey = catalogPermissions.canList
    ? fetchCatalogListForOrganizationsKey(organizations, isAdmin)
    : null;

  const {
    data: catalogList,
    error: catalogListError,
    isValidating: catalogListIsValidating,
  } = useSWR<applicationv1alpha1.ICatalogList, GenericResponseError>(
    catalogListForOrganizationsKey,
    () =>
      fetchCatalogListForOrganizations(
        clientFactory,
        auth,
        cache,
        organizations,
        isAdmin
      )
  );
  const prevcatalogList = usePrevious(catalogList);

  useEffect(() => {
    if (catalogListError) {
      const errorMessage = extractErrorMessage(catalogListError);

      new FlashMessage(
        'There was a problem loading catalogs.',
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(catalogListError);
    }
  }, [catalogListError]);

  const catalogListIsLoading =
    typeof catalogList === 'undefined' && catalogListIsValidating;

  const {
    selectedCatalogs,
    selectCatalog,
    deselectCatalog,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
  } = useAppsContext();

  const debouncedSearchQuery = useDebounce(
    searchQuery,
    SEARCH_THROTTLE_RATE_MS
  );

  useLayoutEffect(() => {
    // Only execute this after the initial catalog load.
    if (
      Object.keys(selectedCatalogs).length > 0 ||
      typeof prevcatalogList !== 'undefined' ||
      typeof catalogList === 'undefined'
    ) {
      return;
    }

    // Pre-select all catalogs.
    for (const catalog of catalogList.items) {
      selectCatalog(catalog.metadata.name);
    }

    // We don't need to run this again if the selected catalogs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogList, prevcatalogList, selectedCatalogs]);

  const appCatalogEntriesPermissions = usePermissionsForAppCatalogEntries(
    provider,
    'default'
  );

  const appCatalogEntryListKey = appCatalogEntriesPermissions.canList
    ? fetchAppCatalogEntryListForOrganizationsKey(organizations)
    : null;

  const {
    data: appCatalogEntryList,
    error: appCatalogEntryListError,
    isValidating: appCatalogEntryListIsValidating,
  } = useSWR<applicationv1alpha1.IAppCatalogEntryList, GenericResponseError>(
    appCatalogEntryListKey,
    () =>
      fetchAppCatalogEntryListForOrganizations(
        clientFactory,
        auth,
        cache,
        organizations
      )
  );

  useEffect(() => {
    if (appCatalogEntryListError) {
      const errorMessage = extractErrorMessage(appCatalogEntryListError);

      new FlashMessage(
        'There was a problem loading the app versions.',
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(appCatalogEntryListError);
    }
  }, [appCatalogEntryListError]);

  const appCatalogEntryListIsLoading =
    catalogListIsLoading ||
    (typeof appCatalogEntryList === 'undefined' &&
      appCatalogEntryListIsValidating);

  const apps = useMemo(() => {
    if (!appCatalogEntryList) return [];

    // Filter apps by the search query.
    const filteredAppCatalogEntryList = filterAppCatalogEntries(
      debouncedSearchQuery,
      appCatalogEntryList.items,
      selectedCatalogs
    );

    // Sort apps by the selected sorting criteria.
    filteredAppCatalogEntryList.sort(compareAppCatalogEntriesFns[sortOrder]);

    return mapAppCatalogEntriesToAppPageApps(
      filteredAppCatalogEntryList,
      catalogList?.items
    );
  }, [
    appCatalogEntryList,
    debouncedSearchQuery,
    selectedCatalogs,
    sortOrder,
    catalogList?.items,
  ]);

  const handleChangeFacets = (value: string, checked: boolean) => {
    if (checked) {
      selectCatalog(value);
    } else {
      deselectCatalog(value);
    }
  };

  return (
    <>
      <AppsListPage
        onChangeSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        onChangeFacets={handleChangeFacets}
        sortOrder={sortOrder}
        onChangeSortOrder={setSortOrder}
        onResetSearch={() => setSearchQuery('')}
        matchCount={apps.length}
        apps={apps}
        facetOptions={mapAppCatalogsToFacets(
          catalogList?.items,
          selectedCatalogs,
          extractErrorMessage(appCatalogEntryListError)
        )}
        facetsIsLoading={catalogListIsLoading}
        appsIsLoading={appCatalogEntryListIsLoading}
      />
      {catalogList && (
        <Box margin={{ top: 'medium' }} direction='column' gap='small'>
          <ListAppCatalogsAndAppsGuide />
        </Box>
      )}
    </>
  );
};

export default AppList;
