import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

class Catalogs extends React.Component {
  render() {
    return (
      <DocumentTitle title={`Apps | Giant Swarm `}>
        <React.Fragment>
          <h1>Apps</h1>
          <p>
            Browse and deploy apps from various sources, including managed apps
            covered by SLAs from Giant Swarm.
          </p>
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
              <div className='app-catalog--repos'>
                {Object.keys(this.props.catalogs.items).map(catalogName => {
                  return (
                    <Link
                      className='app-catalog--repo'
                      key={this.props.catalogs.items[catalogName].metadata.name}
                      to={'/apps/' + catalogName + '/'}
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
