import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React from 'react';

import CatalogRepo from './CatalogRepo';

const CatalogList = (props) => {
  const catalogs = props.catalogs.items;
  const isAdmin = props.isAdmin;

  const filterFunc = (catalog) => {
    if (isAdmin) {
      return true;
    }

    const labels = catalog.metadata.labels;
    const catalogType = labels['application.giantswarm.io/catalog-type'];

    return catalogType !== 'internal';
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
              .map((catalog) => (
                <CatalogRepo
                  key={catalog.metadata.name}
                  catalog={catalog}
                  catalogLoadIndex={props.catalogLoadIndex}
                />
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
  adminCatalogs: PropTypes.object,
  catalogLoadIndex: PropTypes.func,
  match: PropTypes.object,
};

export default CatalogList;
