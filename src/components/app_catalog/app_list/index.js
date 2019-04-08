'use strict';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { replace } from 'connected-react-router';
import Button from '../../shared/button';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

class AppList extends React.Component {
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

  // filter returns a filter object based on the current state
  filter() {
    return {
      filters: this.state.filters,
      searchQuery: this.state.searchQuery,
    };
  }

  // apps is a pure function that takes a filter and all the catalogs and returns
  // a filtered set of apps
  apps(catalogs, filter) {
    var filterRepoMapping = {
      Managed: 'giantswarm/stable',
      Incubator: 'giantswarm/incubator',
      Community: 'helm/stable',
    };

    // Take the friendly named filters and turn them into an array of repo names.
    // For example: Takes ['Managed', 'Community'] and turns it into ['giantswarm/stable', 'helm/stable'];
    var repoFilters = filter.filters.map(filter => {
      return filterRepoMapping[filter];
    });

    let allApps = [];

    // Flatten all the apps we know about into a single array.
    // And add the repoName so we know what repo an app belongs to.
    for (var id in catalogs) {
      if (catalogs.hasOwnProperty(id)) {
        let apps = Array.from(Object.entries(catalogs[id].apps));
        apps = apps.map(([key, app]) => {
          app.repoName = id;
          app.name = app[0].name;
          app.version = app[0].version;
          app.icon = app[0].icon;
          app.detailUrl =
            '/app-katalog/' +
            app.repoName.replace('/', '%2F') +
            '/' +
            key +
            '/';
          return app;
        });
        allApps.push(...apps);
      }
    }

    let apps = [];

    // Managed / Incubator / Community filter.
    if (filter.filters.length === 0) {
      apps = allApps;
    } else {
      apps = allApps.filter(app => {
        return repoFilters.includes(app.repoName);
      });
    }

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

  updateSearchQuery(e) {
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
  }

  resetFilters() {
    this.setState({
      filters: [],
      searchQuery: '',
    });
  }

  imgError(app) {
    var iconErrors = {};
    iconErrors[app.icon] = true;

    this.setState({
      iconErrors: Object.assign({}, this.state.iconErrors, iconErrors),
    });
  }

  render() {
    return (
      <DocumentTitle title={'App Katalog | Giant Swarm '}>
        <React.Fragment>
          <h1>
            App Katalog: Managed
            <form>
              <div className='input-with-icon'>
                <i className='fa fa-search' />
                <input
                  type='text'
                  onChange={this.updateSearchQuery.bind(this)}
                  value={this.state.searchQuery}
                />
              </div>
            </form>
          </h1>
          <div className='app-catalog-overview'>
            <div className='apps'>
              {(() => {
                var apps = this.apps(this.props.catalogs.items, this.filter());
                if (apps.length === 0) {
                  return (
                    <div className='emptystate'>
                      No apps matched your search query
                      <br />
                      <Button onClick={this.resetFilters.bind(this)}>
                        Clear search query and filters
                      </Button>
                    </div>
                  );
                } else {
                  return apps.map(app => {
                    return (
                      <Link
                        className='app'
                        key={app.repoName + '/' + app.name}
                        to={app.detailUrl}
                      >
                        {app.repoName === 'managed' ? (
                          <div className='badge'>MANAGED</div>
                        ) : (
                          undefined
                        )}

                        <div className='app-icon'>
                          {app.icon && !this.state.iconErrors[app.icon] ? (
                            <img
                              src={app.icon}
                              onError={this.imgError.bind(this, app)}
                            />
                          ) : (
                            <h3>{app.name}</h3>
                          )}
                        </div>
                        <div className='app-details'>
                          <span className='app-version'>{app.version}</span>
                          <h3>{app.name}</h3>
                          <span className='app-repo'>{app.repoName}</span>
                        </div>
                      </Link>
                    );
                  });
                }
              })()}
              <div className='app-flex-fix' />
              <div className='app-flex-fix' />
              <div className='app-flex-fix' />
              <div className='app-flex-fix' />
            </div>
          </div>
        </React.Fragment>
      </DocumentTitle>
    );
  }
}

AppList.propTypes = {
  catalogs: PropTypes.object,
  clusterId: PropTypes.string,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  loading: PropTypes.bool,
  match: PropTypes.object,
  organizationId: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    catalogs: state.entities.catalogs,
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
