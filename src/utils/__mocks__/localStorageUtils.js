import GiantSwarm from 'giantswarm';

export const removeUserFromStorage = () => localStorage.removeItem('user');

export const fetchSelectedOrganizationFromStorage = () => 'acme';

export const fetchUserFromStorage = () => {
  return {
    email: 'oriol@giantswarm.io',
    auth: {
      scheme: 'Bearer',
      token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9VUTBNakExTlRFM01EQkVNalUxTUVNNU1UazFRelk1UWtJM1FUQTVSamhFTURjNE9EaEZRUSJ9.eyJodHRwczovL2dpYW50c3dhcm0uaW8vZ3JvdXBzIjoiYXBpLWFkbWluIiwiaHR0cHM6Ly9naWFudHN3YXJtLmlvL2VtYWlsIjoib3Jpb2xAZ2lhbnRzd2FybS5pbyIsImlzcyI6Imh0dHBzOi8vZ2lhbnRzd2FybS5ldS5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDA2MzExODEzMTU0NTA1MzY0NTEiLCJhdWQiOlsiaHR0cDovL2xvY2FsaG9zdDo4MDAwIiwiaHR0cHM6Ly9naWFudHN3YXJtLmV1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE1Njc2OTk4NDUsImV4cCI6MTU2NzY5OTkwNSwiYXpwIjoibWdZZHhDR0NaMmVhbzBPSlVHT0ZYdXJHSWFRQUFDSHMiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIn0.NFjA4vy_MHpvoZuvXNWy-yKBi_YUrwa7vVwVfJfl8D-xwnowa-uOM2zfoDlhQ4u4NaTiVlAx8E5LKVeRASCeAjLh_ncAGOLcMI0BL1tKg3WMZhc4mueNLZX0I61D-mqgqMgyzDLhOm5aGPXkJMjZg-Oz9fkR2VtGiTdt3ztAt5OqqyHMbM3AGDHCWm-HHM1xnzwyPKQfCQjgMJPxYyv0GqWoPFBK5O3r5jOe29H17cVsKf6tvsrxKwBWJe1U6YvAmmWmSicQhpPQ7DuavLsOWtjCbF-eV327UZPeAF-QydztyFzQsab_h6HT0M99NDgEE_HUI6IV1fDiExmAbfahGQ',
    },
    isAdmin: true,
  };
};

export const setUserToStorage = userData => {
  // localStorage.setItem('user', JSON.stringify(userData));
  var defaultClient = GiantSwarm.ApiClient.instance;
  var defaultClientAuth =
    defaultClient.authentications['AuthorizationHeaderToken'];
  defaultClientAuth.apiKey = userData.auth.token;
  defaultClientAuth.apiKeyPrefix = userData.auth.scheme;
  return userData;
};

// export const setOrganizationToStorage = organizationId => {
//   localStorage.setItem('app.selectedOrganization', organizationId);
// };
