import GiantSwarm from 'giantswarm';

const user = {
  email: 'developer@giantswarm.io',
  auth: {
    scheme: 'Bearer',
    token: 'a-valid-token',
  },
  isAdmin: true,
};

export const removeUserFromStorage = () => localStorage.removeItem('user');

export const fetchSelectedOrganizationFromStorage = () => {
  return localStorage.getItem('app.selectedOrganization');
};

export const fetchUserFromStorage = () => user;

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
