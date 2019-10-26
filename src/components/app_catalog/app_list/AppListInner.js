import { replace } from 'connected-react-router';
import AppListItems from './AppListItems';
import AppListSearch from './AppListSearch';
import lunr from 'lunr';
import PropTypes from 'prop-types';
import React from 'react';

class AppListInner extends React.Component {
  state = {
    filters: [],
    searchQuery: null,
    iconErrors: {},
  };

  // Contains refs to all the app-container divs in dom so that we can
  // scroll to them if needed.
  appRefs = {};

  componentDidMount() {
    // The hash value of the url is used by the app detail screen's back button
    // to indicate what app we should scroll to.
    const scrollToApp = this.props.location.hash.substring(1);

    if (scrollToApp) {
      window.scrollTo(0, this.appRefs[scrollToApp].offsetTop - 150);
    }
  }

  searchQuery = () => {
    const searchParams = new URLSearchParams(this.props.location.search);
    return searchParams.get('q') || '';
  };

  updateSearchQuery = e => {
    const urlParams = new URLSearchParams({
      q: this.searchQuery(),
    });
    // const destination = `?${urlParams}`;

    // this.props.dispatch(
    //   replace({
    //     search: destination,
    //   })
    // );
  };

  // filter returns a filter object based on the current state
  getFilter() {
    return {
      filters: this.state.filters,
      searchQuery: this.searchQuery(),
    };
  }

  // filterApps is a function that takes a filter and a list of all apps and returns
  // a filtered set of apps
  filterApps(allApps, filter) {
    let filteredApps = [];
    const searchQuery = filter.searchQuery.trim();

    // can't use arrow functions with lunr ...
    const component = this;

    // Lunr
    this.index = lunr(function() {
      this.ref('name');
      this.field('name');
      this.field('description');
      this.field('keywords');

      const apps = Object.values(component.props.catalog.apps).map(
        appVersions => {
          return appVersions.sort((a, b) => {
            return new Date(b.created) - new Date(a.created);
          })[0];
        }
      );

      for (const app of apps) {
        this.add(app);
      }
    });

    // Lunr search
    const lunrResults = this.index
      .search(`${searchQuery} ${searchQuery}*`)
      .map(x => x.ref);

    // Search query filter.
    if (filter.searchQuery === '') {
      filteredApps = Object.values(allApps);
    } else {
      filteredApps = lunrResults.map(appName => allApps[appName]);
    }

    return filteredApps;
  }

  resetFilters = () => {
    this.setState({
      filters: [],
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
    const { catalog } = this.props;
    const apps = this.filterApps(catalog.apps, this.getFilter());

    return (
      <>
        <h1>
          {catalog.spec.title}
          <AppListSearch
            value={this.searchQuery()}
            onChange={this.updateSearchQuery}
            onReset={this.resetFilters}
          />
        </h1>
        <div className='app-catalog-overview'>
          <div className='apps'>
            <AppListItems
              apps={apps}
              catalog={catalog}
              searchQuery={this.searchQuery()}
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
