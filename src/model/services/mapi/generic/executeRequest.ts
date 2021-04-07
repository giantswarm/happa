import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';

import { ensureClientAuth } from './ensureClientAuth';

export async function executeRequest<T>(
  client: IHttpClient,
  auth: IOAuth2Provider
): Promise<T> {
  await ensureClientAuth(client, auth);

  const response = await client.execute<T>();

  return response.data;
}
