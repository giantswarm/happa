import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';

class Catalogs extends React.Component {
  render() {
    return (
      <DocumentTitle title={`App Catalogs | Giant Swarm `}>
        <React.Fragment>
          <h1>App Catalogs</h1>
          <p>Pick an App Catalog to browse all the Apps in it.</p>
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
                      to={'/app-catalogs/' + catalogName + '/'}
                    >
                      <div className='app-catalog--card'>
                        <img
                          src={
                            this.props.catalogs.items[catalogName].spec.logoURL
                          }
                        />
                      </div>
                      <div className='app-catalog--description'>
                        <h3>
                          {this.props.catalogs.items[catalogName].spec.title}
                          {this.props.catalogs.items[catalogName]
                            .isFetchingIndex ? (
                            <img
                              className='loader'
                              src='/images/loader_oval_light.svg'
                            />
                          ) : (
                            undefined
                          )}
                        </h3>
                        <ReactMarkdown>
                          {
                            this.props.catalogs.items[catalogName].spec
                              .description
                          }
                        </ReactMarkdown>
                      </div>
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
