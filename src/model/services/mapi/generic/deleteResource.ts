import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as metav1 from 'model/services/mapi/metav1';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { executeRequest } from './executeRequest';

export function deleteResource(
  client: IHttpClient,
  auth: IOAuth2Provider,
  url: string
) {
  client.setRequestConfig({
    url,
    method: HttpRequestMethods.DELETE,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return executeRequest<metav1.IK8sStatus>(client, auth);
}
