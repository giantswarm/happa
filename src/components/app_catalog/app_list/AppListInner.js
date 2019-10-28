import { replace } from 'connected-react-router';
import _ from 'lodash';
import AppListItems from './AppListItems';
import AppListSearch from './AppListSearch';
import PropTypes from 'prop-types';
import React from 'react';

class AppListInner extends React.Component {
  state = {
    searchQuery: '',
    iconErrors: {},
  };

  // Contains refs to all the app-container divs in dom so that we can
  // scroll to them if needed.
  appRefs = {};

  static getDerivedStateFromProps(nextProps, prevState) {
    const searchParams = new URLSearchParams(nextProps.location.search);
    const currentSearchQuery = searchParams.get('q') || '';

    if (prevState.searchQuery === null) {
      return {
        searchQuery: currentSearchQuery,
      };
    }

    return null;
  }

  componentDidMount() {
    // The hash value of the url is used by the app detail screen's back button
    // to indicate what app we should scroll to.
    const scrollToApp = this.props.location.hash.substring(1);

    if (scrollToApp) {
      window.scrollTo(0, this.appRefs[scrollToApp].offsetTop - 150);
    }
  }

  // filter returns a filter object based on the current state
  getFilter() {
    return {
      searchQuery: this.state.searchQuery,
    };
  }

  getAppsWithOrderedVersions = _.memoize(allApps => {
    const apps = Object.values(allApps);

    apps.map(appVersions => {
      return appVersions.sort((a, b) => {
        return new Date(b.created) - new Date(a.created);
      });
    });

    return apps;
  });

  sortVersionsByCreationDateDESC(versions) {
    return versions.sort((a, b) => {
      return new Date(b.created) - new Date(a.created);
    });
  }

  filterApps(searchQuery, allApps) {
    const fieldsToCheck = ['name', 'description', 'keywords'];
    const trimmedSearchQuery = searchQuery.trim().toLowerCase();

    let filteredApps = [];

    if (trimmedSearchQuery === '') return allApps;

    filteredApps = allApps.filter(app => {
      // Go through all the app versions
      return app.some(appVersions => {
        // Check if any of the checked fields include the search query
        return fieldsToCheck.some(field => {
          const appVersionsField = (appVersions[field] || '').toLowerCase();

          return (
            appVersionsField && appVersionsField.includes(trimmedSearchQuery)
          );
        });
      });
    });

    return filteredApps;
  }

  updateSearchQuery = e => {
    this.setState(
      {
        searchQuery: e.target.value,
      },
      () => {
        const urlParams = new URLSearchParams({
          q: this.state.searchQuery,
        });
        const destination = `?${urlParams}`;

        this.props.dispatch(
          replace({
            search: destination,
          })
        );
      }
    );
  };

  resetFilters = () => {
    this.setState({
      searchQuery: '',
    });
  };

  onImgError = e => {
    const imageUrl = e.target.src;

    this.setState(prevState => {
      const iconErrors = Object.assign({}, prevState.iconErrors, {
        [imageUrl]: true,
      });

      return {
        iconErrors,
      };
    });
  };

  registerRef = (name, ref) => {
    this.appRefs[name] = ref;
  };

  render() {
    const { searchQuery } = this.state;
    const { catalog } = this.props;

    const appsWithOrderedVersions = this.getAppsWithOrderedVersions(
      catalog.apps
    );
    const apps = this.filterApps(searchQuery, appsWithOrderedVersions);

    return (
      <>
        <h1>
          {catalog.spec.title}
          <AppListSearch
            value={searchQuery}
            onChange={this.updateSearchQuery}
            onReset={this.resetFilters}
          />
        </h1>
        <div className='app-catalog-overview'>
          <div className='apps'>
            <AppListItems
              apps={apps}
              catalog={catalog}
              searchQuery={searchQuery}
              iconErrors={this.state.iconErrors}
              onImgError={this.onImgError}
              registerRef={this.registerRef}
            />
          </div>
        </div>
      </>
    );
  }
}

AppListInner.propTypes = {
  catalog: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  loading: PropTypes.bool,
  match: PropTypes.object,
};

export default AppListInner;
