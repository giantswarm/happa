import yaml from 'js-yaml';
import { compareDates } from 'lib/helpers';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import RoutePath from 'lib/routePath';
import { compare } from 'lib/semver';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import { Constants } from 'shared/constants';
import { AppsRoutes } from 'shared/constants/routes';
import {
  fixTestAppReadmeURLs,
  normalizeAppCatalogIndexURL,
} from 'stores/appcatalog/utils';
import CatalogLabel from 'UI/Display/Apps/AppList/CatalogLabel';
import { IFacetOption } from 'UI/Inputs/Facets';

export interface IAppCatalogIndexAppVersion {
  apiVersion: string;
  appVersion: string;
  version: string;
  created: string;
  digest: string;
  home: string;
  icon: string;
  name: string;
  urls: string[];
  description?: string;
  sources?: string[];
  annotations?: Record<string, string>;
  keywords?: string[];
}

export interface IAppCatalogIndexApp {
  name: string;
  catalogName: string;
  catalogTitle: string;
  catalogIconUrl: string;
  catalogIsManaged: boolean;
  appIconURL: string;
  to: string;
  versions: IAppCatalogIndexAppVersion[];
}

export interface IAppCatalogIndex {
  apiVersion: string;
  entries: Record<string, IAppCatalogIndexApp>;
}

export interface IAppCatalogIndexAppList {
  items: IAppCatalogIndexApp[];
  errors: Record<string, string>;
}

function isAppCatalogVisibleToUsers(
  appCatalog: applicationv1alpha1.IAppCatalog
) {
  return (
    applicationv1alpha1.isAppCatalogPublic(appCatalog) &&
    applicationv1alpha1.isAppCatalogStable(appCatalog)
  );
}

function compareAppCatalogIndexAppsByName(
  a: IAppCatalogIndexApp,
  b: IAppCatalogIndexApp
) {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;

  return 0;
}

function compareAppCatalogIndexAppsByAppCatalog(
  a: IAppCatalogIndexApp,
  b: IAppCatalogIndexApp
) {
  if (a.catalogTitle < b.catalogTitle) return -1;
  if (a.catalogTitle > b.catalogTitle) return 1;

  return 0;
}

function compareAppCatalogIndexAppsByLatest(
  a: IAppCatalogIndexApp,
  b: IAppCatalogIndexApp
) {
  return compareDates(b.versions[0]?.created ?? 0, a.versions[0]?.created ?? 0);
}

/**
 * The comparison functions used for sorting apps,
 * used by the `Sort by` dropdown.
 */
export const compareAppCatalogIndexAppsFns: Record<
  string,
  (a: IAppCatalogIndexApp, b: IAppCatalogIndexApp) => number
> = {
  name: compareAppCatalogIndexAppsByName,
  catalog: compareAppCatalogIndexAppsByAppCatalog,
  latest: compareAppCatalogIndexAppsByLatest,
};

/**
 * Remove the `Giant Swarm` prefix from
 * internal catalogs, to ease cognitive load.
 * @param catalog
 */
export function computeAppCatalogUITitle(
  catalog: applicationv1alpha1.IAppCatalog
): string {
  const prefix = 'Giant Swarm ';

  if (
    !isAppCatalogVisibleToUsers(catalog) &&
    catalog.spec.title.startsWith(prefix)
  ) {
    return catalog.spec.title.slice(prefix.length);
  }

  return catalog.spec.title;
}

/**
 * Sort catalogs in an alphabetical order, but group
 * managed catalogs together at the top.
 * @param a
 * @param b
 */
function compareAppCatalogs(
  a: applicationv1alpha1.IAppCatalog,
  b: applicationv1alpha1.IAppCatalog
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
  appCatalogs: applicationv1alpha1.IAppCatalog[] = [],
  selectedAppCatalogs: Record<string, boolean> = {},
  appCatalogErrors: Record<string, string> = {}
): IFacetOption[] {
  return appCatalogs.sort(compareAppCatalogs).map((appCatalog) => {
    const uiTitle = computeAppCatalogUITitle(appCatalog);

    return {
      value: appCatalog.metadata.name,
      checked: selectedAppCatalogs.hasOwnProperty(appCatalog.metadata.name),
      label: (
        <CatalogLabel
          catalogName={uiTitle}
          iconUrl={appCatalog.spec.logoURL}
          description={appCatalog.spec.description}
          error={appCatalogErrors[appCatalog.metadata.name]}
        />
      ),
    };
  });
}

/**
 * Search through the apps and find one that is in the
 * selected catalogs, and that matches the search query.
 * @param searchQuery
 * @param indexApps
 */
export function filterAppCatalogIndexApps(
  searchQuery: string,
  indexApps: IAppCatalogIndexApp[],
  selectedAppCatalogs: Record<string, boolean>
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return indexApps.filter((indexApp) => {
    if (!selectedAppCatalogs.hasOwnProperty(indexApp.catalogName)) return false;

    if (normalizedQuery.length < 1) return true;

    if (indexApp.versions.length < 1) return false;
    const version = indexApp.versions[0];

    switch (true) {
      case version.name.toLowerCase().includes(normalizedQuery):
      case version.description &&
        version.description.toLowerCase().includes(normalizedQuery):
      case version.keywords &&
        version.keywords.join(',').toLowerCase().includes(normalizedQuery):
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

function compareVersions(
  a: IAppCatalogIndexAppVersion,
  b: IAppCatalogIndexAppVersion
) {
  return compare(b.version, a.version);
}

interface IAppCatalogIndexResponse {
  apiVersion: string;
  entries: Record<string, IAppCatalogIndexAppVersion[]>;
}

/**
 * Fetch the catalog index from the URL saved in the catalog CR.
 * @param fetchFunc
 * @param _auth
 * @param catalog
 */
async function fetchAppCatalogIndex(
  fetchFunc: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  _auth: IOAuth2Provider,
  catalog: applicationv1alpha1.IAppCatalog
): Promise<IAppCatalogIndex> {
  const url = normalizeAppCatalogIndexURL(catalog.spec.storage.URL);

  // Enforce client-side CORS.
  const response = await fetchFunc(url, { mode: 'cors' });
  const responseText = await response.text();
  const catalogIndexResponse = yaml.load(
    responseText
  ) as IAppCatalogIndexResponse;

  const catalogIndex: IAppCatalogIndex = {
    apiVersion: catalogIndexResponse.apiVersion,
    entries: {},
  };

  for (const [appName, versions] of Object.entries(
    catalogIndexResponse.entries
  )) {
    const sortedVersions = versions.sort(compareVersions);

    const version = versions[0]?.version ?? 'n/a';
    const iconURL = versions[0]?.icon ?? '';

    catalogIndex.entries[appName] = {
      catalogName: catalog.metadata.name,
      catalogTitle: computeAppCatalogUITitle(catalog),
      catalogIconUrl: catalog.spec.logoURL ?? '',
      catalogIsManaged: isAppCatalogVisibleToUsers(catalog),
      appIconURL: iconURL,
      name: appName,
      to: makeAppPath(appName, version, catalog.metadata.name),
      versions: sortedVersions,
    };
  }

  return catalogIndex;
}

export async function getAppCatalogsIndexAppList(
  fetchFunc: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  auth: IOAuth2Provider,
  catalogs: applicationv1alpha1.IAppCatalog[]
): Promise<IAppCatalogIndexAppList> {
  const requests = catalogs.map((catalog) =>
    fetchAppCatalogIndex(fetchFunc, auth, catalog)
  );

  const responses = await Promise.allSettled(requests);

  const indexList: IAppCatalogIndexAppList = {
    items: [],
    errors: {},
  };
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];

    if (response.status === 'rejected') {
      const catalogName = catalogs[i].metadata.name;
      indexList.errors[catalogName] = extractErrorMessage(response.reason);
      continue;
    }

    indexList.items.push(...Object.values(response.value.entries));
  }

  return indexList;
}

export function getAppCatalogsIndexAppListKey(
  catalogs?: applicationv1alpha1.IAppCatalog[]
) {
  if (!catalogs) return null;

  return catalogs
    .sort(compareAppCatalogs)
    .map((c) => c.metadata.name)
    .join();
}

export function getAppCatalogIndexAppVersionReadmeURL(
  appVersion?: IAppCatalogIndexAppVersion
): string | undefined {
  return (
    appVersion?.annotations?.[applicationv1alpha1.annotationReadme] ||
    appVersion?.sources?.find((url) => url.endsWith(Constants.README_FILE))
  );
}

/**
 * Retrieve the contents of an application's README.md
 * from a given URL.
 * @param fetchFunc
 * @param _auth
 * @param fromURL
 */
export async function fetchAppCatalogIndexAppVersionReadme(
  fetchFunc: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  _auth: IOAuth2Provider,
  fromURL: string
): Promise<string> {
  const url = fixTestAppReadmeURLs(fromURL);

  // Enforce client-side CORS.
  const response = await fetchFunc(url, { mode: 'cors' });
  const responseText = await response.text();

  return responseText;
}

export function fetchAppCatalogIndexAppVersionReadmeKey(fromURL?: string) {
  return fromURL ?? null;
}
