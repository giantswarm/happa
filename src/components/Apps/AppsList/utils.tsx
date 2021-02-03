import React from 'react';
import { IAppCatalogsState } from 'stores/appcatalog/types';
import CatalogLabel from 'UI/Display/Apps/AppList/CatalogLabel';
import { IFacetOption } from 'UI/Inputs/Facets';

// Determines if a catalog is an internal catalog or not.
// We changed the location of this information at some point, so happa currently
// supports both. TODO: Check if there are any catalogs left with the old label
// if not, simplify this code.
const isInternal = (catalog: IAppCatalog): boolean => {
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
  [, a]: [string, IAppCatalog],
  [, b]: [string, IAppCatalog]
) => {
  const aIsInternal = isInternal(a);
  const aTitle = a.spec.title;

  const bIsInternal = isInternal(b);
  const bTitle = b.spec.title;

  if (aIsInternal && !bIsInternal) {
    return 1;
  } else if (!aIsInternal && bIsInternal) {
    return -1;
  }
  if (aTitle < bTitle) {
    return -1;
  } else if (aTitle > bTitle) {
    return 1;
  }

  return 0;
};

export function catalogsToFacets(
  catalogs: IAppCatalogsState,
  catalogErrors: { [key: string]: string },
  isAdmin: boolean
): IFacetOption[] {
  return Object.entries(catalogs.items)
    .filter(filterFunc(isAdmin))
    .sort(sortFunc)
    .map(([key, catalog]) => {
      return {
        value: key,
        checked: catalogs.ui.selectedCatalogs[key],
        label: (
          <CatalogLabel
            catalogName={catalog.spec.title}
            iconUrl={catalog.spec.logoURL}
            error={catalogErrors[catalog.metadata.name]}
          />
        ),
      };
    });
}
