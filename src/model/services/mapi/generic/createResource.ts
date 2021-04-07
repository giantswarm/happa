import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';

import { executeRequest } from './executeRequest';

export function createResource<T>(
  client: IHttpClient,
  auth: IOAuth2Provider,
  url: string,
  data: Record<string, unknown>
) {
  client.setRequestConfig({
    url: url.toString(),
    method: HttpRequestMethods.POST,
    headers: {
      Accept: 'application/json',
    },
    data,
  });

  return executeRequest<T>(client, auth);
}
