import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import useDebounce from 'lib/hooks/useDebounce';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import usePrevious from 'lib/hooks/usePrevious';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { getUserIsAdmin } from 'stores/main/selectors';
import useSWR from 'swr';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';

import {
  compareAppCatalogIndexAppsFns,
  filterAppCatalogIndexApps,
  filterAppCatalogIndexAppsBySelectedAppCatalogs,
  getAppCatalogsIndexList,
  getAppCatalogsIndexListKey,
  IAppCatalogIndex,
  IAppCatalogIndexApp,
  IAppCatalogIndexList,
  mapAppCatalogsToFacets,
} from './utils';

const SEARCH_THROTTLE_RATE_MS = 250;

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
    }
  }, [appCatalogListError]);

  const appCatalogListIsLoading =
    typeof appCatalogList === 'undefined' && appCatalogListIsValidating;

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(
    searchQuery,
    SEARCH_THROTTLE_RATE_MS
  );

  const [selectedCatalogs, dispatchSelectedCatalogs] = useReducer(
    selectedCatalogsReducer,
    {}
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

      dispatchSelectedCatalogs({
        type: 'selectCatalog',
        name: catalog.metadata.name,
      });
    }

    // We don't need to run this again if the selected catalogs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appCatalogList?.items, prevAppCatalogList]);

  const {
    data: appCatalogIndexList,
    isValidating: appCatalogIndexListIsValidating,
  } = useSWR<IAppCatalogIndexList, GenericResponse>(
    getAppCatalogsIndexListKey(appCatalogList?.items),
    // TODO(axbarsan): Find a more elegant solution for passing `fetch` here.
    () => getAppCatalogsIndexList(fetch, auth, appCatalogList!.items)
  );

  const appCatalogIndexListIsLoading =
    appCatalogListIsLoading ||
    (typeof appCatalogIndexList === 'undefined' &&
      appCatalogIndexListIsValidating);

  const [sortOrder, setSortOrder] = useState('name');

  const apps = useMemo(() => {
    if (!appCatalogIndexList) return [];

    // Move all apps into a single data structure.
    const allApps = appCatalogIndexList.items.reduce(
      (agg: IAppCatalogIndexApp[], index: IAppCatalogIndex) => {
        return [...agg, ...Object.values(index.entries)];
      },
      []
    );

    // Filter apps by the search query.
    const appCollection = filterAppCatalogIndexApps(
      debouncedSearchQuery,
      filterAppCatalogIndexAppsBySelectedAppCatalogs(allApps, selectedCatalogs)
    );

    appCollection.sort(compareAppCatalogIndexAppsFns[sortOrder]);

    return appCollection;
  }, [debouncedSearchQuery, selectedCatalogs, sortOrder, appCatalogIndexList]);

  const handleChangeFacets = (value: string, checked: boolean) => {
    dispatchSelectedCatalogs({
      type: checked ? 'selectCatalog' : 'deselectCatalog',
      name: value,
    });
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
        appCatalogIndexList?.errors
      )}
      facetsIsLoading={appCatalogListIsLoading}
      appsIsLoading={appCatalogIndexListIsLoading}
    />
  );
};

export default AppList;
