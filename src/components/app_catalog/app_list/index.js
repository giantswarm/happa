import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { replace } from 'connected-react-router';
import DocumentTitle from 'react-document-title';
import lunr from 'lunr';
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

    var appsArray = Object.values(props.catalog.apps).map(
      appVersions => appVersions[0]
    );

    this.index = lunr(function() {
      this.ref('name');
      this.field('name');
      this.field('description');
      this.field('keywords');

      appsArray.forEach(function(app) {
        this.add(app);
      }, this);
    });

    this.state = {
      filters: [],
      searchQuery: q || '',
      iconErrors: {},
    };
  }

  componentDidMount() {
    // The hash value of the url is used by the app detail screen's back button
    // to indicate what app we should scroll to.
    var scrollToApp = this.props.location.hash.substring(1);
    if (scrollToApp && scrollToApp !== '') {
      window.scrollTo(0, this.appRefs[scrollToApp].offsetTop - 150);
    }
  }

  // filter returns a filter object based on the current state
  filter() {
    return {
      filters: this.state.filters,
      searchQuery: this.state.searchQuery,
    };
  }

  // filterApps is a function that takes a filter and a list of all apps and returns
  // a filtered set of apps
  filterApps(allApps, filter) {
    // Lunr search
    var lunrResults = this.index
      .search(filter.searchQuery.trim() + ' ' + filter.searchQuery.trim() + '*')
      .map(x => x.ref);

    // Search query filter.
    if (filter.searchQuery === '') {
      return Object.values(allApps);
    } else {
      var result = lunrResults.map(appName => {
        return allApps[appName];
      });

      return result;
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
        <DocumentTitle title={'Apps | Giant Swarm '}>
          <React.Fragment>
            <Link to={'/apps/'}>
              <i aria-hidden='true' className='fa fa-chevron-left' />
              Back to all catalogs
            </Link>
            <br />
            <br />
            <h1>
              {this.props.catalog.spec.title}
              <form>
                <div className='input-with-icon'>
                  <i className='fa fa-search' />
                  <input
                    onChange={this.updateSearchQuery}
                    type='text'
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
                        {apps.map(appVersions => {
                          return (
                            <div
                              className='app-container'
                              key={
                                appVersions[0].repoName +
                                '/' +
                                appVersions[0].name
                              }
                              ref={ref =>
                                (this.appRefs[appVersions[0].name] = ref)
                              }
                            >
                              <Link
                                className='app'
                                to={
                                  '/apps/' +
                                  this.props.catalog.metadata.name +
                                  '/' +
                                  appVersions[0].name +
                                  '?q=' +
                                  this.state.searchQuery
                                }
                              >
                                {appVersions[0].repoName === 'managed' ? (
                                  <div className='badge'>MANAGED</div>
                                ) : (
                                  undefined
                                )}

                                <div className='app-icon'>
                                  {appVersions[0].icon &&
                                  !this.state.iconErrors[
                                    appVersions[0].icon
                                  ] ? (
                                    <img
                                      onError={this.imgError}
                                      src={appVersions[0].icon}
                                    />
                                  ) : (
                                    <h3>{appVersions[0].name}</h3>
                                  )}
                                </div>
                                <div className='app-details'>
                                  <h3>{appVersions[0].name}</h3>
                                  <span className='app-version'>
                                    {appVersions[0].version}
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
