import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React from 'react';

import CatalogRepo from './CatalogRepo';

const CatalogList = (props) => {
  const catalogs = props.catalogs.items;
  const isAdmin = props.isAdmin;

  const isInternal = (catalog) => {
    const labels = catalog.metadata.labels;
    const catalogType = labels['application.giantswarm.io/catalog-type'];
    const catalogVisibility =
      labels['application.giantswarm.io/catalog-visibility'];

    return catalogType === 'internal' || catalogVisibility === 'internal';
  };

  // Admins can see all catalogs.
  // Non admins can only see non internal catalogs.
  const filterFunc = (catalog) => {
    if (isAdmin) {
      return true;
    }

    return !isInternal(catalog);
  };

  // Group internal catalogs together, but sort the groups alphabetically.
  // This makes internal catalogs appear at the bottom, and normal catalogs
  // appear at the top. And within those groups the catalogs are alphabetically
  // sorted.
  const sortFunc = (a, b) => {
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

  return (
    <DocumentTitle title='App Catalogs'>
      <>
        <h1>App Catalogs</h1>
        <p>Pick an App Catalog to browse all the Apps in it.</p>
        {Object.keys(props.catalogs.items).length === 0 ? (
          <p className='well'>
            <b>Could not find any appcatalogs:</b>
            <br />
            It appears we haven&apos;t configured the <code>
              appcatalog
            </code>{' '}
            resources yet for your installation. Please come back later!
          </p>
        ) : (
          <div className='app-catalog--repos'>
            {Object.values(catalogs)
              .filter(filterFunc)
              .sort(sortFunc)
              .map((catalog) => (
                <CatalogRepo key={catalog.metadata.name} catalog={catalog} />
              ))}
          </div>
        )}
      </>
    </DocumentTitle>
  );
};

CatalogList.propTypes = {
  isAdmin: PropTypes.bool,
  catalogs: PropTypes.object,
};

export default CatalogList;
