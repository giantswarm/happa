import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';

import { executeRequest } from './executeRequest';

export async function getResource<T>(
  client: IHttpClient,
  auth: IOAuth2Provider,
  url: string
) {
  client.setRequestConfig({
    url: url.toString(),
    method: HttpRequestMethods.GET,
    headers: {
      Accept: 'application/json',
    },
  });

  return executeRequest<T>(client, auth);
}
