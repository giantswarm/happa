import { HttpRequestMethods } from 'model/clients/HttpClient';

import { paths } from '.';

export function getInstallationInfo(httpClient) {
  httpClient.setRequestMethod(HttpRequestMethods.GET);
  httpClient.setURL(paths.Info);

  return httpClient.execute();
}
