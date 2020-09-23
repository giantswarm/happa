import GiantSwarm from 'giantswarm';
import { AuthorizationTypes } from 'shared/constants';

export function removeUserFromStorage() {
  localStorage.removeItem('user');
}

export function fetchSelectedOrganizationFromStorage() {
  return localStorage.getItem('app.selectedOrganization');
}

export function fetchUserFromStorage(): ILoggedInUser | null {
  let user: ILoggedInUser | null = null;
  try {
    user = JSON.parse(String(localStorage.getItem('user')));
  } catch {
    // Ignore error.
  }
  if (!user) return null;

  /**
   * User was logged in pre-jwt auth being available.
   * Migrate it.
   */
  if (user.authToken) {
    user.auth = {
      scheme: AuthorizationTypes.GS,
      token: user.authToken,
    };
  }

  return user;
}

export function setUserToStorage(userData: ILoggedInUser) {
  localStorage.setItem('user', JSON.stringify(userData));

  const defaultClient = GiantSwarm.ApiClient.instance;
  const defaultClientAuth =
    defaultClient.authentications.AuthorizationHeaderToken;
  defaultClientAuth.apiKey = userData.auth.token;
  defaultClientAuth.apiKeyPrefix = userData.auth.scheme;
}

export const setOrganizationToStorage = (organizationId: string | null) => {
  localStorage.setItem(
    'app.selectedOrganization',
    organizationId ?? String(organizationId)
  );
};
