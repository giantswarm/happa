import GiantSwarm from 'giantswarm';
import yaml from 'js-yaml';
import { StatusCodes } from 'shared/constants';

import * as types from './actionTypes';

// loadCatalog takes a catalog object and tries to load further data.
function loadCatalogIndex(catalog) {
  return fetch(`${catalog.spec.storage.URL}index.yaml`, { mode: 'cors' })
    .catch(() => {
      // eslint-disable-next-line no-console
      console.error(
        `Fetch error for ${catalog.spec.storage.URL}, attempting with cors anywhere.`
      );

      return fetch(
        `https://cors-anywhere.herokuapp.com/${catalog.spec.storage.URL}index.yaml`,
        { mode: 'cors' }
      );
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error('Fetch error: ', error);
      throw error;
    })
    .then(response => {
      // eslint-disable-next-line no-magic-numbers
      if (response.status === StatusCodes.Ok) {
        return response.text();
      }

      throw new Error(
        `Could not fetch index.yaml at ${catalog.spec.storage.URL}`
      );
    })
    .then(body => {
      const rawCatalog = yaml.safeLoad(body);
      const catalogWithApps = Object.assign({}, catalog, {
        apps: rawCatalog.entries,
      });

      return catalogWithApps;
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error('YAML error: ', error);

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
  return function(dispatch) {
    dispatch({ type: types.CATALOGS_LOAD });

    const appsApi = new GiantSwarm.AppsApi();

    return appsApi
      .getAppCatalogs()
      .then(catalogs => {
        /**
         * Since `catalogs` comes back as an iterable object,
         * we're converting it to an array
         */
        const catalogsDict = Array.from(catalogs).reduce((agg, currCatalog) => {
          const { labels } = currCatalog.metadata;

          if (
            labels &&
            labels['application.giantswarm.io/catalog-type'] !== 'internal'
          ) {
            currCatalog.isFetchingIndex = true;
            agg[currCatalog.metadata.name] = currCatalog;
          }

          return agg;
        }, {});

        dispatch({
          type: types.CATALOGS_LOAD_SUCCESS,
          catalogs: catalogsDict,
        });

        return catalogsDict;
      })
      .catch(error => {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
