import { IAppCatalogsState } from 'model/stores/appcatalog/types';
import React from 'react';
import CatalogLabel from 'UI/Display/Apps/AppList/CatalogLabel';
import { IFacetOption } from 'UI/Inputs/Facets';

// Determines if a catalog is an internal catalog or not.
// We changed the location of this information at some point, so happa currently
// supports both.
export const isInternal = (catalog: IAppCatalog): boolean => {
  const labels = catalog.metadata.labels;

  if (labels) {
    const catalogType = labels['application.giantswarm.io/catalog-type'];
    const catalogVisibility =
      labels['application.giantswarm.io/catalog-visibility'];

    return catalogType === 'internal' || catalogVisibility === 'internal';
  }

  return false;
};

// Admins can see all catalogs.
// Non admins can only see non internal catalogs.
export const filterFunc = (isAdmin: boolean) => {
  return ([_, catalog]: [string, IAppCatalog]) => {
    if (isAdmin) {
      return true;
    }

    return !isInternal(catalog);
  };
};

// Group internal catalogs together, but sort the groups alphabetically.
// This makes internal catalogs appear at the bottom, and normal catalogs
// appear at the top. And within those groups the catalogs are alphabetically
// sorted.
const sortFunc = (
  [, , a]: [string, IAppCatalog, string],
  [, , b]: [string, IAppCatalog, string]
) => {
  const aTitle = a;
  const bTitle = b;

  if (aTitle < bTitle) {
    return -1;
  } else if (aTitle > bTitle) {
    return 1;
  }

  return 0;
};

function computeShortTitle([key, catalog]: [string, IAppCatalog]): [
  key: string,
  catalog: IAppCatalog,
  shortTitle: string
] {
  let shortTitle = catalog.spec.title;

  if (isInternal(catalog) && catalog.spec.title.startsWith('Giant Swarm ')) {
    shortTitle = catalog.spec.title.replace('Giant Swarm ', '');
  }

  return [key, catalog, shortTitle];
}

export function catalogsToFacets(
  catalogs: IAppCatalogsState,
  catalogErrors: { [key: string]: string },
  isAdmin: boolean
): IFacetOption[] {
  return Object.entries(catalogs.items)
    .filter(filterFunc(isAdmin))
    .map(computeShortTitle)
    .sort(sortFunc)
    .map(([key, catalog, shortTitle]) => {
      return {
        value: key,
        checked: catalogs.ui.selectedCatalogs[key],
        label: (
          <CatalogLabel
            catalogName={shortTitle}
            iconUrl={catalog.spec.logoURL}
            description={catalog.spec.description}
            error={catalogErrors[catalog.metadata.name]}
          />
        ),
      };
    });
}

export const searchApps = (searchQuery: string, allApps: IAppCatalogApp[]) => {
  const fieldsToCheck: string[] = ['name', 'description', 'keywords'];
  const trimmedSearchQuery = searchQuery.trim().toLowerCase();

  let filteredApps = [];

  if (trimmedSearchQuery === '') return allApps;

  filteredApps = allApps.filter((app) => {
    // Go through all the app versions
    return app.versions.some((appVersion) => {
      // Check if any of the checked fields include the search query
      return fieldsToCheck.some((field) => {
        let appVersionsField = appVersion[field as keyof IAppCatalogAppVersion];

        appVersionsField = appVersionsField ? String(appVersionsField) : '';

        const appVersionsFieldValue = appVersionsField.toLowerCase();

        return appVersionsFieldValue.includes(trimmedSearchQuery);
      });
    });
  });

  return filteredApps;
};
