/**
 * Airbrake doesn't expose a easy interface for setting custom headers for each
 * request. We need to set headers for authentication against our API.
 * @source https://github.com/airbrake/airbrake-js/blob/master/packages/browser/src/http_req/fetch.ts
 */
import {
  IHttpRequest,
  IHttpResponse,
} from '@airbrake/browser/dist/http_req/api';
import fetch from 'cross-fetch';
import { Store } from 'redux';
import { StatusCodes } from 'shared/constants';
import { getLoggedInUser } from 'stores/main/selectors';

export class Requester {
  constructor(store: Store) {
    this.store = store;
  }

  request = async (req: IHttpRequest): Promise<IHttpResponse> => {
    const user = getLoggedInUser(this.store.getState());
    if (!user) {
      const err = new Error(
        `user is not logged in yet, unable to report error to GS API`
      );

      return Promise.reject(err);
    }

    const scheme = user.auth.scheme;
    const token = user.auth.token;
    const authHeader = `${scheme} ${token}`;

    const opt: RequestInit = {
      method: req.method,
      body: req.body,
      headers: {
        Authorization: authHeader,
      },
    };

    const response = await fetch(req.url, opt);
    if (response.status === StatusCodes.Created) {
      return { json: null };
    }
    const body = await response.text();
    const err = new Error(
      `airbrake: fetch: unexpected response: code=${response.status} body='${body}'`
    );

    return Promise.reject(err);
  };

  private readonly store: Store;
}
