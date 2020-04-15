import { HttpRequestMethods } from 'model/clients';
import { SelfClient } from 'model/clients/SelfClient';

import { GenericResponse } from '../../clients/GenericResponse';
import { MetadataPaths } from './';

/**
 * Get the application metadata configuration
 */
export function getConfiguration(
  httpClient: SelfClient
): Promise<GenericResponse> {
  httpClient.setRequestMethod(HttpRequestMethods.GET);
  httpClient.setURL(MetadataPaths.Configuration);

  return httpClient.execute();
}
