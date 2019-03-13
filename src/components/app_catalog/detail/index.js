'use strict';

import { Breadcrumb } from 'react-breadcrumbs';
import Button from '../../shared/button';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

class AppDetail extends React.Component {
  state = {};

  constructor() {
    super();
  }

  render() {
    return (
      <DocumentTitle title={`${this.props.appVersions[0].name} | Giant Swarm `}>
        <Breadcrumb
          data={{
            title: this.props.appVersions[0].name,
            pathname: this.props.match.url,
          }}
        >
          <div className='app-detail'>
            <Link to='/app-katalog/'>
              <i className='fa fa-chevron-left' aria-hidden='true' />
              Back to the App Katalog
            </Link>

            <br />
            <br />
            <div className='app-detail--header clearfix'>
              <div className='app-detail--icon'>
                <img src={this.props.appVersions[0].icon} />
              </div>

              <div className='app-detail--title'>
                <h2>{this.props.appVersions[0].name}</h2>
                <div className='keywords'>
                  {this.props.appVersions[0].keywords
                    ? this.props.appVersions[0].keywords.map(x => (
                        <span key={x} className='keyword'>
                          {x}
                        </span>
                      ))
                    : ''}
                </div>

                <div className='version'>
                  <small>Chart Version</small>{' '}
                  <code>{this.props.appVersions[0].version}</code>
                  <small>App Version</small>{' '}
                  <code>{this.props.appVersions[0].appVersion}</code>
                </div>
              </div>

              <div className='app-detail--install'>
                <Button disabled>Install</Button>
                <small>Coming soon</small>
              </div>
            </div>

            <div className='app-detail--body'>
              {this.props.appVersions[0].description &&
              this.props.appVersions[0].description != '' ? (
                <React.Fragment>
                  <small>Description</small>
                  <p>{this.props.appVersions[0].description}</p>
                </React.Fragment>
              ) : (
                ''
              )}

              {this.props.appVersions[0].home &&
              this.props.appVersions[0].home != '' ? (
                <React.Fragment>
                  <small>Home</small>
                  <p>
                    <code>
                      <a
                        href={this.props.appVersions[0].home}
                        rel='noopener noreferrer'
                      >
                        {this.props.appVersions[0].home}
                      </a>
                    </code>
                  </p>
                </React.Fragment>
              ) : (
                ''
              )}

              {this.props.appVersions[0].sources ? (
                <React.Fragment>
                  <small>Sources</small>
                  <ul>
                    {this.props.appVersions[0].sources.map(source => (
                      <li key={source} className='source'>
                        <code>
                          <a href={source} rel='noopener noreferrer'>
                            {source}
                          </a>
                        </code>
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              ) : (
                ''
              )}

              {this.props.appVersions[0].urls ? (
                <React.Fragment>
                  <small>URLS</small>
                  <ul>
                    {this.props.appVersions[0].urls.map(url => (
                      <li key={url} className='source'>
                        <code>
                          <a href={url} rel='noopener noreferrer'>
                            {url}
                          </a>
                        </code>
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              ) : (
                ''
              )}
            </div>
          </div>
        </Breadcrumb>
      </DocumentTitle>
    );
  }
}

AppDetail.propTypes = {
  appVersions: PropTypes.array,
  match: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  var repo = decodeURIComponent(ownProps.match.params.repo);
  var appName = decodeURIComponent(ownProps.match.params.app);

  var appVersions = [];
  if (
    state.entities.catalogs.items[repo] &&
    state.entities.catalogs.items[repo].apps[appName]
  ) {
    appVersions = state.entities.catalogs.items[repo].apps[appName];
  }

  return {
    loading: state.entities.catalogs.isFetching,
    appVersions,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppDetail);
