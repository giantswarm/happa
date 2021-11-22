import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { executeRequest } from './executeRequest';

export function updateResource<
  T, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  U extends Record<string, any> = Record<string, any>
>(client: IHttpClient, auth: IOAuth2Provider, url: string, data: U) {
  client.setRequestConfig({
    url: url.toString(),
    method: HttpRequestMethods.PUT,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });

  return executeRequest<T>(client, auth);
}
