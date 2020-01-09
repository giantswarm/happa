// This file is a edited version of
// https://github.com/airbrake/airbrake-js/blob/master/packages/browser/src/http_req/fetch.ts

// Airbrake doesn't expose a easy interface for setting custom headers for each
// request. We need to set headers for authentication against our API.
import fetch from 'cross-fetch';
import { StatusCodes } from 'shared/constants';

export class Requester {
  constructor(store) {
    this.store = store;
  }

  request = req => {
    if (!this.store.getState().app.loggedInUser) {
      const err = new Error(
        `user is not logged in yet, unable to report error to GS API`
      );
      throw err;
    }

    const scheme = this.store.getState().app.loggedInUser.auth.scheme;
    const token = this.store.getState().app.loggedInUser.auth.token;
    const authHeader = `${scheme} ${token}`;

    const opt = {
      method: req.method,
      body: req.body,
      headers: {
        Authorization: authHeader,
      },
    };

    return fetch(req.url, opt).then(resp => {
      if (resp.status === StatusCodes.Created) {
        return { json: null };
      }

      return resp.text().then(body => {
        const err = new Error(
          `airbrake: fetch: unexpected response: code=${resp.status} body='${body}'`
        );
        throw err;
      });
    });
  };
}
