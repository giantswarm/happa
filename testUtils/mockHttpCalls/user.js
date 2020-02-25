import { USER_EMAIL } from './constantsAndHelpers';

export const userResponse = {
  email: USER_EMAIL,
  created: '2019-09-19T12:40:16.2231629Z',
  expiry: new Date(Date.now() + 31556952000).toISOString(), // eslint-disable-line no-magic-numbers
};

export const usersResponse = [
  userResponse,
  {
    email: 'developer4@giantswarm.io',
    created: '2019-09-19T12:40:16.2231629Z',
    expiry: '2019-09-20T12:40:16.2231629Z',
  },
  {
    email: 'developer2@giantswarm.io',
    created: '2019-09-19T12:40:16.2231629Z',
    expiry: '2019-09-20T12:40:16.2231629Z',
  },
];
