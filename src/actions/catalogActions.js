'use strict';

import * as types from './actionTypes';

// catalogsLoad
// -----------------
// Placeholder that will eventually perform an API call that fetches all the
// catalogs that the API knows about.
//
// For now it simulates the request delay and dispatches the expected actions.
//
export function catalogsLoad() {
  return function(dispatch, getState) {
    dispatch({ type: types.CATALOGS_LOAD });

    setTimeout(() => {
      dispatch({
        type: types.CATALOGS_LOAD_SUCCESS,
        catalogs: catalogsMockResponse,
      });
    }, 2000);
  };
}

let catalogsMockResponse = {
  'sample-catalog': {
    id: 'sample-catalog',
    apps: {
      prometheus: {
        name: 'Prometheus',
        logoUrl: '',
        version: '1.0.0',
        descriptionMarkdown: '',
      },
    },
  },
  'other-catalog': {
    id: 'other-catalog',
    apps: {
      companyApp: {
        name: 'Company App',
        logoUrl: '',
        version: '1.0.0',
        descriptionMarkdown: '',
      },
    },
  },
};
