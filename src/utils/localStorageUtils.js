import GiantSwarm from 'giantswarm';

export const removeUserFromStorage = () => localStorage.removeItem('user');

export const fetchSelectedOrganizationFromStorage = () => {
  return localStorage.getItem('app.selectedOrganization');
};

export const fetchUserFromStorage = () => {
  let user;

  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    user = {
      auth: {},
    };
  }

  // User was logged in pre-jwt auth being available.
  // Migrate.
  if (user && user.authToken) {
    user.auth = {
      scheme: 'giantswarm',
      token: user.authToken,
    };
  }

  return user;
};

export const setUserToStorage = userData => {
  localStorage.setItem('user', JSON.stringify(userData));
  var defaultClient = GiantSwarm.ApiClient.instance;
  var defaultClientAuth =
    defaultClient.authentications['AuthorizationHeaderToken'];
  defaultClientAuth.apiKey = userData.auth.token;
  defaultClientAuth.apiKeyPrefix = userData.auth.scheme;
};

export const setOrganizationToStorage = organizationId => {
  localStorage.setItem('app.selectedOrganization', organizationId);
};
