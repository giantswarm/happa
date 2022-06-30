import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { executeRequest } from './executeRequest';

export function patchResource<
  T, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  U extends Record<string, any> = Record<string, any>
>(client: IHttpClient, auth: IOAuth2Provider, url: string, data: U) {
  client.setRequestConfig({
    url: url.toString(),
    method: HttpRequestMethods.PATCH,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/merge-patch+json',
    },
    data,
  });

  return executeRequest<T>(client, auth);
}
