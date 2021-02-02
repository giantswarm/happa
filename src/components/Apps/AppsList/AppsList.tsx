import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { IAppCatalogsState } from 'stores/appcatalog/types';
import { getUserIsAdmin } from 'stores/main/selectors';
import { IState } from 'stores/state';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';
import { IFacetOption } from 'UI/Inputs/Facets';

interface IStateProps {
  catalogs: IAppCatalogsState;
  isAdmin: boolean;
}

interface IAppsListProps extends IStateProps {}

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
const filterFunc = (isAdmin: boolean) => {
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

function catalogsToFacets(
  catalogs: IAppCatalogsState,
  isAdmin: boolean
): IFacetOption[] {
  return Object.entries(catalogs.items)
    .filter(filterFunc(isAdmin))
    .sort(sortFunc)
    .map(([key, catalog]) => {
      return {
        value: key,
        checked: true,
        label: <>{catalog.spec.title}</>,
      };
    });
}

const AppsList: React.FC<IAppsListProps> = (props) => {
  return (
    <AppsListPage
      matchCount={0}
      onChangeFacets={(value, checked) => {
        console.log(value, checked);
      }}
      apps={[]}
      facetOptions={catalogsToFacets(props.catalogs, props.isAdmin)}
    />
  );
};

function mapStateToProps(state: IState) {
  return {
    catalogs: state.entities.catalogs,
    isAdmin: getUserIsAdmin(state),
  };
}

AppsList.propTypes = {
  catalogs: (PropTypes.object as PropTypes.Requireable<IAppCatalogsState>)
    .isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(AppsList);
