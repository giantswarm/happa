import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import Button from 'UI/Button';
import CatalogTypeLabel from 'UI/CatalogTypeLabel';

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
          {Object.keys(props.catalogs.items).map(catalogName => {
            return (
              <div
                className='app-catalog--repo'
                key={props.catalogs.items[catalogName].metadata.name}
              >
                <img
                  height='100px'
                  src={props.catalogs.items[catalogName].spec.logoURL}
                  width='100px'
                />

                <div className='app-catalog--description'>
                  <h3>{props.catalogs.items[catalogName].spec.title}</h3>
                  <CatalogTypeLabel
                    catalogType={
                      props.catalogs.items[catalogName].metadata.labels[
                        'application.giantswarm.io/catalog-type'
                      ]
                    }
                  />
                  <ReactMarkdown>
                    {props.catalogs.items[catalogName].spec.description}
                  </ReactMarkdown>
                  <Link
                    className='app-catalog--open-catalog'
                    to={`/app-catalogs/${catalogName}/`}
                  >
                    <Button>Browse Apps</Button>
                  </Link>
                </div>
              </div>
            );
          })}
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
