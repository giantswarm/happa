import { IHttpClient } from 'model/clients/HttpClient';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import { IOAuth2User } from 'utils/OAuth2/OAuth2User';

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

  const impersonationMetadata = await auth.getImpersonationMetadata();
  if (impersonationMetadata) {
    client.setHeader('Impersonate-User', impersonationMetadata.user);

    if (
      impersonationMetadata.groups &&
      impersonationMetadata.groups.length > 0
    ) {
      client.setHeader('Impersonate-Group', impersonationMetadata.groups[0]);
    }
  }

  return Promise.resolve(client);
}

function isUserExpired(user: IOAuth2User): boolean {
  // eslint-disable-next-line no-magic-numbers
  return Date.now() / 1000 > user.expiresAt;
}
