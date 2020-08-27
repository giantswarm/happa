import FetchAdapter from 'model/clients/FetchAdapter';
import { IHttpClient } from 'model/clients/HttpClient';

type Configuration = import('giantswarm-cp-client').Configuration;

/**
 * Get the base configuration for the Control Plane API requests.
 * @param client - The HTTP client to use.
 */
export async function getBaseConfiguration(
  client: IHttpClient
): Promise<Configuration> {
  const { Configuration } = await import('giantswarm-cp-client');
  const fetchAdapter = new FetchAdapter(client);

  const configBuilder = new Configuration({
    basePath: client.getRequestConfig().baseURL,
    fetchApi: fetchAdapter.fetch.bind(fetchAdapter),
  });

  return configBuilder;
}
