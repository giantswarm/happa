import * as types from './actionTypes';
import GiantSwarmV4 from 'giantswarm-v4';
import yaml from 'js-yaml';

// loadCatalog takes a catalog object and tries to load further data.
function loadCatalogIndex(catalog) {
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

    var appsApi = new GiantSwarmV4.AppsApi();

    return appsApi
      .getAppCatalogs(scheme + ' ' + token)
      .then(catalogs => {
        let catalogsDict = {};

        // Swagger generated API client returns weird array objects.
        // This "Array.from" ensures I have a normal array with map and forEach on it.
        catalogs = Array.from(catalogs);

        catalogs.forEach(catalog => {
          catalogsDict[catalog.metadata.name] = catalog;
        });

        dispatch({
          type: types.CATALOGS_LOAD_SUCCESS,
          catalogs: catalogsDict,
        });

        return catalogsDict;
      })
      .catch(error => {
        console.error(error);
        dispatch({
          type: types.CATALOGS_LOAD_ERROR,
          error: error,
        });
        throw error;
      });
  };
}

export function catalogLoadIndex(catalog) {
  return function(dispatch) {
    dispatch({
      type: types.CATALOG_LOAD_INDEX,
      catalogName: catalog.metadata.name,
    });

    return loadCatalogIndex(catalog)
      .then(loadedCatalog => {
        dispatch({
          type: types.CATALOG_LOAD_INDEX_SUCCESS,
          catalog: loadedCatalog,
        });
      })

      .catch(error => {
        console.error(error);
        dispatch({
          type: types.CATALOG_LOAD_INDEX_ERROR,
          error: error,
          catalogName: catalog.metadata.name,
        });
        throw error;
      });
  };
}
