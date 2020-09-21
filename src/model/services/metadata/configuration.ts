import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';

import { GenericResponse } from '../../clients/GenericResponse';
import { IMetadataConfiguration, MetadataPaths } from './types';

/**
 * Get the application metadata configuration.
 */
export function getConfiguration(
  httpClient: IHttpClient
): Promise<GenericResponse<IMetadataConfiguration>> {
  httpClient.setRequestMethod(HttpRequestMethods.GET);
  httpClient.setURL(MetadataPaths.Configuration);

  return httpClient.execute();
}
