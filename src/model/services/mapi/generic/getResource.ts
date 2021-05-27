import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';

import { executeRequest } from './executeRequest';

export function getResource<T>(
  client: IHttpClient,
  auth: IOAuth2Provider,
  url: string
) {
  client.setRequestConfig({
    url,
    method: HttpRequestMethods.GET,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return executeRequest<T>(client, auth);
}
