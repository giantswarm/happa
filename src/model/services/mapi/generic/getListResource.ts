import { GenericResponseError } from 'model/clients/GenericResponseError';
import { IHttpClient } from 'model/clients/HttpClient';
import { StatusCodes } from 'model/constants';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IList } from '../metav1';
import { getResource } from './getResource';

const MAX_ATTEMPT_COUNT = 5;
const MAX_RETRY_DELAY = 5000; // 5 seconds
const SECOND = 1000; // 1 second

function tryGetListResource<T extends IList<{}>>(
  client: IHttpClient,
  auth: IOAuth2Provider,
  url: string,
  attempt = 1
): Promise<T> {
  return getResource<T>(client, auth, url).then((data) => {
    if (data.items === undefined) {
      ErrorReporter.getInstance().notify(
        `Invalid Response. Items are missing in the getListResource response.`,
        { url, attempt }
      );

      if (attempt === MAX_ATTEMPT_COUNT) {
        const requestTimeoutError = new GenericResponseError();
        requestTimeoutError.status = StatusCodes.Timeout;
        requestTimeoutError.requestConfig = client.getRequestConfig();
        requestTimeoutError.message =
          'getListResource request took too long to complete.';

        throw requestTimeoutError;
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          const list = tryGetListResource<T>(client, auth, url, attempt + 1);
          resolve(list);
        }, Math.min(attempt * SECOND, MAX_RETRY_DELAY));
      });
    }

    return data;
  });
}

export function getListResource<T extends IList<{}>>(
  client: IHttpClient,
  auth: IOAuth2Provider,
  url: string
) {
  return tryGetListResource<T>(client, auth, url);
}
