import { USER_EMAIL } from './constantsAndHelpers';

// eslint-disable-next-line no-magic-numbers
const oneYearFromNow = new Date(Date.now() + 31556952000).toISOString();

export const userResponse = {
  email: USER_EMAIL,
  created: '2019-09-19T12:40:16.2231629Z',
  expiry: oneYearFromNow,
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
  {
    email: 'expires-in-a-year@giantswarm.io',
    created: '2019-09-19T12:40:16.2231629Z',
    expiry: oneYearFromNow,
  },
];
