import { IHttpClient } from 'model/clients/HttpClient';
import { AppsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import { fixTestAppReadmeURLs } from 'model/stores/appcatalog/utils';
import React from 'react';
import AppsList from 'UI/Display/Apps/AppList/AppsListPage';
import CatalogLabel from 'UI/Display/Apps/AppList/CatalogLabel';
import { IFacetOption } from 'UI/Inputs/Facets';
import { compareDates } from 'utils/helpers';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import RoutePath from 'utils/routePath';

import { computeAppCatalogUITitle, isAppCatalogVisibleToUsers } from '../utils';

function compareAppCatalogEntriesByName(
  a: applicationv1alpha1.IAppCatalogEntry,
  b: applicationv1alpha1.IAppCatalogEntry
) {
  if (a.spec.appName < b.spec.appName) return -1;
  if (a.spec.appName > b.spec.appName) return 1;

  return 0;
}

function compareAppCatalogEntriesByAppCatalog(
  a: applicationv1alpha1.IAppCatalogEntry,
  b: applicationv1alpha1.IAppCatalogEntry
) {
  if (a.spec.catalog.name < b.spec.catalog.name) return -1;
  if (a.spec.catalog.name > b.spec.catalog.name) return 1;

  return 0;
}

function compareAppCatalogEntriesByLatest(
  a: applicationv1alpha1.IAppCatalogEntry,
  b: applicationv1alpha1.IAppCatalogEntry
) {
  return compareDates(b.spec.dateCreated ?? 0, a.spec.dateCreated ?? 0);
}

/**
 * The comparison functions used for sorting apps,
 * used by the `Sort by` dropdown.
 */
export const compareAppCatalogEntriesFns: Record<
  string,
  (
    a: applicationv1alpha1.IAppCatalogEntry,
    b: applicationv1alpha1.IAppCatalogEntry
  ) => number
> = {
  name: compareAppCatalogEntriesByName,
  catalog: compareAppCatalogEntriesByAppCatalog,
  latest: compareAppCatalogEntriesByLatest,
};

/**
 * Sort catalogs in an alphabetical order, but group
 * managed catalogs together at the top.
 * @param a
 * @param b
 */
function compareAppCatalogs(
  a: applicationv1alpha1.ICatalog,
  b: applicationv1alpha1.ICatalog
) {
  const aIsVisible = isAppCatalogVisibleToUsers(a);
  const bIsVisible = isAppCatalogVisibleToUsers(b);

  if (aIsVisible && !bIsVisible) {
    return -1;
  } else if (!aIsVisible && bIsVisible) {
    return 1;
  }

  const aTitle = computeAppCatalogUITitle(a);
  const bTitle = computeAppCatalogUITitle(b);

  if (aTitle < bTitle) {
    return -1;
  } else if (aTitle > bTitle) {
    return 1;
  }

  return 0;
}

/**
 * Transform the app catalogs data structures into
 * ones that can be used by the catalog sidebar.
 * @param appCatalogs
 * @param selectedAppCatalogs - The catalogs that are currently enabled in the sidebar.
 * @param appCatalogErrors - Errors that occured during loading each catalog.
 */
export function mapAppCatalogsToFacets(
  appCatalogs: applicationv1alpha1.ICatalog[] = [],
  selectedAppCatalogs: Record<string, boolean> = {},
  error: string = ''
): IFacetOption[] {
  const sortedAppCatalogs = appCatalogs.sort(compareAppCatalogs);

  const facetOptions: IFacetOption[] = [];
  for (const appCatalog of sortedAppCatalogs) {
    // TODO(axbarsan): Remove this once https://github.com/giantswarm/giantswarm/issues/17490 is done.
    if (appCatalog.metadata.name === 'helm-stable') continue;

    const uiTitle = computeAppCatalogUITitle(appCatalog);

    facetOptions.push({
      value: appCatalog.metadata.name,
      checked: selectedAppCatalogs.hasOwnProperty(appCatalog.metadata.name),
      label: (
        <CatalogLabel
          catalogName={uiTitle}
          iconUrl={appCatalog.spec.logoURL}
          description={appCatalog.spec.description}
          error={error}
        />
      ),
    });
  }

  return facetOptions;
}

/**
 * Search through the apps and find one that is in the
 * selected catalogs, and that matches the search query.
 * @param searchQuery
 * @param appCatalogEntries
 * @param selectedAppCatalogs
 */
export function filterAppCatalogEntries(
  searchQuery: string,
  appCatalogEntries: applicationv1alpha1.IAppCatalogEntry[],
  selectedAppCatalogs: Record<string, boolean>
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return appCatalogEntries.filter((appCatalogEntry) => {
    if (!selectedAppCatalogs.hasOwnProperty(appCatalogEntry.spec.catalog.name))
      return false;

    if (normalizedQuery.length < 1) return true;

    switch (true) {
      case appCatalogEntry.spec.appName.toLowerCase().includes(normalizedQuery):
      case appCatalogEntry.spec.chart.description
        ?.toLowerCase()
        .includes(normalizedQuery):
      case appCatalogEntry.spec.chart.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(normalizedQuery)
      ):
        return true;

      default:
        return false;
    }
  });
}

function makeAppPath(
  name: string,
  version: string,
  catalogName: string
): string {
  return RoutePath.createUsablePath(AppsRoutes.AppDetail, {
    app: name,
    catalogName,
    version,
  });
}

/**
 * Retrieve the contents of an application's README.md
 * from a given URL.
 * @param client
 * @param _auth
 * @param fromURL
 */
export async function fetchAppCatalogEntryReadme(
  client: IHttpClient,
  _auth: IOAuth2Provider,
  fromURL: string
): Promise<string> {
  const url = fixTestAppReadmeURLs(fromURL);

  client.setRequestConfig({
    forceCORS: true,
    url,
    headers: {},
  });

  const response = await client.execute<string>();

  return response.data;
}

export function fetchAppCatalogEntryReadmeKey(fromURL?: string) {
  return fromURL ?? null;
}

type AppPageApps = React.ComponentPropsWithoutRef<typeof AppsList>['apps'];

export function mapAppCatalogEntriesToAppPageApps(
  appCatalogEntries: applicationv1alpha1.IAppCatalogEntry[],
  appsForClusters:
    | Record<string, { appName: string; catalogName: string }[]>
    | undefined,
  selectedCluster: capiv1beta1.ICluster | undefined,
  catalogs: applicationv1alpha1.ICatalog[] = []
): AppPageApps {
  const appCatalogs = catalogs.reduce<
    Record<string, applicationv1alpha1.ICatalog>
  >((acc, catalog) => {
    acc[catalog.metadata.name] = catalog;

    return acc;
  }, {});

  return appCatalogEntries.map((appCatalogEntry) => {
    const catalog = appCatalogs[appCatalogEntry.spec.catalog.name];
    const appName = appCatalogEntry.spec.appName;

    const selectedClusterWithOrg = `${selectedCluster?.metadata.namespace}/${selectedCluster?.metadata.name}`;
    const isInstalledInSelectedCluster = appsForClusters
      ? appsForClusters[selectedClusterWithOrg]?.some((entry) => {
          return (
            entry.appName === appName &&
            entry.catalogName === catalog.metadata.name
          );
        })
      : false;

    return {
      catalogTitle: catalog ? computeAppCatalogUITitle(catalog) : '',
      catalogIconUrl: catalog?.spec.logoURL ?? '',
      catalogIsManaged: catalog ? isAppCatalogVisibleToUsers(catalog) : false,
      appIconURL: appCatalogEntry.spec.chart.icon,
      name: appName,
      to: makeAppPath(
        appName,
        appCatalogEntry.spec.version,
        appCatalogEntry.spec.catalog.name
      ),
      isInstalledInSelectedCluster,
    };
  });
}
