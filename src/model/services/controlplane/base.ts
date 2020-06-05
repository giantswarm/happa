import { Configuration } from 'giantswarm-cp-client';
import { HttpClient } from 'model/clients';
import FetchAdapter from 'model/clients/FetchAdapter';

/**
 * Get the base configuration for the Control Plane API requests.
 * @param client - The HTTP client to use.
 */
export function getBaseConfiguration(client: HttpClient): Configuration {
  const fetchAdapter = new FetchAdapter(client);

  const configBuilder = new Configuration({
    basePath: client.requestConfig.baseURL,
    fetchApi: fetchAdapter.fetch.bind(fetchAdapter),
  });

  return configBuilder;
}
