import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import { IHttpClient } from 'model/clients/HttpClient';

/**
 * Make sure that the user is authenticated,
 * their token is not expired, and that the given
 * HTTP client uses the authentication token.
 * @param client
 * @param auth
 */
export async function ensureClientAuth(
  client: IHttpClient,
  auth: IOAuth2Provider
): Promise<IHttpClient> {
  const user = await auth.getLoggedInUser();
  if (!user) {
    return Promise.reject(new Error('You must be logged in.'));
  } else if (isUserExpired(user)) {
    return Promise.reject(
      new Error('Your token is invalid. Please log in again.')
    );
  }

  client.setAuthorizationToken(user.authorizationType, user.idToken);

  return Promise.resolve(client);
}

function isUserExpired(user: IOAuth2User): boolean {
  // eslint-disable-next-line no-magic-numbers
  return Date.now() / 1000 > user.expiresAt;
}
