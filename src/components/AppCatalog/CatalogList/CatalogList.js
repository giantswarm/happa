import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React from 'react';

import CatalogRepo from './CatalogRepo';

const CatalogList = props => (
  <DocumentTitle title='App Catalogs'>
    <>
      <h1>App Catalogs</h1>
      <p>Pick an App Catalog to browse all the Apps in it.</p>
      {Object.keys(props.catalogs.items).length === 0 ? (
        <p className='well'>
          <b>Could not find any appcatalogs:</b>
          <br />
          It appears we haven&apos;t configured the <code>appcatalog</code>{' '}
          resources yet for your installation. Please come back later!
        </p>
      ) : (
        <div className='app-catalog--repos'>
          {Object.values(props.catalogs.items).map(catalog => (
            <CatalogRepo key={catalog.metadata.name} catalog={catalog} />
          ))}
        </div>
      )}
    </>
  </DocumentTitle>
);

CatalogList.propTypes = {
  catalogs: PropTypes.object,
  match: PropTypes.object,
};

export default CatalogList;
