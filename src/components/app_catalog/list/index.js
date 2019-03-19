'use strict';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { replace } from 'connected-react-router';
import Button from '../../shared/button';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

class List extends React.Component {
  fetching = {};

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

  classNameFor(filter) {
    if (this.state.filters.indexOf(filter) > -1) {
      return 'selected';
    }
  }

  toggleFilter(filter) {
    var activeFilters = this.state.filters;
    var filterIndex = activeFilters.indexOf(filter);
    if (filterIndex === -1) {
      activeFilters.push(filter);
    } else {
      activeFilters.splice(filterIndex, 1);
    }

    this.setState({
      activeFilters: activeFilters,
    });
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
            this.props.match.url +
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
            repo: this.state.selectedRepo,
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
            App Katalog (Preview)
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
            <div className='repo-selection'>
              <h4>Filter</h4>
              <ul>
                {['Managed', 'Incubator', 'Community'].map(filter => {
                  return (
                    <li className={this.classNameFor(filter)} key={filter}>
                      <a onClick={this.toggleFilter.bind(this, filter)}>
                        {filter}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className='apps'>
              {(() => {
                var apps = this.apps(this.props.catalogs.items, this.filter());
                if (apps.length === 0) {
                  return (
                    <div className='emptystate'>
                      No apps matched your search query and filter combination.
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
                        {app.repoName === 'giantswarm/stable' ? (
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

List.propTypes = {
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
)(List);
