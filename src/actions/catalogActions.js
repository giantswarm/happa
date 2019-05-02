import * as types from './actionTypes';
import GiantSwarmV4 from 'giantswarm-v4';
import yaml from 'js-yaml';

// loadCatalog takes a catalog object and tries to load further data.
function loadCatalog(catalog) {
  return fetch(catalog.spec.storage.URL + 'index.yaml', { mode: 'cors' })
    .then(response => {
      return response.text();
    })
    .then(body => {
      let rawCatalog = yaml.safeLoad(body);
      catalog.apps = rawCatalog.entries;
      return catalog;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

// catalogsLoad
// -----------------
// Perform API calls that fetches all the catalogs that we want to fetch.
// Waits for all calls to finish and then dispatches the CATALOGS_LOAD_SUCCESS
// with catalogs and apps in the right places.
//
export function catalogsLoad() {
  return function(dispatch, getState) {
    dispatch({ type: types.CATALOGS_LOAD });

    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    var managedAppsApi = new GiantSwarmV4.ManagedAppsApi();

    return managedAppsApi.getAppCatalogs(scheme + ' ' + token).then(catalogs => {
      let loadCatalogPromises = [];

      var l = catalogs.length;
      for (var i = 0; i < l; i++) {
        loadCatalogPromises.push(loadCatalog(catalogs[i]));
      }

      return Promise.all(loadCatalogPromises)
        .then(loadedCatalogs => {
          let catalogs = {};

          loadedCatalogs.forEach(catalog => {
            catalogs[catalog.metadata.name] = catalog;
          });

          dispatch({
            type: types.CATALOGS_LOAD_SUCCESS,
            catalogs: catalogs,
          });
        })
        .catch(error => {
          console.error(error);
          throw error;
        });
    });
  };
}
