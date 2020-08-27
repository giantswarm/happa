import { HttpRequestMethods } from 'model/clients/HttpClient';

import { paths } from '.';

/**
 * Get the info of an installation
 * @param {HttpClient} httpClient - The client used to make the request
 */
export function getInstallationInfo(httpClient) {
  httpClient.setRequestMethod(HttpRequestMethods.GET);
  httpClient.setURL(paths.Info);

  return httpClient.execute();
}
