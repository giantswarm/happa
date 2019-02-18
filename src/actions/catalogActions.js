'use strict';

import * as types from './actionTypes';
import catalogsMockResponse from '../components/app_catalog/mockResponse.js';

// catalogsLoad
// -----------------
// Placeholder that will eventually perform an API call that fetches all the
// catalogs that the API knows about.
//
// For now it simulates the request delay and dispatches the expected actions.
//
export function catalogsLoad() {
  return function(dispatch) {
    let mockLoadingTime = 1000;
    dispatch({ type: types.CATALOGS_LOAD });

    return new Promise(resolve => {
      setTimeout(() => {
        dispatch({
          type: types.CATALOGS_LOAD_SUCCESS,
          catalogs: catalogsMockResponse,
        });

        resolve();
      }, mockLoadingTime);
    });
  };
}
