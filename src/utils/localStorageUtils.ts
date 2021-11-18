import ErrorReporter from 'lib/errors/ErrorReporter';
import { AuthorizationTypes } from 'shared/constants';
import { LoggedInUserTypes } from 'stores/main/types';

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
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);
  }
  if (!user) return null;

  if (!user.type) {
    // Migrate users from the pre-MAPI era.
    user.type = LoggedInUserTypes.GS;
  }

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
}

export const setOrganizationToStorage = (organizationId: string | null) => {
  localStorage.setItem(
    'app.selectedOrganization',
    organizationId ?? String(organizationId)
  );
};
