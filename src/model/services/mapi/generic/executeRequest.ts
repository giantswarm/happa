import { IHttpClient } from 'model/clients/HttpClient';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { ensureClientAuth } from './ensureClientAuth';

export async function executeRequest<T>(
  client: IHttpClient,
  auth: IOAuth2Provider
): Promise<T> {
  await ensureClientAuth(client, auth);

  const response = await client.execute<T>();

  return response.data;
}
