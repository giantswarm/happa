'use strict';

import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

class Catalogs extends React.Component {
  render() {
    return (
      <DocumentTitle title={`App Katalog | Giant Swarm `}>
        <React.Fragment>
          <h1>App Katalog</h1>
          <p>
            The App Katalog provides you with an easy way to browse and install
            apps.
          </p>
          <br />
          {Object.keys(this.props.catalogs.items).length === 0 ? (
            <p className='well'>
              <b>Could not find any appcatalogs:</b>
              <br />
              It appears we haven&apos;t configured the <code>
                appcatalog
              </code>{' '}
              resources yet for your installation. Please come back later!
            </p>
          ) : (
            <React.Fragment>
              <small>Pick a catalog:</small>
              <div className='app-catalog--repos'>
                {Object.keys(this.props.catalogs.items).map(catalogName => {
                  return (
                    <Link
                      key={this.props.catalogs.items[catalogName].metadata.name}
                      to={'/app-katalog/' + catalogName + '/'}
                      className='app-catalog--repo'
                    >
                      <div className='app-catalog--card'>
                        <h3>
                          {this.props.catalogs.items[catalogName].spec.title}
                        </h3>
                        <img
                          src={
                            this.props.catalogs.items[catalogName].spec.logoURL
                          }
                        />
                      </div>
                      <p>
                        {
                          this.props.catalogs.items[catalogName].spec
                            .description
                        }
                      </p>
                    </Link>
                  );
                })}
              </div>
            </React.Fragment>
          )}
          <p className='well'>
            <b>Preview Limitations:</b>
            <br />
            During the preview you&apos;ll only be able to browse the App
            Katalog. Installing apps is coming soon!
          </p>
        </React.Fragment>
      </DocumentTitle>
    );
  }
}

Catalogs.propTypes = {
  catalogs: PropTypes.object,
  match: PropTypes.object,
};

export default Catalogs;
