import { replace } from 'connected-react-router';
import PropTypes from 'prop-types';
import React from 'react';
import { memoize } from 'underscore';

import AppListItems from './AppListItems';
import AppListSearch from './AppListSearch';

const SEARCH_URL_PARAM = 'q';

class AppListInner extends React.Component {
  static filterApps(searchQuery, allApps) {
    const fieldsToCheck = ['name', 'description', 'keywords'];
    const trimmedSearchQuery = searchQuery.trim().toLowerCase();

    let filteredApps = [];

    if (trimmedSearchQuery === '') return allApps;

    filteredApps = allApps.filter(app => {
      // Go through all the app versions
      return app.some(appVersions => {
        // Check if any of the checked fields include the search query
        return fieldsToCheck.some(field => {
          const appVersionsField = appVersions[field]
            ? String(appVersions[field])
            : '';
          const appVersionsFieldValue = appVersionsField.toLowerCase();

          return appVersionsFieldValue.includes(trimmedSearchQuery);
        });
      });
    });

    return filteredApps;
  }

  static getSearchQueryFromLocation(location) {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get(SEARCH_URL_PARAM);

    return searchQuery || '';
  }

  iconErrors = {};

  state = {
    scrollToApp: null,
  };

  componentDidMount() {
    // The hash value of the url is used by the app detail screen's back button
    // to indicate what app we should scroll to.
    const scrollToApp = this.props.location.hash.substring(1);

    if (scrollToApp) {
      this.setState({ scrollToApp });
    }
  }

  getAppsWithOrderedVersions = memoize(allApps => {
    const apps = Object.values(allApps);

    apps.map(this.sortVersionsByCreationDateDESC);

    return apps;
  });

  sortVersionsByCreationDateDESC = versions => {
    return versions.concat().sort((a, b) => {
      return new Date(b.created) - new Date(a.created);
    });
  };

  setSearchQuery(query) {
    this.props.dispatch(
      replace({
        search: query,
      })
    );
  }

  updateSearchParams = e => {
    const searchQuery = e.target.value;
    const urlParams = new URLSearchParams({
      [SEARCH_URL_PARAM]: searchQuery,
    });
    const destination = `?${urlParams}`;

    this.setSearchQuery(destination);
  };

  resetFilters = () => {
    this.setSearchQuery('');
  };

  onImgError = e => {
    const imageUrl = e.target.src;

    this.iconErrors[imageUrl] = true;
  };

  render() {
    const { catalog } = this.props;

    const searchQuery = AppListInner.getSearchQueryFromLocation(
      this.props.location
    );

    const allApps = this.getAppsWithOrderedVersions(catalog.apps);
    const filteredApps = AppListInner.filterApps(searchQuery, allApps);

    return (
      <>
        <h1>
          {catalog.spec.title}
          <AppListSearch
            value={searchQuery}
            onChange={this.updateSearchParams}
            onReset={this.resetFilters}
          />
        </h1>
        <div className='app-catalog-overview'>
          <AppListItems
            apps={filteredApps}
            catalog={catalog}
            searchQuery={searchQuery}
            iconErrors={this.iconErrors}
            onImgError={this.onImgError}
            scrollToApp={this.state.scrollToApp}
          />
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
