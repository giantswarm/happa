import GiantSwarm from 'giantswarm';
import yaml from 'js-yaml';
import { StatusCodes } from 'shared/constants';

import * as types from './actionTypes';

// loadCatalog takes a catalog object and tries to load further data.
async function loadCatalogIndex(catalog) {
  let indexURL = `${catalog.spec.storage.URL}index.yaml`;

  if (indexURL.includes('kubernetes-charts.storage.googleapis.com')) {
    indexURL = `/catalogs?url=${indexURL}`;
  }

  const response = await fetch(indexURL, { mode: 'cors' });

  if (response.status !== StatusCodes.Ok) {
    throw new Error(`Could not fetch ${indexURL}. Status ${response.status}`);
  }

  const responseText = await response.text();

  const rawCatalog = yaml.safeLoad(responseText);
  const catalogWithApps = Object.assign({}, catalog, {
    apps: rawCatalog.entries,
  });

  return catalogWithApps;
}

// catalogsLoad
// -----------------
// Perform API calls that fetches all the catalogs that we want to fetch.
// Waits for all calls to finish and then dispatches the CATALOGS_LOAD_SUCCESS
// with catalogs and apps in the right places.
//
export function catalogsLoad() {
  return function (dispatch) {
    dispatch({ type: types.CATALOGS_LOAD_REQUEST });

    const appsApi = new GiantSwarm.AppsApi();

    return appsApi
      .getAppCatalogs()
      .then((catalogs) => {
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
      .catch((error) => {
        dispatch({
          type: types.CATALOGS_LOAD_ERROR,
          error: error,
        });

        throw error;
      });
  };
}

export function catalogLoadIndex(catalog) {
  return function (dispatch, getState) {
    if (getState().entities.catalogs.items[catalog.metadata.name].apps) {
      // Skip if we already have apps loaded.
      return Promise.resolve();
    }

    if (
      getState().entities.catalogs.items[catalog.metadata.name].isFetchingIndex
    ) {
      // Skip if we are already fetching it.
      return Promise.resolve();
    }

    dispatch({
      type: types.CATALOG_LOAD_INDEX_REQUEST,
      catalogName: catalog.metadata.name,
      id: catalog.metadata.name,
    });

    return loadCatalogIndex(catalog)
      .then((loadedCatalog) => {
        dispatch({
          type: types.CATALOG_LOAD_INDEX_SUCCESS,
          catalog: loadedCatalog,
          id: catalog.metadata.name,
        });
      })

      .catch((error) => {
        dispatch({
          type: types.CATALOG_LOAD_INDEX_ERROR,
          error: error,
          catalogName: catalog.metadata.name,
          id: catalog.metadata.name,
        });
      });
  };
}
