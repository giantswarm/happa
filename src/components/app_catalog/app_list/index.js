'use strict';

import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { replace } from 'connected-react-router';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

class AppList extends React.Component {
  // Contains refs to all the app-container divs in dom so that we can
  // scroll to them if needed.
  appRefs = {};

  constructor(props) {
    super();

    let query = new URLSearchParams(props.location.search);
    let q = query.get('q');

    this.state = {
      filters: [],
      searchQuery: q || '',
      iconErrors: {},
    };
  }

  componentDidMount() {
    // The hash value of the url is used by the app detail screen's back button
    // to indicate what app we should scroll to.
    var scrolToApp = this.props.location.hash.substring(1);
    window.scrollTo(0, this.appRefs[scrolToApp].offsetTop - 150);
  }

  // filter returns a filter object based on the current state
  filter() {
    return {
      filters: this.state.filters,
      searchQuery: this.state.searchQuery,
    };
  }

  // filterApps is a pure function that takes a filter a list of all apps and returns
  // a filtered set of apps
  filterApps(allApps, filter) {
    let apps = Array.from(Object.entries(allApps));
    apps = apps.map(([, app]) => {
      app.name = app[0].name;
      app.version = app[0].version;
      app.icon = app[0].icon;
      return app;
    });

    // Search query filter.
    if (filter.searchQuery === '') {
      return apps;
    } else {
      return apps.filter(app => {
        return (
          app.name.toUpperCase().indexOf(filter.searchQuery.toUpperCase()) > -1
        );
      });
    }
  }

  updateSearchQuery = e => {
    this.setState({
      searchQuery: e.target.value,
    });

    this.props.dispatch(
      replace({
        search:
          '?' +
          new URLSearchParams({
            q: e.target.value,
          }).toString(),
      })
    );
  };

  resetFilters = () => {
    this.setState({
      filters: [],
      searchQuery: '',
    });
  };

  imgError = e => {
    let imageUrl = e.target.src;
    var iconErrors = {};
    iconErrors[imageUrl] = true;

    this.setState({
      iconErrors: Object.assign({}, this.state.iconErrors, iconErrors),
    });
  };

  render() {
    return (
      <Breadcrumb
        data={{
          title: this.props.catalog.metadata.name.toUpperCase(),
          pathname: this.props.match.url,
        }}
      >
        <DocumentTitle title={'App Katalog | Giant Swarm '}>
          <React.Fragment>
            <Link to={'/app-katalog/'}>
              <i className='fa fa-chevron-left' aria-hidden='true' />
              Back to all catalogs
            </Link>
            <br />
            <br />
            <h1>
              App Katalog: {this.props.catalog.spec.title}
              <form>
                <div className='input-with-icon'>
                  <i className='fa fa-search' />
                  <input
                    type='text'
                    onChange={this.updateSearchQuery}
                    value={this.state.searchQuery}
                  />
                  {this.state.searchQuery !== '' ? (
                    <a className='clearQuery' onClick={this.resetFilters}>
                      <i className='fa fa-close' />
                    </a>
                  ) : (
                    undefined
                  )}
                </div>
              </form>
            </h1>
            <div className='app-catalog-overview'>
              <div className='apps'>
                {(() => {
                  var apps = this.filterApps(
                    this.props.catalog.apps,
                    this.filter()
                  );
                  if (apps.length === 0) {
                    return (
                      <div className='emptystate'>
                        No apps matched your search query: &quot;
                        {this.state.searchQuery}&quot;
                      </div>
                    );
                  } else {
                    return (
                      <React.Fragment>
                        {apps.map(app => {
                          return (
                            <div
                              className='app-container'
                              key={app.repoName + '/' + app.name}
                              ref={ref => (this.appRefs[app.name] = ref)}
                            >
                              <Link
                                className='app'
                                to={
                                  '/app-katalog/' +
                                  this.props.catalog.metadata.name +
                                  '/' +
                                  app.name +
                                  '?q=' +
                                  this.state.searchQuery
                                }
                              >
                                {app.repoName === 'managed' ? (
                                  <div className='badge'>MANAGED</div>
                                ) : (
                                  undefined
                                )}

                                <div className='app-icon'>
                                  {app.icon &&
                                  !this.state.iconErrors[app.icon] ? (
                                    <img
                                      src={app.icon}
                                      onError={this.imgError}
                                    />
                                  ) : (
                                    <h3>{app.name}</h3>
                                  )}
                                </div>
                                <div className='app-details'>
                                  <h3>{app.name}</h3>
                                  <span className='app-version'>
                                    {app.version}
                                  </span>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                        <div className='app-flex-fix' />
                        <div className='app-flex-fix' />
                        <div className='app-flex-fix' />
                        <div className='app-flex-fix' />
                      </React.Fragment>
                    );
                  }
                })()}
              </div>
            </div>
          </React.Fragment>
        </DocumentTitle>
      </Breadcrumb>
    );
  }
}

AppList.propTypes = {
  catalog: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  loading: PropTypes.bool,
  match: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  return {
    catalog: state.entities.catalogs.items[ownProps.match.params.repo],
    loading: state.entities.catalogs.isFetching,
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
)(AppList);
