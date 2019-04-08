'use strict';

import * as types from './actionTypes';
import yaml from 'js-yaml';

let mockLoadingTime = 1000;

let catalogsToLoad = {
  managed: {
    name: 'managed',
    title: 'Managed',
    description:
      'These charts are covered by an SLA. You install the app and we make sure it keeps running.',
    url:
      'https://raw.githubusercontent.com/giantswarm/app-catalog/master/index.yaml',
    logoUrl: '/images/repo_icons/managed.png',
    mockResponse: true,
    apps: {
      prometheus: [
        {
          name: 'Prometheus',
          appVersion: '1.0.0',
          version: '1.0.0',
          icon:
            'https://raw.githubusercontent.com/prometheus/prometheus.github.io/master/assets/prometheus_logo-cb55bb5c346.png',
          screenshotUrls: ['', ''],
          description: '',
        },
      ],
    },
  },
  community: {
    name: 'community',
    title: 'Community',
    description:
      'The helm/stable repository contains a large number of charts. Giant Swarm offers no SLA on these apps/charts. Proceed with caution.',
    url:
      'https://cors-anywhere.herokuapp.com/https://kubernetes-charts.storage.googleapis.com/index.yaml',
    logoUrl: '/images/repo_icons/community.png',
    mockResponse: false,
    apps: {},
  },
};

// loadCatalog takes a catalog object and tries to load further data.
function loadCatalog(catalog) {
  // This mockResponse feature lets me hardcode some apps into our catalog
  // while also fetching real apps from other catalogs.
  if (catalog.mockResponse) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(catalog);
      }, mockLoadingTime);
    });
  } else {
    return fetch(catalog.url, { mode: 'cors' })
      .then(response => {
        return response.text();
      })
      .then(body => {
        let rawCatalog = yaml.safeLoad(body);
        catalog.apps = rawCatalog.entries;
        return catalog;
      });
  }
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

    let loadCatalogPromises = [];

    for (var id in catalogsToLoad) {
      if (catalogsToLoad.hasOwnProperty(id)) {
        loadCatalogPromises.push(loadCatalog(catalogsToLoad[id]));
      }
    }

    return Promise.all(loadCatalogPromises).then(loadedCatalogs => {
      let catalogs = {};

      loadedCatalogs.forEach(catalog => {
        catalogs[catalog.name] = catalog;
      });

      dispatch({
        type: types.CATALOGS_LOAD_SUCCESS,
        catalogs: catalogs,
      });
    });
  };
}
