import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import useDebounce from 'lib/hooks/useDebounce';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import usePrevious from 'lib/hooks/usePrevious';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getUserIsAdmin } from 'stores/main/selectors';
import useSWR from 'swr';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';

import { useAppsContext } from '../AppsProvider';
import ListAppCatalogsGuide from '../guides/ListAppCatalogsGuide';
import ListAppsInCatalogGuide from '../guides/ListAppsInCatalogGuide';
import {
  compareAppCatalogEntriesFns,
  filterAppCatalogEntries,
  mapAppCatalogEntriesToAppPageApps,
  mapAppCatalogsToFacets,
} from './utils';

const SEARCH_THROTTLE_RATE_MS = 250;

const AppList: React.FC<{}> = () => {
  const isAdmin = useSelector(getUserIsAdmin);

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const catalogListClient = useRef(clientFactory());
  const catalogListGetOptions: applicationv1alpha1.IGetCatalogListOptions =
    useMemo(() => {
      // Admins can see any type of catalogs.
      if (isAdmin) return {};

      return {
        labelSelector: {
          matchingLabels: {
            [applicationv1alpha1.labelCatalogVisibility]: 'public',
            [applicationv1alpha1.labelCatalogType]: 'stable',
          },
        },
      };
    }, [isAdmin]);

  const {
    data: catalogList,
    error: catalogListError,
    isValidating: catalogListIsValidating,
  } = useSWR<applicationv1alpha1.ICatalogList, GenericResponseError>(
    applicationv1alpha1.getCatalogListKey(catalogListGetOptions),
    () =>
      applicationv1alpha1.getCatalogList(
        catalogListClient.current,
        auth,
        catalogListGetOptions
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

  const appCatalogEntryListClient = useRef(clientFactory());

  const appCatalogEntryListGetOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions =
    useMemo(
      () => ({
        labelSelector: {
          matchingLabels: { [applicationv1alpha1.labelLatest]: 'true' },
        },
      }),
      []
    );

  const {
    data: appCatalogEntryList,
    error: appCatalogEntryListError,
    isValidating: appCatalogEntryListIsValidating,
  } = useSWR<applicationv1alpha1.IAppCatalogEntryList, GenericResponseError>(
    applicationv1alpha1.getAppCatalogEntryListKey(
      appCatalogEntryListGetOptions
    ),
    () =>
      applicationv1alpha1.getAppCatalogEntryList(
        appCatalogEntryListClient.current,
        auth,
        appCatalogEntryListGetOptions
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
          <ListAppCatalogsGuide />
          <ListAppsInCatalogGuide />
        </Box>
      )}
    </>
  );
};

export default AppList;
