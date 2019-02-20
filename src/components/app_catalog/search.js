'use strict';

import { catalogsLoad } from '../../actions/catalogActions';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import React from 'react';

class CatalogIndex extends React.Component {
  fetching = {};

  constructor(props) {
    super();

    let query = new URLSearchParams(props.location.search);
    let q = query.get('q');
    let selectedRepo = query.get('repo');

    this.state = {
      loading: true,
      selectedRepo: selectedRepo || 'All',
      searchQuery: q || '',
      imgPromises: {},
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
      push({
        search:
          '?' +
          new URLSearchParams({
            repo: repo,
            q: this.state.searchQuery,
          }).toString(),
      })
    );
  }

  componentDidMount() {
    this.props.dispatch(catalogsLoad()).then(() => {
      this.setState({
        loading: false,
      });
    });
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
        let apps = Array.from(Object.values(catalogs[id].apps));
        apps = apps.map(app => {
          app.repoName = id;
          app.name = app[0].name;
          app.version = app[0].version;
          app.icon = app[0].icon;
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

  // iconSrcFor checks the icon src for a app to make sure it exists and sets a
  // placeholder if it doesn't. While it is fetching it returns a loading spinner.
  // It makes sure to check only once per app.
  iconSrcFor(app) {
    let url = app.icon;
    if (!this.fetching[app.name]) {
      testImage(url).then(
        imgElement => {
          this.setState(state => {
            let imgPromises = {};
            imgPromises[app.name] = <img src={imgElement.src} />;
            return {
              imgPromises: Object.assign({}, imgPromises, state.imgPromises),
            };
          });
        },

        () => {
          this.setState(state => {
            let imgPromises = {};
            imgPromises[app.name] = <h3>{app.name}</h3>;
            return {
              imgPromises: Object.assign({}, imgPromises, state.imgPromises),
            };
          });
        }
      );
    }

    this.fetching[app.name] = true;

    return <img className='loader' src='/images/loader_oval_light.svg' />;
  }

  updateSearchQuery(e) {
    this.setState({
      searchQuery: e.target.value,
    });

    this.props.dispatch(
      push({
        search:
          '?' +
          new URLSearchParams({
            repo: this.state.selectedRepo,
            q: e.target.value,
          }).toString(),
      })
    );
  }

  render() {
    return (
      <DocumentTitle title={'App Katalog | Giant Swarm '}>
        <React.Fragment>
          <Loading loading={this.state.loading}>
            <h1>
              App Katalog
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
                {this.apps(this.props.catalogs.items, this.filter()).map(
                  app => {
                    return (
                      <div className='app' key={app.repoName + '/' + app.name}>
                        {app.repoName === 'giantswarm/stable' ? (
                          <div className='badge'>MANAGED</div>
                        ) : (
                          undefined
                        )}

                        <div className='app-icon'>
                          {this.state.imgPromises[app.name] ||
                            this.iconSrcFor(app)}
                        </div>
                        <div className='app-details'>
                          <span className='app-version'>{app.version}</span>
                          <h3>{app.name}</h3>
                          <span className='app-repo'>{app.repoName}</span>
                        </div>
                      </div>
                    );
                  }
                )}
                <div className='app-flex-fix' />
                <div className='app-flex-fix' />
                <div className='app-flex-fix' />
                <div className='app-flex-fix' />
              </div>
            </div>
          </Loading>
        </React.Fragment>
      </DocumentTitle>
    );
  }
}

function Loading(props) {
  if (props.loading) {
    return <img className='loader' src='/images/loader_oval_light.svg' />;
  } else {
    return props.children;
  }
}

function testImage(url) {
  // Define the promise
  const imgPromise = new Promise(function imgPromise(resolve, reject) {
    if (url === undefined) {
      reject();
    } else {
      // Create the image
      const imgElement = new Image();

      // When image is loaded, resolve the promise
      imgElement.addEventListener('load', function imgOnLoad() {
        resolve(this);
      });

      // When there's an error during load, reject the promise
      imgElement.addEventListener('error', function imgOnError() {
        reject(this);
      });

      // Assign URL
      imgElement.src = url;
    }
  });

  return imgPromise;
}

CatalogIndex.propTypes = {
  catalogs: PropTypes.object,
  clusterId: PropTypes.string,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  organizationId: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    catalogs: state.entities.catalogs,
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
)(CatalogIndex);
