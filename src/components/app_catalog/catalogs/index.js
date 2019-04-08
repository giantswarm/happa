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
            charts from helm repositories.
          </p>
          <p>
            <b>Preview Limitations:</b>
            <br />
            During the preview you&apos;ll only be able to browse the App
            Katalog. Installing charts is not yet available.
          </p>

          <br />
          <small>Pick a repository:</small>
          <div className='app-catalog--repos'>
            {Object.keys(this.props.catalogs.items).map(catalogName => {
              return (
                <Link
                  key={this.props.catalogs.items[catalogName].name}
                  to={'/app-katalog/' + catalogName + '/'}
                  className='app-catalog--repo'
                >
                  <div className='app-catalog--card'>
                    <h3>{this.props.catalogs.items[catalogName].title}</h3>
                    <img src={this.props.catalogs.items[catalogName].logoUrl} />
                  </div>
                  <p>{this.props.catalogs.items[catalogName].description}</p>
                </Link>
              );
            })}
          </div>
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
