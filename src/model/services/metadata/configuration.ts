import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';

import { GenericResponse } from '../../clients/GenericResponse';
import { MetadataPaths } from './types';

/**
 * Get the application metadata configuration.
 */
export function getConfiguration(
  httpClient: IHttpClient
): Promise<GenericResponse> {
  httpClient.setRequestMethod(HttpRequestMethods.GET);
  httpClient.setURL(MetadataPaths.Configuration);

  return httpClient.execute();
}
