import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import useDebounce from 'lib/hooks/useDebounce';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import usePrevious from 'lib/hooks/usePrevious';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getUserIsAdmin } from 'stores/main/selectors';
import useSWR from 'swr';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';

import { useAppsContext } from '../AppsProvider';
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

  const appCatalogListClient = useRef(clientFactory());
  const appCatalogListGetOptions: applicationv1alpha1.IGetAppCatalogListOptions = useMemo(() => {
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
    data: appCatalogList,
    error: appCatalogListError,
    isValidating: appCatalogListIsValidating,
  } = useSWR<applicationv1alpha1.IAppCatalogList, GenericResponse>(
    applicationv1alpha1.getAppCatalogListKey(appCatalogListGetOptions),
    () =>
      applicationv1alpha1.getAppCatalogList(
        appCatalogListClient.current,
        auth,
        appCatalogListGetOptions
      )
  );
  const prevAppCatalogList = usePrevious(appCatalogList);

  useEffect(() => {
    if (appCatalogListError) {
      const errorMessage = extractErrorMessage(appCatalogListError);

      new FlashMessage(
        'There was a problem loading app catalogs.',
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(appCatalogListError);
    }
  }, [appCatalogListError]);

  const appCatalogListIsLoading =
    typeof appCatalogList === 'undefined' && appCatalogListIsValidating;

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
      typeof prevAppCatalogList !== 'undefined' ||
      typeof appCatalogList === 'undefined'
    ) {
      return;
    }

    // Pre-select all catalogs except `helm-stable`.
    for (const catalog of appCatalogList.items) {
      if (catalog.metadata.name === 'helm-stable') continue;

      selectCatalog(catalog.metadata.name);
    }

    // We don't need to run this again if the selected catalogs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appCatalogList?.items, prevAppCatalogList]);

  const appCatalogEntryListClient = useRef(clientFactory());

  const appCatalogEntryListGetOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions = useMemo(
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
  } = useSWR<applicationv1alpha1.IAppCatalogEntryList, GenericResponse>(
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
    appCatalogListIsLoading ||
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
      appCatalogList?.items
    );
  }, [
    appCatalogEntryList,
    debouncedSearchQuery,
    selectedCatalogs,
    sortOrder,
    appCatalogList?.items,
  ]);

  const handleChangeFacets = (value: string, checked: boolean) => {
    if (checked) {
      selectCatalog(value);
    } else {
      deselectCatalog(value);
    }
  };

  return (
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
        appCatalogList?.items,
        selectedCatalogs,
        extractErrorMessage(appCatalogEntryListError)
      )}
      facetsIsLoading={appCatalogListIsLoading}
      appsIsLoading={appCatalogEntryListIsLoading}
    />
  );
};

export default AppList;
