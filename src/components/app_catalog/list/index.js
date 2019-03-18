'use strict';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { replace } from 'connected-react-router';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

class List extends React.Component {
  fetching = {};

  constructor(props) {
    super();

    let query = new URLSearchParams(props.location.search);
    let q = query.get('q');
    let selectedRepo = query.get('repo');

    this.state = {
      selectedRepo: selectedRepo || 'All',
      searchQuery: q || '',
      iconErrors: {},
    };
  }

  classNameFor(repo) {
    if (repo === this.state.selectedRepo) {
      return 'selected';
    }
  }

  selectRepo(repo) {
    this.setState({
      selectedRepo: repo,
    });

    this.props.dispatch(
      replace({
        search:
          '?' +
          new URLSearchParams({
            repo: repo,
            q: this.state.searchQuery,
          }).toString(),
      })
    );
  }

  // filter returns a filter object based on the current state
  filter() {
    return {
      repo: this.state.selectedRepo,
      searchQuery: this.state.searchQuery,
    };
  }

  // apps is a pure function that takes a filter and all the catalogs and returns
  // a filtered set of apps
  apps(catalogs, filter) {
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

    if (filter.repo === 'All') {
      apps = allApps;
    } else {
      apps = allApps.filter(app => {
        return app.repoName === filter.repo;
      });
    }

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
              <h4>Repository</h4>
              <ul>
                <li className={this.classNameFor('All')}>
                  <a onClick={this.selectRepo.bind(this, 'All')}>All</a>
                </li>
                {Object.getOwnPropertyNames(this.props.catalogs.items).map(
                  catalogName => {
                    return (
                      <li
                        className={this.classNameFor(catalogName)}
                        key={catalogName}
                      >
                        <a onClick={this.selectRepo.bind(this, catalogName)}>
                          {catalogName}
                        </a>
                      </li>
                    );
                  }
                )}
              </ul>
            </div>

            <div className='apps'>
              {this.apps(this.props.catalogs.items, this.filter()).map(app => {
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
              })}
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
