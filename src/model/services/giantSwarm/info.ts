import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import { GiantSwarmPaths } from 'model/services/giantSwarm/types';

/**
 * Get the info of an installation.
 * @param httpClient - The client used to make the request.
 */
export function getInstallationInfo(httpClient: IHttpClient) {
  httpClient.setRequestMethod(HttpRequestMethods.GET);
  httpClient.setURL(GiantSwarmPaths.Info);

  return httpClient.execute();
}
